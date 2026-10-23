# Queued background notification ownership

A source-proven gap remained after the original background `flush` admission check: `deliverToSelf` queues a callback and can wait for the target session to become steerable. That callback could resume after broker shutdown, consume pending monitor/output notifications and attempt a message write under stale admission.

The successor revalidates native ownership at queued callback entry, after each steerable wait, and in the original deferred session lookup used by live delivery. Refusal occurs before the pending-output callback is consumed, leaving that pending payload intact. It preserves ordinary messaging behavior, UI and original serialization.

API: `applyAuxQueuedDelivery(source)` in `transform.mjs`. Exact input `9bdcbf055fbc9e7b58023e8dbacb635bbf17020cb90ed0933d4c8f2b928ab190`; output `156c9361fc37848175c920d2fab53b89526870a2358803ef01f147af5ecb1ed6`. Three single-count seams scoped to the actual supplied function. Cold refusal remains unchanged.

Focused check executes the extracted original and successor functions. In both queued-entry and resumed-wait cases, the original consumes and saves synthetic output after closure; the successor refuses and leaves it untouched. Complete transformed syntax passes. Dependencies/native ownership are controlled synthetic adapters; this is not an active native-authority test.

This fixes late callback admission, not cancellation of the underlying `whenSteerable` wait. A never-settling wait remains pending/unknown through existing native policy. It does not claim all notification listeners, provider work or process descendants are drained, or that external writes are scoped. No native ABI, owner data, signing or cloud action was involved.
