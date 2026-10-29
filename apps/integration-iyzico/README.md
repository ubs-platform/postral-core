# iyzico sandbox adapter

An independent Engine5 payment channel (`iyzico`), not a replacement for
`dummy-ecommerce`. Postral remains responsible for payment lifecycle, accounting
and fulfillment events. This first increment supports full-amount, single-charge
Checkout Form purchases with virtual, physical or mixed baskets. Currency comes
from the payment DTO; TRY/EUR/USD/GBP/NOK/CHF are accepted subject to the sandbox
merchant's capabilities. Unpaid checkouts can be cancelled locally (see `cancel`).
Full and item/quantity-based partial refunds are supported for those captures.
Marketplace, preauthorization and voiding a captured payment are **not enabled**.

## Configuration and startup

Supply environment variables through the existing dev launcher or your process
manager. Never commit API credentials:

```text
NODE_ENV=development
PORT=3768
NX_MICROSERVICE_TYPE=ENGINE5
E5_HOST=localhost
E5_PORT=3535
IYZIPAY_URI=https://sandbox-api.iyzipay.com
IYZIPAY_API_KEY=<sandbox API key>
IYZIPAY_SECRET_KEY=<sandbox secret>
IYZICO_PUBLIC_BASE_URL=https://<application-host>/service/payment/api/iyzico/
POSTRAL_DB_HOST=localhost
POSTRAL_DB_PORT=3306
POSTRAL_DB_USER=<database user>
POSTRAL_DB_PASSWORD=<database password>
POSTRAL_DB_NAME=postral_core
IYZICO_DB_SYNCHRONIZE=true
```

Use `IYZICO_DB_SYNCHRONIZE=true` only for disposable sandbox databases. The adapter
registers its own `iyzico_operation` and `iyzico_refund` tables. With synchronization
disabled, provision them from entity metadata before startup. The refund increment
also adds nullable JSON `RefundRequest.channelRefundPlan`,
`PaymentChannelOperation.refundPlan` / `settledRefundItemIds` and nullable varchar
`AccountPaymentTransaction.roundingOperationId` in the core database; provision
these before deploying payment when its schema synchronization is disabled.
This version refuses production mode and
non-sandbox API endpoints. Plain HTTP public URLs are for local testing only;
use externally reachable HTTPS for complete callback tests.

For local development, copy `apps/integration-iyzico/dev.env.example` to the
git-ignored `apps/integration-iyzico/dev.env` and fill in your sandbox keys.

```bash
npm run build -- integration-iyzico
# existing launcher loads dev.env then apps/integration-iyzico/dev.env:
npm start -- integration-iyzico
```

Run the adapter separately from `payment` against the same trusted Engine5
transport. `GET /api/iyzico/health` reports the adapter mode, not provider/MQ
connectivity. Forward the more-specific `/service/payment/api/iyzico/` route to
this application, stripping only `/service/payment`. The Lotus development proxy
uses port 3768. Nginx configurations expect the adapter service DNS name
`postral-integration-iyzico`; provide that service/network alias when deploying.
The adapter is not automatically added to the default compose stack.

Using the existing channel administration UI, add:

```json
{
  "channelId": "iyzico",
  "name": "iyzico Sandbox",
  "enabled": true,
  "devOnly": true
}
```

The authenticated administrative API is `PUT /api/payment-channel-config`.
Select the channel in the existing Lotus licensing checkout. No frontend SDK,
card form, hardcoded merchant keys or absolute provider URLs are needed.

## Contracts and persistence

- `postral/payment-channel/iyzico/init`: `PaymentFullWithCaptureInfoDTO` →
  `PaymentChannelStatusDTO`. Reserves an operation before contacting iyzico;
  initializes Checkout Form and returns `WAITING`.
- `check`: adapter operation ID → persisted status. After a callback it also
  retries result retrieval if verification previously failed or fraud review is
  still pending.
- `fire`: returns an already captured operation, without another charge. It
  explicitly rejects uncaptured operations.
- `cancel`: cancels an unpaid checkout locally (`FAILED`, `cancellationState:
  CANCELLED`) and is idempotent. If the token's retrieval reports
  `paymentStatus=SUCCESS` (including fraud review), or the operation is already
  `COMPLETED`, it fails with a conflict instead; captured payments need a refund.
  iyzico documents neither the retrieval response for an unpaid form nor a way to
  invalidate an open form token, so a failed retrieval is treated as unpaid. A
  successful callback arriving after cancellation is not completed; the row is
  set to `cancellationState: PAID_AFTER_CANCEL` and an error is logged for manual
  reconciliation/refund.
- `init` with `type: REFUND`: uses a server-persisted original-line/precision plan
  and stable `refundOperationId` to submit item-level refunds. It returns an empty
  redirect URL and verified settlements; `check` reads the persisted result and
  `fire` never submits another refund. Do not use the legacy `/refund` message.

