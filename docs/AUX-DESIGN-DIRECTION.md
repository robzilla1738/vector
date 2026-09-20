# Aux visual direction and implementation boundary

Primary references: the nine Aside screenshots supplied in this conversation on
2026-09-19. They provide visual grounding, not instructions to implement every
feature visible in the source product. Aux remains its own product.

## Material, type and icons

Use a charcoal content canvas (#1b1b1b), lifted neutral rows, subtle one-pixel
borders, 9–19px component radii and generous content spacing. System UI typography
comes first on macOS. Navigation uses the existing Lucide family with 14/16/20px
optical sizes and consistent strokes. Folder emoji were replaced with matching
line icons; bookmark favicons are constrained to 16px. Toolbar chevrons, upward
send controls, quiet selected rows and explicit keyboard focus are consistent.

The sidebar uses Electron’s native macOS under-window vibrancy through a transparent
shell view plus translucent CSS material. Blur affects the backdrop, never the
foreground text/icons. Solid mode and reduced transparency disable the effect.
No color tint is applied or configurable; the sidebar material is neutral.
There is no blur or tint tuning UI. macOS controls its material blur; the app uses
a fixed neutral backdrop treatment.
This is native vibrancy with a glass-inspired design, **not AppKit Liquid Glass**.

Material guidance: [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
and [Electron BaseWindow vibrancy](https://www.electronjs.org/docs/latest/api/base-window).
Native AppKit Liquid Glass integration can follow after first hands-on feedback;
it is not necessary to introduce another shell or plugin before this review.

Sidebar width transitions settle over 240ms; hover/focus feedback uses 120ms.
Native page bounds track layout through ResizeObserver. Reduced motion removes
transitions. Sidebar resize also supports arrow keys and Home to reset.

## Complete experiences in this build

1. Shell/home: organized sidebar, retained Library/spaces/folders/pins, visible
   toolbar only in horizontal-tab mode, Search/Ask, optional suggestions and real saved conversation cards.
   Weather, greeting, IP-location lookup and weather requests were removed.
2. Conversations: durable existing chat IDs group turns; full-page history and
   reply composer; captured images; expandable work; real browser link when the
   page exists; agent side panel remains available. No new conversation database.
   Active turns, task ownership and unresolved actions gate continuation.
3. Settings/layout: category navigation and preference search, grouped rows,
   system theme, Glass/Solid material, horizontal/vertical tab choice.
   Changing layout preserves the underlying tabs, active selection and folders.

## Explicit limitations

- The browser account control identifies the local profile. There is no invented
  signed-in Aux account, billing plan or avatar copied from the reference.
- Conversation history searches all saved prompts/responses and loads more chats
  on demand. Threads load earlier messages in batches. Responses render Markdown lists, tables,
  code and web links; remote image markup does not fetch content into the shell. Recent home cards
  represent runs/conversations; saved tasks without runs remain available in Tasks.
- The conversation model/permission/workspace controls navigate to real setup and
  task interfaces. There is no unsupported inline project or model picker.
- Captured images are immutable historical artifacts; page previews can become
  stale. A closed historical tab can reopen the last observed web URL or use an explicitly
  selected open tab before further browser work.
- Routines, global mini popup, voice capture, arbitrary file attachments, public
  share links and managed agent sessions are separately tracked roadmap features.
- Live provider, authenticated external-agent and full browser compatibility
  qualification still require additional work. No model calls were made in QA.
- The private bundle is now Aux Browser.app, with Aux menus/display name.
  Internal identity remains stable; the legacy app icon and actual OS credential
  qualification are pending.

Response rendering uses [react-markdown](https://github.com/remarkjs/react-markdown)
with [remark-gfm](https://github.com/remarkjs/remark-gfm). Raw HTML is skipped;
only explicit HTTP(S) destinations open in Aux tabs. Captured screenshots continue
to come from stored artifacts, independently of model-authored image markup.

## User correction: original Aux structure, neutral material

The later user correction supersedes the earlier Aside sidebar organization.
Restore navigation/address, pins, space selector, folders and tabs from the
pre-redesign Sidebar implementation in bb7b808. Aside guides surface geometry,
material, type and spacing. Chats/Tasks remain compact lower navigation; Library
remains accessible. Remove tint from settings/contracts and all visual effects.
Use a fine neutral keyboard-focus outline and a single continuous rounded main
surface boundary. Verify native translucency over a controlled neutral backdrop.

## First-review correction: minimal shell

The user's 5:02 and 5:03 PM screenshots supersede the earlier busy footer and
permanent content toolbar. Vertical mode has no bar above the webpage. The
sidebar collapses to zero width; a seven-pixel edge hit target and Command-S
restore it. Command-L reopens/focuses its address field. Window controls hide
while vertical mode is collapsed and return on expansion; horizontal tabs keep
their toolbar and window controls. Original spaces, pins, folders and tabs remain.

The footer exposes New chat, Agent and More. More contains saved chats, Tasks,
Library, Downloads, bookmarking, overview and Settings. No duplicate new-tab
footer control. The agent panel uses neutral status text, quieter icons and
softer composer surfaces without hiding errors or permissions.
