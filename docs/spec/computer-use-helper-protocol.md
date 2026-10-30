# Computer Use helper: daemon↔helper protocol

Status: **draft, current** (2026-10-29). This is the working spec for [Batch 10 item 3](../plans/2026-10-29-browser-excellence.md) (new Swift helper, same identity). It is not one of the retired clean-room notes the [spec README](README.md) describes.

Read-only investigation. Nothing was launched, signed or granted. Every statement carries a source tag:

| Tag | Meaning |
| --- | --- |
| **[D]** | Observed in the composed daemon JS of release build 91 |
| **[N]** | Observed in the daemon's native process owner source and its strings in the shipped `aux-daemon` |
| **[B]** | Observed in the shipped helper binary (strings, imports, Swift symbols, disassembly) |
| **[P]** | Observed in the shipped Info.plist, signature or entitlements |
| **[I]** | Inferred; not proven by the sources above |

## Sources

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| Daemon entry (minified) | `out/release/1.0.0-91/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs` | `10fecef5…cff30e0` |
| Daemon native image | `…/Aux Daemon.app/Contents/MacOS/aux-daemon` | `f3208d0c…ca0311` |
| Helper launch record | `…/Aux Daemon.app/Contents/Resources/AuxComputerUseHelperLaunchPolicy.json` | — |
| Helper binary (release 91) | `out/release/1.0.0-91/Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use` | `9eaaddb1…dcd3c4c`, 2,064,592 bytes |
| Helper (sealed candidate) | `out/provided-candidate-completion-20261026-a1/Aux.app/…/Aux Computer Use.app` | `aceede20…ae24b` (Apple Development signed, no entitlements) |
| Native owner source | `docs/integration/proposed/completion-20261026/integration/computer-use/source/AuxAccountComputerUseHelper.mm` | — |
| JS bridge source | `vendor/provided/aux-fixed-computer-use.mjs` | — |
| Earlier static records | `docs/source/provided-computer-use.md`, `docs/source/provided-computer-use-patches.json`, `docs/integration/proposed/completion-20261026/integration/computer-use/README.md` | — |

In the minified entry, the helper code lives in the modules `init_helper_runtime` (install/refresh), `init_native_helper_manager` (class `NativeContextAwarenessHelperManager`, the long-running client), `init_helper_client` (`runComputerUseCommand`, one-shot), and the routers `fullDiskAccessRouter` and `contextAwarenessRouter`.

## 1. What the helper is, and what it is not

The name misleads. **The helper does not take agent screenshots, click, type or move the pointer for the agent.** [D][B] The agent's page screenshots, clicks and typing go through CDP inside the browser (`page`, `snapshot`, `annotatedScreenshot` in the REPL). No daemon code sends coordinates or receives an image from this helper. The helper imports no synthetic-input API: it uses `CGEventTapCreate` (listen only), but not `CGEventPost` or `CGEventCreate*Event`. [B]

The helper has two roles, picked by `argv` (see 3.4):

1. **Context Awareness observer** (long-running, menu-bar agent app). It watches the user's desktop through Accessibility, an Input Monitoring event tap, and on-device OCR of image-only windows. It streams semantic events to the daemon, shows the menu-bar item, and owns the macOS permission sheets. This is the only role the release-91 route can launch.
2. **One-shot data commands** (`aux-computer-use <command> --json <payload>`). These read the Messages database, Contacts and KakaoTalk, send iMessages through `osascript`, list installed apps, check or request permissions, and shut down an older helper. The same commands can also run inside the observer through `invoke`.

## 2. Identifiers that must be kept

| Item | Value | Source | Why it matters |
| --- | --- | --- | --- |
| Bundle path inside Aux | `Contents/Resources/aux/apps/computer-use/Aux Computer Use.app` | [D][N] | Hard-coded in the native owner and the daemon's `COMPUTER_USE_HELPER_SOURCE_APP_PATH` |
| Executable | `Contents/MacOS/aux-computer-use` | [D][N][P] | Hard-coded in both routes; also in the usage string |
| `CFBundleIdentifier` | `dev.aux.browser.computer-use` | [P][N] | TCC keys grants on it; the native owner's code requirement names it |
| Team | `9F2JXY8TCK` | [P][N] | Required by `anchor apple generic and identifier "dev.aux.browser.computer-use" and certificate leaf[subject.OU] = "9F2JXY8TCK"` |
| Display names | `CFBundleName` / `CFBundleDisplayName` = `Aux Computer Use` | [P][D] | Appears in System Settings rows and in daemon error text ("Aux Computer Use" → "Messages") |
| `LSUIElement` | `true` | [P] | Menu-bar agent with no Dock icon |
| `LSMultipleInstancesProhibited` | `true` | [P] | Only affects LaunchServices launches, which neither route uses [I] |
| `LSMinimumSystemVersion` | `13.0` (the product floor is now 15) | [P] | Can rise to 15 |
| Version | `1.26.1020` / `1.26.1020.23` | [P] | Not checked by the daemon [D] |
| Usage strings | `NSAccessibilityUsageDescription`, `NSInputMonitoringUsageDescription`, `NSAppleEventsUsageDescription`, `NSContactsUsageDescription` | [P] | Needed for the TCC prompts. There is no Screen Recording key; macOS has none |
| Hardened runtime | on (`flags=0x10000(runtime)`) | [P] | — |
| Entitlements (release 91) | `com.apple.security.automation.apple-events`, `com.apple.security.personal-information.addressbook` | [P] | Needed for Messages Automation and Contacts under hardened runtime. The sealed candidate copy has **none** |
| TCC marker env var | `AUX_TCC_DISCLAIMED=1` | [B] | See 8.1 |
| Own-browser bundle IDs | `dev.aux.browser`, `dev.aux.browser.canary` | [B] | `CapturePolicy.browserSignalBundleIds`; the browser gets `browser-signal` lines instead of full events |
| Dispatch queue labels | `dev.aux.computer-use.output`, `.input-state`, `.browser-signal-state` | [B] | Cosmetic; keep for log continuity |
| Send staging directory | `~/Library/Messages/.aux-send-staging` | [B] | Attachment staging for `imessage.send` |
| Launch record | `AuxComputerUseHelperLaunchPolicy.json` in the daemon bundle | [N] | Pins the helper's exact SHA-256 and size. A new binary needs a new record (gap G1) |

