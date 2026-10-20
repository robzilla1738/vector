# Original transaction/bootstrap boundary alignment

One-file source-only correction pinned to the actual native232 full-build input. Independent patch/output replay passed; no shared native edit, native compile, runtime, owner state or OS operation occurred.

The new source-backed original gate API takes an actual `BrowserWindowInterface*`. The earlier independent core transaction still called its removed `Profile*` overload for the target before identity transfer. Passing the current browser would check the **source** profile; constructing a pretend target browser or converting unavailable bootstrap state into approval would be incorrect.

The actual supplied `04559f80.c` transaction has no account-bootstrap or Vault admission call. Its real initial checks cover actual Browser/profile availability, normal browser, unload/in-progress state, then original-profile/path equality; it proceeds through the real cache/tab/controller ownership transfer and activates the same real window at success. `source-evidence.json` pins the complete supplied transaction and its admission excerpt. Original startup bootstrap is not the retired independent permanent unlocked-Vault browsing policy.

Remove only the obsolete independent preflight and its now-unused includes. Keep the real transaction eligibility/cold service checks, actual identity transfer, scoped cancellation, rollback, private-auth boundaries and original gate policy intact. The existing `kAwaitingSecurity` enum value is left unchanged to avoid unrelated caller/API churn; this transaction no longer manufactures that result from an unsourced target-profile preflight.

The actual BrowserView `Show` and `ShowInactive` gate entrypoints remain unchanged. `Activate` does **not** call the gate in current source; this patch does not falsely claim that every switch invokes a postbind visibility check or add an unproven activation admission hook. Original force-bootstrap and observed accounts/prefs lifecycle stay owned by the genuine gate/updater. This is faithful removal of the independent preflight, not an authentication bypass: genuine private native/API checks continue to operate separately.
