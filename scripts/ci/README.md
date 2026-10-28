# CI on this Mac (Tartelet)

CI runs GitHub Actions jobs for `robzilla1738/vector` on ephemeral macOS VMs on the owner's Mac. [Tartelet](https://github.com/shapehq/tartelet) clones the `aux-ci` Tart VM for each job, registers it as a self-hosted runner, and deletes it when the job ends. Native builds, reseals, signing and notarization stay on the host: they need the durable Chromium checkout, `out/` and the Keychain, none of which belong in a CI VM.

The GitHub App and repository settings are the owner's part: [owner plan, item 6](../../docs/plans/2026-10-28-owner-plan.md#6-tartelet-ci-github-app-and-repo-settings).

## The runner image

`scripts/ci/build-runner-image.sh` builds `aux-ci` from `ghcr.io/cirruslabs/macos-tahoe-xcode:27`:

- Node 22 (default on `PATH`) beside the image's Node 24, which `services/aux-cloud` needs.
- pnpm 11.27.1 through corepack, for both Node versions.
- Python 3 (from the image) and gitleaks.
- A pnpm store pre-warmed from the committed lockfiles. Nothing secret: no tokens, Keychain items or `out/` inputs.

To rebuild after a lockfile or toolchain change, stop Tartelet, then run `tart delete aux-ci` and `scripts/ci/build-runner-image.sh`. Tart clones are copy-on-write, so the image costs little disk.

In Tartelet's settings:

- **Virtual Machine:** `aux-ci`.
- **SSH:** user `admin`, password `admin` (the Cirrus Labs image defaults; the VM is only reachable from this Mac).
- **GitHub:** the App from owner item 6, runner scope Repository, `robzilla1738/vector`.

## Workflow

`.github/workflows/ci.yml` runs on `push` to `main` and on manual dispatch, never on pull requests: the repository is public, and a pull-request trigger would let anyone run code on this Mac. It has read-only `contents` permission, pins `actions/checkout` to a commit SHA, and cancels a superseded run on the same ref. Jobs:

1. **Hermetic tests:** `pnpm install --frozen-lockfile && pnpm test:ci` on Node 22.
2. **aux-cloud:** `pnpm test`, `pnpm typecheck` and `pnpm build` on Node 24, with fixture environment values from `src/operations.test.ts`. No real secrets.
3. **gitleaks:** scans the pushed commit range (the head commit on manual runs) with `.gitleaks.toml` and `.gitleaksignore`.

## Hermetic and host-only tests

`pnpm test` on the host stays the full suite. `pnpm test:ci` runs the same Node test files minus those listed in `scripts/ci/host-only-tests.txt`, then the same Python tests. The listed files read inputs that exist only on the owner's Mac: the ignored `out/` folder (the frozen snapshot `out/provided-source-snapshot-1.26.1016.1852`, candidate apps, live inputs), the supplied files under `~/Downloads/aside-rea 2`, or the Chromium checkout. Without them they fail or skip.

A new test file runs in CI by default. If it needs one of those inputs, add it to `host-only-tests.txt`; `hermetic-tests.mjs` fails on an entry that no longer exists.

## Secret scanning

`.gitleaks.toml` extends gitleaks' default rules and allowlists known non-secrets by the shape of the finding: hex digests keyed by file names or digest-named fields, the public client keys inside supplied Aside code (YouTube INNERTUBE, Embedly, PostHog), extension manifest public keys, aux-cloud test fixtures and a few prose matches. It does not allowlist paths, because gitleaks 8.30 then skips the whole path. `.gitleaksignore` fingerprints the few remaining reviewed findings. To check the tree locally: `git archive HEAD | tar -x -C <empty dir>`, then `gitleaks dir . --config <repo>/.gitleaks.toml` from that directory with `.gitleaksignore` copied in.