Windows identities exist in the same daemon (`CoursonDigital.AuxComputerUse[.Canary]`, `AuxComputerUse.exe`, `helper.json` with `protocolVersion: 1`, `--self-test`, `--runtime-root`, `--parent-pid`). They are out of scope here.

## 3. Process and launch model

### 3.1 Which route runs

The daemon chooses at call time with `auxFixedComputerUseFactory()`. [D]

- **Fixed native route.** Used when `process._linkedBinding('aux_owned_native')` has a frozen `supervisedTasksEnabled === false` **and** a frozen function `createAccountComputerUseProcess`. Release 91's `aux-daemon` contains that factory and the launch record [N], and the integration README says `supervisedTasksEnabled` stays false. So release 91 is expected to use this route. The value was not executed here. [I]
- **Legacy spawn route** (the supplied behavior). Used when no factory exists. If `supervisedTasksEnabled` is frozen `false` without the factory, Computer Use is reported `unsupported` (`AUX_SUPERVISED_TASKS_DISABLED`).

Neither route uses LaunchServices, `open`, `NSWorkspace` or launchd. The helper is a direct child process of the daemon. [D][N]

### 3.2 Fixed native route (release 91)

**Who launches.** `NativeContextAwarenessHelperManager.#D()` calls `auxAccountComputerUseProcess(owner)` (JS bridge). That calls `binding.createAccountComputerUseProcess(accountId, expectedIdentityJSONBuffer, callback)` [D]. The native owner then: [N]

1. Requires its own image to end in `/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon` and derives the outer `Aux.app` from it.
2. Validates the daemon's own signature (strict, nested, all architectures), then validates `Resources/AuxComputerUseHelperLaunchPolicy.json` as a sealed resource. Its keys must be exactly `format` (`aux.computer-use.fixed-helper-launch.v1`), `sourceSha256` (must equal the compiled constant `debc03de…dde51`), `sha256`, `bytes`, `identifier` (`dev.aux.browser.computer-use`) and `team` (`9F2JXY8TCK`).
3. Opens `Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use` without following symlinks. Hashes exactly `bytes` and compares the result with `sha256`. Checks the code requirement above.
4. Creates `<account task dir>/computer-use` and `computer-use/tmp`, mode 0700, no-follow.
5. Spawns the helper with `POSIX_SPAWN_CLOEXEC_DEFAULT | POSIX_SPAWN_START_SUSPENDED`, publishes the PID to a durable journal, then resumes it.

**argv** (exact): [N]

```
/usr/bin/sandbox-exec
  -D AUX_COMPUTER_USE_IMAGE=<helper exe>  -D AUX_CONTROL=<control root>  -D AUX_TASK=<task root>
  -D AUX_COMPUTER_USE=<account>/computer-use  -D AUX_BROWSER_DATA=<profile root>  -D AUX_BROWSER_CACHE=<cache root>
  -D AUX_APP=<Aux.app>
  -p <seatbelt profile>  <helper exe>
```

`sandbox-exec` execs the helper in place, so the helper has **no arguments** and starts in observer mode.

**Environment** (exact, nothing inherited): `PATH=/usr/bin:/bin`, `HOME=<account>/computer-use`, `TMPDIR=<account>/computer-use/tmp`. [N]

**Sandbox** (seatbelt, summarized) [N]:
- network denied; `process-fork` denied; `process-exec` allowed only for the exact helper image
- `securityd` / `SecurityServer` / `secd` Mach lookups denied
- reads allowed only under `/System`, `/usr/lib`, `/usr/share`, `/Library/Apple`, `/Applications`, the `/dev` nodes `null`/`random`/`urandom`, `Aux.app` and the role directory
- writes allowed only in the role directory; links denied
- control, profile, cache and other task roots denied; ancestors of protected roots write-protected

Consequences: the Messages and KakaoTalk databases, Contacts (via `secd`), and `osascript` all fail under this route. `HOME` is **not** the user's home, so `~/Library/Messages` paths do not resolve there either. [N][I]

**stdio.** Three CLOEXEC pipes dup'd onto 0/1/2, made non-blocking on the parent side. [N]

**Stop.** `auxClose()` → `native.close()` sends SIGTERM, then SIGKILL if the child is still alive after 1 s. The daemon does **not** send the `shutdown` command on this route (`!Cn.auxClose && send({command:'shutdown'})`). [D][N] `kill(signal)` accepts only `SIGTERM` or `SIGKILL`. [N]

**Input filter.** The native owner re-encodes every stdin line and refuses anything outside a whitelist (`AUX_COMPUTER_USE_INPUT_REFUSED`): [N]

| `command` | Allowed keys | Extra rule |
| --- | --- | --- |
| `shutdown`, `health`, `pause`, `resume` | `command` | — |
| `permissions` | `command`, `kind` | `kind` must be `observer` |
| `policy` | `command`, `excludedBundleIds`, `excludedDomains`, `captureTypedText`, `screenText` | Arrays ≤1024 strings of ≤4096 bytes; the two switches must be JSON booleans |
| `menu` | `command`, `recentApplications` | Array ≤1024 items |
| `invoke` | `command`, `id`, `name`, `payload` | `id` starts with `inv-`, ≤128 chars; `payload` must be `{}`; `name` ∈ {`discard-context-awareness-buffer`, `applications.list`} |

