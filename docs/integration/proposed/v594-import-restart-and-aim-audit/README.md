# 594 restart/import and AIM readiness audit

2026-10-21. Source-only audit plus authorized read-only inspection of **synthetic URLs only** in the existing disposable Default profile. No app launch, API request, import, database write, source modification, signing or UI change.

## Launch boundary

The accepted-startup native code preserves arbitrary unrelated environment variables and logging switches. It removes only five explicit probe keys, adds the accepted profile/data-dir switches and sets the existing Aux home/scope. It does not strip `AUX_IMPORT_FIXTURE_HOME` or `--log-file`.

The earlier launcher checked absent listeners, started a detached child and reported success immediately. It did not prove absence of another browser/singleton, survival of the child or ownership of45203. `getApp` could then activate/launch a different process. That is a hypothesis for83739/83774, not proof of native relaunch behavior. Root subsequently reported successful92773 launch by keeping the exec session alive through `p.wait()` and waiting for PID/listener proof before CUA attachment. Retain that sequence; do not patch native startup for an unproven environment-loss issue.

A reliable acceptance launcher must pin the accepted receipt/app, require no existing exact-app browser or isolated listeners, retain/supervise the child, confirm exact PID/executable and sole45203 ownership, then verify only Boolean fixture/log-switch matches from its environment/command in memory before attaching CUA. If the child exits, report failure; never silently substitute a new process. Do not log the full environment or arguments.

## Persistence observation

The approved disposable `Default/Bookmarks` contains the synthetic bookmark with its correct title and `Aux Import Fixture` parent. `Default/History` main database contains both synthetic URLs with exact titles and visit counts2/1, hidden=0, and one stored visit row each. Ordinary read-only SQLite access reported locked while the browser was live; read-only immutable access inspected the main committed file and did not claim a snapshot of live in-memory/pending state. No non-fixture URL/title was printed.

This establishes committed fixture data exists; it does **not** establish the failing API probe queried that same profile. The current client selects the first matching Agent/newtab target from `/json/list` across the entire browser, with no profile/window/account correlation. A wrong target is therefore a concrete harness weakness and plausible explanation, not a proven diagnosis. Bind destination verification to the original Default profile's exact window/tab or positively establish the target's native profile identity first. Split bookmark and history result flags to identify the failing category rather than returning one aggregate false.

The `after-restart` branch performs no importer/source-discovery call, but currently requires the source fixture environment anyway. It can use a separate exact-app/PID/accepted-profile proof plus destination-only URLs; keep the stronger fixture environment/inventory proof mandatory for `import`. Removing that unnecessary condition must not weaken actual importer discovery confinement. No new import is needed: the original test data remains committed.

## Actual used-AIM source trap

591/594's `OnAuxRetirementState` stores `aux_settled_` only if the combined renderer/native answer and native recheck are already true. If the original renderer reset is complete while a query, navigation, upload or other tracked owner is temporarily busy, the single reply fails. Later native completion does not send another settlement reply; `CanRetireUnusedForAuxProfileSwitch` then permanently rejects until a fresh open/close cycle.

The correct repair separates **renderer-reset generation proof** from **live native ownership**. Preserve proof only for the closed generation after original draft restoration and same-pipe reset acknowledgment, and evaluate actual native work afresh at admission, or trigger another bounded acknowledgment from exact owner-completion callbacks. Do not mark a busy owner settled, clear pending counters or relax preserved-context rules. The current combined bool cannot distinguish intentional retained context from merely transient native work.

Previously used file selector and persistent Drive disclaimer/sign-in controller objects remain conservatively rejected. Those need their own real idle/retention contracts if exercised; no evidence here justifies bypassing them. No source patch or build was performed in this audit.
