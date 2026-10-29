# Otto: one personal agent in Aux

Approved by Robert, 2026-10-28 ("do this all"; product decisions delegated: "make best decisions to result in the best product"). This page is the current design; the dated decisions behind it are at the end.

## The idea

Each browser profile has one agent, **Otto**, instead of a pile of separate chats. Otto has a name and a face, one long-running conversation (its **home thread**), and the account's memory. It browses and gets things done when you ask. Anything it does on its own comes from **routines** you set up, never from a personality setting. **Side chats** are there for focused or throwaway work: they know what Otto knows (instructions, memory) but start with a fresh transcript. The model follows Meta's Muse: one agent you message like a person, plus side chats.

Otto runs on whatever model and connection the user has set up (BYOK or a signed-in subscription). It is not tied to a provider.

## What does not change

The agent is a layer of identity and threading over the existing engine:

- **Browsing:** the browser tools, the extension bridge and `Aux.*` commands, CDP, tab ownership and the permission modes (`guard`, approvals, final confirm).
- **Models:** `settings.defaultModel` → `resolveSessionModel`, BYOK, subscriptions and the provider CLIs.
- **Memory, skills, MCPs, projects, routines, channels:** unchanged, reachable from the home thread and from side chats.
- **Incognito:** no agent identity work, no memory, as before.

## Design

### Who Otto is

- **Name:** the default is **Otto**. It's short and friendly, a nod to "auto", and distinct from the Aux browser. Users can rename it (one line, 1–32 characters, no markup).
- **Face:** a small rounded pebble with two pill eyes.
  - Looks: Silver (the default), Sky, Peach, Mint and Midnight, plus "+" for your own picture.
  - The face is never the Aux logo: Aux is the browser, Otto is the agent.
- **Instructions:** one free-text field, stored as the account's `AGENTS.md`, which Otto reads before every conversation.
- **Memory:** the existing memory system, linked from Settings.
- **No style or initiative settings.** Otto works on request. The prompt says it takes on work unprompted only through routines, and Settings points there.

### Where it lives

- **Sidebar:** a compact button to the right of the address field.
  - A liquid-chrome bezel matches the field's height and 10 pt corners: a soft sheen, and a rim that catches light at its top and bottom edges.
  - The face sits inside the bezel. A thin ring spins while Otto works. An amber dot means it needs approval or has a question; an accent dot means it replied while you were away.
  - The tooltip and screen-reader name are "Ask ‹Name›", and status changes are announced.
  - There is no Chats list in the sidebar any more.
- **Toolbar mode** (no sidebar): the "Ask ‹Name›" pill shows the face.
- **Right side panel:** this is Otto's quick view.
  - The header shows the name alone and opens Customize, then the "Side chats" menu, "+" for a new side chat, the pop-out to the full view, and Close.
  - An empty conversation greets you with "Hi, I'm Otto".
  - The composer says "Message Otto, @ for context" and follows renames live.
  - In a side chat, "‹ Otto" returns to the home thread.
- **Full view:** the same thread in a tab (`main.html#/u/<account>/tasks/<id>`).
- **One logo per surface:** each surface shows a single face (button, greeting or editor preview). Pickers use color swatches. Favicons and tab icons don't count.

### Meet Otto, Customize, Settings

- **Meet Otto:** first run, once per profile. Name and look; Skip or Done.
- **Customize** (from the panel header): name, look and Instructions, plus a line pointing to Routines.
- **Settings › Agents › Your agent:**
  - name and look
  - Instructions
  - links to Memory and Routines

  The supplied "Ask Aux on tab switch" option is gone: the panel always stays on the conversation you are in.

### The home thread

- The first message sent from an empty panel becomes the home thread. After that, opening the panel opens it, and tab switches never start a new chat.
- **Prompt:** every prompt names the agent outright ("You are Otto, the user's personal agent, built into the Aux browser… Your name is Otto…").
  - Without that, models answered with their own model name; this was seen live.
  - The home thread's prompt is rebuilt when the name, `SOUL.md` or `AGENTS.md` changes, and otherwise at most every six hours, so the provider's prompt cache keeps working between turns.
