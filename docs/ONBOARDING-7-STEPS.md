# Onboarding — complete extraction of the 7 setup steps

Source of truth: the integrated local `main` source tree. This document describes implemented behavior; it does not claim the full onboarding acceptance matrix has passed. The inspection preview dismissed setup with the actual Finish later UI action.

| Layer | File |
|---|---|
| Step list + state schema | `packages/contracts/src/onboarding.ts` |
| Flow UI (all 7 steps) | `apps/shell/src/onboarding/OnboardingFlow.tsx` |
| Mount / replay host | `apps/shell/src/onboarding/OnboardingHost.tsx` |
| Postcard review block | `apps/shell/src/onboarding/SetupReview.tsx` |
| Pasted-Memory sub-flow | `apps/shell/src/onboarding/PastedMemorySetup.tsx` → `components/MemoryPasteImport.tsx` |
| Runtime service | `apps/runtime/src/services/onboarding.ts` |
| RPC handlers | `apps/runtime/src/api/methods/onboarding.ts` |
| Reused step bodies | `ImportDataSetting.tsx`, `LayoutChoice.tsx`, `settings/sections/Models.tsx` + `ModelConnections.tsx`, `settings/sections/RecoveryPackage.tsx`, `settings/sections/SpaceMemory.tsx` |
| Replay entry point | `settings/sections/General.tsx` ("Set up Aux" → `requestOnboardingReplay`) |
| Mount | `App.tsx` — `deferSurface(() => import("./onboarding/OnboardingHost"), "Setup", true, true)`, mounted once beside `<Toasts />` |

Step order (`ONBOARDING_STEPS`): `welcome`, `import`, `model`, `appearance`, `default`, `permissions`, `postcard`. There are exactly seven; `visited` and `skipped` are both `.max(7)` in the schema.

---

## 0. Shared chrome — applies to every step

**Dialog.** Native `<dialog>` via `Dialog` (`label="Set up Aux"`, `className="aux-dialog-surface onboarding-dialog"`). Focus is trapped by `useNativeDialog`; initial focus is the step `<h1>` (`tabIndex={-1}`), always with `preventScroll`. Escape, `onCancel`, and backdrop-click all call `onClose` → the `later` action. Focus returns to the invoking element on unmount.

**Header.** `AUX · SETUP {n} OF 7` eyebrow + `Finish later` button (disabled only while `busy`).

**Step rail.** Seven ghost buttons labeled 1–7. `aria-current="step"` on the active one; `aria-label` is `"n. {step}"` plus `", skipped"` when in `state.skipped`. Clicking issues `onboarding.update { action: "visit", step }`; disabled while `busy` or disconnected. Any step is reachable on replay — the rail is real navigation, not just a progress indicator.

**Scroll/focus on step change.** Only `.onboarding-scroll` scrolls (`max-height: calc(100dvh - 320px)`); the rail and footer live in the border box and never scroll away. On each step change the scroll region resets to top and the heading is focused with `preventScroll` — an earlier version scrolled the heading into view, which parked the rail on the backdrop and let a stray click dismiss setup.

**Footer.** Three controls:
- `Skip this step` — on postcard: `Finish without a chat`. Sends `skip`; if the returned status is `complete`, closes.
- `Back` — only when index > 0; sends `visit` to the previous step.
- `Continue` — on postcard: `Finish setup` → `finish` action + close. Otherwise `visit` to the next step. Disabled while `busy`, disconnected, **or a recovery is staged** (`restorePending`).

**Global chrome states rendered under the heading:**
- Disconnected: `<output>` "Aux is disconnected. Saved setup progress is safe; reconnect to continue, or finish later to browse." — whole fieldset `disabled`, Finish later still works without an RPC.
- Error: `role="alert"` paragraph + `Reload setup progress` (calls `onboarding.get`). Error text comes from the thrown error, else "Setup could not be saved. Check progress before trying again."
- `restoreStatus === "unavailable"`: alert "Recovery readiness is unavailable. New chat starts are blocked until it can be checked." + `Retry recovery check`.
- `restorePending`: `<output>` "Recovery is staged. Quit Aux normally and reopen to apply it before starting new work."

**Busy discipline.** `busyRef` + `busy` wrap every action (`work()`), so double-clicks and re-entrancy can't double-fire an RPC. On action failure the flow re-reads `onboarding.get` to keep visible progress truthful.

