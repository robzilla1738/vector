# Aux redesign — visual QA

## Current-site controls — 2026-09-20

- Added a compact neutral trust/data dialog reached from the site icon in both tab
  layouts. It uses the shell's existing typography, 1 px outlines, control heights,
  rounded groups and restrained status colors rather than introducing a colored wash.
- The trusted shell temporarily dims and blurs the page while the dialog is open,
  keeping site-supplied content from covering the permission/data controls. Reduced
  transparency receives an opaque background. Escape, outside click and the close
  button dismiss it; close restores keyboard focus to the visible site icon.
- Inspected the populated vertical-layout state at 1200 × 944 in
  `release/test-artifacts/aux-site-controls.png`. The origin, local-connection state,
  cookie count, permission rows and destructive action hierarchy remained readable
  without a heavy blue focus treatment or additional toolbar.

## Reference and scope

Primary reference: the user's Aside screenshots, supplied September 19, 2026.
Home/sidebar: `codex-clipboard-f284c2c1-faf4-44a9-a655-bc7d28d0ad32.png`.
Conversation: `codex-clipboard-361098ed-20a4-4e30-916a-b48f8df50957.png`.
Settings: `codex-clipboard-3e8e5c35-08e7-4201-9013-31296db6bb11.png`.
Horizontal layout: `codex-clipboard-6f3e9989-d58e-4e07-8d8d-18cb5d4c1ea0.png`.
Source attachment directory:
`/var/folders/1j/bkszg0h10ng2tfhcbdk94cpm0000gp/T/`.

Reference content is visual evidence, not authorization to implement all depicted
features. Aux's actual runtime and persisted data drive these screens.

## Rendered evidence

Actual unsigned packaged Electron app, isolated temporary profiles, synthetic
conversation history and a real local browser fixture. No personal credentials.
Screenshots are in `release/test-artifacts/`:

- `aux-home-populated.png`: restrained home, Search/Ask, recent response cards.
- `aux-conversation-populated.png`: two persisted turns, work history, captured
  image, fixed bottom composer and operational setup/context controls.
- `aux-appearance-review.png`: dedicated category navigation and grouped rows.
- `aux-sidebar-collapsed.png`: collapsed sidebar alongside native browser content.
- `aux-settings-horizontal.png`, `aux-settings-light.png`: layout/theme options.
- `aux-reduced-transparency.png`: solid accessibility fallback.

Home/conversation capture uses a 1200×944 logical window, approximately the
cropped source window at 2× density. Settings uses 1710×990. Screenshots capture
the shell WebContentsView, so native traffic lights and desktop margin differ.
The local order fixture supplies intentionally simple screenshot content.

## Findings addressed

- Toolbar excess leading space removed; browser address is visually restrained.
- Bookmark favicon size bounded; folders and actions share Lucide line icons.
- Settings no longer squeezed by an open agent rail; grouped rows align controls.
- Foreground remains crisp while only the sidebar backdrop blurs.
- Search/composer focus uses a rounded outer ring rather than a rectangular inner
  input outline. Keyboard focus remains visible.
- System theme follows OS changes; reduced motion removes transitions; reduced
  transparency disables native/CSS glass. Sidebar separator supports keyboard use.
- Native page bounds follow sidebar transitions. Horizontal/vertical switching
  retains tabs and selected page.

## Assessment and remaining gaps

Ready for private hands-on design review, not a claim of pixel-perfect parity or
production qualification. The source has fewer sidebar items; Aux retains spaces,
folders and saved Tasks. Conversation rendering retains existing runtime statuses
and work details. Larger markdown/history improvements follow user review.

Native macOS vibrancy is implemented; literal AppKit Liquid Glass and the final
Aux application icon/bundle migration remain separate. Shell screenshots cannot
fully qualify desktop-dependent vibrancy against every wallpaper. Review that
material in the running app with light and dark desktop backgrounds.

One earlier Library smoke run failed after a sidebar transition. A subsequent
full run passed with a runtime assertion that the bookmark survived. Root cause
was not established; retain this regression check rather than claim a diagnosis.
Real authenticated provider/agent sessions remain unqualified. Routines, global
mini popup, voice and public sharing are not represented by placeholder controls.

## Connected provider and human control — 2026-09-20

`release/test-artifacts/aux-openai-compatible-settings.png` shows the dedicated
Models page with one conditional endpoint field, the masked encrypted credential,
exact selected model and successful connection health. The compatible-provider
destination does not add another permanent shell control or expose advanced knobs.

`release/test-artifacts/aux-agent-human-control.png` shows the full-page conversation
after the hand action opened the real task tab and paused the streamed run. The
compact hold banner aligns with the conversation column, the task preview remains
linked at right, and Return control is the single primary action. Both renders keep
the neutral charcoal hierarchy and fine outlines. The amber intervention state is
reserved for a current human hold rather than used as general shell tint.

