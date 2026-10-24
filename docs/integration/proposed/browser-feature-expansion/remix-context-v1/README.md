# Preserve the original Remix session path with native tab context

Inactive successor; no shared/native/resource stage or app was changed.

The actual supplied `background.js` `vb()` builds a default current-tab attachment without `documentCapability`, then invokes `D.sessions.createAndPrompt`. The final paired daemon correctly rejects that attachment before preparation. This adapter preserves the existing Remix prompt/session/sidepanel path and supplies a native-owned reference instead of weakening validation or dropping context.

## Exact integration

- Copy `source/aux-remix-context.mjs` to `vendor/provided/aux-remix-context.mjs`; compose `transformAuxRemixContext` on `background.js` after existing post-identity feature transforms. Its original `vb()` body SHA and all replacements are count checked. The unchanged caller delivers browser-issued `MessageSender` separately from script arguments. There are two count-one replacements and one helper append; no CSS/component edits.
- Apply the exact pinned `native-overlay.json` files in order. `aux_feature_expansion_api.cc` adds two counted changes: includes and the worker-origin branch in the existing capture/validate dispatcher. `aux_tab_reference_context.cc` adds three counted changes to invalidate retained references when their actual profile binding epoch changes. `baseline/`, `source/` and `native.patch` show exact before/after bytes. Root owns composition/build/registration manifests.
- No schema/histogram/GN-target addition: existing `captureTabReferences` and `validateTabReferences` take open object requests. Their normal composer calls remain unchanged. New worker request fields are `origin:{tabId,windowId,documentId}`, `references`, and optional `ownerGeneration` on subsequent validation. Unexpected fields and malformed origin selectors refuse.

The native wrapper only accepts this branch from the actual installed Agent service worker, with no sender WebContents, under the existing admitted-profile check. It independently finds a current same-profile tab in the exact native window, matches the native `ExtensionApiFrameIdMap` document, rejects pending/non-web/error documents, and creates the actual DevTools target ID itself. Newly captured references can only be that origin tab and require the actual extension function `user_gesture()`; capture refuses a caller-supplied references list or prior epoch. `CaptureAuxTabReferences` retains the real original page/document owner. Validation never remints explicit references, and profile-epoch changes invalidate retained capabilities.

## Source behavior

`prepareRemixContext` calls native capture synchronously before any account/debugger await. It reads tab/window/document exclusively from browser `MessageSender` (top-level frame, own extension), never `args`. It then resolves the existing account/route, retains their identity and the existing native profile-change counters, preserves explicit attachments, and revalidates origin/document/capabilities/account before `createAndPrompt` and before later sidepanel writes. `attachCurrentTab:false` performs origin validation only, does not mint or attach current-page context, and retains valid explicit references. A missing explicit capability refuses with a useful reselect error.

There is no synthesized gesture, default context omission, reference repair by URL, new backend, automatic provider test or foreign-window fallback. Unattended scripts cannot newly capture context; they receive “Click the Remix action again …”. Actual browser gesture propagation through the supplied message/worker path still needs an app check; source fixtures cannot prove it. A session already created before a later source change is not silently retried or moved to another profile.

## Bounded adjacent audit

The a4 Agent source has one `createAndPrompt` caller that also constructs a tab attachment: `background.js` `vb()`. The channel setup and experimental setup callers create plain user messages; the session-composer tab literal is a display chip, with actual submission routed through the existing permission/composer validation. No additional confirmed missing-capability producer was changed.

## Evidence

`check.mjs` ran once: synthetic native-mint-before-await ordering, browser-issued origin, preserve/no-remint explicit caps, missing-capability refusal, stale profile refusal, native gesture refusal, foreign sender refusal, exact native overlay replay, original-handler SHA check and actual composed background syntax passed. No native compile, app action, account/provider call, owner data, signing or lifecycle operations occurred. Root should compile the two native units and replay this adapter before any final acceptance claim.
