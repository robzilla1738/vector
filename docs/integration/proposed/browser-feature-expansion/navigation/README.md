# FX-NAV: native command bar and supplied UI integration

Source implementation on baseline `02ce77253`, selected native input `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`. This directory is an integration proposal, not an active browser patch. No shared native tree, generated app, owner profile, runtime, signing or release was changed. Current UI stylesheet bytes, class names, native search size, glass and animation are preserved.

## Implemented source

- Cmd+T opens the existing supplied centered search owner in new-tab mode. Opening, typing, cancellation and empty input create no tab; explicit navigation commit creates one through Chromium's own URL/search classifier.
- Cmd+L opens that same owner with the actual selected native view's complete loaded URL selected. A successful commit navigates its current tab. Cmd+K adds enabled commands to the existing result rows; ordinary tabs/history/bookmarks/search remain in the same supplied component. Existing tab-search mode stays available.
- A native invocation binds the exact search WebContents to a weak actual browser/profile/selected WebContents, last committed navigation entry and random generation. Hide, active-tab changes, profile changes, browser destruction and stale navigation reject late requests. Native commit consumes a generation before dispatch, rejects duplicate submissions and validates current command enablement.
- Existing tab result activation is restricted to a native view in this window, avoiding implicit focus stealing to another window. A projected logical tab with no local view currently gets a truthful unavailable error. FX-WINDOWS must connect the logical-view resolver before shared-window behavior can be accepted.
- Twelve additional actual shortcut commands extend the existing capture/preferences/menu owner: new tab, URL, commands, close/reopen, reload/bypass cache, back/forward, downloads, DevTools and view source. Customizing a shortcut suppresses the displaced static default. Existing supplied commands and global popup owner stay intact.
- The command list includes context-enabled back/forward/reload/stop/close/restore/downloads/history/DevTools/inspect/view-source/sidebar/Ask Aux/copy-URL actions. No remote-debugging service, security relaxation or automatic capture is introduced.
- Appearance's supplied row/switch components expose the real managed Chromium `omnibox::kPreventUrlElisionsInOmnibox` preference. Failed changes preserve the acknowledged prior value.

## Integration handoff

`native-inputs.json` lists seven exact input/output native leaves. Copy only after validating those hashes. The replacement files are under `source/` with Chromium-relative paths. All implementations use existing selected compile units.

`shared-hooks.json` contains count-checked hooks for the integrator-owned `browser_command_controller.cc`, including Cmd+L/K enablement when normal location chrome is hidden. It names four new extension-function histogram entries; integrator allocates those values and checks generated schema/registration. No new browser numeric command IDs are needed; native source uses actual Chromium symbols.

Repository adapter: `vendor/provided/aux-navigation-command-bar.mjs`, export `transformAuxNavigation({relative,text}) -> {text,anchors}`. Apply it after current branding/identity transforms to the three listed supplied assets, recording every returned anchor. Reapplying or changed anchor input refuses. The adapter adds no CSS declarations or assets and retains supplied component structure. It is not yet attached to root staging; the integrator owns that registration and exact source pins.

Command API:

- `auxBrowserPreferences.getCommandContext()` returns `{success, mode, generation, nativeProfileId, windowId, activeTabId?, activeUrl?, incognito, alwaysShowFullUrl, commands}` only to the actual search owner. `activeTabId` is a native instance, not a logical organization ID.
- `auxBrowserPreferences.commitCommand({generation, kind, text?, tabId?, commandId?})` accepts `navigate`, `activate-tab`, or finite-catalog `command`. It revalidates the native context and returns `{success,error?}`. Missing organization services do not cause guessed logical IDs.
- `getAlwaysShowFullUrl()/setAlwaysShowFullUrl(boolean)` reuse the native URL-display preference and managed-policy refusal.

## Focused evidence and open acceptance

`node --test vendor/provided/aux-navigation-command-bar.test.mjs`: five checks pass. They exercise real pinned supplied asset transforms, syntax, retained class strings, blank-input/no-navigation result construction, enabled commands, native error propagation without fallback, and native same-window tab activation request shape. These are source/component boundary checks, not an app launch or native compilation.

Still required: selected native object compile and integration build; actual keyboard/menu dispatch, Cmd+T cancel preserving tab count, committed default-engine search, Cmd+L active split-pane target, customizable shortcut roundtrip and managed full-URL setting observation. The actual new component errors and partial extension/session-restore paths need app observation. Existing shared-window logical-view resolution must replace the explicit no-local-view refusal; lifecycle/startup runtime authority remains outside this lane. Do not declare the final app ready from these checks.
