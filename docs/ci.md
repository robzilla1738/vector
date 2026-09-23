# Continuous integration

Aux lives in `robzilla1738/vector`. The workflow is
[`.github/workflows/runtime.yml`](../.github/workflows/runtime.yml), named `runtime`.
It runs for pushes to `main`, pull requests, manual dispatch, and merge groups.

## Gates

| Job | Purpose |
| --- | --- |
| Typecheck + unit (Linux and macOS) | Lint ratchet, TypeScript, task manifest, renderer build, bundle budgets, unit tests |
| Integration (Linux) | Real headless Chromium against local fixtures; browser performance budgets |
| Electron e2e (macOS) | Native shell journeys and content security policy |
| Desktop smoke (macOS) | Unsigned packaging, recovery, unsaved work, conversation persistence/context, private boundaries, authentication and scoped development |
| Desktop design (macOS) | Eleven glass/input/sidebar/tab/chat/work/settings/contrast/motion regressions |
| CI passed | Always runs; succeeds only when every preceding job succeeds |

The aggregate fails on failed, canceled or skipped dependencies. Keep its name
stable for branch protection; add every new required job to its `needs` list.
No source-path filters can silently bypass a gate. Merge-group support does not
itself enable a merge queue.

## Reliability and diagnostics

- Integration files **must run serially**: they own the same fixture ports
  (4810–4812). `pnpm test:integration` passes `--no-file-parallelism` at the
  Vitest invocation level. The per-project setting alone did not prevent
  concurrent fixture owners in earlier CI runs.
- Native smoke files run serially inside a dedicated job. The design suite is
  `pnpm smoke:design`; it is separate from `pnpm smoke:release` to keep feedback
  readable and avoid overlapping native input inside one runner.
- Each smoke uses disposable profiles and synthetic data. Do not point tests at
  personal profiles. The grouped runner terminates leftover Aux processes;
  use individual smoke commands when preserving an open local Aux instance.
- Tests using vertical sidebar selectors explicitly configure vertical layout
  and expand the sidebar. Horizontal layout remains the product default, and
  design tests cover both layouts plus collapsed behavior.
- Packaging already builds the workspace and renderer. Do not concurrently
  rebuild runtime output while integration/native tests import it.
- Benchmark reports and design screenshots are retained for 14 days. Failed
  e2e/release jobs retain their available test artifacts for the same period.
  Workflow logs retain command output. Hosted design screenshots capture the
renderer; full compositor captures require local Screen Recording permission.
Native input, window bounds and blur assertions still run in CI. Teardown is
bounded so an Electron shutdown stall cannot hold a successful fixture open. Artifact absence can mean failure occurred
  before a screenshot/report was written.
- Timeouts bound every job and each smoke. New commits cancel obsolete runs for
  the same ref/PR. A canceled run is not a successful release gate.

## Workflow maintenance

Actions are pinned to full commit SHAs with release comments. Dependabot opens a
weekly grouped GitHub Actions update; review it through the same CI gates.
`GITHUB_TOKEN` is explicitly read-only (`contents: read`); checkout does not
persist credentials. Tests load no local `.env`, require no provider credentials,
and run untrusted PR code only in hosted disposable runners. No
`pull_request_target` or release-publishing credentials are used.

pnpm 11.27.1 replaces the rejected 11.12.0 release (the maintained installer
reports that release’s standalone binary as broken). The frozen dependency
lockfile remains the source of dependency versions.

Node 22 matches the project's supported runtime; pnpm comes from the exact
`packageManager` field and installation uses the frozen lockfile. Action-runtime
Node versions are separate from the Node version used to build Aux. Electron
caches include OS, architecture and lockfile; Playwright caches include OS and
lockfile. Native desktop qualification currently covers macOS ARM64; Linux
coverage is runtime/unit, not a claim of Linux desktop or Windows qualification.
Unsigned package checks do not prove signing, notarization or update delivery.

## Main-branch policy

`main` requires the `CI passed` check from the GitHub Actions app, with the branch
up to date before merging. Force pushes and branch deletion are disabled, and
review conversations must be resolved. Administrator enforcement stays off so
the owner retains the explicit direct-to-main workflow used in this project.
This is an intentional owner bypass, not a guarantee that every owner push is
pre-validated. Prefer a branch/PR when you want checks to block integration.
No second person's approval is required for this solo-development workflow.
Merged branches are deleted automatically. Repository Actions policy requires
full SHA pins; the default token stays read-only and cannot approve PRs.

## Review and rerun via CLI

```sh
gh auth switch --user robzilla1738
gh run list -R robzilla1738/vector --workflow runtime.yml --limit 10
gh run view RUN_ID -R robzilla1738/vector --log-failed
gh run rerun RUN_ID -R robzilla1738/vector --failed
gh workflow run runtime.yml -R robzilla1738/vector --ref main
```

Run `actionlint .github/workflows/runtime.yml` when changing workflow syntax.
For product changes, run relevant local checks before pushing, then check the
**exact commit's** hosted run. A previous green commit or a local test result is
not evidence that the current commit passed hosted CI.

## September 23 audit

The initial audit found no branch protection/rulesets, no design-regression job,
mutable action tags, and stale vertical-layout assumptions in native tests.
Earlier integration failures contained fixture-port collisions. An earlier UI
cleanup also removed previous-turn context controls; the retained release test
correctly caught this missing functionality. Restore the control rather than
removing its persistence assertions. Blank-sidebar window dragging must exclude
`summary` and `label` controls as well as buttons/inputs, or the More menu cannot
open normally.

See [HANDOFF](HANDOFF.md) for the audit checkpoint and verification limits. Always use the
latest exact commit’s Actions result when deciding whether to merge or ship.
