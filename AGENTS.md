# Agent Guide

## Start Here

Read `README.md` and the task-relevant documentation in `docs/architecture/` and `docs/operations/` before editing. The architecture documents record important contracts; confirm source and environment configuration before production-impacting work.

## Repository Shape

- This NestJS monorepo contains applications in `apps/` and shared packages in `libs/`.
- The main payment service is under `apps/payment`; payment DTOs are in `libs/payment-common` and persistence entities are in `libs/postral-entities`.
- Register new entities, services, and controllers with their owning module and exports.

## Working Rules

- Run the narrowest available build, lint, or test target after changes.
- Read the payment and encryption notes before modifying payment lifecycle, account/address search, or sensitive fields.
- Read release notes before changing Docker or version tooling.
