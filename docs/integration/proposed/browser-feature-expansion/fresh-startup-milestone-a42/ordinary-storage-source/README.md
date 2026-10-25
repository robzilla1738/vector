# Retained ordinary storage authority

This successor pins ten actual A13-linked Swift inputs and applies 26 counted anchors. `projection.json` records each absolute input/output, input/output SHA-256 and exact replay anchors; `baseline/` preserves the beforeimages. `ordinary-storage.patch` is the paired unified patch. Root integration relocates the outputs to this same repository-relative directory.

With `AUX_BROWSER_ONLY_NATIVE_STARTUP`, ordinary broker validation, authenticated storage-root copying, synchronous account-registry callbacks and provider readiness use the existing retained native capture. Each operation rechecks process/open/unknown lifetime fences, the live native parent, held executable/policy/entry metadata, exact private root/path/marker/reservation/installation/generation bindings, and current initial/target journal bytes under the actual journal lock. Journal owners are initialized once after full capture; ordinary reads neither create lock/journal files nor fsync them.

Full boot admission and the existing `validateCurrentAuthority` secret boundary remain full validation. Legacy captures cannot use the ordinary path. Supervised tasks, automation and addons remain disabled by the existing ordinary build contract; this patch adds no task capability or clean/drain assertion.

Required root-owned C++ pairing:

- `AuxInspectRetainedNativeParentConnection(uint64_t) -> int32_t`: actual retained parent observation; zero only for the open, same-process, live-parent, non-unknown connection.
- Route only ordinary broker/storage wrappers to `AuxNativeContextValidateOrdinaryStorageAuthority(uint64_t) -> int32_t`. Keep secret and other privileged wrappers on `AuxNativeContextValidateCurrentAuthority`.

`source-check.json` records exact source replay, SHA checks, preprocessor balance, unchanged full secret method and read-only journal invariants. No compilation, signing, product execution or runtime acceptance was performed in this lane. Root must compile this paired cohort and verify actual ordinary startup/session behavior.
