---
name: Messages
description: Read iMessages conversations, text someone, or get SMS codes.
icon: "/builtin-skills/v1/imessage.svg"
platform: ["mac"]
---

# Messages

The `imessage` global in the REPL reads and sends iMessage and SMS through Messages.app. Mac only. It needs macOS permissions for Aux Computer Use, and it doesn't work in incognito.

## Reading

```js
await imessage.listChats({ limit: 20 })            // guid, name, participants, unreadCount, lastMessage
await imessage.getHistory(chatGuid, { limit: 30 }) // oldest to newest; each message has a rowid
await imessage.search({ text: 'dinner', sender: '+14155551212', since: new Date('2026-08-01'), limit: 20 })  // last 90 days unless you pass since
await imessage.contacts('Mom')                     // a name -> { phones, emails }
```

- Do the counting and filtering in the REPL and print only the result (counts, the matching lines, a summary). Don't print whole threads.
- To find what's new since some point, pass `sinceRowid` from messages you've already seen instead of reading the history again.

## Waiting for a verification code

```js
await imessage.waitForCode()                       // -> { status: 'received', code, sender, receivedAt } | { status: 'timeout', sinceRowid }
```

- When a sign-in texts a code, call `waitForCode()` rather than asking the user to check their phone. Codes from the last minute count (the text may already be there); anything older never does. Skip searching the thread by hand beforehand.
- If it returns `timeout`, let the user know you're still waiting, then call again later with the `sinceRowid` you got back; no message slips through.
- To wait for someone's reply in a chat, poll `getHistory(chatGuid, { sinceRowid })` the same way.

## Sending

```js
await imessage.send({ chatGuid, text })                      // an existing chat (best; works for groups and SMS threads)
await imessage.send({ to: '+14155551212', text, attachmentPaths: ['tmp/itinerary.pdf', 'tmp/photo.png'] })  // a 1:1 iMessage
```

1. **Show an `imessage-draft` card with the exact recipient and text before every send.** It works like the Gmail draft: a preview, and the session's confirmation mode decides whether it waits for approval. Never use `ask_user_question` to confirm a send. Put 2–5 recent lines of the thread in `messages`, and list any files as `attachments: ["artifacts/report.pdf", "artifacts/photo.png"]` (session-relative paths). All files go in one send; never split them across several `send()` calls.
   - If `request_action_confirmation` is available (final-confirm mode), pass it `{ type: 'imessage-draft', data: { to, draft, messages, attachments? } }`, and send exactly what comes back approved and nothing else.
   - Otherwise, write the payload as a bare fenced block (no `type`/`data` wrapper) and go on to send:

     ````
     ```imessage-draft
     {"to":"Mom","draft":"test","messages":[{"sender":"me","message":"Hello"}]}
     ```
     ````

   Stop and ask first only if you had to guess: the recipient was unclear, or the words weren't the user's.
2. One `send()` per REPL call, and nothing else in that call.
3. For an existing conversation, use the `chatGuid` from `listChats()`. Use `to` only for 1:1 messages. A contact name works for `to` only if it maps to exactly one handle; otherwise it throws with the candidates, and you ask the user which one.
4. `send()` returns `{ status: 'delivered' | 'unconfirmed' }`, and it **throws** if Messages reports the delivery failed. After a throw, never say the message arrived. On `unconfirmed`, say it was sent but delivery isn't confirmed yet.
5. You can't start a new group chat. Texting someone without an iPhone needs Text Message Forwarding on the user's iPhone, though replying in an existing SMS thread by its `chatGuid` works.

## Permission errors

- **macOS permission error** (this includes the user dismissing the setup dialog): explain in a sentence what the access is for, output an empty ` ```imessage-permission ` fenced block (the chat turns it into a "Grant access" button for the permission sheet), and stop there for this turn. Don't use `ask_user_question` for this, and don't retry until the user says it's done.
- **Automation error** on the first send: have the user open System Settings → Privacy & Security → Automation and let "Aux Computer Use" control "Messages", then send again.
