# Automatic model context compaction

Implements `docs/spec/daemon/agent.md` streaming/compaction requirements using independent
threshold choices. Each tool-loop prepareStep evaluates durable context. By default,
compaction begins at an estimated 75% of the selected model's context budget. The verified
Muse budget is 1,048,576 tokens; unknown providers use a conservative 64,000-token estimate
until the caller configures their documented limit. Runtime fields (create/update):
`autoCompaction:boolean`, `contextWindowTokens:4096..2097152`,
`compactionThreshold:0.4..0.9`. Estimates use UTF-8 bytes/3, explicit image cost and a
conservative binary-document byte cost. They are not exact provider token measurements.

At threshold, a real configured model summarizes older context with bounded retries and
at most 4096 summary output tokens (less for small context budgets). The latest exact
accepted user input and a complete recent assistant/tool exchange remain model context;
prior exchanges and all original transcript rows remain durable and branchable.
The summary preserves constraints, completed/uncertain actions, outstanding work and
unresolved decisions; persisted suspension state remains authoritative. Summary text is
prior transcript data, not new action permission. The engine never re-executes a tool
as part of summarization. Empty summaries/provider errors preserve prior context and
surface a run error. Current input/tool results that cannot fit even after compaction
fail with a recoverable budget error instead of claiming successful compaction.

`compaction-started` and `compacted` events include automatic=true and size metadata.
Manual compact uses actual multimodal context and retains the same full transcript.
Focused tests verify threshold planning and complete tool-pair/input preservation.
Real provider-backed compaction must be verified using the authorized disposable Muse
credential setup; the isolated lane's tests do not invoke an external provider.
