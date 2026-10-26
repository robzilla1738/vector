# Signature observation future overlay

Three future sources are composed by `prepare-signature-observation.py`: the startup-corrected selected-state owner strict daemon supervisor, and original owned-child forwarding layer. Applying the signature changes to each old future source produces identical bytes to applying its original future branch rules to the new current source. Exact reverse replay and all original strict ES branches are preserved; hashes and counted anchors are in signature-observation-plan.json.

Future-specific compile targets after current projection/build settles:

- `obj/chrome/browser/aux/platform/AuxSelectedStateHome.o`
- `obj/chrome/browser/aux/platform/daemon_supervisor.o`
- `obj/chrome/browser/aux/platform/AuxOwnedNativePeerChild.o`

Use the new current signature-path headers in their private VFS compile. Reuse final current transport, installation_auth and aux_account API objects from the matching current build. Existing future ColdLaunch object, primary, daemon, strict shutdown drain, early ES and PTY objects remain unchanged. Freeze all final link operands; one future framework link follows. No compile or link has been performed for these overlays.

Retained observation/shutdown review: each asynchronous exchange retains the original extension request, and only one callback/retry exists at a time. After expiry the operation is observe-only. `CallAuthority` returns terminal closed once native selected state is closed or browser_shutdown_phase is nonzero; the API then stops scheduling. An already executing call remains counted in active_authority_reads until it returns. The future strict drain explicitly requires that counter to reach zero. A permanently unavailable live peer can retain an unknown transaction and periodic observation while the app remains live; that is retained custody, not proven settlement. No evidence establishes a new shutdown leak, and no timer/timeout is promoted to physical completion. Actual shutdown acceptance remains required, especially the separate startup11 broker lifetime failure.
