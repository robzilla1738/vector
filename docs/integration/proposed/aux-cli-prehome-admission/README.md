# Packaged CLI admission before Aux home mutation

This source-pinned proposal changes only the reviewed native CLI exec wrapper, adds a private marker-policy header and a synthetic native fixture. It does not edit active vendor/native sources, native checkout, GN, manifests, current package or build receipts. Root must integrate and rebuild the exact boundary before claiming that a new package contains it.

## Boundary and behavior

The wrapper resolves its own fixed packaged resource root, then calls `MarkerAllowedAt(root + "/bundle.json")` before reading `AUX_HOME`/`HOME`, creating or validating any home, calculating its scope, changing loader environment or executing the supplied SEA. Marker refusal is terminal; there is no environment, command-line, process-type or acceptance-record bypass.

The code after the new guard, beginning with the original `AUX_HOME` lookup, is byte-identical to the original. State1 therefore retains its existing home/scope/exec behavior once the immutable bundle passes admission. State2 and unknown generations fail before any mutable home operation. UI, branding artwork, credentials, Keychain operations and SEA internals are not changed.

This proves only the new wrapper's pre-home refusal. It does not stop old wrappers or other processes, implement migration, establish descendant custody or produce an all-writers receipt.

## Marker policy and bounded read

The policy matches the compiled browser's existing defaults and meaning:

- Valid RFC UTF-8 JSON dictionary, bounded to 16 MiB; required integer `version:1` and string `implementation:"supplied"`.
- Missing identityProfile defaults to compatibility. Explicit profile must be `compatibility` or `aux-v1`, and a string.
- Missing stateIdentityVersion defaults to 1. Explicit state must be the integer 1; bool/string/null/array/float/exponent/state2/unknown values refuse.
- Duplicate decoded top-level keys refuse, including escaped spellings and unrelated/empty keys. Nested metadata does not define the outer generation. Unknown metadata and acceptance flags cannot authorize state2.

Foundation decodes strings/JSON, but a bounded RFC syntax pass precedes it so framework leniency cannot admit comments, trailing commas, nonstandard numbers, multiple documents or other encodings. Numeric identity/version lexemes remain exact rather than coercing NSNumber values. UTF-8 is round-tripped exactly; BOM and invalid byte encodings refuse. The grammar's maximum 200 container levels is pinned to Chromium's `base/json/json_common.h`. Duplicate-key detection preserves embedded NULs instead of truncating decoded names.

Marker paths must be absolute and already canonical. Open uses **O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK**, so a FIFO cannot block before fstat. The reader requires a regular, single-link, positive bounded file, owned by the real user or root and not group/other writable, before allocating/reading. It checks complete bytes, extra EOF and before/after dev/inode/size/mode/uid/link count plus mtime/ctime seconds/nanoseconds. The marker reader never reads an Aux home or environment. These are the browser header's file constraints; they are not a new cryptographic package-authority claim.

## Artifacts and integration

`manifest.json` pins the original wrapper, three proposed output files, exact patch, existing browser policy header and browser maximum depth. `admission.patch` is baseline/output review, not applied code.

After source review, root should install the proposed wrapper/header and add both plus the fixture source to the exact native packaging inventory. The existing boundary build already links Foundation. Compile the wrapper and fixture through the same serialized boundary build using the **frozen runtime Node headers** at `out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node`, not an owner-installed default. No new Keychain mapping, carrier signing or provisioning is needed for this source slice. The new fixture can compile with `xcrun clang++ -std=c++20 -fobjc-arc -framework Foundation packaged-identity-admission-test.mm` under the owner build lock; root owns exact manifest/artifact/receipt integration.

Do not accept an old boundary receipt after replacing wrapper bytes. Package the rebuilt wrapper at the existing final `aux-cli` path and preserve the paired `aux-cli-sea` flow. Retain quarantine until all separate startup/writer/crypto gates are accepted.

## Lean evidence and remaining checks

`node docs/integration/proposed/aux-cli-prehome-admission/check-source.mjs` passes exact source pins, unchanged post-guard code, marker-before-getenv/mkdir/exec ordering and reader invariants. `git apply --check --directory=docs/integration/proposed/aux-cli-prehome-admission/baseline docs/integration/proposed/aux-cli-prehome-admission/admission.patch` passes.

The native fixture contains 41 tiny in-memory policy cases and seven synthetic private-file checks: canonical valid marker, symlink, hardlink, writable mode, FIFO, missing path and relative path. It creates only a fresh `/tmp/aux-marker-fixture-*` directory; no actual Aux home or owner state. It does not execute the wrapper, SEA, helper, Keychain or network call. Namespace spoofing, escaped duplicate keys, defaults, type errors, state2/unknown refusal, RFC syntax and UTF-8 cases are explicit.

The native fixture is **not compiled or executed in this lane**. Root must compile/run it and compile the real wrapper before acceptance; Foundation decoding/API differences must be fixed, not hidden by weakening marker checks. Wrong-UID and concurrent metadata-race fixtures remain unsupported here; the reader's explicit ownership and before/after checks are source-verified only. No all-writer custody is claimed.


## Integrated boundary and actual packaged refusal

Root applied the three count/hash-checked files, registered header/fixture in the native source inventory, and extended the serialized boundary build and state2 package gate. The full boundary rebuilt with frozen snapshot Node headers, and the 41-policy/7-file fixture passed once. Receipt: `out/provided-native-cli-admission/native-build-receipt.json`. This does not revise the source-only lane's historical manifest execution fields.

The separate candidate `out/provided-candidate-aux-cli-admission/Aux.app` packaged successfully with the unchanged Chromium framework and Agent revision10. Actual packaged checks preserved all135 visual assets/five stylesheets and parsed12 modules. The **actual packaged native CLI wrapper** was then executed once with a private disposable HOME/AUX_HOME, actual state2 bundle and the existing carrier opt-in set. It returned the exact pre-home refusal, created neither directory, changed no marker/executable bytes and never reached SEA or browser startup. No Keychain operation or native authority was invoked. This is narrow wrapper acceptance, not whole-app runtime acceptance, writer custody or migration activation. Exact receipts/probe are in `packaged-evidence/` and `out/aux-cli-admission-packaged-evidence.json`.
