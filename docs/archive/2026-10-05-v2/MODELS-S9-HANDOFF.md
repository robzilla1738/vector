# S9 Models: provider lifecycle and explicit image choice

Source batch, 2026-09-29, base integration `516bac37`. **New native acceptance remains open.** See [all seventeen section gates](SETTINGS-S9-COVERAGE.md). No App/main/native changes, no native build, no model benchmark, and no owner credential or paid image/model call were used.

## Owner outcome and contract

Models now has one bounded status row per supported provider with a shared keyboard menu: **Set models**, **Reauthenticate**, **Disconnect/Reconnect**, and separately confirmed **Remove saved key**. Set models/reauthentication selects the exact provider and focuses its model/empty key editor. Credential write failures retain the draft and release the busy state; a provider change from another window clears an unsaved key and stale readiness. Existing role overrides and Contributor disclosure remain.

`settings.set` accepts `modelConnection:{provider,enabled}` and `imageModel:<allowlisted ID>|null`. `settings.get` adds five `modelConnections` records containing selected/enabled state, saved/environment/none provenance, credential-unavailable and local-endpoint booleans, never credential values. Existing selected-key fields stay masked. No new runtime method or native method is added.

Disconnect persists a Profile preference that blocks future provider use, including saved/environment credentials and the no-key localhost path. It keeps the encrypted key and model choices for an explicit reconnect, as the UI says. Key replacement alone does not reconnect. Removing a saved key combines native removal with disabled state, so an environment key cannot silently resume use. Requests already sent may finish. Active-run guards refuse connection, key and image-setting changes before touching credentials. A stale probe cannot issue its next vision request or publish success after the connection changes.

Image generation defaults **Off**, including existing Profiles without this setting. An explicit choice allows Imagen 4 Fast, Imagen 4 or Imagen 4 Ultra through Gateway. Gateway is an independently reviewed image destination, not fallback from a failed chat provider. The exact chosen ID reaches the existing image SDK adapter, artifact receipt and spend reservation; there is one request, no retry/model fallback, the existing output validation and 8 MiB bound, and the existing conservative $1 reservation. Unknown usage remains charged to that reservation; an observed excess is recorded and output refused. The supported model IDs were checked against Vercel's [Imagen 4](https://vercel.com/ai-gateway/models/imagen-4.0-generate-001/providers) and [Imagen 4 Ultra](https://vercel.com/ai-gateway/models/imagen-4.0-ultra-generate-001/faq) listings; provider availability and actual billing are not proven by local fixtures.

**Product cost accounting remains incomplete for images.** The existing image tool uses the program spend ledger rather than `model_calls`. This batch therefore refuses image dispatch whenever any user run/day/routine cap is configured and states that restriction in the UI. It does not advertise cap coverage it lacks or ask the user to remove their cap. The handler checks image selection and caps both before and after asynchronous egress approval; selection change, Off, new cap or Gateway disconnect prevents dispatch. Image Usage attribution/reservations remain a distinct dependency before claiming complete Usage/image qualification.

## Source ownership and verification

- Contract: `packages/contracts/src/model-connections.ts` and narrow `api.ts` references.
- Runtime: `services/settings.ts`, `agent/image-tools.ts`, and only the image handler in `api/methods/agent.ts`.
- UI: `settings/sections/Models.tsx` and `ModelConnections.tsx`.
- Focused fixtures: `model-connections.test.ts`, `image-model-settings.test.ts`, renderer `ModelConnections.test.tsx`; existing Settings/image/Models regressions retained.
- Generated authorization was refreshed only locally to compile the base's pending pasted-Memory methods. Generated output is excluded; integrator refreshes it after merge.

Commands:

```sh
node scripts/gen-host-bindings.mjs
npx tsc -b
npx tsc -p apps/shell/tsconfig.json
npx vitest run --project unit tests/unit/model-connections.test.ts tests/unit/image-model-settings.test.ts tests/unit/settings-defaults.test.ts tests/unit/agent-provider-tools.test.ts apps/shell/src/settings/sections/Models.test.tsx apps/shell/src/settings/sections/ModelConnections.test.tsx
npm run lint
npm run format:check
git diff --check
```

Results: **47/47 tests across six files**, compile/typecheck, lint (370 warnings, zero errors), format and diff checks passed. Source evidence is recorded in `docs/evidence/models-settings-source-2026-09-29.json`. The image fixture intercepts the AI SDK boundary, uses a synthetic key/one-pixel image, and verifies the real Settings → handler → selected Gateway image object → artifact/receipt/spend flow with zero paid requests. It **does not qualify native networking or a live provider**.

## Exact native seams and focused acceptance

Use one disposable Profile, synthetic credentials, a local OpenAI-compatible model endpoint with request counts, and the integrator's next serial AuxDev build. Keep the user's Gateway key restricted to Muse Spark 1.3 Contributor; do not use it for any image test.

1. Open `/settings/models`; keyboard-open a provider menu, select Set models/Reauthenticate and verify focus plus empty key input. Native `readSecret/storeSecret` continues using `gatewayApiKey` and `modelKey-<provider>` in the owning Profile. Save/replace a synthetic key, induce one controlled OS-storage failure, and verify retained editor/error/masked state. Keep secrets out of screenshots, logs and manifest data.
2. Configure a loopback compatible endpoint and fixture model explicitly. Test once and record the receiver count. Disconnect, attempt discovery/probe/task start and prove no new receiver request; normal Quit/restart must keep it disconnected. Reconnect explicitly and test once. A second disposable Profile must not inherit the disabled state or saved key.
3. With a synthetic environment key also configured, Remove saved key must require the review dialog, clear only the selected native secret and keep the provider disabled after restart; no environment fallback request. Reauthentication may save a new key while disconnected and must not reconnect automatically. Other provider model/role choices remain intact.
4. In a local mock active run, attempt connection/key/image changes and require refusal before OS write. For a pending local probe, change/disconnect in another window before the first response and prove no second vision request or stale success receipt. Requests already dispatched may complete; this is not cancellation of upstream billing.
5. Image selector starts Off, persists an explicit choice and Off across restart, issues zero requests on save and exposes the cap restriction. With an explicit cap, an image action must refuse before egress/provider dispatch. During a controlled pending approval, Off/model change/cap/Gateway disconnect must refuse dispatch afterward.
6. **Positive native image output remains blocked on a dedicated unpaid adapter fixture.** Production Gateway's destination is fixed; no arbitrary loopback image endpoint or unsafe production override was added merely to pass this test. A reviewed test-only transport adapter/capture fixture is required for native image bytes, artifact view and exact receipt/ledger identity. Source SDK interception alone must not close this gate. Do not replace it with a paid call using the Contributor-only key.

Record source/runtime/native identities, native Profile/credential operation results without values, mock receiver counts, restart state, rendered controls/focus, refusal cases and exact image fixture boundary. Reuse the old role/Automatic and route/reload/history evidence unless a relevant seam changes. Full S9, integrated budget/ACCESS review and S14 stay open.
