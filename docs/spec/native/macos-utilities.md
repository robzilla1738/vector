# macOS utilities addon (`aux-macos-utilities.node`)

Status: **implemented** by `apps/macos-utilities-addon` (Swift with a C Node-API shim), checked against the supplied addon by `apps/macos-utilities-addon/tests/parity.test.mjs`. **Not shipped:** builds with this image are refused at startup (section 7), so releases keep the supplied image.

Reference artifact: the supplied image's fixed Developer ID copy `out/live-inputs/completion-20261026/release-addons-a1/aux-macos-utilities.node` (409,712 bytes, sha256 `66a61601…c4c6`, identifier `dev.aux.browser.macos-utilities`, team `9F2JXY8TCK`), which builds through 118 ship. The parity test keeps comparing against it. The release image is Aux's: `release-addons-a2/aux-macos-utilities.node` (163,344 bytes, sha256 `10bdcb53…1c5b`).

Evidence tags: **[O]** observed by loading the supplied addon in plain Node 26 against throwaway files in a temp directory, or read from build 99 files; **[S]** read from the reconstructed source the supplied image was built from (`docs/integration/proposed/aux-native-macos-utilities/source/`, `docs/integration/proposed/aux-macos-utility-node/source/`); **[D]** read from the supplied daemon JS (the SEA of `out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon`). The Aux implementation was written from this page, not from machine code.

## 1. Image

| | Supplied | Aux |
| --- | --- | --- |
| Format | Mach-O arm64 dylib, Swift + C++ | Mach-O arm64 dylib, Swift + C |
| Deployment target | macOS 13.0 | macOS 15.0 |
| Size | 409,712 (signed) / 393,720 (unsigned) | 163,344 (signed) / 145,912 (unsigned, linker ad-hoc signature) |
| Links | AppKit, QuickLookThumbnailing, ImageIO, Foundation, libobjc, libc++, system Swift runtime | the same, without libc++ |
| Exports | `napi_register_module_v1`, `node_api_module_get_api_version_v1` (Node-API 8), `AuxMacUtilityCloseAdmissionAndDrain`, `AuxMacUtilityPendingEnvironments`, plus about 100 Swift and C++ symbols nobody uses | the four named ones only |
| Node internals | uses `node.h` and V8 (`node::GetCurrentEnvironment`) to cross-check the Environment | pure Node-API, so not tied to one Node ABI |

[O] `nm -gU`, `otool -L`, `otool -l`.

## 2. JavaScript surface

`require()` returns a plain object with one own property, `run`: not writable, not enumerable, not configurable (`napi_default`). `Object.keys()` is empty. `run.name` is `run`, `run.length` is 0. [O]

`run(command, input)` is synchronous and returns JSON **text**. Argument handling, in order [O]:

1. No arguments: throws `TypeError: run(command, input) requires a command`.
2. `command`, or `input` when given, is not a string (including `undefined` and `null`) or contains U+0000: throws `TypeError: Native utility command and input must be strings without NUL`. Nothing is coerced. Extra arguments are ignored. A lone surrogate is passed on as U+FFFD.
3. Omitted `input` means `""`.
4. The Environment's instance is closed (section 5): throws `Error: Native utility admission is closed`.
5. A second call while one is running in the same Environment: throws `Error: Native utility call is reentrant` (not reachable from JS, since `run` never calls back into JS).
6. A command other than the five below returns `{"error":"Unknown native macOS utility command"}`.

None of the thrown errors has a `code`. Recognized commands never throw; failures come back as `{"error": "<message>"}`.

`input` is parsed as JSON; anything that is not a JSON object (empty, malformed, an array, a bare string) is treated as `{}`. Fields are read with exact types: a number where a string is expected counts as missing, and `bundleIds` must be an array of strings only. [O]

