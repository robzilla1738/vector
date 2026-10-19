# Supplied Computer Use helper: faithful static adaptation

The input is the static `~/.aside/runtime-computer-use/Aside Computer Use.app`, version `1.26.1020`, build `1.26.1020.23`. Its arm64 executable is pinned at SHA-256 `a17241d3149df77a8b05b17853053ca0318c7f78e6449800bafcfd3e14c97026`. `provided-computer-use-inputs.json` pins all 11 files / 2,876,377 bytes and their modes. No helper launch, live attachment, TCC grant, Keychain read, owner Messages access or external communication was performed. This updates the earlier partial identity checkpoint; it does not establish runtime acceptance.

## API and staging

`scripts/lib/provided-computer-use.mjs` exports:

- `verifyProvidedComputerUse(appRoot)`: verify the entire pinned file set, sizes, modes and hashes; reject symlinks, special files, added files and paths outside the root.
- `patchProvidedComputerUseIdentity(sourceBuffer,{browserBundleId,canaryBundleId})`: return `{bytes,report}` for the exact pinned binary. Browser IDs must be distinct explicit `dev.aux.*` identities fitting the original string slots.
- `stageProvidedComputerUse({sourceRoot,outputRoot,identities:{browserBundleId,canaryBundleId,bundleId,executableName?}})`: stage the pinned bundle into a new absolute output root. The parent must exist. Roots must be disjoint; existing outputs are refused. `bundleId` must be explicit `dev.aux.*`; `executableName` is fixed to `aux-computer-use` (also the default), matching the checked usage string.

Staging preserves all 11 bundle files and modes, renames only the executable path, patches the binary and Info.plist, and substitutes canonical `assets/brand/Aux.icns` plus MenuBarIcon16/32. It verifies artwork against `assets/brand/inventory.json`. Six files remain byte-identical: both original signature-resource files and the four generic illustrations. The old signature is invalidated; root must ad hoc sign after staging. The returned version1 report includes per-file source/output hashes, paths, modes, change kinds and plist/art anchors, plus every binary patch's exact offset/before/after/count/reason. The stager does not sign or execute anything and does not write an extra report into the bundle.

`productionReady:false` and `requiresAdHocResigning:true` are explicit. Actual TCC responsibility, permission UI, browser self-capture suppression and helper workflows remain unobserved.

## Static evidence and preservation

The earlier REA `open_binary` identified the exact path/format/architecture/hash; later overview/search yielded no usable decompilation. No completed REA decompilation is claimed. This work uses static `/usr/bin/otool -tvV`, `/usr/bin/nm -nm`, Mach-O layout and exact file bytes. Supplied code was never executed.

