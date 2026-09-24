# Aux native startup baseline — September 24, 2026

Development measurement from the current Aux code on branch `codex/aux-roadmap-build` at `a583f834`, after rebuilding the Electron shell and renderer. The test launches ten disposable profiles per condition through `tests/smoke/startup-timing-desktop.mjs`. It records process spawn to shell window, painted home surface, runtime readiness, and completion of the first local fixture page open. Times are wall clock milliseconds; p95 uses nearest rank. The fixture is local HTTP, with no model configured.

Host: Mac17,4, 32 GiB, arm64, macOS 27.2 build 26B5091g; Electron 43.6.0; Node 26.7.0. This is an unsigned local development build. The system was already warm from earlier Aux launches; these are application process starts, not cold OS boots.

| Condition and event | p50 | p95 | Raw samples (ms) |
| --- | ---: | ---: | --- |
| Fresh profile, shell window | 344 | 354 | 353, 349, 341, 344, 354, 341, 335, 349, 345, 342 |
| Fresh profile, painted home | 686 | 726 | 716, 629, 719, 690, 635, 680, 676, 726, 686, 687 |
| Fresh profile, runtime ready | 621 | 674 | 644, 622, 621, 619, 627, 606, 621, 674, 632, 619 |
| Fresh profile, first local page open | 780 | 817 | 815, 738, 810, 780, 733, 777, 774, 817, 782, 780 |
| Simulated returning profile with a fresh 90k-host filter list, shell window | 353 | 363 | 363, 353, 348, 359, 357, 355, 354, 345, 338, 350 |
| Returning profile, painted home | 694 | 706 | 701, 696, 689, 706, 702, 689, 685, 684, 704, 694 |
| Returning profile, runtime ready | 629 | 645 | 645, 629, 625, 633, 631, 628, 631, 617, 640, 624 |
| Returning profile, first local page open | 791 | 803 | 795, 790, 791, 803, 795, 797, 779, 780, 794, 790 |

An earlier five-launch fresh-profile batch immediately after the build had painted-home times of 731, 1189, 870, 733, and 1051 ms. The later stable batch must not erase those long starts. Investigate build/startup cache state and repeatability before claiming a cold-start target is met. The filter-list simulation is not a full returning user profile with tabs, extensions, accounts, or session restore.

The current bundle budget passed: startup JS 468 KB against 490 KB, startup CSS 220 KB against 225 KB, total JS 1709 KB against 1800 KB. These byte counts are guards, not a proxy for paint or input latency.

## Local history suggestion paint

The same unsigned native build opened a disposable profile with 50,000 indexed history visits and 20 unique matching entries. `tests/smoke/omnibox-paint-desktop.mjs` measured each input event through the exact matching suggestion's DOM update and two animation frames. Twenty distinct queries returned p50 **43.5 ms** and p95 **44.5 ms**: 31.5, 38.3, 41.8, 42.8, 42.5, 43.5, 42.3, 43.3, 43.6, 43.7, 43.8, 43.5, 44.5, 44.1, 43.6, 43.9, 44.5, 42.1, 46.2, 44.0 ms. This covers local IPC, ranking, React render, and an approximate paint boundary. It does not cover actual pixel capture, a cold OS/index, 100 open tabs, or a foreground agent. The two-frame method adds its own frame interval and should be kept identical when comparing changes.

Next measurements required by the roadmap: signed release build on this and the oldest supported Mac; cold OS and warm app launch; 20/100-tab restore and whole-process memory; input-to-visible-paint for tab activation and local command-bar history; and browsing during fixed agent work. Keep raw samples, p50/p95, long stalls, and hardware/workload conditions. Do not use this local fixture to claim release speed.
