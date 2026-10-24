# FX-THEME: native theme editor and supplied Appearance integration

Inactive source proposal. Baseline selected native root is `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`; exact original/successor hashes and replayable patch are in `files.json`. No selected tree, running app, owner profile, credential, provider or cloud state was changed by this lane. No signing, release or app lifecycle work occurred.

## Delivered source

- `aux_theme_editor.{h,cc}`: strict v1 token validation; bounded local presets; apply/reset/import/export contracts; a profile-owned preview lease with weak Profile and one actual document/window owner. Preview never writes prefs. It expires after two minutes, serial client renewal happens every 30 seconds while dirty. A different owner or stale revision is refused. Native preference changes invalidate the preview/revision.
- `ThemeService::GetColorProviderKey` consumes the effective tokens. Native light/dark/system and accent apply through existing ThemeService setters. An immutable ref-counted theme supplier decorates the native supplier, adding native color recipes after the existing supplied palette. The entire supplier is part of the existing color-provider cache key; old cached providers do not change beneath another profile. High contrast, policy and private profiles bypass these overrides. With no custom tokens, the original key/default palette is returned unchanged.
- Existing `CustomCornersBackground` applies material settings only to already-translucent surfaces and to already-requested artificial blur. It preserves all radii, placement, default alpha and default blur radius. Existing toolbar tint respects the same material setting. Reduced transparency/high contrast take priority. An explicit custom background stops the ordinary HTTP toolbar color sampler from overwriting the selected chrome color.
- Actual recovered sidebar foregrounds use an opt-in native contrast resolver. Default values return unchanged. Chats/bookmark rows and their vector icons, profile button/disclosure, Space icon paint and dividers derive contrast from the actual custom frame surface; favicons stay unchanged. Native tab foreground/background IDs are paired. No sidebar layout was changed.
- `vendor/provided/aux-theme-editor.mjs`: count-checked extension of supplied Appearance using its actual row, Select, Button and Dialog components. It adds native preview, Apply, Cancel, Reset to default, local presets, removal, and bounded JSON import/export. It composes **after** `transformAuxNavigation` and leaves the full-URL setting intact. No arbitrary CSS/asset URL/import script is accepted. Scheme Apply/reset uses the supplied theme hook and query cache so the web settings owner follows the actual native result.

## Integration handoff (root owner)

1. Register `aux.theme.tokens` dictionary `{}` and `aux.theme.presets` list `[]` as **local per-profile, not syncable** preferences. Exclude OTR/system profiles. The current startup/profile write-admission gate remains authoritative; these functions do not manufacture a profile authority.
2. Add `themes/aux_theme_editor.cc` and header to the selected Aux native build. The call from generic ThemeService is guarded by `ENABLE_AUX_BROWSER`. Existing selected Aux sidebar files already belong to that build. Source paths/hashes are exact in the manifest.
3. Expose on `chrome.auxBrowserPreferences`:
   - `getThemeState()` → `aux_theme::GetState`.
   - `previewTheme({revision,tokens})` → `Preview`.
   - `applyTheme({revision,tokens})` → `Apply`.
   - `cancelTheme()` → `Cancel`.
   - `resetTheme({revision})` → `Reset`.
   - `saveThemePreset({revision,name,tokens})` → `SavePreset`.
   - `deleteThemePreset({revision,id})` → `DeletePreset`.
   - `exportThemePreset({tokens})` → `ExportPreset`.
4. The wrapper derives `owner` from the actual document/window, binds the actual admitted Profile, validates request shapes and enforces the existing write gate before persistent operations. Never accept a JavaScript-supplied owner/profile identifier. Before document navigation/destruction, window destruction or profile handoff, explicitly cancel this owner's preview in its old profile. A timer is a crash fallback, not a substitute for lifecycle cancellation. No global owner-profile lookup or original-profile substitution is used by the helper.
5. Compose `transformAuxThemeEditor` after navigation. Adapter source input must remain the pinned original Appearance plus declared preceding transforms, not an edited generated bundle. Import accepts only `{format:"aux-theme",version:1,tokens:{...}}`, max 4 KiB; native token validation is repeated before preview/save/apply.

## Token and operation semantics

`{version:1}` means inherit existing native settings. Optional `scheme` is `system|light|dark`; optional opaque `accent`, `background`, `tint` are exact `#RRGGBB`; `tint` and `tintStrength` must be paired, strength 0..0.4. Optional `material` is `default|clear|soft|opaque`; default is normalized away. Unknown fields, alpha colors, remote assets, nonfinite values and future versions fail.

`Inherit` removes that editor override and retains the currently selected native theme/scheme/accent. Full **Reset to default** is an explicit immediate persistent action through `ThemeService::UseDefaultTheme` + system scheme; it does not delete presets. Selecting/importing a preset previews only; Apply persists. Preset saving persists a copy but does not implicitly Apply it. Up to 12 presets, each name 1..64 UTF-8 bytes without controls. Exports contain theme tokens only, no profile IDs/paths/credentials. Invalid saved token data falls back to inherited defaults without deleting it; invalid preset entries are omitted from the editor view.

Responses include success/error; successful state responses carry opaque revision, saved/effective tokens, presets, previewing and native accessibility/scheme status. UI writes serialize through one session. Closing drains any in-flight preview and then cancels; queued mutations skip after closing. Native expiry, peer conflicts and policy still remain authoritative.

## Verification and remaining acceptance

Focused adapter checks cover pinned-source composition/parsing, failed/double transforms, close-vs-in-flight preview race, revision progression and failed mutation retention, bounded import envelopes. Source patch replay checks originals/successors without mutating the selected tree.

**Not claimed yet:** selected native translation-unit compilation/link, real extension wrapper/lifecycle binding, real app preview/apply/cancel across two profiles/windows, native OS material screenshots or full supplied web-content theme preview. The native chrome preview is implemented; existing supplied web surfaces receive scheme changes on Apply/reset. Additional web preview propagation must reuse the supplied theme mechanism if required, rather than writing a competing theme stylesheet. Root must observe actual contrast/material/preview cancellation in the disposable app when lifecycle gates allow it, then record acceptance separately. No runtime or default-UI pixel equivalence is inferred from the source checks.