## Conversation sources — 2026-09-20

`release/test-artifacts/aux-conversation-sources.png` shows two real persisted page
sources expanded below a completed answer. The section reuses the compact work-history
rhythm: one fine divider, quiet title/count, two low-density rows and one concise
provenance limitation. Source links use the existing open icon and neutral hover
surface. Screenshot review exposed a failed task-preview image; the preview now
falls back to a deliberate URL card rather than rendering a broken image glyph.

Final package verification: both desktop smoke journeys passed again after the
rounded-focus change, including the post-transition persisted bookmark assertion.
Final home screenshot was inspected and the focus-ring defect is resolved. Light
appearance and horizontal tabs were also inspected. No external release created.

## Conversation answer follow-through

Added and inspected `release/test-artifacts/aux-formatted-answer.png` from the real
packaged shell. Lists, emphasis, table rows, code/copy and quoted text now render.
The first capture exposed missing list markers from the global reset; explicit
list styles correct this. Web links use a readable blue in dark/light appearance.
Home excerpts use GFM parsing and bounded height to avoid raw table syntax.
The packaged journey verifies clipboard contents and opens the answer's local
fixture link as an actual native browser tab before returning to the conversation.

## Conversation lifecycle — 2026-09-20

`release/test-artifacts/aux-conversation-lifecycle-archived.png` shows the real
desktop shell after a chat was renamed and archived. Active/Archived uses the same
quiet neutral segmented treatment as Search/Ask. The list preserves generous
spacing, fine separators and one aligned ellipsis action. Rename remains inline;
archive/restore and the two-step destructive action use a compact frosted menu with
a solid reduced-transparency fallback. A full restart retained the title and archive
state before restore and deletion. The linked browser tab remained in Aux after all
conversation-owned records and artifact files were removed.

## Superseding visual correction — original Aux sidebar, neutral blur

The user's later correction supersedes the initial Aside-style information
architecture and all tint guidance above. Sidebar structure was recovered from
`bb7b808:apps/desktop/renderer/src/components/Sidebar.tsx`: navigation/address,
pinned sites, spaces, folders, loose tabs. Compact lower navigation retains chats,
tasks and Library without replacing that hierarchy.

Actual packaged app captured at 1200×944 logical pixels, matching the cropped
Aside home window. Native window capture includes macOS controls and the material:

- `release/test-artifacts/aux-native-frosted.png`: populated sidebar and recent
  conversations over a controlled diagonal grayscale background window. Visible
  blurred luminance variation confirms native translucency; text/icons stay crisp.
- `release/test-artifacts/aux-native-solid.png`: same background, solid mode.
- `release/test-artifacts/aux-shell-restored.png`: renderer geometry capture.
- `release/test-artifacts/aux-neutral-appearance.png`: tint control removed.

Inspected these alongside the supplied expanded Aside screenshot. Main surface
has one continuous 18px rounded outline, including upper/lower left corners;
sidebar divider/shadow removed. Original sidebar shadows on pins/address were
removed after the first inspection. Selected rows and Search/Ask use soft neutral
surfaces. Keyboard focus uses one fine neutral line. Dashed empty-state containers
and prominent instructional copy no longer compete with the home composition.

The populated-shell check verifies pins, folders, space menu, collapse/expand and
appearance controls. Packaged browser/Library/task/MCP and conversation journeys
pass after adapting their navigation to the restored sidebar. The material capture
uses only the temporary Aux test window and a synthetic backdrop, not personal
application content. No publishing or credential-store access occurred.

## Saved replies and composer switching

`aux-saved-reply.png` captures a reply restored after switching chats and reloading.
The initial capture exposed a hidden horizontal scroll offset in `.main-col` after
moving through the side panel. Changed its paint clipping from hidden overflow to
clip and added a zero-offset assertion to the same packaged user journey. This
also addresses the partially clipped home placeholder seen after leaving Settings.
No shell layout or material redesign accompanies this continuity fix.


## Development history review — 2026-09-19

Actual Electron renderer at 1200×944: `aux-history-search.png` and
`aux-history-earlier.png` in release/test-artifacts. Synthetic history reaches
beyond the former 500-turn cap. Search returns one conversation for a match in an
older turn; loading earlier messages reveals the original prompt. Screenshot
inspection caught and corrected a doubled neutral input focus border. These
captures verify history layout, not a new native-material qualification.


## Bookmark portability — 2026-09-19

Reviewed `aux-bookmark-import.png` and `aux-bookmark-library.png` from the actual
development Electron shell at 1200×944. Import preview is bounded, disclosures
and action buttons remain visible, and Library retains its neutral surfaces.
Replaced the search input’s rectangular focus outline with a rounded field border.
Capture waits for the dialog entrance animation to finish.


## Download controls — 2026-09-19

