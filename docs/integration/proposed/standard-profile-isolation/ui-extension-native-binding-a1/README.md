# Native extension-storage routing — 2026-10-24

This slice connects the existing six-key preference migration to Chromium's actual `StorageFrontend`, both quota decorators and the real LevelDB backend. It changes no UI. It is a source/build-recipe integration, not a completed profile importer or runtime acceptance.

## Implemented

- The opaque capture type lives on `ValueStore`; only the actual LevelDB backend can construct it. Copying its six raw records for a journal cannot change the token's expected bytes. Unsupported backends refuse.
- Both real decorators forward capture and commit. Every quota-enforced commit attempt invalidates the usage cache, including an error that may conceal a completed physical write.
- The native-only frontend route requires the canonical Aux Agent identity, the actual enabled extension instance, local storage and a regular frontend context. It uses the real `RunWithStorage` backend queue. Reply guards refuse dropped callbacks, lost frontend lifetime or changed extension routing. These are unknown outcomes requiring readback, never proof that a write did not occur.
- There is no renderer or extension JavaScript migration API. Native callers still must qualify the actual requesting regular Profile, close writers, hold owner/epoch tickets and retain a journal through asynchronous work. Factory redirection to an original context is not requesting-profile authorization.

## Actual checks

`actual-compile-a1.json` records successful compilation of five real target objects, with 761 distinct dependency pins. The four-case `migration_unittest.cc` fixture compiles against the real backend and both decorators (`actual-test-compile-a1.json`); it has **not linked or executed**. It covers raw values/explicit false and copied-token independence, quota-cache refresh, foreign backend refusal, intervening-read invalidation and unsupported-backend refusal.

The first test GN ordering was rejected. `actual-association-a1.json` binds the unchanged compiled fixture to corrected `test-source-plan-a2.json` and records both actual GN format checks passing. Unchanged code was not recompiled. The initial two-match production anchor preflight is retained and rejected separately.

The canonical delta is `chromium/patches/aux/0107-aux-ui-extension-native-binding.patch`, registered immediately after0106. `actual-series-integration-a1.json` records exact 13-file disposable replay and reverse checking. It first replays the overlapping0106 backend changes. The native checkout already contains a separate service-worker startup header registration in `extensions/browser/BUILD.gn`; this existing prerequisite and its header are pinned, preserved and **not attributed to0107**. The initial upstream-only assumption failed before any canonical patch or series mutation; `integrate-preflight-a1.py` preserves that producer. The successful integration is based on the pinned actual native input plus the registered predecessor, not an upstream-only completeness claim.

No original native source was edited. No full browser link, app package, database operation, native fixture execution, signing, product lifecycle, owner-state access, provider request or OS grant occurred.

## Remaining

Connect a real profile/epoch-owned controller to page/editor capture, DOM and extension operations, retained native journal and complete writer closure. Implement target-store intents/readback/recovery and activation, including legacy UI bootstrap. A callback, extension pointer, copied record or compiled object cannot substitute for those operations. The accepted app and latest inactive package remain unchanged.
