# Early native refusal of unaccepted state identity

Source-pinned proposal only. No shared Chromium source/GN file, packaged app,
accepted startup record, profile, Keychain or native authority was changed or
executed. This proposal closes an actual direct-launch gap; it is not state2
migration acceptance, a complete stopped-writer fence or Finder verification.

## Existing guards are insufficient

The current JavaScript launcher rejects state2 before state creation. The native
`BundlePaths::FromBrowserExecutable` checks supplied bundle version/implementation
but not stateIdentityVersion. `installation_auth.cc` checks carrier authorization
and layout only when authority is requested, after browser startup. Neither is
an early refusal for direct Finder opening.

Current `development_startup::Apply` is early, but it returns true when `--type`
or inherited AUX_HOME is present, and when no accepted.json exists. It therefore
does not make state2 safe merely by failing an old accepted-record hash. Its
call is also compiled out in OFFICIAL_BUILD and BUILDING_CHROME_RENDERER.

## Narrow proposed change

New header-only `chrome/app/aux_packaged_state_identity.h` exposes the actual
production predicates:

* `PackagedIdentityMarkerAllowed(std::string_view)`: pure bounded-policy parser.
* `PackagedIdentityMarkerAllowedAt(const base::FilePath&)`: strict file reader.
* `PackagedIdentityAllowsStartup()`: derives the marker from actual FILE_EXE.

`chrome_main_delegate.cc` calls the last predicate as the first operation in
BasicStartupComplete under IS_MAC && ENABLE_AUX_BROWSER. It runs before the old
acceptance Apply, mock-Keychain switch, environment/private acceptance lookup,
user-data-directory initialization, ProcessSingleton forwarding, preferences,
profile services and owned daemon startup. The existing accepted-development
header and all its acceptance body remain byte-identical. No approval override,
environment variable, CLI flag, transaction receipt or acceptance Boolean can
authorize state2 through this predicate.

Policy requires bundle version1 and implementation supplied. Only absent
identityProfile defaults to compatibility and absent stateIdentityVersion to1,
matching the supported historical marker format. Explicit state2 and every
future/unknown state version reject unconditionally, including aux-v1. Explicit
wrong types, unknown profile, malformed JSON, missing marker and unreadable
marker reject; no fallback to a private accepted record or another app exists.
Duplicate top-level keys reject, including escaped-equivalent names; the scan
decodes key strings through the same JSONReader instead of trusting raw spelling.
Nested fields do not select the root generation.

The static marker reader uses a canonical absolute path, O_NOFOLLOW/O_CLOEXEC,
regular-file/owner/mode/link-count checks, a16MiB bound, exact read/EOF and stable
fstat identity/size/mode/timestamps. Current marker is about3.95MiB. It accepts
owner/root-owned safe static resource files, not writable aliases. It reads no
home/profile/account state. This is refusal policy, not a cryptographic resource
seal; package integrity checks remain independently required.

## Browser, helper and secondary handling

GetAppBundlePath(FILE_EXE) is Chromium's documented OUTERMOST .app resolver:
`Aux.app/.../Aux Helper.app/Contents/MacOS/Aux Helper` selects Aux.app. Helpers do
not look for a marker in their inner Helper.app or fall back to an ancestor home.
No process-type check bypasses this new call. The lightweight header has no
Security.framework or crypto dependency, allowing the same call in a separate
renderer binary; root must register its source in that target as described below.
Official builds also retain this refusal policy; only the separate historical
development-acceptance logic remains non-official.

ContentMainRunnerImpl invokes BasicStartupComplete before PreSandboxStartup,
which initializes user data directories. PostEarlyInitialization then acquires
the ProcessSingleton and may forward a secondary command line. A rejected
state2 secondary browser therefore exits before notifying an existing browser
or opening the user directory. This protects new launches from the proposed
binary; it cannot retroactively stop an already-running unguarded browser or
stop unrelated/owner processes. No broader singleton migration fence is claimed.

Supported valid compatibility/state1 packaged startup retains existing behavior
after this static check. Missing/malformed/unsafe packaged resources now fail
earlier. The current accepted app itself is untouched; new compiled code does
not inherit its old code-hash acceptance record automatically.

## Focused verification and serial compile plan

`node --test docs/integration/proposed/aux-native-state2-launch-refusal/proposal.test.mjs`
passes two static tests: source/output pins and first-call ordering, plus resource
policy anchors and Chromium early-startup ordering. This does not compile or
execute the C++ parser and is not actual app acceptance.

`probe.cc` calls the **actual proposed production predicates**, not a copied
implementation. It contains20 synthetic marker cases, including both supported
state1 profiles, state2, future/wrong types, malformed/missing data, duplicate and
Unicode-escaped duplicate identity keys, and nested decoy keys. It also exercises
the actual reader on fresh temporary files: absent, valid, state2, unsafe mode
and symlink, plus actual Chromium outer helper bundle resolution. It never calls
Apply(), opens an Aux profile, launches Aux or invokes installation authority.
The probe has not been compiled/run in this lane.

Root integration owns GN/shared files and must:

1. Verify source pins and apply native.patch; register the new header in the
   Mac Aux main-delegate source list and, if enabled, the separate renderer
   main-delegate target. No new library is needed. Ensure its existing base,
   buildflag and Foundation dependencies cover the lightweight header.
2. Add a bounded executable/probe target using probe.cc, with deps `//base` and
   the ordinary Chromium executable configs; no browser/installation service
   dependency or Security.framework is needed by the new header. Foundation
   linkage follows base's Mac support. Invoke via the existing serialized native
   build wrapper and `/tmp/aux-build.lock`; do not start a parallel native build.
3. Run only that probe against synthetic data. Then compile the actual browser
   target, including renderer configuration when enabled. Compilation resolves
   actual JSONReader/base API and target dependency compatibility.
4. Record actual probe/build evidence and later perform a separately authorized
   disposable direct-launch refusal observation if needed. No signing or actual
   Finder launch is authorized by this proposal. Do not bypass current state2
   refusal to test migration or start its daemon.

The next accepted state2 launch requires a separate completed migration/native
authority design; there is intentionally no hidden path to turn this refusal off.