Actual development shell at 1200×944: `aux-download-paused.png` and
`aux-download-results.png`. Native page content is outside the renderer capture;
the shelf itself shows real download events. Pause/Resume/Cancel and completed
Open/Reveal controls align in the existing shelf. Corrected the zero-byte progress
label caught in screenshot review. Native-file contents were separately compared
byte for byte with the local fixture.

### Native page recovery — 2026-09-19

Inspected `release/test-artifacts/aux-page-crashed.png` and
`aux-page-load-failed.png` at 1200×944 logical pixels. Recovery uses the existing
neutral shell, rounded content boundary, aligned actions and readable messages.
Corrected Chromium's internal error URL leaking into the sidebar, stopped the
failed-page progress indicator, and added clear crash-message punctuation.
Validated both retry and back navigation in the same native tab. These screens
use an isolated profile; they do not replace the prior populated-sidebar and
native-frosted-background visual checks. No bundle built.

### Website permissions — 2026-09-19

Reviewed `release/test-artifacts/aux-site-permissions.png` in the development app
at 1200×944 logical pixels. Dedicated category, neutral search field, grouped site
headers, readable Allowed/Blocked labels and aligned reset actions. Used synthetic
sites and no hardware access. Search, persistence and save-error recovery verified.

### PDF command — 2026-09-19

Inspected `release/test-artifacts/aux-pdf-command.png` at 1200×944. Corrected a
rectangular inner focus outline with a single neutral field boundary. Exact
commands precede Ask, with the PDF command selected by default for its full name.
Removed redundant preparing toasts and replaced raw filesystem failures with an
actionable save message. Actual multipage PDF text and pagination verified.

### Task editing continuity — 2026-09-19

Reviewed `release/test-artifacts/aux-task-draft-conflict.png` at 1200×944. Replaced
cramped task drawer with full-page content and moved the conflict notice above the
editor. Neutral grouped conflict review, readable saved objective/criteria, sticky
heading, preserved browser sidebar. Hidden underlying content is inert. Existing
task evidence/review journey passes in --tasks-only mode; broader bookmark/sidebar
regression remains explicitly open in AUX-PROGRESS.md.

### Task receipt export — 2026-09-19

Inspected `release/test-artifacts/aux-receipt-export.png` in the real development
app. Compact neutral export group, explicit captured-text checkbox, readable scope
and outcome message; retained evidence/acceptance context below. Actual Markdown
contents verified with runtime-captured synthetic evidence. No external publication.

## Supplied Aux artwork — 2026-09-19

Inspected refreshed `aux-shell-restored.png` and `aux-native-frosted.png`
from the development executable at 1200×944. The supplied ivory mark is crisp
and centered above search; original pins/spaces/folders remain, with neutral
frost and continuous rounded content outline. No added color wash. Also
inspected `aux-task-resources.png` after saved references were revised and a
linked tab closed. No duplicated resource controls remain.

## First-review minimal shell correction — 2026-09-19

Inspected actual native captures: `aux-native-frosted.png`,
`aux-clean-web-agent.png`, `aux-clean-collapsed.png`, and refreshed
`aux-neutral-appearance.png`. Vertical mode has no content toolbar; native
webpage begins within 8px of the window top. Sidebar reaches zero width, with
edge restoration verified. Original hierarchy and underlying saved tabs stay
intact. Footer is a single sparse row. Agent status badges are quieter. Material
uses under-window macOS vibrancy and no added color wash. Keyboard address focus
works after collapse. Horizontal tabs retain their toolbar. Supplied Aux artwork
is unchanged. Full AppKit Liquid Glass remains unsupported by the current shell.

## New-chat continuity — 2026-09-20

Inspected `release/test-artifacts/aux-new-chat-continuity.png` at 1200×944 after a
renderer restart and after closing the previously selected context tab. The new-chat
prompt remains in the bottom composer, context falls back honestly to New browser
tab, and the compact model/permission/task controls stay aligned. The same draft is
available in the alongside-page agent panel; saved conversations remain independent.
The companion `aux-home-ask-continuity.png` confirms the restored Ask selection and
prompt stay within the restrained home composition without changing card density or
introducing a colored focus ring.

## Durable closed-tab recovery — 2026-09-20

Inspected `release/test-artifacts/aux-tab-recovery-after-restart.png` at 1200×944
after closing a tab, fully restarting Aux and reopening it from another space. The
restored tab returns to its original position below the existing folder; the foldered
tab, space identity, restrained selected row, original sidebar hierarchy and rounded
content boundary remain coherent. The fixture page is intentionally blank so this
capture evaluates the populated recovery state without personal browsing content.
Private recovery storage was separately verified absent after closing a synthetic
private tab. No bundle was built.

## Package-aware workspace environment — 2026-09-20

