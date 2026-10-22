# Correction: Lasso can use local BYOK

Lasso transformation is not intrinsically a hosted product-service prerequisite.
The supplied local daemon POST `/lasso/transform` handler directly resolves and
executes the account's configured model. It does not delegate this request to
`fetchAsideAPIAuthenticated` or the hosted speech endpoint.

Exact inspected chain:

1. `extensionOnlyProcedure` requires localhost plus an allowed extension origin;
   resolves a nonnegative existing account ID (or current account when omitted).
   The enclosing daemon server still applies original installation auth.
2. `resolveDefaultOverlayModel(accountId)` calls
   `models(accountId).resolveByCategory("fast")`. That reads available models,
   defaultModel and modelCategories.fast; a missing choice reports
   `No fast model is available.`
3. The handler resolves that model/provider through the original account model
   registry. Missing BYOK credential and managed-provider authentication failures
   have distinct errors.
4. Its Agent uses `modelRuntime.streamSimple`, the resolved model/API key and
   original selection/context messages. It returns the original streaming text
   response. Provider authentication is supplied by the original model registry.

Therefore a local account with a working provider credential and usable fast
model can fulfill the feature without a product cloud account. Inference may
still contact a paid external provider; BYOK does not mean offline. Selection,
region capture, actual model availability and one authorized transform still
require acceptance. This audit performs no inference, capture or credential read.

Voice remains different: its inspected route calls authenticated hosted
`/stt/transcribe`. Do not classify Lasso alongside hosted voice/sign-in/sharing
merely because both start through a local daemon URL.

`source-evidence.json` pins original daemon hash and exact byte offsets/lengths/
hashes for the three copied source excerpts. No executable or runtime is changed.
The lane's setup dependency table is corrected in the same commit. Root should
remove “hosted-service prerequisite” from any other current Lasso readiness row.
