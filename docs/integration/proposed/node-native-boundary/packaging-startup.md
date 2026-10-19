# Packaged startup prerequisites

This proposal performs no native load, Keychain operation, grant or shared source edit. Current build handles31341/27971 remain live behind the browser build lock. `build-inventory.json` records exact source hashes and absent current output hashes. Regenerate it with `node vendor/provided/native-packaging-manifest.mjs` after compilation; output presence/hash alone is not verification. Do not substitute earlier binaries from the parent inspection directory.

## Fixed layout and launch order

All paths below are relative to `Aux.app/Contents/Resources/aux`:

- `native/aux-native-carrier` and `native/libaux-native-boundary.dylib` are new compiled outputs.
- Both `apps/daemon/Aux Daemon.app/Contents/Resources/native/` and `apps/cli/Aux CLI.app/Contents/Resources/native/` contain `aux-native.cjs`, `aux-native-guard.node`, and unchanged `provided-native.node`.
- The original addon SHA256 is `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`. Preserve its bytes/signature. The mapper fixture is a build/test artifact, never a runtime dependency.

Before exec of either SEA host, the native launcher must validate the fixed canonical in-bundle boundary dylib and replace DYLD_INSERT_LIBRARIES with only that path. Pass canonical owner-only AUX_HOME. Do not inject an acceptance flag automatically; native execution is pending compiled isolation proof and reviewed authorization. Node prelude environment mutation is too late to establish injection. The CJS guard verifies actual imported Security pointers, configures immutable home scope, then loads only the fixed pinned addon. Worker and PDF paths use the same guarded CJS.

The browser carrier proposal likewise uses only fixed canonical bundle descendants, a minimal environment, bounded input/output and five-second timeout. HTTP signs the domain-prefixed challenge; CDP signs raw32 bytes. It forwards original signatures and original installation schemes. Both host and carrier must ultimately share the same actual Aux DP authority. Original-group omission under different host signatures does not prove common storage; ad hoc entitlement errors remain genuine failures. No PEM or file-Keychain fallback is acceptable.

Sign only modified/new code individually (guard, dylib, carrier, changed SEA/helpers and outer app). Do not deep re-sign immutable provided addon or signed-catalog memory binaries. Capture final hashes after individual signing; compile inventory hashes precede signing and are not distributable artifact hashes.

## Memory provisioning before daemon launch

The pinned compiled daemon sets LOCAL_MEMORY_MODEL_DIR and LOCAL_MEMORY_EXECUTABLE to undefined and ignores the development model override. It reads `AUX_HOME/memory-catalog.json`, `models/`, and `memory-runtimes/`. A read-only bundled-root env alone cannot provision it faithfully. Its MemoryCatalog verifies the signed envelope, prefers a higher-sequence fetched catalog, and uses verified cached catalog after real fetch failure. ModelDownload keys caches by descriptor SHA256, uses a UUID generation and CURRENT pointer, checks manifest equality and file size/hash before reuse, and retains genuine download/signature errors.

Root's current `seedProvidedMemory` is intentionally new-home-only and rejects an existing home. Keep that guarantee until an explicit merge implementation is reviewed. Native startup can seed a freshly created home from fixed `memory-distribution` using an embedded pinned allowlist before launching the daemon. The native implementation must validate source descendants/no symlinks, regular-file modes/sizes/hashes, use a private staging sibling and exclusive destination publication, and propagate failures. No accounts/users/credentials/native identity files belong to this allowlist. Do not run an external Node executable merely to invoke the current developer script from production startup.

For an existing home, propose absent-only versioned cache merge, not overwrite: retain an existing catalog byte-for-byte and let the original loader verify/update it. For each bundled descriptor-hash cache, publish the entire verified pinned directory only if absent (exclusive publication, never replace an existing directory/CURRENT). If the hash directory already exists, leave it intact and let the loader validate/download; never repair its CURRENT or replace its files behind a live daemon. An absent catalog may be copied exclusively after all source pins validate. Refuse symlink/nonregular destinations and report the actual error. Newer cached catalog may select different assets and legitimately need download; do not claim bundled assets guarantee offline success. Do not prune caches during startup. Serialize provisioning before owned daemon start; no directory-wide copying of an existing home.

This is an exact proposed policy, not implemented native provisioning or an observed existing-home test. Integrator owns the shared startup hook and must record its eventual fixture evidence.

## Nested password importer

Static pinned SEA has zero ASIDE_PASSWORD_IMPORTER_PATH or AUX_PASSWORD_IMPORTER_PATH consumers. Its resolveBundledApp searches executable sibling, then `Contents/Applications`, then `Contents/Resources`. Preserve `apps/daemon/Aux Daemon.app/Contents/Applications/Aux Password Importer.app`; the counted proper-case adaptation selects that name. Remove the obsolete independent supervisor override rather than duplicating the nested app. This is static path evidence, not an importer launch or OS permission test.
