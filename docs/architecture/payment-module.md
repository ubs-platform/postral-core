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
