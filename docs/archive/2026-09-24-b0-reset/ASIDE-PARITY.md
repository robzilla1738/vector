# Aside parity audit — updated 2026-09-23

Status: implementation in progress, **not verified full UI parity**. Central Icons
are integrated. Native material comparison and the complete interaction matrix
remain release gates, not intentional exceptions.
## September 23 implementation update

The [current checkpoint](ui/design-update-2026-09-23.md) supersedes older layout
statements in this audit. It covers compact horizontal tabs/pins/groups, real
preview capture, stable native page bounds, click-only horizontal chat navigation,
persistent expanded vertical sidebar plus collapsed-only glass preview, session
folders and disclosures, new chat, work controls, contrast and native input.

The [chronological QA log](../design-qa.md) records fixture checks and corrections.
In particular, transparent chrome originally swallowed wheel events after reveal
closed; native hit order and continuous page-region forwarding were corrected.
Sidebar dragging is covered by an actual native-window position assertion.

**Still not claimed:** exact visual parity across wallpapers/activation states,
complete VoiceOver acceptance, full reference rich-text editor behavior, Aside's
private APIs, tab memory telemetry, signing/notarization or B1–B7 completion.
The 2026-09-21 counts below are historical checks, not the current test total.



Latest source validation (2026-09-21): `pnpm test:unit` passed **161 files / 782
tests**; `pnpm typecheck` passed. Unsigned native previews have been built and
launched. These checks do not substitute for native interaction or visual acceptance.

### Chat simplification follow-up

Normal conversations no longer mount a task-promotion form above the composer.
The optional flow lives under Options → Save as task and starts closed. Promotion
uses the conversation objective and no longer clears an unsent reply. Work history
starts collapsed in conversation mode, including while a response is running;
Pause, Stop, approval requests and errors remain available. AI SDK is already
7.0.93; this pass preserves the existing streaming runtime.

Browser checks cover opening and cancelling the optional form, and revealing
the toolbar from focus. On a loaded page the toolbar is out of the layout
until the pointer reaches the top or the field is focused, and the frost
ends at the bottom of that row. Collapsed vertical edge hover reveals an inset panel over the page; expanded
mode stays a persistent column. A chat covers a parked page instead of showing it through
the transcript. Full Aside chat fidelity remains unverified.

### Branding and final chat cleanup

The shared UI mark and favicon use the supplied `renderer/public/arch-mark.svg`.
The native icon uses the supplied silver artwork, deterministically masked rather
than the rejected generated cutouts. The accepted sizing direction fills the
1024px canvas without an extra inset; `scripts/make-icon.mjs` generates all native
sizes and the ICNS. The updated unsigned preview was built and opened; final Dock
appearance still needs user acceptance. Successful chat answers omit redundant
completion badges/status summaries, and Options no longer duplicates the model
and permission controls already under the composer. Partial/failure states remain.

## Reproducible inventory

Reference: Aside Agent Manager `1.26.921.1617`. Run:

```sh
node scripts/inspect-aside-design.mjs \
  "$HOME/Library/Application Support/Aside/AsideAgentManager/1.26.921.1617" \
  /tmp/aside-design-inventory
```

The read-only inspector records SHA-256 hashes, entry points, declarations with
selector/at-rule scope, media/container/supports conditions, complete keyframes,
candidate UI strings and relative bundle imports. This version produces 1,131
HTML/JS/CSS files, four stylesheets, 489 candidate UI bundles, 5,300 declarations,
296 conditions and 20 keyframes. Candidate bundles include libraries and themes;
these counts do not mean every component has been semantically reviewed.
Token aliases are candidates, explicitly not verified matches.

All four stylesheets are inventoried:

| Reference stylesheet | Role / Aux destination |
| --- | --- |
| globals-D6PBr-GP.css | Semantic tokens, utilities, controls, layout and motion → `tokens.css`, `styles.css` |
| styles-lGBNVyIa.css | Rich-text editor → composer/markdown behavior; full editor parity pending |
| minipopup-options-CxOtM5A8.css | Extension mini-popup; Aux counterpart requires capability classification |
| liquid-glass-playground-BmSyeXQT.css | Reference experiment; not evidence of production native material |

Reviewed UI families include newtab-BloMq2or, tasks-DQaEfH4P (home),
tasks-BbGjiQgO (history), chat-preview-card-CHRNMB0K,
chat-list-item-u3CaM1DU, sidebar-DWKuF7gB, session-composer-B_04nAZT,
button-FRhD5n00, popover-C0Ns5VXH, dropdown-menu-BB6pG-cl,
routines-Ddke-vsa and settings-BiPOugxB. Remaining candidate bundles still need
classification and explicit links to Aux components or genuine capability gaps.

## Mapped foundations

### Installed native app extraction

