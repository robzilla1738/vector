# Supplied native preference effects

This pinned proposal changes seven native files. The product-specific constant lives in the existing narrow `tab_strip_prefs.h` header, with an explicit dependency from the preference API; it does not modify global `chrome/common/pref_names.h`. It has been composed over the applied v16 source in a disposable tree with exact input/output hashes; it has not been applied, compiled or executed.

The vertical tab insertion preference belongs to browser Local State and defaults to `top`. Only the exact stored value `bottom` selects bottom; the retired Aux API used a disconnected per-profile preference defaulting to bottom. The proposal restores the supplied global getter/setter and binds the real155 `chrome::NewTab` path to top insertion after pinned tabs. Horizontal windows retain their existing insertion. Link ordering, explicit extension indexes, group and split constraints remain owned by Chromium. Additional supplied top-predicate call sites are listed in `source-evidence.json`; their full equivalence remains unverified.

The macOS vibrancy API now uses the original inverted `windowBackgroundVibrancyDisabled` CFPreferences value, application synchronization and Darwin notification, in the fixed `dev.aux.browser` application domain. It no longer reports an unrelated per-profile boolean as OS window state. The original app domain is recorded as source evidence only and is never used by the proposal. No preference operation was executed. This restores the persistence/notification contract; the original native rendering reader at043856d0 and actual window material response are still separate required work. No new material styling is invented.

Static evidence is pinned in `source-evidence.json`. The supplied native getter/setter addresses, bounded original arm64 instructions, exact CFStrings and imported CF function/Boolean identities support the changes. The first-non-pinned interpretation uses the155 named API and is identified as derived; the stripped source does not supply a recovered field name.

## Horizontal shrink remains required

The original setter04295bd0 writes browser-global `aside.browser_preferences.horizontal_tab_strip_shrink_to_fit_enabled`, updates the current profile and loaded profiles, and its UI observes `horizontal_tab_strip.shrink_to_fit_enabled`. The supplied045d9b10 consumer installs the width callback when shrinking is enabled and removes it for preferred-width horizontal scrolling.045dec88/045db658 install the observer and invalidate actual layout.

The current Aux boolean has no UI consumer. Chromium155 has both legacy and unified horizontal strips. `tabs::kTabStripUnification` defaults disabled; the default factory selects `HorizontalTabStripRegionViewOld`. The legacy ScrollContainer file is removed upstream, although a stale forward declaration remains. A draft for the unified strip alone was therefore not included: it would leave the default setting disconnected. Next work must adapt the original scroll container behavior to155's real default strip without changing the unification flag. The scoped prototype remains under the lane's ignored `out/prefs-reuse-analysis` for reference.

After root integration, compile the affected API/macOS/browser-commands/pref registration objects through the serialized build wrapper. Observe top/bottom with pinned tabs and multiple disposable Aux profiles, then the actual vibrancy API/window behavior. A disposable Chromium profile or HOME does not isolate macOS CFPreferences; do not execute the setter against the Aux app domain without appropriate isolation/authorization.

The domain is deliberately fixed across browser and native app-shim helpers, matching the original fixed application domain. Deriving it independently from each helper bundle would split the preference and notification authority.

The original vertical setter writes through PrefService without an added IsManagedPreference rejection. The retired Aux guard was removed after source review; normal PrefService policy/value handling remains intact.
