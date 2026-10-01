# Browser-runtime lane briefs

These briefs supplement the complete specs in [BROWSER-RUNTIME-PLAN.md](BROWSER-RUNTIME-PLAN.md). They authorize no lane to start before the Wave 0 exit. The integrator supplies the actual `contracts-v1` ref, isolated worktree and live agent roster at dispatch.

## Common instructions

Read AGENTS.md, the canonical plan, execution board, your feature specs and this brief. Branch from `contracts-v1` in an isolated worktree. Merge integration refs only. Keep Aux branding; no setup, push, signing, release work, credential/session/keychain reads or broad formatting. Use loopback model, GitHub and Calendar fixtures. Fresh schemas require no compatibility migration. Delete replaced code and leave no temporary stubs or TODOs at exit.

Only the builder writes/builds/runs the stable native tree. Read it without modifying it; use `.native/<Chromium-relative-path>` mirrors and `scripts/native-diff.mjs` for reserved patches. Send `BUILD-REQUEST` with worktree, commit, patch paths and journey IDs. Builder serializes candidates with one slot; integration has priority.

Contracts, generated files, `App.tsx`, runtime `main.ts`, settings routes, patch series and evidence docs belong to the integrator. Send `CONTRACT-REQUEST` with a saved Zod diff and reason, or `SHARED-FILE-REQUEST` with a saved adapter diff. Do not edit these files in your lane. Shell contributions use `features/<feature>/mount.ts`; runtime contributions use `features/<feature>/boot.ts`. The integrator regenerates the static runtime boot manifest and host bindings when merging.

Use `INTERFACE-NOTICE` directly with affected lanes for concrete dependencies. Escalate `BLOCKED` only when a dependency cannot be resolved or changes the plan. Integrator broadcasts the roster and `CONTRACT-LANDED`, `MERGED` or `REBASE-NEEDED` refs. Report progress through concrete dependency messages; send `READY-TO-MERGE` only with branch, commit, gate transcript and builder manifests.

Every lane must pass the original per-merge gates: rebuild `npx tsc -b` before runtime unit tests, focused tests, typecheck, lint ≤390 warnings, format ratchet, bindings check, bridge coverage check, port inventory check, full journey registry check and bundle budgets. Do not weaken a gate or assertion. Report incomplete evidence accurately. Each owned feature requires real AX/CGEvent UI input, AX and native/RPC observations, screenshots and an unattended passing candidate journey. Close design-reviewer P0/P1 findings before merge; final integration closes all P0–P2 findings. Performance claims require the specified measurements, not bundle sizes or estimates.

## L1 — Commands and keys

- Scope: F1; `commandRegistry`. Extract one command dispatch path, complete native focus/menu dispatch, remapping/import/export, reserved chord refusal and the registry invariant.
- Own: `apps/shell/src/commands.ts`, `components/ShortcutsSetting.tsx`, command feature mounts/tests; native `methods/shortcuts_methods.cc` and the prescribed dispatch hunks. Patches 0140–0143.
- Contracts: `COMMANDS`, `ShellCommandId`, derived `SHORTCUTS`, effective bindings/conflicts, `setShortcuts` with `focusShell`. Request contract changes through integrator.
- Journey: `shortcut-registry`, all new defaults via HID, persisted rebind with dead old chord. Measure shortcut→effect ≤50 ms. Include new-window/private-window/Quick Ask handlers.
- Interfaces: tell L3 the dispatch/context/provider interface; tell L7 how the extension shortcut group registers. Deliver before L3 starts.

## L4 — Windows

- Scope: F4 and F14; `windowSync`, `littleWindow`. Spike live WebContents reparent, anchor/session behavior, playing media/CDP/devtools and cold external launch first.
- Own: `store/tabs-slice.ts`, `tab-window-transfer.ts`, `components/MovedTabPlaceholder.tsx`, `components/LittleWindow.tsx`, window feature mounts/tests; native `tab_catalog.cc`, `window_sync_methods.cc`, little-window controller. Patches 0148–0153.
- Contracts: `TabCommand` claim/move, `TabRecord.anchor/windowKind/split`, shared organization v2, `littleWindow`, `externalLinkTarget`, placement events. Request App window-kind adapter from integrator.
- Journeys: `cross-window` and `little-window`; preserve tab state/media/history, last-tab window survival, excluded window kinds/runtime ownership and whole split claims; Little promotion and empty-window close. Claim ≤300 ms p95, warm Little paint ≤600 ms.
- Interfaces: deliver `ownPages` and `isLocal` selectors to L5 first; coordinate Little destinations/promote with L6 and L3.