One write may be in flight at a time. Each message is ≤1 MiB including the newline; at most 4 MiB is queued. [N]

**JS side.** The bridge makes a ChildProcess-like object. stdout and stderr are each capped at 8 MiB buffered; over that, the helper is killed and an error is emitted. The bridge rechecks the account guard on every write. One-shot commands and `permissions kind:"messages"` are refused before reaching native code, with `AUX_COMPUTER_USE_EXTERNAL_DATA_UNAVAILABLE`. [D]

### 3.3 Legacy spawn route (supplied behavior)

1. `prepareComputerUseHelperRuntime()` → `refreshRuntimeApp()` [D]:
   - `ditto` the bundled app to `<taskHome>/runtime-computer-use/Aux Computer Use.update.app` (directory mode 0700)
   - `xattr -r -d com.apple.quarantine`, make the binary executable, `codesign --verify --strict`
   - stop the installed helper with `aux-computer-use lifecycle.shutdown --json {"appPath":"<installed app>"}` (3 s timeout)
   - rotate to `.previous.app`, rename into place, delete the previous copy

   The source app can be overridden with `AUX_COMPUTER_USE_SOURCE_APP`.
2. Observer: `spawn(<taskHome>/runtime-computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use)`, **no arguments**, `stdio: pipe×3`. Environment and cwd are inherited from the daemon. [D]
3. Stop: write `{"command":"shutdown"}`, SIGTERM after 1 s, give up waiting after 2 s. [D]
4. Daemon shutdown also runs `lifecycle.shutdown` against the source binary. [D]

### 3.4 Helper entry dispatch

`main`: [B]

1. `reexecDisclaimedIfNeeded()` runs first, always (8.1).
2. If `argc < 2`, or `argv[1]` starts with `-`, run **observer mode**: `NSApplication.shared`, delegate `ObserverAppDelegate`, `run()`.
3. Otherwise `parseHelperCommand()` → `runOneShotCommand()`, which writes one envelope and exits.

## 4. Transport and framing

- **Observer mode:** newline-delimited JSON (NDJSON), UTF-8, one JSON object per line. Commands arrive on stdin and messages leave on stdout. [D][B] The daemon writes `JSON.stringify(obj) + "\n"` and reads lines with `readProcessLines`. Every stdout line is parsed with the zod schema `nativeContextAwarenessMessageSchema`. A line that fails to parse is logged ("Ignored invalid helper NDJSON") and dropped. [D] The schema objects are not strict, so extra keys are ignored; wrong types for known keys reject the whole line. [D]
- The helper writes stdout from the serial queue `dev.aux.computer-use.output` (`Output.send(type, dict)` adds `"type"`). [B]
- An unknown command produces `{"type":"protocol-error","message":"Unknown command: <name>"}`. [B][D] (The `Unknown command:` prefix is a literal in `readCommands`; the exact concatenation is [I].)
- `readCommands` calls `isatty`/`fstat` on stdin and calls `NSApp.terminate` on two paths. Exiting on stdin EOF and on `shutdown` is the likely behavior. [B][I]
- **stderr** is free-form. The daemon logs each chunk as a warning and never parses it. [D]
- **One-shot mode:** no stdin (`stdio: ['ignore','pipe','pipe']`). Exactly one JSON envelope on stdout; the daemon parses only the **last** non-empty line. [D][B]

## 5. Authentication and trust

The protocol has **no** token, nonce, handshake or version field on macOS. [D][B] Trust comes from:

- **Pipe ownership.** Only the parent holds the pipes. The native route adds: exact image hash from a sealed launch record, a code requirement (identifier + team), a sandbox, start-suspended launch with durable PID publication, and an account-generation guard that kills the child if the account, epoch or profile binding changes. [N][D]
- **Account scoping lives in the daemon.** It tags every pending `invoke` with `{id, createdAt}` of the owning account and rejects results after an account change. [D] The helper is unaware of accounts. [B]
- **The helper does not check its parent's identity.** It does not import `getppid` and makes no `SecCode` check of its peer; `--parent-pid` is Windows-only. [B][D] A new helper may add a peer check, but the daemon will not cooperate with one.

## 6. Observer protocol

### 6.1 Session sequence (as the daemon drives it) [D]

```
daemon spawns helper (no args)
→ {"command":"policy", ...}            // #V, from settings.contextAwareness
→ {"command":"menu","recentApplications":[...]}   // #H
→ {"command":"resume"} or {"command":"pause"}     // #z: resume iff enabled, account current, not paused
… every ~10 s the daemon checks heartbeat; helper emits health on its own timers
← {"type":"health", ...}               // first health flips daemon state to "running"
← {"type":"event", ...} / browser-signal / attention / suppression / menu-action
→ {"command":"menu", ...}              // re-sent ≤1 s after each ingested event (debounced)
→ {"command":"invoke","id":"inv-N","name":"...","payload":{...}}
← {"type":"result","id":"inv-N","ok":true,"data":...}
```

On launch the observer may start capturing before the first `pause` or `policy` line arrives. A clean rewrite should **start paused and apply no capture until the first `policy` + `resume`**. That stays compatible because the daemon always sends both. [I]

### 6.2 Commands, daemon → helper

