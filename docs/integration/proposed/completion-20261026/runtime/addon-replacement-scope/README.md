# Replacing the supplied addon (Batch 4 scope)

The last Aside identity in the delivered app is the supplied native addon, copied unchanged as `apps/cli/Aux CLI.app/Contents/Resources/native/provided-native.node`. It holds 621 `AsideNative*` symbols, its C exports `AsideNativeRun` and `AsideNativeFree`, and the hard-coded keychain group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography`. `libaux-native-boundary.dylib` remaps that group at runtime.

## Who uses it (audit 2026-10-27)

- **The browser's carrier** (`vendor/provided/native/native-carrier.mm`) `dlopen`s it and calls `AsideNativeRun` for `get-public-keys`, `cdp-sign`, `agent-inbox-key`, `install-init` and `install-status`. The first three are called from `chrome/browser/aux/installation_auth.cc` (`RunCarrier`).
- **The CLI's `aux-native.cjs`** loads it only when `AUX_ENABLE_PROVIDED_NATIVE_CARRIER=1`, which is never set ("Provided native execution has not been accepted"). Otherwise it is load-only.
- **The daemon** doesn't load it. Its two addons (`aux-pdf.node`, `aux-macos-utilities.node`) are clean Aux derivatives, and its installation and signing authority is linked from Aux sources: `aux-native-p256-envelope-port`, `aux-native-pq-continuation`, `aux-native-signing-port` and `aux-native-inbox-v2`.

## Replacement

1. Build an Aux carrier backend from those ported Swift sources that serves the same five commands with the same JSON request and reply shapes. Compile it for the group the boundary already maps to, so every existing item stays readable with no data migration and no key reset.
2. Point the carrier at that backend. Remove `provided-native.node`, `native-role-pins.cjs`'s pin for it, and the load-only probe from the CLI bundle.
3. Keep `aux-native-guard.node` and the boundary interposer until a full Keychain query census shows no caller still uses the original group name.

## Gate

This new code reads and writes Keychain items: installation keys, the CDP signing key and the agent inbox master key. AGENTS.md requires owner approval for anything touching Keychain material. The runtime checks are startup, daemon authorization, CDP signing, inbox key read, and Quit/reopen against existing state. Nothing here was built or run.

## Result (2026-10-27): removed, no port needed

The legacy addon path is unreachable in the shipped product. `RunCarrier` (`chrome/browser/aux/installation_auth.cc`) returns before doing anything whenever the selected native route is active, which every startup of this candidate requires. Installation public keys, daemon challenge signing and the inbox key all go through the daemon's linked Aux authority, and the CLI's native module is env-gated off. So `provided-native.node` and `aux-native-carrier` were removed (seal `3b9f9b68`, receipt `combined-legacy-addon-removal-a1`). The executor gained an enumerated two-leaf removal list and reseals the CLI object with its approved command in the original order.

Observed afterwards: startup, Quit (daemon 2.4 to 2.9 s), and abort (daemon gone after 20.6 s) followed by relaunch. A clean Quit needs a daemon session exchange, so it also shows that daemon authorization works without the addon.

There are no `AsideNative` symbols left anywhere in the app. What remains is internal Keychain storage naming. `libaux-native-boundary.dylib` still accepts the original group constant, and the ported Swift authority keeps the supplied logical item names, stored as `aux.<scope>.aside.*`. Renaming those items is a Keychain data migration and needs owner approval. A third-party content-filter list also mentions `at.studio`; that is data, not branding.
