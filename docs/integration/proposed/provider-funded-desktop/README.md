# Provider-funded desktop launch

Root integration update: exact final staging, preservation audit and unsigned successor packaging have now passed. See `docs/integration/proposed/provider-funded-integration/README.md` and `actual-package.json` for current evidence. The handoff details below retain their source history; actual provider/native/UI runtime acceptance remains unfinished.

Owner-selected source policy: `paymentsEnabled:false`, `hostedAiEnabled:false`. No environment lookup or fake Pro/Max account state. Existing account/auth/credential and external-provider errors remain real. Existing paid implementation remains in source behind public policy; old hosted connection records are not deleted or repurposed.

## Integrator hooks

Root owns the two insertion sites and the stage-input inventory:

1. Import `transformProviderFundedLaunch` from `vendor/provided/provider-funded-launch.mjs` in `scripts/lib/provided-ui.mjs`. After the complete state-identity block (including `applyAuxBillingReturnFallback`), before inline marks, call:

   ```js
   const launch = transformProviderFundedLaunch({component, path:file.path, text, stateIdentityVersion});
   text = launch.text; anchors.push(...launch.anchors);
   ```

2. Import the same helper in `vendor/provided/daemon-adapter.mjs`. After `applyAuxColdEntryAdmission` and all identity/count-pinned adapters, before the final return:

   ```js
   const launch = transformProviderFundedLaunch({component:'daemon',path:'entry.mjs',text:code,stateIdentityVersion});
   code=launch.text; applied.push(...launch.anchors);
   ```

3. Inventory the module and `provider-funded-launch-ui.json` in `provided-stage-inputs.mjs`. Restaging requires a **new actual Agent fingerprint**; never copy old accepted receipts onto these bytes.

Both supplied and Aux branding are explicitly supported; production pipeline defaults to Aux. Both compatibility/state1 and aux-v1/state2 exact daemon source compositions pass count and syntax checks. Repeated application fails closed. Frozen upstream source hashes for all ten changed Agent chunks are recorded in the JSON recipe; standard staging already validates complete original file inventory.

## Behavior

- Existing BYOK provider row replaces the hosted-plan onboarding row, reusing its supplied component. API-key chooser, subscription-provider chooser, credential/settings controls and provider usage/errors remain.
- Shared model options and model settings omit the first-party hosted provider; old stored credentials remain untouched. Cloud sign-in does not make hosted inference linked.
- Paid settings navigation, hosted usage/referral promos and paid local-routine/Ultrabrowse gates are suppressed. Legacy billing deep links display the supplied model-settings component.
- Local feature entitlement still requires an actual account object. No account/session/token is fabricated, and normal account procedure ownership remains required.
- Hosted model runtime selection and token acquisition refuse before token access. Aux API helpers refuse hosted inference and speech paths, and billing mutations, before auth refresh/network access. This does not block external providers' own subscriptions or paid API keys.
- All literal supplied `className` tokens remain in order. No CSS, assets, typography, geometry or native source is changed. Hiding a deferred paid section and reusing an existing provider row is intentional launch availability, not visual redesign.

## Focused source evidence and limits

`node --test vendor/provided/provider-funded-launch.test.mjs` passes two tests (2026-10-23): actual pinned ten-chunk source replay/syntax/class preservation plus actual supplied and aux-v1/state2 daemon adaptation/syntax and isolated no-network policy evaluation. An initial repeat-application fixture revealed that a retained prefix could be injected twice; the adapter now explicitly rejects an existing policy. A later test initially evaluated the existing state2 cold-entry quarantine; corrected fixture extracts **only the inert policy** and does not bypass or run the daemon.

This is source evidence, not packaging, startup, OAuth, provider inference, credential custody, native runtime or UI acceptance. The accepted app is unchanged. Root must replay the complete stage and build a separate candidate before testing the actual browser. No secret or provider call was used, no environment file read, no signing/installation/runtime grant occurred.

Read-only native frame/account inspection found no paid entitlement checks in the current `aux_*` frame sources or `aux_account` extension API; matches were ordinary callback subscriptions. It is not proof for unrelated Chromium areas or runtime/native helper acceptance.
