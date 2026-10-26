# Cloud transfer account binding — A51 successor

Baseline: `dd18033d4`. The accepted A38 app is unchanged. This implementation uses the clean-code skill and preserves the existing UI, source structure, provider shim, native ownership, installation authentication and cryptographic/storage formats.

The actual A51 attachment uploader fetched intent, upload URL and commit using the current numeric account after each await. A replaced registry record could therefore authorize a later step with a replacement account. Large-session sharing did not retain an account fence, and the generic authenticated request wrapper could acquire replacement credentials while awaiting its initial/forced token refresh. Existing attachment identity checks ran after these side effects.

The corrected upload retains the original registry incarnation/user binding through intent, signed upload, commit and result delivery. Metadata fetched for one account cannot begin content recovery after replacement. Large shares and encrypted-session snapshots retain the same binding. The authenticated wrapper checks the binding after token lookup, before retry and before returning a result. Same-account refresh remains supported. Signed PUTs still omit account credentials and reject redirects; original size/integrity and safe local writer checks remain.

No persisted identity, encryption domain, key, token schema, cloud schema, migration, UI or native permission is changed. Existing server-owned unfinished intents remain governed by the existing lifecycle/expiry; this change does not delete remote data after an uncertain outcome.

## Integration

`transform.mjs` exports `upgradeCloudTransfers(input)` for the exact two A51 source inputs pinned in `pins.json`. It replays eight attachment/session edits and the one authenticated-wrapper edit with count-one checks, then verifies the full output hash. Apply to **both** `index.mjs` and `aux-native-entry.mjs`; keep the existing A34 ChatGPT shim and current native lifetime pairing. Root owns cumulative producer/packaging manifests and any native build/package/signing decision. Do not copy this source over the accepted app.

The retained source output directory is recorded in `source-check.json`; both complete leaves parse. The generator changes in `vendor/provided/cloud-{attachment,session}-adapter.mjs` preserve future composition, and `vendor/provided/cloud-desktop-composition.mjs` now applies `bindCloudRequestAccount` as the final counted daemon pass for future enabled-cloud composition.

## Focused evidence

`node --test vendor/provided/cloud-attachment-adapter.test.mjs vendor/provided/cloud-session-adapter.test.mjs vendor/provided/cloud-transfer-binding.test.mjs vendor/provided/cloud-desktop-composition.test.mjs` passed 20 cases (including complete 30-anchor composition): actual supplied attachment writing; size/hash/path/symlink safety; incognito/ephemeral exclusions; credential-free signed sharing; account replacement after each of four upload boundaries; replacement between metadata and content; genuine JSONL/turn restore and local authority; SQLite rollback; interrupted restore; active work/conflict/deletion protection; initial-token/forced-refresh/response races; and same-account refresh. One existing repeat-transform assertion expected only “anchor changed” although the earlier supplied export gate returns “export changed”; its expectation now accepts either genuine refusal.

No provider request, owner credential access, app operation, production request, cloud mutation, native-tree mutation, signing or release occurred. This source/fixture evidence does not close J2/J3/J5.

## Account and operation gates

Real BYOK still needs a protected account-scoped key entry, the approved `vercel-ai-gateway/meta/muse-spark-1.3-contributor` request, context/Tidy/attachment/cancel/restart/disconnect observation and disposable credential removal. No key belongs in chat, screenshots or a test receipt.

ChatGPT still needs direct owner consent on Aux's actual registration flow, eligible plan capability, useful inference, refresh/cancel/restart/disconnect and separate profile isolation. The official documentation was fetched on October 26, 2026 with the OpenAI Docs skill: [plan-usage overview](https://developers.openai.com/siwc/token-sharing-open-source) describes open-source/locally hosted applications and directs paid/remotely hosted applications to an interest process. [registration](https://developers.openai.com/siwc/token-sharing-open-source/sign-in) documents `dynamic_agent_client` for first registration, a stable host ID and retaining the issued account/workspace client ID. This supports the existing Aux-specific registration implementation; it does not prove Aux's public eligibility or an actual account grant. Owner distribution/hosting terms must be matched to this documented scope before a public claim.

Cloud/operations preparation already exists in `docs/integration/proposed/final-completion/cloud/{readiness,operations}.md` and `services/aux-cloud/ops/backup-runner/`. It remains inactive: current-source deployment/schema/domain/webhook review, a disposable sign-in/sync/share/delete journey, approved dedicated runner access, privately confirmed R2 expiry, independent key retrieval, real recipient/alerts, one scheduled encrypted backup and isolated restore are still necessary. No speculative extra service, migration or framework is needed for this source correction. The reviewed November 22 expiry is historical metadata and has not been verified against the provider.
