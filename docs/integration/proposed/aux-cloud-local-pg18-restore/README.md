# Actual local PostgreSQL18 archive restore

One focused synthetic drill passes against real PostgreSQL18. This adds evidence and a reproducible fixture; it changes no application implementation, UI, secrets, production rows or provider configuration.

The fixture creates a fresh private cluster under `/private/tmp`, disables TCP listening, uses local Unix sockets and fixture-only trust authentication inside a mode0700 directory, and creates separate empty source/target databases. It applies all12 original SQL migrations, including pgcrypto, with exact manifest hashes. Synthetic users include a deleted owner, session/refresh/email/device/rate-limit/recovery challenge state, generation3 wrapped CSK and recovery material, session snapshot, revoked-on-restore share, durable attachment, transient inference/issued objects and avatar.

A real exported read-only repeatable-read snapshot feeds `pg_dump --format=custom`. The existing encrypted bundle writer seals the genuine archive and synthetic object copies; authenticated unpack and archive integrity checks precede an actual `pg_restore --single-transaction --exit-on-error` into the empty target. The real shared `runPostgresTool` captures and the real `waitForRestoreExit` waits for import. Cluster startup/shutdown alone use the fixture subprocess helper. The actual `sanitizeRestoredDatabase` and `restorePrivateObjects` functions then run against PostgreSQL and an explicitly local memory object adapter respectively.

Assertions prove preserved sync generation, wrapped key/recovery material, deleted-owner state, snapshot FK and share contents; session expiry/revocation, transient/challenge cleanup and share revocation; recovered wrapping-key decryption of the original random CSK; full attachment/avatar byte/hash readback; and create-only refusal of existing target objects. The cluster is stopped with `pg_ctl -w`, absence of its live PID file checked, then only its freshly created root is removed. Synthetic keys/plaintext are removed with that fixture; no provider/owner credentials are loaded.

Run with an exact fixture-only driver installation (does not modify service dependencies):

```sh
mkdir -m 700 /private/tmp/aux-pg18-driver-example
npm install --prefix /private/tmp/aux-pg18-driver-example --ignore-scripts --no-audit --no-fund --save-exact pg@8.16.3
AUX_PG_FIXTURE_DRIVER_ROOT=/private/tmp/aux-pg18-driver-example node --test docs/integration/proposed/aux-cloud-local-pg18-restore/check.mjs
```

`evidence.json` records the actual successful run; `source-pins.json` binds exercised source, PostgreSQL binaries and driver metadata. This closes actual current-schema archive import/quarantine on local PostgreSQL. It does **not** prove Neon target credentials/driver/TLS, actual private Blob restore, full production CLI admission, independent custody, scheduling, production cutover, stateless capability secret rotation or provider reconciliation. The object adapter is a fixture, not a hosted-storage acceptance result. No production activation or release occurs.
