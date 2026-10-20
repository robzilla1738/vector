# Supplied Mac Firefox registry capability

This immutable proposal restores the supplied Mac Firefox `services_supported` mask in Aux builds. Apply only with the real Mac password reader, utility result transport, host metadata and public Firefox owner. This proposal does not implement those prerequisites or establish runtime acceptance.

The original arm64 worker is `0x7821194..0x782138c` (end exclusive), pinned in `source-evidence.json` and the bounded LLVM listing. The earlier public-owner proof started at `0x78211b0`, inside this same function; this slice includes its complete prologue. It calls `GetFirefoxDetails` with the empty Mac install identifier at `0x7821214`, then visits that vector in order, advancing each detail by `0x30` at `0x7821364`.

| Original instruction | Behavior retained in Chromium 155 |
| --- | --- |
| `0x7821334..0x7821338` | Skip an empty detail path. |
| `0x782133c..0x7821358` | Start version at zero, call `GetFirefoxVersionAndPathFromProfile`, admit version >=48. Unknown/older versions remain excluded. |
| `0x78212a4`, `0x78212d0..0x78212e8` | Use the real importer name helper, detail name and exact source path; type is Firefox (`2`). |
| `0x78212ec..0x7821308` | Use the profile-derived application path when the source application path is empty. |
| `0x7821270`, `0x782130c` | Store mask `0x4b`: HISTORY (`1`), FAVORITES (`2`), PASSWORDS (`8`), AUTOFILL_FORM_DATA (`64`). It does not include COOKIES (`4`). |
| `0x7821310..0x7821324` | Copy locale and append the actual source record, without independently sorting, deduplicating or synthesizing a profile. |

Current155 already matches this version/path/name/locale/detail ordering. The patch changes only the password mask guard and adds the direct `chrome/browser/buildflags.h` include. Aux Mac builds regain the original `0x4b`; stock Mac remains `0x43`, and non-Mac behavior stays unchanged. It does not change the outer default-browser-dependent provider ordering, the helper implementations or selected source path. The supplied public owner continues using the real registry and original full mask / bookmarks-only `&2` distinction.

No GN edit is needed: the existing `//chrome/browser/importer:importer` target publicly depends on `//chrome/browser:buildflags`, and the `impl` target containing `importer_list.cc` depends on `:importer`. Both files are pinned. Integrator owns composition and actual compilation.

`verification.json` records successful disposable `git apply --check`, patch replay and output hash matching. Shared native source was unchanged. No build, registry/profile discovery execution, password/card/cookie access, NSS operation, runtime launch or OS operation ran. Actual Mac password extraction, destination settlement, cancellation and complete supplied-flow behavior remain unverified until coherent integration and authorized runtime observation.
