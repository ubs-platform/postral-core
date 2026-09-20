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

## Cross-Repository Shared Libraries

This repository both consumes and produces shared libraries:

- It consumes `@ubs-platform/*`, owned by `users-mona-mr` (named `ubs-mona-mr` outside local development).
- It produces `@tk-postral/*` (for example `@tk-postral/payment-common`), consumed by the private `lotus-web` repository.

These libraries are not republished to NPM during development, so a change must be rebuilt into the consumer's `node_modules` with `patch-libs`, run **from the repository that owns the library**:

```bash
# after changing @ubs-platform/* — run inside users-mona-mr
npm run xr patch-libs ../postralmona/node_modules

# after changing @tk-postral/* — run inside postralmona
npm run xr patch-libs ../lotus-web/node_modules   # only if the private lotus-web checkout exists
```

Skip any target that is not checked out locally. Otherwise do this whenever the consumer reports missing exports, missing DTO fields, or stale types after a change on the owning side. Do not work around a stale library by redeclaring the types in the consumer. A `users-mona-mr` change usually has to be patched into both `../postralmona/node_modules` and `../lotus-web/node_modules`.  