# iyzico: Paid-After-Cancel Reversal Plan

Status: Planned; not implemented.
Recorded: 2026-10-27.

This document records a future change. It does not describe existing behavior.
Reconfirm the referenced contracts and code before implementation.

## Problem

The iyzico adapter's `cancel` cancels an unpaid Checkout Form only **locally**
([integration-iyzico.service.ts](../../apps/integration-iyzico/src/integration-iyzico.service.ts)).
iyzico documents no way to invalidate an open form token, so the buyer can still
pay on an already-open iyzico page until the token expires. When that successful
callback arrives, the adapter:

- keeps the operation `FAILED` and does not complete it,
- sets `IyzicoOperation.cancellationState = 'PAID_AFTER_CANCEL'`,
- logs an error. Nothing else happens: Postral is not notified in a way that changes state,
  and the charge stays on the buyer's card.

The Postral payment is already terminal (`FAILED`, `errorStatus: CANCELLED`). The
money must be returned to the buyer without granting the purchase.

## Constraints in the current code

- **The normal Postral refund flow cannot be reused as-is.**
  `startRefundPaymentOperationsForRefundRequest` in
  [payment-operation-management.service.ts](../../libs/payment-core-webservice/src/service/payment-operation-management.service.ts)
  requires a `COMPLETED` purchase and `COMPLETED` purchase channel operations. In
  this case the payment is `FAILED` and its channel operation is `FAILED`.
- **Do not reopen the payment as `COMPLETED` to reach the refund flow.** That
  would emit `postral/payment-completed` (fulfillment, e.g. Lotus licensing),
  create report digestion/sale records and invoices for a sale that never
  happened, then a refund on top.
- **The adapter does not store provider IDs for this case yet.**
  `flagPaymentAfterCancellation` only reads `paymentStatus`; it does not persist
  `providerPaymentId` or `itemTransactions` (`paymentTransactionId` per line), which
  iyzico cancel/refund APIs need. It also does not verify amount/currency/basket the
  way `check` does.
- **iyzico refunds are not implemented** in the adapter (`init` with
  `type: REFUND` is rejected).

## Proposed design

Keep the reversal **inside the iyzico adapter**: from Postral's point of view the
sale never happened, so there is no Postral sale or refund to record. Postral
only provides an authenticated trigger and visibility.

### 1. Adapter: record the late payment properly

In `flagPaymentAfterCancellation`, apply the same verification as `check`
(signature, correlation, basket, currency, amount, item transactions), then store
`providerPaymentId`, `itemTransactions` and `providerFee` together with
`PAID_AFTER_CANCEL`. Keep `status: FAILED`.

### 2. Adapter: reversal operation

Add a message pattern, e.g. `postral/payment-channel/iyzico/reverse-paid-after-cancel`
(adapter operation ID → result), protected by `HttpToRpcExceptionFilter` like
the other handlers:

- Allowed only when `cancellationState === 'PAID_AFTER_CANCEL'`.
- Try iyzico **cancel** (`/payment/cancel`, uses `paymentId`; same-day void). If iyzico
  rejects it because the payment can no longer be cancelled, use **refund** per item
  `paymentTransactionId` for the full `paidPrice`.
- Reserve before calling the provider, like `initialize`: add states such as
  `REVERSING` → `REVERSED` / `REVERSAL_RECONCILIATION_REQUIRED`. Never repeat
  an ambiguous provider call automatically (timeouts/transport errors).
- Use a deterministic `conversationId` (e.g. operation ID + `:reverse`) for
  correlation, and verify response signatures.
- Store the provider reversal ID(s) and timestamp.

### 3. Postral: trigger and visibility

In [payment.controller.ts](../../libs/payment-core-webservice/src/controller/payment.controller.ts)
or an admin controller, add an authenticated, admin-only endpoint, e.g.
`POST /payment/:id/operation/reverse-paid-after-cancel`:

- Requires a `FAILED`/`CANCELLED` payment whose channel operation is from a channel that
  supports reversal.
- Sends the new message via `EventSenderService` and converts RPC errors with
  `toHttpException`, as `init` and `cancel` already do.
- Does **not** change payment status, reports, invoices or fulfillment.
- Optionally records an audit entry (who triggered it, provider result).

A list endpoint for operations needing attention (`PAID_AFTER_CANCEL`,
`REVERSAL_RECONCILIATION_REQUIRED`) can come from the adapter via another
message pattern, so admins do not have to search logs.

### 4. Automatic vs manual

Start with the manual admin trigger. Automatic reversal on callback is possible
later, but it is a money movement and should only follow sandbox verification
of the cancel/refund responses.

## Tests to add

- Late success stores verified provider IDs; mismatched late results are not stored.
- Reversal is rejected unless `PAID_AFTER_CANCEL`; repeated calls are idempotent.
- Cancel success, cancel-rejected → refund fallback, and ambiguous failure →
  `REVERSAL_RECONCILIATION_REQUIRED` without retry.
- Postral endpoint: authorization, wrong payment state, RPC error mapping, and no
  payment/report/fulfillment side effects.

## Open questions

- The exact iyzico error code that means "cannot be cancelled, refund instead";
  confirm in sandbox before relying on it.
- Should the buyer/merchant be notified (e-mail) when a reversal happens?
- Should other channels implement the same reversal contract, making it a
  generic Postral channel capability instead of iyzico-specific?
