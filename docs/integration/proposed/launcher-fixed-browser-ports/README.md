# Supplied candidate port isolation

The current full browser candidate **cannot run concurrently with another Aux browser using daemon21520/CDP45203**. Changing `--port` does not relocate the complete supplied stack. Owner Aside remains distinct on its original21420/45103; do not connect to it or retire it. An old summary PID, executable name, port listener or health response alone is not sufficient retirement authority.

`fix.patch` pins root scripts/aux.mjs from019227d96 and rejects non21520 `--port` in browser mode before bundle access or temporary-home allocation. It leaves explicit daemon-only overrides available, pins AUX_HOST/DAEMON_BASE_URL/AUX_BROWSER_CDP_HOST like the native supervisor, and introduces no new discovery mechanism. Inherited endpoint variables cannot redirect daemon-only self callbacks or CDP to Aside. Apply only against `manifest.json`'s exact baseline; lane launcher itself is deliberately unchanged.

## Exact observed contract

| Boundary | Actual source behavior |
| --- | --- |
| Launcher | Parses `--port`, defaults21520 and writes AUX_PORT to child environment (it takes precedence over inherited AUX_PORT). `--temp-profile` creates an original private `aux-provided-*` root and sets HOME/AUX_HOME to its home, with distinct `--user-data-dir` profile; mock Chromium Keychain is enabled. |
| Browser platform | Validates AUX_PORT and supplies it to the native daemon supervisor. StateHome uses AUX_HOME rather than Aside. |
| Native supervisor | Pins AUX_HOST=127.0.0.1; daemon AUX_PORT and DAEMON_BASE_URL use selected port. AUX_BROWSER_CDP_HOST is explicitly127.0.0.1:45203. Child PID/creation time/executable ancestry remain ownership checks. |
| Actual supplied daemon | Original ASIDE_PORT/ASIDE_HOME/ASIDE_BROWSER_CDP_HOST become AUX equivalents through counted adapter edits. DAEMON_BASE_URL overrides self callback routing; it does not relocate extension clients. Default21520/45203 after adaptation. |
| Native CDP listener | Aux branch constructs its authority and TCPServerSocketFactory with literal45203. AUX_PORT and a caller's generic remote-debugging switch do not change this branch. Auth checks the matching Host/port plus the original AsideSessionToken scheme. |
| Agent production discovery | background.js and assets/queries-ldd77hNk.js choose constant21420 in original; the stager maps21520. VITE_* alternate is inside DEV-only condition; shipped DEV=false. This is compiled UI code, not a runtime environment override. Agent background has no daemon_base_url storage-key consumer. |
| Vault discovery | Original production default21420 becomes21520. Its actual gc() reads and validates daemon_base_url from chrome.storage.local. This single actor option does not change Agent discovery or native CDP and cannot establish a second full candidate. Fresh disposable profile has no owner storage values. |
| Profile routing | Native profile gate/account requests use current AUX_PORT and actual account/profile identity; Browser.ensureChromiumProfile/ensureProfile use live native profile registration and selected daemon Vault status. The supplied daemon discovers CDP through authenticated /json/version, then /json/list and actual Browser.* routing. A profile ID is not a port override. No new /profiles discovery endpoint is proposed. |
| Bridge | Supplied Aside.* commands are intercepted by the actual supplied extension-command bridge over its daemon connection, before generic CDP. Historical21521 is a DEV daemon fallback, not an independently configurable production bridge listener. |

Source hashes are in source-pins.json. Required original wire bytes are preserved. No existing process, profile, credential or endpoint was inspected.

## Runnable candidate command, after prerequisites

After root has positively retired any old **disposable Aux** using21520/45203 and accepted the actual native carrier boundary for disposable execution:

```sh
AUX_ALLOW_EXTERNAL_SKILL_SYNC=0 \
AUX_ENABLE_PROVIDED_NATIVE_CARRIER=1 \
node scripts/aux.mjs \
  --app /absolute/path/to/final-candidate/Aux.app \
  --temp-profile --port 21520
```

This is a prepared command, not an executed acceptance test or authorization to use owner state. The native-carrier flag is explicit because its production adapter otherwise rejects execution; the launcher never manufactures it. Use the final matching bundled native boundary and successful build receipts. `--temp-profile` overwrites inherited AUX_HOME and HOME for children, uses a new user-data root, and prints/retains its root at shutdown. It does not itself prove custom Keychain isolation or complete descendant shutdown. Do not add inherited test overrides or separately start a daemon beside the browser; native owns its child daemon.

Daemon-only inspection can choose another daemon port, for example `--no-browser --temp-profile --port 21522` with the same selected app and separately accepted boundary. This relocates that daemon's HTTP listener only. Its default browser/CDP endpoint remains45203 unless deliberately configured through the actual daemon contract; it is not an isolated second browser test and must not run browser tools against another existing Aux.

## Old disposable Aux retirement prerequisites

Root must establish these from the original test launch record before any control action:

1. Exact app executable/canonical candidate path, process identity including creation time, and original disposable `--user-data-dir` and HOME/AUX_HOME root all match the authored test. PID10002 in an old summary is only a lead, never authority. No profile path may resolve into owner Aside/Aux data.
2. Stop through the still-owned launcher/guardian or verified direct child lifecycle. Any daemon requiring separate cleanup must be tied to that same disposable launch by current PID/creation identity, canonical executable and original parent/launch record. Do not adopt arbitrary PIDs from ports, health, names or broad process scans. If that evidence is unavailable, stop and retain the old state rather than guessing.
3. Confirm owned shutdown outcomes. An absent guardian group does not prove detached supplied-runtime descendants stopped. Keep/print the old disposable root until authoritative cleanup is established. Never delete state merely to make startup succeed.
4. Before candidate launch, root must establish21520 and45203 are available without borrowing or shutting down any unknown listener. Candidate launch failure is not permission to terminate a collision. Keep owner Aside untouched throughout.

## Verification and limits

`node scripts/test_launcher_port_contract.mjs` passes four parsing-only fixture cases: browser custom-port rejection (including --temp-profile), default browser-port acceptance through parsing, and daemon-only custom-port acceptance through parsing. Those parsing cases use a launch import that throws if called and a missing fixture app. An additional daemon-only environment fixture uses an authored fake controller, marker/boundary files and fake health function (no fetch/network), verifying inherited owner-like endpoint values are replaced by selected-port loopback/self URL and native45203. No product/native command, endpoint request, process inspection, Keychain/grant action or native build occurred. Pinned patch replay/hash and JavaScript syntax pass. Actual old disposable process identity, port availability, native transport, supplied UI auth and side-by-side owner Aside operation remain root's future runtime checks.
