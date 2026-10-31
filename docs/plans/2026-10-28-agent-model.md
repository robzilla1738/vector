# Aux: one personal agent in the browser

> **Superseded:** the [finish plan](../ROADMAP-EXECUTION-GRAPH.md) replaces this page wherever they disagree. It stays for its decisions and history.

**Superseded 2026-10-30 (Robert):** the one-thread agent is gone. The agent keeps its name, look and sidebar button, but work happens in individual chats: the panel opens on a chat, New chat starts one, and the Chats menu lists them. The old home thread is an ordinary chat. The sidebar doesn't list chats. `aux ask` and `repl` still keep one ongoing chat. Read the rest of this page as history.

Approved by Robert, 2026-10-28 ("do this all"; product decisions delegated: "make best decisions to result in the best product"). This page is the current design; the dated decisions behind it are at the end.

## The idea

Each browser profile has one agent, called **Aux** by default, instead of a pile of separate chats. The agent has a name and a face, one long-running conversation (its **home thread**), and the account's memory. It browses and gets things done when you ask. Anything it does on its own comes from **routines** you set up, never from a personality setting. **Side chats** are there for focused or throwaway work: they know what the agent knows (instructions, memory) but start with a fresh transcript. The model follows Meta's Muse: one agent you message like a person, plus side chats.

The agent runs on whatever model and connection the user has set up (BYOK or a signed-in subscription). It is not tied to a provider.

## What does not change

The agent is a layer of identity and threading over the existing engine:

- **Browsing:** the browser tools, the extension bridge and `Aux.*` commands, CDP, tab ownership and the permission modes (`guard`, approvals, final confirm).
- **Models:** `settings.defaultModel` → `resolveSessionModel`, BYOK, subscriptions and the provider CLIs.
- **Memory, skills, MCPs, projects, routines, channels:** unchanged, reachable from the home thread and from side chats.
- **Incognito:** no agent identity work, no memory, as before.

## Design

### Who the agent is

