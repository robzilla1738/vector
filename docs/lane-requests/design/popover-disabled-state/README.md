# Disabled popover interaction styling

The original trigger rule applied its hover/open ink and background even to an unavailable native button. Add `:not(:disabled)` to that one selector, following the supplied toolbar control disabled-hover exclusion and the existing Aux ContextPicker control recipe. No other stylesheet or production JavaScript changes. Aux naming, layout, focus, material, light/dark, reduced-motion and reduced-transparency rules are retained.

The mounted real Popover control covers disabled click refusal, same original trigger on enable/open, actual panel input focus, disabled expanded selector refusal, closing on disable, and re-enable/Escape focus restoration. The expanded selector probe is source matching, not hover pixels. Original CSS fails its disabled expanded assertion; corrected source and original neighbor controls pass. Native/F21 appearance remains pending.

Raw logs: `/tmp/aux-popover-disabled-original-controls.log` (original reproduction), `/tmp/aux-popover-disabled-controls-002.log` (six cases/three files), `/tmp/aux-popover-disabled-types-003.log`, `/tmp/aux-popover-disabled-lint-002.log`. No Vite build or JS reserve claim.

Initial type checks retained a possibly-undefined regex capture fixture diagnostic; the final fixture asserts the original required rule capture, without changing runtime expectations.
