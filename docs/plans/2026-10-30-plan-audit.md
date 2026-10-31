> **Superseded:** the [finish plan](../ROADMAP-EXECUTION-GRAPH.md) replaces this page wherever they disagree. It stays for its decisions and history.

Audit of build 112 against docs/plans/2026-10-29-browser-excellence.md.

Audit of `docs/plans/2026-10-29-browser-excellence.md` against the code and the assembled build 112. Nothing was edited, committed or launched.

**Result:** the Chromium sidebar, Spaces and frame work (Batches 1, 3, 4, 5) mostly matches the Progress section. Three areas are far behind it:
- Onboarding (Batch 6) is largely unbuilt.
- chrome://settings cleanup (Batch 7) is essentially unbuilt.
- The Batch 8 approvals popover is missing.

Build 112 also still ships things Progress or the plan treat as gone. The Google Lens string, the password-import labels and the Pro strings are all still in its assets.

**Path prefixes**
- S = /Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src
- F = S/chrome/browser/ui/views/frame
- X = /Users/rcourson/Documents/Vibe/Aux/vendor/aux-extension/routes
- P = /Users/rcourson/Documents/Vibe/Aux/vendor/provided
- B = /Users/rcourson/Documents/Vibe/Aux/out/release/1.0.0-112/Aux.app/Contents/Resources/aux/apps/extension/dist/assets

## 1. PARTIAL and MISSING items

### Batch 1
- **1.1 PARTIAL:** the page-first split is done. There is no "always use for Aux" switch per shortcut (S/chrome/browser/ui/aux_keyboard_shortcuts.mm:595-608 has only a fixed `IsBrowserFirst`). Fix: a pref list consulted in `IsBrowserFirst`, plus a toggle on the Shortcuts page.
- **1.2 PARTIAL:** the window no longer waits for the daemon (browser_platform.cc waits on the extension for at most 5 s). There is no "starting" state, and "The agent couldn't start — Try again" exists nowhere. The only state is "Can't reach" (IDS_AUX_AGENT_UNREACHABLE, S/chrome/browser/ui/views/location_bar/aux_agent_button.cc:121). Fix: add starting and failed states to AuxAgentIdentity, with a Try again action.
- **1.3 PARTIAL:** rows stay alive, drags defer refresh, and menus check only their own entry. The Delta is ignored (F/aux_organization_tree_view.cc:798 discards it; `Refresh` recomputes the whole list). No per-refresh handle→index map exists (35 `GetIndexOfTab` calls in the controller). I found no guard for "no Notify when Reconcile changed nothing". Fix: early-out on an empty delta, and build the map once in Reconcile.
- **1.4 PARTIAL:** scope is correct, but Clear runs one ArchiveLogicalEntry per tab (F/aux_tabs_actions.cc:208), so it is not one batch and has no Undo. It also skips tabs inside folders. Fix: send one command list and show Undo in the status line.
- **1.11 PARTIAL:** fallbacks exist, but the refused paths only log, for example "continuation_refused=organization" at F/aux_organization_window_controller.cc in ContinueManualClose. No status shows. Fix: call the tree's Status on refusal. (Moderate confidence.)

### Batch 2
- **Pins global across groups, PARTIAL:** pins live in each profile's model. space_directory.cc lists only Spaces, and I found no cross-group pin code. Fix: mirror pin entries across groups, or record the decision.
- **Link routing targets Spaces, PARTIAL:** rules still store `Destination{profile_id, space_id}` (S/chrome/browser/aux/routing/routing_model.h:10). routing_service.cc does read the directory, so confirm what the Settings UI shows.
- **One home thread, PARTIAL:** `homeSessionId` is per account (P/agent/aux-agent.mjs:38,159), and Progress says each group keeps its own. This contradicts "one … home thread". The per-Space browsing context is also unverified. Robert should decide; the smallest fix is one shared home session id.
- **"Duplicate into…", MISSING:** nothing in F/aux_space_menu.cc:202-211. Fix: a menu item that copies entries into the chosen group.
- **"Add your extensions" on isolated Create, MISSING:** no match in F/aux_space_create_view.cc or the extension.
- **Model tests, MISSING:** organization_model_unittest.cc is not in any BUILD target and has zero group or migration tests. Linking needs the toolchain allowlist edit Robert owns.

