# Unsigned historical subagent override preparation

This external offline tool implements the restricted unsigned path identified in [the pinned replay review](../aux-subagent-override-identity/README.md). It does not migrate signed payloads, add a runtime alias, replay work, access owner files or change the UI.

`prepareUnsignedSubagentIdentity({bytes,expectedSha256,capability})` accepts a complete caller-supplied JSONL buffer and returns prepared `{bytes,receipt}`. The capability requires a stable scope ID, disposable/exclusive flags and a real `assertStopped` callback checked before and after preparation. Limits are64MiB,20,000 complete LF-terminated records,2MiB per line,64 nesting levels and100,000 tokens per JSON record. Malformed UTF-8/JSON, duplicates, BOMs, partial tails, hash mismatch or lost scope refuse.

The exact typed selector is assistant → content toolCall named subagent → arguments.model.provider whose trimmed value is the old product provider. A candidate must have action spawn, nonempty prompt/description, the exact two-field provider/modelId object, no model_category conflict and only the reviewed optional arguments/types. Recognized non-spawn actions with an old model override also refuse as a schema ambiguity; the declared override is spawn-only. Arbitrary user messages, other tools, result/details JSON, prompt prose, tool IDs and model IDs remain byte-identical. Whitespace-wrapped old provider strings are normalized to Aux, matching the actual tool consumer's trim behavior; modelId text itself remains unchanged.

A matching tool block with **any thoughtSignature property** or any unreviewed block field refuses the entire requested cohort. Assistant-level signature-like fields also refuse. Neighboring signed text blocks are preserved; they are not arguments being changed. Matching unknown argument/model shapes and duplicate members also refuse. The tool never drops, forges, changes or reuses a signature for mutated signed arguments. Other tools' signed payloads remain untouched.

The existing duplicate-aware token walker is now shared in `aux-identity-json-tokens.mjs`; transcript metadata keeps its original behavior. Only the known provider string token is replaced, with JSON whitespace outside the shortened token filling the original UTF-8 byte length. Escaped strings are supported. Every byte outside planned token spans, all LF positions, parsed modelId/prompt/payload values and the entire transcript length are verified. No recursive value-based replacement occurs.

## Disposable journal pairing

Explicit `transcriptSnapshots` in the handoff now chain:

`original snapshot → direct assistant metadata → unsigned spawn overrides → prepared transcript`

Both preparers use the same real stopped/exclusive scope. Receipt lineage requires metadata output hash = unsigned input hash; the durable transaction still compares the **original transcript hash**. Unknown/signed candidates fail before any durable journal is prepared, so earlier in-memory DB/JSON preparations cannot partially commit. The existing128-file/128MiB source limits include these snapshots once. No discovery, owner paths, deletion or launch was added. Real startup fencing remains outstanding.

## Focused evidence

The new tests cover escaped and trimmed identifiers, exact offsets, unrelated bytes, idempotence, signed/unreviewed blocks, invalid action/model/category/prompt, duplicate fields, incomplete tails, lost scope, unrelated tools/results/user messages and actual pinned model resolution. The source test checks all16 replay-audit anchors and daemon hash, then executes only the inspected exact-model resolver in a VM with synthetic catalog stubs; there are no provider/network calls.

The handoff's real temporary SQLite/WAL crash fixture now also contains a valid unsigned spawn and a separate opaque tool payload. After explicit recovery and verified terminal receipt, only the typed spawn selector and direct assistant metadata change; model IDs, prompt and opaque tool arguments remain. A separate signed matching fixture proves whole-handoff refusal with no durable journal created. Rollback retains exact original transcripts and SQLite sidecars. The accepted real app remains unchanged.

The exact tracking cache now has its [separate reviewed preparer](../aux-subagent-tracking-identity/README.md), paired into the provider main cohort. Signed historical arguments, unreviewed shapes and actual startup acceptance remain separate boundaries; a preparation receipt does not claim full migration or readiness.
