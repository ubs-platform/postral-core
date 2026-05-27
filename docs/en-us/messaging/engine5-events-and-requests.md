# Messaging (Engine5 / MQ) - Events and Requests

This page documents current messaging contracts used by Postral payment controllers.

## Context

- Postral is currently focused on Engine5-compatible MQ flows.
- Engine5 repository: https://github.com/engine5mq/engine5
- Kafka can still be used by environment configuration, but current development focus and support are on Engine5-oriented flow design.

## Source controllers

- apps/payment/src/controller/payment-microservice.controller.ts
- apps/payment/src/controller/dummy-ecommerce-payment-channel.controller.ts

## Event subscriptions

These are consumed with EventPattern.

| Topic | Payload | Handler | Purpose |
|------|------|------|------|
| postral/payment-operation-status-updated | string (operationId) | handlePaymentOperationStatusUpdated | Reconciles payment state after operation status changes. |
| postral/invoice-updated | { sellerPaymentOrderId: string, invoiceCount: number, hasFinalizedInvoice: boolean } | handleInvoiceUpdated | Updates seller payment order invoice counters/finalization state. |
| postral/report-digestion-queue-insertion | { paymentId: string } | handleReportDigestionQueueInsertion | Loads payment and inserts it into report digestion queue from event path. |

## Request/response message patterns

These are consumed with MessagePattern and behave like RPC requests.

| Pattern | Request payload | Response | Notes |
|------|------|------|------|
| postral/payment-channel/dummy-ecommerce/init | PaymentFullWithCaptureInfoDTO | PaymentChannelStatusDTO | Starts a dummy operation and returns WAITING state with provider fee. |
| postral/payment-channel/dummy-ecommerce/fire | string (operationId) | PaymentChannelStatusDTO | Marks operation as COMPLETED, fails if operation missing or already FAILED. |
| postral/payment-channel/dummy-ecommerce/cancel | string (operationId) | PaymentChannelStatusDTO | Marks operation as FAILED. |
| postral/payment-channel/dummy-ecommerce/check | string (paymentOperationId) | PaymentChannelStatusDTO | Returns current operation status, defaults to FAILED if no status. |

## Emitted events

| Topic | Payload | Emitted from | Trigger |
|------|------|------|------|
| postral/payment-operation-status-updated | string (operationId) | dummy-ecommerce-payment-channel controller | After manual status set on /operation/:operationId/status/:set endpoint. |

## HTTP requests in dummy ecommerce channel

These endpoints are not MQ patterns but are part of the same integration flow and useful for end-to-end testing.

| Method | Path | Request | Result |
|------|------|------|------|
| POST | /dummy-ecommerce-payment-channel/operation | PaymentFullWithCaptureInfoDTO | Creates/starts dummy operation and returns PaymentChannelStatusDTO. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId | Query: redirectUrl | Returns an HTML payment simulation page. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId/status/:set | Path: set=COMPLETED or FAILED, Query: redirectUrl | Updates status, emits payment-operation-status-updated, optionally redirects. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId/status | Query: redirectUrl | Reads status and redirects back with current status. |
| PUT | /dummy-ecommerce-payment-channel/kdialog | Body: any | Non-production debug endpoint. |
| POST | /dummy-ecommerce-payment-channel/kdialog | Body: any | Non-production debug endpoint. |
| GET | /dummy-ecommerce-payment-channel/kdialog | Query/Body: any | Non-production debug endpoint. |

## Notes and constraints

- kdialog endpoints are guarded with NonProductionGuard and should not be used in production environments.
- Some endpoint comments and behavior are intentionally dummy/simulation logic for channel testing.
- Topic names should be kept stable for external MQ consumers and adapters.
