# Aux Sparkle 2 integration

Aux pins the official [Sparkle 2.10.0 release](https://github.com/sparkle-project/Sparkle/releases/tag/2.10.0), archive `Sparkle-2.10.0.tar.xz`, SHA-256 `c2bf58aa8387266ac179357b1415d6f2635f044da8be41042af32425dae6da0c`. Stage it before GN generation with `node chromium/fetch-sparkle.mjs --source /path/to/chromium/src`. The script verifies the whole archive, stages the framework, signing tools and license outside tracked source, and refuses to replace an existing stage. The app bundle copies the framework with its symlinks and the license notice.

Sparkle is opt-in in the Aux build. Set these GN arguments only after the update feed and EdDSA public key are ready:

```gn
enable_aux_sparkle = true
aux_sparkle_feed_url = "https://updates.example.com/aux/appcast.xml"
aux_sparkle_public_ed_key = "BASE64_ED25519_PUBLIC_KEY"
```

The browser’s Updates menu offers **Check for Updates**, **Check Automatically**, and **Stable/Beta Updates**. The channel choice is stored in the app’s user defaults; Sparkle’s delegate adds the `beta` channel when selected. Stable remains the default channel. Automatic checks start off. The menu is compiled only for the configured Aux distribution. The framework is loaded from Aux.app and Sparkle’s standard update UI handles the check and install flow.

`scripts/chromium-sign.mjs` checks the framework version, required nested services, configured feed and public key, and Chromium’s nested signing support. The signer signs Sparkle’s Installer and Downloader XPC services, Autoupdate, Updater.app, the framework, then the outer app. After signing, the wrapper verifies every nested signature and Team ID. A release feed must use HTTPS; `--local-feed-rehearsal` allows only HTTP loopback for a local fixture. Ad-hoc signing is rejected for Sparkle delivery because it does not establish the Developer ID and library-validation behavior needed for a real update.

## Local N→N+1 and rollback rehearsal

This sequence stays on the Mac and does not install or publish anything:

1. Run `node scripts/sparkle-rehearsal.mjs keygen --output /secure/local/aux-fixture.key`. The file contains a disposable private seed with mode 0600. Put the printed public key in the GN arguments of **both** fixture builds; never commit the seed.
2. Build signed Aux N and N+1 with the same Team ID and `aux_sparkle_feed_url = "http://127.0.0.1:8765/appcast.xml"`. The signer must use `--local-feed-rehearsal`. Keep each app bundle at a distinct local path.
3. Run `node scripts/sparkle-rehearsal.mjs prepare --app-n /path/N/Aux.app --app-next /path/N-plus-1/Aux.app --key-file /secure/local/aux-fixture.key --sign-update /path/to/chromium/src/third_party/aux_sparkle/bin/sign_update --base-url http://127.0.0.1:8765 --output /path/to/clean/rehearsal`.
4. Run `node scripts/sparkle-rehearsal.mjs serve --output /path/to/rehearsal --phase upgrade --port 8765`. In signed Aux N, choose **Updates → Check for Updates**, inspect the offer, and complete N→N+1 using a disposable Profile. Record the pre/post bundle signatures and Profile hash or location without copying user data.
5. For rollback, build the prior code as a separately signed recovery version with a **higher** `CFBundleVersion` than N+1 and pass it to `prepare` with `--rollback-app`. Restart the server with `--phase rollback`; then check and install from N+1. Sparkle will not downgrade to an older version number. Verify the schema downgrade guard and Profile recovery separately.

`prepare` rejects ad-hoc bundles, mismatched Team IDs, public keys, feed URLs and non-increasing versions. It creates signed appcast fixtures and archives locally. Successful fixture preparation proves feed construction and package signing; it does not prove installation. The owner-operated signed update and rollback remain takeover checks in `tests/takeover/cases.mjs`. See [Sparkle’s setup](https://sparkle-project.org/documentation/), [channel guidance](https://sparkle-project.org/documentation/publishing/), and [nested signing order](https://sparkle-project.org/documentation/sandboxing/).
