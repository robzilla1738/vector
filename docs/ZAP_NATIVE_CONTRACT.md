# Zap, voice, and cloud native handoff

## Zap and per-site CSS

`ZapService` stores at most 100 exact HTTP(S) site grants in the current Profile's runtime DB. A site policy has a revision, up to 100 unique element selectors and at most 16 KiB of user CSS. Selectors cannot break out of the generated hide rule. User CSS rejects imports, URL/image source functions, escapes and control syntax; no JavaScript boost is accepted. An external or scoped agent connection cannot create, change or revoke a Zap grant. The desktop user must grant the exact origin first.

The authenticated native host must implement `native.zapInstallStylesheet` using `ZapStylesheetInstallSchema` and return `ZapInstallReceiptSchema`. Install the exact stylesheet by **Profile ID and frame origin** in Chromium's user stylesheet mechanism before each matching document starts, including subframes. Do not inject it into a different origin's frame. `revision` and `stylesheetSha256` identify the policy. An empty stylesheet removes that origin's rule for future and active documents. The receipt must report `phase: document_start`, `futureDocuments: true`, and each active document's page ID, epoch, frame origin and applied state. The runtime rejects a mismatched receipt and retains the previous saved policy.

At Profile boot, the host calls authenticated `zap.snapshot` with its Profile ID and installs the returned requests before restoring tabs. This is necessary for first-paint hiding after restart. The host must stop applying a policy when its origin is revoked or the feature is disabled. The runtime service serializes edits and checks expected revisions; native installation must be idempotent by Profile, origin, revision and hash. Current-page retries must check document epoch to avoid applying an old rule to a navigated page. The runtime's Profile DB is the policy source of truth; a native receipt proves installation but is not an independent permission grant. Patch `0018-native-zap-stylesheet.patch` adds the authenticated Profile snapshot, commit barrier, renderer user stylesheet hook, active-frame receipt, and revocation. Native build and first-paint qualification must run after the patch is applied to the Chromium source tree.

## Voice audit

The current renderer has review-before-insert on-device dictation, backed by the Electron macOS speech helper. It does not have a typed push-to-talk **command** intent or a Chromium host speech bridge. Native work needs microphone permission and session/epoch ownership, an on-device transcription result with provenance, a finite command grammar, explicit review before consequential commands, and a result receipt bound to the focused window. Realtime conversation also depends on a verified Gateway realtime model; no model substitution is authorized here.

## Cloud-task audit

`CloudTaskResultSchema` already pins task ID/revision, uploaded source tree and optional authority lease. `CloudEnvironmentService.taskResult` validates those fields, criterion IDs and artifact paths; the fixture provider tests pass. Native work still needs the Chromium shell's protected preview/terminal handoff and local approval surfaces wired to those existing APIs. Real Vercel use requires the owner's token and is outside this fixture qualification.
