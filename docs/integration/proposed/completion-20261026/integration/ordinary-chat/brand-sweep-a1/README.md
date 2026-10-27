# Brand sweep: At Your Side / Aside leftovers

Applied to the signed candidate by one bounded repair (`integrator/brand-sweep-a1`). `prepare.py <app> <out>` applies `rules.json` (count-checked) to the pinned leaves; the pre-sweep signed clone is `out/provided-candidate-completion-20261026-a1/combined-brand-sweep-a1/before-repair.app`.

Changed:
- **Settings → General footer**: "Copyright © 2026 Courson Digital LLC. All rights reserved." Seven embedded resource comments in the framework binary now read `Copyright Courson Digital LLC` (same byte length; framework re-signed).
- **Daemon** (`index.mjs`, `aux-native-entry.mjs`): Windows computer-use publisher, package identity and app matcher use Courson Digital / AuxComputerUse; billing lookup keys match the Aux cloud enum (`aux_*`); signed-in account owner kind is `aux` (schema and all 34 checks, plus the extension password page); default CLI title `aux cli`; bundled region name `aux-world.ts`. Pre-Aux aliases removed: `asideCode` experimental setting, `aside:` password-manager memory marker.
- **Extension**: aliases removed for `ASIDE_API_TIMEOUT`, `__ASIDE_LASSO_ERROR__`, `asideAuthCallback` (the callback now requires the Aux marker) and `ASIDE RECOVERY KEY` blocks; the network-error matcher uses the daemon's Aux wording. The browser icon map keyed the Aux icon as `aside` while the import progress page asks for `aux`, so the icon never rendered; fixed. Version 1.26.1016.1888.
- **Skills**: onboarding CTA blocks use `aux-cta-v2` (the only fence the renderer handles) and no longer offer Vault/password settings (that route redirects away); Notion skill no longer cites an `@aside/notion` package.

Retained, documented in `docs/STATUS.md`:
- HTML `aside` element handling and third-party text ("aside from").
- Historical provenance: `bundle.json` source paths, `runtime-source-pins.json` (supplied runtime 1.26.1019.335 inventory).
- The pinned agent runtime: hash-verified by the native seeder before use, so its `prepare-python.py` message and the build path inside its `.pyc` files cannot change without new pins and a daemon rebuild.
- Native code needing a source rebuild: framework `aside://` legacy scheme alias (the extension uses only `aux://`), `aside.*` → `aux.*` storage migration keys, `aside_profile_indicator_icon` Local State key; CLI `provided-native.node` and native boundary/carrier symbols (`AsideNativeSwift`, `AsideNativeRun`) and the `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` keychain group. Keychain and persisted keys need a versioned migration, not a rename.
