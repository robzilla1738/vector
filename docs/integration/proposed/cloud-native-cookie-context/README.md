# Explicit regular-profile cookie capture

The original shipped1852 uploader requests `Storage.getCookies` without a browser context. The original Chromium lookup resolves only its last-used normal profile or registered private contexts. This change retains the supplied capture/filter/encryption/upload implementation while removing that default-profile dependency for cloud capture.

## Implementation

- Native `getProfileContext` adds the current regular profile's opaque `browserContextId`. The metadata also carries the binding epoch from `../cloud-native-cookie-binding-epoch/` and existing account/session ownership fields.
- In Aux builds, explicit DevTools context lookup resolves only an exact ID belonging to an already-loaded regular profile. It does not load a profile by path or substitute the last-used profile. Existing private-context registration and non-Aux behavior remain unchanged.
- `vendor/provided/cloud-cookie-profile.mjs` adds `Aside.getCookieSyncContext` to the original daemon/Agent command schemas and dispatcher. The original bridge routes it by account, persisted profile ID and normal browser mode. The Agent validates native account/user/profile/session metadata and returns no disk path.
- Cloud capture requires exactly one registry binding for the cloud account, checks its lifetime/generation stamp around asynchronous work, reads CDP cookies with the explicit context, then rechecks native context and epoch before the untouched original filters/upload. There is no default-context fallback. Full CDP cookie fields remain available; this does not substitute the narrower extension cookies API.
- Default local composition remains byte-identical. No stylesheet, icon, geometry, glass, animation, shortcut or other UI change is included. Native metadata/context lookup itself performs no cookie read or write. The opt-in adapter adds scoped cookie reads only when integrated and run.

## Evidence and limits

The two native files have pinned baseline/output copies, hashes and a count-checked patch here. The manifest records the original proposal state. The composed changes were applied under the native lock through `out/native-reuse-composition-cloud-cookie-context`; the successful build/generated-key receipt is `out/cloud-cookie-context-native-build.json`. `execution.json` records both native build receipt hashes and artifact hashes. Compilation is not runtime acceptance.

Eleven focused checks pass across the new profile adapter, full shipped daemon composition and existing encrypted cookie reader: actual frozen and shipped Agent/daemon anchors, additive schema validation, syntax checking, local byte preservation, explicit CDP context/full fields, private/paused/mismatched identity rejection, cancellation, registry races and native epoch/context changes. Complete cloud daemon composition now replays28 anchors. These tests execute actual patched capture code with synthetic metadata/CDP responses; they do not read any browser cookies or establish native runtime behavior.

Native cookie import remains unimplemented. It still needs write serialization with account rebinding/profile teardown, original exclusions/conversion, snapshot conflict/startup policy and disposable two-profile observation. The original registry maintains one local profile binding per account, but this is not cross-device mapping or recovery acceptance. The running desktop and prepared cloud/signing candidate are unchanged and do not contain this work; a future integrated candidate needs matching review and real app acceptance. No signing, owner-state access, provider calls, production activation or release occurred.
