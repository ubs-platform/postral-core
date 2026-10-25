# iyzico sandbox adapter

An independent Engine5 payment channel (`iyzico`), not a replacement for
`dummy-ecommerce`. Postral remains responsible for payment lifecycle, accounting
and fulfillment events. This first increment supports full-amount, single-charge
Checkout Form purchases with all items temporarily classified as digital. Currency comes
from the payment DTO; TRY/EUR/USD/GBP/NOK/CHF are accepted subject to the sandbox
merchant's capabilities. Marketplace, physical products, preauthorization,
cancellation and refunds are **not enabled**.

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
registers only its own `iyzico_operation` table. With synchronization disabled,
provision that table from `IyzicoOperation` metadata before startup. No Postral
core entity/schema change is required. This version refuses production mode and
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
- `cancel`: explicitly rejects the unsupported operation; it does not pretend
  that a local expiry reversed a provider charge.
- `init` with `type: REFUND`: explicitly rejected until the refund increment.

`PaymentChannelOperation.operationId` stores the adapter UUID returned at init.
This is neither a product ID nor iyzico's payment/transaction ID. The provider
payment ID becomes available only after result retrieval. The adapter stores
that ID and per-line `paymentItemId` ↔ `paymentTransactionId`/price/paidPrice
mapping in its own row, ready for later item-level refunds. Basket IDs use
Postral payment IDs and line IDs use **payment-item** IDs, not catalog IDs.
No buyer identity/address or raw provider response is persisted by the adapter.

The public redirect stays relative: `iyzico/operation/<adapter-operation-id>`.
The existing client appends `redirectUrl`. The adapter binds the first validated
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
- TODO: ❗ Physical/virtual type and shipping snapshots are absent from the shared
  item contract. By explicit temporary policy, every product family is sent as
  `VIRTUAL` with category `Digital products`, without a shipping address. Once
  Postral adds `isPhysical` to payment items and related snapshots, map that field
  and require shipping data for physical items before enabling physical checkout.
- TODO: ❗ No webhook or autonomous lost-callback reconciliation yet. If the
  browser never posts the callback, provider result recovery is manual. A stored
  callback flag allows normal `check` retries after a callback retrieval error.
- TODO: ❗ Postral expiry currently calls channel cancellation and terminal Postral
  payments ignore later results. Unsupported cancellation fails explicitly.
  Test within Postral's payment expiry window (default 15 minutes); late captured
  payments require manual reconciliation. Do not deploy this increment for real
  money or treat closing the browser as cancelling a provider charge.
- TODO: ❗ Full-amount captures only; amounts and each basket line must be positive,
  exactly representable in two decimal places, with matching totals. No silent
  rounding, installment surcharge or split-channel allocation is performed.
- TODO: ❗ Marketplace seller routing and refunds remain disabled, even though
  Postral can emit refund requests. A fulfillment failure may therefore leave a
  refund needing manual sandbox handling. Do not enable this channel outside
  disposable test scenarios until the refund increment is implemented.

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
only the two SDK methods used here; `@types/iyzipay` currently describes an older,
incompatible Checkout Form request/response shape. Provider responses are
therefore treated as unknown and validated at the boundary.
