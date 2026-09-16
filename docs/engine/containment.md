# Production containment (VEC-002)

Production profile (`VECTOR_ENGINE_PROFILE=production` or `VECTOR_ENGINE_STRICT=1`):

- `ve-host` is required. Missing binary, protocol mismatch, or sandbox failure is `backend_unavailable`. Untrusted content does not run in-process.
- `ve-host` applies the OS sandbox before serving. Failure exits 2.
- Inherited FDs above stderr are closed. Env vars that look like secrets are dropped.
- macOS: `sandbox_init` deny-default, no `network*`, no `process-fork` / `process-exec`.
- Linux: `NO_NEW_PRIVS` + seccomp kill on socket/connect/bind/listen/accept/execve/fork/ptrace. This is not a complete kernel sandbox; it is the current floor.
- Unsupported OS: `apply()` returns an error (fail closed).

Developer profile (default for unit tests):

- `VECTOR_ENGINE_SANDBOX=0` skips the OS sandbox (used by `ve-host` IPC tests).
- `isolation: inProcess` or `auto` may run on an engine thread.

Network:

- Default policy blocks loopback, link-local, RFC1918/ULA, and `file:`.
- Fixture servers must be allowlisted (`127.0.0.1:4810` etc.). There is no global permissive default.
- Agent-initiated HTTP needs `allowAgentEgress` or `agentAllowlist`.
- Userinfo is stripped. Resolved IPs are rechecked (DNS rebinding).
