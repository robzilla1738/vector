---
name: google-slides
siteSpecific: true
description: Google Slides reading and editing guidance.
icon: "https://app.getaux.co/builtin-skills/v1/google-slides.svg"
autoInject:
  url:
    - docs.google.com/presentation/**
---

# Google Slides

## Addresses

- Search: `https://docs.google.com/presentation/u/${uid}/?q=${keyword}`
- Edit a deck: `https://docs.google.com/presentation/u/${uid}/d/${presentationId}/edit`
- New deck: `https://docs.google.com/presentation/u/${uid}/create`
- HTML view: `https://docs.google.com/presentation/u/${uid}/d/${presentationId}/htmlpresent`

## How to work

- To read a deck, try the HTML view first; it's light and usually keeps enough structure.
- If it doesn't, fall back to screenshots, or to CUA for on-screen UI with no usable refs.
- To edit, use keyboard shortcuts, and fall back to CUA only when refs and locators can't drive the editor.

Screenshot one slide from a reading view:

```js
await page.locator(`div.slide:nth-child(${index})`).screenshot({ type: 'jpeg', quality: 80 });
```

## Keys

| Action | Keys |
| --- | --- |
| New slide | `Cmd+M` |
| Delete the selected slide | `Cmd+Backspace` |
| Move a slide up / down | `Cmd+Up` / `Cmd+Down` |
| Duplicate a slide | `Cmd+D` |
| Grid view | `Cmd+Alt+1` |
| Hide a slide | `Cmd+Shift+H` |
| Bold / italic / underline | `Cmd+B` / `Cmd+I` / `Cmd+U` |
| Align left / center / right | `Cmd+Shift+L` / `Cmd+Shift+C` / `Cmd+Shift+R` |
| Link | `Cmd+K` |
| Insert image / table / shape | `Cmd+Option+I`, then `I` / `T` / `S` |
| Insert a text box | `Cmd+Option+Shift+X` |
| Present / from this slide | `Cmd+Enter` / `Shift+Cmd+Enter` |
| Command palette | `Cmd+/` |
