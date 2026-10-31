# Review checklist, build 136

Launch it: `/Users/rcourson/Documents/Vibe/Aux/out/release/1.0.0-136/Aux.app/Contents/MacOS/Aux --use-mock-keychain`

Everything is committed locally. Nothing has been pushed.

## Seen working on screen

- Frame, gutters, theme, pins, bookmarks and the address row, in single and split.
- Domain click edits the address. Hover preview. Closing hovered tabs quickly.
- Split from the row menu, including with a Settings tab, and after a restart.
- A second Space: separate pins, bookmarks and theme. Create and delete.
- Little Aux from `aux open`, Open in Aux. Peek with Option-Shift-click.
- Onboarding, every step, with Skip on Models. It stays finished afterwards.
- Settings: General, Account, Developers, Models, Add a local agent, search, the import picker.
- Crash recovery: Restore pages, splits and pins come back.
- `aux list`, `tabs`, `spaces`, `resolve`, `open`, and `aux mcp` tools against the live browser.
- Individual chats: the panel opens on a new chat, with New chat and the Chats menu. The sidebar lists no chats.
- Web search, and Reading Mode in a split, in theme.
- The agent opening a page from Settings and from a web page, and reading it. Chat filters, gutter drag, the working dot.
- The rebuilt runtime under Developer ID: `rg`, Node, Python and the PDF tools. One agent turn.

## Only you can test

1. A real password import, then a login filling on a site.
2. A real Arc import.
3. Dictation.
4. Connecting 1Password. It failed under `--use-mock-keychain` with `EXTERNAL_SAVE_FAILED`, which is probably the test keychain. Try without that flag.
5. `aux chats`, `aux mcp list` and `aux ask`. They report a locked vault under the mock keychain.
6. A run on macOS 15.
7. The Theme picker on a 13-inch screen.

## Not yet seen

The approval popover: Ask first didn't raise one for a link click. There's also no pane swap control on the split pill, which shows the domain and a close button. These are built and tested in code, but I didn't reach them on screen in this round.

## Needs your decision

1. **Link filter.** Run this to let the PDF add-on and the Arc fixture test link:

   ```bash
   python3 -c 'import json; p="/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src/build/toolchain/apple/excluded-product-outputs.json"; d=json.load(open(p)); d+=["./aux-pdf.node","./arc_fixture_probe"]; open(p,"w").write(json.dumps(d,indent=2)+"\n")'
   ```

2. **Crypto authority.** `Resources/aux-crypto` appears to serve hosted sync recovery, which is out of scope. It stays supplied unless you say otherwise.
3. **expat 2.6.3** in the rebuilt Python matches the upstream recipe but is old, and it predates fixes such as CVE-2024-8176. Bumping it is one manifest line plus a rebuild.
4. **Hosted sign-in chunks.** Unreachable from local mode now, but a paused account still links to them. Say if they should go.
5. **AGENTS.md rule wording**, the **unit-test allow-list**, how far **`aux exec --allow`** can pre-approve, and the Google Password page's **Offer to save** toggle.
6. **The debugger notice.** While the agent works, "Aux Browsing Agent started debugging this browser" shows above the page. It's Chromium's notice. It could move inside the card, as the plan says, or be hidden now that tab rows show agent work. Hiding it removes a visible warning, so that's your call.
7. **`apps/pdf-addon/build.sh`** is untracked. It goes once the PDF add-on links through the filter.

## Known gaps

- Aux's own `aux-macos-utilities.node` passes parity but is refused at bootstrap, so releases ship the supplied one. The cause needs a daemon build that reports it.
- The done step's bottom glow stays blue on other themes.
- `darwin-x64` node-pty files still ship, pinned by the supplied inventory.
- Web Store banner rule, theme preview per Space rather than per window, coalesced polls (8.14), Refresh still full (1.3), Orion bookmarks from an HTML export only, and no Firefox or Zen passwords.
- `openTab` is slow, about 45 seconds in one test, and the agent's first try often errors before it recovers.
- After a click navigates an attached tab, the agent can't read that tab. It's a deliberate safety rule, so loosening it is your call.
- Web search citations are labelled google.com.
- `bash` and file edits return "Supervised task execution is disabled in this browser build". That's the local browser-only mode.
- The daemon still has its home-thread code. `aux ask` uses that ongoing chat, and nothing else does.
- Build 124 and later testing closed some tabs in the review profile.
