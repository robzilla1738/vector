# Building a release

How a signed, notarized, self-updating Aux release is produced from the native build and the sealed components. Decisions behind it are in the [release readiness checklist](../plans/2026-10-28-release-readiness.md), section 1. Publication is never automatic: uploading, deploying `aux-web` and publishing the appcast each need the owner's yes.

## Inputs

| Input | Where |
|---|---|
| Native browser | `out/AuxFast/Aux.app` (local) or `out/AuxRelease/Aux.app` (official, `chromium/flags.release.gn`) in the durable checkout |
| Components | `Contents/Resources/aux` of the sealed candidate `out/provided-candidate-completion-20261026-a1/Aux.app` |
| Package edits | `scripts/release/package-edits.json`: exact, count-checked text edits with a reason each |
| Sparkle | `scripts/release/fetch-sparkle.sh <src>` puts the pinned Sparkle 2.10.0 (SHA-256 checked) in `third_party/aux_sparkle`; the tree export skips it |
| Update key | EdDSA key in the login Keychain, account `dev.aux.browser.sparkle`. Public key `UBNrxzKVI36ii/HG/gywivbitrC58MjsAsaa5HLC8Sk=` (in `flags.release.gn`). Back up the private key (owner plan); losing it strands every installed copy |
| Signing | Local checks: `Apple Development: Robert Courson`. Release: `Developer ID Application: Robert Courson (9F2JXY8TCK)`, plus a Developer ID provisioning profile for `dev.aux.browser.daemon` |
| Notarization | Keychain profile `muse-desktop` (team-wide, despite the name) |

## Steps

```sh
python3 scripts/release/assemble.py --native <src>/out/AuxRelease/Aux.app \
  --components out/provided-candidate-completion-20261026-a1/Aux.app \
  --out out/release/1.0.0-<build> --build <build> --identity developer-id \
  --daemon-profile <Aux Daemon Developer ID profile> \
  --release-addons out/live-inputs/completion-20261026/release-addons-a1 \
  --daemon-executable "out/live-inputs/completion-20261026/release-state-root-a6/Aux Daemon" \
  --crash-dsn-ref "op://Agents/Aux Sentry DSN/dsn"
python3 scripts/release/package.py --release out/release/1.0.0-<build>
```

`--release-addons` supplies the release PDF and utility addons; `--daemon-executable` is the daemon relinked to accept exactly that pair (`scripts/candidate/relink_daemon.py`, sources under `docs/integration/proposed/completion-20261026/runtime/release-state-root-a1/`). `--crash-dsn-ref` is read with `op-agents` and never printed. For a local look at a build, move `~/Library/Application Support/Aux` and `~/Library/Caches/Aux` aside first, then run `Aux.app/Contents/MacOS/Aux` from the build folder; the daemon answers on `127.0.0.1:21520` about a minute later.

`assemble.py`:
1. Copies the native app, then the components. Nothing else comes from the candidate.
2. Applies the package edits:
   - the daemon trusts only `app.getaux.co` among remote origins;
   - inherited cloud, provider and GitHub credentials are dropped;
   - skill icons load from `app.getaux.co`;
   - the messenger help links open the Aux docs;
   - the new tab page drops its profile menu (the browser sidebar has one) and shows its suggestions as a centered row of compact chips instead of gradient cards, centers the logo, search bar and chips vertically, and turns the Codex banner into a generic "Connect your agents" banner;
   - settings, chats and projects sit flush in the native page card (no inset, border, hairline or radius of their own), divided from the settings nav by a 1px line;
   - the side panel chat menu says when there are no chats instead of opening empty;
   - site icons come from the browser's own favicon store, so no visited domain goes to Google's favicon service;
   - the Agent's tab favicons are replaced whole (`FILE_REPLACEMENTS`, each checked against the SHA-256 of the file it replaces) with the plain Aux mark from `assets/brand/extension/`, light on dark and dark on light.
   - `scripts/release/transforms.mjs` then adds the provider CLI runtime beside the daemon entry and applies its count-checked transforms: borrowed sign-in clients removed, provider CLI hooks in the daemon, CLI rows and dialogs in the Agent ([provider CLIs](../integration/proposed/completion-20261026/runtime/provider-cli-a1/design.md#integration-release-build-2026-10-28)).
3. Ships a small `bundle.json` with only the keys the browser and CLI validate (`aux_packaged_state_identity.h`). The full stage provenance is kept next to the app as `stage-provenance-bundle.json`.
4. Sets the public version (1.0.0) and an increasing build number, and adds the camera, microphone, location and Bluetooth usage strings.
5. Signs inside out with hardened runtime:
   - The outer app gets camera, microphone, location and Apple Events entitlements (as Chrome does).
   - Computer Use gets Apple Events and Contacts.
   - The daemon gets its keychain group and application identifier.
6. In Developer ID mode it also handles nested Mach-O files:
   - It re-signs every nested Mach-O that lacks a Developer ID signature: Aux's own development-signed addons, the unsigned arm64 `pty.node` and the memory seed.
   - It keeps third-party Developer ID signatures: At Inc. on the runtime tools, Node.js on `node`.
   - It re-pins everything that changed: the runtime inventory and its hash in `runtime-bootstrap.cjs`, the memory runtime's pins, and the memory runtime directory, which is named after its own hash.

`package.py`:
1. Notarizes and staples the app, then checks it with `spctl`.
2. Builds the update zip.
3. Builds an APFS DMG with an Applications link, then signs, notarizes and staples it.
4. Generates `updates/appcast.xml` with Aux's key and verifies the signature.
5. Writes `download.json` for the `getaux.co/download` page.
6. Stops before upload.

## After packaging (owner yes for each)

1. Upload `Aux-<version>.dmg` and `Aux-<version>.zip` to the public Blob store `aux-downloads` (`store_keswZfgEx7j6cpf0`).
2. Deploy `aux-web` with the new `download.json` and `updates/appcast.xml`.
3. Check the live feed and downloads, then check for updates from the previous version.

A published version is never replaced with different bytes; a fix is a new build number.

## Not yet proven

- `flags.release.gn` has not been built (official build, ThinLTO, PGO).
- No Developer ID assembly has run: the identity and the daemon profile are owner steps.
- The update path from one build to the next has only been designed, not exercised.
