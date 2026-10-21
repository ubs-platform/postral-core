# Postral Core

> We are actively developing this project. If you encounter an issue, please report it.

## Synopsis

Postral Core was initially derived from the UBS Mona codebase, but it has evolved into a payment-focused backend project.

The current repository primarily includes:

- `payment` app: Nest application and runtime configuration for the payment service.
- `testo` app: flow testing app for Postral. It is still under active development and not fully ready yet.
- shared libs: `payment-core-webservice` (payment lifecycle, items, reports, refunds, invoices, and related domain logic), `payment-common`, `postral-entities`, and `common-utils`.

## Platform dependency (UBS Mona)

Postral still depends on UBS Mona platform services for cross-cutting capabilities:

- user identity and authorization (JWT, roles, ownership)
- account and ownership context
- file and upload related flows used by invoice/file scenarios

In short: Postral provides payment domain logic, while UBS Mona platform services continue to provide core user/files infrastructure.

## System refunds

Trusted backend applications can call the internal request/response command
`postral/payment/start-refund` with a `StartSystemRefundDTO`:

```json
{
  "paymentId": "<completed-purchase-id>",
  "items": [{ "paymentItemId": "<purchase-item-id>", "refundCount": 1 }],
  "reasonKeys": ["OTHER"],
  "requestNote": "Application could not fulfill the purchased item",
  "idempotencyKey": "<application>:<payment-id>:<item-id>"
}
```

This is not an anonymous HTTP endpoint. Restrict the microservice transport to
trusted services; clients must not be able to publish system refund commands.
The existing HTTP request/approve/reject routes remain user-authenticated and
seller approval still checks ownership. System requests are resolved only by
the internal command.

Postral loads payment/account/seller and amount information itself. Only
`COMPLETED` `PURCHASE` payments are eligible; external-platform purchases are
still unsupported. Items must belong to one seller, with unique item IDs and
positive quantities representable at the database's four-decimal precision.
Pending requests reserve quantities against other refund requests.
`requestedByAccountId` and `resolvedByAccountId` are string fields and are set
to `system`; the buyer/seller payment-account references remain real IDs.

The command creates a pending request, initializes its refund payment, and
immediately approves it without waiting for seller/user input. Repeating the
same idempotency key returns the same request; reusing it for another payment
or quantity is rejected. Approval and original item counters are committed
atomically under a purchase-payment lock. A persisted five-minute approval
lease serializes approvals for each purchase without holding database locks
or connections during network calls. Concurrent approvals receive a retryable
conflict; expired leases can be reclaimed, and finalization checks the lease
token before changing item counters. Refund payments and their accounting
records are persisted transactionally and resumed rather than recreated.
Refund amounts, taxes, and commissions use historical purchase values, not
current catalog prices; the final quantity receives any rounding remainder.

Refunds are initialized once through the channel `init` contract with
`type: REFUND`, `captureInfo.paidAmount` for that channel's partial amount,
`originalPaymentChannelOperationId` for its original provider operation, and
`refundOperationId` as a stable identifier for this refund operation. Channel
integrations must honor these fields; the dummy channel uses the stable
identifier and completes refunds asynchronously. Do not additionally call the
legacy full-operation `refund` message for the same request.

Channel operations are durably reserved before network calls. If the call
times out (30 seconds), returns an invalid response, or fails before its result
can be recorded, the request remains pending and repeated commands do not send
that channel operation again. Reconcile its provider result and persisted
channel-operation record before resuming; this deliberately avoids double
refunds on ambiguous outcomes. An initiated refund cannot be rejected to free
its reserved quantity. `APPROVED` means initialization was accepted; the
refund payment's status separately tracks actual channel completion or failure.

The nullable unique request idempotency key, payment approval-lease fields, and
channel source-operation index are part of the TypeORM entities. The current app uses schema
synchronization; deployments with synchronization disabled must apply these
schema additions before rollout. Patch shared libraries into consuming
workspaces after changing their contracts.

Focused refund tests cover system commands, historical refund amounts,
channel reservations, and existing external-platform restrictions. With the
current Nest 12 dependencies, use Node 24.9+ and
`NODE_OPTIONS=--experimental-vm-modules` when running Jest.

## Seller report setup

Authenticated sellers can preview standard reporting with
`GET /api/account/:accountId/report-setup?currency=TRY` and create missing sources
with `POST /api/account/:accountId/report-setup`:

```json
{
  "currency": "TRY",
  "dateGroupings": ["DAILY", "MONTHLY", "YEARLY"]
}
```

Setup supports TRY/USD/EUR/GBP and DAILY/MONTHLY/YEARLY. DAILY is mandatory for
commission calculations. Preview requires account view/edit/owner capability;
creation requires edit/owner capability, including for team-owned accounts.
The target must be an active, non-external COMMERCIAL account. Admin role alone
does not bypass ownership for this seller endpoint.