### Batch 3
- **Focus ring, PARTIAL:** rows have one, but pin tiles (`EntryView`, S/chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.cc:172,186) and bookmark rows (F/aux_vertical_bookmark_row_view.cc:129) are focusable with no ring. Fix: `FocusRing::Install` on each.
- **One context menu, PARTIAL:** a live pin gets Chromium's TabMenuModel; a saved pin gets only Unpin (same file :1242, :1264-1265). Fix: share the tree menu builder.
- **Multi-select, PARTIAL:** archive, unload, pin, move and folder act on the selection. Drag moves only `drag->id` (tree_view FinishDrag). × and middle-click close one row. Fix: use `SelectionFor` in FinishDrag and CloseEntry.
- **Drag pins and bookmarks back into Tabs, MISSING:** F/aux_cross_section_drag_coordinator.cc has no Tabs target (moderate confidence). Fix: add a tree drop target that sends kMoveEntry.
- **Autoscroll in any sidebar drag, PARTIAL:** only the tree does it; the coordinator has none.
- **6 px threshold unified, PARTIAL:** verified only in the tree. No threshold constant shows in the pin, bookmark, dot or coordinator files.
- **Folder double-click, PARTIAL:** it toggles, then undoes the toggle (tree_view "undo that"), so it flickers. Fix: defer the toggle by the double-click interval.
- **Focus steal, PARTIAL:** the delay is 250 ms now, but InlineNameField::OnBlur still takes focus back once.
- **Row painter and close button, PARTIAL:** tab rows use an ImageButton; bookmark rows use TabCloseButton (F/aux_vertical_bookmark_row_view.cc:123) and a separate painter.
- **Status line, PARTIAL:** it sits above the rows but inside the scroll body, so it scrolls away in a long list. Fix: move it to the section header.

### Batch 4
- **Create swatches, PARTIAL:** they shrink and never wrap (F/aux_space_create_view.cc:163). Fix: two rows, minimum 24 px.
- **Saving spinner, MISSING:** fields lock (:511-518) but no spinner shows.
- **Move left/right in the Space menu, MISSING:** F/aux_space_menu.cc:202-211.
- **One preview per window, PARTIAL:** preview lives on the per-profile editor (aux_theme_editor.cc:386-391).
- **Preview ticks only this window, PARTIAL:** RefreshAuxPageTints walks all the profile's Agent frames (F/aux_page_tint.cc Refresh).

### Batch 5
- **R from the real corner, PARTIAL:** it uses a hard-coded 16 or 10 (F/aux_frame_metrics.h), not `_getCachedWindowCornerRadius`. It was measured only on 27, and the plan says 26 draws 20. Fix: read the real value, or measure on 26.
- **Card in every mode, PARTIAL:** `card` is vertical-only (layout_impl ~:320). The horizontal-tabs decision isn't recorded.
- **Pill fade, PARTIAL:** `SetVisible` with no fade; the 56 px zone is unchanged (F/multi_contents_view_mini_toolbar.cc:208-220).
- **Narrow-pane icons, MISSING:** still text "‹ ›" (F/multi_contents_view.cc:187). Fix: vector icons.
- **Dragging panes to rearrange, MISSING:** no code found.
- **Hidden sidebar tracking, PARTIAL:** the 240 ms reveal is done, but the 100 ms poll remains (F/aux_profile_preview_admission.cc:119). Inactive-window behaviour is unverified.
- **Frame keyed on the build flag, PARTIAL:** S/components/remote_cocoa/app_shim/native_widget_ns_window_bridge.mm:1108 still compares `BaseBundleID()`.
- **`UpdateAuxFramePresentation` posts only on change, PARTIAL:** `ScheduleAuxFramePresentationUpdate` posts unconditionally from 8 sites, with no input comparison.
- **Every side panel a sibling card, PARTIAL:** the layout_impl ~:300 shadow-off branch matches only the Agent extension panel. Other panels need a look on screen.

