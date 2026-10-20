# Autofill ownership and the two supplied Chromium migration modes

Documentation proposal only. No autofill SQL reader, destination writer, native route change or new profile implementation is proposed. The descriptor's five advertised data kinds do not establish which migration mode implements a category.

## Recovered caller ownership

A direct ARM64 `BL` scan of the pinned supplied image finds exactly two calls to migrator Start `042530c0`:

| Caller | Actual mode | Owner |
| --- | --- | --- |
| `0427baa0` | Literal `1` | Public extension Chromium import job. It clears the migrator's switch flag at `+0x13` before starting. |
| `080cc6d8` | Value loaded from callback capture `+0x28` | Original native importer WebUI selection chain: retained `0424f554` (`OnChromiumImportTargetSelected`) binds `0424f720`; that dispatcher passes callback `080cc4d8` into native selection `04267ec0`. |

The second call is evidence of a separately captured mode, **not proof that every chooser selection passes zero**. The exact chooser policy and per-selection mode remain separate recovery work. The scan covers direct calls, not hypothetical indirect/inlined Start copies.

Retained `042534e8` dispatches mode1 into live worker `04253e58`, using the current target profile path. The other branch reserves a new profile path and dispatches worker `04255868`. The extension API's full import must therefore retain mode1; silently replacing it with the new-target clone changes supplied ownership and profile behavior.

## Positive full-profile copy mechanism

Worker `04255868` resolves the selected source profile and invokes recursive copy helper `0425d438`, then updates copied Preferences/Secure Preferences and separately restores encrypted cookie/password data. The bounded helper enumerates files/directories, filters caches and extension-related paths, creates destination directories and copies files recursively. Its eight encrypted-file exclusions at `0x0e8a72b0..0x0e8a72f0` are:

- Cookies and Cookies-journal
- Extension Cookies and Extension Cookies-journal
- Login Data and Login Data-journal
- Login Data For Account and Login Data For Account-journal

`Web Data` is absent from that table and is not one of the decoded cache directory exclusions. Consequently ordinary top-level `Web Data` follows the generic file-copy path in this clone mode. This is a derived ownership conclusion from the complete helper and concrete exclusion table, not a recovered per-row autofill parser. It does not establish that mode1 imports autofill, that every autofill subrecord remains decryptable, or that the original descriptor accurately describes all paths.

## New-target lifecycle and Chromium155 mapping

| Supplied phase | Evidence | Genuine155 integration owner |
| --- | --- | --- |
| Choose new target path before loading it | `042534e8`, call at `04253750` to `07ac7730` | `ProfileManager::GenerateNextProfileDirectoryPath()` reserves the next slot and updates its Local State counter; its contract does not create the directory. The exact source function name is inferred from the caller/result and matching manager contract. |
| Prepare/copy on worker | `042534e8` binds `04255868` and reply `04257640`; worker calls recursive helper | Worker preparation must finish before a target profile's live databases open. It must not copy Web Data over an already loaded target. Full clone/copy/restoration is owned by L2; this proposal adds no alternate writer. |
| Load/create copied target | Result reply `04257640`; `0425784c` tailcalls `07ac6aec` with target path, initialized callback `04257878`, null created callback | `ProfileManager::CreateProfileAsync(path, initialized_callback, created_callback)` has this exact callback contract in155. This mapping is derived from the actual argument layout and manager role, not a recovered upstream symbol. |
| Handle initialized target | Null profile fails at `042579e8`; successful callback updates profile metadata/theme and calls `04258108` then `04258618` | Metadata, preferences and destination model/store owners operate after a real initialized Profile exists. No fabricated account/onboarding readiness is implied. Exact helper-by-helper155 ports remain unfinished. |
| Complete and optionally switch | `04258618` waits for destination cookie completion; `04258c80` requires both completion flags and separately checks the switch flag before scheduling callbacks `0425902c` / `04259100` | Preserve the completion transaction and explicit switching owner. New-target preparation is not permission to activate a profile early. Exact same-window activation callback port remains unfinished. |

Current155 `CreateProfileAsync` also defers during startup, queues a path pending destruction and returns null on invalid creation. A faithful owner must use these real callbacks rather than treating a directory copy as an initialized profile.

## Current integration and remaining gap

The current Aux `ImportService` writes into its current Profile and has no corresponding new-target lifecycle. Its temporary omitted autofill capability should not be repaired with an independently designed SELECT/schema parser or by rerouting extension mode1 into clone mode0. L2 owns positive live-worker/destination recovery; L4 owns discovery/profile selection. This ledger provides the mode boundary for that coherent integration.

The original native importer WebUI's target chooser, copied preference reconciliation, full target metadata, encrypted restoration and activation remain necessary before claiming its clone flow works. The supplied native WebUI must not be replaced with the retired independently authored category screen. Nothing in this audit authorizes reading source profiles or credentials, copying owner state, opening databases, creating a profile, setting preferences, invoking Keychain, building, signing or running a target.

## Evidence limits and verification

The arm64 image SHA is `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. `evidence.json` pins immutable supplied decompilations, observed native source snapshots, raw helper bytes, exclusion strings and direct caller addresses. The one REA target was a4560-byte raw slice at `0425d438`, not the full framework; its retained snapshot records unmapped external helper/string limitations. LLVM operands and independently decoded full-image string pointers anchor those external references. REA is closed.

Only static source/input and bounded replay observations are recorded. No implementation, compile, runtime or UI acceptance is claimed.

The final static recheck matched all seven supplied decompilation inputs and the exact arm64 image. The integrator changed `migrator.cc` during this capture, so the native snapshot hash for that file is historical and does not match the final shared source. `verification.json` records that drift explicitly; there is no native patch/replay baseline in this documentation slice.