| `command` | Fields | Effect | Source |
| --- | --- | --- | --- |
| `policy` | `excludedBundleIds: string[]`, `excludedDomains: string[]`, `captureTypedText: boolean`, `screenText: boolean` | Replace the capture policy (`CapturePolicy.update`). `screenText` enables OCR of image-only windows | [D][B][N] |
| `menu` | `recentApplications: {name: string, bundleId: string, isExcluded: boolean, domains: {domain: string, isExcluded: boolean}[]}[]` | Rebuild the menu-bar "recent applications" submenu | [D][B] |
| `pause` | — | Stop recording; discard the pending typed run; `state: "paused"` | [D][B] |
| `resume` | — | Resume recording | [D][B] |
| `health` | — | Emit one `health` line now. The daemon waits ≤1 s for it | [D][B] |
| `permissions` | `kind: "observer" \| "messages"` | Show the observer sheet (Accessibility, Input Monitoring, Screen Recording) or the Messages sheet (Automation, Contacts, Full Disk Access). The native route allows only `observer` | [D][B][N] |
| `invoke` | `id: string` (`inv-<n>`), `name: string`, `payload: object` | Run a named operation, answered by a `result` line. `"invoke requires id and name"` if either is missing | [D][B] |
| `shutdown` | — | Quit (legacy route only) | [D][B] |

Example lines:

```json
{"command":"policy","excludedBundleIds":["com.1password.1password"],"excludedDomains":["bank.example"],"captureTypedText":false,"screenText":true}
{"command":"menu","recentApplications":[{"name":"Notes","bundleId":"com.apple.Notes","isExcluded":false,"domains":[]}]}
{"command":"invoke","id":"inv-3","name":"applications.list","payload":{}}
```

### 6.3 `invoke` names

| `name` | Payload | `data` on success | Caller | Native route |
| --- | --- | --- | --- | --- |
| `discard-context-awareness-buffer` | `{}` | unspecified (ignored) | `contextAwareness.clear` | allowed |
| `applications.list` | `{}` | `{name: string, bundleId: string}[]` (scans `/Applications`, `/System/Applications`, `/System/Cryptexes/App/System/Applications`, Finder) | `contextAwareness.listApplications` | allowed |
| `applications.icons` | `{bundleIds: string[]}` | — | Windows only | — |
| any one-shot data command (7.3) | as in 7.3 | as in 7.3 | `runComputerUseCommand` (legacy route, account required) | refused |

`discard-context-awareness-buffer` can fail with "Timed out waiting for pending typed capture". [B] When the observer hits a missing permission it reports `permission_required` / `full-disk-access`. [B]

### 6.4 Messages, helper → daemon

All lines have a `type` field. [D]

**`health`.** Every field is optional. [D]

| Field | Type | Meaning |
| --- | --- | --- |
| `state` | `"starting" \| "running" \| "paused" \| "stopped"` | Recorder state |
| `accessibilityTrusted` | boolean | `AXIsProcessTrusted()` |
| `inputMonitoringTrusted` | boolean | `CGPreflightListenEventAccess` / `IOHIDCheckAccess` |
| `screenRecordingTrusted` | boolean | `CGPreflightScreenCaptureAccess` |
| `eventTapHealthy`, `inputTapRunning` | boolean | Event tap status |
| `observerRegistrationFailures` | int ≥0 | AX observer failures |
| `secureInput` | boolean | `IsSecureEventInputEnabled` |
| `permissionSheetVisible` | boolean | The permission sheet is on screen |
| `systemSessionActive` | boolean | Login session active (not switched away) |
| `idle` | boolean | User idle |
| `pid`, `observerPid` | int | Helper PID; AX observer PID |
| `responsibleSelf` | boolean | `responsibility_get_pid_responsible_for_pid(getpid()) == getpid()` |
| `message` | string | Human-readable problem |
| `capture` | `{bundleId, captures, emptyCaptures, lastTreeBytes, maxTreeBytes, lastValueChars?, lastWalk?: Record<string, number\|string\|boolean>}` | AX walk diagnostics |
| `platform`, `protocolVersion`, `nativeCaptureAvailable`, `inputCaptureAvailable`, `screenOcrAvailable`, `screenOcrLanguages`, `trayAvailable`, `packageIdentityAvailable`, `recorderProgressAt` | — | Windows fields; the macOS helper does not emit them [B][I] |

The macOS emitter's literals include `accessibilityTrusted`, `inputMonitoringTrusted`, `observerRegistrationFailures`, `permissionSheetVisible`, `screenRecordingTrusted`, `systemSessionActive`, plus the inline keys `health`, `message`, `observerPid`, `eventTapHealthy`, `inputTapRunning`, `responsibleSelf`, `secureInput`. [B]

Daemon reactions to `health`: [D]
- Refreshes the heartbeat. Missing health for **35 s** gets the helper killed and restarted.
- If `screenRecordingTrusted` goes `false` → `true` with the same `pid`, the daemon kills the helper so the grant takes effect.
- If the helper exited while `permissionSheetVisible` was true (a grant-triggered relaunch) and permissions are still missing, the daemon re-sends `{"command":"permissions","kind":"observer"}` on the next health.

```json
{"type":"health","state":"running","accessibilityTrusted":true,"inputMonitoringTrusted":true,"screenRecordingTrusted":false,"eventTapHealthy":true,"inputTapRunning":true,"secureInput":false,"permissionSheetVisible":false,"systemSessionActive":true,"idle":false,"pid":4211,"observerPid":4211,"responsibleSelf":true,"observerRegistrationFailures":0}
```

**`event`.** `{"type":"event","event":<NativeEvent>}`. Common fields: [D]

| Field | Type |
| --- | --- |
| `occurredAt` | number, epoch ms [I: units from daemon comparisons with `Date.now()`] |
| `source` | `"mac_ax"` |
| `appName`, `bundleId`, `windowTitle` | string |
| `url`, `domain` | string, optional |
| `target` | optional `{targetId?, role?, subrole?, title?, description?, value?, placeholder?, identifier?}` (all strings) |
| `kind`, `payload` | per kind, below |
| `ax` | optional `{mode: "fullTree" \| "diffFromPrevious", text: string}` |

