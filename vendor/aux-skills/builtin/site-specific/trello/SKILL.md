---
name: trello
siteSpecific: true
description: Trello board, inbox, and card workflow guidance.
icon: "/builtin-skills/v1/trello.svg"
autoInject:
  url:
    - trello.com
    - www.trello.com
---

# Trello

## Addresses

- Home: `https://trello.com/`
- Cards assigned to the user: `https://trello.com/u/my/cards`
- Shortcut list: `https://trello.com/shortcuts`
- A board: `https://trello.com/b/${shortLink}/${name}`

## How to work

- Use copied board and card links, not guessed deep links.
- Triage from the Inbox, and open the board only when the task needs fields that live there.
- Stay in the signed-in profile, and on the board you're already in when you can.

## Keys

| Action | Keys |
| --- | --- |
| Inbox / Planner / Board | `g` then `i` / `p` / `b` |
| Switch boards | `b` |
| Filter the board / clear the filter | `f` / `x` |
| Edit a card's title | `t` |
| New card below the hovered one | `n` |
| Archive the hovered card | `c` |
| Repeat the last action | `r` |
| Undo / redo | `z` / `Shift+z` |
| All shortcuts | `Shift+?` |

Search understands operators such as `board:`, `@me`, `due:`, `is:open` and `has:attachments`.
