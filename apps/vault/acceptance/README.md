# Vault intrinsic geometry observation

Build-facing source: approved `docs/spec/ui/visual-measurements.md` M4 and M6. Only that original specification and Aux's own current sources were read. No reference extraction scripts, bundles, stylesheet sources or owner profiles were inspected.

Implemented geometries:

- Extension popup remains600×432, independently from dialog bounds.
- Item row retains4px inset/10px gap/11.2px corners; removed the unsupported42px minimum so content determines height. Detail pane now has16.8px corners and0.5px outline; a clipped outer pane contains an independently scrolling body.
- Unlock column320px/top36px/gap40px, with an original Aux112×112 decorative frame,8px border and33.6px corners. Initial setup/recovery column is limited to448px/top32px/gap24px. No recovery-word placement or Touch ID geometry is inferred.
- Existing Vault selection now has an anchored224px native-HTML popover, viewport-minus16px maximum and min(75vh,512px) scroll limit. Native popover supplies outside-click/Escape dismissal; options preserve actual Vault IDs, checked state, focus restoration and Arrow/Home/End navigation. It does not switch accounts.
- History modal uses448px maximum width and min(85vh,640px) maximum height. Management is a distinct modal with384px maximum width and min(85vh,512px) maximum height. Existing management mutations remain unchanged; the combined security/preferences dialog has its own existing geometry rather than inheriting management limits.
- Generator uses384px maximum width,64×28/12px length input and160px slider connected to the existing generation options. History/management/generator maximum widths remain CSS maxima; their intrinsic contents determine actual width. Other item/import/recovery dialogs retain their own existing default width/height bounds.
- Neutral theme roles continue through the shared Aux tokens, including M6's N14.5/N98.5 55%-alpha muted text. No native material, unresolved sidebar role or final composited color is inferred.

Not implemented/claimed by this slice: an additional item-type submenu, icon picker, create-Vault popover, separate export dialog, real inline autofill result panel, native save/update positioning, passkey/Touch ID/recovery-word geometry or reference screenshot parity. The existing content-script actuator only opens Vault; it is not the measured308px autofill result panel, and the popup's FillReview checklist is not relabeled as suggestions. These require separate behavior slices. Shared modal focus/cancel handling is reused unchanged.

Run after building the Vault app:

```sh
node apps/vault/acceptance/geometry.mjs
```

The original React fixture mounts actual Aux AuthGate/chooser/dialog components and product CSS with synthetic content only. Its authentication callback always rejects locally; there is no daemon, native bridge, account credential or OS authorization capability. A restrictive CSP blocks connections. The observer serves only fixture JS and built original/licensed CSS/font/art assets, launches Google Chrome with a fresh temporary profile and mock Keychain, reads computed geometry/keyboard focus, takes four original screenshots, then removes the profiles and server. It prints the retained screenshot directory and measurements. `AUX_FIXTURE_CHROME` can name another authorized upstream Chromium executable. No existing browser is attached or terminated.

Observed2026-10-19: both light/dark runs at requested outer-window600×432 and900×800 passed intrinsic constraints and chooser Arrow focus. Actual JS viewport sizes were600×345 and900×713 in this headless Chrome invocation, and those actual sizes are separately recorded; height maxima followed those viewports. Popup CSS remained600×432. This is original-component/disposable observation, not proof of native popup-host geometry or a reference baseline match. Vault TypeScript, focused lint and production Vite build passed. Manifest advanced to0.2.1 for the next reused-profile worker refresh, as requested by integrator.