| `kind` | `payload` | `ax` |
| --- | --- | --- |
| `session.started`, `session.ended` | `{reason?: string}` (`applicationChanged`, `idle`, `sleep`, `screensSleep`, `shutdown`, …) | — |
| `window.changed` | `{reason?: string}` (`applicationActivated`, `applicationSettled`, `no-focused-window`, `provenance-changed`, …) | optional |
| `mouse.click`, `mouse.context_menu` | `{button?: "left"\|"right"\|"middle"\|"other", clickCount?: int}` | optional |
| `mouse.drag` | `{button?, origin?: Target, destination?: Target}` | optional |
| `keyboard.shortcut` | `{keyEquivalent: string, modifiers: Modifier[]}` | — |
| `keyboard.text_input` | `{text: string, submitted?: boolean, value?: string, typedCharacters?: int}` | — |
| `keyboard.submit` | `{modifiers?: Modifier[]}` | optional |
| `selection.changed` | `{selectedText?: string, selectedRange?: {location: int, length: int}, selectedItems?: Target[]}` | — |
| `screen.ocr` | `{text: string, captureMs: number}` | — |

`Modifier` = `command | control | option | shift | function | alt | meta`. The daemon strips `target.value` before storage, and stores `ax.text` / OCR text / typed text as event content. [D]

**`ax.text` format.** An indented outline, one element per line: `AXRole subrole="…" title="…" description="…" value="…" placeholder="…" identifier="…"`. A bare text line is static text. Truncation ends with `… AX tree truncated (<reason>)`. The daemon maps AX roles to ARIA-like roles (`AX_ROLES`, `AX_SUBROLES`) and drops splitters, scroll bars and window buttons. `diffFromPrevious` means the text is a diff against the previous tree for that window. [D][B]

```json
{"type":"event","event":{"occurredAt":1761771000123,"source":"mac_ax","appName":"Notes","bundleId":"com.apple.Notes","windowTitle":"Groceries","kind":"mouse.click","payload":{"button":"left","clickCount":1},"target":{"role":"AXButton","title":"New Note"},"ax":{"mode":"diffFromPrevious","text":"AXButton title=\"New Note\""}}}
```

**`browser-signal`.** Sent instead of `event` when the frontmost app is Aux itself (`dev.aux.browser` / `.canary`). The browser records its own DOM, so the helper sends only input signals. `{"type":"browser-signal","signal":{occurredAt, bundleId, kind, …}}` where `kind` is one of: [D][B]
- `mouse.click` / `mouse.context_menu` with `button?`, `clickCount?`
- `mouse.drag` with `button?`
- `keyboard.text_started`
- `keyboard.text_input` with `characterCount`, `text?`
- `keyboard.submit` with `modifiers?`
- `keyboard.shortcut` with `keyEquivalent`, `modifiers`

**`attention`.** `{"type":"attention","occurredAt":n,"frontmostBundleId":s,"inputAgeSeconds":n≥0}` (`CGEventSourceSecondsSinceLastEventType`). [D][B]

**`suppression`.** `{"type":"suppression","bucketStartedAt":n,"counts":{"<reason>":int}}`. Reasons: `secure-input`, `secure-target`, `private-window`, `typed-text-disabled`, `excluded-application`, `excluded-domain`, `foreground-uncertain`; anything else maps to `policy`. [D][B]

**`menu-action`.** `{"type":"menu-action","action":…}` from the menu-bar item: [D][B]

| `action` | Extra fields | Daemon effect |
| --- | --- | --- |
| `pause` | `duration: "thirty_minutes"\|"one_hour"\|"until_tomorrow"` | Pause until then (default 30 min) |
| `resume` | — | Resume |
| `clear` | `scope: "last_ten_minutes"\|"last_hour"\|"last_day"\|"all"` | Delete recorded events and frames (the helper confirms with an NSAlert first) |
| `clear-app-session` | `bundleId` | Delete the latest session for that app |
| `include-application` / `exclude-application` | `bundleId` | Edit rules, then re-send `policy` + `menu` |
| `include-domain` / `exclude-domain` | `domain` | Same |
| `show-settings` | — | Open `…/main.html#/u/<account>/settings/memories/context-awareness` |
| `shutdown` | — | Turn Context Awareness off ("Quit Aux Computer Use") |
| `messages-permissions` | `completed: boolean` | Resolves a pending `requestMessagesPermissions()` (handled even when the account is not current) |

**`result`.** `{"type":"result","id":"inv-N","ok":true,"data":…}` or `{"type":"result","id":"inv-N","ok":false,"error":{"code":s,"message":s,"reason"?:s}}`. A result with no waiter is logged and dropped. [D]

**`protocol-error`.** `{"type":"protocol-error","message":s}`. Logged only. [D]

The daemon ignores `event`, `browser-signal`, `attention`, `suppression` and non-`messages-permissions` `menu-action` lines unless the account that owns the helper is still current and active. [D]

## 7. One-shot CLI protocol

### 7.1 Grammar [B][D]

```
aux-computer-use <command> [--json <object>] [--no-dialog]
```

- No command → `Missing command. Usage: aux-computer-use <command> [--json <payload>]`.
- `--json` without a value → `--json requires a JSON object`; a non-object value → `--json must be a JSON object`.
- Any other flag → `Unknown argument: <arg>`.
- An unknown command → `Unknown command: <name>`.
- `--no-dialog` clears `showDialog`. Without it, a command that needs a missing permission may show the Messages permission sheet in that process before it fails. [B][I]

