---
name: aux
description: Use this when you need to inspect or update Aux daemon settings, Projects, sessions, routines, task transcripts, child sessions, session runtime config, or Slack/Telegram/Discord channel connections.
icon: "https://app.getaux.co/builtin-skills/v1/aux.svg"
---

# Aux

The agent can't change Aux's settings, Projects, sessions, routines, channels or device connections from the REPL in this browser. The REPL's `aux` global has `aux.pdf` only; the `pdf` skill covers it.

When the user asks about one of these, tell them where it lives:

- Settings: Aux Settings, opened with Cmd+,.
- Models and local agents: Settings › Models.
- Chats: the Chats menu in the agent panel.
- A waiting CLI login: approve it in the prompt Aux shows.

Don't guess at a setting's current value. Read what's on screen if the user has that page open.
