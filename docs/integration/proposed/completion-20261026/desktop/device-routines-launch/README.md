# Device-only routines launch scope

Owner decision: “Launch with device routines only.” Source-only counted successor to the actual frozen candidate; no app edit, signing, runtime/native build, hosting, API or credential access. The preceding local-sign review is stale until root composes this delta into a fresh exact review.

`vendor/provided/aux-device-routines-launch.mjs` exports **transformAuxDeviceRoutines({path,text,source})**. `source` is the separately pinned original A38 file; `text` is accumulated final text. It returns `{text,anchors}` and refuses hash/count drift. Five leaves /66 anchors /68 occurrences are pinned in source-pins.json:

- Contents/Resources/aux/apps/extension/dist/assets/provider-Cw0zhujt.js
- Contents/Resources/aux/apps/extension/dist/assets/routines-BNdQOEUt.js
- Contents/Resources/aux/apps/extension/dist/assets/routine-item-menu-DJrYR2RE.js
- Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs
- Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs

Both complete daemon source consumers receive the same rules. The provider asset also contains unrelated browser/draft work: apply this transform to accumulated text, never replace it with a stale standalone copy. Root owns materializer, final inventories and app mutation.

## Resulting UI and daemon behavior

The existing Environment selector remains in its original row with its original style classes and only **This computer** as an option. Its handler rejects any other selection. Experimental eligibility no longer enables a Cloud choice. New form/create schemas accept/default device only; record/read schemas still recognize cloud without reinterpreting stored data. New submit requires an initialized nonempty actual settings device ID and emits environment=device; it never sends a caller-chosen device ID. The daemon derives that ID from actual account settings, rechecks before insert after awaited session creation, and keeps the original schedule-derived active/paused/completed behavior.

Cloud records keep their environment, device ID, status, revision, schedule, prompt and all stored bytes. The existing list/environment label explicitly says unavailable/preserved. Cloud Pause/Resume, Run, Edit and Remove controls are disabled and their handlers cannot dispatch. Direct edit links show the visible “Cloud routine unavailable” title and retain the original editor for inspection with disabled fields/update/pause and explanatory dialog description. Other-device/uninitialized-device editing also refuses. The form body uses a disabled fieldset with the same classes plus min-w-0 to retain the original div's width behavior; no CSS, typography, colors, spacing or new screen design changes. The rich prompt editor also receives its existing disabled property explicitly, since contenteditable does not inherit fieldset disabling. The original cancel/close remains available.

The supplied Routines list has no environment filter control: it lists noninternal routines and now truthfully labels preserved cloud entries; none are hidden or converted by a device default. Generic Tasks/cloud/remote harness controls elsewhere are separate features and unchanged.

A single daemon helper fences actual current-device mutations. Local create rejects unsupported environments; update/delete/manual-run and revision-based route paths check the stored routine, not a selector override. Supplied expected revision handling stays intact, including delete's caller revision. The dead hosted-create writer and hosted Run Now route are removed rather than synthesizing success. Original readonly listing/detail schemas remain. Scheduled execution checks current stored environment and actual device before advancing/queuing; the eventual prompt callback also rechecks after awaited preparation.

Hydration already rejects nondevice/other-device definitions and that guard remains unchanged. The patch additionally limits local-ID adoption, sync adoption uploads/device-sync summaries and timezone recalculation to device records. A cloud record carrying a stale matching device ID is never adopted, advanced or reported as applied by these paths. No migration/deletion of records or automatic status change occurs. Server-validated device discovery/current registration continues through the existing sync flow; no fake initialized ID is introduced.

## Root-owned narrow server successor

`server-routines.patch` and `server-source-pins.json` propose only three exact guards against the current services/aux-cloud/src/routines-1852.ts:

- PATCH returns409 CLOUD_ROUTINE_UNAVAILABLE for a stored cloud record before a write.
- PATCH's revision-checked UPDATE additionally predicates stored environment=device, preserving the same fence if the record changes between read and update.
- device-sync UPDATE predicates environment=device, so matching stale deviceId does not mutate a preserved cloud record.

POST's existing nondevice rejection, actual account/current-device validation, schema, auth, revision and ownership behavior remain. GET continues returning original cloud records. This is source preparation, not deployed server behavior. The root cloud packet needs fresh source pins after applying it.

`server-regression.patch` adds one bounded case inside the existing PGlite/current-DDL routines test: insert a synthetic cloud record with a deliberately matching current device ID; PATCH pause/delete must refuse409, device-sync may acknowledge its finite request but must leave exact stored payload text unchanged, and GET must still report cloud. No migration/production data or real credentials are used. The existing cloud-create refusal case carries forward. Root runs **once**, from services/aux-cloud:

```
./node_modules/.bin/tsx --test src/routines-1852.test.ts
```

That existing test sets a synthetic offline.invalid DATABASE_URL and replaces Neon fetch with the actual local PGlite migration-backed adapter. No env file, network credentials or deployment required. Worker did not run it, per root ownership.

## Focused actual-function evidence

`check.mjs` /static-check.json: all five full transformed source files parse. Actual transformed selector emits only the existing device option and ignores cloud selection. Actual submit handler emits device payload, derives no caller device ID, refuses cloud/missing-ID/cloud-record submissions without mutation. Actual daemon create function with finite stubs derives current device ID and preserves paused versus active schedule behavior; cloud creation refuses before insert. Actual hydration and due functions receive an active cloud record carrying the current device ID: no database write, next-run calculation or queue call occurs and its bytes remain exact. This is a focused source-function fixture with local stubs, not live app/native/server acceptance. No extra campaign was run.