The daemon adds `--no-dialog` for `contacts.resolve` and whenever `dbPath` is given. Its timeout is 30 s, or 120 s for `imessage.send`. [D] Dates in payloads are ISO-8601 strings (`serializePayload` converts `Date`; the helper has `parseISO8601`). [D][B]

### 7.2 Envelope and exit status [B][D]

```json
{"ok":true,"data":<any>}
{"ok":false,"error":{"code":"failed|usage|permission_required|automation_required","message":"…","reason":"contacts|full-disk-access|automation"}}
```

If the response cannot be encoded, the helper writes `{"ok":false,"error":{"code":"failed","message":"Failed to encode response"}}`. Parse and argument errors exit with status **1** [B]. The daemon ignores the exit status when the last stdout line parses. It reads `data` when `ok` and `data !== undefined`; otherwise it maps the error (7.4) or throws the stdout/stderr text. [D]

### 7.3 Commands

The `name` column also works as an observer `invoke` name on the legacy route.

| Command | Payload | `data` | Daemon caller |
| --- | --- | --- | --- |
| `permissions.check` | `{}` | `{automation, contacts, fullDiskAccess, responsibleSelf}` (booleans; the daemon reads `fullDiskAccess`) [B][D] | `fullDiskAccess.check` |
| `permissions.request` / `messages-permission-dialog` | `{}` (plus a required reason [I]) | `{completed: boolean}` [I] | none in build 91 [D] |
| `lifecycle.shutdown` | `{appPath: string}` | `{completed?, terminated?}` [B][I] | install refresh, daemon shutdown |
| `applications.list` | `{}` | `{name, bundleId}[]` | `contextAwareness.listApplications` |
| `contacts.resolve` | `{handles: string[]}` | `{[handle]: displayName}` | iMessage name resolution |
| `contacts.search` | `{query: string}` (required) | `{name, phones: string[], emails: string[]}[]` | `imessage.contacts`, `send` lookup |
| `imessage.list-chats` | `{limit?, dbPath?}` | `{guid, identifier, name?, service, isGroup, participants: string[], unreadCount, lastMessage?: {date, text, isFromMe, sender}, alternateGuids}[]` | REPL `imessage.listChats` |
| `imessage.get-history` | `{chatGuid` (required)`, limit?, before?, sinceRowid?, dbPath?}` | `{rowid, guid, chatGuid, text, date, isFromMe, sender, hasAttachments}[]` | REPL |
| `imessage.search` | `{text?, sender?, since?, until?, sinceRowid?, limit?, dbPath?}` | `{messages: Message[], truncated: boolean}` (scans the newest 2000) | REPL, OTP wait |
| `imessage.max-rowid` | `{dbPath?}` | number | OTP wait |
| `imessage.send` | `{chatGuid?, to?, text, attachmentPaths: string[]}` | `{status: "delivered"\|"undelivered"\|<other = sent, unconfirmed>, failedPart?: "attachment"\|…, errorCode?, textDelivered?}` | REPL `imessage.send` (main session only) |
| `imessage.chat-exists`, `imessage.find-chat-guids`, `imessage.most-active-sibling`, `imessage.outgoing-delivery` | `chatGuid` / `handle` / `chatGuid` / `sinceRowid` required | internal | not called by the daemon [D] |
| `kakaotalk.list-chats` | `{limit?, dbPath?, key?}` | `{chatId, name, type, isDirect, unreadCount, updatedAt, favorite, lastMessage?}[]` | experimental Kakao REPL |
| `kakaotalk.get-history` | `{chatId` (required)`, limit?, beforeLogId?, dbPath?, key?}` | `{logId, chatId, authorId, authorName, isFromMe, type, text, date, hasAttachment}[]` | same |
| `kakaotalk.search` | `{text?, chatId?, since?, until?, limit?, dbPath?, key?}` | `{messages…}` [I] | same |

Implementation notes for parity: [B]
- Messages reads `~/Library/Messages/chat.db` with an embedded SQLite (`MessagesDB`) and decodes `attributedBody`.
- `imessage.send` runs `/usr/bin/osascript -e <script>` through `NSTask`, with `tell application "Messages"` … `send … to participant/chat`. AppleScript errors `-1743` / `-1728` map to `automation_required` and "chat not found".
- Delivery is then polled in `chat.db` (`confirmDelivery`).
- KakaoTalk uses SQLCipher with a key derived from `IOPlatformUUID` and the user ID in its container preferences, cached in `~/.kakaocli/userid_cache.json`.

### 7.4 Error mapping in the daemon [D]

| Helper error | Daemon error |
| --- | --- |
| `code: "permission_required"`, `reason: "contacts"` | `ImessagePermissionRequiredError("contacts")` |
| `code: "permission_required"`, any other reason | `ImessagePermissionRequiredError("full-disk-access")`; Kakao callers turn it into `KakaoPermissionRequiredError` |
| `code: "automation_required"` | `ImessageAutomationRequiredError` ("…enable "Aux Computer Use" → "Messages"…") |
| anything else | `Error(message)` |

Observer `result` errors go through the same mapping (`NativeHelperCommandError` → `mapHelperError`).

## 8. Permissions and TCC

### 8.1 The TCC marker (responsibility disclaim)

`reexecDisclaimedIfNeeded()` runs first in `main`. [B]

```
if environment["AUX_TCC_DISCLAIMED"] != "1":
    attr = posix_spawnattr_init()
    posix_spawnattr_setflags(attr, 0x40)          // POSIX_SPAWN_SETEXEC: replace this image, same PID
    responsibility_spawnattrs_setdisclaim(attr, 1)
    env = current environment + AUX_TCC_DISCLAIMED=1
    posix_spawn(<own executable>, attr, CommandLine.arguments, env)   // does not return on success
    // on failure: fall through and continue undisclaimed
```

