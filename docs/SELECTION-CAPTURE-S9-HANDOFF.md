# Selection & Capture — S9/NATIVE source handoff

Date: 2026-09-29. Source base: `3f9c76dc7fbfa62ae2b2c4272aab5320a3d8d0ca` (Models source batch, based on integration `516bac37`). This is source delivery for the missing seventeenth required Settings outcome. **It is not native qualification and does not close S9 or NATIVE.** No native build, native source edit, paid model request, external-app capture or owner-data action was performed.

## Owner outcome and contract

The owner can maintain up to twelve ordered, enabled/disabled selection actions, each with a stable ID, short label and a bounded prompt template. `{text}` and `{code}` substitute quoted selected content; `{image}` requires actual captured image bytes. Substitution is single-pass and cannot execute a page script or interpret tokens found inside selected text. The section previews synthetic content locally. An action opens a draft for owner review; it never sends automatically.

`settings.get.selectionCapture` contains:

```ts
{
  revision: number,
  actions: Array<{ id: string, name: string, enabled: boolean, template: string }>,
  inlineAssist: boolean,
  selectionDoubleTap: CaptureHotkey | null,
  regionCapture: CaptureHotkey | null
}
// CaptureHotkey = { key, command, ctrl, alt, shift }
```

Both capture shortcuts default to Off. Inline assist retains the existing enabled default; the existing explicit capture → draft → review → Apply boundary is preserved. Malformed stored preferences disable actions and capture rather than silently enabling defaults. `settings.set` compares the supplied revision and persists `revision + 1`; a stale window receives a conflict. The serialized settings writer and Profile repository persist the canonical result. No selection, screenshot or field content is stored in these preferences. Shortcut conflicts are checked against the shared command registry, including later shortcut-override changes.

The leaf preserves unsaved edits after failure or an external revision, and offers explicit reload. Save acknowledgement is separate from native shortcut registration. The optional `SelectionCaptureNativeStatus` prop reports the exact saved revision plus registration/error per shortcut; an absent/stale receipt says registration has not been confirmed.

## Delivered files and application boundaries

| Area | Files / behavior |
| --- | --- |
| Contract | `packages/contracts/src/selection-capture.ts`; narrow `api.ts`, `entities.ts`, `index.ts` additions. `PageQuickAction` gains optional `documentEpoch`, `sessionId`, `selectionActionId`; the strict new consumer requires matching document identity. No new RPC or host method was added. |
| Runtime settings | `apps/runtime/src/services/settings.ts`: validated preferences, Profile persistence, revision conflict and shortcut collision refusal. |
| Inline assist | `apps/runtime/src/api/methods/agent.ts`, `services/pages/inline-assist.ts`, shell `components/InlineAssist.tsx`: enabled/revision guard across queued capture, page-read await, model dispatch/result and queued insertion. A capture retains the original guard, so disable→reenable cannot revive it. Cancel remains available while Off. Late renderer results are discarded. |
| Source policy | Existing `evaluateOriginPolicy` checks exact source origin for read, model egress and write, including managed/user deny precedence and local `never` ceiling. Explicit source `ask` fails closed: this leaf has no source-approval flow yet. Audit contains origin/effect/decision, not captured text. Private/caller identity still requires native admission; this source change does not qualify that boundary. |
| Section | `apps/shell/src/settings/sections/SelectionCapture.tsx`: searchable field metadata, keyboard-operable ordered editor, local preview, shortcut recorder, explicit Save/recovery and inline toggle. |
| Draft consumer | `apps/shell/src/selection-action-draft.ts`: pure `prepareSelectionActionDraft` returns `{draft, source, actionId, needsImage}` only for a matching native window/page/session/document epoch. Refuses Private, loading/navigation, moved/controlled/missing tabs, removed/disabled action and missing image bytes. It does not create a chat, attach an image, fetch an image URL or send a model call. |

## Integrator assembly (not edited in this lane)

1. Mount `SelectionCaptureSettings` in the Settings router/rail under **Selection & Capture**, with `settings`, the existing canonical settings-save callback, and `active`. Add its real route/search metadata. Extensions remains an extra supported destination; it must not substitute for this required section. The already passed Appearance reload and General/Appearance Back/Forward gates stay closed.
2. In `App.tsx`'s `onPageAction` handler, keep the separate reviewed Memory `remember` path. For other actions, call `prepareSelectionActionDraft({action, pages: state.pages, preferences: state.settings.selectionCapture, windowId: bridge.windowId, privateMode: bridge.privateMode})` **before** creating a chat or artifact. On error, show the recoverable message and stop. Do not retain the old fallback that opened an unattached draft after an identity failure.
3. Use the returned exact source for both primary context and browser sources, and the returned text for the draft. Attach an image only when `needsImage` is true, using the existing `conversations.images.add` validation/storage path, then open the review draft. Do not fetch `srcURL` or silently downgrade an image action when capture failed. If native image attachment fails, report failure and preserve a reviewable unsent state.
4. The new event identity is required before enabling this consumer for existing native producers. Custom actions use `selectionActionId`; the legacy `action` enum remains `ask|explain|summarize|image|remember`. A custom text action may carry `action:"ask"`; its configured ID selects the template. No fallback to another action when that ID disappeared or was disabled.
5. Regenerate bindings once with the integrator's current contracts. The lane regenerated locally for typechecking because its base lacks the already integrated `memory.paste.*` authorization rows; generated files are excluded from this commit.

## Native seam and remaining decisions

