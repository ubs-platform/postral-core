# Postral Mona

> We are actively improving this project. If you encounter an issue, please report it.

## Synopsis

Postral Mona was initially derived from the UBS Mona codebase, but it has evolved into a payment-focused backend project.

The current repository primarily includes:

- `payment` app: payment lifecycle, channel operations, reporting, invoice workflows, webhook dispatching.
- `testo` app: flow testing app for Postral. It is still under active development and not fully ready yet.
- shared libs: `payment-common`, `postral-entities`, and `common-utils`.

## Platform dependency (UBS Mona)

Postral still depends on UBS Mona platform services for cross-cutting capabilities:

- user identity and authorization (JWT, roles, ownership)
- account and ownership context
- file and upload related flows used by invoice/file scenarios

In short: Postral provides payment domain logic, while UBS Mona platform services continue to provide core user/files infrastructure.

## Detailed documentations

- [English US 🇺🇸](./docs/en-us/README.md)
- [Turkish 🇹🇷](./docs/tr-tr/README.md)

## Related UBS Mona documentation

- Repository: https://github.com/ubs-platform/ubs-mona-mr
- English docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/en-us/README.md
- Turkish docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/README.md
- Turkish REST API index: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/rest-api/index.md
