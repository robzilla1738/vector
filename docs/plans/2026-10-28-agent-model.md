# Aux Agent: from chats to one personal agent

Approved by Robert, 2026-10-28 ("do this all", with the recommended defaults). Product decisions inside this plan are delegated ("make best decisions to result in the best product").

## The idea in one paragraph

Today every question starts a new chat, and the side panel even starts a fresh chat on every tab switch. Instead, each profile gets **one Agent**: a named, customizable assistant with its own avatar, personality, memory and one long-running conversation, its **home thread**. That agent is the primary way you use AI in Aux, and it lives in the sidebar's Aux button. You can still open **side chats** for focused or throwaway work. They share the agent's personality and memory but not its transcript. This follows Meta's Muse model: one persistent agent you message like a person, with a name, an avatar, a communication style, editable memory, optional proactive check-ins, approval cards for risky actions, and side chats that sit beside the main thread.

The agent runs on whatever model and connection the user has set up (BYOK key or signed-in subscription). It is not tied to a provider.

## What does not change

The agent is a new layer of identity and threading on top of the existing engine. These stay exactly as they are:

- **Browsing.** The browser tools (`createAgentToolset`, harness `v1`), the extension bridge and `Aux.*` commands, CDP on 45203, `session_tabs` ownership, and the permission modes (`guard`, approvals, final confirm).
- **Models and providers.** Resolution still goes `settings.defaultModel` → `resolveSessionModel`, plus the provider CLI integration, BYOK and subscriptions. There is one optional addition: an agent-level model preference, chosen only from connections the user already has.
- **Memory.** Extraction, dreaming and `memory/USER.md`/`MEMORY.md` are reused unchanged. The agent *is* the account's memory owner.
- **Skills, MCPs, projects, routines, channels.** They work the same way and are reachable from the home thread and from side chats.
- **Incognito.** No agent and no memory. It stays ephemeral as today.

## What the code looks like today (the facts this plan rests on)

| Area | Today | Where |
|---|---|---|
| Chats | Daemon SQLite `sessions` table (title, `parent_id`, `trigger`, `model`, `browser_binding`, frozen `system_prompt`, `runtime_config`…); transcript in `sessions/<id>/messages.jsonl` | daemon `aux-native-entry.mjs`, `state.db` |
| Persona | Account-level `SOUL.md` ("your persona") and `AGENTS.md` are already inlined into every system prompt. tRPC `settings.readContextFile`/`writeContextFile` exist, but **no UI calls them** | `buildPromptFooter`, `CONTEXT_FILES` |
| Identity | Hard-coded `"You are Aux, a helpful, proactive, and smart AI browser…"` | `SYSTEM_PROMPT$1` |
| Prompt freshness | The system prompt is built once at session creation and then **frozen** in `sessions.system_prompt`, so later SOUL/memory edits never reach existing chats | `AgentSession.create` |
| Side chats | Already exist: `trigger.type: "sidechat"` with `parentId`, which copies the parent's **whole transcript prefix** | `createSidechatDirectiveMessage`, `session-composer-*.js` |
| Tab switch | `sidepanelSessionOnTabChange` is `new-session` by default; `keep-session` exists | settings schema |
| Long threads | Auto-compaction exists (`getCompactionThreshold`, `compactionSummary`, `latestCompactionMessageOffset`) | daemon |
| Proactive | `runtimeConfig.proactiveMode` (`/proactive`), and routines that create sessions with `parentSessionId` | daemon |
| Sidebar button | `aux_agent_button_` at the end of the sidebar address field: a fixed `kAuxNewTabMarkIcon` vector, tooltip "Ask Aux", click → Agent extension action → `chrome.sidePanel.open` | `location_bar_view.cc:504-512, 1037-1040, 2485` |
| Toolbar mode | The same action restyled as an "Ask Aux" pill | `toolbar_action_view.cc:117-126, 240-265` |
| Status UI | `ChatThrobber`, `ChatUnreadDot`, `ChatBadge` driven by `ChatStatus` (`kRunning`, `kAwaitingApproval`, `kFinishedUnread`…); `SetAvatarImage` with monogram fallback on the profile button | `aux_chat_row.cc`, `aux_vertical_sidebar_profile_button.cc` |
| Native ↔ daemon | Loopback HTTP polling with the session token (`/session/for-chrome/*`) | `aux_chats_transport.cc` |
| Assistant avatar in messages | None. Only the user and projects have avatars | `message-*.js` |