The installed `/Applications/Aside.app` also contains an older bundled frontend:
1,099 HTML/JS/CSS files, four stylesheets, 462 candidate UI bundles, 5,283
declarations, 289 conditions and 20 keyframes. The user-provided newer frontend
remains the design reference; older resources do not automatically override it.

`scripts/extract-aside-pak.mjs` extracts Chromium v5 resource archives to an
external evidence directory, checks resource bounds, decompresses gzip entries,
and records resource IDs, aliases and SHA-256 hashes. It refuses repository/app
destinations and existing output files. Extracted reference assets are not
redistributed with Aux.

Installed framework `1.0.914.1` yielded 12 resources from `aside_resources.pak`
(importer UI and image assets), and 5,143 resources / 368 aliases from
`resources.pak`. These do not contain editable native sidebar implementation.
The compiled framework references `NSGlassEffectView`,
`VerticalTabStripBackgroundBlurBackdrop` and window-vibrancy preferences. The
newer Appearance bundle describes Transparent as “Use Liquid Glass effect.”
These are evidence for the technology, not recovered native source or proof of
its exact configuration.

A separate public-AppKit prototype wraps Chromium's original content view in
`NSGlassEffectView.contentView`, preserving full-strength material rather than
fading the blur. The user reported that this looks more accurate. Restoring the
full-size transparent title bar fixes the initial prototype's white title strip.
Aux now integrates this approach as the `liquid-glass` material, with titlebar
vibrancy fallback before macOS 26. Existing explicit material preferences remain
respected. The glass window backing is explicitly clear and non-opaque. A forced
light-appearance experiment washed out the sidebar and was removed; native glass
inherits the selected theme. Full native integration acceptance is still pending;
prototype approval is not approval of every window state in the full app.

Apple's [AppKit Liquid Glass guidance](https://developer.apple.com/videos/play/wwdc2025/310/)
requires placing content inside the glass view rather than behind a sibling.
The addon follows that public API, does not use private blur filters, and removes
older vibrancy before enabling glass. Solid/reduced-transparency mode unwraps the
original Chromium content view.

| Reference | Aux implementation | Remaining verification |
| --- | --- | --- |
| Geist Variable, 4px rhythm, 0.5px hairlines | Packaged font; spacing and hairline tokens | Full typography/line-height matrix |
| Dark background 20.5%, popover 26.9%, foreground 98.5% OKLCH | Semantic dark palette | Native rendered color comparison |
| Light white background, 14.5% foreground | Semantic light palette | All native screens |
| Reference text alpha 85/55/25%; Aux secondary ink strengthened to 72% | Ink and surface tokens | Disabled/selection/focus states per component |
| Radius factor 1.4; xs 2px; md/lg/xl/2xl 6/8/12/16px before scaling | Radius tokens and supported CSS corner shaping | True shape equivalence across runtime versions |
| Page material 80%; menu popover 80% with 8px blur | Menus mapped; content now defaults to 95% with user-requested 80–100% control | Native background/activation matrix |
| 150ms cubic-bezier(.4,0,.2,1); ease-out (0,0,.2,1) | Transition tokens | Event-by-event timing |
| Menu entry 100ms, opacity 0, scale .95, directional offset 8px | CSS menu entry | Reference spring 420/damping 34, exit and height motion not fully matched |
| Reduced motion | Animation/transition and press-scale overrides | Native preference end-to-end check |
| Card ring 0.5px, medium shadow increasing on hover | Card surface/shadow rules | Measured hover screenshots |
| New tab: 1152px wrapper; 64px mark; 48px gap; 54px field | Start page layout, Aux mark | Matching native dimensions |
| Home cards: 827px section, 3 square cards, min 240px, gap 16px | Real recent conversations and routines | Narrow widths and long content |
| History: 1120px maximum; 1/2/4 columns at viewport widths 640/1024 | Grid/list history and answer previews, compact search/filter toolbar | Matched native captures |
| Composer: 20px unscaled radius, primary surface, bottom controls | Attach/dictate/send; model/permission/context actions | Growth limits, rich-text details and native focus |

Reference breakpoint inventory also includes 450, 560, 720, 768, 1280 and 1536px,
384/448px container conditions and a 640px height condition. These are recorded
but not all mapped. Likewise all 20 keyframes are captured, not all applied:
loading, pulse, caret, accordion, masks and editor transitions need relevance
classification. Aux-specific status/diff/find colors are not asserted exact.

## Screen and interaction acceptance

