# Aux macOS helper protocol v1

Original implementation of the helper boundaries in `docs/spec/daemon/services.md` and native lifecycle requirements in `docs/spec/native/platform.md`. Method payloads below are independently chosen Aux contracts because helper event details remain draft in the behavioral specs.

Build with `python3 scripts/build.py`. The output is `dist/Aux Computer Use.app`, identified as `dev.aux.computer-use`, compiled for the local Apple Silicon macOS 14+ target and signed ad hoc for local use. No developer identity or notarization is used. Launching with `--menu-bar` displays an accessory status item with Privacy settings and Quit. The normal mode is a headless protocol process with an AppKit event loop for OS prompts.

## Transport and authority

Daemon mode uses UTF-8 newline-delimited JSON over child stdin/stdout. Request: `{id:string|number, method:string, params?:object, auth?:string}`. Reply: `{id,result:object}` or `{id,error:{code,message}}`. Stdout contains only protocol messages. Unknown methods return `NOT_IMPLEMENTED`; malformed inputs return `BAD_REQUEST`. Native/permission failures are explicit and do not claim successful access.

The daemon owns the helper process and provides a random 32-byte-or-longer `AUX_HELPER_AUTH_TOKEN` plus a private `AUX_HELPER_ARTIFACT_DIR` in its minimal child environment. Every method except ping, capabilities, permission status, and biometric hardware availability requires that token. Vault keys are confined to the private pipe and Keychain; they never travel through a public HTTP route or logs. A model never receives or supplies the transport token. Human approval is enforced by daemon session tools before actuation. Direct actuator transport is a trusted daemon boundary, not a substitute for session policy.

Chromium Native Messaging is also supported when Chrome passes its extension origin, or with `--native-messaging`: little-endian uint32 byte length followed by JSON. Requests are bounded to 8 MiB, replies to 1 MiB. Caller origins must match the freshly generated Aux origins embedded by the build. An originless explicit framing flag is permitted for read-only protocol verification. Native hosts do not inherit the private daemon token, so privileged commands remain unavailable through a bare native host. `scripts/install-hosts.py` writes `dev.aux.computer_use.json` only into a caller-selected `--browser-user-data-dir`; it never discovers or modifies owner profiles automatically.

Deadlines: ordinary external commands 30 seconds, AppleScript 60 seconds, interactive OS prompts at most 120 seconds. The daemon transport deadline is 150 seconds. It never retries a command whose outcome is uncertain. Cancellation retires only the owned child process group after verifying its live executable with `ps`; no historical PID is reused as authority.

## Commands

| Method | Parameters | Result / enforcement |
| --- | --- | --- |
| `ping` | none | service/version/current pid |
| `capabilities` | none | implemented method inventory; private-transport boundary and unavailable semantic-capture/message-reading features |
| `permissions.status` | optional automationTargets string array, max 20 | Accessibility and Screen Recording preflight, Contacts authorization, per-target Automation status without prompting, Full Disk Access unknown, biometric hardware state |
| `permissions.request` | kind accessibility/screenRecording/contacts/automation/fullDiskAccess; automation requires bundleId | actual OS prompt/request or Settings opening; opening Settings never means permission is granted |
| `screen.capture` | optional x/y/width/height region | native screenshot only after Screen Recording preflight; owner-only PNG artifact path, MIME type, pixel dimensions |
| `input.click` | x/y; button left/right | Accessibility-gated mouse events posted; this is not proof that a target action succeeded |
| `input.type` | text, max 50,000 UTF-8 bytes | Accessibility-gated Unicode input; grapheme boundaries preserved |
| `input.scroll` | x/y pixel deltas, each bounded to ±10,000 | Accessibility-gated scroll event |
| `input.key` | named key; optional command/shift/option/control modifiers | Accessibility-gated allowlisted key event |
| `apps.list` | none | actually running regular apps: pid, bundleId, name, bundlePath, active |
| `apps.open` | installed bundleId | native app launch/activation with actual pid or error |
| `automation.run` | script, max 100,000 bytes | AppleScript supplied through stdin, bounded native execution; script must already have been human-approved by the daemon |
| `contacts.search` | nonempty name query; limit 1–100 | authorized Contacts fields only: identity, names, organization, phones, emails; never silently prompts or enumerates every contact |
| `messages.send` | recipient, body, confirmed=true | iMessage through the real Messages Automation API after daemon draft confirmation; no inbox/database reading implemented |
| `vault.biometryAvailable` | none | LAContext hardware/OS enrollment availability without prompting |
| `vault.biometryStatus` | accountId integer, vaultId | noninteractive existence/hardware status; no secret returned |
| `vault.biometryEnroll` | accountId, vaultId, canonical 32-byte base64 key | actual biometric verification then account-scoped Keychain generic password protected by biometryCurrentSet and WhenUnlockedThisDeviceOnly; duplicate enrollment conflicts |
| `vault.biometryUnlock` | accountId, vaultId | OS-protected biometric unlock returns key only on the private pipe |
| `vault.biometryRemove` | accountId, vaultId | removes only that account/vault enrollment; absent is harmless |

