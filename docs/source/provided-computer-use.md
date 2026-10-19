# Supplied Computer Use helper: offline identity candidate

Source is the static `~/.aside/runtime-computer-use/Aside Computer Use.app`, version `1.26.1020`, build `1.26.1020.23`. Its arm64 Mach-O executable is pinned at SHA-256 `a17241d3149df77a8b05b17853053ca0318c7f78e6449800bafcfd3e14c97026`. `provided-computer-use-inputs.json` inventories all 11 bundle files / 2,876,377 bytes with hashes and modes. No helper launch, live process attachment, TCC grant, Keychain read, user data access or external communication was performed.

## Evidence and method

REA `open_binary` returned that exact path/format/architecture/hash. Subsequent overview/search requests did not yield usable results and were stopped; no completed REA decompilation is claimed. Static fallback uses `/usr/bin/nm -nm`, `/usr/bin/otool -tvV`, Mach-O load commands and exact file-byte inspection. The binary retains named Swift symbols. Bounded source-file inventory under the supplied Downloads and Blueprint roots did not find original Swift files for this helper; this is not a claim that no such source exists elsewhere. All locations below refer to this exact binary, not the older Blueprint helper.

`__TEXT` starts at VM `0x100000000`, file offset zero. `__DATA_CONST` and `__DATA` here retain the same VM-minus-base/file mapping. Relevant string pointers use Swift immortal-string representation plus Mach-O chained fixup bits. The [Swift project's StringObject implementation](https://github.com/swiftlang/swift/blob/main/stdlib/public/core/StringObject.swift) corroborates the separate count/flags and pointer representation, but it is not proof of the exact compiler version used by this binary. [Arm's instruction reference](https://documentation-service.arm.com/static/6245c734b059dc5ff9a8bdab) documents MOVZ; the pinned instruction changes are independently decoded by `otool` without execution.

## Viable bounded core-identity patch

`patchProvidedComputerUseIdentity(sourceBuffer,{browserBundleId,canaryBundleId})` in `scripts/lib/provided-computer-use.mjs` returns `{bytes,report}`. It accepts only the exact pinned source hash and distinct explicit Aux bundle IDs that fit the original slots. It does not write the source, launch, sign or install anything. It is deliberately named and reported as a **partial identity candidate**, not a finished branded helper.

| Role | Original string offset | Separate count words | Candidate value |
| --- | --- | --- | --- |
| Browser bundle | `0x1699b0` | `0x1885b8`, `0x1886d8` | `dev.aux.browser` (15 bytes) |
| Canary bundle | `0x1699d0` | `0x1885c8`, `0x1886e8` | `dev.aux.browser.canary` (22 bytes) |
| TCC re-exec marker | `0x15e020` | instructions below | `AUX_TCC_DISCLAIMED` (18 bytes) |

Original browser IDs are 22/28 bytes. Both occur in two static Swift sets: the named `CapturePolicy.browserSignalBundleIds` initializer uses the array at `0x188598`, while `CapturePolicy.init` has a second copy at `0x1886b8`. All four count/flag words change from the original `0xd000...0016`/`0xd000...001c` to counts 15/22 while retaining flags and pointer words. The adapter checks all four exact pointer-reference locations in the file-backed data segments; it does not relocate or modify chained-fixup pointers. `CapturePolicy.suppressionReason` uses set membership in the path producing `excluded-application`. This is static control-flow evidence, not an observed self-capture result.

The `ASIDE_TCC_DISCLAIMED` key has one pooled literal but two compiled lengths in `reexecDisclaimedIfNeeded`: lookup at file `0x11c4c` (`MOVZ x0,#20`) and assignment at `0x11eb8` (`MOVZ x2,#20`). Both become `#18`; the surrounding `MOVK #0xd000,LSL#48`, register, opcode, spawn/disclaim logic and branches stay unchanged. Updating only the pool bytes or one length would leave the read/write marker inconsistent.

All three ASCII literals receive NUL padding **inside the original allocation** and all their associated counts change. No string slot, section, load command, branch target or binary length moves. Nine patch records contain exact offsets, before/after hex, expected count and reason. The existing signature is necessarily invalidated; root must apply its ad hoc signing step after all branding work. The adapter does not strip or forge a signature and is not a shipping-ready helper.

## Remaining original branding: do not blind-shorten

The binary still contains these visible literals, each requiring its compiled lengths/expressions to be traced before replacement:

| Pool offset | Original literal / role |
| --- | --- |
| `0x15d5f0` | Permission error prefix mentioning enabling Aside Computer Use |
| `0x15df90` | Messages permission heading |
| `0x15dfb0` | Messages/Contacts permission explanation |
| `0x15e1a0` | Application display label |
| `0x1693e0` | Context Awareness menu title |
| `0x169440` | Quit menu item |
| `0x1698d0` | Context Awareness permission explanation |
| `0x169d40` | AX observer label |
| `0x16a250` | Input event-tap label |

For example, the Context Awareness title reference is at VM `0x100129db8`; its count is formed by `ORR x0,x28,#7` at `0x100129dd0`, rather than a standalone literal-length MOV. The Quit item at `0x10012aa74` forms its count with an ADD at `0x10012aa98`. A generic search/replace of every numeric 23 would corrupt unrelated values. This candidate leaves these strings unchanged instead of claiming a complete rebrand.

Three additional branded strings at `0x169980`, `0x16a1f0`, `0x16a2d0` are `at.studio.aside.computer-use.output`, `.input-state`, and `.browser-signal-state`. In the observed call chains they are **DispatchQueue labels**, not external notification channels: their construction calls the Dispatch queue initializer. They have multiple initialization references (2/3/2 in the disassembly) and still require all count expressions to be changed together. No notification protocol compatibility claim follows from these names.

Swift module/type/mangled symbol names such as `AsideComputerUse` remain internally consistent. They are not fixed-width display labels; renaming them without rebuilding or correctly updating Swift/Objective-C metadata is outside this bounded candidate. Resource icon and Info.plist substitutions are separate packaging edits. The source plist includes Automation/Contacts/Input Monitoring/Accessibility usage descriptions; those and the bundle identifier/executable/display name must be changed consistently. Source entitlements statically declare Apple Events and Contacts; inspecting them did not grant either permission.

## Artwork observations

- The Vault distribution's `assets/let-aside-sign-in-for-you-Cm1ENTVi.png` was visually inspected as a static asset. Its pixels show third-party service icons (for example Slack, Gmail and Notion); no Aside wordmark was visible in that illustration. Preserve its pixels. Its private filename alone is not a reason to replace or redraw the artwork.
- Computer Use `Resources/automation.png` is a generic system-style gears illustration. Preserve it.
- Computer Use `AppIcon.icns` and the two MenuBarIcon PNGs remain product-branding targets. Root can replace those with approved Aux art while retaining the original dimensions/template behavior. Other helper illustration pixels have not all been reviewed; no blanket replacement is authorized by this audit.

## Validation and next action

The focused static test verifies the entire source bundle pin, nine exact/nonoverlapping patch ranges, full before/after replay, unchanged binary length/pointers/bytes outside the allowlist, both static-set counts, both environment-key instruction counts, rejection of a wrong binary/non-Aux or oversized IDs, and `otool` decoding of the candidate MOV instructions. It writes only a nonexecutable disposable candidate and removes it. No supplied code is executed.

The candidate is technically viable for core identity changes under the observed Swift representation. Full helper branding remains blocked on the explicitly located prose/queue length-expression work and packaging icon/plist/signing edits. Real permission behavior, TCC responsibility, self-suppression, browser signals and unchanged helper workflows still require later disposable-profile acceptance within an explicitly authorized execution/grant scope. Until then, a plist-only clone or this partial candidate must not be described as the faithful finished Aux helper.
