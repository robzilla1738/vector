# Account-incarnation-bound ChatGPT connection

This closes the numeric account ID reuse demonstrated in A33. It changes no UI, native registration, credential host ID, token scopes, callback protocol, cryptographic label or other provider behavior. Existing files are not moved, deleted, migrated or automatically revoked.

## Actual instance binding

The real persistent `CredentialStorage` constructor captures the actual `AccountRegistry` record's numeric ID and canonical incarnation UUID. Its retained getter rechecks that same real registry instance. Unbound/in-memory stores keep their other provider behavior and do not inherit a default ChatGPT account.

The new opaque local scope selects a separate `account-instance-v2:<id>:<incarnation>` namespace. Each new token or pending-registration record also carries `accountBinding: {format: "aux.chatgpt.account-instance.v2", accountId, incarnationId}`. Its existing inner `version:1`, issued client ID, installation host ID, issuer and verified provider subject retain their meanings. New records must match the exact current scope on every read; missing or mismatched binding is refused. Scoped write, pending-registration and lock operations revalidate the actual registry owner as well.

Historical selectors `account:<id>` and `aux-local-default` now explicitly refuse. A new incarnation never looks up their filenames, imports their client mapping, or treats unknown data as its own. New connection attempts perform a fresh authorization in the new namespace. Old numeric-key tokens, registrations and permanent lock markers remain untouched for a separately confirmed migration/revocation decision. There is no silent reset or reinterpretation of an old connection.

Every actual ChatGPT credential caller uses the captured opaque scope. OAuth attempts retain it; token publication checks it again after asynchronous provider and identity work. A stale credential service cannot resolve a replacement account simply by consulting the same numeric ID. Actual account deletion invokes a synchronous cancellation hook on its exact pre-removal instance. That aborts matching authorization/refresh attempts, including attempts whose callbacks are physically still pending, without cancelling a newly reused slot. Late callback settlement or a missing cancellation notification still cannot publish into the replacement. Selected catalog results are likewise rejected after the captured owner changes.

Deletion does not claim remote revocation. Unselected old-instance files remain private and unavailable through a current profile; explicit provider disconnect retains its existing truthful revocation behavior. No old credential file was accessed during implementation or tests.

## Exact cumulative source handoff

`source/daemon-anchors.json` contains 17 count-one upgrades for BOTH actual A17 cumulative leaves. It includes lifecycle/catalog fixes from A31 and the constructor/deletion/incarnation consumers; it preserves later bootstrap, physical lifetime, callback cleanup and unrelated providers. This avoids substituting a less complete raw SEA projection.

`source/daemon-transform.mjs` exports `upgradeSelectedDaemon(input) -> {text, changes, inputSha256, outputSha256}`. It accepts only the exact reviewed A17 preimages or their exact memory A41 successors and rejects unknown or already-upgraded source. `source-check.json` pins all four allowed inputs and expected outputs:

| Leaf | A17 input | With memory A41 and this provider upgrade |
| --- | --- | --- |
| index.mjs | ab8314dabe8f6b2100a587e93deed2bd496ffe0db56dfa3610bbcd08c70b9938 | 6585ab560a1f987940141c870105e2db2b160b7e465d55490be2c6c12c0b4f9f |
| aux-native-entry.mjs | 1d1e348b5dbddfe3cf320238c1f357eece6f6364b5c3d97e01903687c05a48d1 | 9827a7833c9f42905363aa0207da5f11c9a621347dadd13c0fcceb3d424d8cee |

The current memory plan SHA-256 is `4d9909d8d0f79acbc9f784010893ae8d3559627cdf3bf0a9b1bcfb0bca15d62b`, seven anchors per leaf. Applying those seven and these seventeen in either order produces identical complete bytes. The existing `auxChatGPTLifetime().release(ti)` path remains present. Both source leaves pass syntax checking. Fresh supplied-source composition also passes for state1/state2 with 153/314 total anchors; those fresh projections are evidence, not replacements for the current cumulative source.

The active shim is SHA-256 `d41902beb64c7cec87441d28152607efce89e1dc1bce9c909d6fbe7f48b467c3`. Pair it with `source/aux-chatgpt.cjs`, SHA-256 `4e33ecff5d588a710a7b61da93fc2a45962f545d6c410451fdb0fdfae035156e`, through `source/transform.mjs`. The same two retained lifetime configuration/export anchors from A32 preserve actual operation/transport ownership. No child process is reintroduced. Root must package the upgraded daemon leaves and this exact shim together, pin the new producer/anchor/pin inputs, and retain the signed-runtime safeguards. Source-only compilation/staging is not real-account acceptance.

## Lean evidence

`provider-free.tap`: 23/23 pass, with no provider requests. New cases cover reused IDs, unchanged legacy bytes, instance-bound registration metadata, same-instance reopen/client reuse, benign rename, unbound rejection, exact old-instance cancellation, missing-notification refusal, and late authorization/refresh/catalog results. Existing public Responses, credential rotation, safe diagnostics, PKCE/nonce/identity and direct kernel lock checks continue passing.

`node check.mjs` also executes ONLY two actual extracted registry methods with synthetic memory, proving that a genuinely reused ID now selects no replacement credentials while the original file stays untouched. It does not initialize the 12 MB daemon. Static cumulative replay, memory commutation, fresh source composition and both shim syntax checks pass. Product, native daemon, provider, owner data and signing execution remain false. The actual embedded runtime and real-account consent/reconnect/refresh/revocation journey still require the integration owner's bounded app check.
