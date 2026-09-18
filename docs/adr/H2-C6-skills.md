# ADR: Skills, siteKey, token budget (H2-C6)

Skills stay compiled from successful chunks (`apps/runtime/src/agent/skills.ts`).  
`siteKey` is the registrable origin plus a control-fingerprint of the observation ref set.  
`budget.tokens` is honoured by the planner prompt builder; snapshots at `budget:{tokens:3000}` are a published target in `docs/ROADMAP.md` §6.

Page text never grants permissions (H2-C4). Grants are `{effect, origin, scope, expiresAt}` on `ve-profile`.
