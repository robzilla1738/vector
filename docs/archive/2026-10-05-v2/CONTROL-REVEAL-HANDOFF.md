# CONTROL — reveal the temporary task tab

Source batch based on integration `b1d99aa277464f5f6aa7987cd7fc001255e16157`.
This is a shell repair. CONTROL physical takeover remains unqualified until the
native journey below passes on the integrated build.

## Root cause and repair

Two different paths explained the 0124 visibility blocker:

- Host/CLI bearer RPCs are external clients (`api/server.ts`). Calling
  `pages.activate` goes through `withExternalPage` and tries to acquire a new
  external page claim. The coordinator already owns the temporary task page,
  so `PageOwnership.tryAcquire` returns conflict before `native.focusPage`.
  The public error text hides the internal claim conflict. This batch preserves
  that ownership protection.
- The desktop **Open temporary tab** button called `pages.activate` directly.
  Runtime/catalog activation updated the selected page but left shell mode
  and scrim untouched. `nativePageId` hides native content in conversation mode
  and under the Tasks scrim. The button now uses `store.activate`, which selects
  the exact isolated page, enters focus mode, clears the existing scrim using
  normal shell rules, and sends the current-window native tab command.

The button selects only an isolated page belonging to this run and this browser
window. A temporary page in another window does not substitute an ordinary owner
page or another run's page. Focus does not take control, resume, cancel, acquire
an external claim, or alter controller epoch. The existing activation failure is
shown in the run controls.

The native creation/focus path already uses the minted page ID and owning
TabStripModel. No native, runtime, contract, generated, App, or Settings change
is part of this repair.

## Focused source verification

Run:

```sh
npx vitest run --project unit apps/shell/src/components/RunControls.test.tsx apps/shell/src/components/RunControls.reveal.test.tsx
npm run typecheck
npm run format:check
```

Six distinct shell cases pass across the two files. The three new cases use the
real Zustand store; the positive case mounts the real Stage and PageSurface,
checks its native opaque-content embed, and verifies unchanged run/page/controller
state with no runtime control RPC. Negative cases cover a different window and
a refused native tab command. Native content-ID resolution is mocked: these
cases prove shell routing and rendering, not physical browser input.

Focused lint has zero warnings in the new test. RunControls retains its two
pre-existing warnings (set-state-in-effect and prefer-tag-over-role). The
format ratchet and `git diff --check` pass. No native build or live journey ran
in this lane.

## Integrator journey and ownership

Integrator owns native staging/build, the live fixture and qualification docs.
The shell lane owns RunControls and its two focused test files.

1. On the integrated build, start a disposable run that holds its isolated page
   and has an observable pending action/dispatch ledger. Keep the source owner
   page identity and window recorded.
2. In the actual Aux task/chat interface, click **Open temporary tab**. Require
   the isolated page's fixture marker in the visible native surface and the same
   page ID as the run/lease. Require unchanged `agent` controller/epoch and no
   takeover event. Do not use owner-token `pages.activate` or `pages.takeover`
   as a replacement for the UI reveal.
3. Send the existing synthetic CDP click control to this visible isolated page;
   it must remain agent-controlled.
4. Use a real physical pointer/key on the visible isolated native page. Require
   browser-produced `view.takeover`, increased controller epoch, `human`
   controller, run pause/interruption and egress revocation. Verify no subsequent
   automated dispatch crosses the revoked epoch; retain exact event/dispatch
   evidence. Keep the original owner page unchanged.
5. Exercise **Return**: inspect a fresh page before further agent dispatch;
   uncertain program effects remain reviewable and the old program is not
   replayed. Stop remains reachable while held.
6. Retain one refusal case for a vanished/moved task tab. No wrong page, run,
   Profile or window may be used as a fallback.

The current native producer lives in `chrome/browser/ui/aux/shell_events.cc`
(`PageSignals::DidGetUserInteraction`); it excludes `kFromDebugger` events.
The native focus endpoint itself has no conflict branch: it looks up the page
within its Profile and activates the owning TabStripModel entry. If the live
reveal now succeeds but physical takeover fails, investigate that producer and
runtime `services/page-takeover.ts` using the actual page identity and dispatch
ledger; do not infer qualification from the shell cases.