`PaymentChannelOperation.operationId` stores the adapter UUID returned at init.
This is neither a product ID nor iyzico's payment/transaction ID. The provider
payment ID becomes available only after result retrieval. The adapter stores
that ID and per-line `paymentItemId` ↔ `paymentTransactionId`/price/paidPrice
mapping in its own row for item-level refunds. Basket IDs use
Postral payment IDs and line IDs use **payment-item** IDs, not catalog IDs.
No buyer identity/address or raw provider response is persisted by the adapter.

The public redirect is an app-origin path derived from `IYZICO_PUBLIC_BASE_URL`,
e.g. `/service/payment/api/iyzico/operation/<adapter-operation-id>`. When the
client gives Postral a `captureInfo.redirectUrl`, Postral appends its own return
endpoint (`/service/payment/api/payment/operation/<id>/return`) as `redirectUrl`,
so the browser comes back through Postral, which checks the payment before
forwarding to the frontend. Legacy clients resolve the path against their own
origin and append `redirectUrl` themselves. The adapter binds the first validated
same-origin return URL and redirects to the stored hosted checkout URL. On
callback it validates the token, retrieves the result server-side, verifies the
HMAC signature and correlation/amount/currency/basket details, stores status
and line mappings atomically, then publishes
`postral/payment-operation-status-updated` with the **adapter operation ID**.
The return URL preserves query parameters and fragments. Its `status` query
parameter is informational; clients must rely on Postral state.

Only `paymentStatus=SUCCESS` with `fraudStatus=1` completes a payment. Fraud
review stays `WAITING`. Actual provider processing fees are recorded after
completion; no dummy fee estimate is used.

Repeated init requests for the same payment reuse the initialized operation.
Different capture details conflict. Ambiguous/unfinished initialization remains
reserved with `RECONCILIATION_REQUIRED` (or `INITIALIZING` after a process crash);
it is **never automatically sent again**. `conversationId` is correlation, not a
provider idempotency guarantee. Reconcile in the sandbox dashboard before any
manual recovery; do not delete reservations just to retry.

## Refund precision and tracking

Set `IYZICO_REFUND_ROUNDING_MODE` in the **integration-iyzico environment**, e.g.
`apps/integration-iyzico/dev.env` (see [dev.env.example](./dev.env.example)).
The payment core has no iyzico policy or configuration dependency.

| Value | Positive amount behavior | 3.3333 |
| --- | --- | --- |
| `ROUND` | Nearest cent, half up | 3.33 |
| `FLOOR` | Upward to the next cent (intentionally ceiling despite the name) | 3.34 |
| `USE_FIRST_TWO` | Keep two decimals, truncate the rest | 3.33 |
| `THROW` | Reject non-cent-exact amounts; default when unset | error |

Unknown values fail adapter startup. A refund becoming zero or exceeding the
remaining provider transaction balance is rejected, never clamped. Each line is
normalized separately; totals are summed from those lines. The original mode
and amounts are saved with the request and reused after restart/config changes.
Nominal payment/operation totals, taxes and commissions keep four-decimal precision.

The adapter implements `postral/payment-channel/iyzico/prepare-refund` to validate
the single-capture restriction, purchase identity and original item mapping,
then calculate provider amounts without issuing refunds. Its saved policy is
kept in `RefundChannelPlan.channelData.roundingMode`; the core treats that
metadata as opaque. The request stores an array of plans; older single-plan
snapshots and their top-level `roundingMode` remain readable. Deploy the core
and adapter together for the new preparation RPC. Existing reservations must
not be deleted or resubmitted during rollout.

When provider and nominal amounts differ, an active, non-external COMMERCIAL
`AdminSettings.billingAccountId` distinct from the customer is required before
creating the refund payment. Verified successful lines post a balanced,
tax-free customer/platform ledger pair for the difference, once per line.
The platform bears upward-rounding cost and receives downward-rounding benefit;
seller amounts are unchanged. Platform/flow reports record the signed difference
as `REFUND_ROUNDING_ADJUSTMENT`, not a provider processing fee.

Users/sellers follow the existing separate refund payment (seller-to-customer
direction). Request approval is not proof of provider settlement or bank posting.
All lines must succeed before the refund operation completes; Postral's existing
status checker then completes the refund payment and its accounting/events.
Refunds have no browser callback or redirect.

The adapter locks the original capture while reserving provider capacity and
stores line states in `iyzico_refund.lines`. Network calls run without SQL locks.
Duplicate/concurrent init calls do not resubmit claimed lines. Definitive initial
provider rejection returns `FAILED`; ambiguous or partially successful operations
remain `WAITING` with an error indication and log entry, and are not resent.
Rejected/ambiguous reservations are not automatically released.

For investigation, match the core operation's stable ID to `iyzico_refund.id`;
inspect each line's conversation ID, transaction ID, amount, state and provider
reference against sandbox provider evidence. A lost init response may leave the
core operation's channel ID unbound even though the adapter has submitted it.
Do not delete reservations, reissue provider calls or mark the payment completed
without reconciling every line and its accounting. Admin recovery UI, seller
manual-confirmation buttons and automatic lost-response recovery are deferred.

## Known gaps / next increment

