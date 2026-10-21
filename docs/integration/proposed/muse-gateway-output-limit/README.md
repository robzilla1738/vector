# Genuine Muse Gateway output limit

Observed acceptance failure: actual input89136 + requested output999801 exceeded context1048576. Supplied buildBaseOptions uses clampMaxTokensToContext with estimated input and4096 safety tokens. The supplied Gateway Muse metadata conflates output limit with1048576 context, so an underestimated prompt can request nearly the whole context as output. The same supplied catalog's native Meta `muse-spark-1.3-contributor` entry specifies maxTokens131072 and contextWindow1048576.

Use the implementation's existing advanced model configuration, not a custom provider, harness result substitution, credential change or signed binary edit.

For verified disposable account3, the exact owner path is `AUX_HOME/u/3/models.json`: getAccountRoot(n) joins the actual Aux home, `u`, and String(n); getModelsPath adds models.json; the account Models instance constructs ModelsJsonStore.fromFile at that path.

Merge this public metadata into existing configuration, preserving all other properties and any lower existing positive output limit. **Also cap maxTokens on any existing provider.models row with this exact model id**: the later configured-model merge takes precedence over modelOverrides. Do not add or replace models rows unnecessarily:

```json
{
  "providers": {
    "vercel-ai-gateway": {
      "modelOverrides": {
        "meta/muse-spark-1.3-contributor": {
          "maxTokens": 131072
        }
      }
    }
  }
}
```

Do not replace an existing file wholesale. Do not print its contents: models.json can also contain secret fields. Its parser supports JSON comments; if existing content is not plain JSON, use a comments-aware edit that preserves unrelated content. The supplied store accepts arbitrary provider keys and a modelOverrides object; maxTokens is an optional positive integer. No apiKey, headers, API, baseUrl or models array is necessary.

ModelsJsonStore.reload compares mtimeMs and size on each configureProviderModels call. Actual listAiGatewayModels calls configureProviderModels before merging configured provider models and final transport normalization; actual resolve's Gateway branch calls listAiGatewayModels again. applyModelOverride replaces catalog maxTokens while preserving provider, model identity, transport and credential resolution. However mergeModelsJsonProviderModels then hydrates provider.models rows and spreads each over the catalog result (`{...catalogModel,...configuredModel}`). Consequently a row persisted by setAiGatewayModelIds with maxTokens1048576 defeats modelOverrides unless that exact row is also capped. Root confirmed this actual existing row in disposable account3 after the first config-only retry still failed. The earlier failed retry remains failed evidence; the original one-field guidance was incomplete. A new real session/model resolution reads the new limit without daemon restart; an already-resolved running agent may retain its previous model object.

The public models.setCustomProvidersConfig RPC intentionally rejects reserved `vercel-ai-gateway`, so do not bypass its schema. models.addCustom is not an equivalent override: actual resolve takes the Gateway catalog branch before the legacy custom-model branch. Advanced models.json configuration is the existing supported owner that does implement this override.

Evidence: pinned supplied daemon-original.mjs SHA256 `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`; functions getAccountRoot, getModelsPath, ModelsJsonStore.reload/configureProviderModels, applyModelOverride, Models.listAiGatewayModels/resolve, clampMaxTokensToContext. Static source inspection only. This lane did not inspect account3 data, write configuration, access credentials, send provider requests, or alter signed artifacts. Root owns the scoped configuration change and genuine rerun; prior failed attempt remains failed evidence.

Before a paid retry, use the real authenticated models.listAvailable query for this disposable account and filter to exact provider/id, printing only id/provider/maxTokens/contextWindow. Require the effective matching entry to show131072 (or lower), then resolve a fresh session. Never infer the runtime limit from the file edit alone. Re-running setAiGatewayModelIds can repersist uncapped catalog metadata, so reverify after provider model selection changes.
