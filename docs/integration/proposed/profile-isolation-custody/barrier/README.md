# Native host path write restrictions — incomplete external writer coverage

This source successor reduces direct native messaging host write access to the actual admitted Aux data/cache paths without changing UI or issuing a clean-restart certificate. It uses the existing Apple-signed `/usr/bin/sandbox-exec` before exec of the original host, preserving the full original argv after the program (including switches, literal `--`, spaces and empty arguments), current directory, stdin/stdout pipes and launch custody. Descendants inherit these OS restrictions. A missing executable or rejected policy fails the host launch; there is no unrestricted fallback.

The selected native registry constructs the policy only from its retained, acknowledged BrowserPrivateRoots and current native Owner generation. It duplicates/revalidates both actual root FDs, resolves their physical paths, checks child/ready state and rechecks registry association before returning a command. Callers supply the host command only, never protected roots, generation or an authorization Boolean. Missing, closed, unadmitted or stale native authority refuses launch. The policy denies writes/link creation below both roots, and prevents the sandboxed host renaming their ancestors. Paths enter SBPL as parameters rather than interpolated policy code.

**This is not object-level root custody.** A deliberately pre-existing hardlink outside the protected tree bypassed the subpath rule and changed a file inside the tree. The fixture records that bypass as an expected limitation, not a passing security claim. External unsandboxed services reachable via IPC, app launches through service brokers, already-existing aliases and other untracked writers remain outside this guarantee. All external-writer coverage stays false. No browser root is reopened, no marker is adopted, and no writer-drain lease is released.

## Verification

`check_policy.py` extracts the actual source SBPL template and uses existing Apple-signed sandbox-exec/sh/ln/mv on disposable roots. Data/cache writes, symlink writes, hardlink creation, root rename, ancestor rename and child-process writes are denied. Unrelated scratch writes and stdin/stdout messaging still work. The existing-hardlink bypass is confirmed. No native fixture executable was built or signed. This does not verify the real 1Password host, its app handshakes, its updater or every third-party native host; those remain compatibility checks.

`compile.py` compiles the actual selected registry and native messaging launcher translation units against the paired graph, producing only disposable objects. It is queued behind the active build through the native build lock; compilation readiness must be read from its eventual receipt, not inferred from policy checks.

## Integration

Stage `native.patch` only after the active frozen browser build reaches a safe boundary. `sources.json` identifies predecessor paths and exact before/after hashes. This replaces the restart lane's AuxSelectedStateHome.cc, recovery lane's paired header, and messaging lane's launch_context_posix.cc; all earlier child/messaging evidence APIs and custody records remain required. Add the messaging target dependency on the native selected-registry boundary through the integrator-owned GN graph if the existing target graph does not already expose it. Use normal dependency rebuilding and preserve the accepted app. No active clone has been changed by this lane.

Apple's sandbox-exec dependency is explicit; this proposal is a bounded local defense, not a promise that every future OS provides that tool. A durable product solution still needs a supported mandatory object/capability boundary for every writer, plus complete process/authority association before admitted-root reopen can be enabled.

A follow-up corrected the initial use of `CommandLine::GetArgs()`, which would have omitted host switches. The successor iterates `host.argv()` after its program. The Apple-signed shell check confirms switches, separator ordering, spaces and empty arguments survive the wrapper. This checks OS invocation plus the source loop shape; it is not a live extension-host compatibility result.