- Current Chromium producer observed in `chrome/browser/ui/aux/methods/window_methods.cc`, `WebUIBrowserUI::ExecuteCommand`, sets `pageId`, URL/top URL, title, capture time and window ID, but does **not** set epoch/session. Add browser-derived `documentEpoch` and the same `sessionId` as `PageTarget` at capture time; recheck active owning tab and document before emission. `aux::TabCatalog`/PageIdentity is the authority. Broadcast only through the originating Profile; shell window filtering alone is not native authorization.
- Configured menu production must preserve the saved action order/IDs/enabled state and snapshot the selected action from the current canonical revision. A menu left open across preference/navigation/Profile change must refuse or rebuild. Native selection must remain bounded at 12,000 characters with explicit truncation. Sensitive/password/managed-denied/Private sources must not produce capture bytes or model context.
- `chrome/browser/ui/aux/quick_ask_controller.{h,cc}` and `methods/window_methods.cc` implement the separate existing Quick Ask global shortcut/window. New selection-double-tap and region-capture registrations are **not implemented here**. Native owns actual OS registration, collision/failure reporting, Profile/window routing and cleanup. The integrator must define the native status RPC/event returning `SelectionCaptureNativeStatus`; do not synthesize `registered:true` from a saved preference.
- Double-tap admission must require two distinct presses of the same modified chord within one bounded interval; held-key repeat must not count. Reset pending gesture on focus, Profile or document change. Region capture must open an explicit picker, support Escape/cancel, and only attach the selected result after review. Native receipt must identify the saved revision it applied and deregister superseded/Off shortcuts.
- The helper supports **browser-page** selection/capture only. Capture from another app cannot be represented as an invented browser-page source; it needs an explicit native capture/provenance contract and owner review. Existing Quick Ask does not automatically capture other apps.
- The runtime uses a Profile-scoped repository, the shell checks exact window and document identity, and external inline-assist callers remain refused. Native Private/managed admission and caller Profile/window validation are still acceptance blockers. Inline source policies requiring `ask` are unavailable until a real approval flow exists; they are never treated as allow.

## Focused native acceptance batch

Use a disposable Profile with two windows, another disposable Profile and one loopback page containing safe text/code/image, a normal editable field, a password field and a sensitive-marked field. Use a local synthetic model fixture; do not use the owner's Gateway credential for this journey.

| Journey | Required observation |
| --- | --- |
| Preferences/restart | Add and reorder named text/code/image actions, disable/remove an action, save, restart and observe exact order/IDs/enabled state in the native menu and Settings. Second Profile keeps independent defaults. Two-window stale save refuses without overwriting the winner. |
| Reviewed selection/Quick Ask | Select safe text, invoke configured action, observe exact prompt and page/session/epoch attached in the originating Profile/window only. No model request until Send. Expanding Quick Ask retains that draft/source and chat identity. Navigation/reload/moved tab while menu is open refuses; no fallback draft/artifact. |
| Image/region capture | Physical configured chord opens picker; cancellation produces no artifact/model call. A chosen region yields the reviewed image draft; no full-screen fallback, remote image fetch or attachment when image bytes are missing. |
| Shortcut behavior | Physical double tap succeeds only for two distinct presses; hold/repeat, wrong chord, wrong window/Profile and stale pending gesture do not capture. OS registration conflict is surfaced; Off and restart remove/synchronize registration. Receipt revision matches settings. |
| Inline assist | On → explicit safe field capture → synthetic draft → edited review → Apply → native Undo. Off before capture blocks read; Off while page read/model response/queued insertion is pending refuses undispatched work. Off→On does not revive a previous capture. Navigation/field mutation refuses. Already dispatched work is not described as undone by the toggle. |
| Safety boundaries | Private and managed-denied sources produce no capture/model/field-write request. Sensitive/password fields refuse. Source `ask` gives the explicit unavailable-approval reason. A local never-write ceiling blocks insertion. Wrong Profile/window/document identity is rejected natively and in the shell. |
| Accessibility | Keyboard reorder/edit/preview/recovery, recorder Escape/blur cancellation, focus after remove, and one screen-reader pass on the final assembled section. Reuse existing unrelated S9 routing and CRAFT evidence. |

Completion evidence: one source-bound manifest naming native patch/build/runtime/shell hashes, bounded native registration/identity receipts, synthetic model/capture-server counts, focused screenshots/accessibility notes, restart preference snapshot without captured data, and explicit cleanup. Until that passes, leave selection/capture/inline feature qualification and full S9/NATIVE open.

## Source verification

40 distinct focused cases pass across six files: settings/policy **9**, runtime inline assist **8**, draft/source identity **12**, section **6**, inline renderer **3**, existing browser-source regression **2**. Runtime changes were rebuilt with `npx tsc -b` before tests. Renderer TypeScript, lint, format ratchet and `git diff --check` pass. The source evidence record is [`evidence/selection-capture-settings-source-2026-09-29.json`](evidence/selection-capture-settings-source-2026-09-29.json).

Reproduction:

```sh
node scripts/gen-host-bindings.mjs
npx tsc -b
npx tsc -p apps/shell/tsconfig.json
npx vitest run --project unit tests/unit/selection-capture-settings.test.ts tests/unit/inline-assist.test.ts apps/shell/src/selection-action-draft.test.ts apps/shell/src/settings/sections/SelectionCapture.test.tsx apps/shell/src/components/InlineAssist.test.tsx apps/shell/src/browser-context-sources.test.ts
```
