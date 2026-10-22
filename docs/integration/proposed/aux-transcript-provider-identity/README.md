# Transcript and queued-message identity contract

This is offline preparation, not an activated app migration. The current accepted UI and app are unchanged. The source is the supplied 1.26.1016.1852 daemon, SHA-256 `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. [source-audit.json](source-audit.json) pins 22 exact counted anchors and their UTF-16 offsets. No owner profile, credential, native helper, provider or complete daemon was executed/read.

## Actual contracts

- `sessions.queued_messages` and `sessions.steering_messages` are JSON message arrays. `AgentSession.#_e` prepares messages/attachments; follow-up and steering paths enqueue these messages. `#Be` persists arrays, while `#ze` rehydrates `agent.followUp`/`agent.steer`. The queue RPC user schema describes `role`, arbitrary `content`, and `timestamp`. These producers/consumers do not provide an authoritative queue-level execution-model selector. Arbitrary nested message/tool content may contain provider-looking strings and must remain opaque.
- The current execution model is resolved separately from `session.model`: `resolveAgentExecution` resolves that selection and `AgentSession.create` passes its model/thinking level alongside independently loaded historical messages. The existing SQLite provider helper covers that column and `routines.session_config.model.provider`; it does not migrate queued JSON.
- `messages.jsonl` consists of raw message objects, discriminated by `role`, without a surrounding event envelope. The append writer uses `JSON.stringify(message) + '\n'`. The reader finds LF bytes, converts one line from UTF-8 and uses `JSON.parse`. Row IDs are starting byte offsets; `jsonlReadSize` includes LF. User, assistant, toolResult, system-message, user-message-metadata, steering, turn-lifecycle, compaction and session-branch records occur in the implementation.
- Agent-context restoration filters compaction/steering/turn-lifecycle records, restores selected compaction context, filters aborted assistant messages, and passes historical assistant messages to model adapters. The assistant fields `provider`, `api` and `model` matter: `transformMessages` compares all three against the execution model. On mismatch it drops redacted thinking, converts signed thinking to plain text, removes text/thought signatures and may remap tool-call IDs. OpenAI response conversion also compares these identifiers. Merely renaming the current session model can therefore degrade historical resume behavior.
- Byte IDs are referenced by turn projections (`jsonl_read_offset`/`jsonl_read_size`), compaction offsets/first-kept IDs, memory extraction ranges, and routine origin message IDs. The existing full transcript rewrite code explicitly remaps routine origins and rebuilds projections. A normal JSON reserialization that shortens provider strings cannot be substituted without that work.

## Prepared fixed-offset helper

`vendor/provided/aux-transcript-provider-identity.mjs` exports:

```js
await prepareAuxTranscriptProviderIdentity({
  bytes, expectedSha256,
  capability: {
    id: 'explicit-disposable-scope', disposable: true, exclusive: true,
    assertStopped: async ({sourceSha256, phase}) => actualStoppedProof
  }
}); // {bytes, receipt}
```

It accepts only supplied buffers, performs no path discovery or I/O, copies inputs before awaiting the caller's proof, and rechecks the proof after preparation. It is bounded to 64 MiB, 20,000 complete LF-terminated records, 2 MiB per record, nesting depth 64 and 100,000 JSON nodes per line. Malformed UTF-8/JSON, duplicate keys, BOMs, incomplete tails, unsupported assistant metadata and hash/capability failures refuse the entire preparation. It does not use the source reader's corrupted-line-skipping fallback.

Only direct fields on `role:"assistant"` records change:

| Field | Existing exact value | Aux value |
| --- | --- | --- |
| provider | aside | aux |
| api | aside-provider | aux-provider |
| api | aside-images | aux-images |

Other provider/API values and all model IDs remain byte-identical. Nested tool arguments, messages, signatures, prose, IDs, ordering, CRLF/LF and non-assistant records are untouched. Each replacement uses the shorter JSON string token followed by JSON whitespace **outside** the token, preserving the original token's UTF-8 byte length. Escaped old strings receive the corresponding extra whitespace. The supplied JSON.parse reader accepts this representation. Each altered parsed record is checked against an expected object containing only those direct changes; byte length and every LF position remain equal. No offset, line size, compaction ID or routine origin rebase is required for these replacements.

The receipt identifies prepared bytes, original/output hashes, source pin, line count and field counts; it does not declare a migration complete. This external tool contains legacy match definitions and is not intended for the delivered app.

## Focused evidence

Four focused tests pass, including the pinned source check below. Fixtures cover signed thinking/text/tool blocks, nested legacy tool arguments intentionally unchanged, multibyte content, CRLF, escaped metadata tokens, idempotence, custom providers, duplicate keys, malformed input and loss of stopped proof.

```sh
AUX_PINNED_DAEMON_SOURCE=/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs \
  node --test vendor/provided/aux-transcript-provider-identity.test.mjs
```

The source-backed test validates all 22 anchors and the complete daemon hash, then executes **only** its inspected pure `transformMessages` function in a VM with an identity image-downgrader. Its fixture contains no images. Before metadata migration the actual transformer removes signatures against the Aux execution model; afterward the original thinking/text/tool signatures survive. This is a bounded consumer-contract check, not full daemon or provider execution. The source-backed test is explicitly skipped when no source path is provided; the recorded run supplied it and had no skips.

## Still separate work

1. The companion handoff now accepts explicit transcript snapshots and adds their prepared bytes to the existing durable stopped-state journal. Require exact authorized disposable paths, original hashes, real startup/writer exclusion and completed verified receipt before any daemon opens the files. This helper cannot establish that exclusion itself.
2. Inspect/migrate **typed executable tool arguments** separately. `subagentModelOverrideSchema` explicitly permits `{provider,modelId}` inside the subagent tool's `model` argument. `rerunSuspendedToolCall` retrieves original assistant `toolCall.arguments`, prepares them and can execute them. Its crash-rerun gate has a safe-tool list and suspension conditions; this does not mean every historical subagent call automatically reruns. Arbitrary recursive rewriting would be unsafe and is deliberately absent.
3. Review SQLite cached assistant projections such as `session_turns.final_assistant_message`. The authoritative agent-context reader loads JSONL, but cached typed metadata may still contain the old identity. This helper does not edit projection columns or invalidate their application-level revision metadata.
4. Other persisted references, cloud copies and opaque queue/tool content are not proven absent. Keep those boundaries explicit rather than declaring all transcript/history identity complete. The standalone SQLite provider migration remains limited to its two reviewed JSON columns.

No UI change, native/launcher integration, owner-state migration, signing or readiness claim is included.
