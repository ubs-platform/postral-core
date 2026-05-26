# payment REST API

This document will be expanded with endpoint-level details.

For now, the source of truth is the payment controllers and DTOs under:

- `apps/payment/src/controller`
- `libs/payment-common/src/dto`

## Scope

The payment app covers:

- payment initialization and operation lifecycle
- payment channel operation start/check/cancel flows
- payment and transaction search
- invoice create/update/finalize/search
- reporting and report query operations
- webhook configuration and dispatch

## Dependency note

Endpoints that require authentication/authorization and ownership checks are integrated with UBS Mona platform services (`users` side).
