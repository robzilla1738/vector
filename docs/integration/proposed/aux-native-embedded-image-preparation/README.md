# Native embedded daemon image preparation

Source-only pairing for the real static Node daemon executable. No modules, Security APIs or protected calls have executed; this source is not typechecked yet.

The sealed v2 policy must include `nativeHostLayout: "embedded-daemon"` and the daemon role. This finite layout places the runtime code inside the authenticated main executable; it does not permit the v1 runtime module to disappear from a v1 image graph. v1 policy shape/expected images remain unchanged. Neither caller paths, environment switches nor decoded JSON alone grant admission.

`AuxPrepareSealedNativeDaemonImages()` authenticates self, sealed policy, private parent and the actual current image subset, permits only the two fixed signed PDF/OS images to be absent, validates both actual file digests/signatures and the containing resource seal, then loads only those fixed paths. Actual handles remain permanently owned even on partial failure. A one-shot process-bound latch prevents reentrant/repeated load; no mutex spans dlopen. Full image validation and unchanged host/policy identity are required before success. This prepares code images only; actual peer, filesystem custody and installation authority remain separate mandatory producers.

The new executable must call this before the existing full-policy parent/entry/service producers. Final packaging must use the v2 sealed policy and matching reviewed signed module bytes. Current unsigned PDF/OS pins are historical source-build pins, not valid future signed bytes; final exact-byte review must update their identities consistently. Accepted app/UI and fallback refusal are untouched.

## Actual load-path custody requirement

Before any dlopen, the code now requires an unprivileged process and holds nofollow FDs for both complete absolute paths: every ancestor/directory/module is root-owned, has no group/other write and no nonempty ACL. It revalidates actual retained entry identity before loads and at completion. This prevents the app user from replacing a checked path before constructors run; a post-load digest alone did not provide that guarantee. Root/privileged installer is trusted. A controlled fresh root-owned installation must establish this namespace; simply chowning previously user-writable files does not prove absence of old writable FDs.

This intentionally refuses today's user-owned development app, Downloads and commonly admin-writable Applications paths. No privileged installation is authorized or performed by this source change. That concrete installation/exact-byte signing review remains a later prerequisite; no claim of current runnable acceptance.
