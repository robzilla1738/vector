# Task lists, projects, routines and memories

Status: **ready** for the behaviors and explicit dimensions below. Exact route screenshots and all hover timings remain **draft**. Sources: SP2-S1/S2/S3 in `provenance-sp2.md`.

## Shared route behavior

Account-scoped routes resolve the selected local account before data access. Never leak another account's tasks or private-session content through caches. Loading is distinct from empty and failure. Preserve filters/drafts while reconnecting. A mutation shows pending state, commits after daemon success and gives a retryable error on failure. All row menus are keyboard reachable.

Settings and content pages use a scrollable main column, often maximum 672px with 32px horizontal, 64px top and 160px bottom padding. Page title is DM Sans 30px medium for major secondary routes; settings title 24px weight near 450. Use semantic tokens and original copy, not reference prose.

## Tasks and chats

The task list route combines 44px header, toolbar, scrolling results and a task composer. Main task content maximum 1120px with 24px side padding and 12px vertical padding/gaps. Toolbar includes status filter (all/running/failed/review-needed/done), list/card display, text search, newest/oldest sorting and project scope. Rows show title, status, recent activity and useful preview; clicking opens the actual session. Preserve selection when list refreshes. List skeletons match row geometry. Card grid is 1 column by default, 2 at small breakpoint, 4 at large breakpoint, 16px gaps and 14px rounded cards. List rows have 36px compact variant. A promoted-task grid uses maximum 827px and auto-fit cells at least min(available width,240px), 16px gaps.

Task menus support backend-permitted pin, read/unread, archive/unarchive, delete, rename and project move. Destructive delete confirms and reports mutation failure. Search results must derive from daemon records rather than static fixtures. Chats and tasks represent the same underlying sessions, with different navigation contexts.

## Inbox

Maximum 672px centered column. Show site notification subscriptions with favicon/domain/grant state and recent notification rows with source, time, title/body and task link where available. Revoking a grant confirms the effect, calls the daemon, then removes/updates the source. Notification bodies preserve line breaks and wrap long content, limited to four-line preview. Empty subscriptions and empty notification history are independent. Source icons use 32px rounded cells and 20px glyphs. Revocation/loading failures are visible.

## Projects

List active projects with an archived-project submenu and create action. Empty state is centered, minimum 288px high, with original 56px rounded illustration tile, 18px heading and 14px explanation. A project binds title, instructions, workspace directory, related tasks, files and project skills. Create/edit dialog validates title and path, shows actual daemon validation errors and preserves fields until success. Archive is reversible; delete semantics follow daemon contract and require confirmation if data is removed.

Project detail presents tasks and instructions, a workspace picker/open action, files with rename/delete/upload, and skills. Skills page separates user-authored, built-in and system categories. Skill rows minimum 56px with 36px icon, 14px title and 12px secondary text. Create skill asks name, purpose and instructions; editor dialog maximum width 768px and height min(736px,viewport minus32px), instructions editor min176px/max min384px,42vh. Import selects a folder; built-in customization creates a user-owned copy. Toggle enablement, edit/read files and delete only where allowed. Built-in/system originals are not overwritten by customization.

## Routines

List routines and create/edit a routine using title, instruction, schedule/timezone, enabled state and task/project/model association as provided by daemon. Rows are 48px high, show next/last run and state, and expose enable/disable, run now, edit and remove. Run-now creates an actual task and links it. Suggestions are clearly suggestions until accepted. Schedule preview uses chosen timezone and must handle invalid input explicitly. Cloud-only pending-sync/upgrade controls are hidden locally.

## Memories

Show local memory directory/file tree, selected file content and an edit/save control backed by memory APIs. List revision history with timestamp and summary; open a revision before reverting, confirm replacement and refresh current file after success. Extraction rerun and consolidation actions display actual progress/result/error. Cross-session memory state belongs to daemon storage. Never silently create remembered facts from mere UI interaction. The settings subsection enables generation and retention; episodic choices observed are no expiry, 30 days and 90 days.

## Archived sessions and statistics

Archived session route lists retained sessions, supports opening, restoring, permanent deletion and pagination. Deletion explicitly removes the session/messages and requires confirmation. Loading, empty, failed fetch and mutation failure are distinct. Statistics show total sessions, last activity, average sessions/week and a day/week activity heatmap with legend and readable dates/counts. Overview metric grid has 3 columns, 8px gap, 12px side/8px vertical card inset. Heatmap cells are 11px square, 2px radius; the chart scrolls horizontally instead of shrinking labels beyond legibility. Values come from local records; do not invent counts.

## Remaining acceptance

Exercise route navigation and all described mutations against a real local daemon; verify empty/loading/error and narrow width. Exact reference screenshot placement, unknown project file conflict handling and routine timezone default require later evidence; do not infer backend schemas from this UI description.
