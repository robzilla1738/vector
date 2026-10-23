# Actual native per-Environment preload component

Inactive production C++ component for the verified official Node26.5.0 embedding API. No protected producer, Node module or runtime was loaded; no compiler/build was started. Native and JS state2 quarantine remain unchanged. This is registration plumbing, not a new parent/cohort admission grant.

The native embedder owns an `AuxDevelopmentWorkerHost`, constructs `AuxNativeEnvironmentPreload` with that actual native shared owner, and passes `Callback()` directly to `node::LoadEnvironment`. The actual Node preload gets the Environment before userland and is copied by Node into child Workers. It checks that passed Environment equals the actual current V8/Node Environment, reserves a native record and installs actual environment cleanup before publishing fixed linked binding `aux_owned_native` (NAPI8). Its real NAPI callback looks up the actual Environment and calls `RegisterCurrentWorker(real_env,exports)` once. JS receives no host, handle, scope, registration method or replacement factory. Existing WorkerHost installs its separate cleanup before the protected producer; this component does not change that source.

Cleanup removes only its exact record and never closes sibling environments' shared process host. Explicit native `CloseAndDrain()` marks all its existing records closed before calling the actual host drain outside the registry mutex; retained inherited callbacks cannot reopen it. A callback racing close reaches the existing host's own closed-generation checks. Destructor quarantines the exact host on pending/untracked/reentrant outcomes; retained-host count is an unresolved-ownership observation. It never labels it drained. Wrong-process returns before touching inherited registry locks. No module initializer or standalone host main is introduced.

The binding remains lazy: preload registers its native consumer before supplied entry, while protected owner creation occurs only when the fixed binding is consumed. Future source-pinned loader pairing belongs after the still-unconditional first refusal. The constructor itself authenticates neither parent nor writer custody; a trusted embedding must actually own those before permitting protected production binding use. No embedding executable, authenticated parent handoff, fresh-authority consumer or native acceptance path is claimed here.

## Real official source and build preparation

Root verified the official source archive SHA256 `0e179470097e247a0c0769b77cc1359fc3e1baf0686df89bafe1fb48cb1887f4`, and byte equality of supplied runtime/config/relevant headers with official darwin-arm64 distribution. This supersedes the earlier provenance inventory's then-unverified upstream identity. The authoritative acquisition/equality evidence remains in root `out/aux-node-26.5.0-source` and is pinned by this proposal when available.

`build-static-runtime.py` is a real, unexecuted recipe: verify exact archive, extract into a fresh output, configure official source with `--enable-static --dest-cpu=arm64`, then `make -j2`. It then compiles the actual new preload component against the exact configured source headers and the existing WorkerHost header; this does not link or execute a host. It retains all built static dependency archives with hashes because `libnode.a` alone must not be assumed to absorb every dependency. It never edits supplied runtime bytes or dependencies, or links/executes the future protected host.

Future root-controlled invocation must be serialized:

```
python3 scripts/native-build.py python3 docs/integration/proposed/aux-native-environment-preload/build-static-runtime.py --archive /absolute/node-v26.5.0.tar.xz --output /fresh/isolated/output
```

Do not run until explicitly scheduled by root. Static archive generation is not identical-runtime parity proof; the embedding still needs a complete link recipe and must preserve ABI147/NAPI8, SEA/ESM/CJS entry contracts, snapshots/code cache, system-CA/signal options, dependency/pty behavior and all image-policy pins. The new source must be compiled and tested against real official APIs before integration. Current evidence is source/pins only, not callback/runtime acceptance.
