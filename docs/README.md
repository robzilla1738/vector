# Docs

Read these first: the root [README](../README.md), [AGENTS.md](../AGENTS.md), the [supplied contract](design/aside-contract.md), the [reuse plan](plans/2026-10-19-supplied-implementation-reuse.md), [STATUS](STATUS.md), and the [execution graph](ROADMAP-EXECUTION-GRAPH.md).

STATUS is the only live description of the candidate, what was observed on it, and what to do next. The execution graph is the checklist. Evidence files are not.

## Live

| Need | Document |
|---|---|
| Candidate, checkout, observed work, resume list | [STATUS](STATUS.md) |
| Milestones and external gates | [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md) |
| Product rules, Vault exclusion, isolation | [design/aside-contract.md](design/aside-contract.md) |
| Reuse the supplied implementation | [plans/2026-10-19-supplied-implementation-reuse.md](plans/2026-10-19-supplied-implementation-reuse.md) |
| Launch without Aux payments | [plans/2026-10-23-provider-funded-launch.md](plans/2026-10-23-provider-funded-launch.md) |
| Feature requirements | [plans/2026-10-23-browser-feature-expansion.md](plans/2026-10-23-browser-feature-expansion.md). Its artifact table is the 2026-10-23 baseline. |
| Identity direction | [plans/2026-10-22-complete-aux-identity.md](plans/2026-10-22-complete-aux-identity.md). Its evidence section is the 2026-10-22 successor chain. |
| How the shipping product is put together | [ARCHITECTURE.md](ARCHITECTURE.md), current-product section |

The native checkout for builds is `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`. `scripts/aux_chromium.py` returns that path unless `AUX_CHROMIUM_SRC` is set. `scripts/native-build.py` only holds `/tmp/aux-build.lock`.

Resume from the Open list in STATUS. The Phase 1 link, the Aux logos, and the split-metrics repair are already in the current seal.

## Historical

These stay in the tree because they record what was true when they were written. Do not rewrite them to match a later candidate, and do not treat them as the current product.

- [archive/](archive/) including the status history through 2026-10-26.
- [spec/](spec/). Clean-room behavior notes. The 2026-10-19 reuse direction replaced that build method.
- [ARCHITECTURE.md](ARCHITECTURE.md) after the current-product section. The retired independent implementation, including its Vault-gated startup.
- [plans/2026-10-20-pass1-ui-completion.md](plans/2026-10-20-pass1-ui-completion.md) and [plans/remaining-readiness-2026-10-21.md](plans/remaining-readiness-2026-10-21.md).
- [integration/proposed/final-completion/baseline-20261026.md](integration/proposed/final-completion/baseline-20261026.md). Dispatch baseline, not the live seal.
- [integration/proposed/completion-20261026/PAUSE-HANDOFF.md](integration/proposed/completion-20261026/PAUSE-HANDOFF.md). The October 26 startup failure.
- Receipts, prepare scripts, and READMEs under `integration/proposed/`. Many name `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` because that is the tree the command used. Builds use the durable checkout.
- `docs/acceptance/` build journals, and status paragraphs inside `docs/source/` that name a v-number build.

`docs/source/` and `docs/reuse/` are staging and adapter procedures. Their embedded "current build" sentences are historical when they name a specific v-number or an older app path. Live acceptance is STATUS.
