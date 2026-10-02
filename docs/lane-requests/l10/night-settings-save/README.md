# Night Shift acknowledged settings save — source freeze

Worktree `/tmp/aux-browser-runtime-l10-night-save`, branch `codex/trust-night-save`, base `918e0f93110147b869d414c6e7aa35b4e726f18f`. Apply exact three-leaf request.patch and verify manifest baseline/result SHA-256. Earlier PAUSED-HANDOFF/draft-pins describe the historical pause only; this README and manifest supersede their unverified status.

NightSettings now awaits the actual registered configure-night-shift command, whose production handler awaits settings.set and its governed authority-retirement acknowledgement before changing shell policy. In-flight fields and Save are disabled. Rejected saves display the failure and retain the edited policy for retry, with no unhandled rejection or optimistic success. No command, API, authority, or receipt semantics are replaced.

The real native overnight journey now reads back exact enabled/start/end/nightly/per-task values before Escape/queuing, and waits for the acknowledged Save label to return. Original assertions, deadline, TimeField/HID behavior and owner-only queue/Apply paths are unchanged.

Evidence: baseline RED two real-command cases with one actual unhandled bridge settings.set rejection; GREEN two cases. Tests execute the actual command registry, feature handler and shell bridge call, with a fixture-held/rejected native response; they do not replace the command implementation. Feature fixture enables only overnightReview for this source test. Held ACK keeps the saved shell policy unchanged, locks fields/Save and prevents a duplicate click; exact ACK publishes the new policy. Rejected response preserves edited values, displays the actual error and allows a same-command retry.

Workspace tsc-b and shell tsc-p PASS; focused oxlint zero warnings/errors; format ratchet PASS; node --check autonomy.mjs and git diff --check PASS. No runtime source changed. No native builds/launches/Stable operations/physical journeys performed; native retirement and real UI readback qualification remain for the sole builder’s next coherent candidate. No owned processes remain.
