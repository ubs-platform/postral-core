# External Platform Payment: Snapshot-Only Customer Plan

Status: Deferred; not implemented.
Recorded: 2026-10-06.

This feature is not currently in active use. This document preserves the
implementation plan for a future change; it does not describe existing behavior.
Reconfirm the referenced contracts and code before implementation.

## Goal and Scope

Record external-platform sales without resolving, creating, or updating real
customer accounts and billing addresses. Capture the supplied customer and address
data directly as new payment snapshots.

Real seller accounts remain required for commissions, account transactions,
authorization, reporting, and webhooks. Normal Postral payments retain their
existing account/address behavior.

## Current Behavior and Blockers

[PaymentService.createExternalPlatformPayment](../../apps/payment/src/service/payment.service.ts)
currently:

1. Resolves or creates the customer account and billing address.
2. Updates the customer's default address.
3. Creates snapshots from those real records.
4. Saves a `COMPLETED` purchase and invokes the shared completion flow.

Resolving existing records can also cause the snapshot to reflect previously
stored customer/address data rather than the data supplied for this sale.

Removing the resolve/create calls alone is insufficient:

- [SnapshotAccount.realAccountId](../../libs/postral-entities/src/entity/snapshot-account.entity.ts)
  is required in persistence, although its DTO already marks it optional.
- [SellerPaymentOrder.sourceAccountId](../../libs/postral-entities/src/entity/seller-payment-order.entity.ts)
  and the corresponding DTO field are required.
- [PaymentDTO.customerAccountId](../../libs/payment-common/src/dto/payment.dto.ts)
  is required, although the Payment entity permits an absent customer account.
- [AccountPaymentTransactionService.fromPayment](../../apps/payment/src/service/account-payment-transaction.service.ts)
  always creates a customer account transaction.
- [PaymentMapper](../../apps/payment/src/mapper/payment.mapper.ts) currently reads
  the customer name from the real account; its short DTO omits snapshot IDs.
- [PaymentService.createRefundPayment](../../apps/payment/src/service/payment.service.ts)
  initializes refunds using the original real customer account.

## Implementation Steps

### 1. Define Snapshot-Oriented Inputs

Update [CreateExternalPlatformPaymentDTO](../../libs/payment-common/src/dto/external-platform-payment.dto.ts):

- Prefer dedicated creation inputs for customer identity/contact and billing
  address data, reusing the existing snapshot field definitions where practical.
- Preserve the `customerAccount` and `billingAddress` property names where possible
  to minimize payload churn.
- Do not map input IDs, `realAccountId`, ownership fields, default address IDs, or
  nested bank record IDs into new snapshots.
- Explicitly map allowed fields and validate required customer/address data.
- Create independent snapshots for every payment; do not deduplicate by customer
  identity or address.
- Decide whether external customer/address identifiers need to remain as
  provenance metadata. Do not use them to resolve real records.

### 2. Map Plaintext Inputs Safely

Use or extract shared mapping logic in
[InvoiceAccountMapper](../../apps/payment/src/mapper/invoice-account.mapper.ts) and
[InvoiceAddressMapper](../../apps/payment/src/mapper/invoice-address.mapper.ts).
Their legacy Invoice entity names are aliases for snapshot entities.

- Provide an explicit plaintext input path that constructs a new snapshot without
  attaching a real account or reusing a supplied snapshot ID.
- Preserve all supported identity, contact, tax, and address fields.
- Encrypt sensitive fields exactly once according to configuration and decrypt
  them correctly in output DTOs.
- Complete the directly related account contact-field round trip.
- Do not pass plaintext addresses to `toEntityFromAccountAddress`: that path
  currently copies fields as already encrypted.
- Preserve normal-payment entity/DTO mapping semantics; do not introduce an
  ambiguous plaintext-versus-encrypted conversion.

See [sensitive-field encryption](./sensitive-field-encryption.md).

### 3. Align Persistence and DTO Optionality

- Make `SnapshotAccount.realAccountId` nullable.
- Make `SellerPaymentOrder.sourceAccountId` and its real-account relation nullable.
- Align `PaymentDTO.customerAccountId`, `SellerPaymentOrderDTO.sourceAccountId`,
  and related mapper types with persistence.
- Leave external payments' `customerAccountId` and `billingAddressId` absent;
  those Payment fields are already nullable.
- Never store snapshot IDs in real account/address ID fields or invent placeholder
  accounts to satisfy constraints.
- Apply the schema changes with a migration, following repository conventions;
  preserve existing accounts, addresses, payments, and snapshot references.
- Do not delete historical external customer records as part of this change.

### 4. Refactor External Payment Creation

