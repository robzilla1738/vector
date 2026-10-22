# Remaining native PDF and OS surface: bounded recovery

The common original addon cannot yet be retired merely because installation/secure-store commands have Aux-owned replacements. The actual daemon still consumes its PDF object and five macOS OS commands. This proposal records pinned static evidence, a small recovered shared parser and the concrete local PDFium source/build route. It does not claim that the PDF engines or OS effects have been replaced. The accepted app/UI and original addon remain unchanged.

REA guidance was used for the shipped-artifact task. Parent-observed Ghidra/Java mismatch and missing Hopper block native-provider decompilation. No provider repair, installation, new heavy job, target execution or stopping owner jobs occurred. Evidence here is ordinary Xcode `nm` and exact-symbol `llvm-objdump`, plus frozen JS consumers, **not REA pseudocode**. All addon analysis was bounded to selected functions; the original native addon was never loaded.

## ABI correction: PDF is synchronous

Registration0x201c exposes seven `pdf` methods. Each wrapper accepts one input argument; missing input throws TypeError `PDF operation requires an input object`. The wrapper locks a shared mutex, initializes PDFium, directly invokes the PDF operation, closes resources, and turns `std::exception::what()` into `napi_throw_error`. There is no Promise or NAPI async-work creation in these wrappers. They return JS objects directly, unlike `run(command,input)`, which returns a JSON string. The daemon's asynchronous worker wrapper is a separate route for `run`, not PDF.

The pinned daemon has nine `nativePdf.method` callsites: seven REPL methods plus PDF read-file text extraction and attachment preview rendering. `read-file` immediately accesses `.extractText(...).pages`; the preview immediately accesses `.renderPages(...).pages[0].path`. Returning a promise or JSON string would break those real callers. No `nativePdf` callsites occur in the pinned CLI. `consumer-callsite-inventory.json` records actual offsets and nearby callsites, not a guessed external interface.

## Recovered PDF contract matrix

All `filePath`/output paths below are validated/sandbox-resolved by the existing REPL wrapper before native entry. Native operations also have their own RequiredString and PDFium failure rules. Additional form/PNG/font details remain to be ported, not inferred from this matrix.

| Method / original address | Inputs established by source | Established return members |
| --- | --- | --- |
| extractText /0x3040 | filePath; optional pages | pageCount; pages:[{page,text}] |
| getFormFields /0x15ad0 | filePath | pageCount, hasFormFields, fieldCount, formType, supportsXfa, fields |
| fillFormFields /0xaba8 | filePath, outputPath, fields | success, outputPath, filledCount, filledFields, missingFields, invalidFields |
| merge /0x1c8e8 | nonempty files array of filePath + optional pages; outputPath | outputPath, pageCount |
| renderPages /0x1d280 | filePath, outputDir, optional pages, finite maxDimension (default1600, range256..4096) | pageCount; pages:[{page,path,width,height}] |
| rotate /0x231a0 | filePath, outputPath, optional pages; required degrees in -270,-180,-90,90,180,270 | outputPath, pageCount, pages |
| split /0x238c8 | filePath, outputDir, optional pages | pageCount; pages:[{page,path}] |

Rendered filenames use `page_%03d.png`; split outputs use `page_%03d.pdf`. Rendering uses FPDF_RenderPageBitmap **and FPDF_FFLDraw**, so omitting widget drawing would degrade actual form appearance. getFormFields descriptor fields include page, field_id, name, type, raw_type, value, flags, alternate_name, description, export_value, options and bounds{x,y,width,height}. Full field value/choice rules, duplicate field matching, coordinate convention and XFA policy remain explicit gaps; `fillFormFields` says `XFA forms are not supported`, which does not by itself describe every inspection/XFA branch. The complete recovered function assembly is pinned, but this slice does not pretend nested form schemas are fully implemented.

## Implemented narrow recovered surface

`RecoveredPdfPageSelection.cc` implements the exact shared page-number policy recovered at0x3ab8..0x3e4c. Absent pages produces1..pageCount (zero-page default stays empty). An explicit array requires JS number values that are integral and in1..pageCount, rejects empty, preserves ordering and duplicates, and uses the original error messages. `RecoveredPdfPageSelectionNapi.cc` is the actual Node-API adapter, with immediate per-element validation before observing a later JS element. It is an inert helper, not a registered replacement `pdf` module. It introduces no PDF engine, filesystem side effect or approximation of the UI.

The pure finite/range check matches the recovered numeric comparisons. This is not an acceptance claim for arbitrary pending NAPI exceptions/proxies/getters; original helpers ignore several NAPI status returns, and malformed-object compatibility requires dedicated integration review rather than inventing behavior.

## OS commands still required

The reviewed Mac Swift dispatch includes **generate-thumbnail, list-open-apps, app-icons, copy-file, open-with**. Installation-only replacement of `run` must route these separately before deleting the common addon.

| Command | Actual daemon contract / platform |
| --- | --- |
| generate-thumbnail | `{filePath,iconOutputPath,thumbnailOutputPath}`; consumers check thumbnailGenerated and actual output file. Used by HEIC read-file and non-PDF preview; preview path guarded darwin. |
| list-open-apps | darwin + binding availability, otherwise[]; `{filePath,iconDirectory}`→apps; JS accepts appName/appPath strings, optional default:true/iconPath and reads PNG into data URL. |
| app-icons | darwin branch; `{bundleIds,iconDirectory}`→icons mapping bundle ID→icon path; JS reads the PNG/cache. |
| copy-file | darwin + binding availability; `{filePath}`→success:true; native checks file existence, obtains general NSPasteboard, clears contents and writes file URL objects. No clipboard API was executed here. |
| open-with | darwin + binding availability; `{filePath,appPath}`→success:true; native includes missing-application and timed-out-opening branches and completion handling. No app opening occurred here. |

Windows-only callsites include pick-directory, open-path, reveal-path, focus-explorer-path and install-crash-handler; these are not branches in the reviewed Mac dispatch and must not be added as fake Mac success stubs. The Mac `openSystemPath` caller uses its existing system `open` subprocess instead. Native key secure-store/installation/Vault commands are separate lanes; removing Vault must not remove required OS/PDF behavior.

OS routines were not ported in this slice: exact cancellation/error schemas, application-default ordering/icon bitmap conversion, thumbnail callbacks and open-with completion timeout need complete evidence before implementation. A small source-faithful page parser is preferable to silently substituting a different PDF/OS engine. Static implementation inventories remain truthful historical evidence and can retain original symbol names.

## Focused checks and remaining work

`check.sh` compiles/runs only pure page policy tests (default, zero pages, ordering/duplicates, empty, wrong type surrogate, range/fraction/NaN/infinity) and syntax-checks the NAPI adapter against frozen Node headers. It passes with warnings-as-errors. No original addon, actual PDF parser, filesystem document, clipboard, app launch, Keychain, owner state, OS grant or signing is invoked.

See `build-recipe.md` for the real checked-out PDFium target and version pins. Remaining: recover/implement all seven engine bodies and exact form/PNG/resource handling; compile a separately routed Aux-only PDF module; implement/route the five Mac OS commands; use a few disposable actual PDF fixtures for text/forms/render/merge/split/rotation and bounded synthetic OS adapters before removal of the old common addon/interposer. No shipped-module replacement or full native parity claim is made by this proposal.
