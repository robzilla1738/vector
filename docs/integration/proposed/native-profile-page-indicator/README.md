# Supplied profile pager button

This is the original `ProfilePageIndicatorDotButton` leaf, recovered from the pinned supplied native image. It replaces neither the current footer nor its pager yet. The genuine pager owner must be mounted with its actual roster, selection/context actions, drag reorder and settlement lifecycle; a blank spacer or the retained 14×20 dots is not an equivalent replacement.

The source declares a 24×24 layered button. Its optional 14px vector icon is painted at(5,5); the iconless fallback is a 6px centered ellipse. Selection resolves original semantic color 221 versus 226 through the actual widget color mode. Hover, pressed and parent drag highlight all use original 247 and an 8px radius. These values come from the actual mixer/source recipes pinned by `native-agent-tabs-paint`, not earlier measured CSS.

Mouse identity and coordinate semantics matter. A left press records both local and parent coordinates. The strict 8px per-axis drag threshold compares parent coordinates, while drag-update passes the current parent point **and original local press point**. This allows the owner to calculate the dragged button's proposed left edge without losing its original local grab offset. Right-only press invokes the actual per-profile context callback. Dragged release calls `kReleased`; capture loss calls `kCaptureLost`. Neither invokes the profile selection callback. Only a left release inside a non-dragged button selects. Keyboard/accessible clicks retain the real Button callback path. Source focus behavior 2 is `ACCESSIBLE_ONLY` in 155.

`DragEnd` is an explicit 155 API spelling for the original boolean: release=false, capture-loss=true. Owner callbacks remain separate; this leaf does not write preferences, load profiles, dispatch an invented selection route, or infer profile ownership from labels. The owner sets the current state, actual selected vector icon and drag paint flag. It also supplies the tooltip and accessibility text/Control+1…9 shortcuts recovered in4631680/4651e04.

## Integration

Register the two new source paths from `manifest.json` in the existing browser UI target. No existing native file is changed. Keep it unmounted until the genuine pager owner/header proposal is complete. The parent-held callbacks must retain the real profile-path binding and owner teardown semantics. No placeholder callbacks should be mounted.

Run `python3 verify.py` for exact supplied image/function/data pins, static event-slot and coordinate/cancellation assertions,155 API pins and disposable new-file patch replay. This is static proof only; compilation and visible acceptance have not occurred. No native source, owner state or app was executed or modified.

Remaining owner recovery: ordered roster freeze/update, actual icon selector456d980, preview selection4655e40, menu456ee5c, reorder465669c and its animation/settlement. The original reorder takes `(region,from,to)`; raw registers retain those parameters even where bounded decompilation omitted them. The header 42px/border/manual bounds are recovered separately; they are intentionally not mounted without this complete owner.