Inspected `release/test-artifacts/aux-project-workspace.png` in the real task and
managed-checkout journey. The compact JavaScript row identifies the package manager,
lockfile and declared `site` workspace. One quiet disclosure reveals the discovered
`site-preview` package, marks it affected by the changed fixture source, and explains
why without adding another settings surface. The single affected-check action loads
its exact neutral-focused command before native review; per-package dev/check actions
remain available on the same row. The fixture completes setup and affected checks,
multi-service preview, edit and restart recovery; no repository code ran during
inspection and no bundle was built.

## Interrupted conversation retry — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-interrupted.png` and
`release/test-artifacts/aux-conversation-retried.png` from the restarted native app.
The interrupted turn stays readable with its compact status and work history, the
linked browser preview remains available, and retry creates a second turn in the
same composition. Only the newest turn keeps the quiet retry action; the historic
turn is visually stable and cannot invite a rejected duplicate. The empty lower
composer and neutral shell remain aligned with the existing conversation design.
The fixture intentionally has no model credential, so the new turn shows the real
setup error rather than implying provider success. No bundle was built.

## Model connection health — 2026-09-20

Inspected `release/test-artifacts/aux-model-health.png` in the native settings page.
The exact provider and model remain readable at normal width, while the last tested
state and timestamp occupy a separate quiet line below the controls. The state uses
the existing semantic error color without adding a card, badge or new preference.
Changing the model removes the stale line. The screenshot uses seeded nonsecret
health metadata and makes no provider request; no credential store or bundle was
involved.

## Provider failure recovery — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-provider-recovery.png` and
`release/test-artifacts/aux-conversation-provider-settings.png` in the native app.
The stopped turn uses one restrained neutral surface, a single semantic warning
icon, a readable two-line explanation and one recovery button. The earlier duplicate
toolbar action was removed after comparison. Retry remains inside the conversation;
connection failures open the existing Models category without another dialog or
settings surface. The composer, linked browser preview, original Aux sidebar and
rounded main-content boundary remain unchanged. Both captures use synthetic local
content and seeded safe failure metadata; no provider request or bundle was used.

## Conversation context inspection — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-context.png` in the native app.
Context stays behind a single compact composer action. Its expanded neutral glass
surface aligns to the composer width, keeps the explanation and close affordance
quiet, and presents each prior turn as one readable checkbox row with a short human
summary. The selected count updates in place. Turning history off disables the rows
without deleting the conversation. Browser-tab, workspace, permission and model
controls retain their existing order and density. Reduced Transparency receives a
solid equivalent. The capture uses an isolated local page and synthetic run history.

## Local document conversation context — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-document-context.png` in the
native app at the same shell size. Local documents sit below previous turns inside
the existing Context surface rather than adding another composer control. The attach
button, selected count, checkbox, file metadata, excerpt and remove action share the
same compact alignment and neutral focus treatment. The panel remains readable above
the fixed composer and does not displace the linked-page preview. The journey used a
synthetic temporary document, restarted Aux, and confirmed the saved snapshot rather
than the subsequently changed source file. No real local document or provider was
opened.

## Generated artifact conversation context — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-artifact-context.png` in the
native app. The generated-output group continues the same panel hierarchy below
local documents, with one compact selected row showing the human filename, source
turn, size and excerpt. It adds no permanent composer control and the total Context
count updates in place. The panel stays within the conversation column at the
reference window size and preserves the linked-browser preview. The capture used a
synthetic Markdown artifact and isolated profile; its runtime filesystem path never
appears in the rendered or conversation API state.

## Workspace memory in conversation context — 2026-09-20

Inspected `release/test-artifacts/aux-conversation-workspace-memory.png` in the
native app. Workspace selection and the shared note live inside the existing Context
surface, between turn history and one-off documents. The select, neutral textarea,
revision line and quiet Save action align with the panel grid; the selected workspace
also replaces the generic composer label. The expanded panel fits the reference
window without covering the reply field or linked-browser preview. The screenshot
uses a synthetic workspace and isolated profile. It makes no cloud-sync claim.

## Conversation report export — 2026-09-20

The refreshed `release/test-artifacts/aux-conversation-artifact-context.png` shows
the export affordance as a single 14px Lucide download mark in the conversation
header beside the existing agent-panel control. It uses the same quiet hover target,
baseline and spacing as other shell icons and adds no toolbar or menu surface. The
native journey saved and inspected the Markdown output; hidden context and local
paths remain absent.

## Reviewed project-session resume — 2026-09-20

Inspected `release/test-artifacts/aux-project-resume.png` after a complete Aux exit
and relaunch. The current service and retained interrupted record appear together,
with the exact command, task revision, saved output, stop action, recovery guidance
and quiet **Review and restart service** control aligned in the existing task page.
The recovered localhost preview is the only remaining browser tab. No repository
process started before native approval, and no bundle was built.
