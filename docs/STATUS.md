# Aux rebuild status

Updated 2026-10-19. The accepted clean-room plan replaces the former reference-vendoring architecture. Feature parity is not yet achieved.

## Phase 0

- Complete: clean-room `AGENTS.md`, spec-team/build-team boundary, naming policy and spec templates committed to local main.
- In progress: three spec agents working in isolated worktrees (`lane/sp1`, `lane/sp2`, `lane/sp3`) for daemon/agent/CLI, UI/Vault, and native APIs/browser behavior.
- Complete: fresh extension identities generated. Public keys are in `docs/design/extension-identities.json`; private keys are gitignored under `out/keys/`.
- Complete: indexed 36,339 reference files (25,515 distinct hashes) under gitignored `out/reference/`. The baseline scan reports 13 legacy native-patch findings, saved in `out/reference/cleanroom-baseline.txt`. Manual provenance audit remains required.
- Complete: serialized native command wrapper `scripts/native-build.py` uses an OS advisory lock at `/tmp/aux-build.lock`.
- Complete: historical test browser PID 62797 no longer exists; removed the remaining credential file found under disposable `/tmp/aux-run[0-9]*/u/` homes. No owner profile touched.
- Complete: pnpm TypeScript workspace and tooling installed; esbuild install script explicitly allowed. Independent development launcher authored from platform/core specs; runtime verification awaits daemon and extension builds.

## Implementation lanes

| Lane | State | Evidence / remaining work |
| --- | --- | --- |
| L1 daemon/contracts | Core/auth and agent specs integrated | Implementation pending fresh-agent spec review |
| L2 agent engine | Waiting for contracts and SP1 | Not implemented |
| L3 memory/context | Waiting for contracts and SP1 | Not implemented |
| L4 UI/core | Waiting for ready SP2 sections | Not implemented |
| L5 secondary UI | Waiting for UI system/SP2 | Not implemented |
| L6 vault | Waiting for contracts/SP1/SP2 | Not implemented |
| L7 CLI/skills/runtime | Waiting for contracts/SP1 | Not implemented |
| L8 helpers | Waiting for SP1/SP3 | Not implemented |
| N-A platform | Platform/core API specs integrated | Further native specs in progress |
| N-B native APIs | Platform/core API specs integrated | Further native specs in progress |
| N-C native UI | Waiting for SP3 | Existing Aux-owned native work is retained; new parity work pending |

## Existing native state

The Chromium checkout contains substantial staged, unstaged and untracked prior work. It must be preserved; no reset, blanket deletion or replacement is authorized. Existing patch series ends at 0085. The old component build and vendored runtime are legacy evidence only and do not prove clean-room acceptance.

## Acceptance outstanding

All plan gates remain outstanding: independently built daemon/CLI/extensions/helpers/runtime/memory, native API and lifecycle integration, self-contained non-component local app, removal of reference-derived shipped artifacts and names, visual evidence for every surface in both themes, functional checklist, 20 real tasks using the required contributor model, coexistence check, and fresh-agent provenance audit. Nothing has been pushed, released or developer-signed.
