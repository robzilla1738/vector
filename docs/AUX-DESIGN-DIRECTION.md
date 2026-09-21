# Aux visual direction: Aside parity

The current direction (2026-09-21) is close visual and interaction parity with
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
use the reference's alpha hierarchy rather than separate tinted grays.
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

- Keep the toolbar's 40px layout slot in both tab orientations, but reveal the
  URL and surrounding icons together on hover/focus with a 180ms transition.
  Touch keeps controls visible; reduced motion removes the transition.
  Command-L focuses it, except on new-tab where it focuses the hero field.
- Sidebar: collapse control, bookmarks/pins, Chats with New chat and recent
  conversations, then Tabs/folders. Put the local profile/space control below.
- Collapse completely, with no logo strip. Hover the left edge for a floating
  sidebar; the toolbar keeps an explicit reopen button available on reveal.
- Keep a continuous rounded main surface, compact controls, quiet selected rows
  and visible keyboard focus. Preserve resize, drag/drop and keyboard behavior.
- Retain actual Aux spaces, saved tasks, browser tools and agent panel.
  Do not invent billing, a cloud account or unsupported reference features.
- The new-tab page uses the reference's restrained logo/search composition:
  64px mark, 48px gap, 54px input, 32px Search/Ask segmented control, and
  a 1152px content maximum. Recent chat cards and routines use real saved data.

## Chats, tasks and settings

Empty chats show a subdued Aux mark rather than an oversized greeting.
The bottom composer has attachment, dictation and send controls, with real
permission/model/context actions underneath. Dictation is reviewed locally
before insertion; attachments and active-run safety gates remain intact.
Conversation previews render existing saved answers and never fabricate activity.
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
