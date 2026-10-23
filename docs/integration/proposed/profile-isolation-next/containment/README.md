# Native subprocess filesystem envelope

This inactive source successor formats a mandatory outer macOS sandbox command from the same native reservation used to admit the subprocess. It grants no authority by itself. The reservation must supply the authenticated private parent and browser data/cache roots, retain their descriptors and transport generation, and revalidate immediately before the real process-creation syscall.

`source/AuxExecSpawnEnvelope.h` uses fixed policy parameters, denies file read/write/executable mapping at and beneath each root, and prevents unlinking their ancestors. It owns argument/environment storage through spawn. It refuses an absent environment, invalid or noncanonical roots, a working directory inside a denied root, and custom argv[0] semantics that sandbox-exec cannot preserve. Existing optional tool sandboxing remains nested inside the mandatory envelope. No JavaScript option can replace the outer policy.

## Focused evidence

`source/envelope-check.cc` compiled against the actual pinned Node 26.5 libuv header with C++20 and exceptions disabled. An actual macOS sandbox-exec child and its cat subprocess could not read synthetic files in three disposable denied roots or create files there. It could create output in a separate task directory. The same fixture checked the working-directory, environment and argv[0] refusals. `evidence.json` records the result and exact source hashes. The fixture compilation emitted the macOS 26 deprecation warning for addchdir_np; this fixture uses that compatibility spelling, not a production launcher change.

This check is solely filesystem-policy behavior. Synthetic paths are not authenticated root capabilities. It does not prove production startup, retained owner admission, descriptor exclusion, broker isolation, descendant completion, UI behavior or profile switching.

## Activation remains blocked

The supplied implementation puts runtime files and per-account memory/skills beneath its private home. Denying the private parent would break their legitimate use. A versioned trusted task/runtime layout must separate these files before activation; changing an environment variable or excluding the entire account directory is insufficient. Legacy state needs an explicit migration or truthful refusal, not silent relocation.

Filesystem denial is not IPC denial. Actual HTTP/WebSocket daemon authentication verifies installation-issued session credentials, and configured tools can use network transports. Brokered writes must be tied to the retained owner/generation and prevented after close. This batch has not established that all such routes meet that requirement. Do not infer IPC isolation from this sandbox result or add blanket network restrictions that break existing integrations.

The native spawn lane retains successful child creation even if libuv later returns a stdio-setup error. A direct child exit is not a complete descendant-drain observation. Unknown custody remains blocking.

The accepted app, current UI, active packaging and default-off protected startup are unchanged. No signing or release is included.
