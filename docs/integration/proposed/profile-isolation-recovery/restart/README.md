# Interrupted pre-grant browser-root recovery

This successor implements recovery of an interrupted **prepared, never-admitted** browser-root pair. It does not reopen a previously running browser session. Actual whole-browser writer drain remains unavailable; an admitted record still refuses restart even when its advisory lock is free.

Two production Swift files replace the previous startup versions: `AuxFreshBootstrapPolicy.swift` and `AuxBrowserFreshRootAdmission.swift`. Policy v8 requires `browserStartup.format = aux.browser.recoverable-root-lease.v2`. Earlier v1-v7 policies remain decodable historical evidence but cannot enter this successor route. Existing v7 marker/state is not silently upgraded. The authority wire, finite72-byte receipt, native owner validation, default-off hook and UI are unchanged.

## Durable preparation and admission

Both actual authenticated native root FDs must still match the exact sealed policy paths, owner, private0700 metadata and no extended ACLs. Both directory inventories may contain only the v2 fixed marker; any Local State, profile content, legacy marker or other file refuses before recovery. Missing one marker, a malformed/truncated marker, a mismatched pair or noncanonical record refuses without repair, unlink or fallback.

Fresh creation uses O_EXCL markers. Existing preparation opens the same marker entries without creation, acquires both exclusive nonblocking native locks, and verifies exact canonical records against the signed policy hash, actual device/inode/role, canonical nonzero original generation and the same UUID reservation. Lock availability supplies exclusion only; the durable prepared state and absence of browser data are the additional prerequisites. All marker/root FDs remain retained by the existing genuine cold-guard/Owner graph. An existing prepared pair is never rewritten merely because it was reopened.

Before the first native browser grant receipt can leave this Owner, its actual `receipt()` method poisons the in-memory transition, writes/fsyncs an admitted record into each held marker, records the current authenticated generation, and revalidates. Only after both durable transitions does it publish the normal72-byte receipt. Later calls on the same Owner are idempotent. A partial write, uncertain final validation, lost reply or lost ACK never causes a second fresh transition or recovery into prepared state. The existing native authority continues retaining unknown browser custody after publication.

A process interrupted before it calls receipt may be replaced using its exact still-prepared pair once native locks are available. A process interrupted during/after publication leaves partial or admitted state, which refuses restart. Therefore this closes a real pre-grant bootstrap interruption case while preserving the unresolved full session-recovery boundary. No clean-drain marker producer is fabricated, and no pid disappearance, destructor, timeout or JavaScript completion is treated as proof that browser descendants/writers are finished.

## Verification and limits

`check-admission.py` runs the actual admission algorithm in newly created disposable directories using an explicit synthetic policy double. It checks live-lock exclusion, prepared-pair interruption/reopen, current-generation publication, repeated same-owner receipt, and refusal of admitted, nonempty and partial roots. It does not authenticate a signed policy or access owner state. `check-policy.py` checks strict v1-v8 decoding, v8-only current-route selection, old-format refusal, root separation, and retained module/signature constraints. The integrator selects these two replacements in the actual48-source Swift graph; those results are separate from synthetic unit evidence.

All work is local and inactive. No accepted app/UI, owner data, keys, permissions, signing, cloud or release state changed. Real protected startup, early Chromium incidental-file behavior, whole-browser clean shutdown, admitted-session reopen, crash recovery after admission and general atomic filesystem mediation remain unfinished. Neither marker locks nor these fixtures establish those broader guarantees.
