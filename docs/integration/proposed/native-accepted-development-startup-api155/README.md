# Startup helper Chromium 155 API corrections

Pinned to actual v573 header. Fixes the three focused compilation diagnostics: use a bounded string span/subspan for incremental reads, the existing base::apple::CFDataToSpan bridge for validated CFData, and literal-backed cstring_view keys for Environment::UnSetVar. The CF bridge owns checked length conversion and pointer-span boundary; no local unsafe-buffer exemption is introduced. Keep explicit nonnegative CF length rejection, and use checked_cast for validated file/read lengths. Direct includes declare each used API.

No authority, path, signature, record-bound or environment-policy change. Replacements are count checked; isolated patch replay verifies exact output hash. Integrator must rerun chrome_main_delegate object compile then final link; no shared source mutation or build from this lane.