- TODO: ❗ Move buyer validation into Postral later. Missing snapshots, identity,
  email, readable country, city, street, or name/surname currently fail explicitly
  in the adapter. No sample identity or address is substituted.
- TODO: ❗ The account snapshot has one name field. For individual accounts,
  the last two words are used as surname when both are uppercase under Turkish
  casing rules and at least one given-name word remains; otherwise the last word
  is used. Words without cased letters do not count as uppercase surname words.
  Remaining words form the given name. This is a temporary heuristic, including
  for fully uppercase names; it cannot reliably distinguish every compound name. Add
  explicit name/surname fields for unambiguous mapping. Commercial customers
  need a natural-person buyer contact; tax IDs must not be substituted.
- Buyer IP is the only shared DTO addition: the Postral HTTP controller
  overwrites `captureInfo.buyerIp` from `FastifyRequest.ip`, never from body data.
  Internal callers must supply a trusted IP. Behind a reverse proxy, review the
  payment server's trusted-proxy policy before real risk/fraud testing; do not
  blindly trust arbitrary `X-Forwarded-For` headers.
- Basket lines use the persisted payment-item `isPhysical`: `true` becomes
  `PHYSICAL` / `Physical products`; false or omitted (legacy callers) becomes
  `VIRTUAL` / `Digital products`. A physical or mixed basket also sends
  `shippingAddress` from the validated `customerSnapshotAddress`, the same address
  used for billing. Postral snapshots the explicitly selected `billingAddressId`,
  falling back to the customer account's default address when omitted. There is
  no separate delivery-address selection. Missing address data fails explicitly.
  `metaEntityGroup` / `metaEntityName` / `metaEntityId` stay in Postral snapshots;
  iyzico line IDs remain payment-item IDs, not shared catalog references.
- TODO: ❗ No webhook or autonomous lost-callback reconciliation yet. If the
  browser never posts the callback, provider result recovery is manual. A stored
  callback flag allows normal `check` retries after a callback retrieval error.
- TODO: ❗ Postral expiry and page exits call channel cancellation, which cancels
  only locally; the open iyzico form stays payable until its token expires.
  Payments completed afterwards are flagged `PAID_AFTER_CANCEL` and require
  manual reconciliation/refund (no automatic void); see
  [the reversal plan](../../docs/architecture/iyzico-paid-after-cancel-reversal-plan.md).
  Do not deploy this increment
  for real money or treat closing the browser as cancelling a provider charge.
- TODO: ❗ Full-amount captures only; amounts and each basket line must be positive,
  exactly representable in two decimal places, with matching totals. No silent
  rounding, installment surcharge or split-channel allocation is performed.
- TODO: ❗ Marketplace seller routing and split-channel refunds remain disabled.
  Normal seller-approved and internal fulfillment-failure refunds use the same
  supported single-capture path. Ambiguous results still require manual sandbox
  investigation. Do not enable this channel outside disposable test scenarios.
  The design and deferred work are recorded in the
  [refund integration plan](../../docs/architecture/iyzico-refund-plan.md).

## Verification

With Node 24.9+:

```bash
npm run build -- integration-iyzico
npm run build -- payment
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand \
  --runTestsByPath \
  apps/integration-iyzico/src/integration-iyzico.service.spec.ts \
  apps/integration-iyzico/src/integration-iyzico.controller.spec.ts \
  apps/integration-iyzico/src/iyzico-client.service.spec.ts \
  apps/integration-iyzico/src/iyzico-refund.service.spec.ts \
  apps/integration-iyzico/src/refund-rounding.util.spec.ts \
  libs/payment-core-webservice/src/service/refund-settlement-accounting.spec.ts \
  libs/payment-core-webservice/src/service/account-payment-transaction.service.spec.ts \
  libs/payment-core-webservice/src/service/refund-channel-operations.spec.ts \
  libs/payment-core-webservice/src/service/refund-payment.spec.ts \
  libs/payment-core-webservice/src/service/refund.service.spec.ts \
  libs/payment-core-webservice/src/controller/payment.controller.spec.ts \
  --transform='{"^.+\\.(t|j)s$":["ts-jest",{"tsconfig":{"isolatedModules":true}}]}'
```

Use a disposable book/account with complete customer snapshots. Verify the
successful sandbox card and a declined card from the official SDK README, check
the Postral completion event, and replay the callback without producing another
charge. Sandbox OTP is `123456`. Real sandbox verification requires your own
credentials and a reachable callback; unit tests use mocks and never charge.

## Official references

- [Node SDK examples](https://github.com/iyzico/iyzipay-node/blob/master/samples/IyzipaySamples.js)
- [CF initialize](https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-initialize)
- [CF retrieve](https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-retrieve)
- [Response signatures](https://docs.iyzico.com/en/advanced/response-signature-validation)
- [Sandbox setup](https://docs.iyzico.com/en/getting-started/preliminaries/sandbox)

The SDK has no bundled TypeScript declarations. The app-local declaration covers
only the SDK methods used here; `@types/iyzipay` currently describes an older,
incompatible Checkout Form request/response shape. Provider responses are
therefore treated as unknown and validated at the boundary.
