# Visual reference evidence, 2026-10-19

Status: **incomplete; zero accepted full-surface parity comparisons**. This document distinguishes measured target first paint from surfaces that could not be reached safely. See the reference provenance ledger for source versions. No shipped implementation was authored by this reference-only lane.

## Version and isolation findings

The installed native app and updated web components have independent versions. The native bundle metadata reports `1.0.928.1`; its bundled agent manifest reports `1.26.928.1922`. The separately updated agent and Vault packages report `1.26.1016.1852`, the requested component target. The native bundle version alone therefore cannot identify the updated component version.

The owner's reference browser already has live processes. No window, profile, daemon, account file, password database or credential was attached to, opened, changed or stopped. A safe independent native daemon/profile/keychain route was not established. The native app was **not launched**. Native light/dark captures remain unavailable under the disposable-state requirement.

Instead, immutable target component package files were served read-only by an ephemeral loopback static server. A newly launched upstream headless Chromium used fresh contexts, no persistent user-data directory, scale 1, fixed viewport, emulated light/dark color scheme, and disabled background networking/sync/component updates. Service workers were blocked. Every browser request outside that one ephemeral server origin was aborted before dispatch, including daemon requests. Root-relative resource paths were resolved to their original package. No native/browser API, account, daemon, authentication response or UI state was mocked. The browser and server were closed after capture.

This approach measures the actual target package's unhosted rendering. It cannot prove native material, privileged extension behavior, authenticated data, normal initialization, functional parity or a complete application screenshot. A successful screenshot write never upgrades that evidence class.

## Produced evidence

Gitignored evidence lives under `out/reference/visual/`:

- `capture-unhosted.mjs`: original reference-only capture program, outside all product source/build paths.
- `unhosted-captures.json`: capture timestamp, target version, viewport/theme, image hashes, page errors, blocked request destinations, measured geometry and evidence class per capture.
- Fourteen PNGs: seven surface attempts in both appearances. The four newtab images show useful desktop/narrow initial layout. Other images show host absence, initial shells or an explicit connection error.

Reproduce from the repository root with `node out/reference/visual/capture-unhosted.mjs`. The script names the available local upstream Chromium and Playwright package explicitly; those machine-specific paths are recorded in this non-shipping evidence tool.

| Attempt | Viewport px | Actual result in both themes | Acceptance use |
| --- | --- | --- | --- |
| Newtab initial frame | 1280×800 | Original static search card/brand/mode switch visible; hydration records missing extension runtime event API | First-paint geometry only; no completed newtab acceptance |
| Newtab narrow initial frame | 390×800 | Original static card; narrow placeholder clips while mode control remains visible; hydration records missing runtime | First-paint geometry only |
| Sidepanel chat | 420×800 | Blank body; missing extension runtime event API | Failure evidence only |
| Tab search | 620×340 | Initial loading shell | Failure/initial-shell evidence only |
| Mini popup | 600×432 | Blank body; missing extension runtime event API | Failure evidence only |
| Main router | 1280×800 | Blank body; missing extension runtime event API | Failure evidence only; no settings/secondary/onboarding routes accepted |
| Vault popup | 600×432 | Real unavailable-daemon error and retry control | Error-state observation only; setup/unlock/item views unavailable |

## Target first-paint measurements

At 1280×800 CSS pixels, without the optional native-sidebar slot, both themes give:

| Element | x | y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Main container |64|0|1152|452|
| Brand slot |608|160|64|64|
| Search region |240|272|800|100|
| Search card |272|272|736|52|
| Editable area |282|282|572|32|
| Mode control group |864|282|134|32|

These live-rendered measurements corroborate the existing newtab spec's static geometry. The card sits 48px below the brand slot. Its content has 10px insets. The mode group includes 134px total width, rather than merely adding two 64px option widths. These measurements cover the unhydrated frame only. No reference wording, icon paths, font files or implementation code belongs in product sources; the approved original copy, independently licensed fonts and Aux artwork remain required.

At 390×800, both themes place the brand at 163,64 (64×64), the search region at 16,160 (358×100), the card at 48,160 (294×52), editor at 58,170 (130×32) and mode group at 198,170 (134×32). The shortcut hint is hidden. The static placeholder clips in the available editor area; this observation does not establish the post-hydration behavior.

