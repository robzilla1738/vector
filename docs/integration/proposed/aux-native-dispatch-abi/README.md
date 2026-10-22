# Used native command ABI and remaining bridge work

Read-only review of the supplied 1.26.1016.1852 implementation. No addon execution, authority creation, owner state, Keychain, signing or app launch occurred. `source-pins.json` pins actual inputs and bounded Apple LLVM disassembly. Historical product names below identify immutable supplied evidence; these are not proposed shipped names.

## Smallest real ABI boundary

The original daemon addon registers Node-API **version 8**, exposing `run(command, input)` plus a separate `pdf` object. `run` returns a UTF-8 **JSON string**, not a parsed object or promise. The daemon and CLI both call `JSON.parse(binding.run(command,input))`; their async wrapper runs the same binding in a worker and parses its posted string. Preserve both paths when replacing the module. A replacement returning an object would fail the actual consumers.

| Original address | Contract |
| --- | --- |
| `0x17c0` | Node API version function returns 8. |
| `0x17f4` / `0x182c..0x184c` | Init registers `run`, then the independent PDF exports. |
| `0x1860` / `0x18a4` | Run asks Node-API for up to two arguments. Missing command throws `TypeError("run(command, input) requires a command")`; missing input becomes empty string. |
| `0x1a2c..0x1b34` | ReadString uses `napi_get_value_string_utf8` twice; no JS-to-string coercion and no explicit status handling. The contract is string inputs; do not depend on malformed-type behavior. The evidence also contains a second same-named PDF-local helper at `0x438c`. |
| `0x194c` / `0x1968` / `0x1980` | Calls C Run, copies result into JS string, then calls C Free. |
| `0x49af8` / `0x49afc` | Original exported `AsideNativeRun(const char*, const char*)` forwards to Swift. Each null input pointer becomes empty string; nonnull is decoded as C UTF-8. Swift calls `runCommand`, builds a UTF-8 C string and `strdup`s the result (`0x49ba4`). |
| `0x49bd4` / `0x49bd8` | Original exported `AsideNativeFree(char*)` releases output with `free`. Each returned owned pointer must be freed once after copying. |
| `0x1b8c` | NAPI MakeString substitutes empty string for null C result; the C carrier instead treats null as an error. Do not conflate these error paths. |

A rebuilt Aux Swift module and C exports `AuxNativeRun` / `AuxNativeFree` can preserve this ABI without retaining original Swift module metadata. Every carrier `dlsym`, Node wrapper, module path and packaging hash must change together. This is source reconstruction, not an ASCII symbol swap. The original dispatcher uses a module-global input-lines value and clears it on return; a new implementation must preserve handler parsing while avoiding concurrent mutation of that shared input. Worker use means per-instance/thread behavior requires deliberate review.

Dispatcher `0x48eb4..0x49af8` returns JSON error objects, including `{"error":"Unknown command: <command>"}`; serialization fallback is `{"error":"JSON serialization failed"}`. Native error objects are not thrown across the C ABI. JS wrappers convert load/parse/worker failures into `{error:message}`. Mac installation wrappers explicitly throw on the returned `error` member. A process exit status of zero alone does not establish success.

## Installation commands actually consumed

| Command / alias | Dispatch / original handler | Actual caller input and response |
| --- | --- | --- |
| `install-init` / `init-keys` | `0x4956c` → `cmdInstallInit` `0x34df4` | Mac daemon passes empty input, reads `{scheme,sig_pub,kem_pub}`, translates to `{scheme,sig,kem}`. This is a factory only for proven fresh state. |
| `install-status` / `keys-status` | `0x495f0` → `cmdInstallStatus` `0x3a990` | Mac daemon reads `{installed,scheme}`. **CLI calls the alias but expects `keysInstalled`**; the original alias is not proof of matching schema. |
| `install-meta-read` | `0x4963c` → `0x3b660` | Original dispatch exists; no direct literal invocation in the reviewed JS/carrier consumers. Do not add it to mandatory production scope merely because exported. |
| `dk-unwrap` | `0x4967c` → `0x3bc94` | Mac daemon empty input; reads base64 `.dk` and decodes. Carrier does not expose it. |
| `cdp-sign` | `0x496c0` → `0x40160` | JSON `{challenge:base64}` → `{signature:base64}`. P256 DER / PQ raw signature semantics are recovered separately. Native handler does not impose a universal 32-byte challenge rule; CDP caller does. |
| `get-public-keys` / `public-keys` | `0x49744` → `0x418bc` | `{scheme,sig,kem}`; differs from init names. CLI calls alias and reads `sig`. |
| `install-destroy` / `destroy-keys` | `0x497c4` → `0x43110` | Mac daemon destructive removal path. Never use as migration/fresh-init fallback. No carrier allowlist entry. |

CLI `getCliDeviceRegistration()` runs on both darwin and win32. It requires `keys-status.keysInstalled`, then reads `public-keys.sig`; it does **not initialize keys**, and hardcodes device `installationScheme:"p256_v1"`. With this Mac dispatch’s `installed` response it returns undefined, so a source-faithful bridge must not silently claim CLI device registration parity. Fixing the caller schema/scheme requires a separate paired adaptation rather than changing native status shape blindly. Generic daemon Windows flow additionally uses `ecdh-secret` with `{peerPublicKey}` → `{sharedSecret}`; this command is absent from the reviewed Mac dispatcher and is not an implementation path for Mac unwrap.