These facts set the shape of the plan. Most of the engine is already agent-shaped: persona file, shared memory, side chats, compaction, proactive mode. The real gaps are a **name and avatar store**, a **home thread**, **live prompt refresh**, **side chats that don't copy a giant transcript**, and the **UI**.

## Product design

### The Agent

- **One per profile.** Work and personal profiles each get their own agent, with separate memory, persona and home thread. This follows the existing standard profile isolation. The data model allows several agents later; v1 shows one.
- **Identity:**
  - **Name:** 1–32 characters, one line. The default is "Aux".
  - **Avatar:** one of about 12 built-in presets drawn from the arch-mark geometry and theme colors, an uploaded image (cropped to a circle), or a monogram on a color.
  - **Communication style:** a choice among Concise, Warm, Playful, Professional, plus free text.
- **Personality:** written to `SOUL.md`, the file the prompt already reads. The style presets are just starter text in it. Power users edit the file directly in Settings.
- **Instructions:** `AGENTS.md`, editable in Settings. The file exists today but has no UI.
- **Memory:** the existing Settings › Memory, reached from the agent's profile sheet ("What Aux knows about you"), with forget and edit as today.
- **Proactivity:** Off, Light or Normal. This controls whether the agent may post to the home thread unprompted (routine results, reminders, "that page you asked me to watch changed"). The default is Light.

### The home thread

- One conversation that never "ends".
- **Context:** auto-compaction keeps it within the context window. Older turns are summarized; memory carries the long-term facts.
- **Busy agent:** queue and steer already exist, so you can message while it works, like Muse.
- **Windows:** the side panel in any window shows the same home thread. Each turn binds to the active tab of the window you typed in, so browsing behaves exactly as today.
- **Tab switches** never start a new chat. The home thread is always `keep-session`.
- **Activity:** a line under the agent header shows active work ("Comparing 3 flight options…"), driven by session status. Approval cards stay the existing permission UI.

### Side chats

- Created from the side panel's existing "+" tab strip, from the sidebar Chats section, from "New side chat" in the agent menu, or from "Branch into side chat" on any home-thread message.
- **Inherited:** the agent's name, avatar, personality, instructions and memory.
- **Not inherited:** the home thread's transcript. "Branch from here" carries only the selected message plus a short summary.
- **Memory:** side chats feed memory as today, so the agent "remembers" what you did in them.
- **Existing chats:** every chat a user already has becomes a side chat in history. Nothing is deleted or moved.

### Where it lives and how it looks (Arc and Aside clean, uniform spacing, no new chrome)

- **Sidebar button** (the existing `aux_agent_button_`):
  - The fixed Aux mark becomes the agent's 18px circular avatar, with a 1px theme-tinted ring.
  - Tooltip and accessible name: "Ask ‹Name›".
  - **Running:** a thin animated ring around the avatar, the same spinner as `ChatThrobber`.
  - **Awaiting approval:** an amber dot.
  - **Unread reply:** an accent dot.
  - **Daemon down:** a dimmed avatar plus "‹Name› unavailable — Retry" (this folds in agent-plan item 74).
  - With reduced motion, the ring is static.
- **Toolbar mode:** the "Ask Aux" pill becomes the avatar plus "Ask ‹Name›".
- **Side panel header:**
  - Avatar (24px) and name on the left. Clicking opens the agent's profile sheet.
  - On the right: side chats (the existing tab strip) and a ⋯ menu with New side chat, Side chats, Agent settings and Pause proactivity.
