---
name: airtable
siteSpecific: true
description: Airtable base, view, and record-pane guidance.
icon: "https://app.getaux.co/builtin-skills/v1/airtable.svg"
autoInject:
  url:
    - airtable.com
    - www.airtable.com
---

# Airtable

## Addresses

- Home: `https://airtable.com/`
- A workspace: `https://airtable.com/workspaces/${workspaceId}`

## How it behaves

- Everything is addressed by id: bases start `app...`, tables `tbl...`, views `viw...`, shared views `shr...`, interface pages `app.../pag...`.
- Copy the URL you're on rather than rebuilding one from the names on screen.
- Form URLs usually end in `/form` and accept `prefill_` and `hide_` parameters.
- A direct link that drops you on Home usually means a permission problem or the wrong kind of share. Check that first.
- Opening a record or switching views swaps panes in place, so take a new snapshot afterwards.

## Keys

| Action | Keys |
| --- | --- |
| Shortcut list | `Cmd+/` |
| Switch base / table / view | `Cmd+K` / `Cmd+J` / `Cmd+Shift+K` |
| Find | `Cmd+F` or `Cmd+G` |
| Filter / group / sort | `Cmd+Shift+F` / `Cmd+Shift+D` / `Cmd+Shift+S` |
| Expand the active record / close it | `Space` / `Escape` |
| Expand the active cell | `Shift+Space` |
| Edit the selected cell | `Enter` or `F2` |
| New record below / at the end | `Shift+Enter` / `Cmd+Shift+Enter` |
| Set the selected date to now | `Cmd+;` |
