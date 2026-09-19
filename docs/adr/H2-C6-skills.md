# ADR: Skills, siteKey, token budget (H2-C6)

Skills stay compiled from successful chunks (`apps/runtime/src/agent/skills.ts`).

`siteKey(url, obs)` is `${registrableOrigin(url)}#${controlFingerprint(obs)}`.  
`controlFingerprint` is the first 16 hex of sha256 over sorted `role|tag:name:ref` plus `field:type:name:ref`.  
`tryReuseSkill` refuses reuse when the compiled skill carries a `siteKey` that does not match the current origin+fingerprint.

`ProgramBudgetSchema.tokens` is optional.  
`applyTokenBudget(text, tokens)` caps at `tokens * 4` characters.  
`buildPlannerPrompt({budget})` defaults to 3000 and applies that cap to each rendered observation.  
Coordinator and member-agent pass `{tokens: 3000}`. Snapshots at `budget:{tokens:3000}` are a published target in `docs/ROADMAP.md` §6.

Page text never grants permissions (H2-C4). Grants are `{effect, origin, scope, expiresAt}` on `ve-profile`.
