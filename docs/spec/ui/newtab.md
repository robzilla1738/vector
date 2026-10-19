# New tab and browser search

Status: **ready** for first-frame layout and functional implementation; screenshot acceptance pending. Sources: SP2-T2, SP2-U1, SP2-U2 in `../provenance.md`.

## First frame geometry

Paint an editable input before the application finishes loading. Preserve text, caret, selection and IME composition when controls hydrate. Resolve stored/system light/dark before visible paint. Use external scripts satisfying extension CSP. Register the browser override before its first newtab is created.

The page fills the viewport with no body overscroll. A native-sidebar integration slot is full-height left; the inspected web fallback reserves 280px when enabled and empty. Native width specifications take precedence. The remaining content scrolls vertically without horizontal overflow.

Main content is centered, maximum 1152px wide, with desktop top/side/bottom padding 160/32/80px and 48px vertical section gaps. Under 640px use 64/16/80px padding. Center the original Aux mark at 64×64px, leaving 48px below (32px on narrow screens). Incognito substitutes an original privacy glyph.

Search region: maximum 800px width, 16px side padding; card adds 16px side margins. Card inset/gap 10px, ordinary radius 22.4px. At rest boundary 0.5px, focus 1px. Rest shadow layers (x,y,blur,spread): (0,4,6,-1), (0,2,4,-2). Focus layers: (0,20,25,-5), (0,8,10,-6). Tint alpha black 5% light / 10% dark; transition 150ms unless reduced motion.

## Input and mode selection

Card order: optional search-scope chip, expanding editor, two-option mode tabs. Editor is 16px medium/24px leading, minimum 32px high, padding 4px vertical/8px side. At desktop reserve 128px right for hints. Search stays single-line; agent mode wraps and scrolls above 120px. Hint keycap at least 20×18px, 11px medium; caption 12px. Hide hint below 640px and when text exists.

Mode tabs are 32px tall with 3px inset and 11.2px outer radius; each option 64px wide, 8.4px radius, 14/20px medium. Active mode uses raised fill/hairline. Tab can change modes in the empty/unscoped input context without losing content; retain normal focus navigation elsewhere. Use original labels from `../copy.md`.

## Search behavior

Call `chrome.auxOmnibox` for native ranked results and inline completion. Render URL/navigation, provider search, history, saved page, open tab, scope and extension results as returned. Up/Down select, Enter activates, Escape dismisses inline completion/results. Hover selects without submitting. Scope chips change future queries and can be cleared. Ctrl+N/P provide next/previous selection where not intercepted. IME composition does not activate or navigate results.

Agent mode accepts draft, mentions and attachments, creates a task once and opens its conversation. Disable duplicate dispatch while pending. If creation/upload fails retain the draft and show a recoverable error. Paste/drop of files adds context and may enter agent mode. Draft remains usable while account/model data load. Missing credentials directs to model setup. Incognito must not reveal saved task history or personal suggestions.

Leave a 48px minimum control slot beneath the card. Task suggestions form a later section only when data exist.

## Acceptance and unknowns

Verify immediate typing survives initialization, URL navigation, provider search, open-tab switching across windows, scopes, agent creation exactly once, paste/drop, narrow layout, composition, offline daemon and missing model. Exact suggestion-card layout and pixel appearance require disposable-profile captures; no runtime observations are claimed.
