# Aux transient profile context

The pinned transform pairs all24 `asideUserId` fields in the supplied daemon and three Agent modules with `auxUserId`. Both profile schemas, context cache-key serializers, sign-in continuity comparisons, daemon account guards, Browser request producer and local sync-passphrase query/output change together. `inputs.json` pins original complete hashes and counts. Original `userId`, `boundUserId`, account/profile IDs and all binding/expiry/incarnation checks remain unchanged.

Apply `applyAuxProfileContextIdentity({component,path,text,original})` after the existing identity transforms, only for the explicit state2 successor. Record returned anchors. Wrong source, changed count, mixed identity or repeated application refuses. Unknown files are untouched. No schema shape, UI/CSS, stored credentials, account records, signatures or native code changes are included.

## Current native boundary

The current native profile API already emits verified `boundUserId`, which remains the supported fallback. Its context/profile/chat producers contain no old field. The supplied daemon first tries `Browser.ensureChromiumProfile`; its proprietary receiver was not found in the authorized sources. Current Aux native implements the existing `Browser.ensureProfile` fallback, guarded by authenticated debugging and a profile/account-bound index. The daemon still falls back only for the exact method-not-found error, requires the matching account binding/index and forwards URL/focus unchanged. Other errors remain errors. This transform does not add a custom native handler or claim that it was tested in an app.

Recovered original native sync function `040b003c` sends only accountId plus Authorization to the local sync-passphrase route. That request remains valid without the optional `auxUserId` query. The response callback body is unavailable; end-to-end native sync consumption remains unproven. Do not claim renamed response acceptance from this source-only finding. Full provenance and search coverage remain in `../aux-user-id-contract-audit/`.

## State transition and evidence

Reviewed persisted account and renderer cache schemas do not store this field; they use `userId`/`boundUserId`. Do not rewrite those stores or token values for this change. Pending sign-in attempts and context-key caches are process-local and must expire/reload during a coordinated stopped-generation transition. The existing state2 launcher refusal remains in force until actual writer exclusion, renderer acknowledgement and native authority acceptance exist. No legacy process attempt is adopted, no authentication is fabricated and no owner state is accessed.

Four focused checks pass with `node --experimental-vm-modules --test vendor/provided/aux-profile-context-identity.test.mjs`: all four original and current composed modules parse; reversing only the exact field replacements reproduces every other byte. VM checks execute the actual small account guards, cache serializers, sign-in comparison, profile-window request/fallback and sync-passphrase handler against synthetic inputs. They preserve rejection for mismatched users/accounts, changed sign-in context, missing index, non-method-not-found errors, remote requests and identity changes across awaited passphrase fetch. Full app/native/hosted behavior remains separate.
