# Aux crash reports

Chromium's Crashpad records local dumps in Aux builds. Aux upload is disabled by default: `aux_crash_upload_url = ""` in GN, `AuxCrashUploadURL` is empty in the app bundle, and the Aux Crashpad client passes an empty upload URL to the handler. It never inherits Chromium's Google upload URL. The native **Aux → Crash Reports…** menu explains the state.

To prepare an upload-capable distribution, the owner must set `aux_crash_upload_url` in GN to an HTTPS endpoint they control. The release signer checks that this exact URL appears in `Aux.app/Contents/Info.plist` and rejects HTTP, credentials, and fragments. No endpoint is included in this repository. A configured build asks once, after launch, whether to share reports. **Keep on This Mac** is the default button. The choice is saved under Aux's own `dev.aux.browser` preference domain and bound to the exact endpoint; changing the endpoint asks again before any upload. The choice can be changed later from the same menu. Chromium's metrics preference and policy cannot substitute for it. Revoking consent disables Crashpad uploads for the current session immediately; Crashpad still retains local reports. A preference write failure leaves uploads off for that session and presents an error.

## Local offline check

After building patch `0022` with the default empty URL, use a disposable Profile and crash directory:

```sh
mkdir -p /tmp/aux-crash-check/profile /tmp/aux-crash-check/database
BREAKPAD_DUMP_LOCATION=/tmp/aux-crash-check/database \
  /path/to/Aux.app/Contents/MacOS/Aux \
  --user-data-dir=/tmp/aux-crash-check/profile --no-first-run
```

Open `chrome://crash` in that Aux window. Chromium deliberately crashes only that tab. Then inspect the local database without reading or uploading report contents:

```sh
node scripts/crashpad-local-check.mjs \
  --app /path/to/Aux.app \
  --crash-dir /tmp/aux-crash-check/database \
  --require-report true
```

The script refuses an unpatched bundle or any configured upload endpoint, and reports only dump counts. `BREAKPAD_DUMP_LOCATION` is required because Chromium initializes Crashpad before it processes `--user-data-dir` and otherwise uses the default user data location for dumps. Remove the disposable directory after reviewing the counts. This offline check proves local capture and the absence of a configured upload destination. It does not prove a live upload.

## Owner-operated consent check

With an owner-controlled HTTPS Crashpad endpoint and a freshly signed test Aux build, use a disposable macOS user and Profile. Record the app's `AuxCrashUploadURL`, then launch. Choose **Keep on This Mac** at the first-run prompt, trigger a tab crash, and verify the endpoint receives no request. Use **Aux → Crash Reports…** to choose **Share Crash Reports**, trigger another crash, and verify the request and server response. Choose **Keep on This Mac** again, trigger a third crash, and verify no further request. Repeat after cold restart to verify the choice persists. Record request counts and bundle metadata only; do not retain minidumps or request bodies. This check requires a real configured endpoint and a build containing patch `0022`; it cannot be completed against the earlier AuxProof candidate.
