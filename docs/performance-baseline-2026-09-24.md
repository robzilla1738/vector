# Aux native performance baseline — September 24, 2026

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

### Broker-default startup check

After switching the internal CDP broker to the default transport at `c1db57af`, the same fresh-profile fixture ran ten more warm-system launches on the same Mac. Shell window p50/p95 was **339/383 ms** [383, 329, 345, 339, 346, 329, 352, 333, 359, 339]; painted home **681/716 ms** [716, 667, 712, 681, 680, 696, 694, 669, 702, 674]; runtime ready **601/636 ms** [635, 593, 636, 599, 601, 604, 610, 590, 631, 597]; first local page open **771/806 ms** [806, 753, 797, 771, 765, 791, 783, 763, 794, 763]. These samples show no evident startup regression in this fixture, but the batches are independent and too small to establish a general speed improvement.

## Local history suggestion paint

After the address field added delayed saved-result, Skill, and conversation recall, the same `tests/smoke/omnibox-paint-desktop.mjs` 50,000-visit fixture measured the immediate local history row at **43.9/44.3 ms p50/p95** over 20 input-to-two-frame samples [44.7, 39.3, 42.4, 43.7, 39.2, 40.4, 43.9, 44.1, 43.6, 43.1, 43.2, 44.2, 44.3, 44.2, 44.2, 43.9, 44.2, 44.1, 43.9, 44.2]. This is a separate warm-system run, not evidence of a general speed improvement over the prior 43.4/45.5 ms batch.

After the September 24 read-only main-process history path, `tests/smoke/command-bar-paint-desktop.mjs` used 2,012 local visits while the AI runtime was still reconnecting. The first matching command-bar row painted in **30.3 ms**; 12 input-to-two-frame samples were **29.4/30.8 ms p50/p95** [30.3, 28.6, 28.7, 28.5, 29.4, 29.4, 29.3, 28.5, 29.6, 30.8, 30.3, 29.9]. A separate `--palette-first` launch recorded `runtimePendingAtFirstInput: true`, **22.9 ms** to paint the first palette history match, then **29.3/41.3 ms p50/p95** across 12 command-bar queries. With 50,000 indexed visits, `tests/smoke/omnibox-paint-desktop.mjs` measured **43.4/45.5 ms p50/p95** over 20 exact matching queries [29.0, 37.1, 43.4, 42.1, 37.5, 43.0, 39.6, 37.0, 45.5, 42.5, 45.4, 44.3, 43.5, 43.8, 43.7, 43.7, 43.9, 44.2, 42.8, 45.6]. The fixture includes SQLite read-only open/close, shell IPC, ranking, React, and two animation frames; it is still unsigned, synthetic, and measured on one warm-system Mac. Rare substring scans, a cold OS cache, heavy agent load, and a real visible compositor frame remain unmeasured.

The pre-broker unsigned native build opened a disposable profile with 50,000 indexed history visits and 20 unique matching entries. `tests/smoke/omnibox-paint-desktop.mjs` measured each input event through the exact matching suggestion's DOM update and two animation frames. Twenty distinct queries returned p50 **43.5 ms** and p95 **44.5 ms**: 31.5, 38.3, 41.8, 42.8, 42.5, 43.5, 42.3, 43.3, 43.6, 43.7, 43.8, 43.5, 44.5, 44.1, 43.6, 43.9, 44.5, 42.1, 46.2, 44.0 ms. This covers local IPC, ranking, React render, and an approximate paint boundary. It does not cover actual pixel capture, a cold OS/index, 100 open tabs, or a foreground agent. The two-frame method adds its own frame interval and should be kept identical when comparing changes.

## 20/100-tab restore

`tests/smoke/restore-tabs-desktop.mjs` seeds a disposable native browser catalog with local HTTP tabs, makes the middle tab active, then launches the current broker-default Aux build. Ten warm-system runs per condition measured process spawn to a native catalog snapshot with every logical tab, and to the active page's loaded heading. After 1.5 seconds, it counted resident local-page WebContents and summed RSS across the Aux process tree. The RSS sum double counts shared pages and is a comparison metric, not physical memory use.

| Restored tabs | Logical tabs p50/p95 | Active page loaded p50/p95 | Resident local pages at 1.5 s | Process-tree RSS at 1.5 s |
| --- | ---: | ---: | ---: | ---: |
| 20 | 391/414 ms | 544/581 ms | 2 in every run | 895–903 MiB |
| 100 | 410/430 ms | 552/562 ms | 2 in every run | 906–918 MiB |

Raw logical times: 20 tabs [414, 405, 408, 383, 391, 402, 359, 343, 400, 340] ms; 100 tabs [430, 389, 414, 401, 410, 413, 360, 406, 411, 421] ms. Raw active-load times: 20 tabs [543, 549, 581, 503, 544, 570, 551, 521, 544, 483] ms; 100 tabs [562, 543, 559, 543, 530, 559, 555, 552, 560, 515] ms. Raw RSS sums: 20 tabs [898, 898, 898, 899, 901, 902, 897, 903, 895, 897] MiB; 100 tabs [916, 918, 911, 909, 908, 906, 910, 910, 914, 914] MiB. These seeded rows do not include logged-in page state, extensions, media, or a warm restored Chromium session. Background views continue to materialize after the 1.5-second observation window.

## Live-tab activation placement

`tests/smoke/tab-activation-desktop.mjs` alternated 20 real horizontal-tab clicks between two fully loaded local pages. Electron main recorded the shell's native mouse-down event and polled until the correct `WebContentsView` became visible. Native placement was **16.0/17.9 ms p50/p95**: 14.3, 15.4, 16.9, 14.5, 15.6, 16.0, 17.5, 15.2, 17.1, 16.0, 15.1, 17.8, 17.7, 17.9, 15.6, 18.0, 17.5, 17.0, 15.4, 15.9 ms. Every click selected the intended native catalog tab. This measures the input-to-native-placement path, not the compositor's presentation of the correct pixels. The page WebContents capture returned the correct red pixels, while Electron window capture and macOS window capture returned the dark shell over that page; a temporary opaque-window probe returned the same dark capture. The source was restored after that probe. This environment has not produced trustworthy whole-window pixel evidence for WebContentsView content. Keep the ≤50 ms visible-frame gate open until a direct-display or qualified capture setup measures it; also qualify sharing an Aux window with another app.

Next measurements required by the roadmap: signed release build on this and the oldest supported Mac; cold OS and warm app launch; real returning 20/100-tab profiles with extensions and whole-process physical memory; correct visible pixels after tab activation and local command-bar input; and browsing during fixed agent work. Keep raw samples, p50/p95, long stalls, and hardware/workload conditions. Do not use these local fixtures to claim release speed.
