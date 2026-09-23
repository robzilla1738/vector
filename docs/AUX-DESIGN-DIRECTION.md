# Aux visual direction: Aside parity

The current direction (updated 2026-09-23) is close visual and interaction parity with
Aside, retaining Aux branding and real Aux functionality. This supersedes the
earlier ZCode palette, Inter typography, sidebar address bar and minimal-shell
direction. Do not reintroduce those choices as design requirements.

## Reference and tokens

Reference: the installed Aside Agent Manager bundle version 1.26.921.1617,
including its compiled global CSS, new-tab, sidebar, chat and task components,
plus inspection of the running native Aside application.

Use Geist Variable and Geist Mono from their font packages. Keep the Aux mark;
do not copy Aside's proprietary display font, wordmark or account identity.
Use the reference's 4px spacing rhythm, 0.5px hairlines, 1.4 squircle factor,
150ms hover/focus transitions and 240ms layout transitions. Respect reduced
motion and increased contrast.

Dark background is oklch(20.5% 0 0), popovers 26.9%, foreground 98.5%.
Light background is white and foreground 14.5%. Secondary text and surfaces
use a neutral alpha hierarchy rather than separate tinted grays. Secondary text
uses 72% ink and glass secondary labels use 85% ink for readability.
The content material defaults to a 95% background. Menus use an 80% popover color
with an 8px backdrop blur and solid reduced-transparency fallback.
Interface icons use the user-supplied Central Icons paths, retaining their
24px viewboxes and 1.5px strokes at the shell's 14/16/20px sizes.

The sidebar is transparent over Electron's macOS native vibrancy.
Do not paint an opaque CSS canvas over that material. Solid mode and the OS
reduced-transparency preference remain supported. Settings expose four native
materials (Liquid Glass, title bar, sidebar, under window), 0–60% independent sidebar tint,
and 80–100% content opacity. Defaults are Liquid Glass, zero extra tint, and 95%
content opacity. Reset restores these together. Native effect opacity stays at
100%: lowering it also weakens the blur and exposes sharp background content.
These are user-requested customization controls, not source-derived Aside values.
Liquid Glass uses public AppKit NSGlassEffectView on macOS 26+, with titlebar
vibrancy fallback on older macOS. The native material is not promised pixel-identical across
OS versions, wallpapers and activation states.

## Shell and navigation
The [September 23 checkpoint](ui/design-update-2026-09-23.md) is the detailed
implementation reference. Preserve Aux's palette and brand. New profiles default
to horizontal tabs with rounded top corners, lower corner joins, a compact native
glass strip, group chips and pin tray. The selected tab merges into the URL area
without an underline. Settings and tab menus can switch layouts.

Prefer spacing and soft surfaces over hard divider lines. Buttons and fields on
work/Settings screens use a common 36px height and corner treatment. Chat-row
pickers and delete confirmation extend their parent surface; they are not nested
black popovers. Jump to latest is a floating arrow with no extra layout row.



- On a loaded page the toolbar leaves the layout. The page sits flush under
  the window and keeps the main column's corner. The address row and its
  icons float in together when the pointer reaches the top of the page or
  the field is focused, and they leave when the pointer does. A frost on
  the page fades out by the bottom of that row, and the URL and buttons
  stay clickable. Touch keeps the row in the layout. Reduced motion removes
  the transition. Command-L focuses the row, except on a new tab, where it
  focuses the hero field. The Tab hint on that hero matches the Search and
  Ask pills.
- Sidebar: collapse control, bookmarks/pins, Chats with New chat and recent
  conversations, then Tabs/folders. Put the local profile/space control below.
- Collapse completely, with no logo strip. In Vertical mode, hover the left edge to reveal an inset glass preview over
  the page without resizing it. Expanded mode remains a persistent column;
  horizontal chat navigation opens by click. The toolbar keeps an explicit reopen
  button available on reveal. With the sidebar hidden, a chat title uses
  the traffic-light inset.
- Keep a continuous rounded main surface, compact controls, quiet selected rows
  and visible keyboard focus. Preserve resize, drag/drop and keyboard behavior.
- Retain actual Aux spaces, saved tasks, browser tools and agent panel.
  Do not invent billing, a cloud account or unsupported reference features.
- The new-tab page uses the reference's restrained logo/search composition:
  64px mark, 48px gap, 54px input, 32px Search/Ask segmented control, and
  a 1152px content maximum. Recent chat cards and routines use real saved data.

## Chats, tasks and settings

Full-page empty chats center a subdued Aux mark and use a bottom composer capped
at 880px, with Add context and existing attachment/browser-context actions.
The composer is the reply field, dictation, and send. Paste still adds
images. Dictation is reviewed locally before insertion; active-run safety
gates remain intact. The chat surface is opaque, so a page kept alive under
the shell does not show through the messages. A conversation with a web tab
shows that page's preview beside the messages as soon as the chat opens.
The globe hides it, and a narrow column hides it. The preview is a capture
of the real tab. History cards show saved answers and do not invent activity.
Show successful answers once, without a duplicate completion badge/status summary.
Keep partial-result and failure notices. Work history starts collapsed in chat.
Task promotion is optional under Options → Save as task, never an automatic form
above the composer, and never consumes an unsent reply. The existing AI SDK
7.0.93 streaming runtime is unchanged.

The in-app brand mark is `renderer/public/arch-mark.svg`. The native icon master
is `brand/aux-icon-1024.png`: the supplied silver artwork with a clean geometric
outer mask, filling the 1024px canvas (no extra inset). `node scripts/make-icon.mjs`
regenerates the ICNS, complete iconset and renderer About icon.

Saved tasks open on a card index with search and a deliberate New task action;
editing is a separate selected state. Routines and schedules use the existing
runtime. Settings use the same typography, surface and control tokens as the
shell, with Translucent/Solid as the material choice.

## Boundaries and verification

Visual parity does not authorize removal of safety, accessibility or data
integrity controls. Keep errors, permissions, unsent drafts, task ownership and
unresolved-action gates visible and operational. Stored explicit preferences
are honored; new profiles default to translucent material.

Validate native dark/light windows as well as populated mock screens. Browser
previews cannot establish native vibrancy parity. Type checks, production builds
and UI token tests supplement visual checks; none establish full product or
live-provider qualification. No external model calls are needed for visual QA.

The related ZCode inspiration document is historical background, not an
authority for the current palette, layout or typography.