- **Name:** the default is **Aux**, the browser's own name. Users can rename it (one line, 1–32 characters, no markup).
- **Face:** the Aux mark.
  - Looks: Classic (the mark in the theme's text color, the default), Ocean, Iris, Aurora and Sunset, plus "+" for your own picture.
  - Classic is drawn live on every surface; the colored looks are saved as a transparent picture of the mark.
- **Instructions:** one free-text field, stored as the account's `AGENTS.md`, which the agent reads before every conversation.
- **Memory:** the existing memory system, linked from Settings.
- **No style or initiative settings.** The agent works on request. The prompt says it takes on work unprompted only through routines, and Settings points there.

### Where it lives

- **Sidebar:** a compact button to the right of the address field.
  - The same tile as a pinned tab: a faint fill, a hairline edge and a lighter fill on hover, at the field's height and 10 pt corners. (Builds 51–57 used a liquid-chrome bezel; Robert dropped it on 2026-10-29: "make the aux one match the pinned one".)
  - The face sits inside the bezel. A thin ring spins while the agent works. An amber dot means it needs approval or has a question; an accent dot means it replied while you were away.
  - The tooltip and screen-reader name are "Ask ‹Name›", and status changes are announced.
  - There is no Chats list in the sidebar any more.
- **Toolbar mode** (no sidebar): the "Ask ‹Name›" pill shows the face.
- **Right side panel:** this is the agent's quick view.
  - The header shows the name alone and opens Customize, then the "Side chats" menu, "+" for a new side chat, the pop-out to the full view, and Close.
  - An empty conversation greets you with "Hi, I'm Aux".
  - The composer says "Message Aux, @ for context" and follows renames live.
  - In a side chat, "‹ Aux" returns to the home thread.
- **Full view:** the same thread in a tab (`main.html#/u/<account>/tasks/<id>`).
- **One logo per surface:** each surface shows a single face (button, greeting or editor preview). Pickers use color swatches. Favicons and tab icons don't count.

### Meet your agent, Customize, Settings

- **Meet your agent:** first run, once per profile. Name and look; Skip or Done.
- **Customize** (from the panel header): name, look and Instructions, plus a line pointing to Routines.
- **Settings › Agent › Your agent:** (the page and its navigation item say "Agent", since there is one)
  - name and look
  - Instructions
  - links to Memory and Routines

  The supplied "Ask Aux on tab switch" option is gone: the panel always stays on the conversation you are in.

### The home thread

- The first message sent from an empty panel becomes the home thread. After that, opening the panel opens it, and tab switches never start a new chat.
- **Prompt:** every prompt names the agent outright ("You are Aux, the user's personal agent, built into the Aux browser… Your name is Aux…").
  - Without that, models answered with their own model name; this was seen live.
  - The home thread's prompt is rebuilt when the name, `SOUL.md` or `AGENTS.md` changes, and otherwise at most every six hours, so the provider's prompt cache keeps working between turns.
- **Rename:** a rename adds a hidden system note to the home thread. Otherwise a long thread keeps using the name from its own earlier replies; this was seen live.
- **Archived home:** if the home thread is archived or deleted, the next message from an empty panel becomes the new one.
- **Long threads:** they rely on the existing auto-compaction and memory.

## How it is built

| Layer | Where | Notes |
|---|---|---|
| Daemon | `vendor/provided/agent/aux-agent.mjs` | Profile `agent/agent.json` (v3; v2 profiles still on the retired default Otto move to Aux) and `agent/avatar.png` under the account control root, where the agent's file tools don't write. Covers identity, prompt staleness, the rename note and the native feed. |
| Daemon wiring | `vendor/provided/agent/integration.mjs` (`DAEMON_EDITS`) | Count-checked edits to `aux-native-entry.mjs`: tRPC `settings.agent*`, the `agent` field on `/session/for-chrome/chats`, `GET /agent/for-chrome/avatar`, the prompt opener and staleness check. |
| Extension | `vendor/provided/agent/aux-agent-ui.js` + `EXTENSION_EDITS` | The agent store, the mark and its looks, the side panel title, home route and greeting, Meet/Customize, the Settings section and the composer hint. Copied to `dist/assets/` and imported by count-checked edits to six chunks. |
| Native | `chromium/tree` | `aux_agent_identity.{h,cc}` (identity per window, sandboxed avatar decode, `PaintAgentMark` with `kAuxNewTabMarkIcon`); `aux_agent_button.{h,cc}` (the chrome button); the layout in `toolbar_view.cc`; the Chats list hidden in `aux_sidebar_body.cc`. |
| Release | `scripts/release/transforms.mjs` | Adds the files and applies the edits after the package edits. |

Tests: `vendor/provided/agent/*.test.mjs` (unit, and integration against the candidate's real files) and `scripts/release/transforms.test.mjs`.

## Open

- **New-tab prompts** still open as a full-page side chat; they don't go into the home thread.
- **Routines report** where the supplied app sends them. A routine created from the home thread notifies its parent, but routines created elsewhere don't post into the home thread.
- **Panel reopen:** the panel remembers the side chat you left it on. Clicking the button doesn't jump back to the home thread.

## Decisions (owner, 2026-10-28)

1. One agent per profile. The right side panel stays as the quick view, with a pop-out to the full view.
2. The agent is Aux, with the Aux mark as its face. A mascot (Otto, a pebble with two eyes) was tried in builds 53–54 and dropped: "go back to it being the Aux logo and being Aux".
3. No style or initiative options: the agent works on request, and routines are where initiative lives. Name, picture and instructions are the settings.
4. A few nice looks plus a custom picture.
5. In the sidebar, a small button to the right of the address field, styled like a pinned-tab tile, not a row and not a Chats list (the liquid-chrome finish was dropped on 2026-10-29).
6. At most one logo per surface (favicons and tab icons aside).

## History

- Build 44: first build, with a button inside the address field and a dialog for setup.
- Builds 46–48: an Agent row replaced the Chats list, setup moved to a full-panel view, and the looks were Aux-mark finishes.
- Builds 48–50: live check with Muse Spark 1.3 Contributor through AI Gateway (receipt `docs/integration/proposed/completion-20261026/runtime/agent-live-a1/actual-result.json`). The first message claimed the home thread; browsing, tab switches and renames worked. Two fixes came out of it: the outright name in prompts, and the rename note.
- Builds 51–52: the chrome button beside the address field, one logo per surface, and the composer footer gap.
- Build 53: Otto. Mascot face, five looks, no style or initiative, and Instructions plus Memory and Routines in Settings.
- Build 54: Instructions hide the seeded heading, and the new tab page keeps one Aux mark. Checked on screen: Meet Otto, the button, the panel greeting, Customize (all looks), Settings › Agents, the full view and the new tab page. The test threads from the live check are archived in the review profile; they can be restored from Archived chats.
- Build 55: back to Aux. The default name is Aux again and the face is the Aux mark, in Classic plus four colors; Otto profiles move to Aux. The agent experience (home thread, side chats, chrome button, Instructions, no style or initiative) is unchanged.
- Build 56: colored looks render the mark larger so it matches Classic inside the sidebar button. Checked on screen: the button (Classic and Sunset), the panel greeting, Customize with every look, Settings › Agents and the full view.
- Build 58: the button is a pinned-tab tile instead of liquid chrome, and Settings says "Agent" instead of "Agents". Checked on screen.