This makes the helper its **own responsible process** for TCC. Accessibility, Input Monitoring, Screen Recording, Contacts and Automation then attach to `dev.aux.browser.computer-use` ("Aux Computer Use"), not to `aux-daemon` or the browser. `health.responsibleSelf` reports whether that worked (`isSelfResponsibleForTCC`). The native sandbox allows this because the exec targets the exact image and no fork occurs. [B][N] `responsibility_spawnattrs_setdisclaim` is private SPI; a rewrite must keep calling it. [I]

### 8.2 What is checked

| Permission | Check | Request path | Settings deep link |
| --- | --- | --- | --- |
| Accessibility | `AXIsProcessTrusted` | Sheet row → Settings + guide dock | `x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_Accessibility` |
| Input Monitoring | `CGPreflightListenEventAccess` / `IOHIDCheckAccess`; a successful `CGEventTapCreate` | Sheet row → Settings | `…?Privacy_ListenEvent` |
| Screen Recording | `CGPreflightScreenCaptureAccess` | `CGRequestScreenCaptureAccess` + Settings | `…?Privacy_ScreenCapture` |
| Automation (Messages) | `AEDeterminePermissionToAutomateTarget` for `com.apple.MobileSMS` | Same call with prompt; Settings | `…?Privacy_Automation` |
| Contacts | `CNContactStore` authorization; remembered via `rememberContactsGranted` | `CNContactStore.requestAccess` | `…?Privacy_Contacts` |
| Full Disk Access | Can `~/Library/Messages/chat.db` be opened (`isFullDiskAccessAllowed`) | Settings + guide dock | `…?Privacy_AllFiles` |

All of these are [B]. The observer only needs the first three; Screen Recording only matters when `policy.screenText` is true. [D] The daemon's `contextAwareness.permissions` route reports `accessibility`, `inputMonitoring`, `secureInput` and `screenRecording` (default `true` when unknown) from the last health. [D]

### 8.3 Permission screens (all native, inside the helper) [B][D]

- **Observer sheet** (`ObserverPermissionController`): one window titled "Enable Context Awareness" with the detail "Aux needs macOS permissions to read on-screen app content and record short typed runs." It has three `PermissionRowView` rows, each with an Allow button:
  - Accessibility: "Reads on-screen app content"
  - Input Monitoring: "Records short typed runs"
  - Screen Recording: "Reads text from image-only windows"

  It polls once a second and sets `permissionSheetVisible`. Triggers: `{"command":"permissions","kind":"observer"}` (UI button → `contextAwareness.requestPermissions`), and the menu item "Allow Permissions".