## L2 — Chrome layout

- Scope: F2/F3; `floatingSidebar`, `autoHideToolbar`, `layouts`, `minimalUi`. Spike hidden traffic-light draggable-region hit testing first.
- Own: `sidebar-mode.ts`, `toolbar-reveal.ts`, `floating-sidebar.ts`, `settings/sections/SidebarOptions.tsx`, `styles/stage.css`, layout mounts/tests and native `layout_methods.cc`. Patches 0144–0147.
- Contracts: `minimalUi`, `toolbarAutoHide`, sidebar settings, `windowControlsVisible`; registered toggle commands. Send App pageChrome/geometry adapter via `SHARED-FILE-REQUEST`.
- Journeys: `sidebar-modes`, `minimal-ui`; both tab layouts, visible/hidden AX controls, edge reveal, resize snap/persistence/keyboard announcement, edge-to-edge ≥99% stage and toggle back. Preserve exact spec geometry/motion/reduced-motion behavior; toggle ≤250 ms.
- Interfaces: L1 dispatch IDs; L3 toolbar versus floating command surface; L5 stage/drop-zone cover state.

## L5 — Surfaces

- Scope: F9/F17; `splitView`, `pictureInPicture`. Spike drag events above SurfaceEmbed, four embeds and user-activation PiP first.
- Own: `workspace.ts` split reducers, `split-layout.ts`, `SplitStage.tsx`, `SplitDropZones.tsx`, `Stage.tsx`, `TabAudioButton.tsx`, surface mounts/tests, native `surfaces_methods.cc` and auto-PiP helper hunks. Patches 0172–0177.
- Contracts: `SplitGroup`, two-pane native split/unsplit command, `TabRecord.split`, core `setStageVisible` (≤4 unique IDs), `pictureInPicture`, `onPictureInPicture`, audio video/pip fields. Implement reserved native stubs.
- Journeys: `split-fluid`, `pip`; all spec pane layouts/reducers, 2-pane restart restore, visibility/occlusion, controls and keyboard; largest playing video, exit/automatic exclusions/Document PiP. Drag frame ≤16.7 ms p95, drop→paint ≤150 ms, PiP ≤500 ms.
- Interfaces: wait for L4 selectors, coordinate whole-group claim and L2 cover state. Split-group members are protected from archiving/sleeping; notify L8.

## L6 — Profiles and routing

- Scope: F5/F12/F13; `profiles`, `linkRouting`, `cliOpen`, `appleScript`. Spike URL routing against opener/OAuth/POST flows and per-Profile model setup.
- Own: `components/BrowserProfiles.tsx`, `ProfileSwitcher.tsx`, `settings/sections/Profiles.tsx`, `LinkRouting.tsx`, `packages/cli/**`, profile/routing mounts/tests; native `profile_methods.cc`, `profile_routing_methods.cc`, `link_routing.*`, prescribed app-controller/navigator hunks and AppleScript files. Patches 0154–0159.
- Contracts: appearance/focus-space/move-to-profile methods, profile metadata, link-route config/CAS/test/prompt/events, `aux://` inner URL, organization v2 names/colors mirror. Use fixed native Profile discovery and live descriptors.
- Journeys: `in-app-profiles`, `link-routing`, `cli-open`, `applescript`; one user-data dir, cookie/runtime isolation, denied cross-runtime observe, cold CLI wait, routing precedence/fallback, opener preservation and AppleScript execute refusal. Never inspect real user profiles/secrets.
- Interfaces: L4 Little destination, L1 Profile/Space bindings, L8 shared Space placement. Fall back Little to tab only while the dependency is unavailable; remove the temporary fallback when L4 lands.

