# Native per-profile feature namespace store

Inactive two-file source proposal for the selected native Aux browser. No selected tree mutation, owner-state access, app launch, signing, release, or cloud work.

## Mount and call contract

Root adds `chrome/browser/aux/feature_store/feature_profile_store.cc` to selected Aux GN and includes the public header at native startup and profile-switch/drain owners. No preference registration or new extension API is required. UI-sequence API is exactly:

- `InitializeForProfile(Profile*)` schedules a real read only after actual native profile/root admission. Call explicitly at the admitted profile startup point. Re-call explicitly after a failed or stale-owner operation settles; no implicit reset/reinterpretation occurs.
- `GetNamespace(Profile*, "downloads") -> optional<DictValue>` returns `nullopt` while uninitialized/loading/refused/foreign/stale; a ready missing namespace returns an empty dict. Read access does not start I/O.
- `CommitNamespace(Profile*, "downloads", DictValue, OnceCallback<void(bool)>)` replaces the whole downloads receipt dictionary. True means the actual atomic file write completed and the native owner remained current at the UI receipt. False is refused/failed/stale/uncertain and requires reload before further write.
- `ObserveReady` fires on attempted load settlement; inspect `GetNamespace`, because a failed read is not readiness. Subscribe before Initialize and also inspect an already initialized value.
- `ObserveSettled` fires after actual I/O + UI completion (or task-post refusal). Subscribe before committing; callbacks can start another operation, so inspect `IsWritePending` again.
- `IsWritePending` includes actual read/write and queued UI settlement. Root adds this exclusion to actual profile switching and browser drain. It does not certify whole-browser drain.

Mount the download subsystem only after a non-null namespace. Its persist callback passes the entire receipts dictionary to `CommitNamespace` and uses the genuine bool receipt. Do not feed a temporary empty value while a load is pending/failed and do not use native preferences as a second authority. The only admitted namespace is `downloads`; expanding it requires an explicit allowlist/schema change.

## File and lifecycle

Fixed native path: `<actual admitted Profile>/Aux Feature State.json`, never supplied by renderer/environment/request. Envelope:

```
{"format":"aux.features.v1","profileId":"<actual UUID>","revision":"<canonical uint64 decimal>","namespaces":{"downloads":{}}}
```

Absent file is valid initial state; it is not created on read. Malformed, unknown/newer format, unknown namespaces, foreign profile ID, unreadable, oversized (8 MiB), symlink/nonregular/hardlinked target are refused and retained. No migration, deletion or automatic overwrite of invalid state.

The native lease captures actual `BrowserPrivateRoots`, admitted browser generation, stable profile UUID and cookie-binding epoch. Only regular exact original profiles are eligible; no incognito redirection. Canonical fixed parent path must remain under the held actual user-data root. All blocking reads and writes use a sequenced `BLOCK_SHUTDOWN` task runner. Reads are bounded through the opened descriptor. Writes reread/validate the existing full envelope and expected missing state/revision/content, then use the actual boolean result from `ImportantFileWriter::WriteFileAtomically` and revalidate roots.

A per-native-path UI slot retains the pending exclusion and observers independently of the profile user-data receiver. Tasks retain the lease/root authority; destroying the receiver revokes further use but does not mark a live task settled. A replacement receiver cannot overtake pending I/O. Completion delivers false after receiver loss or changed epoch/generation; only explicit Initialize after settlement reloads actual disk bytes. A successful stale write may have reached disk; it is not reversed or reported as accepted to a new owner.

These checks do not close the project's broader parent-directory custody, TOCTOU/hardlink, startup-authority or whole-browser drain gates. The final compare and atomic replacement are not a filesystem transaction against another process. The store's CAS is a single-native-owner stale-snapshot check, not a new cross-process lock protocol.

## Evidence

Exact two-file source inventory and patch replay checked. No runtime profile I/O or native compile was performed in this worker. Root owns actual compilation and lifecycle integration. A later authorized disposable check should cover missing-file initialization, a completed download-receipts write/reload, rejection of corrupt/foreign envelopes without replacement, and epoch change/receiver loss while an operation is pending; do not repeatedly launch or run a broad browser suite for this helper.
