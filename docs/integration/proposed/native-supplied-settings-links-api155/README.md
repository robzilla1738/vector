# Chromium155 path accessor compatibility

The actual546 focused compile rejected four `GURL::path_piece()` calls introduced by `native-supplied-settings-links`. Actual155 `url/gurl.h:352` exposes `std::string_view path() const`; it returns the canonical parsed path component required by the same comparisons.

This one-file follow-up replaces exactly four `url->path_piece()` expressions with `url->path()`. The root-only Credits/History check and the Appearance/Content/Security Settings allowlist are unchanged. No broader URL admission, UI, profile or permission behavior changes.

`manifest.json` binds the exact actual546 preimage, output and four-count anchor. `native.patch` is generated from those complete inputs. Verified exact reverse replay; no shared native edit, build or runtime operation was performed. Integrator owns applying and compiling the object.