- **Messages:** the agent's avatar and name appear once at the start of each reply group, not on every bubble. User messages are unchanged.
- **Composer:** placeholder "Message ‹Name›…".
- **New tab:** "Ask Aux a task" becomes "Message ‹Name›", and it posts into the home thread. A setting can send new-tab prompts to a fresh side chat instead.
- **Sidebar Chats section:** renamed "Side chats". The home thread doesn't appear there, because it lives in the button.
- **First run, "Meet your agent":** one small sheet in the side panel with name, avatar picker, style and a Done button. A "Skip" keeps the default Aux identity. It appears once per profile and never blocks browsing.
- **Settings › Agent** (new page, beside Memory and Models):
  - Identity
  - Personality (SOUL.md)
  - Instructions (AGENTS.md)
  - Memory (link)
  - Proactivity
  - Model: "Uses your default model", or pick one of your connected models
  - Side-chat defaults
  - Reset agent: resets identity only, never memory, without a separate confirm

## Technical design

### 1. Daemon (plain JS in `aux-native-entry.mjs`, edited by count-checked transforms; no relink)

Add one module beside the entry, following the `vendor/provided/provider-cli/integration.mjs` pattern: a new file in `ADDITIONS`, plus small `DAEMON_EDITS` anchors.

- **Agent store.** `<accountRoot>/agent/agent.json` holds `{version:1, id, name, style, proactivity, modelPreference?, homeSessionId, avatar:{kind:"preset"|"upload"|"monogram", ref, revision}, revision}`. Uploaded images go to `agent/avatar.webp`. These are additive files, so no SQLite migration is needed and old builds simply ignore them. The `SOUL.md` and `AGENTS.md` paths stay where they are.
- **Avatar ingest.** PNG, JPEG or WebP, 2 MB at most. The image is decoded, cropped square, re-encoded to 256 px WebP with metadata stripped, and stored. The original is never kept.
- **tRPC `agent.*`:**
  - `get`
  - `update({name, style, proactivity, modelPreference})`, which validates the name: trimmed, no control characters, 32 characters at most.
  - `setAvatar` and `resetAvatar`
  - `ensureHome`
  - `startSideChat({fromMessageId?})`
- **HTTP for native**, behind the same session token:
  - `GET /agent/for-chrome` returns `{name, avatarRevision, homeSessionId, status, unread, awaitingApproval}`.
  - `GET /agent/avatar?rev=` returns the image.
- **Home thread.** `ensureHome` lazily creates a normal session. It is marked in `agent.json` and in `runtime_config.agentHome=true`, and the existing `trigger` enum is left untouched. It is `keep-session`, never auto-titled, never archived, and pinned out of recents.
- **Live identity in the prompt:**
  - Replace the hard-coded "You are Aux…" opener with "You are ‹Name›, the user's personal agent in the Aux browser…". With no agent.json present, the name defaults to Aux, so the text is identical today.
  - For agent sessions (home and side chats), rebuild the frozen `system_prompt` when the agent's `revision` or the SOUL, AGENTS or memory file hashes change. The check runs at turn start and compares one stored hash, so prompt caching still works between edits. Ordinary pre-existing chats keep today's frozen behavior.
- **Side chats without transcript copy.** Add `inheritTranscript:false` on the sidechat path. The new chat gets the agent prompt plus an optional seed (one message plus a summary from the existing `compactionSummary` machinery). The current full-prefix sidechat stays available for "Branch" inside non-agent chats.
- **Per-turn tab binding.** The home thread's `browser_binding` follows the window that sent the prompt, using the existing binding fields. Only who sets it changes.
- **Proactive posts** (phase 4):
  - Routine runs whose parent is the home thread append their result there as an agent message, instead of only a new session.
  - The proactivity level gates this and `proactiveMode`.
  - Rate limit: at most N unprompted posts per day, and never while the user is typing.
- **Model preference.** If set and still connected, it becomes the home thread's model through the existing `applyExecutionModel` path. Otherwise it falls back to the default model, as today. Nothing new talks to providers.

### 2. Extension (minified Vite chunks, edited through `scripts/release/package-edits.json` plus new files)

New screens are added as **new module files**: the agent header, the profile sheet, the setup sheet and the Settings › Agent route. They import the bundle's existing React and component exports. Small count-checked edits wire them in: route registration, the header slot, the message-group avatar, composer placeholder text and the side panel's default session. This keeps each edit to existing code small and reviewable, and makes the next supplied update a rebase of anchors, not of screens.

