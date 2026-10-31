---
name: KakaoTalk
description: Read your KakaoTalk chats and messages (read-only).
icon: "/builtin-skills/v1/kakaotalk.svg"
platform: ["mac"]
settingsGate: experimental.kakaotalk
---

# KakaoTalk

The `kakaotalk` global in the REPL **reads** KakaoTalk chats and messages. Mac only. It needs Full Disk Access for Aux Computer Use and doesn't work in incognito. **You can't send KakaoTalk messages; this is read-only.**

## Reading

```js
await kakaotalk.listChats({ limit: 20 })              // chatId, name, isDirect, unreadCount, updatedAt, lastMessage
await kakaotalk.getHistory(chatId, { limit: 30 })     // oldest to newest; each message has logId, authorName, isFromMe
await kakaotalk.search({ text: '회식', limit: 20 })    // newest first; narrow with chatId, since or until
```

- `chatId`, `logId` and `authorId` are **strings**, because the numbers are too big for a safe JS integer. Pass them back exactly as you got them.
- Message `type` 1 is plain text. Other types are media, emoticons or feed items and may have no `text`.
- For older history, call `getHistory(chatId, { beforeLogId })` with the oldest `logId` you've seen.
- `search()` only looks through roughly the newest 5000 messages. If it warns the results were cut off, narrow it with `chatId`, `since` or `until`.
- Do the counting and filtering in the REPL and print only the result (counts, the matching lines, a summary). Don't print whole threads.

## Permission errors

- **macOS permission error** (this includes the user dismissing the setup dialog): explain in a sentence what the access is for, output an empty ` ```imessage-permission ` fenced block (it shows a "Grant access" button; Messages and KakaoTalk share the same Full Disk Access grant), and stop there for this turn. Don't use `ask_user_question` for this, and don't retry until the user says it's done.
