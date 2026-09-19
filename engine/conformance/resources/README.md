# WPT testharness runtime (VEC-006)

Pinned WPT revision: see `../wpt-revision.txt`.

Vendored from that revision (W3C 3-clause BSD):

- `testharness.js`
- `testharnessreport.js`
- `idlharness.js`
- `WebIDLParser.js` / `webidl2.js` (WPT `resources/webidl2/lib/webidl2.js`, served as `/resources/WebIDLParser.js`)

`wpt-harness` inlines them so fixtures run without a live WPT checkout. `--http` also serves this directory at `/resources` and `../fonts/Ahem.ttf` at `/fonts`.

Vendored upstream tests live in `../wpt/` and are copied into
`../../fixtures/harness/` for the supported-subset manifest.

The `*.min.js` companions are byte-for-byte builds of the vendored upstream
sources using `terser@5.44.0 -c -m`. The IDL harness uses them so the official
testharness, WebIDL parser, and IDL harness fit inside the product's 256 KB HTML
parse cap; the readable upstream files remain the review source.
