# Aux daemon core

Implementation references: docs/spec/daemon/core.md, agent.md and native/platform.md. Foundation review records incomplete parity areas.

Build using `pnpm --filter @aux/daemon build`, then run `node apps/daemon/dist/index.js`. Requires Node with built-in SQLite (22.18+). `AUX_HOME` defaults to ~/.aux, `AUX_PORT` to 21520. Explicit development CORS origins may be comma-separated in AUX_DEV_ORIGINS. Bind address is always 127.0.0.1.

Installation P-256 signing key is `$AUX_HOME/installation-private.pem` (PKCS8 PEM, mode 0600); public key is installation-public.pem (SPKI PEM). The separate session-secret signs HS256 tokens. Sign SHA256 over UTF-8 `Aux Daemon Auth v1` followed by a NUL and the decoded challenge bytes; submit DER signature encoded as base64. Native/CLI clients keep returned tokens in memory and use the AuxDaemonSessionToken authorization scheme. Keys and tokens must never be logged.

Auth-free GET /health and /auth/daemon/challenge retain strict Host/Origin validation. Ordinary HTTP and WS require installation-authenticated sessions. Plain tRPC runs under /trpc; reads use GET with JSON input query and mutations use POST with JSON body. /events carries settings invalidation messages. Extension WS is /extension-bridge/extension (alias /extension); protocol auth is aux.daemon.auth.<token>.

Account metadata is transactional SQLite registry.db and atomic accounts.json projection; account state uses u/<id>/state.db. Numeric IDs never reuse deleted identities. Default local provisioning does not implement a vault/password bootstrap gate. Domain routers attach through createDaemon extendRouter. Store.registerAccountDeletionHandler stops domain work before erasure; shutdown callback stops domain engines before listener/storage close. Standalone SIGTERM/SIGINT perform graceful shutdown. HTTP shutdown waits 30ms to flush its response before closing; it does not signal unrelated processes.
