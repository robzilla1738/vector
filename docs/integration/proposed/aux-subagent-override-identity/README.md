# Historical subagent model override: exact contract and unresolved migration

This is a source-only review of the supplied 1.26.1016.1852 daemon, SHA-256 `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. The [audit](source-audit.json) verifies16 exact unique anchors/UTF-16 offsets. No complete daemon, native addon, owner state, provider request or app was executed. This document remains the source-only review. The later [unsigned-only preparer](../aux-unsigned-subagent-identity/README.md) implements its restricted unsigned subset; signed candidates still refuse.

## Exact authoritative location

The executable override is in a persisted JSONL message at:

`u/<accountId>/sessions/<YYYY-MM-DD>_<sessionId>/messages.jsonl`

with **all** these discriminants:

| Path | Exact meaning |
| --- | --- |
| record.role | `assistant` |
| record.content[i].type | `toolCall` |
| record.content[i].name | `subagent` |
| record.content[i].arguments.action | `spawn` |
| record.content[i].arguments.model | object containing `provider` and `modelId` strings, no additional properties in its declared schema |
| record.content[i].arguments.model.provider | exact requested provider identifier |

The tool's action union is spawn/resume/list_models/request_approval. Its optional `model` is described as **spawn only**. Model-looking data on another action, in a prompt, in a result/details object, or in another tool is not this executable selector. The existing transcript metadata migrator deliberately does not edit it.

`spawn` requires nonempty trimmed description and prompt. A model with both strings empty after trimming is treated as omitted. Model and model_category cannot coexist; a half-empty model fails. The tool passes trimmed provider/modelId to `spawnSubagent`, which calls `resolveSubagentModel`; an explicit selection calls `models(accountId).resolve(modelId,provider)`, checks exact resolution and creates the child session with that resolved selection. Thus changing only the child `sessions.model` does not change the original parent's executable spawn arguments. Whitespace-wrapped provider identifiers also need an explicit policy; a simple exact raw-string replacement does not cover all values the consumer trims.

## When historical arguments can execute

`resumeSuspensionByReentry` reloads all JSONL rows, finds the last assistant containing the matching tool-call ID, and prefers an existing tool result. If none exists, it calls `rerunSuspendedToolCall` using that **original assistant message**. The rerun locates the original block by type/id, selects the current tool by its original name, optionally runs prepareArguments, and executes those original arguments.

The approval guard refuses replay of a tool interrupted during execution unless it was beforeExecution or the specially recognized subagent request_approval forwarding case. Crash recovery also has a separate gate: `subagent` is **absent** from its safe-tool allowlist. An unresolved subagent spawn is therefore not blindly crash-replayed just because it exists. A matching suspension with response/error can pass the other gate; ordinary suspension reentry has its own flow. Existing child sessions and completed tool results must never be ignored to respawn work.

## Why no universal argument migration was prepared

The typed field is clear. Preserving replay semantics for every stored record is not yet established. In particular, the supplied Google converter emits `functionCall.args = originalToolCall.arguments` **together with** the block's opaque `thoughtSignature`. The local signature validator only checks base64-like form and length. It does not verify, describe, re-sign or prove that signature's binding to the original arguments.

An edit to the provider token while retaining the original opaque signature could invalidate provider replay. Dropping that signature would change behavior and contradict the requirement to preserve existing signed content. The static source cannot establish whether a given signature tolerates the edit. This is a concrete contract gap, not a claim that failure has been observed, and no provider checks were authorized in this lane.

The fixed-offset padding technique solves **offset preservation only**. It cannot by itself solve the signed-payload problem. Therefore this review does not ship a recursive rewrite, an automatic signature deletion, a resume alias in the delivered app, or a blanket migrated marker.

## Bounded next implementation choices

1. A separate offline preparer can safely target a deliberately restricted **unsigned** subset after exact duplicate-aware parsing and complete typed-path validation: assistant/subagent/toolCall/spawn/model, known model schema, valid spawn arguments, no conflicting model_category, no thoughtSignature or other unreviewed signature fields. Unknown or signed matching candidates must fail/refuse the whole requested cohort with an explicit finding, not silently count as migrated. Preserve modelId, IDs, prompt/content, all unrelated bytes and the original token byte length with outside-token whitespace. Bind its receipt and original bytes to the existing stopped-state journal; do not run it as an app startup side effect.
2. Signed matching candidates require a reviewed signature-aware policy before modifying them. Preserve immutable originals outside the delivered successor and prove the chosen replay strategy against the actual adapter/provider contract. That policy must also preserve existing suspension identity, beforeExecution status and existing results/child work. Do not infer safety merely from SQLite integrity or JSON parsing.
3. Couple acceptance to exact affected records. An empty candidate set is useful evidence only for explicitly supplied reviewed snapshots, never an assertion about owner or undiscovered profiles.

The unsigned-only subset is now prepared by the companion external tool and paired with the disposable journal. Its signed policy and actual app activation still require separate work. The accepted app and UI remain unchanged.

## Adjacent persisted caches: separate scope

`spawnSubagent` also writes `toolState.subagent.subagents[].model = childSession.model` through the tracked-subagent state update. That state is stored in `sessions.tool_state` JSON. `getSubagentResult` normally reads the child session and may accept a caller-provided model; presentation/result details can also include model objects and formatted provider/model prose. The existing migration of `sessions.model`, routine config, direct assistant metadata and `session_turns.final_assistant_message` does not cover this distinct typed tracking cache. It needs a separate exact-schema audit/preparer; arbitrary recursive changes to tool_state or result prose would be unsafe.

The source-pinned cached final-assistant migration contains only the last text/error projection, not historical executable tool blocks. It therefore cannot substitute for this work. Queued/steering message payloads remain opaque; no queue-level authoritative model selector was found in their reviewed producers/consumers.

## Verification performed

The audit-generation check matched the complete pinned source hash and all16 unique anchors exactly. This lane needs no live app, cloud inference or repetitive integration tests: it changes only review documents. Actual signed/unsigned record preparation, adapter replay, startup fencing and runtime acceptance remain outstanding.
