# iyzico Refund Integration Plan

Status: Implemented for the sandbox successful path; provider sandbox acceptance pending.
Recorded: 2026-10-29.
Revised: 2026-10-29 following refund precision and UI scope decisions.

This document records the approved design and implementation scope. The adapter
remains sandbox-only. Automated tests/builds cover the implementation; live
provider acceptance, production enablement and recovery UI are not implied.

## Goal and first-increment scope

Support full and item/quantity-based partial refunds of completed Postral
purchases captured by the iyzico Checkout Form adapter. Reuse user/seller refund
requests and the internal automatic system-refund command, including Lotus
fulfillment-failure refunds.

Recommended initial scope follows the existing adapter: one full-amount iyzico
capture, no split-channel captures, installments, marketplace routing or external
platform refunds. Multiple seller requests can refund their own original lines;
this does not introduce iyzico marketplace seller settlement.

Cancelled checkouts subsequently paid are a separate reversal flow. Do not mark
their failed purchases completed to make them eligible for normal refunds. See
the [paid-after-cancel plan](./iyzico-paid-after-cancel-reversal-plan.md).
The platform-admin attention/reversal area is deferred. This increment targets
the successful refund path; seller recovery/manual-confirmation buttons and an
admin recovery UI are also deferred. Durable reservations and explicit failure
states remain required so an unsuccessful attempt cannot cause a double refund.

## Baseline before implementation

- [RefundService](../../libs/payment-core-webservice/src/service/refund.service.ts)
  already validates completed purchases, ownership, quantities and single-seller
  requests. It supports seller approval and idempotent internal system refunds,
  reserves pending quantities and serializes approvals with a persisted lease.
- [PaymentService.createRefundPayment](../../libs/payment-core-webservice/src/service/payment.service.ts)
  creates/resumes a separate `REFUND` payment using historical amounts, taxes and
  commissions rather than current catalog prices.
- [PaymentOperationManagementService](../../libs/payment-core-webservice/src/service/payment-operation-management.service.ts)
  reserves `PaymentChannelOperation` rows with `operationType: REFUND` before
  network calls. It sends `init` with `originalPaymentChannelOperationId`,
  stable `refundOperationId` and channel-local `captureInfo.paidAmount`.
- The existing [channel operation entity](../../libs/postral-entities/src/entity/payment-channel-operation.entity.ts)
  already has `originalOperationId`. No second generic payment-operation model
  or parallel refund HTTP API is needed.
- The [iyzico adapter](../../apps/integration-iyzico/src/integration-iyzico.service.ts)
  only initializes purchases. Its [checkout mapper](../../apps/integration-iyzico/src/iyzico-checkout.mapper.ts)
  explicitly rejects refunds.
- [IyzicoOperation](../../apps/integration-iyzico/src/iyzico-operation.entity.ts)
  already stores the verified provider payment ID and original
  `paymentItemId -> paymentTransactionId / price / paidPrice` mapping.

### Contract gap: original refund line identity

The channel initialization currently receives refund-payment items, not the
original refund request's line mapping. Refund items get new persistence IDs:
[PaymentItemMapper.toEntity](../../libs/payment-core-webservice/src/mapper/payment-item.mapper.ts)
does not copy the original item's ID. Catalog IDs and variations are not a safe
replacement because a purchase can contain repeated catalog items.

The implementation adds an optional server-populated `refundPlan` field to
[PaymentFullWithCaptureInfoDTO](../../libs/payment-common/src/dto/payment.dto.ts).
Its [RefundChannelPlan](../../libs/payment-common/src/dto/refund-channel-plan.dto.ts)
contains original operation IDs, opaque adapter metadata, accounting counterparty and
lines with `originalPaymentItemId`, `nominalAmount` and `providerAmount`. Amounts
are decimal strings, so persisted plans are exact across transport and retries.

For the supported single-capture iyzico case, populate it from persisted
`RefundRequestDTO.items[].paymentItemId/refundAmount`, not browser data or new
refund-payment item IDs. Amounts include tax. Their sum must equal this channel's
`captureInfo.paidAmount` at nominal precision. All refund-capable channels expose
the generic `prepare-refund` RPC; amount-only channels explicitly return empty plans.

Do not pass full-request amounts as channel-local amounts for split captures.
Reject that unsupported iyzico case explicitly; future split support requires
persisted item-to-capture allocation, not proportional guesses.

## Implementation sequence

### 1. Core contract and preflight

- Build and validate the original-line payload in the refund operation path.
  Check channel, source capture, purchase identity, currency, unique line IDs,
  positive amounts and exact totals.