## L7 — Extensions

- Scope: F6; `extensions`. Spike WebUI side-panel guest embedding first.
- Own: `components/Extensions.tsx`, `ExtensionActions.tsx`, extension mounts/tests; native `extensions_ui_methods.cc`, prescribed popup-container and side-panel hunks. Patches 0160–0165.
- Contracts: action anchor, action metadata/pinning/event, extension commands/rebinding, `onSidePanel`; preserve opener Space and activate the target Space.
- Journey: `extension-actions`, unpacked disposable fixture, popup ±40 px, native command and persisted rebind, context menu, side-panel title. Add MV3 wake/message smoke coverage. Delete source-store-only filtering; document native tabGroups separately from folders.
- Interfaces: L1 extension shortcut group and intercept priority; L4 window-local surfaces; L3 extension provider rows.

## L8 — Organize

- Scope: F10/F15; `pinnedApps`, `liveFolders`, `folders`, `tabSections`, `autoArchive`, `archive`.
- Own: `Sidebar.tsx` pin/folder sections, `SiteTile.tsx`, `unread-badge.ts`, `LiveFolderRows.tsx`, `auto-archive.ts`, `tab-archive.ts`, `Library.tsx` archive view, `SpaceEditor.tsx`, organization mounts/tests, runtime `services/live-folders.ts`, `github-connection.ts`, relevant native pin/placement hunks. Patches 0178–0179.
- Contracts: organization v2 bound pins/live configs/archive reason+batch; `liveFolders.items/refresh/markRead`, `github.connections.list/connect/revoke`, shared clock. Replace W0 runtime stubs.
- Journeys: `pinned-live`, `auto-archive`; pin drift/reset/unload/keep-awake, badges, all four live sources and errors/read dots, protected tabs, same-ID batch Undo, restart persistence. Use loopback tokens/stubs only. Refresh no UI task >50 ms; archive cycle ≤50 ms with one elected archiver/CAS.
- Interfaces: L4 all-window active selection, L5 split protection, L1 registered actions and L9 shared toast conventions.

## L9 — Downloads

- Scope: F11; `smartDownloadNames`. Keep eligibility native, preview bounded/privacy-filtered, fallback deterministic, durable conditional Undo and original extension/quarantine metadata.
- Own: runtime `services/download-naming.ts`, `components/Downloads.tsx`, download mounts/tests, native `shell_events.cc` eligibility hunk and `download_naming.*`. Patches 0166–0169.
- Contracts: completed-native signal, preview/rename by GUID, `downloads.completedNative/undoRename`, naming settings and rename events. Replace W0 runtime stub.
- Journey: `smart-download-rename`; fixture Invoice4471 PDF, loopback model, quarantine/file oracle, Undo, Save dialog exclusion and model500 fallback. Native tests cover race/inode/open-file/30-second bounds and refusal cases.
- Interfaces: toast action exists; L11/L10 privacy and always-confirm policy must not be bypassed by rename automation.

## L10 — Agent trust

- Scope: F18/F16; `agentSitePermissions`, `tabMentions`. Implement the exact tier table, origin grants/revoke, drift and turn-lifetime access enforcement.
- Own: runtime `safety/**`, `agent/turn-mentions.ts`, `SiteControls.tsx`, `settings/sections/Agents.tsx`, `ActionConfirmation.tsx`, composer `mentions/**`, trust mounts/tests.
- Contracts: `safety.originPolicies.list/set` with revision and aux-webui auth, confirmation decisions/standing grants, bounded MentionRef in start/queue/steer. Replace W0 policy stub.
- Journeys: `agent-site-permissions`, `tab-mentions`; login-only standing grant, delete always asks, revoke, external settings refusal; @A page IDs, mid-run navigation unavailable, no observe of B. Space and @Tabs references never imply act access.
- Interfaces: deliver `confirmationTierFor` and effect policy to L11 first; coordinate composer plugin with L3/L11. Native wall epochs/URL/session establish drift; titles are display-only.

## LJ — Legacy journeys