- **Side panel:** opens `agent.ensureHome` by default instead of `navigate(null)`.
- **Chat menu:** shows side chats, with "Back to ‹Name›" pinned on top.
- **Avatar:** read from `/agent/avatar` with the session token. Styled with the existing CSS tokens; no new font, radius or color.
- **New-tab editor and mini popup** send to the home thread.
- **Strings** go into the launch-language catalog (phase 3 of the release plan), so the ten languages pick them up.

### 3. Native Chromium (durable checkout, `native-build.py`, re-export `chromium/tree`)

- **`AuxAgentIdentityService`** (per profile): polls `/agent/for-chrome` beside `aux_chats_transport` (same token and backoff). It fetches the avatar only when `avatarRevision` changes, decodes it through Chromium's sandboxed `ImageDecoder`, never in the browser process, caches it, and notifies observers.
- **`aux_agent_button_`:** switches from a vector button to an image button with avatar, ring and dot states. It reuses `ChatThrobber` painting and the `ChatStatus` mapping, plus the `SetAvatarImage` monogram fallback for loading or no daemon. It updates its tooltip and accessible name, and announces running and approval changes (the open a11y item).
- **`toolbar_action_view.cc` pill:** avatar plus "Ask ‹Name›".
- **Chats section heading:** becomes "Side chats", and it filters out the home session id.
- **Colors** go through `aux_theme::SidebarForeground` and ColorProvider, never a hard-coded `SkColor`.
- **Strings:** new `IDS_AUX_*` entries with translator descriptions ("Ask $1", "$1 is working", "$1 needs your approval", "$1 unavailable").

### Security and privacy

- **Name and style** are user data placed in the system prompt. They are length-limited, newline-stripped and quoted. Personality text in SOUL.md is the user's own, as today.
- **Avatars:** decoded only in sandboxed processes and re-encoded by the daemon; no remote URLs.
- **Proactive posts** never take actions on their own. They follow the same permission mode and approvals as any turn.
- **Storage:** all state stays in the profile's account root. Nothing new goes to `aux-cloud`; cloud sync of the agent profile is a later, explicit choice.

## Phases

Each phase ends with `pnpm test`, focused checks, a receipt, a STATUS entry and a commit on local `main`. Native phases get one disposable real launch through `Launch Aux.command` (or the release launcher), and UI is verified on a resealed build.

**Phase 0. Decisions and the contract.**
- The contract says supplied screens are reused 1:1, with no new screens. This feature needs a written owner exception in `AGENTS.md` and `aside-contract.md`, scoped to "the Agent layer", so it doesn't become precedent for redesigning other surfaces.
- Settle the open questions below.
- Spike: confirm that auto-compaction holds over a synthetic 500-turn home thread with the fake provider, and that `keep-session` plus per-turn rebinding keeps browsing identical.

**Phase 1. Daemon foundation.**
- Agent store, avatar ingest, `agent.*`, `/agent/for-chrome`, `/agent/avatar`, home thread, live identity and prompt refresh, side chats without transcript copy, per-turn binding.
- Tests: every `agent.*` path; prompt text identical to today when no agent.json exists; prompt refresh on each file change; 500-turn compaction; side-chat seed size; name injection attempts; bad and huge images.
- **Done when** a daemon-only run creates an agent, renames it, and the next turn's prompt says the new name, with zero diff for users who never set one.

**Phase 2. Extension.**
- Side panel home thread, header and activity line, message avatars, composer, chat menu, new-tab routing, the setup sheet, Settings › Agent, strings.
- **Done when** a resealed build shows the setup sheet once, and the home thread survives tab switches, a second window, and Quit/reopen.

**Phase 3. Native button.**
- Identity service, avatar button with states, toolbar pill, the Side chats section, a11y announcements, the unavailable/Retry state.
- **Done when** renaming or changing the avatar in Settings updates the sidebar button in every window without a relaunch, and each state (running, approval, unread, down) is visible on a real launch.

**Phase 4. Muse-style proactivity.**
- Routine results posted into the home thread, the proactivity levels, rate limit, and a notification (existing `aux_notification`) when the agent needs approval while the panel is closed.
- **Done when** a routine set up by asking the agent reports back in the home thread, and Off silences it.

