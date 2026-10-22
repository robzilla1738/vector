# Private daemon identities and request metadata

Inactive, source-only successor slice. The helper has no filesystem state writes,
network requests, credentials, native operations or UI changes. It does not claim
complete Aux identity or a runtime-accepted build. Original source evidence stays
truthful. `inputs.json` pins daemon1852 SEA source and all17 rules/49 occurrences.

Integration: call `applyAuxPrivateDaemonIdentity({component:'daemon',
path:'entry.mjs',text,original})` after the existing protocol/provider/runtime and
automation transforms. Retain returned `anchors` in the transformation receipt.
The exact original hash and incoming composed counts are both required. Wrong
source, missing occurrences, a mixed generation or a second application fail.
No adapters, package manifests or accepted app were changed by this slice.

## Reviewed declaration and consumer pairs

| Private name | Occurrences | Actual roles |
| --- | ---: | --- |
| `asideProvider` | 3 | ModelsManager property, lazy cached initialization, return |
| `asideModelIdsSave` | 3 | Promise queue initialization, chained update, caught queue continuation |
| `asideRouter` | 7 | Export key/getter, declaration, assignment, remote destructure, Hono `/trpc/*` router and HTTP route mount |
| `asideImageContentSchema` | 3 | Declaration, strict image schema, response image array |
| `asideImageGenerationRequestSchema` | 3 | Declaration, schema definition, `/ai/images/generations` request validation |
| `asideImageGenerationResponseSchema` | 3 | Declaration, strict response schema, generation response validator |
| `asideImageModelCatalogItemSchema` | 4 | Declaration, definition, response and cache arrays |
| `asideModelCatalogCacheSchema` | 4 | Declaration, definition, loaded-cache safeParse, catalogStore schema |
| `asideModelCatalogItemSchema` | 4 | Declaration, definition, response and cache arrays |
| `asideModelCatalogPolicy` | 3 | Declaration, compare/filter definition, provider policy map value |
| `asideModelCatalogResponseSchema` | 3 | Declaration, definition, fetched response parse |
| `asideNotificationPermissionValues` | 3 | Declaration, four-value assignment, RPC input enum |
| `asideResolveModel` | 1 | Private timing log property, no stored model identity |

Only these exact binding names change to the corresponding `aux*` names. Schema
fields, strictness, model policy/filter functions, cache paths, enum values,
procedure names and queue semantics remain unchanged. The router export and
destructure change together; the public `/trpc` mount remains the same.

## Cosmetic outgoing producers

* `OPENROUTER_APP_HEADERS`: one HTTP-Referer value becomes `https://getaux.co`.
  The separate existing title branding transform still owns its title.
* Two usage-fetch headers become `User-Agent: aux`: generic usage fetch and
  OpenAI Codex usage fetch. Authorization/account headers, URLs, timeout and
  the generic fetch's later custom-header override remain unchanged.
* `withOpenCodeSessionHeaders`: one `x-opencode-client` value becomes `aux`.
  The actual `x-opencode-session` value and later custom-header overrides stay
  intact; the provider allowlist remains opencode/opencode-go.
* Bot `new Chat` constructor: the single `ti.botName ?? 'aside'` fallback becomes
  `aux`. An explicitly configured bot name still wins. The Chat constructor
  stores this as its userName; platform adapter identity and account IDs do not
  change. No message is sent by verification.

These values are produced for external services/adapters; local code does not
parse them as authentication or persisted identities. No OAuth originator,
OAuth client ID or callback URI changes belong to this slice.

## Verification and exclusions

`node --experimental-vm-modules --test
vendor/provided/aux-private-daemon-identity.test.mjs`: three focused tests pass.
Actual original and local/cloud composed full modules parse. Reversing only the
recorded anchors reproduces each incoming module byte-for-byte, proving all
other code remains unchanged. Actual router export/caller snippets execute in
an isolated VM; unknown routes still reject. Extracted strict image schemas
produce the same shape. Actual OpenCode header function and bot constructor
snippets preserve session/custom-name behavior without a daemon/provider run.

Excluded: serialized `asideUserId`, experimental `asideCode`, feedback
`asideComponentVersion`, worker IDs, catalog persisted keys, memory/context
records, cryptographic purposes/installation keys, native ABI, OAuth identity,
HTML `aside`, source metadata and legal notices. Other coordinated slices may
own these; this helper neither migrates nor claims to remove them.
