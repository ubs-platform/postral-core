# Postral Mona Documentation (EN)

> We are actively developing this project. If you encounter an issue, please report it.

## Synopsis

Postral Mona started as a fork/derivative of UBS Mona, but now it is a separate payment-oriented backend project.

Main runtime apps in this repository:

- `payment`: payment initialization, payment channel operations, invoice management, reporting, webhook integrations.
- `testo`: flow testing app for Postral. It is still under active development and not fully ready yet.

## Platform dependency (UBS Mona)

Postral is still integrated with UBS Mona platform capabilities for:

- authentication and authorization (JWT + roles)
- user/account ownership context
- file and upload related workflows

This means Postral handles payment domain logic while UBS Mona services remain the source for shared user/files infrastructure.

## Contents

### Getting Started

- [Base requirements](./getting-started/base-requirements.md)
- [Run with source code](./getting-started/running-on-source-code.md)
- [Run with docker compose](./getting-started/running-via-docker-compose.md)

### REST API

- [REST API index](./rest-api/index.md)

### Messaging (MQ / Engine5)

- [Engine5 events and requests](./messaging/engine5-events-and-requests.md)

### UBS Mona Docs (Related)

- Repository: https://github.com/ubs-platform/ubs-mona-mr
- English docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/en-us/README.md
- Turkish docs entry: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/README.md
- Turkish REST API index: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/rest-api/index.md

### Maintenance

- [Creating the application](./maintaining/1%20-%20creating%20app.md)
- [Running the application](./maintaining/2%20-%20run%20app.md)
- [Creating the library](./maintaining/3%20-%20creating%20library.md)
- [Building the library and publishing to NPM registry](./maintaining/4%20-%20build%20library.md)
