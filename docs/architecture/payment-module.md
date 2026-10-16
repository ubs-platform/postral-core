# Payment Module

## Ownership

- `apps/payment` contains the Nest application, controllers, services, mappers, guards, and payment utilities.
- `libs/postral-entities` owns TypeORM entities. Add a new entity to both the `PaymentsEntities` array and the named exports in its entity index.
- `libs/payment-common` owns payment DTOs and status types.
- `PaymentModule` imports the entity module, registers controllers and providers, and configures the microservice client.

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
  apps/payment/src/service/external-platform-payment.service.spec.ts \
  apps/payment/src/service/external-customer-resolution.spec.ts \
  apps/payment/src/service/external-platform-refund.spec.ts \
  --transform='{"^.+\\.(t|j)s$":["ts-jest",{"tsconfig":{"isolatedModules":true}}]}'
```

## Seller report charts

`GET /report/seller-series` requires JWT and read access to an active, non-external
commercial account. Filters are `accountId`, `currency`, `dateGrouping`
(`DAILY`, `MONTHLY`, `YEARLY`), `reportSize`, and optional `queryId`. Shared
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

## Deferred Work

- [External-platform payment snapshot-only customer plan](./external-platform-payment-snapshot-plan.md):
  proposed removal of real external customer account/address creation, including
  persistence, completion, refund policy, and consumer compatibility work. Not yet
  implemented.