`__TEXT` starts at VM `0x100000000`, file offset zero; relevant data here retains the same VM-minus-base/file mapping. Swift immortal strings carry separate count/flag and pointer words. The [Swift StringObject implementation](https://github.com/swiftlang/swift/blob/main/stdlib/public/core/StringObject.swift) explains that representation; exact compiler version remains unknown. [Arm's instruction reference](https://documentation-service.arm.com/static/6245c734b059dc5ff9a8bdab) describes the instructions. The actual before/after words are independently decoded by `otool`.

`provided-computer-use-patches.json` records all **44 nonoverlapping ranges** for `dev.aux.browser` / `dev.aux.browser.canary`, yielding candidate SHA-256 `af5b2731c50a848c248a976b800ebd91d4ced91ccdf98eadb4d101a72bf9786c`: 17 string slots, four static Swift count words and 23 instructions. ASCII/UTF-8 replacements are NUL-padded only inside their original slots. Counts use UTF-8 byte lengths, including arrows in the permission error. Section sizes, pointers, branch targets, load commands and binary length do not move. All bytes outside the listed ranges remain exact; `nm -nm` output is identical before/after.

Swift module/type/reflection/mangled names such as `AsideComputerUse`, compiled source paths, Objective-C metadata and internal ABI symbols remain consistent. Those are not user-facing branding. No generic binary-wide substring replacement is used.

## Browser identity and TCC marker

| Role | String offset | Count locations |
| --- | --- | --- |
| Browser bundle | `0x1699b0` | data `0x1885b8`, `0x1886d8` |
| Canary bundle | `0x1699d0` | data `0x1885c8`, `0x1886e8` |
| `AUX_TCC_DISCLAIMED` | `0x15e020` | instructions `0x11c4c`, `0x11eb8` |

The original browser IDs (22/28 bytes) occur in two static sets: `CapturePolicy.browserSignalBundleIds` at array `0x188598` and `CapturePolicy.init` at `0x1886b8`. All four counts change (default Aux IDs15/22) while preserving `0xd000...` flags and the original chained-fixup pointers. The adapter checks the complete four-reference pointer locations. `CapturePolicy.suppressionReason` uses membership in the path producing `excluded-application`; this is static evidence, not an observed suppression result.

The marker has both lookup and assignment counts20→18. Spawn/disclaim logic, branches, registers and flags remain intact.

## Prose and exact count expressions

All nine previously identified visible strings replace only `Aside` with `Aux`:

| String offset / role | Original→Aux UTF-8 count | Instruction locations |
| --- | --- | --- |
| `0x15d5f0` Automation permission error | 149→147 | MOV `0x1e90`, `0x2e18` |
| `0x15df90` Messages heading | 26→24 | ADD `0xf554` |
| `0x15dfb0` Messages/Contacts explanation | 107→105 | ADD `0xf55c` |
| `0x15e1a0` app display fallback/tooltip | 18→16 | MOV `0x15204`, `0x12ad54`; compensated shared expression below |
| `0x1693e0` Context Awareness menu title | 23→21 | ORR→ADD `0x129dd0` |
| `0x169440` Quit menu item | 23→21 | ADD `0x12aa98` |
| `0x1698d0` Context permission explanation | 88→86 | ADD `0x131a44` |
| `0x169d40` AX observer name | 30→28 | MOV `0x13ca20` |
| `0x16a250` input event-tap name | 34→32 | MOV `0x1474cc` |

Shared-base subtleties are handled explicitly:

- Messages heading/detail ADDs use unchanged `0xd000…0010` base16. Immediates10/91 become8/89; the base also serves other strings and stays intact.
- Context menu title uses unchanged base16 in `x28`. ORR `#7` originally produces23. Logical immediate5 is not encodable for A64 ORR; replacing the single instruction with ADD `#5` produces21 while preserving flags/registers and surrounding instructions.
- Context permission explanation similarly uses unchanged base16 in `x26`; ADD72 becomes70.
- The app-display fallback count in `x23` is shared with the unmodified 19-byte `CFBundleDisplayName` key. Its initialization18 becomes16, and **only** the key expression at `0x15238` changes ORR1→ADD3, retaining key count19. Dynamic name success paths overwrite `x23` normally. Renaming only the fallback pool or changing the initial count without compensating the key would break the fallback lookup.
- `Aside Computer Use\0` also occurs as the suffix of the original Quit string at `0x169445`. The adapter checks both source occurrences but patches the entire Quit slot separately; ranges never overlap.

The final bounded string-pool audit found two additional non-ABI literals, also adapted:

| String offset / role | Change | Count patch |
| --- | --- | --- |
| `0x15d790` missing-command usage | executable `aside-computer-use`→`aux-computer-use`, 71→69 bytes | ADD `0x1f60`, shared base18 unchanged; immediate53→51 |
| `0x15f100` send-attachment staging directory | `Library/Messages/.aside-send-staging`→`Library/Messages/.aux-send-staging`, 36→34 bytes | MOV `0x25270` |

The staging directory is constructed under `FileManager.homeDirectoryForCurrentUser`. The change prevents the Aux clone using the old product's staging name. It does **not** authorize real Messages access or prove the runtime path is confined to disposable data; later helper execution must explicitly account for that capability.

## Queue labels

The three `at.studio.aside.computer-use.*` strings become `dev.aux.computer-use.*`, with all observed constructor references updated:

| String offset / suffix | Original→Aux count | MOV locations |
| --- | --- | --- |
| `0x169980` output | 35→27 | `0x1339b8`, `0x133fbc` |
| `0x16a1f0` input-state | 40→32 | `0x146b70`, `0x146e30`, `0x1471a4` |
| `0x16a2d0` browser-signal-state | 49→41 | `0x14b7a4`, `0x14b9e0` |

The referenced call chains invoke DispatchQueue construction. These are queue labels, not evidence of a distributed notification protocol. Original queue construction/QoS/control flow stays intact.

## Plist and artwork

Info.plist preserves XML formatting/key order and every non-brand value. Checked replacements set explicit Aux bundle ID, `aux-computer-use`, both app names and all four permission descriptions (including both product mentions in Apple Events text). Existing version/build, minimum OS, LSUIElement/instance behavior and usage-description meanings remain unchanged. No entitlement or permission is added.

The canonical supplied arch SVG drives AppIcon.icns and16/32 menu templates. All icon substitutions are recorded with hashes. Generic `automation.png`, `contacts.png`, `full-disk-access.png`, and `imessage.png` remain byte-identical. Earlier Vault illustration inspection found only third-party Slack/Gmail/Notion icons in `let-aside-sign-in-for-you-Cm1ENTVi.png`; those pixels likewise remain unchanged.

## Verification and remaining acceptance

Focused tests pass against the actual static source: complete input pin, exact44-range replay, unchanged binary length/pointers/bytes outside the allowlist, all23 changed instructions independently decoded by `otool`, unchanged full `nm` symbol output, invalid identity/input rejection, complete11-file staging, canonical artwork hashes, plist semantic preservation, exact file modes, disjoint-root and overwrite refusal. Test candidates live in disposable directories, are not run and are removed.

No original helper workflow, TCC prompt/grant, self-suppression, capture, Messages/Contacts operation or notification delivery has been tested. No restricted OS grant has been requested. Root must sign the staged helper and perform separately authorized runtime acceptance before shipping claims. Static branding completion and faithful byte preservation do not establish `productionReady`.
