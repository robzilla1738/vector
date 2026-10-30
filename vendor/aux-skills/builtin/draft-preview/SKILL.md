---
name: "draft-preview"
description: "Use when the user explicitly asks for drafting content."
icon: "https://app.getaux.co/builtin-skills/v1/draft-preview.jpg"
---

# Draft cards

These cards are for one case: the user has plainly asked you to draft, rewrite, reply to, post, message, tweet, schedule or preview something that belongs in an app. Put a single JSON object with the card's fields in a code block fenced with that card's name. The chat renders it as a card.

Follow the card with a single short line proposing what happens next ("Should I send this to Priya now?"), then hold off on sending until the user replies.

## Gmail draft

```gmail-draft
{
  "to": ["recipient@example.com"],
  "cc": ["optional@example.com"],
  "bcc": ["optional@example.com"],
  "subject": "Subject line",
  "body": "Draft body"
}
```

- `to`: recipient addresses.
- `cc`, `bcc`: optional addresses.
- `subject`, `body`: the email's subject and text.

## iMessage draft

Include one earlier message for context, even when the draft starts a new conversation.

```imessage-draft
{
  "to": "Mom",
  "messages": [{ "sender": "them", "message": "Previous message" }],
  "draft": "Reply draft",
  "attachments": ["artifacts/photo.png", "tmp/notes.txt"]
}
```

- `to`: who it goes to: a contact name, phone number, email or group chat name.
- `messages`: earlier messages, each with `sender` (`me` or `them`) and `message`.
- `draft`: the text to send (`body` also works).
- `attachment` / `attachments`: optional session-relative path, or list of paths, sent with the message. `attachmentPath` / `attachmentPaths` work too.

## LinkedIn message draft

Include one earlier message for context, even when the draft starts a new conversation.

```linkedin-draft
{
  "to": "Jane Doe",
  "profiles": [{ "name": "Jane Doe", "avatarUrl": "https://..." }],
  "messages": [{ "name": "Jane Doe", "timestamp": "2026-07-01T09:00:00Z", "message": "Previous message" }],
  "draft": "Reply draft"
}
```

- `to`: the recipient's name, shown at the top of the card.
- `profiles`: the people in the thread. Each `avatarUrl` is matched to messages by `name`; find the avatar if you can.
- `messages`: earlier messages with the sender's `name`, a parseable `timestamp` and `message`.
- `draft`: the text to send (`body` also works).

## Slack message draft

Include one earlier message for context, even when the draft starts a new conversation, and pick up the avatar URLs of the people involved if you can.

```slack-draft
{
  "workspace": "Acme",
  "channel": "general",
  "profiles": [{ "name": "Jane Doe", "avatarUrl": "https://..." }],
  "messages": [{ "name": "Jane Doe", "timestamp": "2026-07-01T09:00:00Z", "message": "Previous message" }],
  "draft": "Reply draft"
}
```

- `workspace`: workspace name; `Slack` if omitted.
- `channel`: channel name without the `#`; `channel` if omitted.
- `profiles`: the people in the thread, avatars matched by `name`.
- `messages`: earlier messages with the sender's `name`, a parseable `timestamp` and `message`.
- `draft`: the text to send (`body` also works).

## Calendar event draft

```calendar-event-draft
{
  "title": "Event title",
  "time": "Wed, Jul 1, 2:00 PM - 2:30 PM",
  "calendarName": "Work",
  "location": "Conference room or URL",
  "attendees": [
    { "name": "Alex Kim", "email": "alex@example.com" },
    { "name": "Jane Doe", "email": "jane@example.com", "avatarUrl": "https://..." }
  ],
  "description": "Calendar description",
  "draft": "Invite note",
  "reminder": "10 minutes before",
  "source": "Optional source label",
  "visibility": "Default visibility",
  "availability": "Busy"
}
```

- `title`: the event name.
- `time`: when it is, written for people.
- `calendarName`: which calendar; `Calendar` if omitted.
- `color`: calendar color; `#0b57d0` if omitted.
- `location`: optional place or meeting link.
- `attendees`: the user first, as organizer, then each guest, each with `name`, `email` and an optional `avatarUrl`.
- `description`: the event description.
- `draft`: a note to go with the invite (`body` also works).
- `reminder`, `source`, `visibility`, `availability`: optional labels.

## X post preview

```tweet
{
  "authorName": "Jane Doe",
  "handle": "janedoe",
  "avatarUrl": "https://...",
  "timestamp": "1h",
  "body": "Post body",
  "stats": { "replies": "1", "reposts": "2", "likes": "3", "views": "400" }
}
```

- `authorName`, `handle`, `avatarUrl`: who posted it.
- `timestamp`: optional time label.
- `body`: the post text.
- `stats`: optional counts for `replies`, `reposts`, `likes` and `views`.

## X post draft

```x-tweet-draft
{
  "profile": { "authorName": "Jane Doe", "handle": "janedoe", "avatarUrl": "https://..." },
  "body": "Draft post body"
}
```

- `profile`: the author. `authorName`, `handle` and `avatarUrl` may also sit at the top level.
- `body`: the post text.

## LinkedIn post preview

```linkedin-post
{
  "authorName": "Jane Doe",
  "headline": "Founder at Acme",
  "avatarUrl": "https://...",
  "timestamp": "1h",
  "body": "Post body",
  "stats": { "reactions": "12", "comments": "3" }
}
```

- `authorName`, `headline`, `avatarUrl`: who posted it.
- `timestamp`: optional time label.
- `body`: the post text.
- `stats`: optional counts for `reactions` and `comments`.

## LinkedIn post draft

```linkedin-post-draft
{
  "profile": { "authorName": "Jane Doe", "headline": "Founder at Acme", "avatarUrl": "https://..." },
  "body": "Draft post body"
}
```

- `profile`: the author. `authorName`, `headline` and `avatarUrl` may also sit at the top level.
- `body`: the post text.