**Phase 5. Acceptance journeys** (added to `scripts/acceptance/JOURNEYS.md`):
1. First-run setup.
2. Messaging from the sidebar button in two windows.
3. A side chat inherits persona and memory but not the transcript.
4. Rename and avatar change propagate.
5. Quit/reopen keeps the home thread.
6. Work and personal profiles keep separate agents.
7. Incognito has no agent.
8. A browsing task (open, read, click, fill) behaves the same as today.
9. Approval card from the home thread.
10. The daemon is killed while the agent runs: Retry recovers it.

AI turns use only the Muse Gateway test connection within the recorded spending authority.

Phases 1 and 3 (native) can run in parallel worktrees once the `/agent/for-chrome` shape is fixed. Phase 2 depends on phase 1, and phase 4 on phases 1 and 2.

**Later (not in v1):** several named agents per profile, agent-generated avatars ("make yourself a wizard"), a realtime/voice avatar, cloud sync of the agent profile, a Goals tab for long-running plans.

## Risks

- **Cost and latency of a forever thread.** Compaction plus memory bound the context. The prompt is rebuilt only when identity or memory changes, so the provider's prompt cache keeps working. The 500-turn spike checks this before UI work starts.
- **Minified bundle edits.** New screens go into new files, so anchor edits stay small. A supplied update means re-anchoring, and count checks make any drift fail loudly.
- **Two windows typing at once.** Both go through the existing queue/steer, and each turn binds to its sender's window.
- **The unchanged-browsing promise.** Journey 8 plus a test that `createAgentToolset` output is byte-identical for an agent session versus an ordinary one.

## Decisions (owner, 2026-10-28)

1. One agent per profile in v1; the store is versioned so more can follow.
2. The sidebar Aux button opens the agent's home thread in the right side panel. The right side panel stays: it is the agent's quick view, and a pop-out control opens the same thread in a full tab (`main.html#/u/<account>/tasks/<home>`).
3. Avatars: the default Aux mark, a monogram or emoji on a theme color, or an uploaded photo. The extension renders every choice to a 256 px PNG, so the daemon and the native button handle one format.
4. New-tab prompts go to the home thread.
5. Proactivity defaults to Light.
6. The agent is called "Aux" by default, pre-filled in the setup sheet.

## Progress (2026-10-28)

Built and checked on screen in Developer ID build 48 (`out/release/1.0.0-48`, local):

- **Sidebar:** an Agent row leads the sidebar, under the address field. It shows the agent's face (picture or Aux mark, a spinning ring while it works, amber or accent dots when it waits or has replied) and its name on a soft card, and opens the side panel. It replaces the Chats list and the old button inside the address field (Robert's review, build 44). The Chats controller still runs: it feeds the agent identity and the projection of chat-owned tabs.
- **Side panel:** this is the agent's quick view.
  - The header shows the face and name, which open Customize.
  - "+" opens a side chat, with a back control to the agent.
  - The pop-out opens the full view.
  - An empty conversation shows the agent greeting in place of the supplied faint logo.
  - The composer reads "Message ‹Name›, @ for context".
- **Meet your agent / Customize:** a full-panel view, not a dialog, so nothing spills out of a narrow panel. It covers:
  - Name.
  - Look: the Aux mark as Classic, Ocean, Iris, Rose, Ember, Aurora, Sunset, Neon or Halo, or "+" for your own image.
  - Style and Initiative as wrapping chips.
- **Settings › Agents › Your agent:** the same fields, plus Personality (SOUL.md) and Instructions (AGENTS.md).
- **Checked on screen:** first-run sheet, choosing Aurora, then Classic, with the sidebar row and panel updating live, the greeting, "+" side chat and back.
- **Tests:** 11 agent tests and the release transforms test.

Not done or not verified:
- **New tab:** prompts still open as a full-page side chat.
- **Initiative:** shapes the agent's behavior, but routine results are not yet posted into the home thread.
- **No per-message avatars:** the header names the agent instead.
- **No provider connected in the review profile:** so no AI turn, home-thread claim on first send, prompt identity or tab-switch behavior was exercised live. Those paths are covered by unit tests only.