The vault service uses `vaultId:master-v1` for its account master key, verifies the current vault password before enrollment, and verifies returned key material against authenticated encrypted vault data before considering the vault unlocked. The helper Keychain service is `Aux Vault`; logical account strings include both account and vault identity. Buffer erasure is best effort in Swift/Foundation; no claim is made that immutable JSON/string copies can be securely erased.

Semantic window capture, Messages reading, Full Disk Access detection through private TCC databases, password-manager database decryption and OS-protected source Safe Storage import are not implemented by this helper. The capability report states these gaps explicitly. Tests compile the Swift app, query safe status, verify framing and reject unauthorized private commands. They do not capture the owner's screen, read contacts/messages, create biometric Keychain entries, or send communication.

## Accessibility snapshot extension

`apps.frontmost` returns only the currently active pid/bundleId/name. An opted-in context observer must check its application/site exclusions before requesting semantic content. `accessibility.snapshot({pid})` then verifies that exact pid is still foreground, requires Accessibility, reads its focused-window accessibility tree with a three-second/1,000-node/depth-20 bound, and rejects a foreground-app switch. It returns a fresh snapshotId, app/window identity, bounded static text and node evidence. Editable/secure field values are omitted. This mechanism is implemented but no owner-window snapshot was taken in verification. Continuous observation and browser-origin exclusion race handling remain the daemon observer's responsibility; callers should exclude browser apps unless a bound browser interface can validate the source origin before content retrieval. `permissions.status.semanticCapture` reports available or permission-required for this mechanism, without claiming that an observer is running.

`messages.send` additionally requires a stable `operationId`. A private owner-only journal stores only the operation/request hashes and started/completed state. Repeating the same completed operation returns its recorded result; a started operation with uncertain outcome is never sent again automatically. The journal never stores recipient or message body.

Daemon `computerUseTools` wraps all desktop mutation/screenshot/Contacts operations in an exact-operation approval. iMessage has a separate action-confirmation containing the complete recipient and body. Read-only sessions cannot actuate or send. Posted input is reported as posted, not as evidence that the intended app workflow completed. The helper's native methods are never exposed as an unrestricted model-callable transport.

`createHelperCaptureAdapter(client)` implements the memory context permission interface:
AX semantic capture is granted only when the helper reports the implemented AX snapshot
capability available, and otherwise denied/unavailable. Screen capture status remains
separate. Requesting context permission initiates Accessibility authorization and rechecks
actual status. This adapter does not start an observer or collect any screen content.
The integrator must apply opt-in and app/domain exclusions before each native snapshot.

## Continuous observer semantic transport

`semantic.prepare({})` is daemon-private, requires existing Accessibility permission and never prompts. It returns `{state:'ready',candidate:{id,pid,bundleId,appName}}` or `{state:'skipped',reason}`. It reads only application metadata and focused-window identity. Applications declaring HTTP/HTTPS URL handling (or known browser bundle identities) are skipped. The helper cannot prove browser profile/private mode from OS accessibility data.

`semantic.capture({id})` consumes a fresh single-use token (ten-second lifetime). Before reading text/title/value attributes it performs a complete bounded role/children pass; web areas, unknown role trees, or a truncated pass cause a skipped result. Editable/secure subtrees are omitted entirely. A second pass reads bounded static text, rechecks roles, then verifies foreground process launch identity and exact focused window before/after title retrieval. It returns `{state:'captured',candidateId,pid,bundleId,appName,windowTitle,content,occurredAt,editableValuesOmitted:true,browserContentOmitted:true}` or a truthful skipped reason. Process/window change returns CONFLICT and discards content. Captures never contain a browser URL, account/profile claim, screenshot, or editable field value. Bounds: 1,000 nodes/depth 20, two-second inspection/three-second total traversal, 100,000 characters, 2,000 title characters. AX call timeouts limit individual calls; daemon deadlines additionally bound the transport.

The daemon checks opt-in, current unlocked account, existing permission and exclusions before prepare/capture and before durable ledger/index commit. Browser metadata has a separate authenticated Aux extension route with actual native profile and incognito checks; this helper never infers private mode from a URL/title. Capability availability is distinct from whether a live observer is running. Tests compile this implementation and run pure policy fixtures; no owner application accessibility tree was captured.

Public platform references: [Apple accessibility attribute API](https://developer.apple.com/documentation/applicationservices/1462085-axuielementcopyattributevalue), [Apple bundle URL scheme metadata](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html).
