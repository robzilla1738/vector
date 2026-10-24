# Native messaging constructor compiler correction

Two count-one edits against the actual a7 source. Header baseline is exactly `a265e0f3dd5236e529f9f50c7060d11f4b4fcba084eda0dcfec6f65c89e7a7b0` from the focused a8 diagnostic.

The private constructor becomes an out-of-line declaration. Its unchanged defaulted definition is placed in `namespace extensions` in the existing registered `native_message_process_host.cc`, guarded by `BUILDFLAG(IS_MAC)` like its existing header inclusion. No field initialization, custody, reaping, callback, UI or registration behavior changes; no warnings are suppressed.

Only immutable hash and count-checked replay validation was performed. Root owns actual source projection and focused compilation. Native tree, predecessor proposals and app state remain unchanged; no runtime acceptance is claimed.