- Scope: port/requalify all 22 historical feature claims and maintain sync design only.
- Own: `tests/host/journeys` legacy ports, `tests/host/fixtures/**`; request integrator updates for sync/evidence docs.
- Contracts: frozen `LEGACY_JOURNEY_FLAGS` mapping in legacy.mjs; use schema2 runner helpers, fresh disposable profiles and loopback transport. Split/keyboard/Reader/pageZoom are foundation references; preserve their real assertions.
- Journeys: site permissions, reader, inbound agents, electron migration, Quick Ask, translation, HTTPS-first, content blocking, zoom, automations, Spaces, outbound MCP, AI Tidy, lifecycle, Peek, title rules and AI naming; plus overlap features assigned to feature lanes. Coordinate shared journey files directly before editing.
- Exit: every old claim has actual unattended coverage and builder evidence; ask owner only for declared system-auth/VoiceOver attendance. Delete each replaced legacy branch after parity, retaining required attended stories. Metadata mapping alone is not a port or qualification.

## L3 — Command surface

- Scope: F7; `commandBar`, after L1 lands. One floating/edit/command surface, full palette parity, routing circuit breaker and correct dedupe/frecency.
- Own: `components/CommandBar.tsx`, `CommandSurface.tsx`, delete `Palette.tsx`, `command-results.ts`, `command-ranking-renderer.ts`, `intent.ts`, runtime `services/command-ranking.ts`, command-surface mounts/tests and reserved native ranking hunks. Patches 0170–0171.
- Contracts: L1 dispatch, command/provider scopes, registry command rows, command modes/settings and ranking inputs. Request App overlay adapter.
- Journey: `command-bar-modes`; no tab on CmdT/Escape, Enter/background Enter semantics, CmdL URL selected, CmdK split/provider parity, tab dedupe, fallback route. ≤30 ms p95 at 50k history on AC in all modes; fix root causes before relaxing nothing.
- Interfaces: L2 toolbar slot, L4/L6 window/Profile context, L10 @ scopes. Delete Palette only after parity evidence.

## L11 — Autonomy

- Scope: F19/F20; `demonstrationSkills`, `overnightReview`. Spike CDP observer attachment and login item first; no scheduled wake/admin changes.
- Own: runtime `services/demo-recorder.ts`, `night-shift.ts`, `skill-replay.ts`, `SkillReplayPanel.tsx`, `features/morning-review/**`, autonomy mounts/tests, native `power_methods.cc` and observer-mode hunks if needed. Patches 0180–0183.
- Contracts: recorder controls and encrypted demonstration, replay@2, nightShift propose/queue/list/review, native AC power activity and shared clock. Replace W0 runtime/native stubs. Only person queues; agent proposals cannot start.
- Journeys: `demonstration-skill`, `overnight-review`; trusted multi-page capture, variables/Globex POST, no secret values in fixture decrypted state, done/inbox/power assertion, proposal refusal and budget exhaustion. Capture and resolve ambiguity/drift explicitly.
- Interfaces: L10 tier table grants only pre-approved access, always-confirm parks until person present; L1 registered Record/queue actions; L9 budget/model privacy conventions.

## L12 — Polish and performance

- Scope: F21 after feature lanes merge; continuous reviewer runs from Wave1. Preserve exact tokens, geometry, motion and reduced preferences across every feature.
- Own: `tokens.css`, `styles/**`, `apps/shell/src/ui/**`, `scripts/design-qa.mjs`, `tests/benchmarks/**` and prescribed performance hunks. Patches 0184–0185.
- Contracts: existing feature/command APIs; request changes rather than adding private flags. UI empty/loading/error states use real copy and registered actions.
- Evidence: per-feature light/dark/reduced-transparency contact sheets and reduced-motion verification; no open P0–P2 reviewer findings. Reference images stay outside git. Owner final visual signoff is mandatory.
- Performance: ≥20 AC trials for every plan budget, native timing and shell memory measured honestly. Current startup bundle is close to CSS/JS ceilings; use lazy feature components and improve scheduling rather than raising budgets. Report trial artifacts/distribution/identity, and keep all original gates.