| Surface | Implemented / checked | Still required |
| --- | --- | --- |
| New tab | Reference-derived geometry, Search/Ask, three real previews; native screenshots inspected | Same-size light/dark pair and responsive captures |
| Browsing | Loaded page sits flush; the toolbar floats in from the top edge. Sidebar and main stay separated | Same-size native content comparison |
| New chat | Quiet Aux mark; composer and real actions | Native reference capture after model menu is dismissed |
| Conversation | Durable answers, safety controls, and a web-tab preview beside the messages | Matched populated conversation, long content and streaming states |
| Chat history | Square preview grid/list and compact toolbar; list toggle and menu Escape verified in mock browser | Native pair |
| Tasks/routines | Searchable index, separate edit state and existing schedule capabilities | Matched native index, editor and empty/error states |
| Menus/popovers | Glass tokens, motion, keyboard dismissal | Native reference states, placement, focus return and exit motion |
| Settings | Shared tokens; solid surface prevents content ghosting; Translucent/Solid | Full native light/dark screen matrix |
| Collapsed/resized sidebar | Zero-width collapse, no logo strip; native-page floating preview and Escape; mock main-left stays zero; native keyboard resize/reset | Pure hover timing, matched widths and native pointer drag |
| Composer growth/dictation | Reference 15-line cap; measured mock growth 28→316→28px; stop/review/unsent insertion checked, synthetic draft cleared | Native growth comparison |
| Hover/focus/press/selection | Shared styling and reduced-motion rules | Per-component visual and keyboard acceptance |

Current native evidence is preliminary: captures do not share identical
dimensions. Earlier sidebar and under-window vibrancy builds appeared darker
than Aside; transparent CSS alone did not resolve this. The current default
uses the public Liquid Glass integration described above. Its full native
comparison remains outstanding.

The native window now explicitly enables transparency and keeps the visual
effect active while unfocused. Both the sidebar and under-window materials were
still too dark in the user's desktop comparisons. A backdrop-alpha experiment
made background content too sharp and transparent; that experiment was removed.
The replacement Liquid Glass addon keeps native material at full opacity.
At the user's request, Settings offers native material presets, independent
sidebar tint and content opacity; defaults are now Liquid Glass / 0% / 95%. These
defaults remain subject to native comparison. A six-pixel invisible edge target
remains available beside native page views to reveal the overlay; there is no
visible rail. Native pages remain rendered beneath the shell during a preview.

Native capture resumed after the menus were dismissed. Wallpaper testing was
approved, but attempts to select another background did not change the visible
Tahoe wallpaper; they are not successful validation. Original wallpaper remains
Tahoe, Automatic, Show on all Spaces enabled. The file named `aux-native-cyan.jpg`
does not show a verified Cyan background and must not be used as such evidence.
The dark/light/saturated background matrix remains outstanding.

## Intentional product exceptions

- Aux name and mark replace Aside identity. Central Icons replace the reference
  glyph family at the user's explicit request, preserving supplied SVG geometry.
- The user requested an auto-hiding URL field and its surrounding toolbar icons.
  On a loaded page they leave the layout, so the page sits flush, and they
  float back in together using coordinated reveal/slide timing when the pointer reaches the top
  or the field is focused. Keyboard focus still opens the row. Aside keeps
  its toolbar on screen.
- Geist Mono is packaged; the reference names Berkeley Mono first, but no usable
  Berkeley font asset was found in the supplied bundle.
- Aux spaces, tasks, permissions, local dictation review and agent controls remain
  real capabilities. No fabricated account, billing or unsupported provider UI.
- Safety gates, errors, accessible focus, stored explicit preferences and unsent
  drafts must survive the visual redesign.
- The user explicitly requested material/transparency customization after the
  native comparison. Public macOS materials are presets, not an arbitrary blur
  radius. Tint does not fade text or weaken the blur. Content opacity defaults
  to 95% rather than the reference's 80% to reduce distracting background bleed.

Unverified material, layout or motion differences are **not** approved exceptions.
Neither tests nor a successful package build establish pixel or interaction parity.

### Latest native checks

The packaged Liquid Glass build was exercised with the separate Parity QA
profile. Native new tab, real `example.com` browsing, fully collapsed sidebar,
left-edge preview, Escape dismissal and expanded sidebar all rendered. The
floating preview stayed above the native website without moving its text;
Escape restored focus to Show sidebar. Preview was triggered through the edge
button, so pure pointer-hover timing still needs a separate check.

Solid → glass and light → dark round trips preserved the window controls and
content. Dark mode and glass defaults were restored. Native window captures
composite the desktop backdrop as gray/white, so these files validate layout,
not wallpaper fidelity or the inactive-window color match. Final desktop
comparison remains requested from the user. The multi-wallpaper matrix has not
been completed.

The source/build checks passed with 158 files / 772 tests after the native
material, speech-path, divider-focus, section-collapse and composer changes.
Desktop type-check and packaging passed.
The native glass symbol is weak-linked for the older-macOS fallback. An older
macOS machine is not available here to exercise that fallback end to end.
The packaged speech helper is now unpacked and launched from its real path;
native startup no longer reports the earlier `spawn ENOTDIR` error. No speech
capture or permission prompt was started during this check.

