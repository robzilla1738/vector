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
