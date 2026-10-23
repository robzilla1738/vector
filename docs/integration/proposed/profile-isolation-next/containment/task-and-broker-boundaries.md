# Actual supplied callers that prevent activation

This is an implementation boundary inventory for the pinned v2 stage, not proof of complete dataflow coverage. `task-callers.json` records the exact input hash and literal symbol offsets. Counts include definitions and references; they are not independently meaningful call counts.

| Actual supplied constructor or route | Required split |
| --- | --- |
| `getAccountRoot` | Keep private account metadata under control state. Do not globally replace this constructor. Its string-input passthrough is not authority for a task capability. |
| `getSettingsJsonPath`, `getRemoteControlStatePath`, `getStateDbPath`, `getCredentialsJsonPath`, `getModelsPath` | Stay private. Tasks must not receive whole-account access. |
| `getProjectsDir`, project workspace constructors | Resolve the account's task projection from the same retained owner, with explicit fresh-layout version. User-selected external workspaces remain separately authorized inputs. |
| `getSessionStorageDir` / `getExpectedSessionStorageDir` | These directories contain private `messages.jsonl` alongside attachments, artifacts and tmp. Split those task subdirectories; do not move or allow the entire session directory. |
| `resolveSessionPath`, `prepareFileAttachment`, artifact enumeration | Preserve existing relative attachment/artifact contracts while resolving through the correct typed task projection. A stored path alone cannot select another account or generation. |
| `accountWritableRoots` / `resolvePermission` | Currently grant account memory/skills plus runtime; these must refer to task projections. Retain provider/account metadata denials. |
| inline `getAccountRoot(...)/memory/routines` and persisted routine `memoryPath` | Migrate fresh constructors and validate persisted paths; old metadata cannot silently override the new trusted root. |
| `AUX_RUNTIME_DIR` and runtime extraction/binaries | Use a trusted native task/runtime capability rather than an environment-selected exception to private denial. Computer-use helper and model-runtime caches need their own reviewed classification. |

The source JWT verifier checks HS256, issuer `aux-daemon` and audience `aux-daemon-localhost`, then reduces the result to a boolean. The middleware also checks localhost, Host, origin, and applicable content type. These are useful existing authentication checks; that boolean alone does not establish a retained profile owner/generation for brokered filesystem writes. A route audit must follow authenticated requests through their actual account/session selection and queued asynchronous writes, including close/cancellation. This observation does not establish that arbitrary tools possess the signing key or can obtain a valid session token.

Fresh-only native paired task/control reservation can be implemented without owner data. It is not sufficient to activate split storage until the actual caller set above is composed with it. Existing layouts need an explicit versioned migration or refusal. The UI must stay byte-identical throughout this storage work.
