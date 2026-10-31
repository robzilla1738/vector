# Docs

Start with [STATUS](STATUS.md) for the latest build and what was seen on it, then the [finish plan](ROADMAP-EXECUTION-GRAPH.md) for what's left. [AGENTS.md](../AGENTS.md) holds the working rules.

## Live

| Need | Document |
|---|---|
| Latest build, observed work | [STATUS.md](STATUS.md) |
| The plan to 1.0: decisions, nodes, order | [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md) |
| What Robert asked for, and its state | [plans/2026-10-30-owner-requests.md](plans/2026-10-30-owner-requests.md) |
| Product rules, identity targets, isolation | [design/aside-contract.md](design/aside-contract.md) |
| How the product fits together | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Building a release | [source/release.md](source/release.md) |
| Following Chromium stable | [source/chromium-updates.md](source/chromium-updates.md) |
| Supplied source pins and staging procedures | [source/](source/) |
| Daemon and CLI reuse notes | [reuse/](reuse/) |
| Hosted service setup and reviews | [cloud/](cloud/), [services/aux-cloud/docs](../services/aux-cloud/docs/) |
| CI | [scripts/ci/README.md](../scripts/ci/README.md) |

User docs aren't here. They're in the `aux-web` repository, in `lib/docs.tsx`, and serve at `getaux.co/docs`.

## Plans

The plans in [plans/](plans/) are dated records. The finish plan wins wherever they disagree, and each one says so at the top. Their requirements still apply where AGENTS.md and the contract repeat them.

- [Supplied implementation reuse](plans/2026-10-19-supplied-implementation-reuse.md) (2026-10-19)
- [Complete Aux identity](plans/2026-10-22-complete-aux-identity.md) (2026-10-22)
- [Provider-funded launch](plans/2026-10-23-provider-funded-launch.md) (2026-10-23)
- [Browser feature expansion](plans/2026-10-23-browser-feature-expansion.md) (2026-10-23): feature requirements R01–R30
- [Pre-release completion](plans/2026-10-27-pre-release-completion.md) (2026-10-27)
- [Excellence audit](plans/2026-10-27-excellence-audit.md) (2026-10-27): decisions D1–D12
- [Release readiness](plans/2026-10-28-release-readiness.md) (2026-10-28): release decisions and the first checklist
- [Owner plan](plans/2026-10-28-owner-plan.md) and [agent plan](plans/2026-10-28-agent-plan.md) (2026-10-28)
- [Agent model](plans/2026-10-28-agent-model.md) (2026-10-28): the agent's design. Individual chats replaced its one thread.
- [Browser excellence](plans/2026-10-29-browser-excellence.md) (2026-10-29): the review behind Spaces and Aux's own implementation
- [Feature polish](plans/2026-10-29-feature-polish.md) (2026-10-29), [Spaces and themes](plans/2026-10-29-spaces-and-themes.md) (2026-10-29), [Sidebar polish](plans/2026-10-29-sidebar-polish.md) (2026-10-29)
- Plan audits [1](plans/2026-10-30-plan-audit.md), [2](plans/2026-10-30-plan-audit-2.md) and [3](plans/2026-10-30-plan-audit-3.md) (2026-10-30), and the [review checklist](plans/2026-10-30-review-checklist.md) for build 139

## Evidence

`integration/proposed/` holds count-checked patches, pinned inputs and receipts that the build, the tests or the sealed candidate still read. `completion-20261026/` is the live one. Do not rewrite a receipt to match a later build; add a new one. Many receipts name `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` because that tree ran the command; builds now use the durable checkout.

`acceptance/` keeps the journals other files cite. `archive/status-history-through-2026-10-26.md` is the dated status log before the current STATUS. `spec/` holds behavior notes that Chromium patch comments still cite.

Everything removed in the 2026-10-27 cleanup is at tag `archive/pre-cleanup-2026-10-27`.