Output is `JSONSerialization` text: `/` is written as `\/`, and **key order is not stable** (it follows the Swift dictionary's per-process hash seed). Callers parse it; compare parsed values, not text. [O]

## 3. Commands

The daemon reaches these through `runNativeHelperCommand` (synchronous, main thread) or `runNativeHelperCommandAsync` (a `worker_threads` Worker that requires the addon, calls `run`, posts the text and is terminated). [D]

| Command | Input | Result | Caller [D] |
| --- | --- | --- | --- |
| `list-open-apps` | `filePath`, optional `iconDirectory` | `{apps:[{appName, appPath, default?, iconPath?}]}` | file "Open with" menu (`listOpenApps`, sync) |
| `app-icons` | `bundleIds: string[]`, `iconDirectory` | `{icons:{<bundleId>: <png path>}}` | Context Awareness app icons (`resolveAppIcons`, sync) |
| `copy-file` | `filePath` | `{success:true}` | "Copy file" (`copyFileToClipboard`, sync) |
| `open-with` | `filePath`, `appPath` | `{success:true}` | "Open with…" (`openFileWithApp`, sync) |
| `generate-thumbnail` | `filePath`, `iconOutputPath`, `thumbnailOutputPath` | `{success, thumbnailGenerated, iconGenerated}` | file previews and HEIC→PNG in the read tool (async worker) |

### 3.1 `list-open-apps`

1. Missing `filePath`: `list-open-apps requires filePath`. Path absent on disk: `File not found`. [O]
2. If `iconDirectory` is given, create it with intermediates (errors ignored). [S]
3. Ask LaunchServices for every app that can open the file and for the default app. Each app is reduced to its standardized path; duplicates are dropped; the default is appended if the candidate list lacked it. [S]
4. Each row: `appName` (Info.plist `CFBundleDisplayName`, else `CFBundleName`, else the bundle's file name without extension), `appPath`, `default: true` on the default app only, and `iconPath` when an icon directory was given and the icon could be written (3.6). [S][O]
5. Sorted: the default first, then by `appName` with a localized case-insensitive compare; ties keep LaunchServices order. [S][O]

A directory works as `filePath` (it exists). [O]

### 3.2 `app-icons`

Missing or mistyped `bundleIds` or `iconDirectory`: `app-icons requires bundleIds and iconDirectory`. Otherwise create the directory, then for each id that LaunchServices resolves to an app, write its icon (3.6) and map the id to the path. Ids that don't resolve, or whose icon can't be written, are left out. An empty list gives `{icons:{}}`. [S][O]

### 3.3 `copy-file`

Missing `filePath`: `copy-file requires filePath`; absent: `File not found`. Clears the general pasteboard and writes the file URL. `Failed to copy file to clipboard` if the write is refused. [S]

### 3.4 `open-with`

Missing either field: `open-with requires filePath and appPath`. `File not found` is checked before `Application not found` (both are plain existence checks). Opens the file with that app through `NSWorkspace.open(_:withApplicationAt:configuration:completionHandler:)` with a default configuration and waits up to **5 s** for the completion handler: an error gives its `localizedDescription`; no answer gives `Timed out opening file with application`. [S][O]

### 3.5 `generate-thumbnail`

Any of the three paths missing: `generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath`. Otherwise, one after another, each QuickLook request waiting up to **3 s** and cancelled on timeout [S]:

1. Thumbnail: `QLThumbnailGenerator` request, 256×256 pt at scale 2, representation `.thumbnail`, not icon mode → PNG at `thumbnailOutputPath`.
2. Icon: 128×128 pt at scale 2, icon mode, `.thumbnail`; if that fails, the same with `.icon`; if that fails, the Finder icon for the path drawn as in 3.6 at 128 pt (256×256 px) → PNG at `iconOutputPath`.

A QuickLook PNG is written with ImageIO (`public.png`, one image, no properties) after creating the parent directory. `success` equals `iconGenerated`. The input need not exist: a missing file still gets the generic document icon, so `{success:true, thumbnailGenerated:false, iconGenerated:true}`. Unwritable outputs give all three `false`. A QuickLook answer that arrives after the Environment closed writes nothing. [O][S]

### 3.6 App icon files

`<iconDirectory>/<name>.png`, where `<name>` is the app's bundle identifier (else its file name without extension) with `/` replaced by `_`. An existing file of that name is returned as it is and never redrawn. Otherwise the `NSWorkspace` icon for the app path is drawn into a 64×64 px RGBA device-RGB bitmap whose size is 32×32 pt, with high interpolation, and written as PNG. The path is returned only if the file exists afterwards. [S][O]

## 4. Threads and blocking

Every command runs on the calling JS thread and blocks it, including the QuickLook and open-with waits (up to 3 s per QuickLook step, 5 s for open-with). Completion handlers arrive on system queues; the waiting thread needs no run loop. [S]

## 5. Lifecycle and the native shutdown ABI

Each Node Environment that loads the image (the main thread and every worker) gets its own instance. Each command and each pending QuickLook or open-with request is a job; a request's job ends only when macOS answers it, even after a timeout. [S][O]

- **Environment cleanup** (worker exit or terminate, process exit) closes that instance. If no job is in flight its state is released; otherwise it stays held until the requests answer and a later close sees it drained.
- `int32_t AuxMacUtilityCloseAdmissionAndDrain(void)`: closes every instance and the image for good. Returns 0 when everything drained, 1 when some request is still in flight, -1 when called in a forked child of the loading process. After it, `run` in a live Environment throws `Native utility admission is closed` and a new Environment that loads the image throws `Mac utility Environment attachment failed`. The supplied image could also return 2 ("untracked") for test boundaries; the real one never does. [O][S]
- `uint64_t AuxMacUtilityPendingEnvironments(void)`: the number of instances still held (live Environments, plus closed ones with requests in flight); `UINT64_MAX` in a forked child. [O][S]
- The image takes an extra `dlopen(RTLD_NOLOAD)` reference on itself so a worker's teardown never unmaps code a late callback still needs. [S]

Observed sequence, identical for both images: 0 before load, 1 after the main thread loads, 2 with a live worker, 1 after the worker exits, close → 0 with 0 pending. [O]

The build 99 daemon executable contains both symbol names, so its native host looks them up on the loaded image. [O]

## 6. Parity check

`node --test apps/macos-utilities-addon/tests/parity.test.mjs` loads both images in one process (and each in a child process for section 5) and compares parsed results, thrown errors and output file bytes. All seven tests pass, and a build perturbed to reverse the app order fails them.

Covered: the export shape; 40 argument and validation cases across all five commands (section 2 and every error string in section 3); `list-open-apps` for a text file, a PNG and a directory, with and without icons, icon PNGs byte-identical; `app-icons` for Finder, Safari, TextEdit, Preview and an unknown id, plus the reused-file rule; `generate-thumbnail` for PNG, HEIC, text, a missing file and unwritable outputs, every output PNG byte-identical; the worker-thread path; and the section 5 lifecycle.

Not tested, and why:

- `copy-file` success: it would replace the clipboard of the person using this Mac. Only its validation and `File not found` are compared.
- `open-with` success and its error and timeout texts: they launch or ask LaunchServices to launch an app. Only validation, `File not found` and `Application not found` are compared.
- A QuickLook or open-with request still in flight at close (`AuxMacUtilityCloseAdmissionAndDrain` returning 1): needs a stalled system service.
- A forked child (-1, `UINT64_MAX`): Node can't fork with the addon loaded.
- Reentrancy and `Native utility returned no output`: not reachable from JS.
- The supplied image's V8 cross-check (`Native utility Environment mismatch`, and refusing a second attach in one Environment): not reachable through `require`; the Aux image leaves it out.
- Running inside the real daemon (hardened runtime, Developer ID signature, sandbox, TCC): needs a launch (section 7).

## 7. Integration

**Open, 2026-10-30:** builds 120 and 121 (`release-addons-a2`, `release-state-root-a7`, the a2 browser pin) never reach a window. The daemon stops with `Aux native daemon refused at bootstrap (status -1)` about 2 seconds in, and the browser reports `paired daemon receipt`. Build 122 is the same source with `release-addons-a1`, `release-state-root-a6` and the a1 browser pin, and it starts, so the swap is the cause; the rebuilt runtime is not (build 121 left it out and still failed). Ruled out: pins, sizes in the compiled daemon, signing leaf, identifier, policy JSON, Node-API imports. Untested differences from a1: the `@rpath` install name and the smaller export and Swift library list. Debugging it needs a build of the daemon that reports the refusal's cause. The steps below are what the a2 attempt changed.

Done for the release path (relink `release-state-root-a7`, sources in `docs/integration/proposed/completion-20261026/runtime/release-addons-a2/`). New bytes mean every pin changes:

1. **Fixed copy:** `apps/macos-utilities-addon/build.sh` output signed once with Developer ID, hardened runtime, timestamp and identifier `dev.aux.browser.macos-utilities`, kept with `pins.txt` in `release-addons-a2`. `scripts/release/assemble.py --release-addons` copies both addon names from that one directory, and a re-signed timestamp changes the hash, so never re-sign it.
2. **`AuxFreshBootstrapPolicy.json`** `macOSUtilitiesModule`: text, updated by assembly's `repin_cascade` (sha256 and bytes).
3. **`aux-daemon`:** `AuxFreshBootstrapMacUtilitiesIdentity.releaseSha256`/`releaseBytes` in `daemon-policy.swift`, and `kRelease` plus the two size checks in `utility-lifetime.cc` (the loaded-image capture), rebuilt with the recorded `clang++` command (which reproduces the old object byte for byte from the old source) and relinked with `scripts/candidate/relink_daemon.py`. The development pair `e7204915…`/409,728 stays, for `--identity development` builds of the components copy.
4. **`Aux Framework`:** the same two constants in `chrome/browser/aux/native_peer_policy/AuxFreshBootstrapPolicy.swift`. The browser refuses the a1 release copy from now on, so a build needs a2 and a7 together.
5. **`native/aux-macos-utilities.cjs`** still pins the unsigned 393,720 / `7aff7611…` image and is not on the shipped route: the daemon reaches the module through `process._linkedBinding('aux_macos_utilities_builtin')`, whose host loads the image itself (`docs/integration/proposed/completion-20261026/runtime/fixed-builtins/README.md`). Unchanged, and it refused every shipped copy before too.
6. **Staging pins** (`docs/integration/proposed/aux-macos-utility-integration/{artifact.json,inputs.json}`, `vendor/provided/aux-macos-utility-stage.mjs`, `scripts/lib/provided-stage-inputs.mjs`): the record of how the supplied image was staged in the predecessor pipeline, which assembly does not use. Unchanged.
7. **`aux.development.host.policy.v4`** is a name in that staging manifest. No such list exists in the daemon executable or the release path, so there was nothing to update.
8. The daemon host looks up `AuxMacUtilityCloseAdmissionAndDrain` and `AuxMacUtilityPendingEnvironments` (section 5); the Aux image exports both with the same contract. Its eight unresolved `napi_*` symbols are all exported by the daemon executable.

Not yet checked: the image inside the running daemon (hardened runtime, sandbox, TCC, `copy-file` and `open-with` success, the section 6 gaps). That needs a launch of a build carrying a2 and a7.
