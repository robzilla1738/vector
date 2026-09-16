# WPT testharness runtime (VEC-006)

Pinned WPT revision: see `../wpt-revision.txt`.

`testharness.js` is the upstream file from
https://github.com/web-platform-tests/wpt at that revision (W3C 3-clause BSD).
`wpt-harness` inlines it into script fixtures so tests that use
`<script src="/resources/testharness.js">` run without a WPT HTTP server.

Vendored upstream tests live in `../wpt/` and are copied into
`../../fixtures/harness/` for the supported-subset manifest.
