# Running via docker compose

The repository currently includes a compose file at:

- [infrastructure/docker-compose.yml](../../../infrastructure/docker-compose.yml)

Use it with:

```
cd infrastructure
docker compose up -d
```

## Important notes

- This compose setup currently focuses on infrastructure dependencies (for example MariaDB), not the full UBS Mona platform stack.
- Postral application flows that require users/files/notify capabilities still depend on external UBS Mona services.
- If you need a full local stack, start Postral services here and start dependent UBS Mona services from the `users-mona-mr` project.
- If `postralmona` and `users-mona-mr` are already on the same machine, you can run Postral from this repository and start users/files/notify services directly from your local `users-mona-mr` workspace.