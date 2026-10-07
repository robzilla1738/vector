# Aux workspace

## Test + build gotcha

Unit tests import `@aux/runtime` through package exports into `apps/runtime/dist`, not source. After editing runtime source, rebuild before testing:

```bash
npx tsc -b
npm test
npm run typecheck
```

Renderer tests resolve `@aux/contracts` to source via the Vitest alias.

## Product direction

Read `docs/ROADMAP.md` and `docs/STATUS.md`. The Aux v3 owner decisions supersede the previous frozen inspection scope. Chromium is the only engine. Vertical layout and Ask first are defaults. The composer remembers Skip confirmation; Auto remains available in Settings. Built features are on, with Labs opt-outs; method capabilities still determine what the host implements. Honour site policy, protect secrets, and keep Stop, Take over, durable effects and undo. Browser UI must remain usable while the runtime is unavailable.

## Working rules

- Commit coherent slices to local main. Never push, run hosted Actions, enable Dependabot, sign, notarize or release as part of development.
- Delete replaced implementations; no compatibility shims or placeholder methods.
- Use disposable development Profiles. Ask before touching the owner’s real Profile.
- Use one native builder and one plain lock. Preserve existing live preview cleanup ownership until normal retirement when replacing the old launcher. Never force-clear an active lock or reset the stable Chromium checkout.
- After runtime edits rebuild dist before tests. Run `npm run check` per integrated slice; avoid repeating unchanged tests. Builds fail on compile errors; style, byte reports and coverage reports are advisory.
- For native changes, build incrementally, launch with `node scripts/dev.mjs --temp-profile` and inspect the changed behavior. After patch consolidation, add native changes as area patches in `chromium/patches/series`.
- At phase ends run `pnpm perf`; once Phase 4 starts, run the manual 20-task smoke. Do not claim phase completion without its specified evidence.
- Real providers with the owner’s configured keys are permitted. Never print credentials or commit Profiles, caches or personal-data logs.
- Docs describe current state in ROADMAP, STATUS and architecture; older handoffs are historical records.
