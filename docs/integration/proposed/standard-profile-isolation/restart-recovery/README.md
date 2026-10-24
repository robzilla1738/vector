# Standard profile isolation: clean browser-root reopening

Inactive Swift implementation for the owner's selected **standard browser profile isolation** contract. It preserves actual profile contents and the accepted UI. It does not claim protection against unrelated applications already executing as the same OS user. Browser, daemon and helper work that belongs to Aux must still be genuinely settled; unknown Aux writers remain a refusal.

## Exact selected predecessor

`inputs.json` derives all four Swift paths directly from the actual `runtime-cache-async-relink-a3/plan.json` link command and pins their bytes. The admission predecessor is the protected-startup source, not the older same-named restart copy. The dispatcher is the actual `/private/tmp/aux-browser-admitted-recovery/.../completion/restart` input. `overlay.json` supplies 18 count-one changes and per-file input/output hashes; complete outputs and unified patches are included. The root integrator must compose dispatcher edits with its publisher/lifetime changes rather than replacing the shared dispatcher wholesale. No existing candidate, frozen operand, app, native source tree or staging ledger was modified.

## Marker migration and durable states

The marker filename remains `.aux-browser-startup-lease.v2` so migration examines the existing record rather than creating a parallel lease. The canonical JSON format becomes `aux.browser.recoverable-root-lease.v3`. Fields bind policy hash, root role/device/inode, reservation UUID, generation, phase, `existingData` and `cleanReceiptSha256`. Both records must match all shared fields and their separately bound roles/root identities.

- **Absent pair:** only the exact empty-root inventory is allowed, then write/fsync paired v3 PREPARED records.
- **v2 PREPARED:** require the original exact canonical v2 record and original no-data inventory; migrate both to v3 PREPARED. Old ADMITTED is not silently reinterpreted.
- **v3 PREPARED, fresh:** the same original no-data checks apply through the first grant.
- **v3 CLEAN:** require exact paired canonical records, identities and nonempty receipt digest. Retain all existing browser files. Create a new reservation and consume CLEAN into paired PREPARED records for the current generation before returning the owner. Its inherited clean provenance explicitly permits existing contents. An interrupted pre-grant restart of this PREPARED pair remains possible.
- **Grant:** write/fsync paired ADMITTED records before returning the original unchanged 72-byte native receipt. Existing-content allowance comes only from the inherited clean provenance.
- **Clean completion:** only the actual retained native Owner path obtains an authenticated fresh all-writer report, writes/fsyncs both CLEAN records and validates the resulting pair. No grant can be issued after this owner becomes clean.
- **ADMITTED after interruption, mixed, partial, truncated, unknown or mismatched pair:** refuse and retain all data for later explicit recovery. No deletion, reset, guessed clean state, key/ciphertext reinterpretation or owner-profile access.

Writes poison the in-memory phase before durable mutation. A partial pair remains unknown. The lease lock provides exclusion only; it never establishes cleanliness. Record authentication here means actual authenticated native writer plus private root/policy binding under the selected standard contract, not a cryptographic claim against arbitrary same-UID tampering.

## Required native peer ABI

`AuxCopyAuthenticatedBrowserDrainReport(handle, expectedGeneration, challenge[32], report[128])` is a **required new native implementation**, coordinated with the browser-drain worker. The handle is the private retained live parent connection; no JS path, FD, profile, status mask or PID is supplied. Swift creates the random challenge itself. Status is 0 settled, 1 pending, 2 unknown, 3 refused; only 0 proceeds.

Fixed big-endian response: version u32=1, status u32=0, generation u64 (exact), sequence u64 (>0), phase u32=6, reserved u32=0, exact challenge32, nonzero participant digest32, nonzero process-session nonce32. The full response is hashed into both CLEAN records. **Phase 6, missing peer, process disappearance, successful locking, timeout or a lost ACK is insufficient.** Native status0 must authenticate actual browser/service/descendant and pending-writer completion for that exact generation/connection/session.

The browser worker identified a real lifecycle dependency: current BrowserPlatform shutdown waits for the daemon before final browser services/threads are gone. The final report must come from a retained authenticated native monitor or equivalent real completion path that survives through CLEAN durability acknowledgment. Merely sending a report from an earlier phase would be wrong. This proposal does not fabricate that report or activate a workaround.

## Required native daemon settlement query and integration

`AuxDevelopmentOwnerCleanSettlementStatus(retainedOwnerPointer)` is a required private WorkerHost query: 0 only for the actual matched retained Owner after host admission closes and all relevant environment/async-reader/broker/PTY/exec/PDF/utility/descendant work has physically settled; 1 pending, 2 unknown, negative refused. The Swift Owner supplies its own real pointer. No JavaScript pointer/handle/boolean can establish completion. It must not count the one retained Swift clean-finalization call itself as an outstanding external writer.

The dispatcher implementation additionally requires a retired Entry, active=0, an unresolved browser grant and no unknown native guard outcome. It retains active=1 and the execution lock across physical finalization, verifies genuine OS utility drain, revalidates its captured authority and checks the native owner query again. Only after durable CLEAN completion may it clear `browserGrantUnresolved`. Existing retirement must then release the owner. This exact query, the native final callback/caller and peer transport are root/native-lane integration responsibilities; unresolved symbols deliberately prevent accidental linkage as if this were finished.

Keep the authenticated parent and exact owner alive through the report, physical writes/fsyncs and acknowledgment. Do not move this to a finalizer, PID poll, timeout handler or renderer RPC. Do not change `browserGrantUnresolved` elsewhere to bypass these requirements. No policy/cold/runtime authority flag was unilaterally changed here.

## Evidence and remaining work

One lean `check-source.py` invocation verified every selected on-disk predecessor hash, output hash and exact count-one replay. No native/Swift compile, linked executable, fixture execution, product lifecycle, provider request, signing or owner data access was performed. Parent serially compiles/links the coupled successor once the native report/query/lifetime implementation is ready.

Required bounded acceptance after integration: fresh/prepared migration, clean reopen with real synthetic browser contents intact, interrupted ADMITTED refusal, root mismatch/mixed/partial write refusal, lost-report refusal, pending daemon/browser writer refusal, and owner retention through durable completion. Existing same-UID-hard-custody claims remain excluded, not silently declared solved. Interrupted admitted recovery without a genuine reauthenticated drain remains explicitly unknown.
