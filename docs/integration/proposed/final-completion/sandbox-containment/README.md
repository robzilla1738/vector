# Mandatory private-state denial: source seams and partial proposal

Worker baseline `bed8f5307`. This is a **nonintegrated proposal**, not acceptance of descendant custody, a sandbox runtime or profile switching. It changes only files in this directory. No global adapter, native producer, signed policy, accepted app, owner state, signing, command/helper, protected runtime or sandbox execution changed.

## What the actual supplied code does

The audited actual staged supplied daemon index is pinned by size/hash and offsets in `launch-inventory.json`. The static occurrence inventory is not an AST reachability proof. Its relevant routes are:

| Actual route | Existing boundary and handle shape | Consequence |
| --- | --- | --- |
| `prepareSessionSpawn` → `spawnExecProcess` → PTY | Runtime-use acquisition and release callback retained; optional `wrapSandboxCommand`; actual node-pty `.spawn` | Optional sandbox can be disabled. Current native PTY source uses CLOEXEC_DEFAULT and dup2 stdio, but a mandatory private-root policy is not selected by JS. |
| `prepareSessionSpawn` → `spawnSandboxed` → `spawnCommand` | Same optional wrapper; explicit ignore/pipe/pipe stdio; background process may be detached | Terminal and background routes share the seam. Process-group cancellation is not whole-descendant custody. |
| ripgrep search | Acquires the runtime-use release callback; calls wrapper then `execFileAsync$1` with bounded output and signal | Reuses wrapper seam, but native closure of unmapped descriptors remains a separate proof. |
| MCP stdio | `createTransport$1` constructs SDK StdioClientTransport; SDK `.start` directly calls cross-spawn | No existing terminal wrapper or runtime-use lease here. Actual caller sets stderr pipe. SDK defaults can otherwise inherit stderr. |
| MCP/Claude/other command discovery | `resolveShellPath` and command lookup run user shells with `-lic`/`-ic`, inherited environment | User RC code executes **before/outside** MCP/terminal wrapper. Wrapping only the final server is incomplete. |
| Credential model config | `resolveConfigValue` runs values beginning `!` through `execAsync$1` | Arbitrary configured shell command bypasses terminal/MCP wrappers; needs the same native-root boundary without logging its secret stdout. |
| Other helpers/installers | 27 `spawnCommand` occurrences plus direct spawn/exec aliases include fixed helpers, ffmpeg, CLI install shell, unzip and third-party SDK paths | Must classify and cover actual arbitrary-code routes versus authenticated fixed helper writers. A global JS replacement is not justified by these occurrences alone. |
| Agent REPL | QuickJS/WASM bridge with external-module rejection and HOST_DENYLIST | No demonstrated direct Node child_process import from ordinary guest code. Host bridge/marshalling and all exposed launch methods still require coverage; this audit does not invent a same-Environment escape. |

The supplied Seatbelt builder starts deny-default and then allows user-readable/writable roots (including `/` in full access), but `wrapSandboxCommand` immediately passes through when `sandboxEnabled` is false. Existing `deniedPaths` only names selected account secret files/backups, not the complete native private parent and real browser user-data roots. The optional denied list is not a mandatory ownership boundary.

## Implemented proposal and exact native seam

`source/mandatory-private-parent.cjs` accepts no root/path/authority override. At every wrap it queries only:

```
process._linkedBinding('aux_owned_native').captureExecPrivateParent()
```

The method must be an own non-writable/non-configurable function, called with zero arguments. Native lead's proposed return is exactly:

```
{format: 'aux.native.exec-private-parent.v1', privateParent: '<sealed canonical native parent>'}
```

It must capture the actual registered Node Environment, retained authenticated Owner/generation, and bracket the signed policy's parent copy with current admission/authority checks. No plain-Node shim, environment path, caller profile ID, ordinary `loadBinding()` native addon or caller-selected root is accepted. The existing ordinary aux-owned-native CJS wrapper deliberately does not expose this method; it belongs directly on the native builtin. Missing/old/retired/refused production bindings must fail.

