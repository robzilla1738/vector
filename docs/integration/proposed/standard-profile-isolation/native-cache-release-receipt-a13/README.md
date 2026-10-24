# Original renderer cache release receipt

A lost renderer release reply previously left no exact record of the completed release. Native read cleanup also accepted a bare `held:false`, which could not distinguish original cleanup from unknown absence. This successor retains one actual last released request/token in the existing renderer cache owner, returns it only for that original request, and makes exact retry idempotent. Native cleanup requires that exact receipt for a previously known token; a genuine pre-lease refusal must correlate the original request and have no token. Mismatched or unknown state stays held.

The receipt is written only after actual original lease reset and deferred callback dispatch. It proves past cache cleanup only. It does not prove those newly dispatched physical writes completed, grant source qualification, restore target data, or authorize migration. Read with no current hold remains unsuccessful. No schema, UI, admission, product lifecycle or native runtime changes are made by this proposal.

Three files / seven exact anchors over the pinned A8 header and A9 owned outputs. Root owns actual compilation/integration. The focused check verifies exact source replay, reverse applicability, hashes and whitespace; it is not runtime acceptance.
