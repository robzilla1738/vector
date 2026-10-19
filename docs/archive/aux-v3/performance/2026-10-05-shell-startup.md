# Shell startup graph and build plugins

Native production renderer measurements after generated host descriptors were split from DEV validation. Each variant used the same source and `AUX_CHROMIUM_SHELL_BUILD=1`, with isolated `/tmp` outputs. Startup bytes cover the entry, App, Chromium bridge and their static imports. Gzip totals compress each emitted chunk independently. Build times are single observations, not statistical latency claims.

| Build                                                | Startup JS bytes | Startup gzip bytes | Total JS bytes | Build seconds |
| ---------------------------------------------------- | ---------------: | -----------------: | -------------: | ------------: |
| Original three plugins                               |          526,286 |            167,283 |      1,936,379 |         21.81 |
| Without extra Terser                                 |          528,376 |            167,689 |      1,942,113 |          4.03 |
| Without constructor aliases                          |          527,337 |            167,361 |      1,961,392 |         18.52 |
| Without named-value aliases                          |          527,589 |            167,163 |      1,954,476 |         22.74 |
| Final: three plugins removed, lazy JIT configuration |          519,673 |            164,152 |      1,984,117 |          4.35 |

The individual startup savings were 0.40%, 0.20% and 0.25%, below the roadmap's 3% retention threshold. Their implementations, declarations, obsolete tests and direct Terser dependency were removed. Vite's normal minifier remains. Terser remains an optional transitive Vite dependency in the lockfile.

The emitted final startup graph contains **zero Zod modules** and no DEV host-validation module. The earlier graph contained only `zod/v4/core/core.js` and `util.js`, imported for the entry's JIT configuration. A renderer-only alias now configures complete Zod when a lazy schema chunk loads; runtime and native validation are unchanged. A focused check confirms defaults, trimming, refinement and field stripping still work without a dynamic Function probe.

Generated host normalization preserves existing field projection and the three host string trims. Unsupported defaults, coercions, transforms and readonly normalization fail generation rather than silently changing production values. Complete DEV host parsing remains injectable before bridge installation, with synchronous event delivery and existing feature/acknowledgment behavior.

The baseline build succeeded; an initial measurement-hook error read chunk names before final Vite processing. Its byte totals were recovered from the emitted manifest. Subsequent graph captures use `writeBundle`. There was no repeated baseline build and no full unit benchmark in this slice.