**State (`OnboardingState`, KV key `onboarding.state.v1`).**
`version:1 · revision:int · status: new|active|later|complete · step · visited[] · skipped[] · disclosureVersion:int · defaultBrowserPromptedAt?:int · firstTask?:{postcardId, runId:uuid, chatId:uuid, status: pending|started|interrupted|failed|unavailable}`. The receipt contains **no** source URL, title, prompt, credentials, imported data or grants — tests assert the serialized state contains none of them. Malformed state throws `conflict` ("Setup progress could not be read. …") rather than silently resetting and repeating side effects.

**RPC surface (all `aux-webui` auth; external clients refused with "Set up Aux in its own window" before any Profile read):**
- `onboarding.get {}` — reads Profile progress and reconciles the first-task receipt (see postcard). Never discovers import sources, opens a page, retries a task, or calls a model.
- `onboarding.update {revision, action, step?}` — actions: `visit` (needs `step`; records it in `visited`, status→active), `skip` (adds current step to `skipped`, advances; last step → complete), `later` (status→later), `finish` (→complete), `replay` (→active, step→welcome, keeps visited/skipped/disclosure/cooldown/firstTask), `disclosure` (sets `disclosureVersion=1`), `default-prompt` (writes `defaultBrowserPromptedAt` now; throws `conflict` if within the 7-day cooldown).
- `onboarding.start {revision, postcardId, page}` — see step 7.

Stale-window writes fail with `conflict` "Setup changed in another window. Reload its progress before continuing." A write during first-chat dispatch fails with "The first chat is starting. Check its progress before changing setup."

**Host gating (`OnboardingHost`).** Renders only when `enabled && inNativeHost && !bridge.privateMode && bridge.windowKind === "normal"` — never in Private or utility windows (quick-ask, little). Reads `onboarding.get` only after the runtime connects; opens the dialog only for `status: new|active`. A dismissed flow does not reopen on reconnect. Replay is explicit: the `aux:onboarding:replay` window event (fired only by the General → "Replay setup" button) closes the current view so an obsolete revision can't keep editing, coalesces repeat requests, ignores stale startup responses by generation counter, and remounts via `key={instance}`.

---

## 1. `welcome` — "A browser for what comes next"

**Copy (verbatim):**
- "Bring your browsing with you, choose a model, and turn a question into a useful first chat."
- "Every step is optional. Your progress stays with this Profile. Replay setup in Settings → General at any time. Press ⌘↩ to finish later."

**Controls:**
- `⌘↩` (Cmd+Enter, welcome step only, non-composing) → `later` + close.
- Expandable ghost button `Recover an existing Aux Profile` (`aria-expanded`) → mounts `<RecoveryPackage>` inside a fieldset disabled unless `restoreStatus === "ready"`.

**Embedded recovery surface (`RecoveryPackage`):**
- Explains the artifact: phrase-encrypted offline copy of task data, saved evidence, remembered pages, current Space memory. Excludes browser cookies, passwords, Keychain credentials, connector tokens, deleted memory. 64 MB cap — larger Profiles fail without partial export. "Settle active work before exporting. Imported grants are revoked and routines pause for review." Exported copies remain restorable with their original phrase after Forget; external copies/phrases can't be revoked.
- `Recovery phrase` — password input, `autoComplete="new-password"`, 16–200 chars; typing clears a prior review.
- `Create encrypted package…` → `installation.exportRecovery {phrase}` (needs ≥16 chars, native host, nothing pending) → shows path, clears phrase, `bridge.revealPath`.
- `Choose package…` → `bridge.openFile`; `Package path` text input.
- `Review package` → `installation.inspectRecovery {path, phrase}` → manifest review: created date, artifact count, remembered pages, Spaces with memory, protected SQLite table plans, exclusion list.
- `Stage reviewed recovery…` (danger) → `installation.stageRecovery {path, phrase, expectedSha256, reviewToken}` → `onStaged()` flips restore status to pending.
- "Creating or staging a package asks for fresh device authentication."

**Recovery status plumbing (flow-level, used here and re-used at postcard):** `installation.restoreStatus {}` is called on mount and every window `focus`; stale generations are ignored. `pending` → staged; error/non-native → `unavailable`. Reading status is side-effect-free.

---

