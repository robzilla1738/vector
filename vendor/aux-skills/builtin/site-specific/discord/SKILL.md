---
name: discord
siteSpecific: true
description: Discord web app channel and message workflow guidance.
icon: "https://app.getaux.co/builtin-skills/v1/discord.svg"
autoInject:
  url:
    - discord.com
---

# Discord

## Addresses

- Home and DMs: `https://discord.com/channels/@me`
- A server channel: `https://discord.com/channels/${guildId}/${channelId}`
- Invites: `https://discord.gg/${code}` or `https://discord.com/invite/${code}`

## How to work

- Use the web app in the session that's already signed in.
- If you know the server or channel, go straight to its channel URL.
- Otherwise do most navigation with the Quick Switcher.
- If a channel URL lands in the wrong place, go back to `/channels/@me` and navigate from there.

## Keys

| Action | Keys |
| --- | --- |
| Quick Switcher | `Cmd/Ctrl+K` (prefix `*` servers, `@` DMs, `#` text channels, `!` voice channels) |
| Move between main areas | `F6` / `Shift+F6` |
| Back to the message box | `Escape` |
| On a focused message: reply / edit / delete | `r` / `e` / `Backspace` |
| Pin / react / quote | `p` / `+` / `q` |
| Copy the message text | `Cmd/Ctrl+C` |