### Batch 6: mostly unbuilt
The flow is still the supplied one (`import-browser`, `glance`, `ai`, `done`).
- **Local-user guard, MISSING and the most serious gap in this batch:** `aux.onboarding.completed.v1` is written (X/onboarding-done.js:496) and read nowhere in the routes, patches or B. The review finding "new users who stay local never see onboarding" looks unfixed. Fix: read it in the app-root guard.
- **Keep hidden `keepTasksRunning`, PARTIAL:** it is still there (X/onboarding-done.js:446, 480, 604).
- **MISSING, all 0 hits in B:**
  - Step 1 Welcome.
  - Step 3 Keychain explainer.
  - Step 2 "Stay signed in" and "Passwords stay…".
  - The group-or-merge choice per profile.
  - The inline "Getting your agent ready…".
- **Step 4 password manager, MISSING:** still redirected away (/Users/rcourson/Documents/Vibe/Aux/scripts/lib/provided-password-manager-scope.mjs:29-38). Fix: drop that redirect.
- **Steps 5, 6, 7, PARTIAL:** the sheet exists only in the panel (P/agent/aux-agent-ui.js). "Make it yours" is not an onboarding step. Step 6 needs a look for CLI rows.
- **Step 8, PARTIAL:** default browser, Dock and crash reports exist; Tab cleanup is absent.
- **Sources Vivaldi, Opera, Chromium, Zen, Orion, MISSING:** S/chrome/browser/extensions/api/aux_browser_import/migrator.cc:75-85 has Edge but none of these. Fix: add family rows.
- **More data, MISSING:** open tabs, default search engine, re-import merge.
- **Bookmarks bar not forced on, MISSING:** import_service.cc:213-215 sets kShowBookmarkBar. Fix: gate on sidebar mode.
- **Dead path `chrome://aux-import-data`, MISSING:** still registered (chrome_content_browser_client.cc, import_webui.cc).
- **Copy, MISSING:** the "File › Export Browsing Data…" text isn't used (X/use-browser-importer.js:327-342). "Safari passwords ZIP" is still present. "Importing your passwords…" and "…autofill data…" are still in B/progress-CS-jrVXz.js and X/general-settings.js:716.
- **Onboarding skill and logins:** my check failed on a glob, so this is unverified.

### Batch 7
- **"Check for updates" line, MISSING:** "local build" has 0 hits. It shows "Updates are disabled for this build." (X/general-browser.js:313).
- **Background service version, MISSING:** it shows the daemon's version (X/general-browser.js:280-285, 344). The daemon Info.plist and manifest are 1.26.1016.x.
- **Context Awareness, PARTIAL:** "requires the Max plan" is still in X/context-awareness.js:491. Confirm it's unreachable.
- **Dead code, PARTIAL:**
  - The RemoteControl panel and "Upgrade to Pro" remain unrendered (X/developers-settings.js:432, 580).
  - `RecentChatsSetting`, `TidyTabsSetting` and `REMOTE_MESSENGERS` are unrendered remnants.
  - liquid-glass-playground is still in extension-main.
