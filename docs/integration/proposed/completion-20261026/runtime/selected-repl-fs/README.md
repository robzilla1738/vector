# Partial generic REPL fs checkpoint — stopped by owner

The owner requested work stop after the currently approved root step. This draft is preserved for later continuation. **It is not integrated, not compiled, not connected to a caller, and not ready to enable.** No native build, parse check, runtime execution, candidate/review modification or activation was performed for this draft.

The exact supplied `createReplFs` function and its 12-method inventory are pinned. `resolvePath` has no native IO. The other eleven methods need actual descriptor custody behind the existing resolver and `file.access` permission hooks. The partial native include drafts per-operation descriptors attached to the existing selected scope and reuses the existing publication-stage guard for writeFile/copyFile. It adds no registry, root selector or active registration.

Unfinished and must-fix before any integration or compile:

- The selected scope forward declarations, per-scope weak operation list, stop callback, method registration and Worker include are absent. This include intentionally has unresolved source joins; it is not a compilable native cohort.
- The JS replacement that preserves the original resolver/permission hooks and authorizes actual retained canonical targets is absent. The prepare/execute/close API must remain private and its retained descriptors must settle on every cancellation/error branch.
- `SelectedFsAllowed` currently treats both selected Task and workspace containment as overriding the generic protected-path predicate. Workspace containment must never override app seed, Control/browser, foreign Task or protected-ancestor denial. Only the exact native selected account Task exception may override Task's general denial.
- Parent directory opening still uses `SelectedBrowserDirectory` by canonical spelling. For account/session/workspace descendants it must walk relative to the actual retained native authorized root descriptor, with physical close checks, rather than reopen an authorized root by path. Public explicit targets require the original permission hook on the actual retained target before execution.
- Native operation concurrency/finalizer/stop and every descriptor-close path need one bounded review. The draft finishes scope counters outside its operation mutex, but no full joined API/lifetime review has occurred.
- Original API compatibility needs completion: mkdir existing/recursive targets and returned first-created path, file mode behavior, symlink/stat/lstat semantics within authorized roots, missing paths and force removal, rm retry options, Dirent/Stats and encoding facade shapes, errno fidelity and write/copy size behavior. No methods may be silently dropped.
- The draft does not yet provide a JS Stats/Dirent facade or Buffer/string encoding conversion. It has no root-only compile recipe, source fixture or integration receipt.

The last coherent earlier batches are `665d0ce75` (selected command scratch/runtime/cancellation) and `20545b690` (generic REPL original bridge/host-promise drain and actual stored session context). Their full future activation gate remains open. The generic fs draft must not be added to that link recipe or considered a completed source gate. Apple ES authority, actual paired approved addon inputs, and later exact activation/execution review remain separate requirements.
