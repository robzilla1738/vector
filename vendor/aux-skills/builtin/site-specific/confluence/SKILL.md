---
name: confluence
siteSpecific: true
description: Confluence Cloud page and editor guidance.
icon: "https://app.getaux.co/builtin-skills/v1/confluence.svg"
autoInject:
  url:
    - "*.atlassian.net/wiki/**"
---

# Confluence Cloud

## Addresses

- A page: `https://${site}.atlassian.net/wiki/spaces/${spaceKey}/pages/${pageId}/${title}`

## How to work

- Find the page with search, then move to its canonical page URL.
- Rely on the page id; titles can change.
- Edit from the page itself instead of going through nested space menus.

## Keys

| Action | Keys |
| --- | --- |
| New page | `Cmd/Ctrl+Option+C` |
| Edit this page | `E` |
| Insert a link | `Cmd/Ctrl+K` |
| Bold / italic / underline | `Cmd/Ctrl+B` / `Cmd/Ctrl+I` / `Cmd/Ctrl+U` |
| Heading 1–6 | `Cmd/Ctrl+Option+1` … `Cmd/Ctrl+Option+6` |
| Macro picker | `Cmd/Ctrl+Shift+A` |

While typing in the editor: `/` opens quick insert, `@` mentions someone, `[]` then `Space` makes an action item, and `<>` then `Space` makes a decision.