- Retain Postral's four-decimal calculations and nominal refund payment/operation
  amounts. The adapter normalizes provider amounts using its environment policy below.
  Account for the difference separately; do not overwrite historical taxes,
  commissions or the nominal refund amount with the provider amount.
- Perform predictable eligibility/precision validation before creating the refund
  payment, seller/accounting records or channel reservations. A pending request
  can remain visible with an explicit approval error; do not approve it or change
  original-item counters on this failure.
- Recheck mutable balances when reserving provider lines. Preserve existing
  behavior for dummy and other channels and existing external-refund rejection.
- Keep using `init(type: REFUND)`; do not also call the legacy
  `paymentChannelRefund` / `{channel}/refund` path.

#### Environment-controlled provider precision

Configure `IYZICO_REFUND_ROUNDING_MODE` on integration-iyzico, not payment core,
with the following exact values.
Recommended default when absent: `THROW`, preserving explicit precision errors.
An unrecognized configured value must fail startup rather than silently default.
This setting affects refund provider amounts only, not purchase validation or
global Postral money calculations.

| Value | Meaning for positive refund amounts | 3.3333 | 3.3350 |
| --- | --- | --- | --- |
| `ROUND` | Round to nearest cent, half up | 3.33 | 3.34 |
| `FLOOR` | Round upward to the next cent | 3.34 | 3.34 |
| `USE_FIRST_TWO` | Truncate after two decimals without rounding | 3.33 | 3.33 |
| `THROW` | Reject if more than two significant decimal places are needed | error | error |

`FLOOR` intentionally follows the requested configuration name and upward
behavior; mathematically this is ceiling, not floor. Document this explicitly in
the environment example and tests. Already cent-exact amounts remain unchanged
for every mode. Use Big.js decimal arithmetic, not binary floating-point slicing.

Resolve the policy once for a new refund, before accounting/provider reservations,
and persist it with each original four-decimal amount, two-decimal provider
amount and signed difference:

```text
roundingAdjustment = providerAmount - nominalAmount
```

Line normalization is deterministic, and the provider parent total is the sum
of normalized line amounts (not an independently rounded nominal parent total).
Nominal line totals still equal `captureInfo.paidAmount`; provider totals are
tracked separately. Retries reuse persisted amounts and policy even if the env
changes. Keep one normalization implementation and pass the persisted result
through the core/adapter contract rather than independently rounding twice.

Postral's refund payment, historical calculations and nominal operation amount
stay at four-decimal precision. Persist a separate, signed, idempotent accounting
adjustment linked to the refund operation/line so cash movement reconciles to the
provider amount. Inspect the existing ledger/report model before choosing its
entry type and posting account; do not hide the difference in `providerFee` or
only store it as informational metadata. Post the adjustment exactly once for
verified successful lines, with balanced entries and report treatment. An
ambiguous or rejected provider result is not proof of settled cash movement.
Core completion must verify the provider amount plus the accounted difference,
not compare the provider amount directly with the unchanged nominal total.
For example, nominal 3.3333, provider 3.33 and adjustment -0.0033 must reconcile.

Validate provider balances using normalized amounts, including all earlier
successful/pending/ambiguous reservations for that original transaction.
Reject a normalized zero amount or an amount exceeding the provider's remaining
balance before submission. Never silently clamp, switch rounding modes or send a
zero-value provider refund. Repeated upward rounding can exhaust provider
capacity before the nominal quantity is exhausted; report that explicitly.
Handle this in tests, not by treating the final quantity as permission to
over-refund. Preserve nominal quantity reservations independently of provider
cash-capacity reservations.

### 2. Durable adapter refund records

Keep purchase rows unchanged. The implementation uses one adapter-owned
`IyzicoRefund` parent entity with JSON lines rather than separate line entities.
It is registered in both TypeORM module entity lists; the parent's compare-and-set
claim and the original capture lock protect all its line reservations:

- Parent: stable core `refundOperationId` (unique), refund payment ID, original
  adapter operation ID, nominal/provider amounts, currency, rounding policy,
  request fingerprint and aggregate state.
- Lines: parent ID, original payment-item ID, provider transaction ID, amount,
  deterministic conversation ID, execution state and validated provider references.
  Persist nominal amount, provider amount and signed rounding adjustment.
  Validate unique original line IDs per parent before insertion.
- Execution states distinguish `RESERVED`, `SUBMITTING`, `SUCCEEDED`,
  `REJECTED` and `RECONCILIATION_REQUIRED`. Aggregate status maps to existing
  `PaymentOperationStatus`; no new generic status is required.

