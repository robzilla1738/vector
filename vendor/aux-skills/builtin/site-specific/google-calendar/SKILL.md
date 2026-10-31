---
name: google-calendar
siteSpecific: true
description: Google Calendar event browsing, search, and creation guidance.
icon: "/builtin-skills/v1/google-calendar.svg"
autoInject:
  keywords: ["Google Calendar", "Calendar"]
  url:
    - calendar.google.com
---

# Google Calendar

## Addresses

- Events: `https://calendar.google.com/calendar/u/${uid}/r/${viewMode}`. Add `/YYYY/MM/DD` for a particular date.
- Search: `https://calendar.google.com/calendar/u/${uid}/r/search?q=${keyword}`
- New event: `https://calendar.google.com/calendar/u/${uid}/r/eventedit?...`

For upcoming events, `agenda` is the best view to start with. Use `day`, `week` or `month` when the user cares about the layout.

## Creating an event

Always create events through the `eventedit` link above. Its parameters:

| Parameter | Value |
| --- | --- |
| `text` | Title |
| `dates` | `start/end`. Timed: `YYYYMMDDTHHmmSS/YYYYMMDDTHHmmSS` in local time, or with `Z` for UTC. All-day: `YYYYMMDD/YYYYMMDD`. |
| `ctz` | Time zone |
| `details` | Description |
| `location` | Location |
| `add` | Guest emails, comma-separated |
| `recur` | An RFC 5545 rule such as `RRULE:FREQ=DAILY` |
| `vcon` | A meeting URL, or `meet` |

## How to work

- Use the search and event-edit URLs directly rather than hunting through menus.
- Calendar swaps views in place, so snapshot again after opening an event dialog or editing in the side pane.

## Keys

| Action | Keys |
| --- | --- |
| Today | `t` |
| Next / previous period | `j` / `k` |
| New event | `c` |
| Edit the selected event | `e` |
| Delete the selected event | `Backspace` |
