# OS start/admission race correction

Root review found that `tracked` could begin a job, lose admission before starting the actual OS request, then synthesize `complete(initial)`. For open-with the initial nil error was indistinguishable from successful NSWorkspace completion.

The actual start boundary now returns nil when its real token cannot admit the request, completing only the unused job. It never invents callback completion. The existing outer tracked method begins the real job and delegates to the same internal token-bearing start function tested by the controlled begin→close→start fixture. No runtime hook, admission boolean or owner/JS interface is added.

The utility core also checks closure after the operation: nested effects refused during a command now return the explicit admission-closed error, rather than partial app lists or synthetic success. Ordinary admitted request results, three/five-second timeouts, cancellation/job custody and native owner drain types/API remain unchanged.

`bash docs/integration/proposed/aux-os-job-custody/check-owned.sh` compiled actual AppKit/QuickLook plus the real owned C dispatcher and passed20 checks: the prior15 integrated checks plus refused-start/drain, mid-list closure and mid-copy closure. The deterministic race uses an actual tracker-minted token closed before entering the production start helper. No OS/Keychain/owner-state action ran. The existing SDK deprecation warning remains in compiled but unexecuted Security query code.

Current composition pins must incorporate the new exact source hashes; historical receipts remain historical. This does not activate any host or change the UI.
