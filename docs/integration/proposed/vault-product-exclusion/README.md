# Excluded Vault product: static review proposal

Status: proposal only. No production imports, staging changes, executable/resource writes, signing, runtime requests, profile changes or credential access. This supersedes the narrower three-anchor skill-catalog proposal; do not apply both.

## Scope

The exact adapted 1852 daemon already sets desktop REPL `ui=null` (no `passwordManager` global), forces `useBuiltinPasswordManager:false`, and filters `password-manager` from session skill resolution. The remaining builtin definition still advertises Vault through catalog/general discovery, and the root router still exports its backend product API. This proposal closes those remaining entry points while leaving ordinary external-manager extensions/integration routes intact.

Five count-checked source edits in `proposal.mjs`:

1. Reject the exact builtin definition suffix `/builtin/password-manager/SKILL.md` in `parseSkillDefinition`, including existing account/project copies and Windows path separators. Other skill paths and external-manager skills are unchanged.
2. Exclude `builtin/password-manager` from the runtime skill catalog.
3. Exclude it from the Settings catalog.
4. Remove `passwordManager:passwordManagerRouter` from the root `asideRouter`. Actual TRPC and metadata-derived ordinary HTTP routes are both mounted from this root; this removes product auth/setup, vault, cipher, imports, attachments and other nested product endpoints. Requests should receive original router/not-found behavior, never fabricated success.
5. Label the retained builtin system skill Aux in the catalog, preserving its existing identity/path.

One separately pinned resource replacement: replace only `Contents/Resources/static/skills/builtin/password-manager/SKILL.md` with `disabledSeed` exported by `proposal.mjs`. It is an inert, disabled builtin tombstone with no Vault instructions, autoinjection keywords or setup guidance. Its exact before/after SHA-256 values are in `metadata.json`. This avoids deleting any account data and prevents seeding an enabled product skill in new accounts. On a future approved launch, the supplied bootstrap will synchronize this managed seed to its ordinary private account copies. The proposal does not run that migration or inspect any copies.

The parser exclusion remains necessary for stale copies and project discovery. Disabling one account through `projects.setSkillEnabled` would survive same-seed restarts, but would not cover new accounts or seed updates and is not the proposed product fix.

## Preserved boundaries

Installation authentication (`/auth/daemon/*`, native signed challenges, installation key material), account identity, secure AI-provider credential APIs, models/settings, original wire names/crypto labels, and `externalPasswordManagers` remain intact. Password-manager product authentication is removed with its product router; it is distinct from daemon installation authentication. Nothing deletes, migrates, unlocks or reads stored owner credentials.

Dormant password-manager implementation code remains embedded for this surgical exclusion; this is not a whole-program dead-code elimination proposal. Existing unrelated internal callers/background code are not claimed removed. No replacement password backend or fake state is introduced. This proposal does not authorize signing or prove third-party vendor compatibility.

## Static evidence and execution boundary

`inspect.mjs` extracts the SEA **in memory**, requires the exact adapted source hash, applies every anchor once, parses the result as an ES module without linking/evaluating it, and compares selected preserved source anchors. It reads the archived, known 585 bundle, not a live owner profile. The result is recorded in `metadata.json`.

The first syntax-check attempt used CommonJS `vm.Script` and correctly rejected the supplied ES-module imports. The corrected check uses `SourceTextModule` and passes; no daemon code was executed in either attempt.

Reproduce the single bounded static inspection:

```sh
node --experimental-vm-modules docs/integration/proposed/vault-product-exclusion/inspect.mjs /absolute/path/to/archived/Aux\ Daemon.app
```

Before any future integration, verify the before hash of both the SEA source and seed, materialize the proposed code/resource through the integrator's existing staging path, record new inventory and signing review, and obtain the applicable signing authorization. The current signed daemon cannot retain its existing valid signature after these changes. No executable injection utility is supplied here.

After authorized integration, one focused disposable launch should establish absent password-manager catalog/REPL, rejection of representative root product API and metadata HTTP endpoints, and continued real installation authentication plus model/provider settings availability. Do not repeat paid AI acceptance or broad browser/UI suites for this change.