In a short transaction, lock the original adapter operation, validate its
completed capture and stored mapping, calculate each line's remaining refundable
`paidPrice`, and reserve amounts. Pending and ambiguous submissions consume
capacity; only definitively non-executed/released lines can free it.
Do not hold database locks during provider calls.

Repeated stable IDs with identical details return the saved result; changed
source, line amounts or currency conflict. A changed environment setting alone
does not recalculate an existing reservation. Atomically claim each reserved line
before submission. Concurrent callers must never submit the same line twice.
Stale `SUBMITTING` records require reconciliation, not automatic resubmission.

### 3. iyzico client

Use the item-level `sdk.refund.create` (`POST /payment/refund`) with
`paymentTransactionId`, `price`, currency and stable conversation ID. Prefer this
over payment-level Refund V2 so the refunded seller/product lines are explicit.

Extend the [app-local SDK declaration](../../apps/integration-iyzico/src/iyzipay.d.ts)
and [IyzicoClientService](../../apps/integration-iyzico/src/iyzico-client.service.ts)
with typed request handling and unknown-response validation:

- Verify response HMAC using the documented parameter order:
  `paymentId, price, currency, conversationId`. Do not copy the local Refund V2
  sample's different parameter order.
- Match provider payment ID, transaction ID, conversation ID, amount and currency
  against the reserved line before marking success.
- Preserve structured provider error codes and distinguish a definitive rejection
  from timeout, transport failure, invalid response/signature or persistence failure
  after provider acceptance. The latter cases are ambiguous and block reissue.
- `conversationId` is correlation, not an iyzico idempotency guarantee. Do not
  automatically retry a financial call, even merely because `retryable` is true.
- Resolve whether to omit the optional provider request IP or supply a trusted
  server context during sandbox verification. Never invent a sample IP or require
  a browser IP for internal system refunds.
- Store only required references/error codes; do not persist or log raw payment,
  buyer, card or credential data.

### 4. Lifecycle, completion and recovery

- Branch `initialize` on payment type before invoking the purchase-only mapper.
  Purchase behavior remains unchanged. Refunds have no browser redirect.
- Return the persisted adapter refund identifier as `paymentChannelOperationId`;
  `check` and `fire` must recognize refund operations. `fire` only reports an
  already successful refund, never issues another financial call.
- Mark the aggregate `COMPLETED` only when every expected line has a verified,
  persisted success. One successful line followed by a timeout is not full success.
  Preserve successful lines and stop further submissions on ambiguity.
- Do not use purchase-checkout `cancel` for a refund or release an already
  submitted refund reservation.
- Complete Postral through the existing operation status-check/completion flow,
  preserving refund accounting, reports and events. Test the synchronous-success
  path and the existing periodic checker, not only provider-side success.
  Do not depend on a notification sent before the core stores its operation ID.
- Keep `RefundRequest.status: APPROVED` distinct from refund payment completion.
  Approval means initiation was accepted, not that the cardholder has received
  the funds. A definitive failure before acceptance leaves approval unsuccessful.
- Keep core and adapter reservations traceable by stable `refundOperationId`
  when init's response is lost, and document a provider-evidence-based manual
  investigation runbook. Do not create another refund or delete reservations.
  Admin reconciliation endpoints/UI and automated recovery are deferred.
  Do not assume original Checkout Form retrieval proves an individual refund
  succeeded.
- Recovery of a partially successful refund must preserve all successful lines.
  Do not make a mixed/ambiguous aggregate terminal `FAILED` if doing so would
  prevent reconciliation through Postral's terminal-payment guards.
- Verify actual refund fee semantics before populating `providerFee`; do not
  copy the original purchase fee, estimate it or assume it is reimbursed.

### 5. Frontend and documentation

Reuse the existing refund request/create/approve/reject screens and
`/service/payment/api/refund` client. The existing separate refund payment with
the seller-to-customer arrow is the tracking surface for both parties; do not
build a second execution-status UI. Preserve request approval semantics and use
the existing payment status to follow actual execution. Only add an authorized
link to that payment if the existing navigation lacks one.

A refund-specific seller confirmation/recovery button is a future option, not
part of this increment. It must not be introduced as a shortcut that marks
ambiguous provider calls successful or sends them again without reconciliation.
The platform-admin area for exceptional/paid-after-cancel operations is likewise
deferred. No browser access to the adapter database is introduced.

Update adapter/core READMEs and payment architecture notes after implementation,
without claiming paid-after-cancel reversal or production readiness. Provision
new adapter tables before deployment when synchronization is disabled.

