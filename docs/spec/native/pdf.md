# PDF addon (`aux-pdf.node`)

Status: **implemented** by `apps/pdf-addon` (the reconstructed C++ module linked against the Chromium checkout's PDFium), checked against the supplied addon by `apps/pdf-addon/tests/parity.test.mjs`. Batch 10 of [the browser excellence plan](../../plans/2026-10-29-browser-excellence.md) ("the native addons"), after [macos-utilities](macos-utilities.md). **Not shipped yet:** the release still carries the supplied image, because the target below can't link until Robert admits its output (section 8). Section 7 lists the rest of the swap. This page is current work, not part of the historical clean-room set described in [README](../README.md).

Reference artifact: the fixed Developer ID copy `out/live-inputs/completion-20261026/release-addons-a1/aux-pdf.node` (9,437,920 bytes, sha256 `e94ced74…bdbf`, identifier `dev.aux.browser.pdf`, team `9F2JXY8TCK`, hardened runtime), which is what build 99 ships at `Aux Daemon.app/Contents/Resources/native/aux-pdf.node`.

Evidence tags: **[O]** observed by loading the supplied addon in plain Node 26 against synthetic PDFs in a temp directory, or read from build 99 files; **[S]** read from the source the supplied image was built from (section 1); **[D]** read from the build 99 daemon JS (`Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs`).

## 1. What the supplied image is

The supplied image is not third-party code. It is Aux's own earlier build, `out/aux-pdf-lifetime/aux-pdf.node` (9,474,752 bytes, sha256 `ed5b4fae…dcc0`, linker ad-hoc signature, identifier `aux_pdf_four.node`), re-signed with Developer ID. With both signatures removed the two files differ only in the `__LINKEDIT` vmsize field that `codesign --remove-signature` leaves behind (2 bytes). [O]

That build came from the reconstructed sources in `docs/integration/proposed/` (`aux-native-pdf-engine/source/`, `aux-native-pdf-os-surface/source/`) and the GN target in `aux-native-pdf-link/{BUILD.gn,args.gn}`, built in a since-deleted checkout (`aux-chromium-security-155`) under `out/AuxPdfBridge`. Provenance and fixture history: `aux-native-pdf-engine/README.md`, `aux-native-pdf-link/README.md`, `aux-pdf-lifetime/README.md` and their `runtime-evidence.json`. The same seven sources are byte-identical in the durable checkout's `aux_native_pdf_bridge/`, and `apps/pdf-addon/Sources/` copies them unchanged. [O]

What the 9.4 MB holds [O] (`nm`, `otool -L`):

| Part | Notes |
| --- | --- |
| PDFium `39f0ed4a657e53ed743a16d10d77dec086a08e03` | the Chromium 155.0.8059.85 DEPS pin; complete static library, no V8, no XFA, no Skia (AGG renderer), no PartitionAlloc |
| FreeType (bundled), HarfBuzz with the Rust fontations/harfrust/skrifa back end | glyph loading and shaping |
| libjpeg-turbo, OpenJPEG, Little CMS, Chromium zlib, Rust `png` | image decoders, color management, Flate |
| Chromium's libc++/libc++abi (`std::__Cr`), Rust std, ICU (part) | all statically linked |
| the Aux module | about 300 lines of C++ (Node-API 8) |

It links AppKit, CoreGraphics, CoreFoundation, Foundation and libSystem only: PDFium's Mac font info finds substitute system fonts through CoreText/CoreGraphics. Deployment target 13.0, SDK 27.0. Exports: `napi_register_module_v1`, `node_api_module_get_api_version_v1`, `AuxPdfCloseAdmissionAndDrain`, `AuxPdfPendingOperations`, plus every PDFium public `FPDF*`/`FORM_*` function and some FreeType/HarfBuzz/Rust symbols (173 in all). Nothing uses the extra exports.

Every observable result (extracted text, field values and flags, rendered pixels, saved PDF bytes) is PDFium's. PDFKit or CoreGraphics would give different text segmentation (PDFium inserts `\r\n` between lines), different field typing and rendering, and differently laid-out saved files, so a framework port cannot match. The faithful route is the same sources against the same PDFium revision with the same configuration, which is what `apps/pdf-addon` does.

## 2. JavaScript surface

`require()` returns an object with one own property, `pdf` (writable, enumerable, configurable: a plain `napi_set_named_property`). `pdf` is a plain object with seven own enumerable writable function properties: `extractText`, `merge`, `rotate`, `split`, `getFormFields`, `renderPages`, `fillFormFields`, in that order, each with `length` 0 and `name` equal to its key. [O][S]

Every method is synchronous and returns a plain object (never JSON text, never a Promise). Each call [S][O]:

1. With no argument: throws `TypeError: PDF operation requires an input object`. Extra arguments are ignored.
2. Called from inside another PDF call on the same thread (a getter on the input object calling back in): throws `Error: PDF operation is already active on this thread`.
3. After native closure (section 5): throws `Error: Native PDF admission is closed`.
4. Otherwise takes a process-wide engine mutex, initializes PDFium (`FPDF_InitLibraryWithConfig`, config version 2, nothing else set), runs the operation, destroys the library. Any failure becomes `Error: <message>`; none of the thrown errors has a `code`.

Input reading [S][O]: properties are looked up with `napi_has_named_property` then read with a getter-triggering get. `undefined` or `null` where an object is expected (the input, a `files` element, a `fields` element) throws Node's own `TypeError: Cannot convert undefined or null to object`; another primitive or an array behaves as an object without the property: `Missing filePath` and the like. A required string must be a JS string (`<key> must be a string`); a required number must be a finite JS number (`<key> must be a finite number`). Nothing is coerced. Unknown properties are ignored.

### 2.1 Common rules

- **Opening** (`filePath`, and each `files[i].filePath` for merge): the file is read whole into memory, then `FPDF_LoadMemDocument64` with no password, then an AcroForm environment (`FPDFDOC_InitFormFillEnvironment`, callbacks version 1, all callbacks null). Errors: `Failed to open PDF file` (cannot open, including a missing path; a directory opens and then fails as `Failed to read PDF file`), `PDF file is empty`, `Failed to read PDF file`, `Failed to open PDF (PDFium error N)` with PDFium's `FPDF_GetLastError` (3 format, 4 password, 5 security handler), `Failed to initialize AcroForm support`. An RC4/AES file with an empty user password opens; one with a user password fails with error 4. A broken cross-reference table is rebuilt by PDFium.
- **Pages** (`pages`, optional): absent means every page in order. Present, even as `undefined`: must be an array (`pages must be an array`; `null` and array-likes count as not arrays), every element a JS number that is an integer in 1…pageCount, checked one element at a time in order (`pages contains an invalid page number`), and not empty (`pages must not be empty`). Order and duplicates are kept. A zero-page document with no `pages` selects nothing.
- **Page loading**: each selected page is loaded with `FPDF_LoadPage` and then `FORM_OnAfterLoadPage`; a page that will not load fails with an operation-specific message (below). Unselected pages are never loaded.
- **Saving** (merge, rotate, fillFormFields; and each split page): the parent directory of the output path is created with intermediates (errors thrown as libc++'s `std::filesystem` message, for example `filesystem error: in create_directories: File exists ["/dev/null"]`), the file is opened with truncate, written with `FPDF_SaveAsCopy(…, FPDF_NO_INCREMENTAL)`, and any failure is `Failed to write PDF`. The write is not atomic. PDFium writes a fresh `/ID` pair derived from addresses, so two saves of the same input differ in that entry only.
- **Paths** are UTF-8, passed through `std::filesystem::u8path` unchanged. Returned paths are the input strings (merge, rotate, fill) or `outputDir/<name>` joined by `std::filesystem` (split, render).

## 3. Methods

| Method | Input | Result |
| --- | --- | --- |
| `extractText` | `filePath`, `pages?` | `{pageCount, pages:[{page, text}]}` |
| `getFormFields` | `filePath` | `{pageCount, hasFormFields, fieldCount, formType, supportsXfa:false, fields:[…]}` |
| `fillFormFields` | `filePath`, `outputPath`, `fields:[{field_id or name, value}]` | `{success, outputPath, filledCount, filledFields, missingFields, invalidFields}` |
| `merge` | `files:[{filePath, pages?}]`, `outputPath` | `{outputPath, pageCount}` |
| `split` | `filePath`, `outputDir`, `pages?` | `{pageCount, pages:[{page, path}]}` |
| `rotate` | `filePath`, `outputPath`, `degrees`, `pages?` | `{outputPath, pageCount, pages:[number]}` |
| `renderPages` | `filePath`, `outputDir`, `pages?`, `maxDimension?` | `{pageCount, pages:[{page, path, width, height}]}` |

Integer results are `int32`, bounds are doubles. [S]

### 3.1 `extractText`

Validation order: `filePath`, open, pages. For each selected page: load (`Failed to read PDF page N`), `FPDFText_LoadPage` (`Failed to read PDF text on page N`), `FPDFText_CountChars` (negative: same message), `FPDFText_GetText` over all characters, converted from UTF-16 to UTF-8 with `std::codecvt_utf8_utf16`. Line breaks are PDFium's (`\r\n`); nothing is trimmed or normalized. `pageCount` is the document's page count, not the selection's. [S][O]

### 3.2 `getFormFields`

Every page is loaded in turn (pages that fail to load are skipped). Every annotation with subtype Widget whose field name (`FPDFAnnot_GetFormFieldName`, the fully qualified name) is non-empty becomes one entry, so a field with several widgets appears once per widget and a nameless widget is skipped. [S][O]

Entry: `page` (1-based), `field_id` and `name` (both the field name), `type`, `raw_type`, `value` (`FPDFAnnot_GetFormFieldValue`), `flags` (`/Ff`), then only when non-empty `alternate_name` and `description` (both the `/TU` text) and `export_value`, then `options` (option labels) only when there are any, then `bounds` `{x: left, y: bottom, width, height}` in PDF user space from the annotation `/Rect`.

| PDFium type | `type` | `raw_type` |
| --- | --- | --- |
| 1 push button | `button` | `Btn` |
| 2 checkbox | `checkbox` | `Btn` |
| 3 radio button | `radio` | `Btn` |
| 4 combo box, 5 list box | `choice` | `Ch` |
| 6 text | `text` | `Tx` |
| 7 signature | `signature` | `Sig` |
| other | `unknown` | `""` |

Sorted by page, then by descending bottom edge, then by ascending left edge (`std::sort`, not stable). `formType` from `FPDF_GetFormType`: `acroform`, `xfa_full`, `xfa_foreground` or `none`. `hasFormFields` is `fieldCount > 0`. [S][O]

### 3.3 `fillFormFields`

Validation order: `filePath`, `outputPath`, then `fields` (`Missing fields`, `fields must be an array`). Each entry's key is `field_id` when the entry has that property, else `name` (`Missing name` when neither; the key must be a string); `value` must be present (`Missing value for field <key>`) and be a string, number, boolean, null or undefined (`Field value must be a string, number, boolean, or null`). Entries go into a map keyed by name, so the last entry for a name wins and results come out in byte order of the names. An empty map throws `No field values provided`. Then the document opens; an XFA form (`formType` 2 or 3) throws `XFA forms are not supported`. [S][O]

Every page is loaded; every named widget whose name is in the map is offered to its entry until that entry is filled:

- **text**: the value becomes text (`null`/`undefined` → empty, booleans → `true`/`false`, numbers → JS `String(n)`), focus the widget, select all, replace the selection, kill focus; filled if the field value now equals the text, else `Failed to update text field`.
- **choice**: find the last option whose label equals the text; none: `Value does not match a choice option`. Otherwise focus, and if nothing is selected press Home; then press Down or Up as many times as the index difference, kill focus; filled if the value now equals the text.
- **checkbox**: desired state from the value: null/false/0/`""`/`false`/`Off` → off; true/non-zero/`true`/the widget's export value → on; any other string: `Value does not match the checkbox export value`. If `/AS` differs, activate (focus and Space; if that fails, a click at the centre of the rect). Filled if `/AS` now matches, else `Failed to update checkbox`.
- **radio**: the value must be a string (`Radio fields require an export value string`). Only the widget whose export value equals it is acted on: activated if its `/AS` differs; filled if the field value then equals it, else `Failed to update radio field`.
- **anything else**: `Field type is not fillable`.

The document is then saved to `outputPath` whatever the outcome. `filledFields` lists filled names, `missingFields` names no widget matched, `invalidFields` `{field_id, message}` for the rest (`No matching field option` when no error was recorded, as for a radio value no widget exports). `success` is true when nothing is missing or invalid; `filledCount` is the length of `filledFields`. [S][O]

### 3.4 `merge`

`files` checks: present (`Missing files`), an array (`files must be an array`), not empty (`files must not be empty`); then `outputPath`. Each file in order: `filePath` (an element that is not an object reads as missing), open, page selection against that file, then `FPDF_ImportPagesByIndex` appending the selection to a new document (`Failed to merge PDF <filePath>`). Then save. `pageCount` is the merged document's. [S][O]

### 3.5 `split`

`filePath`, `outputDir`, open, page selection, then `outputDir` is created with intermediates. Each selected page is imported into a new document and saved as `outputDir/page_%03d.pdf` (`Failed to split PDF page N`). A duplicate selection writes the same file again and lists it again. `pageCount` is the source's. [S][O]

### 3.6 `rotate`

`filePath`, `outputPath`, `degrees` (a finite number), then `degrees` must be exactly one of -270, -180, -90, 90, 180, 270 (`degrees must be -270, -180, -90, 90, 180, or 270`), then open and page selection. Each selected page in order: load (`Failed to load PDF page N`), read `/Rotate` (`Failed to read PDF page rotation` if negative), set it to `(rotation + degrees/90) mod 4`; a page selected twice turns twice. Saves to `outputPath`; `pages` echoes the selection. [S][O]

### 3.7 `renderPages`

`filePath`, `outputDir`, then `maxDimension` when present (a finite number; default 1600) in 256…4096 inclusive (`maxDimension must be between 256 and 4096`), then open, page selection and creation of `outputDir`. Each selected page: load (`Failed to load PDF page N`); width and height from `FPDF_GetPageWidthF/HeightF` (these include `/Rotate`; an empty MediaBox falls back to US Letter, so a 612×792 page), `PDF page has invalid dimensions` if either is not positive; scale = maxDimension / max(width, height); pixel size `max(1, round(side × scale))`. A BGRx bitmap filled white, `FPDF_RenderPageBitmap` then `FPDF_FFLDraw` (form widgets) with flags `0x13` (annotations, LCD text, reverse byte order), so the buffer holds RGBx. Encoded as PNG: 8-bit RGBA (alpha always 255), filter 0 on every row, one IDAT from `compress2` level 1 (Chromium zlib), IHDR/IDAT/IEND only. Written to `outputDir/page_%03d.png` (`Failed to write rendered PDF page`). [S][O]

## 4. Callers

The build 99 daemon reaches the module through `process._linkedBinding('aux_pdf_builtin')`: the native host loads `Contents/Resources/native/aux-pdf.node` itself and registers it under that name, rather than `require`. [D] The shipped `native/aux-pdf.cjs` loader (size/sha256 check, then `require`) is a separate route; see section 7.

| Caller [D] | Call | Uses |
| --- | --- | --- |
| Agent REPL `aux.pdf.*` (`AuxPDFRepl`) | all seven, with `filePath`/`outputPath`/`outputDir` (and each merge `filePath`) first resolved by the session's sandboxed path resolver (`write` mode for outputs) | returns the result as is |
| `read_file` tool on a `.pdf` | `extractText({filePath})` | `pages[].page`, `pages[].text` with `\r\n?` turned into `\n`, joined as `--- Page N ---` blocks |
| Attachment preview | `renderPages({filePath, maxDimension: 1024 (thumbnail) or 256, outputDir: <mkdtemp>, pages: [1]})` | renames `pages[0].path`; any throw falls back to the generic preview |

## 5. Lifetime and the native admission ABI

Admission is process-wide, shared by every Environment and worker that loads the image. [S][O]

- `int32_t AuxPdfCloseAdmissionAndDrain(void)`: stops admitting calls for good and returns 0 when none is in flight, 1 when some is (it never waits), -1 when called in a forked child of the process whose first PDF call or count created the admission state.
- `uint64_t AuxPdfPendingOperations(void)`: calls admitted and not yet finished (a call waiting for the engine mutex counts); `UINT64_MAX` in a forked child.
- An admitted call finishes normally even if closure happens meanwhile (including its writes). Every later call, in any Environment, throws `Native PDF admission is closed`; loading the image in a new worker still succeeds. Calling close again returns 0.
- No destructor releases the admission state or the mutexes, so a late call during process teardown cannot touch freed memory.

The argument-count check comes before admission, so a call with no argument still throws the `TypeError` after closure. Observed sequence, identical for both images: 0 before and after load; 1 inside a call (from an input getter), where a nested call is refused; 0 after; a worker call succeeds; close inside a call returns 1 with 1 pending, that call still returns its result, then 0 pending; all seven methods and a worker call refuse; a second close returns 0. [O]

The build 99 daemon executable contains both symbol names next to `Resources/native/aux-pdf.node`; its host resolves them on the already loaded image (`docs/integration/proposed/aux-native-pdf-host-consumer`). [O]

## 6. Parity check

`node --test apps/pdf-addon/tests/parity.test.mjs` loads both images in one process (and each in its own child process for section 5) and compares returned values, thrown errors (class and message) and every output file, PDFs byte for byte with the `/ID` pair masked and PNGs byte for byte. Fixtures are generated by `tests/fixtures.mjs`: three pages of text (standard 14 font with WinAnsi accents and escapes, a non-embedded `Arial,Bold` substituted from system fonts, a landscape page with `/Rotate 90`, an empty page); Flate, JPEG and gray images; a two-page AcroForm with text, multiline, checkbox, two-widget radio, combo, list, push button, signature, a nameless widget, a two-widget field and sort ties; the same form with an XFA packet; RC4 files with an empty and a non-empty user password; a page with an empty MediaBox (rendered as US Letter), a 3×2000 page and a missing page object; garbage, truncated, wrong-xref-offset and empty files; a non-ASCII file name.

All ten tests pass: the export shape; 198 argument and validation cases across the seven methods (every error string of section 3 that a generated input can reach); text extraction with selections, duplicates, encryption, a rebuilt xref and a non-ASCII path; field inspection of the AcroForm, XFA and plain files; 15 render cases (256 to 4096 px, fractional `maxDimension`, rotation, images, widgets, the daemon's two preview calls), every PNG byte-identical; merge, split and every rotation with saved PDFs byte-identical apart from `/ID`, then read back and rendered through both images; 18 fill cases (each field type, every checkbox value rule, radio and choice misses, last-wins, `field_id` over `name`) with the saved file, its fields and its rendering compared; repeatability; the section 5 lifecycle; and the worker-thread path.

Deliberate break: a build with zlib level 2 in the PNG encoder and the field sort's bottom-edge comparison reversed fails five tests (field inspection, render, merge/split/rotate read-back, fill, worker), each on the first differing field order or PNG byte, while the export, validation, text, repeatability and lifecycle tests still pass.

Not tested, and why:

- Real-world PDFs (CJK and Type3 fonts, embedded CFF/TrueType subsets, JBIG2, JPEG 2000, transparency groups, shading types, annotations other than widgets, AES-256 files): the fixtures are generated locally and do not cover them. The code paths are PDFium's at the same revision in both images, so a difference there would come from the toolchain, not the sources.
- `PDF page has invalid dimensions`: PDFium replaces an empty or inverted MediaBox with US Letter, so no generated page reaches it.
- `FPDF_GetLastError` values other than 3 and 4 (5 security handler, 6 page) and `Failed to initialize AcroForm support`, `Failed to create PDF`, `Failed to read PDF page rotation`, `Failed to encode rendered PDF page`, `Failed to read rendered PDF bitmap`: need inputs PDFium accepts but then fails on, or allocation failure.
- A write failing midway (disk full): only unwritable directories are compared.
- A forked child (-1, `UINT64_MAX`): Node cannot fork with the addon loaded.
- A call waiting on the engine mutex from a second thread while another thread holds it (pending 2): the lifecycle probe covers the getter route only.
- Running inside the real daemon (`_linkedBinding` registration, hardened runtime, Developer ID signature, sandbox): needs integration (section 7).

## 7. Integration (not done)

Swapping the image means new bytes, so every pin of the current ones changes:

1. **Sign** it with Developer ID, hardened runtime, timestamp and identifier `dev.aux.browser.pdf`, once, and keep that fixed copy (with a `pins.txt`) together with the current or new `aux-macos-utilities.node` in a new `--release-addons` directory: `scripts/release/assemble.py` copies both names from that one directory, and a re-signed timestamp changes the hash.
2. **`Aux Daemon.app/Contents/Resources/AuxFreshBootstrapPolicy.json`** `pdfModule` `{path, identifier, sha256}`: text, so assembly's `repin_cascade` updates it.
3. **`Aux Daemon.app/Contents/MacOS/aux-daemon`**: the release hash `e94ced74…` appears twice as text, once in the embedded policy and once in the PDF image pin pair of the native host (next to `8145277f…` and the old link build's `6febb242…`), which `AuxLoadedPdfLifetime` checks before it resolves the close/pending symbols. Mach-O, so the cascade does not touch it: change the source constants and relink (`scripts/candidate/relink_daemon.py`).
4. **`Aux Framework`** (browser): build 99 contains the release hash once, next to `dev.aux.browser.pdf` and `8145277f…`, so a browser-side pin in `chromium/tree` changes too, with a native build.
5. **`native/aux-pdf-pins.cjs`** used by `native/aux-pdf.cjs` pins the unsigned lifetime build (`ed5b4fae…`, 9,474,752), which is not the shipped file (`e94ced74…`, 9,437,920). Anything loading the module through `aux-pdf.cjs` in build 99 would therefore throw `Aux PDF module size/type mismatch`; the daemon itself uses `_linkedBinding` (section 4). Worth checking separately, as with `aux-macos-utilities.cjs`.
6. **Staging pins**: `vendor/provided/aux-pdf-pins.cjs`, `vendor/provided/aux-pdf-artifact.mjs` (requires `out/aux-pdf-lifetime/aux-pdf.node` and the `docs/integration/proposed/aux-pdf-lifetime/runtime-evidence.json` source hashes) and the list in `scripts/lib/provided-stage-inputs.mjs`. `scripts/candidate/repair_combined.py` already skips both addons when pinning.
7. The host needs the two native symbols of section 5; the Aux image exports both with the same contract. Fork detection is lazy (the admission state is created on the first call or count), as before.

## 8. Building

The build lives in the Chromium checkout, inside `out/AuxFast`, with the browser's own toolchain files and link filter:

- `chrome/browser/aux/pdf_addon/` holds a copy of `Sources/`, the four Node-API headers and a `BUILD.gn`. `ninja -C out/AuxFast aux_pdf_addon` (the group in `chrome/browser/aux/BUILD.gn`, which the browser does not depend on) builds it.
- The browser's args give PDFium V8, XFA, Skia and PartitionAlloc (`build_overrides/pdfium.gni`), so a target in the default toolchain would pull V8 into the module and change what section 1 describes. `BUILD.gn` therefore declares a secondary toolchain, `pdf_addon_toolchain`, with the supplied configuration and `mac_deployment_target="15.0"`. GN confirms no `//v8`, Skia, PartitionAlloc or `//base` in the module's dependencies. Objects go to `out/AuxFast/pdf_addon_toolchain`; ninja still runs from `out/AuxFast`, so embedded source paths stay `../../third_party/…`.
- All 1,190 compile and archive steps pass. The link is refused: `ValueError: unreviewed link output: aux-pdf.node`. `build/toolchain/apple/aux_host_link_filter.py` admits exact outputs, not everything under `out/AuxFast`, and its lists are Robert's. Adding `"./aux-pdf.node"` to `build/toolchain/apple/excluded-product-outputs.json` admits it as a product output, which keeps `-Wl,-no_adhoc_codesign`, so the result is unsigned and needs an ad-hoc signature before Node can load it for the parity test.

Remaining after that entry: link, run `tests/parity.test.mjs` with `AUX` set to the signed copy, compare exports, then the section 7 pins (a new `release-addons` directory, a daemon relink, a browser rebuild) and delete `apps/pdf-addon/build.sh` and `apps/pdf-addon/BUILD.gn`.

`apps/pdf-addon/build.sh` is an earlier route that swapped the browser's toolchain files to link outside `out/AuxFast`. It bypasses the link filter, so it is not used and its output does not ship. It stays until the target above replaces it. What it established: with `mac_deployment_target="13.0"` the sources, configuration and checkout reproduce the unsigned supplied build `ed5b4fae…dcc0` byte for byte.
