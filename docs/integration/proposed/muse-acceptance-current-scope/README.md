# Concrete 20-task Muse acceptance preparation

Preparation only. Both offline checks passed against pinned source: `node scripts/e2e.mjs --check --cli-source out/provided-source-audit/cli-original.mjs` and `node scripts/e2e/check.mjs out/provided-source-audit/cli-original.mjs out/provided-source-audit/daemon-original.mjs`. No supplied module, daemon connection, provider request, credential or profile data was accessed. Current source contracts match; no harness runtime correction is justified from this audit.

## Use the existing approved installation, a new native profile and a fresh account

The reviewed scope is `/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj`, read from the checked-in development-signing proposal, not inferred from owner state. Preserve that canonical AUX_HOME and installation identity. The currently packaged development application is `out/provided-candidate-local-browser-pass/Aux.app`; the integrator must use the latest verified launch handoff, not a historical v560 file after later packaging. Do not create a new AUX_HOME or regenerate the authority to satisfy freshness.

1. Create/open a NEW ordinary Chromium profile under the already approved disposable user-data directory using the actual browser profile manager/launch integration. Keep the existing preview profile untouched. A new account alone cannot satisfy browser binding.
2. Obtain that new profile's actual `chrome.auxAccount.getProfileContext()` from its trusted supplied page. The native API emits actual profileId/profilePath/profileIndex. Do not fabricate a UUID, path, index, cloud userId or cloud sign-in state.
3. The legitimate daemon mutation is `accounts.ensureProfileAccount(actualProfileContext)`. The supplied normal route also invokes this itself. Its original implementation resolves existing matching bindings first; with a genuinely new local profile it mints an anonymous/local active account and persists the real profile binding, then bootstraps it. `accounts.summary` returns account rows with per-account profileBindings. Capture the returned real account id for `--account uN`.
4. Do NOT use cloud-oriented `accounts.bindProfile` (requires userId), direct registry editing, account update to change identity, or the existing preview account. `accounts.add({name,provider:'anonymous',mode:'local'})` is a real API, but does not itself establish an ordinary native profile connection and is not needed for this flow.
5. Require zero sessions (including archived/ephemeral/children) and zero provider credentials in the fresh account. `cli.resolveBrowserBinding({accountId,profileId})` must resolve a live default/ordinary window through the genuine Agent bridge; a registry row alone cannot pass. Local memory model/index must be available before provider credentials are installed.

## Authentication and launch environment

Root must obtain a short-lived daemon token through the existing approved installation challenge/signature boundary and inject it privately as DAEMON_AUTH_JWT. Obtain the specifically authorized gateway key separately and inject it as AUX_E2E_GATEWAY_KEY; neither belongs in command arguments, task text, shell history, logs or a committed file. The harness deletes the key from its own environment before running child tasks. No owner credentials or .env lookup is part of this preparation.

The supplied createDaemonClient explicitly uses DAEMON_AUTH_JWT for HTTP/WebSocket auth when present. That keeps the extracted CLI helper running under ordinary Node from trying to locate a native carrier relative to Node's executable path. Do not change process.execPath, add an arbitrary addon override, or use diagnostic/load-only mode. The daemon itself must already be the genuine verified reused stack with the fixed native authority and runtime.

With the two secrets ALREADY supplied by a private parent process, run from the repository root (replace only the actual fresh profile/account identifiers):

```sh
HOME=/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj \
AUX_HOME=/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj \
TMPDIR=/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T \
DAEMON_BASE_URL=http://127.0.0.1:21520 AUX_CLI_UPDATE_CHECK=0 \
node scripts/e2e.mjs --cli-source out/provided-source-audit/cli-original.mjs \
  --account uN --profile ACTUAL_FRESH_PROFILE_ID
```

Unset AUX_PROVIDED_NATIVE_LOAD_ONLY. Preserve required app/daemon launch settings in their actual launcher, not by sourcing arbitrary global environment. TMPDIR above is deliberately the SYSTEM TEMP PARENT: setting TMPDIR to AUX_HOME makes the harness's existing realpath-based disposable-home guard reject the run because home equals tmpdir. No guard is weakened.

## Required acceptance and cleanup

Run all20 cases for full acceptance. A bounded `--limit` diagnosis is explicitly partial; a failed run leaves sessions, so a retry requires another genuinely fresh account/profile, not deleting evidence to pretend freshness. Only vercel-ai-gateway/meta/muse-spark-1.3-contributor is permitted in routing, parent/child sessions and compaction. Retain all attachment, memory, browser effect, subagent, plan and automatic-compaction assertions. The64000-token compaction threshold can consume substantially more inference than a short chat; do not replace it with manual compaction.

The runner removes/verifies the test credential through models.removeCredential/getCredentialStatus, restores settings, aborts unfinished sessions and writes private report/events. No success is accepted with cleanup errors. IMPORTANT for this SAME-HOME plan: the old harness error text says “destroy the disposable home.” Do not follow that literally here—the approved home also contains the ongoing preview and installation authority. Stop acceptance, keep it incomplete, and use the real credential API to resolve the exact fresh account; isolate/retire only the freshly created profile/account after review. Never delete the shared approved home or guess a Keychain file. Do not automatically call auth.deleteAccount for cleanup: its side effects must be reviewed before any destructive step.

The harness currently reads the disposable accounts.json to compare actual account incarnation and binding. This is an existing freshness guard, not permission to inspect its contents manually; account registry can contain auth data. Before execution root must confirm this scoped read is acceptable for the existing shared disposable home or arrange equivalent reviewed evidence without weakening that guard. This preparation did not open the registry.

Current readiness remains preparation-only: no new native profile/account created, no token/key obtained, no module/native helper executed and no AI call sent.
