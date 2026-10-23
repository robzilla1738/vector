# Authenticated private-parent exclusion metadata

This is a source successor for the existing daemon WorkerHost and v4 signed-policy loader. It supplies the missing genuine installation-private-parent input to the separately proposed sandbox consumer. It does not change the accepted app, UI, ordinary state2 refusal, default-off cold hook, ciphertext, native authority, or old frozen build inputs.

The actual builtin `process._linkedBinding('aux_owned_native')` receives a nonwritable, nonconfigurable `captureExecPrivateParent()` method during native Worker registration. It accepts zero arguments. A plain Node process or old host does not have the method; consumers must refuse rather than substitute environment variables, command options, filesystem guesses, a JS provider object or the supplied addon's separate binding.

The callback checks the C++ image process before locks or V8 access, matches the actual current Node Environment/isolate to its retained Worker, and captures its live Owner under the existing lock. It validates current native Owner authority before and after the Swift query, then checks Worker admission, attachment and exact Owner identity again. No host mutex crosses Swift, signature verification or directory inspection. A reentrant publication trap cannot use the method before registration initialization completes. Errors are generic and disclose no path.

The new C ABI `AuxCopyAuthenticatedExecPrivateParent` only reads the authenticated policy's `canonicalPrivateParent`. It requires the real prepared daemon image, the actual signed/sealed v4 policy and embedded/rebuilt-PTY roles. It holds a nofollow/cloexec directory FD, requires the existing private-directory owner/mode/ACL checks, compares the current named entry to that retained device/inode, and revalidates signed image/policy identity before returning. It neither creates a home nor reads state/credentials. Native output is a bounded, absolute, singly NUL-terminated UTF-8 string. The callback returns a frozen object with readonly `format: 'aux.native.exec-private-parent.v1'` and `privateParent` fields.

## Integration

`integration.json` pins the two full source replacements. `source.patch` shows normal three-line-context differences for review; do not apply it over the immutable old source. Select these sources in a newly composed graph. The C++ source's private includes resolve against this successor directory. The public WorkerHost class header and six-function PTY header remain byte-identical to the current worker-close successor. Add the new C ABI header to the owned source input inventory. No new addon export, JavaScript API fallback or global adapter change is needed.

The daemon successor must compile the changed full WorkerHost and changed full Swift loader together, combined with the independent fresh-owner source replacements. This is a new object/source association, not the already-linked `450e4ad8...` executable. Root owns the coherent full link, source-stage/entry projection, exact-byte policy/package association and any later explicitly authorized protected runtime acceptance. The PEER child change is a Chromium TU, not a daemon object.

## Coverage and remaining barrier

This method provides exclusion metadata only. A readonly JS property does not make arbitrary same-Environment code trusted: it can import subprocess APIs or replace global accessors. The consumer's inherited sandbox still needs a mandatory native launch gate, authenticated browser-profile-root denial, and proof that no private writable descriptors are inherited. There is no browser-root producer in the current signed policy. No PID list, empty registry, direct-child exit or metadata response is a custody/drain receipt.

Denying this whole private parent may also deny packaged runtime/cache/workspace paths currently placed inside it. That is intentional refusal; do not carve out writable private subtrees. The next usable containment integration must separate immutable execution resources from private state and broker permitted state access under the actual owner/generation. In-process arbitrary-code Workers, other unmediated launch paths, old-profile live migration and crash-resumed writer custody remain separate work. Existing per-profile runtime leases and protected-state refusal remain intact.

## Focused evidence

`compile.py` is run only through `scripts/native-build.py`. It compiles the complete changed C++ host with actual Node26.5 headers/target flags, verifies the new Swift import, and typechecks the existing 46-source Swift graph with only the policy loader replaced. It checks frozen inputs before and after, hashes actual non-system dependencies, and never links, loads or executes a native artifact. Source compilation is not a signed-policy, concurrency or protected-runtime acceptance test.

The initial attempt lacked an explicit SDK sysroot and failed to find the SDK C++ standard library before source parsing; the failed receipt and compiler output remain in `evidence/initial-*`. The corrected recipe explicitly selects the installed SDK for both languages. No source checks were relaxed.

Actual serialized session `87180` finished with exit 0. The complete changed WorkerHost compiled, its new Swift import was present exactly once, and all 46 actual Swift source inputs typechecked. All 1445 frozen inputs and 84 actual C++ dependencies remained unchanged. Host object SHA256 `f81fca8f94ab152aba3f3fe87512ba7cf9bea986c35d224c73fe81577b6c3b32`. Retained output: `/private/tmp/aux-native-exec-parent-20261023-r2`. Only historical Swift deprecation warnings were emitted. No binary or sandbox command was executed.
