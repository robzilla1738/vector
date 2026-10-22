# Recovered PDF7 engine and synchronous Node-API8 module

`source/AuxPdfFour.cc` implements actual PDFium-backed **extractText, merge, rotate, split, getFormFields, fillFormFields and renderPages** and real synchronous Node-API8 registration under `exports.pdf`. It is not a success stub, JSON-string substitute, promise adapter, PDFKit replacement or alternative PDF engine. No original addon execution, shared native/GN edit, native graph build, signing, UI or packaging change occurred.

The source reuses the previously recovered exact page selector/NAPI adapter. New pinned bounded disassembly covers PDFium version2 library initialization, original memory-loaded document and AcroForm lifecycle, page form callbacks, UTF16 conversion, file writer and nonincremental save. Existing seven-operation evidence supplies the four bodies and response contracts. Additional helper disassembly pins form inspection/sorting, text/choice/widget updates, input coercion and PNG encoding. Static reconstruction is distinguished from actual engine acceptance.

Implemented behavior:

- Each call takes one argument, holds a module-global mutex, initializes/closes PDFium for the call, invokes the operation synchronously and translates std::exception into napi_throw_error. Missing input uses original TypeError. There is no run/installation export in this separate PDF-only module.
- Input PDF bytes remain alive for FPDF_LoadMemDocument64. Original form environment version1 is initialized and page load/close invokes FORM_OnAfterLoadPage/FORM_OnBeforeClosePage. Handles close in original ownership order.
- Text extraction opens selected one-based pages, counts UTF16 characters, calls FPDFText_GetText and applies the original codecvt_utf8_utf16 conversion without replacing line endings. It returns pageCount/pages[{page,text}].
- Merge imports each selected zero-based page-index vector with FPDF_ImportPagesByIndex at the current output page count, then returns outputPath/pageCount.
- Rotate validates the original six allowed degrees, applies normalized quarter-turn increments to every selected page in order (including duplicate pages), saves and returns outputPath/pageCount/pages.
- Split creates the output directory, imports each selected page into a new document and writes page_%03d.pdf, returning original pageCount/pages[{page,path}]. Duplicate selected pages retain the original repeated-path/write semantics.
- Save creates a parent directory when present, uses original FPDF_FILEWRITE version1 callback semantics and FPDF_NO_INCREMENTAL (original flag2). Errors use recovered messages. Original non-atomic output behavior is preserved, not silently presented as a transaction.

- Form inspection returns original per-widget field IDs/names/types/raw types/value/flags/bounds, conditional descriptions/export values/options, sorted by page then descending bottom coordinate then ascending left coordinate. Form metadata retains the original supportsXfa:false contract.
- Form filling preserves original last-value-wins name map, primitive/null coercion, text editing, choice navigation, checkbox export-state and radio group behavior. It saves partial results and returns filledFields, missingFields and invalidFields with original messages; XFA fill is refused. Unsupported types are reported rather than fabricated as successful.
- Rendering draws page content and form widgets using original flags0x13 onto opaque white PDFium bitmaps. Original maxDimension default1600/range256..4096 and one-based ordered page selection are retained. PNGs use original filter0 RGBA rows, opaque alpha, zlib level1 and IHDR/IDAT/IEND with CRCs. No platform PDFKit or image encoder substitution is involved.
- Filesystem UTF8 output paths explicitly copy u8string bytes, supporting both C++17 and C++23 char8_t without altering path bytes.

## Verification actually performed

`check.sh` compiles all four real translation units to object files using frozen Node headers with NAPI_VERSION8 and the existing local PDFium public headers, under -Wall/-Wextra/-Werror. Only the original codecvt deprecation diagnostic is explicitly allowed for source fidelity. The exact seven-method engine source, PNG codec and registration compile successfully; there is **no PDFium link or actual PDF operation execution acceptance yet**.

The existing Chromium PDFium dependency graph includes V8/XFA/Skia/PartitionAlloc and many source sets/static dependencies, not one standalone libpdfium archive. Rebuilding that graph or creating a large source overlay was deliberately not attempted. A reviewed integrator-owned GN target depending on //third_party/pdfium:pdfium and //third_party/zlib is the next bounded link step; root owns shared GN/builds. This source's std::exception/RTTI requirements must use //build/config/compiler:exceptions and :rtti rather than blindly inherit Chromium's disabled settings. Node symbols must bind to the Node host, and the exact Chromium/custom-libc++ ABI must be used consistently when linking existing PDFium objects. An Xcode object compile alone proves neither link ABI nor runtime resource/font behavior.

`tests/pdf-four.mjs` is a prepared **unrun** actual-engine fixture. It creates only synthetic two-page and AcroForm PDFs in a disposable directory and checks text/order/duplicates, merge, rotation response, split, form field schema, text fill/save/readback, missing-field partial results, PNG dimensions/header, errors and synchronous return shape. It requires a reviewed Aux-built module path plus exact SHA256 and explicitly refuses the pinned original addon digest. Syntax checking passed; it was not executed because no reviewed linked Aux module exists. No fake engine or archive was used to make it pass.

To run after a real module is integrated/linked:

```
node tests/pdf-four.mjs /absolute/path/to/aux_pdf_four.node <reviewed-module-sha256>
```

## Remaining genuine gaps

PDFium linking and synthetic actual-engine checks remain. All seven exports now have real source implementations. Actual form editing, rendered widget appearance, choice/radio/checkbox variants, original font/resource fidelity and rendering configuration still require linked-engine acceptance; static assembly reconstruction and object compilation alone do not prove that parity. Do not replace the supplied addon until those checks pass. The five actual macOS OS commands remain a separate lane. No current addon/interposer retirement or native parity readiness is claimed. No owner document, clipboard/app action, OS grant, Security/Keychain or provider operation occurred.

## Integrator source changes

Retain existing filenames to avoid gratuitous target churn. Copy the updated `source/AuxPdfFour.cc` and new `source/RecoveredPngCodec.h` / `.cc`; add the codec `.cc` to the bridge target and `//third_party/zlib` to its dependencies. The codec includes Chromium zlib headers (Cr_z_ symbols), so linking an SDK zlib substitute is not supported. Keep all source sets on one reviewed C++ runtime/allocator graph; root owns that graph and actual linking. This lane did not change shared Chromium source, GN, current packages, UI assets or existing browser outputs.