## 2. `import` — "Bring the parts you want"

**Copy (verbatim):**
- "Review Chrome, Arc, Safari or Firefox, then choose the Profiles and categories to bring over. Nothing imports until you confirm your selection."
- "The browser import does not copy passwords, cookies or account access. macOS may separately ask for Keychain access when Aux stores or unlocks its own encrypted Profile data or model keys. Read that system prompt before allowing it."
- Hint: "Leaving this step does not cancel an import you started. Return here to inspect its durable progress; interrupted imports require a fresh review before retry."

**Embedded component: `ImportDataSetting`** (same S7 surface as Settings).
- Entry reads `import.status {}` only — receipt recovery, **no** source discovery, no `import.preview`/`import.run` on mount (its failure is silently swallowed: nothing to show). Also subscribes to `import.progress` events. A preview response may carry `recentJobs`; the newest one is applied as the visible receipt.
- `See what can be imported` → `import.preview {}` → per-source sections (Chrome, Arc, Safari, Firefox, attached Chrome), each with Profile sub-fieldsets and per-category checkboxes. Categories: `bookmarks` → "Bookmarks", `history` → "History", `tabs` → "Open tabs". All boxes **start unchecked** — selection is opt-in. Unavailable/blocked categories are disabled and labeled with blocker text, "N found", "N MB", "Available", or "Nothing found".
- Hints: "Choose bookmarks and history from Chrome, Arc, Safari or Firefox. Arc Spaces and pinned pages become bookmark folders. Live tabs are available from an attached Chrome." / "Existing bookmarks keep their titles and folders. Matching bookmark URLs and history visits are skipped on retry. Passwords, cookies, extensions and agent permissions are not imported here."
- `<details>` "Keychain and macOS access": import doesn't ask for browser Keychain passwords; Aux may ask macOS to unlock its own protected storage; password transfer is reviewed separately in Passwords & Autofill; Safari data may need Full Disk Access.
- `Import selected (n)` → `import.run {selections}` where n = total category count across selected profiles. Keeps cancel/reconciliation working even if the first status read fails; a `run` failure re-reads `import.status` (another window may own the Profile's single active import).
- While running: 1 s `import.status {jobId}` polling (re-entrancy-guarded) + `import.progress` events; `apply()` drops stale updates (same job → higher `revision` wins; different job → later `startedAt` wins).
- `Cancel import`/`Stopping…` → `import.cancel {jobId}` then a status refresh.
- Completion strings: "Import interrupted when Aux stopped. Confirmed items remain available. Review the sources before retrying." / "Import in progress. You can leave this page and return to check progress." / "Stopping after the current batch…" / "Import stopped — completed items remain available; the rest were not attempted." / "Import stopped with an error; completed items remain available." / "Import finished — some items could not be imported; the rest are available." / "Import finished."
- Per-row report: `label · category — N imported [· M skipped][…][ · detail]`; errors in `hint err`.
- Progress-read failure: "Progress is temporarily unavailable. The import may still be running; check again before retrying." + `Check progress` retry.
- Post-run with anything imperfect (interrupted/cancelled/error/row-error/skipped tabs): "Review the current sources and select what to retry. Bookmarks and history merge safely. Retrying live tabs can open duplicates. Counts cover confirmed batches; an interrupted request may have added more." + `Review sources to retry` → fresh preview.
- When a job finishes, the preview/selection clears only on the transition to `done` for that job.

---

## 3. `model` — "Choose how Aux thinks with you"

**Copy (verbatim):**
- "Model requests send your prompt, selected page context and attached material to the provider you choose. Gateway routes requests to that provider; BYOK uses your chosen provider account. Usage may cost money. Credentials are saved through the OS credential store."
- "**Muse Spark 1.3 Contributor:** this tier lets Meta use prompts and completions sent to it to improve its models. Select a provider and model whose data use fits your work."

**Gate:** if `state.disclosureVersion !== ONBOARDING_DISCLOSURE_VERSION (1)`, the step shows only the disclosure copy and `I've reviewed model data use` → `update("disclosure")`. Acknowledging issues **no** model call. Once acknowledged: hint "A connection test sends a model request only when you choose Test. Setup itself makes no model call." + the full `ModelsSettings` surface mounted with `active`.

**Embedded `ModelsSettings` surface:**
- Status `<output>`: `{provider} is disconnected. Reconnect explicitly…` / `{provider} is ready.` / "Local model endpoint configured…" / "{provider} key configured. Save a model and test the connection before your first run." / "Agent setup needed. Browsing, saved tasks, and evidence review are available without a model."
- `ModelConnections` per-provider rows: Connected/Disconnected state; menu items `Set models`, `Reauthenticate`, `Disconnect`/`Reconnect`, `Remove saved key` (destructive, confirmed; also disconnects). Disconnect stops future requests in this Profile incl. environment creds and localhost; saved keys and model choices are kept.
- `Model provider` select — Vercel AI Gateway, OpenAI, Anthropic, Google, OpenAI-compatible. Hint: "Switching providers changes where task context and screenshots are sent. Each provider keeps its own key and model choices; there is no automatic fallback to another provider."
- `openai-compatible` only: `Endpoint` field + `Save endpoint` + `Discover models` (models.list; "The endpoint returned no models." on empty). Hint: "Prompts and screenshots are sent here. Remote endpoints must use HTTPS; localhost may use HTTP."
- Otherwise: "Destination: {modelEndpoint ?? 'Vercel AI Gateway'}. Enter a model ID available to your account. Use the Agents tab for Codex or Claude Code."
- `{provider} API key` password field + `Save key` (`settings.set {modelCredential}`). Hint shows credential error / "Using a process environment key…" / "Key saved with OS encryption." / "Optional for localhost…" / "No key configured. Saved keys require OS encryption." A saved key masks to `••••••••`; the draft clears on provider switch; failed save keeps the typed entry.
- `Planner model` input + datalist (registry models + discovered + current) + `Save model` + `Test connection` → `models.probe {modelId}` → "Connection tested · N ms · vision/no vision · timestamp" or "Failed — {error}". If the planner (or any role route) is `meta/muse-spark-1.3-contributor`, a `contributor-data-use` warning reappears under the field.
- "Test connection sends small synthetic model requests and may incur provider charges. It does not send your open pages. Save key and model changes before testing."
- `Vision model` field (used for screenshot-based recovery; saves on blur).
- **Model roles** — Fast ("Short tasks and lightweight decisions"), Standard ("The default route for everyday runs"), Deep ("Longer reasoning and recovery"), Visual ("Screenshot-based recovery and visual work"). Each: model ID input + datalist + reasoning select (Low/Medium/Extra high) + `Save route` + `Automatic` reset. Automatic follows planner for Fast/Standard, recovery model for Deep, vision model for Visual.
- `Parallel worker pages` (number 1–16, default 4) and `Max model turns per run` (8/16/32/64/128/"No limit", i.e., 0).
- Any provider/key/model/endpoint save clears the last probe result so a stale "ready" can't persist.

---

## 4. `appearance` — "Make room for your way of working"

**Copy (verbatim):**
- "Changes apply immediately to this Profile. Try both tab layouts and choose a color for the current Space."
- Hint: "Your system's reduced motion and contrast preferences still apply."

**Controls:**
- `Theme` radios: `system`, `dark`, `light` → `settings.set {theme}`.
- `LayoutChoice` radiogroup ("Tab layout"): Horizontal / Vertical `RadioCard`s with CSS miniatures (own silhouette + tokens — deliberately not screenshots) → `settings.set {tabLayout}`.
- `Space color` select over `SPACE_COLORS` = blue, violet, pink, orange, green, teal, slate → `editSpace(activeSpace.id, name, color, grain, null)` — live update through the normal store path.
- Everything is immediate-apply to this Profile; no preview/draft state.

---

## 5. `default` — "Open your next link here"

**Copy (verbatim):**
- "Make Aux the place links open from other apps. This is optional and does not change what you can use."
- If already default: "Aux is your default browser."
- Cooldown active: "Setup will wait seven days before offering another system prompt. You can change this in Settings at any time."
- Not in the native host: "This choice is available in the native Aux app."
- Post-click when the OS didn't confirm: error "The system has not confirmed a change. You can check System Settings or continue setup."

**Behavior:**
- On step entry and on every window `focus`: `bridge.defaultBrowser()` → `isDefault` (null while unknown).
- `Make Aux the default browser` — disabled while busy, non-native, cooling down, or status unknown. Click = `update("default-prompt")` (server writes `defaultBrowserPromptedAt`, enforcing `DEFAULT_BROWSER_COOLDOWN_MS` = 7 days and throwing `conflict` inside it) **then** `bridge.setDefaultBrowser()`. The OS prompt is only ever requested by this explicit action; skip/replay never fire it, and replay cannot reset the cooldown. If `isDefault` still false afterward, the "not confirmed" error shows.

---

## 6. `permissions` — "You stay in charge"

**Copy (verbatim):**
- "Starting a chat gives Aux the question and sources you select. It does not connect accounts or grant access to folders."
- Bullets:
  1. "Review the source, recipient and action when Aux asks for approval. Never approve a request you do not recognize."
  2. "Connected services need their own reviewed grants. A connected account is not permission to send, change or delete anything."
  3. "Browser tasks use a separate, temporary browsing session. It starts without your cookies or saved passwords; sign in separately if needed."
  4. "You can stop a task, take control of a page, or change permissions in Settings. Stopping cannot undo an action that already completed."
  5. "Memory is optional. Review remembered information and pasted assistant notes through the existing Memory controls before using them."
- "Setup does not enable Memory, broaden grants, connect services or import credentials automatically."

**Controls:**
- Expandable `Import notes from another assistant` (`aria-expanded`) → `PastedMemorySetup` → `MemoryPasteImport`:
  - "Bring a few useful notes from another assistant. Paste plain text with one note per line, up to 40 notes and 32 KiB. Nothing is read from your clipboard automatically."
  - "Preview uses local checks only and makes no model call. Remove passwords, tokens, financial and health details. These checks cannot identify every sensitive fact; review each note yourself. Imported notes remain unverified and are not used by the agent until you accept them in Memory review."
  - `Destination Space` select (only Spaces with a `workspaceId`); none → "Create or restore an active Space before importing notes."
  - `Assistant notes` textarea (6 rows, `maxLength = MEMORY_PASTE_MAX_BYTES` = 32,768), placeholder "One useful preference or piece of project context per line"; byte counter "N of 32,768 bytes. Drafts and previews are not restored after closing this form or restarting Aux."
  - `Preview pasted notes` → `memory.paste.preview {workspaceId, text}` — disabled until a Space and non-empty text within the byte cap; any text/destination change invalidates the preview. `Clear pasted draft` wipes text + preview.
  - Blocked preview: "{reason} No notes were saved." (`role=alert`).
  - Ready preview: "Review notes for {space}" — "Nothing is selected automatically. This preview expires in ten minutes or on restart. Changing the destination or text requires a fresh preview." Per-candidate checkboxes; duplicates disabled and tagged "Already in Memory or repeated in this paste".
  - If Memory is disabled for that Space: opt-in checkbox "Enable Memory for {space}. Only notes I later accept can be used as context." → `memory.pipeline.setPolicy {enabled:true}`.
  - `Add N notes to Memory review` → `memory.paste.commit {workspaceId, previewId, selectedIds}` → clears draft, prepends the receipt, opens `Memory review for {space}` (embedded `SpaceMemory`).
  - `Refresh import receipts` → `memory.paste.status`; "Recent pasted imports" list: "Import {id8} · {date}: N added, M duplicates skipped · P pending, A approved, R in history, D removed." Plus: "Counts survive restart. Forget removes matching notes from the inbox, approved Memory and restorable history; receipts retain counts only. Copied offline recovery packages must be replaced separately after Forget."
  - Private mode: "Memory import is unavailable in private browsing."
  - Policy/status load per destination via `memory.pipeline.policy` + `memory.paste.status`, refreshed on `workspace.memory.updated` events.
  - No `memory.*` RPC fires just from expanding the section — paste flow is fully user-initiated (asserted in tests).

---

## 7. `postcard` — "Start with one useful question"

**Copy (verbatim):**
- "Choose a page you want to understand. Aux will use a separate browsing session; the page's address is copied, without its cookies or saved passwords."

### 7a. `SetupReview` block ("Review your setup")

Three sections + footer:

- **Latest browser import** — reads the durable `import.status` receipt on mount/connect and follows `import.progress`; the same stale-response guards as the importer (jobId+revision, jobId+startedAt). States:
  - loading: "Checking the saved import receipt…"
  - none (a `not_found` response only — disconnection/malformed data is *not* "none"): "No browser import recorded in this Profile. You can browse and start a chat without importing."
  - unavailable: alert "Import progress is unavailable. Nothing was retried; review the saved receipt before assuming an import finished."
  - ready: "Counts cover confirmed writes from the most recent import. Earlier imports and later edits can change your current library." + status line = "Import still running" | "Stopping after the current batch" | "Import interrupted" | "Import needs review" | "Import finished" + source names (Chrome/Arc/Safari/Firefox/Attached Chrome). Confirmed counts for Bookmarks / History entries / Open tabs. "N skipped. Skips may include duplicates or unavailable items; review the import details." If review needed: "Confirmed items remain available. Return to Import for a fresh source review before retrying." If running: "Starting a chat does not wait for or cancel this import."
  - Buttons: `Review browser import` → visit `import`; `Refresh import receipt` / "Checking receipt…".
  - It never discovers a source Profile, resumes a job, or imports anything — receipts only.
- **Model and source** — "Model connection ready · {provider name}" or "No model connection is ready."; "You reviewed model data use. Your selected page and question are sent only when you start the chat." vs "Review model data use before starting a chat."; "Reviewed page: {url}" or "No page has been reviewed for this chat."; "The task opens a separate temporary page with the same URL. Cookies, saved passwords and account access are not copied. A sign-in page may therefore need a separate sign-in." + `Review model setup` → `model`.
- **Keychain and recovery** — "Browser-data import does not request your browser's Keychain passwords. Aux may ask macOS to unlock its own protected Profile or save a model key. Check the app and purpose in that system prompt; cancelling is allowed." + "A recovery package and its phrase are separate from Keychain. Recovery is reviewed, authenticated and applied to a new empty Profile on restart; credentials and browser cookies are excluded. Keep copied packages and their phrases under your control: copies outside Aux cannot be revoked after Forget." + status line ("No recovery is staged." / "Recovery is staged. Restart Aux before starting a chat." / "Checking recovery readiness…" / "Recovery readiness is unavailable. Check again before starting a chat.") + `Review recovery options` → `welcome`; `Check recovery readiness` when unavailable.
- **Footer:** "Setup does not import credentials, enable Memory or grant service/folder access." + `Review permissions` → `permissions`.

### 7b. First-task branching

- `firstTask.status === "started"` → `Open your first chat` → `runs.get {runId}` → `openConversation(runId)` + close.
- `"unavailable"` → "Your first setup chat is unavailable. Replay will not recreate it. Check Chats before starting anything again. Start a new chat from Aux whenever you're ready." (no retry UI — deleted first chats are never recreated).
- Otherwise (or no firstTask): if `!ready` → "Review model data use and configure a connection in step 3 before starting. You can skip this step and browse normally."
- `first.status === "pending"` → output "Starting your first chat. Check progress if the connection was interrupted." + `Check chat progress` (`onboarding.get`).
- `"failed"|"interrupted"` → "The first chat did not finish starting. Review the page and retry; Aux reuses the same delivery identity."

### 7c. Source selection

- `Page to explore` URL input (placeholder `https://example.com`) + `Open page in background` → validates http/https with no embedded credentials ("Enter an HTTP or HTTPS page without embedded credentials.") → `openBackgroundTab(url, activeSpace.id, false)` → auto-selects the new page.
- `Reviewed source` select — only `availableOnboardingPage` pages: http/https, no URL username/password, not `ownedByRuntime`, not `loading`, controller ≠ agent/external, `windowId === bridge.windowId` (this window only), viewStatus not detached/crashed. Options render "title — url" (falls back to url). Empty option "Choose an available page". Selecting a different page clears the review.
- `View selected page; finish setup later` — saves `later`, activates the real tab, closes setup (review-before-commit escape hatch).
- Checkbox: "I've reviewed this page and want to send its context to the selected model." — stores `{pageId, url, documentEpoch, sessionId}` as the review ref. Any URL/documentEpoch/sessionId change invalidates it (re-check required after navigation).

### 7d. Postcards (`ONBOARDING_POSTCARDS`)

Three cards, each showing the exact server-owned prompt + tool badges. Once a firstTask exists, only its postcard renders.

| id | question | prompt (verbatim) | tool badges |
|---|---|---|---|
| `understand` | "What matters on this page?" | "Explain the selected page in plain language. Identify its main claims, what supports them, and three useful follow-up questions. Cite the page. Do not change the page or send anything." | Read page · Chat |
| `compare` | "What should I check before deciding?" | "Read the selected page and make a compact decision checklist: useful facts, missing information, and questions I should ask before deciding. Separate facts from assumptions and cite the page. Do not purchase, submit, or contact anyone." | Read page · Checklist |
| `plan` | "How can I turn this into a plan?" | "Use the selected page to draft a practical five-step plan with a clear first action. Cite the source and ask me before using a connected service. Keep this as a draft: do not change a calendar, send messages, or change the page." | Read page · Draft plan |

- Connector hints (fetched via `connectors.catalog` for the active Space's workspace): on `plan` — "Calendar connected · task approval still required" when an active calendar entry exists; on any card — "MCP connected · tool approval still required" when an approved MCP entry exists. Setup never creates those grants.

### 7e. Start and server contract

`Start this chat` / `Retry this first chat` is disabled while busy, disconnected, `restoreStatus !== "ready"`, `!ready` (no disclosure or no configured model), no reviewed page, or a first chat is pending.

On click, in order:
1. Fresh `installation.restoreStatus` — throws "Recovery readiness changed. Resolve it before starting a chat." if not ready.
2. Re-read the live page and re-verify every `availableOnboardingPage` field plus exact url/documentEpoch/sessionId — "The selected page changed during review. Review its current document before starting."
3. `onboarding.start {revision, postcardId, page}` → on success, `reveal()` prepends the run to the store if absent, `openConversation`, close.

Server side (`OnboardingService.start` + `h_onboarding_start`):
- External clients refused before anything ("Set up Aux in its own window").
- A staged runtime recovery (`pending-runtime-restore.json` in dataDir) refuses: "Recovery is staged. Quit Aux normally and reopen before starting the first chat." — independent of the renderer's possibly-stale status.
- A different postcard than an existing firstTask → conflict "Setup already has a first chat. Open it or start a different chat outside setup."
- Concurrent starts share `inFlight` — one dispatch, one identity.
- Existing firstTask with a live run → returns it (no re-dispatch). Status `started`/`unavailable` with no run → conflict "This setup chat was removed. Start a new chat outside setup; replay will not recreate it."
- Stale revision → conflict. Missing disclosure → `permission_denied` "Review how model requests use your data before starting a chat." Model unconfigured → `backend_unavailable` "Set up a model connection first. No chat has started."
- `reviewedPage()` refuses non-http(s), embedded credentials, runtime-owned, loading, agent/external-controlled, detached/crashed pages and any url/epoch/session mismatch — checked **before** reserving the receipt and **again** after reservation, before dispatch (a race leaves a `failed` receipt with the same reusable delivery identity and performs no adapter call).
- Pending receipt (`{postcardId, runId, chatId, status:"pending"}`) is persisted **before** dispatch; runId/chatId are server-minted UUIDs and are *reused* on retry — the renderer supplies no run ID, prompt, or authority (schema is strict).
- Dispatch goes through the existing `RunService.start` with `goal` = the postcard's exact prompt, `deliveryRunId` = firstTask runId, `chatId`, `pageIds: [page.pageId]`, `contextPageRefs: [page]`, `maxModelCalls = min(8, configured)` — the run respects ordinary spending/approval gates.
- If the adapter returns a run whose `runId` ≠ the reserved identity → `firstTask.status = "unavailable"`, no second delivery. If the response is lost but the run exists in the repo → reconciles to `started`/`complete`. Crash after a pending receipt → next `get()` marks `interrupted`, **no automatic retry**; explicit retry reuses the same identity.

---

## Cross-step invariants worth restating

- Every step is optional; `skip`/`later`/`finish`/rail-visit are all persisted per-Profile (`onboarding.state.v1`), survive restart, and are replayable without repeating side effects (no repeat import, no model call, no OS default prompt within the 7-day cooldown, first-chat identity preserved).
- Setup never: discovers browser Profiles on entry, copies passwords/cookies/account access, enables Memory, creates connector/tool grants, connects services, or makes any model call except the explicit `Test connection` probe and the explicit first-chat start.
- All writes are revision-checked; a second window or stale response can't fork progress.
- The dialog is the shared native `Dialog`: focus trap, Escape/backdrop → `later`, focus restoration on close.