The current C carrier is narrower: allowlisted original commands are `install-status`, `install-init`, `get-public-keys`, `cdp-sign`. Its separate `agent-inbox-key` is Aux-owned and handled before loading the supplied addon; it is **not** an original dispatcher branch. Operational commands require explicit carrier acceptance and boundary checks; non-sign commands demand empty JSON objects. It pins the original daemon addon hash, uses the original C export names, copies response text and frees it. The native browser `installation_auth.cc` consumes public-key and signing responses (P256 65-byte uncompressed key; PQ 1952-byte signing key); it parses carrier JSON. A rebuilt Aux-only bridge requires re-pinning these imports and preserving existing admission refusal, not adding a new acceptance flag.

## Other called surfaces: do not accidentally drop them

The daemon also uses dynamic `secure-save/read/clear` with JSON `{key,data}` / `{key}`; reads expect string `.data` or null. These protect Chrome sync material and are independent of the excluded Vault UI. They need an explicit Aux-isolated storage adapter. The recovered four-row installation storage classifier is not that executor.

Direct original daemon literals also include `generate-thumbnail`, `app-icons`, `list-open-apps`, `copy-file`, `open-with`, plus `pick-directory`, `focus-explorer-path`, `install-crash-handler`. The latter names are not all present in this Mac dispatcher; platform guards and compatibility absence handling must remain. Original `status/enroll/unlock/unlock-batch/verify/remove` calls belong to the excluded biometric/Vault surfaces; do not reactivate them merely to copy every export. `session-save/read/clear` dispatch branches exist but no direct reviewed JS literal caller was found. This inventory is a scope boundary, not proof that every dynamic path is uncalled.

PDF registration (`0x2048..0x2110`) exposes `pdf.extractText`, `fillFormFields`, `getFormFields`, `merge`, `renderPages`, `rotate`, `split`. Actual daemon code uses `nativePdf` (nine member-reference occurrences). An installation-only new module can be a **separate** binding; replacing the common binding wholesale must retain or separately route used PDF/OS functionality. The new installation bridge need not rewrite the thousands of unrelated PDFium symbols.

## Fresh installation is separate from existing-authority migration

The current recovered ports import captured **existing** private representations and expected public keys; none supplies a fresh-authority factory, actual Keychain executor, complete JSON dispatcher or Node/C module. Their tests do not prove a fresh install works.

Original `cmdInstallInit` factory evidence (complete function pinned externally in `aux-native-pq-continuation/evidence/install-init.asm`):

| Callsite | Required source-faithful factory / representation |
| --- | --- |
| `0x3545c..0x35490` | `SymmetricKeySize.bits256`; `SymmetricKey(size:)`; root bytes extracted with `withUnsafeBytes`. This is a **32-byte random data root**, not PEM, a string, or a new custom derivation. |
| `0x35614`, `0x35670` | Software P256 signing and agreement `PrivateKey(compactRepresentable:)`; raw private representations at `0x35694` / `0x356e8`. Preserve original factory arguments from the pinned instructions when implementing. |
| `0x35ef8`, `0x362d0` | Secure Enclave P256 signing/agreement factories with access-control and authentication-context arguments; persist opaque `dataRepresentation` (`0x36870` / `0x368d8`). |
| `0x3554c`, `0x363a4` | Secure Enclave MLDSA65 and MLKEM768 factories with access-control/authentication context. Persist opaque data representations (`0x36b34` / `0x36b98`). Availability/selection must remain source-backed; no software-PQ or P256 downgrade. |
| `0x36964`, `0x36c88` | Ephemeral P256 agreement factory for wrapping / MLKEM public encapsulation. Preserve original wrap algorithms and explicit migration of labels; do not reuse HKDF assumptions for PQ. |
| `0x37ca4`, `0x37d48`, `0x39860`, `0x39910` | P256 public X9.63 representations, base64. |
| `0x39d9c`, `0x39e4c` | PQ MLDSA65 / MLKEM768 public raw representations, base64. |

Existing-authority migration must instead import and validate the existing same authority and rewrap under versioned Aux domains. All-absent, inaccessible, malformed and partially present states are distinct: an inaccessible/partial state must never trigger these fresh factories. Original installRead collapses some failure classes to nil, so copying original init’s lossy read behavior is insufficient for safe migration. Original installSave deletes then adds (not an atomic four-row transaction); the migration coordinator must not infer durable commit or rollback from that function.

Recovered source coverage: `aux-native-install-storage-port` supplies query/result classification only; `aux-native-p256-envelope-port` and `aux-native-pq-continuation` preserve existing unwrap/rewrap algorithms; `aux-native-signing-port` preserves existing signing/public serialization; `aux-native-four-row-preparation` prepares captured-memory records without authority creation or persistence. These are usable components, not an executable replacement addon.

## Finite implementation order

1. Build an Aux-named installation-only Swift+C bridge with the exact string ABI, native error envelope and bounded JSON dispatcher; keep it separate from PDF/OS binding until those consumers are explicitly routed.
2. Wire the already recovered existing-authority ports plus strict storage result classification, public-key verification and versioned migration coordinator. Keep stopped-writer/admission gates and explicit terminal receipts; never reset a failed import.
3. Add the source-backed **fresh-only** factory branch and complete four-row persistence, only after proving all records absent under the approved isolated query boundary. Preserve P256/enclave/PQ selection, public encodings, ACLs and 32-byte root semantics. This is necessary for normal new users, separate from migration.
4. Pair daemon/CLI/native carrier ABI/module/hash changes, and separately fix CLI’s observed alias response/scheme mismatch. Route secure-store and any retained PDF/OS consumers without reintroducing Vault.
5. Compile/typecheck and run synthetic software fixtures first. Real Keychain/enclave/PQ execution and acceptance require separately reviewed authorization; this audit grants none.

Verification here is static: source hashes, exact consumer snippets and bounded disassembly. No fresh installation, real authority migration, complete dispatcher or final native compatibility is claimed.
