# Actual fresh recovery owner capture

The consumed supplied codec now exposes a finite recovery Prepare entry. It
freezes the same real editor/composer owners and inspects current state without
calling their normal flush callbacks or writing draft storage. This protects
fresh current state before an interrupted journal is requalified. Normal Prepare
still flushes exactly as before; default unheld UI behavior and classes remain
unchanged.

New future lease envelopes include bounded opaque ownerStateJson and
memoryStateJson, plus the recoveryReadOnly mode observation. Owner facts are
actual kind/inspect signature pairs sorted deterministically; raw signature JSON
is retained as data and does not replace numeric UTF16 store pairing or native
profile/frame/lease ownership. A late real owner change still taints/refuses the
original lease. A read never rebases its signature or silently creates a new hold.

Older journals lacking these facts must remain refused for fresh producer
reconciliation. This entry does not adopt old editor/claim/failed-memory state,
restore physical stores, reset memory, grant readiness or select an actor.
Concrete owner-specific adoption and the real native journal/fresh-owner consumer
remain required; merely refusing different state is an interim safety boundary.

The existing actual adapter consumes the updated pinned runtime and one new
finite export. Original supplied source/predecessor hashes and all40 counted
rules stay pinned. All8 owned source compositions and module syntax passed, with
classes preserved and state-v1 unchanged. Twenty focused actual-code synthetic
cases passed, including two new no-flush/immutable-owner recovery checks. No real
app, native, provider, owner-profile or lifecycle action occurred here.
