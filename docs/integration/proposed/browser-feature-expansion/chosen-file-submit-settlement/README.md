# Settle chosen-file work that definitely never started

`RegisterChosenFiles` acquires its existing native/file-operation pending ticket before posting fingerprint work. It previously ignored the return value of `ThreadPool::PostTaskAndReplyWithResult`. If shutdown rejected the post, neither callback ran and the live owner retained a pending ticket indefinitely despite the definite absence of submitted I/O.

This three-file overlay captures the bool. Only `false` releases that operation with `kRefused`. `FileOperationLifetime::End` accepts an explicit completed/refused/uncertain outcome with its existing completed default, and an earlier uncertainty mark always overrides the supplied outcome. All existing callers and successful-post paths retain their previous behavior. There is no destructor, cancellation, timeout or receiver-loss settlement; accepted tasks that later lose their completion remain conservatively pending. No broad drain/authority flag is changed.

## Actual selected API contract

- `base/task/thread_pool.h:140–143` documents `false` as the task **definitely will not run** because of shutdown. The template returns `PostTaskAndReply`'s bool directly.
- `base/task/thread_pool.cc:71–81` delegates through `PostTaskAndReplyImpl` and actual `ThreadPool::PostTask`.
- `base/threading/post_task_and_reply_impl.h:94–108` returns the actual poster result, not reply acceptance or cancellation state.
- `base/threading/post_task_and_reply_impl.cc:37–44,81–82` explicitly covers immediate post failure and destruction on the origin sequence. It does not invoke the task or reply on that path. The caller's local `shared_ptr<State>` survives the failed relay's destruction; there is no moved-from callback to invoke or duplicate receipt.

Those four exact implementation files are hashed in `files.json`. With a true post result, this overlay does nothing: the current fingerprint, real persistence callback and pending-retention paths remain the only settlement owners. This is useful under either pending authority-model decision; it does not resolve mandatory custody, external hardlinks, complete browser/service drain or normal admitted-root reopening.

## Integration and evidence

Root may compose the counted edits against the exact pinned selected native files after the current frozen build. No GN, registry, packaging, UI, public JS or signing changes are needed. Existing `End()` calls retain source compatibility. The overlay changes only its fresh proposal subtree, not root/native/stage state or accepted app.

The focused source check replays all one-count edits, verifies hashes against current selected sources and the four API contract inputs, and confirms the final patch hash. This is source evidence, not execution of a shutdown or proof of whole-writer drain. No app lifecycle, owner data, native build or runtime test occurred.