- **Messages sheet** (`MessagesPermissionController`): "Enable Aux with Messages", detail "Aux needs macOS permissions to send messages, find contacts by name, and search your messages when asked." Rows:
  - Automation: "Allows sending messages"
  - Contacts: "Enables finding contacts by name"
  - Full Disk Access: "Allows searching your messages when asked"

  It polls once a second. Triggers: `{"command":"permissions","kind":"messages"}` from `fullDiskAccess.request` (the agent's inline "Grant access" button), or a one-shot command without `--no-dialog`. Completion is reported as `menu-action messages-permissions {completed}`. The daemon waits up to 15 min, then falls back to `permissions.check`.
- **Settings guide dock** (`SettingsGuideDock`, `GuidePanel`, `DraggableApplicationView`, `UpArrowView`): opens System Settings at the deep link, then floats a small panel near it showing the helper app icon. The panel tells the user to drag the app into the list and turn it on ("Open Privacy & Security, then add … to the list, then turn on …"). It uses `com.apple.systempreferences` to find the window. `terminatesSettingsOnDismiss` closes Settings when the sheet is dismissed.
- **Menu-bar item** (`NSStatusBar`, `MenuBarIcon.png` template): titled "Aux Context Awareness". Items: Pause Context Awareness (30 minutes / 1 hour / until tomorrow), Resume Context Awareness, Clear History (last 10 minutes, hour, day, all; confirmation alert), Clear Last App Session, a recent-applications submenu with include/exclude per app and domain, Settings, Allow Permissions, Quit Aux Computer Use.

Bundled art: `AppIcon.icns`, `MenuBarIcon.png`, `MenuBarIcon@2x.png`, `automation.png`, `contacts.png`, `full-disk-access.png`, `imessage.png`. [P]

## 9. Screenshots and coordinate spaces

- **No screenshot crosses the protocol, and no coordinates go to the helper.** [D][B]
- Internally, `ScreenTextRecorder.captureIfBlind` captures a single window with ScreenCaptureKit (`SCShareableContent` → `SCContentFilter` → `SCScreenshotManager`, `SCStreamConfiguration`) when the AX tree is empty ("ax-blind"). It downsizes to `maxCaptureEdge`, runs `VNRecognizeTextRequest`, enforces a per-app cooldown and min/max text length, and emits only `screen.ocr` text plus `captureMs`. [B] `SCScreenshotManager` needs macOS 14 or later, which the macOS 15 floor satisfies.
- Pointer positions are used only internally (`CGEventGetLocation` → `AXUIElementCopyElementAtPosition` in global display points, origin top-left) to resolve the clicked element. The protocol carries the element's descriptors, never x/y. [B][I]

## 10. Timeouts and lifecycle constants (daemon side) [D][N]

| Constant | Value | Effect |
| --- | --- | --- |
| Heartbeat check interval | 10 s | Timer in the manager |
| `HEALTH_TIMEOUT_MS` | 35 s since last `health` | Kill and restart |
| `RECORDER_LIVENESS_TIMEOUT_MS` | 5 min without `event`/`browser-signal` while `running`, trusted, not idle, no secure input, and the user browsed recently | Kill and restart |
| Restart backoff | `min(1000·2^n, 30000)` ms; reset on health | — |
| `ACTOR_IDLE_EXIT_MS` | 5 min | Stop a helper kept alive only for invokes once Context Awareness is off |
| `DEFAULT_INVOKE_TIMEOUT_MS` | 30 s (`imessage.send` 120 s) | Reject the waiter |
| `requestHealth` wait | 1 s | Return cached health |
| `requestMessagesPermissions` | 15 min | Resolve `false` |
| Native stop escalation | SIGTERM, then SIGKILL after 1 s | — |
| Legacy stop | `shutdown` line, SIGTERM at 1 s, give up at 2 s | — |
| `lifecycle.shutdown` exec | 3 s | — |

Helper-side timers observed in `applicationDidFinishLaunching`: 2 s, 10 s and 15 s repeating timers (likely permission refresh, idle check and periodic health). Typed-run flush is 2 s and the input re-arm check is 10 s. [B; roles I] A rewrite must emit `health` well inside 35 s; every 10–15 s is safe.

## 11. Privacy behavior the daemon relies on [B][D]

- System surfaces are never observed:
  - `com.apple.SecurityAgent`, `com.apple.loginwindow`, `com.apple.controlcenter`
  - `com.apple.dock`, `com.apple.dock.extra`, `com.apple.dock.helper`
  - `com.apple.notificationcenterui`, `com.apple.Spotlight`, `com.apple.systemuiserver`
  - `com.apple.appkit.xpc.openAndSavePanelService`, `com.apple.settings.PrivacySecurity.extension`, `com.apple.systempreferences`
- `AXSecureTextField`, `IsSecureEventInputEnabled`, and fields whose labels match the sensitive-label regex (cvv, otp, pin, password, ssn, verification code, card number…) are suppressed and counted as `secure-target` / `secure-input`.
- Windows whose title or URL looks private ("private browsing", …) count as `private-window`.
- Excluded apps and domains are honored before emitting. With `captureTypedText:false`, typed runs are suppressed (`typed-text-disabled`).
- The helper keeps no history on disk. The daemon persists everything under the account. [N README][I]

## 12. Gaps, discrepancies and open questions

| # | Item | Status |
| --- | --- | --- |
| G1 | **Launch record is tied to the supplied binary.** Native code requires `sourceSha256 == debc03de…` and `launch-policy.mjs` refuses any source but that exact derivative. A new Swift helper needs a new record format (or constant) and a matching `aux-daemon` change. | Blocking for the rewrite |
| G2 | **Native route refuses all data commands** and `permissions kind:"messages"`, and the sandbox denies fork, network and `secd`. So Messages, Contacts and Kakao cannot work in release 91, whatever the helper does. Whether the new helper keeps those commands is a product decision for Robert. | Decision |
| G3 | Daemon `listApplications` filters `dev.aux.browserCanary`; the helper and patches use `dev.aux.browser.canary`. The canary may show up in its own exclusion picker. | Bug, small |
| G4 | Sealed candidate helper has **no entitlements** (Apple Development signed); release 91 is Developer ID signed with Apple Events + Contacts. The audit's hardened-runtime finding applies to the candidate only. | Note |
| G5 | Exact `data` shapes of `permissions.request`, `messages-permission-dialog`, `lifecycle.shutdown`, `kakaotalk.search` and the internal `imessage.*` helpers are inferred from field-name strings only. | Inferred |
| G6 | Whether the observer exits on stdin EOF, how it handles SIGTERM (it has a dispatch signal source), and the exact roles of its 2/10/15 s timers. | Inferred; specify in the rewrite (exit on EOF, flush on SIGTERM) |
| G7 | The observer may capture before the first `pause`/`policy` line. | Fix in the rewrite: start paused |
| G8 | No protocol version on macOS; Windows uses `protocolVersion: 1`. A rewrite can add `protocolVersion` to `health` safely (the schema allows it). | Optional |
| G9 | `LSMinimumSystemVersion 13.0` while the product floor is 15. | Raise to 15 |
| G10 | REA/Ghidra decompilation was unavailable earlier; everything here comes from strings, imports, demangled symbols and spot disassembly (`main`, `reexecDisclaimedIfNeeded`) plus decoding of Swift small-string immediates. Large function bodies (AX serializer, diff format, OCR thresholds) are not reconstructed. | Limit |
| G11 | `docs/spec/README.md` calls this folder historical. | Doc note |

## 13. Minimum compatible rewrite checklist

1. Same bundle path, executable name, `CFBundleIdentifier`, team, display name, `LSUIElement`, the four usage strings, hardened runtime and the two entitlements (if Messages/Contacts stay).
2. `main`: disclaim re-exec with `AUX_TCC_DISCLAIMED=1` and `POSIX_SPAWN_SETEXEC`, then the argv dispatch from 3.4.
3. Observer: NDJSON on stdin/stdout. Accept the 8 commands in 6.2. Emit `health` (≤15 s apart and on demand), `event`, `browser-signal` for `dev.aux.browser[.canary]`, `attention`, `suppression`, `menu-action`, `result`, `protocol-error` with the field names above. No other output on stdout.
4. One-shot: the grammar, envelope, error codes and reasons in 7, exit status 1 on usage errors.
5. Permission sheets, guide dock, deep links and menu-bar item as in 8.3. Report `permissionSheetVisible` and `responsibleSelf`.
6. Fit the native route: no fork, no network, no Keychain; HOME and TMPDIR are a private role directory; reads limited as in 3.2.
7. Ship a new launch record and update the native constant together (G1). Sign with Developer ID `9F2JXY8TCK`.
