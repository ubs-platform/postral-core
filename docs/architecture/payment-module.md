# Payment Module

## Ownership

- `apps/payment` contains the Nest application and runtime configuration, including the database connection, scheduler, and microservice client.
- `libs/payment-core-webservice` contains the payment, item, report, invoice, refund, and other payment-domain controllers, services, mappers, guards, utilities, and the `PaymentCoreWebserviceModule`.
- `libs/postral-entities` owns TypeORM entities. Add a new entity to both the `PaymentsEntities` array and the named exports in its entity index.
- `libs/payment-common` owns payment DTOs and status types.
- `PaymentCoreWebserviceModule.register(clientProvider)` imports the configured microservice client and registers its domain controllers/providers. The application supplies the client provider and owns root-level database and scheduler setup.

## Payment Channels

A channel handles these message patterns, using its channel ID in each path:

- `postral/payment-channel/{channelId}/init`
- `postral/payment-channel/{channelId}/fire`
- `postral/payment-channel/{channelId}/cancel`
- `postral/payment-channel/{channelId}/check`

The handlers return `PaymentChannelStatusDTO` with the operation identifiers, redirect URL, operation status, optional failure status, provider fee, and instant-fee flag. `EventSenderService` dispatches lifecycle calls to these patterns. `PaymentChannelOperation` stores the provider operation record, while a channel-specific entity stores provider state.

Use `NonProductionGuard` for development-only endpoints. Administrative mutations use `JwtAuthGuard`, `RolesGuard`, and the `admin` or `postral-admin` roles.

## Persistence and Numeric Fields

Use the entity helpers in `libs/postral-entities/src/entity/base.ts`: `MoneyDbField` stores `decimal(19,4)` using the Big.js transformer; `BigintDbField` guards safe integer conversion. Follow the established mapper and service patterns for CRUD behavior.

## Experimental External Sales

`POST /payment/external-platform` records an already-settled external sale; it
does not initiate payment-channel collection. `ExternalPlatformPaymentService`
requires JWT authentication, write access to every seller account, active
commercial sellers with default addresses, and an active external platform.
Customer accounts are real `isExternal` records without seller ownership;
billing addresses are also resolved/created without seller ownership.
Normal account CRUD authorization is unchanged.

The platform row is locked while resolving customer/address records and saving
the purchase in one transaction. Repeated platform/order references return 409.
The shared completion flow produces seller orders, account transactions, reports
and events after commit. A completion failure returns an explicit error with the
saved payment ID, requiring administrator reconciliation rather than resubmission.
The seller frontend labels this feature as under construction.
External refunds are explicitly rejected before request creation or channel
operations; payment and seller-order details explain that refunds must be
processed on the external platform. Normal Postral refunds are unchanged.

Focused tests (Node 24.9+ is needed for Nest 12 ESM dependencies in the current
Jest runner; the payment build supplies type validation):

```bash
npm run build -- payment
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand \
  --runTestsByPath \
  libs/payment-core-webservice/src/service/external-platform-payment.service.spec.ts \
  libs/payment-core-webservice/src/service/external-customer-resolution.spec.ts \
  libs/payment-core-webservice/src/service/external-platform-refund.spec.ts \
  --transform='{"^.+\\.(t|j)s$":["ts-jest",{"tsconfig":{"isolatedModules":true}}]}'
```

## Seller report charts

`GET /report/seller-series` requires JWT and read access to an active, non-external
commercial account. Filters are `accountId`, `currency`, `dateGrouping`
(`DAILY`, `MONTHLY`, `YEARLY`), `reportSize`, optional `queryId`, and optional
`skipUnavailableReports` (`true`/`false`, default `false`). When enabled, missing
periods are omitted within the selected calendar range; the range is not extended
to find older reports. Existing zero-amount reports remain included. Shared
`SELLER_REPORT_SIZES` defines allowed calendar-period counts, including the
current incomplete period. Calendar labels use the same server-local rules as
digestion; deployments must keep that timezone consistent.