## Remaining capture and comparison inventory

Every item below needs a valid native-hosted reference capture and matching Aux state in **light and dark**, with identical viewport/scale and an explicit threshold. The existing screenshots must not be silently relabelled as these baselines.

- Newtab: initial and initialized, typed query/results, search/agent modes, model/effort/access menus, narrow width, empty/incognito.
- Chat: empty, running/tools, formatted transcript, queued/edit/reorder, steering, approvals, questions, todos, attachments/mentions, artifacts/draft preview and recoverable error.
- Secondary routes: chat list, inbox, tasks, projects/list/detail/editor, routines/list/editor, memories/editor/history, archive and statistics.
- Settings: general, appearance, account, agents, model, MCP, skills/detail, channels, communication, context, lasso, global popup, password, privacy, projects, routines, memories, archive, statistics, developers and experimental.
- Onboarding: welcome, local-account adaptation, browser import/source/progress, password import, model connection, permission stage, completion; password lock/setup/recovery/error.
- Utility surfaces: mini popup compact/expanded/attachments/options, tab-search empty/results, notifications, blocked navigation, tab-preview player, glance, selection handle, lasso states, capture anchor/toolbar/result and translation states.
- Vault: disabled/checking/setup/recovery/locked/unlocked/failed, list/details/editors for each category, generator, autofill/save-update prompts, passkeys, import preview/errors and security settings.
- Native shell: expanded/collapsed/hover/resized sidebar, pins/drag/bookmarks, task row/popover/tooltip, agent-tabs bubble, tab-search host, quick/held/cancel switcher, popup window/options, update indicator, profile menu/editor/icon grid, toolbar/internal URL, horizontal tab mode and reduced-transparency fallback.

A full comparison also needs a documented policy for permitted original text/art/font substitutions: literal pixel equality across those areas is incompatible with the required clean-room replacements. Such regions must be explicitly reviewed or masked with a stated reason; no broad automatic mask is justified. The integrator must choose and record that policy before accepting thresholds.

## Comparison harness and current coverage

The independently authored `scripts/parity.mjs` reads `docs/acceptance/visual-manifest.json`, which currently lists 130 surface/state targets, each requiring both themes: 260 comparisons. Run `node scripts/parity.mjs --out out/parity`. Current result is 0 passed, 260 incomplete, with intentional exit 1. Reports are JSON and standalone HTML; supplied valid pairs also produce local side-by-side PNG previews. No screenshot or reference program is tracked in Git.

Each populated theme entry supplies `reference`/`candidate` paths relative to the manifest and evidence records named `referenceEvidence`/`candidateEvidence`. Evidence requires kind `live-reference`/`live-aux`, `disposableProfile:true`, actual `version`, `capturedAt`, `theme`, `deviceScaleFactor`, and `viewport:{width,height}`. Unhosted diagnostics fail that gate. The threshold must explicitly provide integer `pixelDelta` 0–255, `maxChangedFraction` 0–1 and `reason`. No threshold is guessed. Decoded 8-bit RGB/RGBA PNG sizes must match each other and the recorded viewport/scale. Difference is the fraction of unmasked pixels whose maximum absolute RGBA channel difference exceeds `pixelDelta`; mean absolute channel difference is also recorded. Antialiasing differences are counted.

Optional masks use pixel-space integer `x,y,width,height`, `reviewed:true` and `reason`. Invalid, unreviewed, off-image or overly broad masks are rejected. More than 20% masked requires splitting/reviewing the surface, rather than silently accepting a large exclusion. Every required row remains present in the report even when capture paths, live evidence or explicit thresholds are missing. Supplied evidence must accurately record the observed state; the harness cannot independently authenticate a human-entered provenance statement.

Focused harness verification used temporary synthetic 4×4 PNGs. Identical pixels passed; one changed pixel produced exactly 1/16 different and failed a zero tolerance; unhosted evidence and omitted thresholds were rejected; incomplete reports returned exit 1. This verifies the comparison gates/decoder, not product parity. `node --check scripts/parity.mjs` passed. No native build, owner-profile interaction or AI request was performed.