After shared DTO changes, run from Postral:

```bash
npm run xr patch-libs ../lotus-web/node_modules
```

## Verification and acceptance

Focused automated tests:

1. Full refund, selected-line refund and successive quantity refunds; exact
   remaining balances, tax/commission history and final rounding remainder.
2. Repeated catalog/variation lines use original payment-item identity; missing,
   duplicate, foreign or mismatched mappings fail before provider calls.
3. Invalid source state/currency, split-capture case, excessive amount and
   non-cent amounts under `THROW` fail without financial side effects.
4. Duplicate/concurrent requests produce one provider submission per line.
   Changed details under the same stable ID conflict.
5. Signature/correlation mismatch, timeout, provider rejection and DB failure
   after provider success preserve the correct reservation/recovery state.
6. First line succeeds and second is ambiguous: no full completion, no resend
   of the successful/ambiguous line, and deterministic reconciliation.
7. Process crash before submission, during submission and after success;
   core init-response loss and notification/check ordering.
8. Seller authorization and automatic system refunds still work. Original-item
   counters change once; accounting/reports/events follow existing refund
   semantics. Purchase, dummy-channel and external-refund restrictions regressions.
9. All four rounding modes: cent-exact input, half-cent boundaries, tiny amounts
   becoming zero, upward-rounding capacity exhaustion, and multi-line totals.
   `FLOOR` means upward rounding. Invalid env values fail explicitly.
10. Nominal four-decimal amounts remain unchanged; provider cash and signed
    adjustments reconcile exactly. Replays/config changes do not recalculate
    reservations or double-post adjustments; partial success posts only the
    successful lines' adjustments.

Build `payment` and `integration-iyzico`; run focused adapter/client/controller,
refund-channel-operations, refund-payment and refund-service tests using the
repository's documented Node/Jest setup. Validate owning frontend targets if
refund status presentation changes.

Sandbox acceptance: complete a purchase, refund one selected line partially,
refund its remaining balance, refund other lines, replay requests, and verify
provider history plus Postral payment/accounting/report state. Include a Lotus
automatic fulfillment-failure refund and a simulated lost provider response.
Use disposable data; no real-money rollout is implied by passing these tests.

## Agreed scope and remaining provider checks

- Agreed: env-selectable `ROUND`, upward `FLOOR`, `USE_FIRST_TWO` and `THROW`;
  retain four-decimal nominal amounts and separately account for the difference.
- Agreed: use the existing seller-to-customer refund payment for tracking.
  Seller recovery buttons and a platform-admin exception area are deferred.
- Signed adjustments use the existing ledger and reporting model, not just
  informational metadata: customer/platform `AccountPaymentTransaction` pairs with
  `roundingOperationId`, plus signed platform/flow report expenses.
- Verify sandbox response signatures, refund success semantics, rejection codes,
  provider reconciliation evidence and fees.
- Keep paid-after-cancel reversal and production enablement separate.

## Implemented operational choices

- The adapter resolves the env policy and builds plans through `prepare-refund`.
  Core validates generic allocations, strips adapter-supplied accounting accounts,
  and assigns the platform counterparty. `RefundRequest.channelRefundPlan`
  persists an array transactionally with refund creation, before financial calls.
  Core copies opaque `channelData` without interpreting the saved rounding policy.
  The adapter reuses that snapshot on retries and accepts legacy top-level policy
  fields; existing single-plan request JSON remains readable.
- An active non-external COMMERCIAL `billingAccountId` distinct from the customer
  is required only when rounding changes an amount. The platform bears/gains the
  difference; seller nominal amounts are unchanged.
- Provider IP is omitted because it is optional; no placeholder or browser
  context is introduced for internal refunds.
- All provider lines are reserved before the first call. Unknown outcomes return
  a persisted pending operation with an error indication when possible.
  Definite initial provider rejection is failed; partial success is never failed
  as though no cash moved. Reservations are not automatically released.
- Generic operation `fire` only reports completion and does not issue a refund.
  Existing Postral polling completes the refund payment; no refund callback or
  browser redirect is required.
- Schema requirements and manual investigation guidance are maintained in the
  [adapter README](../../apps/integration-iyzico/README.md).

## References

- [iyzico refund/cancel API](https://docs.iyzico.com/en/advanced/refund-and-cancel)
- [iyzico response signature order](https://docs.iyzico.com/en/advanced/response-signature-validation)
- [Adapter setup and current limitations](../../apps/integration-iyzico/README.md)
- [Payment architecture](./payment-module.md)