In [PaymentService](../../apps/payment/src/service/payment.service.ts):

- Remove customer/account address resolve/create and default-address mutation from
  the external-platform flow.
- Build `customerSnapshotAccount` and `customerSnapshotAddress` directly from the
  validated input and persist them through the existing cascade relations.
- Retain `applyItemSellerSnapshots` and real seller validation.
- Preserve external platform/order references, tax and commission calculations,
  `COMPLETED` status, and the absence of payment-channel operations.
- Keep endpoint authentication. Removing ownership creation does not imply
  removing caller authentication or seller authorization requirements.

### 5. Adapt Completion and Read Paths

- [TransactionMapper](../../apps/payment/src/mapper/transaction.mapper.ts):
  allow an absent customer account and propagate customer snapshot IDs into seller
  orders.
- [SellerPaymentOrderService](../../apps/payment/src/service/seller-payment-order.service.ts):
  handle absent source accounts explicitly in grouping and existing-order lookup.
  Do not rely on TypeORM's handling of `undefined` query values; use a stable order
  identity consistent with the existing payment/target-account uniqueness.
- [AccountPaymentTransactionService](../../apps/payment/src/service/account-payment-transaction.service.ts):
  proposed behavior is to retain seller transactions but omit the customer ledger
  entry when there is no real customer account. Confirm this accounting policy
  before implementation; missing accounts in normal flows must not silently pass.
- [PaymentMapper](../../apps/payment/src/mapper/payment.mapper.ts) and seller-order
  output: display customer identity from the snapshot when no real account exists.
  Ensure required snapshot relations are loaded for both short and full read paths,
  and include snapshot IDs in the short payment response.
- Preserve seller webhooks, completion events, reporting, commission workflows, and
  invoice snapshot references. Do not dispatch a customer webhook without a real
  account.
- Verify payment/order/invoice search and access control: external customers are
  not real account owners; sellers must retain access through their own accounts.

### 6. Resolve Refund Policy

Accountless external payments must not fall through the current real-account and
payment-channel refund initialization.

Before implementation, choose one:

- Add a dedicated snapshot-based external refund recording flow, defining how
  external settlement is confirmed and how original snapshots are reused.
- Explicitly reject unsupported external refunds with a clear domain error before
  creating refund records or triggering side effects.

Do not silently disable refunds or report success for an unsupported operation.
Normal payment refunds must continue to work unchanged.

### 7. Update Consumers and Documentation

- Check shared DTO exports and all callers affected by optional customer/source
  account IDs, including event consumers and UI identity displays.
- Rebuild changed `@tk-postral/*` libraries from this repository into the checked-out
  Lotus consumer using `npm run xr patch-libs ../lotus-web/node_modules`.
- Check consumer types/builds rather than redeclaring stale shared types locally.
- Update external-platform API documentation and
  [payment architecture](./payment-module.md) to describe implemented behavior,
  payload validation, accountless completion, and the selected refund policy.
- Remove obsolete resolve/create helpers only after checking remaining callers.
  Do not drop existing external-reference columns merely because this flow no
  longer uses them.

## Decisions to Confirm

1. Whether omitting the accountless customer's ledger entry is the desired
   accounting policy while retaining seller entries.
2. Whether external refunds will be supported in this change or explicitly rejected.
3. Whether external customer/address identifiers must be retained as provenance,
   independently of real account/address records.

## Validation and Acceptance Criteria

- External creation performs no real customer account/address writes, ownership
  creation, or default-address updates. Real seller reads remain expected.
- Two sales for the same external customer produce distinct snapshots containing
  their respective input data.
- Supplied IDs cannot overwrite snapshots or link a real customer account.
- Customer identity, contact, and address fields round-trip correctly with
  encryption enabled and disabled; no double encryption occurs.
- Accountless payments persist successfully and create valid seller orders for
  both one seller and multiple sellers sharing the customer snapshots.
- Reprocessing seller-order creation does not create duplicate orders.
- Seller account transactions, taxes, commissions, reports, invoices, completion
  events, and seller webhooks retain their intended results.
- No accountless customer ledger entry or customer webhook is generated under the
  proposed policy.
- Short/full payment and seller-order responses expose usable snapshot identity;
  seller searches and authorization still work.
- The chosen external refund behavior is tested, including failure paths before
  writes; normal payments, open payments, and refunds remain unchanged.
- Migration works against populated data without deleting historical records.
- Run focused mapper/service tests, a persistence integration test covering nullable
  references and cascade snapshots, and affected backend/shared-library/consumer
  type-check or build targets.

Only documentation was added when this plan was recorded; no implementation or
runtime validation has been performed.