Open and
collapse use the same supplied `IconSidebarSimpleLeftWide` geometry; the right
panel uses its matching right-side asset. The renderer contains no inline SVG
icons outside the Central module and no third-party icon-library imports.
Mock checks used no external model call or microphone access. The original live
Electron session and its user draft were not replaced by the separate QA profile.

### Section, composer and menu follow-through

Aside's native Bookmarks header was observed collapsing its children and then
restored. Aux now separates pinned tiles from saved bookmarks; dropping a
bookmark no longer implicitly pins it. Bookmarks, Chats and Tabs have persisted
collapse state, 150ms layout/opacity transitions, Central chevrons and inert
collapsed content. Mock collapse/reload/restore checks passed for all three.
Native input recovered on the next check. Tabs reopened; Bookmarks and Chats
each collapsed and reopened. All three sections were restored open. The earlier
unresponsive input could not be reproduced and is not treated as a confirmed
application defect.

The editor bundle's `max-h-[calc(15lh+1rem)]` is mapped to Aux's textarea cap.
A 20-line synthetic draft grew from 28px to 316px and returned to 28px after
clearing. No message was sent and the native user's draft was left untouched.

Space, pinned-site, folder and tab context menus now use the reference 100ms fade/95%
scale exit. Dismissing menus become inert, duplicate dismissals are ignored,
unmount cancels animation, and reduced motion closes immediately. Two targeted
tests and desktop type-check passed. This change is live in the mock preview;
the running packaged app has not yet been replaced with this menu refinement.
Folder Escape dismissal returns focus to its folder button (verified in the
mock preview). Context menus now clamp using unscaled layout dimensions rather
than the animated bounding rectangle, with viewport-constrained scrolling for
long menus. Three placement tests cover ordinary, bottom-right and negative
coordinates. Dynamic menu height spring (420/34) and other popover exit paths
remain unmapped.

Follow-up validation: all 160 unit-test files / 777 tests passed. Space-menu
Tab dismissal was corrected to prevent the browser's default focus advance;
the mock check returns focus to Personal. Desktop build passed before that
final focus-only refinement. Native keyboard resize/reset remains verified;
the pointer-drag attempt focused the divider but did not change its width, so
native pointer dragging is still not accepted as verified.

## Evidence locations

### Fresh refinement pass

Current-run evidence is saved under `/tmp/aux-parity-final-erniip/`:

1. `01-aside-newtab.png`: native reference; accepted for structural inspection,
   not matched-size pixel comparison or wallpaper color measurement.
2. `02-aux-newtab.png`: pre-refinement mock. Found fixed five-column pin geometry.
3. `03-aux-two-pins.png`: two synthetic pins measured 120×40px each, separated by
   4px with 8px outer insets. Accepted for pin geometry only (test toasts visible).
4. `04-aux-refined-newtab.png`: accepted post-refinement two-pin layout without
   toasts. All five synthetic pin URLs were subsequently restored through UI;
   the three restored entries use their mock page titles. Test tabs were closed.
5. `05-native-toolbar-rest.png`: latest isolated native build, toolbar hidden.
6. `06-native-toolbar-focused.png`: NOT toolbar-focus evidence; on a new tab,
   Command-L targets the main search field. Excluded from toolbar acceptance.
7. `07-native-browsing-url-focus.png`: native Example Domain tab; Command-L
   reveals the URL field and both icon groups. Original new-tab selection restored.

Pinned tiles now fill their row instead of reserving unused columns; 40px height,
16px favicon and an active inset outline replace square tiles. Shared menus now
use the reference 6px padding, xl shell radius and lg item radius. These changes
were prompted by the design audit and reference dropdown classes.

The isolated native package is
`/tmp/aux-parity-build.0duUg2/mac-arm64/Aux Parity QA.app`.
It includes current UI changes and the staged runtime dependencies required by
the normal packaging script. Startup completed; QA tabs and the saved draft
survived. The separate user Aux session was not restarted or overwritten.
Build/type-check and 24 targeted tests passed; the previous full-suite result is
777 tests, not a full rerun after these final CSS refinements.

Still open: same-size native screen matrix, actual desktop-backdrop comparisons,
native pure-hover timing/pointer drag, rich-text editor differences, remaining
bundle classification, dynamic menu height spring and other popover exits.

Local inventory: `/tmp/aux-aside-review.Di3S9I/inventory/`.
Installed-app extraction and native prototype: `/tmp/aux-aside-native.UiGGze/`.
Native and mock screenshots: `/tmp/aux-aside-review.Di3S9I/screens/`.
`aux-history-dark.jpg` is a browser mock capture, not native translucency evidence.
Reference captures may contain private user content and are intentionally outside
the repository. Capture timestamps/content can differ; do not present these as
matched comparisons without recapturing at identical dimensions and states.
