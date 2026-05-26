# Running with source code

You can run applications in this repository with:

```
npm run start <app-name>
```

Current Postral apps are:

- **payment**: core payment domain API (payment lifecycle, channel operations, invoices, reports, webhooks)
- **testo**: flow testing app for Postral; still under active development and not fully ready yet

Example:

```
npm run start payment
npm run start testo
```

## External dependencies from UBS Mona platform

Postral still depends on shared UBS Mona platform services for user and file related capabilities.

For local development, make sure required external services are available (typically from the `users-mona-mr` workspace):

- **users service**: authentication, JWT validation, roles, ownership context
- **files service**: upload and file-related infrastructure used by invoice/file flows
- **notify service** (optional but recommended): notification/event related flows

Without these services, endpoints that rely on user context, role checks, ownership checks, or file/upload workflows may fail.