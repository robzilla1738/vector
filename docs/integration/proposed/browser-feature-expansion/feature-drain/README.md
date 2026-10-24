# Native feature I/O drain participant

Count-checked **source proposal**, not an integrated/compiled/run claim. Root owns all shared files and GN registration. Preserve newer root edits while composing this patch.

## Actual coverage

- A process-lifetime, mutex-protected registry owns pending records independently of Profile, KeyedService, UI receivers and windows. Native operations hold shared tickets; dropping an unfinished ticket leaves a pending/abandoned record. Cancellation and destructors never imply successful settlement.
- Organization snapshot bootstrap reads/migration and later writes, and FeatureStore reads/writes, acquire tickets before submission. Actual worker completion settles the ticket; a definite posting refusal settles as refused. Existing native roots/write lifetimes remain held by their tasks. Same-profile snapshot generations cannot overtake a pending older receiver.
- Existing FileOperationLifetime registers a transaction spanning download preparation, actual exclusive move/recovery and journal completion, or chosen-file fingerprint/journal completion. Its existing physical completion checks remain intact. Admission failure returns to callers before dispatch. Pending flags and final callbacks continue to outlive Profile user data.
- Migration quiesce closes new-feature admission before requesting helper/native authority closure. Closing requests revoke the real existing file-operation authorization flag. In-flight tasks remain pending until their actual completion; a lost reply stays unresolved. Snapshot writers also recheck ticket cancellation before writing.
- Ordinary native shutdown and explicit selected-home admission closure close feature admission too. BrowserShutdownObservation and OwnedBrowserQuiesceObservation contain raw feature counters. The existing whole_writer_drain_proven value remains **false**. No old startup/custody gate is enabled and no new whole-profile cleanliness claim is made.

## Observation semantics

The observations expose admission_closed, pending, settled, refused, uncertain, abandoned and wrong_process. Completed means the registered operation actually ended; it does not claim storage durability. A failed attempted atomic write is uncertain. A cancelled/pre-submit refusal is refused. An uncertainty remains visible after pending reaches zero. Quiesce callbacks can return such observations; consumers must not turn callback arrival or zero pending alone into a cleanliness certificate.

Shutdown cannot admit a new snapshot receiver. Native path keys come only from actual Profile::GetPath(), are never read/opened by the registry, and are not returned in observations. These records are bookkeeping, not file access authority. Existing authority/root validation remains mandatory.

## Integration and verification

Register feature_write_participant.{h,cc} in the selected Aux native target available to AuxSelectedStateHome and UI file-lifetime sources. Add the single focused unittest only to an appropriate native unit-test target; it is authored **not run**. It checks receiver loss with retained real work, same-profile snapshot serialization, cancellation flag revocation, no premature quiesce callback, late settlement, and explicit uncertainty.

Native compilation and runtime drain/cancellation acceptance remain pending. Patch replay/hash checks are structural evidence only. No app was started/stopped, no owner state was read, and no signing/provider operation occurred. Existing broader native/file/service writers, startup authorization and whole-root custody remain separate unresolved obligations.