The proposal surrounds the existing user sandbox command with a **mandatory outer** `/usr/bin/sandbox-exec` policy denying file-read*, file-write* and executable mapping of that captured parent, plus unlink of its ancestors. The parameter is passed as a separate argv element, never interpolated into policy source or a shell. Cwd is canonicalized and refused if inside private state, including a symlinked cwd. The old optional sandbox implementation stays intact inside this outer layer; its false/passthrough branch no longer bypasses parent denial. Its optional workspace `sandboxed` field is retained; the new internal `auxPrivateParentDenied` boolean is not an admission or drain receipt.

`source/propose-daemon-boundary.mjs` has two exact-one-count source hooks:

1. Rename the old wrapper to `wrapSessionSandboxCommand`, while retaining all original callers at the newly composed `wrapSandboxCommand`. PTY, non-PTY/background and rg callers retain their original runtime-use lifetime/release paths.
2. Compose the **actual SDK StdioClientTransport.start cross-spawn**, not merely the higher-level settings factory. Native-parent refusal occurs before process creation. It requires piped stderr and fixes all three stdio entries to fresh pipes. The supplied real factory already requests pipe; a different inherited stderr request now refuses rather than exposing a potentially private log descriptor.

The returned prelude must eventually be inserted after cold refusal/admission ordering, and the sidecar must be pinned in the fixed app-owned native resource directory. This directory does **not** alter staging, packaging, native sources or active startup.

## What is still missing—do not exclude these descendants from the writer set

- **Authenticated browser user-data/profile roots:** native lead currently has only the sealed Aux private parent. No producer supplies the actual browser roots/profile-path selection from authenticated browser state. Do not derive them from HOME, environment, JS settings or a guessed default. Denying one parent is partial containment.
- **Mandatory launch admission at the real spawn:** a successful native metadata read is not a retained launch lease. Owner/generation can retire between capture and spawn. The existing native PTY reservation/lease and other route admission need to cover that interval; this readonly result cannot release a writer or certify drain.
- **All arbitrary-code producers:** PATH/login shells, credential command interpolation, installers and applicable SDK/process paths still bypass these two proposed hooks. Each must be integrated through its real lifetime/permission caller. Do not blanket-restrict fixed authenticated helpers that legitimately perform brokered private mutations, and do not allow JS-selected exemptions.
- **Unmapped/inherited handles:** fresh stdio pipes address those explicit entries only. Actual bundled Node/libuv non-PTY descriptor closure needs pinned native evidence or enforcement. Existing PTY CLOEXEC_DEFAULT must remain tied to the actual helper/producer package. No writable private directory/file, shared memory, broker/IPC or native capability may be inherited into an untrusted executable. A filesystem policy is not proof of Keychain/IPC mutation denial.
- **Native per-profile lifetime:** original JS runtime-use counters protect runtime replacement, not automatically the current native Owner/generation or every external MCP server. Preserve existing counters and add the genuine retained native lifetime through actual spawn/exit/refusal. Never substitute a JS receipt.
- **Runtime/workspace split:** current runtime/cache and some possible workspaces can be below the private parent. The proposed deny intentionally blocks execution/access there. Any untrusted runtime/workspace that must remain available needs a trusted separately provisioned non-private location or brokered access. Do not carve credentials/profile subtrees out of the denial just to make commands run.
- **Non-macOS and actual OS behavior:** this consumer refuses outside macOS. No sandbox compile/apply/escape, symlink rename, inherited-FD write, nested sandbox or descendant inheritance acceptance ran. Actual macOS supported-policy behavior remains to be demonstrated under applicable authority.
- **Host JS exposure:** ordinary agent guest eval is separate QuickJS, but no proof here excludes every dangerous host bridge callback or a separately imported host Node module. A JS-only adapter is not a universal process security reference monitor.

## Focused evidence

`check.mjs` applies both source anchors to the actual staged index and runs whole-ESM syntax checking only. It evaluates the proposal CJS with an explicitly fake native builtin to check zero arguments, readonly descriptor requirement, missing binding/platform refusal, caller-root rejection and canonical private-cwd refusal. It runs the actual transformed MCP start method with a fake process factory to prove wrapped argv/three pipes and refusal before spawn. There is no genuine native producer or OS sandbox in this fixture; the receipt explicitly sets custody, browser-profile and inherited-handle acceptance false.

`source-evidence.json` records those checks and exact input SHA. `inventory.mjs` records the actual route landmarks and primitive occurrence counts. All files remain static proposals until the native producer, browser-root authority, launch/handle closure and remaining route coverage are integrated and reviewed together.