Responses contain `accountId`, `currency`, `existing`, `created`, and `missing`.
Only missing SELLER queries are created; existing/custom sources are never
modified, merged, or deleted. Multiple matching sources remain valid and still
require explicit source selection in seller report charts. POST creates the
selected missing queries in one transaction, locks the account row before
checking, and rechecks current sources rather than trusting preview results.
Payment digestion uses the same account lock when ensuring daily SELLER and
PLATFORM_SELLER sources, preventing duplicates between retries/concurrent setup
and payment automation. All configured matching groupings still receive payments.
Automatic payment setup continues to accept payment currencies independently
of the narrower interactive currency choices.

This does not schedule calendar jobs or backfill historical payments: grouping
controls calendar buckets and new queries receive future digestion events.
The first period can therefore be incomplete. PLATFORM/PLATFORM_FLOW setup is
separate; daily PLATFORM_SELLER automation remains internal to payment digestion.
No schema migration is required. The UI calls the same endpoints through
`/service/payment/api/...`; existing development proxies and the compose-mounted
`infrastructure/config/postral-ui.conf` strip only `/service/payment`.

## First-run platform setup

`/api/platform-setup` is a separate, system-owned singleton, not a field accepted
by the normal admin-settings API. Every handler requires JWT and `ADMIN`,
`POSTRAL-ADMIN` or the legacy `POSTRAL_ADMIN` role. GET only reads status; it does
not create default settings or mark an installation complete.

New installations POST `team`, `platform-account` (address and commercial
account), `settings`, optionally `seller-account`, then `complete`. Completed
steps are persisted and retries reuse their resource IDs. The administrator who
started setup must resume it. A five-minute row lease rejects simultaneous
steps; interrupted operations can resume after it expires. Network calls have
30-second timeouts and do not hold SQL transactions open. Address/account data
uses the existing encryption mappers.

- Own sales: explicit zero global/account commission, optional SELLER sources,
  platform billing account set, automatic billing days left empty.
- Marketplace: default commission, billing days (defaults 1 and 28; integers
  1–28), configurable commission-service tax (default 20%, whole percentages
  supported by the existing tax entity), PLATFORM and PLATFORM_FLOW sources.
  Optional own sales use a **separate** zero-commission seller account, sharing
  the platform address if desired.
- TRY/USD/EUR/GBP and DAILY/MONTHLY/YEARLY use the seller reporting conventions.
  DAILY is mandatory; no currency conversion, calendar scheduling or historical
  backfill is introduced. PLATFORM_SELLER daily provisioning remains internal.

Completion validates the saved accounts, team and tax, then activates settings,
commissions, report sources and completion state in one SQL transaction.
Conflicting existing billing accounts/days, commission taxes or default
commissions produce an error instead of being overwritten. Existing matching
sources are preserved. Billing skips the platform billing account itself to
prevent self-to-self invoices; a separate own-seller account remains eligible.

Existing installations with a billing account must explicitly POST
`keep-existing`; this validates an active commercial account/address and marks
setup complete **without changing any existing settings or sources**. The
mere existence of an auto-created empty admin-settings row is not completion.
There is no reset action in normal settings. Saved choices are immutable during
onboarding; reconciliation of conflicting legacy data is an administrator task.

Deploy the updated users service **before** the payment service: group creation
uses a persisted retry key and ownership uses the acknowledged
`ensure-team-ownership` command, not the legacy fire-and-forget event. Rebuild
and patch UBS libraries into both Postral and the UI, then patch Postral contracts
into the UI. The new `platform_setup` table is registered with TypeORM; the
current payment app uses schema synchronization. Deployments without it must
apply the corresponding entity schema before rollout. Do not drop this table
to restart onboarding: it contains the recovery IDs for already-created records.

## Detailed documentations

- [English US 🇺🇸](./docs/en-us/README.md)
- [Turkish 🇹🇷](./docs/tr-tr/README.md)

## Quick Install

### Linux / macOS / WSL (bash)

```bash
curl -fsSL https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.sh | bash
```

This downloads `docker-compose.yml`, nginx config, and init SQL into `~/.bin/tetakent/postral`, then you can start the stack:

```bash
cd ~/.bin/tetakent/postral
docker compose up -d
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex
```

> If your execution policy blocks remote scripts, run:
> ```powershell
> powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex"
> ```

Files are installed to `%USERPROFILE%\.bin\tetakent\postral`. Start the stack with:

```powershell
cd "$env:USERPROFILE\.bin\tetakent\postral"
docker compose up -d
```

## Related UBS Mona documentation

- Repository: https://github.com/ubs-platform/ubs-mona-mr
- English docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/en-us/README.md
- Turkish docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/README.md
- Turkish REST API index: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/rest-api/index.md
