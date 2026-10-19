# Mini popup, tab search, overlays and isolated frames

Status: **ready** for explicitly described interactions and dimensions. Exact overlay placement relative to native windows, animations not measured below and visual baselines **draft**. Sources SP2-U4 and SP2-X1 in `provenance-sp2.md`.

## Tab search

Native host target is620×340px; web body height340px. Input header44px with12px horizontal inset,18px icon,10px gap and16px input. Scrollable results inset8px horizontal/4px vertical. Section captions12px semibold,8px side/6px vertical inset. Rows32px high with8px side padding/gap,14/20px medium text,11.2px radius and18px icons. Selected row secondary fill. Subtitle/time/action12px. Original placeholder/copy in catalog.

On open, focus/select input and refresh open tabs, recently closed tabs, recent tasks and enabled usable extensions. Empty query shows at most2per visible group. Nonempty query searches tasks/history/bookmarks, filters tab/closed/extension metadata case-insensitively and uses at most50per group. Fetch closed sessions up to25. Search debounce80ms; cancel obsolete requests and ignore stale revisions. Groups order: extensions, open tabs, recently closed, tasks, saved pages, history; omit empty groups. History/bookmark entries exclude browser-internal/extension URLs; Aux task tabs may appear where permitted.

Up/Down wraps flat visible results; Enter activates selected; IME composition does not activate. Hover changes selection; scroll selected into view. Escape and repeated Meta+Shift+A close. Tab activation focuses existing tab/window; task navigation reuses an existing matching task tab; recently closed restores session; extension action launches extension/app; other result opens URL. Close after activation. Show no-match only after current query has settled, not during a transient empty fetch.

## Global mini popup

Standalone native-hosted compact conversation uses the same backend session/draft/pickers/permissions as chat. Header40px,8px leading/10px trailing inset; window content inset6px side,4px top/2px bottom; header buttons28px with16px glyphs. Header is draggable except controls. Actions start a new task, open current task in browser and close. Input area expands in available window, transcript scrolls independently, footer inset10px. Options include private session, attachments/folder, permissions, final-action confirmations where supported, memory extraction, password access, browser profile and project. Private mode excludes persistent history/memory context. Existing text and in-flight task survive opening in browser. Global enable/shortcut belongs to native API; options route edits that preference.

## Selection and lasso

Selection handle is a32px interaction target with4px outer inset, independently drawn Aux glyph and keyboard equivalent. Preserve selected text/context until transformation completes or user dismisses. Lasso popup width336px with8px outside inset,33.6px card corners,8px inside inset and compact24px top action row. Body transcript/preview scrolls; a sampled body variant280px tall. Follow-up input28px with14px text; apply button28px with12px label. User preview has secondary fill,11.2px corners and12px horizontal/6px vertical inset.

Transformation states: idle selection, request sent, streaming chunks, complete, error, aborted. Associate stream with request ID; obsolete chunks cannot overwrite a newer selection. Apply requires a completed transform and a still-valid editable target. Error preserves original selection. Cancellation stops current request and does not apply partial content. Copy-only fallback is available when target cannot be changed. Native/content messaging must validate sender and target frame.

## Capture

Anchor is32×32px in4px outer inset with14px glyph. Floating toolbar has32px horizontal/24px top/64px bottom external breathing room, pill material,8px horizontal/4px vertical inner inset, draggable nonbutton area. Modes display44px-high,72px-wide controls with20px glyph/12px label: screen, whole page and region. Selection requires explicit rectangle; Escape cancels without capture. Full-page capture covers scroll extent and returns a real image; screen mode respects OS capture permission.

Result floats aligned toward bottom-right, outer inset16px (20px right/28px bottom),8px gaps, thumbnail with4px white border and11.2px radius. Action strip uses white pill,2px inset and32px controls with16px icons. Actions retake, copy, download and dismiss. Clipboard/download failures are shown; successful copy uses actual clipboard result. Never write image data into logs.

## Translation status

Compact glass pill with8px outer inset,8px vertical/10px leading/8px trailing inset;24px leading glyph container,20px glyph; language controls and progress/status. Language menu224px wide, at most224px tall and viewport minus16px max width, no placement animation before positioned. Auto source detection is separate from chosen target. States pending, translating, complete, failed and original/restored. Cancelling/restoring preserves original DOM state and must not corrupt page inputs. Exact translation engine behavior is daemon-owned.

## Glance, notifications, previews and frames

Glance is a full-height lightweight integration/context chooser with scrollable content and back/next navigation, showing actual detected integrations and no-more state. An inspected decorative tile region uses minimum208px height,102px square tiles and a8column grid; Aux creates its own art. Exact purpose/state handoff beyond detected integration navigation remains draft.

Notification entry displays actual granted event/source/task, allows open/dismiss and avoids duplicate dispatch on reconnect. Never request permission merely to render a notification page. Blocked page shows rule-matched address with back and single-use bypass; bypass is scoped to navigation and does not permanently disable blocking.

Live tab-preview player obtains a browser-authorized tab capture stream, uses contained video and fades in120ms. States: waiting stream, no tab, not visible, capture failed, retry. Hide/close releases media tracks and port subscriptions. No preview of private tab data in another profile. Native hover host behavior belongs to native spec.

Visual artifact frame is sandboxed from privileged extension/daemon APIs, permits only required script/form behavior and exchanges validated messages with parent. Rich output failures cannot crash the chat. Content bridge exposes page selection/readable/accessibility state and controlled browser actions with correct document/frame targeting; validate navigation changes before acting. Google Docs selection integration runs a narrow page-world bridge, never a broad privileged API.

## Acceptance

Verify tab search real data/groups/keyboard and activation; mini popup draft continuity; lasso stream/error/abort/apply; capture3modes/cancel/copy/download; translation restore/error; live preview release/retry; blocked single-use bypass; sandbox privilege isolation. Functional success is distinct from screenshot parity.
