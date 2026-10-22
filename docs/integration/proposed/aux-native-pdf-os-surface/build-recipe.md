# Concrete local PDFium build route (review only; not executed)

Actual checkout: `/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`. Its DEPS pins PDFium `39f0ed4a657e53ed743a16d10d77dec086a08e03`. Public fpdfview.h/fpdf_text.h/fpdf_formfill.h/fpdf_edit.h/fpdf_save.h are present. BUILD.gn declares component `//third_party/pdfium:pdfium` with dependent parser/page/doc/formfiller/codec/fxcrt/fxge/fxjs targets. Existing out/AuxFast/build.ninja has a `pdfium` phony target; its args are arm64, non-component, release. These files are read-only pinned by this review, not newly generated or altered.

Use the existing dependency graph, not a guessed single libpdfium archive. PDFium's GN component is a graph of source-set/static targets and optional feature flags. The current checkout's version/API is not proof of byte-identical original bundled PDFium or pixel parity. Confirm renderer/XFA/V8/config dependencies and the original resource initialization before routing production PDF operations.

Read-only target inspection, if needed by integrator:

```
cd /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src
buildtools/mac/gn desc out/AuxFast //third_party/pdfium:pdfium deps --all
buildtools/mac/gn desc out/AuxFast //third_party/pdfium:pdfium outputs
```

A future integrator-owned build must use the existing serialization wrapper (this command has NOT run in this lane):

```
python3 /Users/rcourson/Documents/Vibe/web/scripts/native-build.py /Users/rcourson/Documents/Code/aux-chromium-security-155/depot_tools/autoninja -C /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxFast pdfium
```

The full Aux PDF bridge target still needs a separately reviewed GN addition, complete original seven bodies/helpers, Node-API8 registration and frozen headers, public PDFium dependencies plus PNG encoding dependencies recovered from WritePng, and shared-PDFium mutex/lifetime policy. Do not link the current page helper as a fake complete PDF addon. Do not substitute PDFKit/another parser or omit FPDF_FFLDraw/widget appearance. Preserve the existing owner build/checkout edits; no gn gen, native build, shared GN edit or signing was performed here.