Only existing, non-archived `SELLER` reports of the exact grouping, query, and
currency are returned. No daily-to-monthly aggregation, currency conversion,
or report creation/backfill occurs. Multiple matching query sources are returned
for explicit selection; no source is silently chosen. Missing periods have
`report: null`, not zero amounts. Pending and failed digestion flags describe
relations belonging to the returned reports, not payments not yet queued.
The endpoint is registered before the parameterized report-detail route.

## Platform sales and ID-less report items

Full report detail includes `platforms: ReportPlatformDTO[]`. Digestion maintains
`report_platform` rows for SELLER and PLATFORM_FLOW reports only. SELLER rows use
only that seller's items; PLATFORM_FLOW rows aggregate all sellers. Each report
already fixes the currency and period, so no cross-currency aggregation occurs.
`platformKey` is the external platform's `code`, or the shared `POSTRAL_INSTANCE`
constant for native Postral payments. External IDs and names are captured on the
row. Missing external platforms, empty codes, the reserved `POSTRAL_INSTANCE`
external code, and conflicting sources are errors, never native-payment fallbacks.
External platform codes should remain stable once used for reporting.

`purchaseCount` counts purchase payments with at least one matching item, not item
rows or quantities. Refund payments increment `refundCount` without decrementing
purchase counts. `soldQuantity` and `refundedQuantity` preserve four-decimal
quantities. Sale/refund amounts include tax; `netSaleAmount` subtracts refunds and
`netRevenue` additionally subtracts net tax, **before** commissions and other
expenses. Existing report/expense/commission formulas are unchanged. PLATFORM
and PLATFORM_SELLER remain Postral commission-income reports and skip external
payments, including provider-fee processing.

Report items with a nonblank catalog `itemId` retain their existing keys.
Otherwise, identity uses the trimmed, whitespace-collapsed, lowercase payment
item name and the existing variation; null/missing fallback variations equal the
empty string. A SHA-256 digest of this tuple bounds the key and avoids delimiter
collisions. This is separate from the display name, and the `:no-id:` key namespace
cannot collide with catalog-ID keys. `identifiedByName` exposes the fallback to
clients, which display `(no id)`. Matching names intentionally merge within the
same report/account/variation even if they came from different external sources.
The unique constraint is now `(reportId, accountId, reportItemKey)`, not the
nullable/empty catalog ID. Items without either an ID or a name are rejected.

### Rollout and historical reports

The app's schema synchronization adds `report_platform`, the `identifiedByName`
column and the report-item unique constraint. Installations with synchronization
disabled must apply these changes before starting the new backend. Back up and
check existing report-item keys for duplicates within each report/account before
adding the unique constraint; reconcile duplicates rather than dropping data.
Do not run old and new digestion workers concurrently during rollout.
Patch shared libraries into the frontend after building the backend contracts.

Existing aggregate rows cannot recover products previously merged under an empty
ID. Reconstruct affected reports from their payment relations using the existing
report action. Reconstruction archives the old report and fills a new report;
it does not rewrite archived aggregates. Platform breakdowns similarly include
only newly digested payments until reconstruction; old reports must not be
presented as having a complete historical platform breakdown.

Focused tests (same Node/Jest requirements as external sales):

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand \
  --runTestsByPath \
  libs/postral-entities/src/entity/report-item.entity.spec.ts \
  libs/payment-core-webservice/src/service/report-sales-breakdown.service.spec.ts \
  libs/payment-core-webservice/src/mapper/report-platform-mapper.spec.ts \
  --transform='{"^.+\\.(t|j)s$":["ts-jest",{"tsconfig":{"isolatedModules":true}}]}'
```

## Deferred Work

- [External-platform payment snapshot-only customer plan](./external-platform-payment-snapshot-plan.md):
  proposed removal of real external customer account/address creation, including
  persistence, completion, refund policy, and consumer compatibility work. Not yet
  implemented.
