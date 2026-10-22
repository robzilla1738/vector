# Composed candidate archive and durable selection store

This closes the actual source-composition gap: candidate recovery and durable selection previously each supplied a separate successor definition of `PrivateInstallationJournalStore`. They could not both be compiled as separate source files. The committed output here is **one logical Swift file**, consisting of the exact audited store baseline, exact archive continuation, then exact selection continuation. It contains exactly one store class definition, with same-file private access as ordinary Swift source. No unrelated Swift files are joined, no access modifier is weakened, and no test-only concatenation bypass exists.

`composition.json` pins ordered input roles, paths, SHA-256 values and byte lengths, plus exact output hash/length and one-definition count. `composition.mjs` exports `composePrivateInstallationJournalStore()` returning verified assembled source and its fixed output URL; it does not write any file. The committed successor and unified patch are reviewable. `verify.mjs` requires exact output byte equality and all source pins. The manifest is source evidence, not authority provenance or launch authorization.

## Concrete source set

Compile `source/PrivateInstallationJournalStore.swift` instead of **all three** baseline/archive/selection store copies. Retain the candidate recovery successors for `CapturedInstallation.swift` and `AdditiveInstallationTransaction.swift` instead of their baselines. Include `InstallationCandidateArchive.swift`, `InstallationSelection.swift`, command-core and captured-terminal sources plus their pinned native authority/envelope/storage dependencies. `check.mjs` enumerates this complete set using the reviewed terminal source list, applies only exact three logical-file substitutions, and compiles each logical source separately with `swiftc`. Current fresh factory/journal source dependencies are those integrated on main 1402b8576, including their earlier identity/scope fixes; no stale private-source copy is substituted.

No dispatchers, N-API activation, native host, authority executor, startup consumer, packaging, signing or UI inputs change. The native-host provider/admission boundary remains external. Software synthetic crypto is executed; enclave/PQ recovery merely compiles as existing dependency code.

## Focused composed flow

`node docs/integration/proposed/aux-authority-selection-composition/verify.mjs`

`node docs/integration/proposed/aux-authority-selection-composition/check.mjs`

The smoke builds actual separate files and passes 46 assertions with real private disposable filesystem I/O. Fixed synthetic authority and DK stay in memory. The complete flow is:

1. Prepare an existing software P256 installation candidate from four synthetic captured legacy rows; create its immutable ciphertext/public archive in the private transaction directory and persist the actual additive reducer's initial checkpoint.
2. Persist the first row intent, observe its captured target, then reopen the real store before a success status has been persisted. Reload the archive, recapture the original rows, cryptographically verify the exact old/new root and public continuity, and reconstruct the original candidate without random rewrap. Reconcile the exact observed target under its prior intent; do not replay Add or invent a recovered Add status.
3. Continue the actual reducer with that recovered candidate and persist every authority transition until ready. Reload and recover the archived candidate again, then construct the actual authenticated `CapturedTerminalCommandContext.existing` from the durable ready checkpoint and current captures.
4. Bind and publish the new descriptor through durable select intent, pointer rename, reopened-store observation of the uncertain intent, and explicit terminal completion. Roll back the descriptor through its own durable intent and completion. No state2 admission is issued in any phase.
5. Verify the exact archive still exists unchanged, both public keys and wrapper match, raw private key/DK bytes are absent from the archive, and initial, partial/uncertain and terminal authority/selection records remain retained. Corrupt-pointer and blocked-terminal checks from the selection fixture remain; favorable later bytes cannot unblock the transaction.

No actual Security, Keychain, SE, PQ or owner-state operation occurs. In-memory captured row maps are not a claim of a real Keychain add. Reopening store instances models restart/reload but is not a process-crash durability certification or OS all-writer fence.

## Preserved limitations

Initial archive or selection publication can leave preserved partial/orphan evidence requiring manual review. Individually fsynced renames are not a multi-file atomic transaction across archive, authority, state cohort and selection. Private cooperative locking cannot fence uncooperating writers. The previous/content-manifest descriptors remain asserted content anchors, not proof of old authority availability or complete SQLite/renderer migration. Descriptor rollback does not restore or authenticate data.

No persisted receipt, checksum or this source composition supplies genuine source capture provenance, effective entitlement review, native/browser/renderer/descendant custody or readmission. `state2LaunchAuthorized`, `writerAdmissionVerified` and `authorityProvenanceVerified` remain false. There is no active native consumer for the external selection descriptor. The accepted app and all current state2 refusals remain intact; real runtime authority, independently verified state cohort and native before-state admission must precede activation.