- **Rename:** a rename adds a hidden system note to the home thread. Otherwise a long thread keeps using the name from its own earlier replies; this was seen live.
- **Archived home:** if the home thread is archived or deleted, the next message from an empty panel becomes the new one.
- **Long threads:** they rely on the existing auto-compaction and memory.

## How it is built

| Layer | Where | Notes |
|---|---|---|
| Daemon | `vendor/provided/agent/aux-agent.mjs` | Profile `agent/agent.json` (v2) and `agent/avatar.png` under the account control root, where the agent's file tools don't write. Covers identity, prompt staleness, the rename note and the native feed. |
| Daemon wiring | `vendor/provided/agent/integration.mjs` (`DAEMON_EDITS`) | Count-checked edits to `aux-native-entry.mjs`: tRPC `settings.agent*`, the `agent` field on `/session/for-chrome/chats`, `GET /agent/for-chrome/avatar`, the prompt opener and staleness check. |
| Extension | `vendor/provided/agent/aux-agent-ui.js` + `EXTENSION_EDITS` | The agent store, Otto's face, the side panel title, home route and greeting, Meet/Customize, the Settings section and the composer hint. Copied to `dist/assets/` and imported by count-checked edits to six chunks. |
| Native | `chromium/tree` | `aux_agent_identity.{h,cc}` (identity per window, sandboxed avatar decode, `PaintOtto`); `aux_agent_button.{h,cc}` (the chrome button); the layout in `toolbar_view.cc`; the Chats list hidden in `aux_sidebar_body.cc`. |
| Release | `scripts/release/transforms.mjs` | Adds the files and applies the edits after the package edits. |

Tests: `vendor/provided/agent/*.test.mjs` (unit, and integration against the candidate's real files) and `scripts/release/transforms.test.mjs`.

## Open

- **New-tab prompts** still open as a full-page side chat; they don't go into the home thread.
- **Routines report** where the supplied app sends them. A routine created from the home thread notifies its parent, but routines created elsewhere don't post into the home thread.
- **Panel reopen:** the panel remembers the side chat you left it on. Clicking the button doesn't jump back to the home thread.

## Decisions (owner, 2026-10-28)

1. One agent per profile. The right side panel stays as the quick view, with a pop-out to the full view.
2. The agent is not called Aux, and its face is not the Aux logo. Robert asked for a mascot; Otto and its pebble face are the result.
3. No style or initiative options: the agent works on request, and routines are where initiative lives. Name, picture and instructions are the settings.
4. A few nice looks plus a custom picture.
5. In the sidebar, a small button to the right of the address field with a tasteful liquid-chrome finish, not a row and not a Chats list.
6. At most one logo per surface (favicons and tab icons aside).

## History

- Build 44: first build, with a button inside the address field and a dialog for setup.
- Builds 46–48: an Agent row replaced the Chats list, setup moved to a full-panel view, and the looks were Aux-mark finishes.
- Builds 48–50: live check with Muse Spark 1.3 Contributor through AI Gateway (receipt `docs/integration/proposed/completion-20261026/runtime/agent-live-a1/actual-result.json`). The first message claimed the home thread; browsing, tab switches and renames worked. Two fixes came out of it: the outright name in prompts, and the rename note.
- Builds 51–52: the chrome button beside the address field, one logo per surface, and the composer footer gap.
- Build 53: Otto. Mascot face, five looks, no style or initiative, and Instructions plus Memory and Routines in Settings.
- Build 54: Instructions hide the seeded heading, and the new tab page keeps one Aux mark. Checked on screen: Meet Otto, the button, the panel greeting, Customize (all looks), Settings › Agents, the full view and the new tab page. The test threads from the live check are archived in the review profile; they can be restored from Archived chats.
