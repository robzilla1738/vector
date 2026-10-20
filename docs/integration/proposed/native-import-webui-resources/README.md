# Supplied native importer resources

This immutable proposal embeds the actual supplied importer page and every referenced icon/image. It supplies a new `import_webui_resources.h` helper; the separate `native-import-webui-provided-page` proposal removes the independent page and serves these bytes. Root owns real Handler/lifecycle/selection wiring, `installedBrowsers` load-time data and `UseStringsJs()` provisioning. Neither proposal claims an operational importer before those dependencies are integrated.

The exact original framework SHA256 is `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Its resource table at `0xe86f150..0xe86f2d0` maps all twelve route names to PAK resource IDs. Each32-byte record contains the chained string pointer (original string VA in low32bits) and resource ID; `evidence/resource-table.bin` and `source-evidence.json` pin the table, string VAs and ID mappings. The exact `aside_resources.pak` SHA256 is `9154366230e25e68f061fee32b5fb6cb5d3fd4074354f791b1dedd9dea59f362`. Payload offsets/lengths, compressed hashes and decompressed served hashes are all recorded.

| Original route | Original resource ID |
| --- | --- |
| images/safari_import_guide.png | 0x3b1a |
| icons/arc.svg | 0x3b1b |
| icons/atlas.png | 0x3b1c |
| icons/check.svg | 0x3b1d |
| icons/chrome.svg | 0x3b1e |
| icons/comet.png | 0x3b1f |
| icons/dia.png | 0x3b20 |
| icons/edge.svg | 0x3b21 |
| icons/firefox.svg | 0x3b22 |
| icons/safari.png | 0x3b23 |
| index.html | 0x3b24 |
| app.js | 0x3b25 |

The gzip-decoded HTML/JS are byte-identical to `~/Downloads/aside-rea 2/native-fork/webui/aside-importer.html` and `.js`. All original decoded sources are pinned and retained under `source/`. This is exact attribution of browser logos, check glyph and Safari guide image; none were redrawn, borrowed from another release or synthesized. Static inspection of the actual Safari guide image confirms it depicts the Safari export menu, requiring no Aux artwork replacement.

Only two HTML occurrences change from `Aside` to `Aux`: the title and introductory product name. The actual `<aside class="browser-list ...">` element, complete CSS, typography, layout, accessibility attributes, dark/light media rules, component structure and all JavaScript remain unchanged. Copyright notices remain. No Aux logo occurs in the supplied importer page, so no extra logo or decorative asset is inserted.

Public helper interface in namespace `aux_import`:

- `HasSuppliedImporterResource(std::string_view path)` checks the exact route table without decoding images.
- `GetSuppliedImporterResource(std::string_view path)` returns `std::optional<std::string>` containing the actual served bytes. An empty path aliases original `index.html`; unknown paths return nullopt.

PNG bytes are losslessly embedded as base64 and decoded through Chromium's real `base::Base64Decode`; text resources are embedded unchanged, except the two counted HTML branding occurrences. Literal chunks are at most8192characters. Verification reconstructs every generated chunk and matches the actual served SHA256. No new GN source or target dependency is necessary: the resource helper is header-only and this existing browser importer target already consumes base. Integrator may list the header in its existing GN sources.

`verification.json` records twelve recovered resources, ten referenced images/icons with no missing routes, unchanged CSS/JS/HTML aside, unchanged Handler, exact decoded PAK/Downloads equality and successful disposable `git apply --check`/patch replay for both proposals. All source/output hashes match; shared native source was unchanged. There was no build, runtime, profile/data access or OS operation. Compile, real lifecycle and visual/behavior parity remain unverified until root integrates and observes the complete implementation.
