# Session rebuild readiness and pre-service shutdown drain

Pinned to native v605. This is a Chromium integration correction and bounded diagnostics, not a new session policy.

Normal Quit calls `ProfileManager::ShutdownSessionServices` from `BrowserCloseManager::CloseBrowsers` before closing windows. The existing UnloadController / OnShutdownStarting drains can therefore run after SessionService destruction. Drain pending supplied 500 ms rebuilds immediately before this common destruction loop. Existing loaded-profile, existing-service and saving-enabled guards remain intact; destructor Save persists the resulting commands using the existing backend.

One log per profile in each explicit-switch delayed rebuild reports only loaded/service/saving/crash-ack booleans and matching native window/cache/tab counts. No paths, IDs, URLs, titles, contents or credentials are logged. This distinguishes an absent service or genuine crash-ack saving gate from bad cache enumeration without bypassing either. A missing loaded profile gets a fixed diagnostic. No steady-state polling is added.

Observed disposable v605 cleartext Person1 session contained one unique tab association after the UI parked two tabs. Encrypted sessions also exist, so that cleartext observation alone does not prove which persisted stream is authoritative or the cause of the loss. The shutdown ordering correction is independently proven but is not claimed to explain loss after a settled 500 ms timer.

Validation: count-checked substitutions and exact preimage/output SHA-256 pins; isolated patch replay. No native build, launch, profile mutation, decryption, or shared checkout mutation in this lane. Integrator should compile the two changed translation units and inspect bounded output from one actual switch before selecting a recovery adaptation.
