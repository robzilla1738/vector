# Native task runtime bootstrap integration

Two actual startup defects in the copied bootstrap are corrected: it required environment-selected `AUX_HOME/runtime` although the current daemon uses native `taskHome/runtime`, and it read a distribution provenance manifest absent from the delivered resource tree.

## Exact package contract

Use `integration.json` for the two explicitly pinned runtime integration leaves. Replace `apps/daemon/Aux Daemon.app/Contents/Resources/native/runtime-bootstrap.cjs` only when its old SHA matches. Add `runtime-text-root.json` beside it only when absent; both mode 0644. The metadata is the minimal historical staged-text root, format `aux.runtime-text-root.v1`, with exact bytes hashed inside the bootstrap. It replaces reliance on the missing full provenance file, without reconstructing or falsifying historical audit records.

Retain all nine runtime text leaves and all static runtime/native executable bytes unchanged. The metadata deliberately names the original stage's `agent-runtime` path: existing `runtime-seed.cjs` reverses those exact text anchors to verify original pins, then relocates into the native-authorized private task home. The metadata is not a runtime destination selector. Updating it alone to the new app location would break reverse pin verification. Bootstrap locates the actual copied `agent-runtime` relative to its module directory, so the app itself may move.

## Authority and lifetime

Immutable native `captureStorageRoots` supplies the separate canonical task home and generation identity. The caller destination must exactly equal that task home's `runtime` child; neither environment nor caller supplies authority. The returned root schema/generations are validated, symlink/canonical mismatch is refused, and roots are recaptured before seeding. Reusing an active operation requires identical owner roots/generations. Native `withBrokerAwaited` retains the seed operation through its original finally/cleanup; no new native ABI is needed.

The original seed implementation still enforces private home ownership/mode, original file hashes, allowlisted text relocation and exclusive cache publication. Its existing partial-cache failure behavior is unchanged; this change does not claim crash repair or universal drain. The ordinary daemon entry remains refused and UI/source-index/linked executable bytes are unchanged.

## Focused verification

`check.mjs` executes the actual successor bootstrap with real temporary bundle metadata, actual pinned runtime inventory and a controlled seed writing only into disposable task storage. It verifies wrong/control-root refusal, ignoring environment authority, active owner-generation mismatch, retaining pending custody, valid pinned historical metadata and rejection of changed metadata before seeding. Native binding and seed body are controlled adapters, explicitly recorded; no real runtime executable, model, network, owner home or application was run. `node --check` passed.
