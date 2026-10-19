<coding_guidelines>
# Aux workspace

Aux is Aside's daemon, extensions, CLI, skills and helpers, rebranded to Aux (name, logo, icon only) and running on a Chromium build. It is local-only for now. Where Aux and Aside differ, Aside wins.

Read `README.md` and `docs/design/aside-contract.md` first. The earlier Aux runtime/shell implementation is retired. It is preserved in git tag `aux-v3-final` and under `docs/archive/`.

## Layout

- `vendor/aside/`: patches (`patches/*.mjs`), shims (`shims/*`), SEA tooling (`lib/sea.mjs`), entitlements. Source of truth for every deviation from Aside.
- `scripts/vendor-aside.mjs`: copies the installed Aside into `out/aside-staged/` and applies the patches. Every patch is anchored and count-checked, so it fails loudly when Aside updates.
- `scripts/aux.mjs`: launcher (daemon, CDP gate, Chromium).
- `scripts/aside-smoke.mjs`: daemon smoke test. `npm run check` runs vendor + smoke.
- `chromium/`: patches and gn flags for the Chromium checkout.
- `assets/brand/`: Aux logo, icon and iconset.

## Working rules

- Commit coherent slices to local main. Never push, run hosted Actions, sign, notarize or release as part of development.
- Keep the wire contracts Aside defines (`AsideDaemonSessionToken`, `aside.daemon.auth.` prefix, `Aside Daemon Auth v1\0`, health `service:"aside-daemon"`, `Aside.*` CDP methods). Rebrand only user-visible text.
- Never print or commit credentials. `.env` holds `AI_GATEWAY_API_KEY`.
- For AI testing use only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`. The daemon reads the key from `$ASIDE_HOME/u/<account>/credentials.json`, not from the environment.
- Use disposable profiles (`node scripts/aux.mjs --temp-profile`). Ask before touching the owner's real profile.
- Unsigned builds need `--use-mock-keychain`, or extension network requests stall behind the Keychain prompt. The launcher does this by default.
</coding_guidelines>
