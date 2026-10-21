# Native597: original cache scrim completion

Source-only proposal; four files, eleven count-checked edits. No shared mutation, build, runtime, UI change or signing.

## Observed cause

Actual597 first selection reached target `tab.scrim-timer` / `window.tab-owner-or-state` after the existing two-turn setup continuation. A later selection after timer completion switched successfully. Original Actor attachment invokes default UI updates that reset `update_scrim_background_debounce_timer_`; queue turns alone do not finish that timer.

## Original event, unchanged guards

After the existing fresh-cache setup handoff, the request finds only the source/target fixed caches belonging to the exact source window workspace. It registers once on each existing Actor tab whose original scrim timer is running. It does not start, stop, reset or accelerate a timer. Each owner posts its notification only after original `UpdateScrimBackground` completes and its callback-depth scope exits, including its original early-return case. Controller destruction posts failure, so a destroyed pending owner cannot count as settled.

A single barrier joins those exact notifications. It then attempts one fresh complete transaction, with cache continuation disabled. Every pending callback, task, timer, scrim, identity, window-lifetime and other original guard still applies. A restarted timer or other work can still reject; successful event delivery is not sufficient for admission. There is no polling, synthetic success, duration assumption, arbitrary delay, retry loop or permanent historical-use flag. The bound is one observer per timer already pending at setup and one final attempt; a user-induced timer reset follows the original timer lifecycle.

## Lifetime/completion

Window/source/target are weak references, and the existing per-window request generation is checked before subscription and again by the original final request path. New selections or profile changes invalidate old completion. Raw tab controllers are used only during synchronous registration; registration never invokes completion synchronously. Timer/destruction notifications retain callbacks only. Final completion is moved through one barrier to either failure or the existing activation/success path, exactly once. No Actor owner or profile is retained just to wait.

The existing initial setup queue handoff remains to allow original attachment work to establish its timers. The event observer specifically closes the confirmed scrim-timer gap rather than replacing the entire admission mechanism.

## Validation/limits

All native597 baseline/output hashes and patch applicability checked statically. No compile/runtime claim. Integrator should build once and exercise first selection into a fresh cache, back, and no new fatal/identity rejection. The reported missing active new-tab sidebar row is a separate UI refresh issue, untouched here.
