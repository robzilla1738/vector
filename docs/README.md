# Docs

Start with [STATUS](STATUS.md): the candidate, what was observed on it, and what to do next. It is the only live description of the build. [AGENTS.md](../AGENTS.md) holds the working rules.

## Live

| Need | Document |
|---|---|
| Candidate, observed work, open items | [STATUS.md](STATUS.md) |
| Everything left before release | [plans/2026-10-28-release-readiness.md](plans/2026-10-28-release-readiness.md) |
| UI requests and their state | [plans/2026-10-28-ui-review-checklist.md](plans/2026-10-28-ui-review-checklist.md) |
| The agent (Aux) design | [plans/2026-10-28-agent-model.md](plans/2026-10-28-agent-model.md) |
| Milestones and external gates | [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md) |
| Product rules, identity targets, isolation | [design/aside-contract.md](design/aside-contract.md) |
| How the shipping product fits together | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Supplied source pins and staging procedures | [source/](source/) |
| Daemon and CLI reuse notes | [reuse/](reuse/) |
| Hosted service setup and reviews | [cloud/](cloud/) |

## Plans

The plans in [plans/](plans/) are dated decisions. Their requirements still apply where AGENTS.md and the contract repeat them; their status and evidence sections describe the day they were written.

- [Supplied implementation reuse](plans/2026-10-19-supplied-implementation-reuse.md) (2026-10-19)
- [Complete Aux identity](plans/2026-10-22-complete-aux-identity.md) (2026-10-22)
- [Provider-funded launch](plans/2026-10-23-provider-funded-launch.md) (2026-10-23)
- [Browser feature expansion](plans/2026-10-23-browser-feature-expansion.md) (2026-10-23): feature requirements R01–R30
- [Pre-release completion](plans/2026-10-27-pre-release-completion.md) (2026-10-27): the six-batch plan the owner approved
- [Excellence audit](plans/2026-10-27-excellence-audit.md) (2026-10-27): whole-product review and decisions D1–D12
- [Release readiness](plans/2026-10-28-release-readiness.md) (2026-10-28): the full checklist from the current seal to a public release
- [Owner plan](plans/2026-10-28-owner-plan.md) and [agent plan](plans/2026-10-28-agent-plan.md) (2026-10-28): the detailed steps for each side
- [Agent model](plans/2026-10-28-agent-model.md) (2026-10-28): one personal agent per profile, its design and history
- [Feature polish](plans/2026-10-29-feature-polish.md) (2026-10-29): every existing feature used and fixed, builds 57–63

## Evidence

`integration/proposed/` holds count-checked patches, pinned inputs and receipts that the build, the tests or the current candidate still read. `completion-20261026/` is the live one. Do not rewrite a receipt to match a later build; add a new one. Many receipts name `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` because that tree ran the command; builds now use the durable checkout.

`acceptance/` keeps the journals other files cite. `archive/status-history-through-2026-10-26.md` is the dated status log before the current STATUS. `spec/` holds the retired clean-room behavior notes that Chromium patch comments still cite.

Everything removed in the 2026-10-27 cleanup (760 unreferenced receipt folders, older archive eras, uncited acceptance journals) is at tag `archive/pre-cleanup-2026-10-27`.
