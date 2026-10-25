# Bounded ordinary native startup

One compile-mode patch for the local ordinary Aux candidate. UI, typography,
layout, assets and supplied ordinary browser/session behavior remain unchanged.
This is source preparation; root owns compilation, exact policy packaging,
signing approval and real disposable close/reopen observation.

The fixed header `chrome/browser/aux/ordinary_startup_build.h` enables
`AUX_BROWSER_ONLY_NATIVE_STARTUP=1` and existing sealed startup/lifecycle hooks
in the three Chrome owners. Scoped main/base-engine/platform defines use the
same mode. Main skips Endpoint Security initialization; the real main bridge
getter returns nullptr. Optional Chromium child supervision is unavailable,
never represented as settled or CLEAN. The necessary fixed daemon keeps its
real native waitable child, Mach endpoint, audit/code/birth binding and sole
reaper while omitting only its ES-ticket prerequisite in this compiled mode.

Before Crashpad, logging, histograms, Local State or singleton writes, the
browser requires an explicit existing canonical private directory shaped as
`/private/tmp/aux-fresh-browser-<scope>/home/Library/Application Support/Aux`.
The scope component accepts only ASCII letters/digits/dash/underscore, bounded
at128 characters. Native policy redirection and profile/cache override switches
refuse. Existing private home/app-data/cache paths are bound without creating
or falling back to an owner directory. The actual browser private-root producer,
sealed signed daemon launch and authenticated72-byte generation/two-root receipt
then run unchanged. Only ES descendant-scope transfer is omitted.

The package parser in this build accepts only `identityProfile:"aux-v1"`,
`stateIdentityVersion:2` and `nativeStartupMode:"ordinary-fresh-v1"`, using the
existing strict duplicate-key/regular-file checks. This permits an attempt at
actual native admission; it does not accept legacy state or authorize migration.
The old compatibility parser remains unchanged outside ordinary compilation.
Historical development acceptance is skipped in this mode. The CLI startup
service and UI migration command/operation7 transport are disabled.

Shutdown retains actual ordinary UI/session participant closure and genuine
Profile/content/thread/process teardown. The existing late content callback
closes only the owned ordinary peer and waits up to5 seconds for actual daemon
exit/reap/monitor closure. No privileged report is registered or ES-CLEAN ACK
requested. A timeout retains unknown custody rather than reporting success.
Swift owns the separate ordinary lease marker and same-scope reopen rules;
this browser patch does not reinterpret supervised ADMITTED/CLEAN records.

`source-plan.json` contains33 counted rules (34 replacements),13 exact frozen
inputs plus one new fixed header. All GN inputs come from the A24 composition,
not later recovery GN. `native.patch` is a human-reviewable source diff;
`evidence.json` records exact replay and bounded path-shape checks. No app,
helper, provider, Keychain, permissions, signing or release was executed.