- **Ask before quitting ⌘Q, MISSING:** 0 hits.
- **chrome://settings, MISSING, all of it:** only `isAux` for one History return exists (privacy_page.ts:136). No hidden sections, no pref defaults, no Safe Browsing decision. The only related edit is account_consistency_mode_manager.cc:150. The smallest fix is route guards in settings_menu and basic_page keyed on `isAux`, plus pref defaults.
- **Tab menu block, PARTIAL:** it has no Move to Space, and labels don't show remapped keys, because AuxCommandItem has an empty keyEquivalent (S/chrome/browser/ui/cocoa/main_menu_builder.mm:362-369).
- **Command bar, PARTIAL:** no Import command, and no math or unit answers (`kNavigationCommands` in aux_keyboard_shortcuts.mm:88-143).
- **Shortcut errors, MISSING:** still "Shortcut conflict between commands N", with no Replace (aux_keyboard_shortcuts.mm ~:395-410).
- **Function keys, MISSING:** S/chrome/browser/ui/aux_keyboard_shortcut_parser.h:39-58 has none.
- **Ad-block pause from site info, MISSING:** Progress admits this. The Web Store banner rule is also not built.
- **Google Lens string, MISSING:** still in B/newtab-CnOLQ0yu.js.
- **Quit hides windows at once, MISSING:** no code found.

### Batch 8
- **8.3 PARTIAL:** Models groups are Subscription, API, Local (X/model-settings.js:1045-1047), and `AuxSignIn` is still in the source (:922). The plan wants Local agents and API keys.
- **8.4 PARTIAL:** detection, the ACP driver and Copilot are done. "Add a local agent…" and "Open Terminal" have 0 hits. Fix: a command row that registers an ACP entry.
- **8.5 PARTIAL:** approvals are wired. Folders granted in Settings › Agent aren't passed to CLIs.
- **8.8 PARTIAL:** one session per thread is done. There is no fast-model routing for titles or download names.
- **8.12 MISSING:** no amber-dot popover (aux_agent_button.cc), and AuxTaskReviewBubble and AuxNativeTaskFeed are still dead, with no live constructor of AuxSidebarView. Build it or delete them.
- **8.13 PARTIAL:** Stop is done. No working mark on driven tab rows.
- **8.14 PARTIAL:** backoff and "Can't reach" are done. The feed is not shared; polls stay per window (F/aux_chats_transport.cc:35, aux_agent_session_tabs_source.cc).
- **8.16 PARTIAL:** gated on `IsDrawn()`, not the focused window (aux_agent_button.cc:112).
- **8.21 PARTIAL:** the menu exists; Routines, channels and New Tab filters are unconfirmed.
- **8.23 PARTIAL:** no queue or fast model found in P/aux-productivity-files.mjs.
- **8.25 MISSING:** no offline or network error kinds (X/error-alert.js).
- **Clean-up PARTIAL:** `aux_credentials` is still compiled and exposed (S/chrome/common/extensions/api/api_sources.gni:180). "Add credits" and "Free plan" remain in B.
- **8.1 note:** I count it DONE as the Google-through-browser client, which differs from the plan's provider-tool design.

### Batch 9
- **Permissions pane name per OS, MISSING:** no version branch found.

### Batch 10 (non-route items)
- **CLI parity, PARTIAL:** `ask`, `exec`, `repl`, `mcp` are not built (Progress admits this).
- **Runtime, PARTIAL:** only the 34 PDF-stack files are rebuilt, not Node, Python or rg.
- **Rule changes:** AGENTS.md still says "reuses the Aside implementation". That is awaiting Robert, not a code gap.
- **Native addons:** not swapped in.

## 2. Counts
These are approximate: each table row or bullet is one item. Items I couldn't settle by reading code are in section 3.

| Batch | DONE | PARTIAL | MISSING | N/A |
|---|---|---|---|---|
| 1 | 7 | 5 | 0 | 0 |
| 2 | 10 | 3 | 3 | 0 |
| 3 | 43 | 8 | 1 | 0 |
| 4 | 39 | 3 | 2 | 0 |
| 5 | 31 | 7 | 2 | 3 |
| 6 | 8 | 6 | 14 | 0 |
| 7 | 26 | 5 | 16 | 1 |
| 8 | 24 | 11 | 3 | 1 |
| 9 | 8 | 0 | 1 | 1 |
| 10 (non-route) | 6 | 3 | 0 | 0 |

