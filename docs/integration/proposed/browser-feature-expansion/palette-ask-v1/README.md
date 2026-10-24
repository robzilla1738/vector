# Explicit query handoff to the supplied Ask composer

Inactive successor; the accepted app, native tree and a4 resource stage are unchanged.

The current palette has an Ask Aux command that toggles the panel, but no explicit result carrying the typed query. This adds **Open Ask composer / Review** after existing result sections. Normal search ordering, default Enter selection, empty input, opening/cancelling the palette and all supplied classes remain unchanged. Selecting the row opens a new tab in the originating window with the existing editable Ask composer. It does not submit, attach page context, call a provider, or claim web research with sources.

The supplied `newtab-editor-u_GbForB.js` already reads `mode=ask` and `q`, builds its original editor, and submits only through its ordinary `onAskSubmit` path. Its current staged hash and exact input anchors are recorded in `check-result.json`; no editor changes are needed. This keeps the existing permission/provider/session flow intact.

## Integrator steps

1. Copy `source/aux-palette-ask.mjs` to `vendor/provided/aux-palette-ask.mjs`. Compose `transformAuxPaletteAsk` after the current post-identity navigation/productivity/files/media/developer transforms. It edits only the supplied tabsearch asset, with two count-one substitutions and one helper append. Add the adapter to the pinned stage/ledger composition; never edit generated assets as source.
2. Apply `native-overlay.json` to the current composed `chrome/browser/ui/views/frame/aux_tab_search_bubble.cc`, requiring exact input SHA and all five count-one changes. `baseline/` and `source/` are the exact before/after images. Do not replace unrelated new root edits wholesale. The patch adds the existing profile-epoch header and `net/base/url_util.h`; existing Chromium net dependencies must remain available to this owner.
3. No schema, histogram, new command ID or registration change is needed: existing `commitCommand` accepts an object and dispatches non-organization kinds synchronously to `CommitAuxCommand`. The new request is `{kind:'ask',generation,text}`. Native code selects the fixed installed Agent destination and URL-encodes both parameters; renderer-selected URLs/profiles are never accepted for this action.
4. Root owns actual native compile, projected source pins, resource stage replay and successor package. Reuse one targeted actual-app check later: enter a query containing URL delimiters, select Open Ask composer, verify unchanged text in Ask and no request until Submit; Escape/open alone must not create a tab. Check stale window/profile/navigation refusal. No provider spend is needed for the handoff check.

## Authority and lifecycle

The existing real search binding checks the originating window, profile, active WebContents, navigation-entry identity and one-use generation. An Ask-specific epoch is captured when that invocation begins. Dispatch requires the current admitted profile, unchanged epoch, enabled installed Agent and actual Ask command availability, supported palette mode, bounded valid UTF-8 text, and no pending navigation. Native consumes the generation before closing the palette, then rechecks weak window/profile/target, epoch, actual active target and navigation ID before navigating. It acknowledges success only when Navigate returns a distinct WebContents inserted in that exact window/profile, with the exact requested pending/committed URL and unchanged admitted profile epoch; this confirms handoff, not rendered-page readiness. There is no async account lookup, foreign-window fallback, automatic retry, cancellation that secretly sends, or provider work.

## Evidence and limits

`check.mjs` ran once against the actual a4 tabsearch/editor sources: explicit ordering/modes, exact query payload, propagated native failure, double-application refusal, generated module syntax, unchanged CSS classes and exact native replay passed. This is lean source/model evidence, not native compilation or app observation. No app/process lifecycle, owner state, provider request, signing or build was performed.

Native catalog verification: selected `aux_keyboard_shortcuts.mm` registers `{34068, "ask-aux", "Ask Aux"}`; `GetNavigationCommandCatalog` emits its exact id and real enabled state into `GetAuxCommandContext`. The row filter uses that actual contract. The native output check uses the real `NavigateParams::navigated_or_inserted_contents` output, whose header explicitly permits null when insertion failed.
