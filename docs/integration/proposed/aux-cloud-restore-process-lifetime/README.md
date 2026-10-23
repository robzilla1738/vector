# Restore importer lifetime

The isolated restore CLI previously rejected its import promise on any ChildProcess `error`, even after `spawn`. That allowed its `finally` block to release the database connection and remove plaintext staging while the actual importer could remain alive. Its timeout sent SIGTERM without recording uncertainty, so an eventual exit zero could incorrectly proceed to database quarantine and object writes.

The restore-specific waiter now distinguishes an unavailable executable from a spawned child. After spawning, an error or the five-minute stop request records uncertainty and holds the actual child until its `exit` event. Any uncertain outcome refuses continuation even if the final exit code is zero. Failed progress persistence cannot produce success or an unobserved rejected event-listener promise. Ignored SIGTERM retains the operation and staging; the timeout is a stop request, not a bounded completion guarantee. The CLI discards all importer diagnostics directly rather than creating an unused stderr pipe that could itself fail unhandled.

One offline lifecycle check exercises post-spawn errors with failed checkpoints, ignored stop requests, zero exits after uncertainty, unavailable executables and ordinary successful exit. Node's mocked clock advances the actual five-minute timer; the fixture does not spawn pg_restore, access secrets or contact providers. Syntax checks pass. No production restore, database cleanup, signing, desktop launch or UI change occurred. This only owns the pg_restore child; it does not prove remote PostgreSQL query shutdown, operator writer exclusion, independent backup custody or readiness for cutover. The actual current-schema cross-store provider restore drill remains pending.

Run the focused check:

```sh
node docs/integration/proposed/aux-cloud-restore-process-lifetime/check.mjs
```

The earlier isolated-restore source pins/evidence remain historical. This directory pins the updated CLI, new lifecycle module and exact focused check separately.