**NOT-APPLICABLE**
- Card edge soft shadow: the no-shadow decision in Progress.
- Accent ring on the active pane: quiet hairlines, commit 5e692fc22.
- The traffic-light 76 constant: not found; leading inset is computed.
- Sidebar ⋯ menu hints: it sits in dead AuxSidebarView.
- `aside_*` popup names: set by the supplied extension.
- REPL hiding: the REPL is inactive pending Apple.

Separately, 300 ms split arming and 600 ms Space hover differ from the plan's 450 and 500 but follow the Tabs rework, so I counted them DONE.

## 3. Live checks (not code gaps)
**Needs Robert or a login**
- CLI provider turns, including approval cards on a CLI turn.
- Dictation permission prompts.
- Arc import against a real `StorableSidebar.json`.
- Keychain cookie import.
- 1Password pairing.
- The gateway test turn.

**Needs a macOS VM**
- macOS 15 and 26 runs, including `p256_v1` selection.
- The frame on 15 and the corner on 26.

**One look on a real build**
- Web search through the browser client.
- A themed Space on the single surface, and the theme picker on a 13-inch screen.
- Peek and Little Aux by hand.
- Sticky address row while scrolling.
- Window drag from the gutter and under the last row; double-click zoom.
- Many pins not squeezing Tabs.
- Crash-restore bubble anchor.

**Not settled by reading code**
- Settings › Send feedback target.
- Agent page runtime copy and where "Clean up agent tabs" sits.
- Hiding of the content-filter debug page.
- About page version.
- 8.15, clicking the button returns to the home thread.
- The Create panel closing on a group change.
- The narrow-split layout loop.
- The 0.5 DIP divider (not located).

## 4. Settled after the report was delivered
Sections 1–3 above are the report as delivered. These three results replace the matching entries there.

- **Onboarding skill and logins: MISSING (Batch 6).** The skill still promises logins. Line 64 of /Users/rcourson/Documents/Vibe/Aux/vendor/aux-skills/builtin/onboarding/SKILL.md reads "Brings over their bookmarks, logins and history", and the copy in build 112 has the same line (`Aux Daemon.app/Contents/Resources/static/skills/builtin/onboarding/SKILL.md:64`). Fix: drop "logins" from that row.
- **Settings › Send feedback: DONE, in a different form from the plan.** The Settings dialog (B/route-TQyeTEXE.js) no longer posts to a hosted route. It builds a `mailto:hello@getaux.co` message and tells the user their mail app has it ready to send. It does not open a support page, which is what the plan asked for, but it no longer calls a missing route. The separate task-session "Send feedback" (X/task-session.js:1777, X/session-feedback-dialog.js) is a different path: P/aux-session-feedback.mjs:6 throws "Feedback needs an Aux cloud account. You can email hello@getaux.co instead." for local accounts. That is a plain error, not a broken route, but local users can still reach it. Whether to hide it for them is Robert's call.
- **Context Awareness "requires the Max plan": DONE, not reachable from the UI.** The only reference to `memories/context-awareness` in the whole of B is the route definition in `extension-main-Dz1-AsCT.js`. Nothing links to it: no match in X/memory-settings.js, X/memory-layout.js or X/settings-shell.js. The route has no redirect, so the page still opens by typed URL, and the string would show there for an ineligible account (X/context-awareness.js:346, 491). The daemon also refuses the setting for ineligible accounts (/Users/rcourson/Documents/Vibe/Aux/vendor/aux-daemon/namespaces/settings.mjs:20). The route and string are now dead-code clean-up, not a visible leftover.

**Count changes from these results**
- Batch 6: MISSING 14 → 15. The skill item was not counted before.
- Batch 7: DONE 26 → 28, PARTIAL 5 → 4. Context Awareness moves from PARTIAL to DONE, and Send feedback, previously uncounted, becomes DONE.

The working tree changed while this audit ran: `vendor/aux-extension/` has uncommitted edits and new route files from other work. Source citations under X reflect the tree when they were read; B is the fixed record of build 112.
