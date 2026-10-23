# Startup-fix daemon and package integration — 2026-10-23

The owner's authorized integration is complete as a separate **inactive** candidate. No app was launched, quit, shut down, restarted, installed, signed or replaced. Existing accepted and inactive candidates are retained.

## Exact change and build

`link-recipe.json` selects the single reviewed `AuxBrowserFreshRootAdmission.swift` successor from the prior delivery graph. `daemon-inputs.json` freezes all inputs. The actual 48-Swift/12-object unsigned compile/link ran under `scripts/native-build.py` and `/tmp/aux-build.lock`; `daemon-link.json` reports success, unchanged inputs, actual native module import resolution, internally bound private capabilities and absence of signature load commands in the daemon/module. No new executable or module was executed. The compile/link command differs only in the selected Swift file and fresh output/cache location; the paired native interface imports/private definitions remain unchanged.

The new daemon is `/private/tmp/aux-protected-startup-link-20261023/Aux Daemon`. `source-pair.json` pins it and its new receipt while preserving the exact previous JavaScript source, dormant entry, loader and PTY bytes. The successful final native-browser receipt is reused; no Chromium rebuild or source mutation occurred.

## Package and verification

`package-command.json` records the actual preparation arguments; `package-recipe.json` is the exact recipe. Actual output is `out/provided-candidate-protected-startup-integration-20261023/Aux.app` under the workspace. The assembly receipt remains beside that app. Preparation and assembly passed; source apps remained unchanged and unrelated supplied/UI resources compared identically. The package metadata's current app path, daemon hash and both paired receipt references were independently checked.

`actual-package.json` binds the result and compares all11,191 leaf records against the previous candidate's successful recorded inventory. Exactly two leaves differ: the daemon executable and `Contents/Resources/aux/bundle.json`. No CSS, assets, browser binary, entry/module/runtime leaf or UI resource differs. The new assembly also independently verifies the actual baseline/native inputs; this comparison does not execute UI or establish behavior parity.

## Remaining scope

The default refusal and dormant startup gate remain unchanged. This package is not activated or runtime-accepted (`testable:false`). It integrates an observed-inventory defense only; the post-check writer race, external hardlink bypass, complete native startup/custody, safe shutdown/recovery, atomic runtime publication and actual-app acceptance remain open. Historical acceptance is not transferred. Product signing and release are separate.
