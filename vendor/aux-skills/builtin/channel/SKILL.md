---
name: channel
description: Read and act through the configured Slack, Discord, or Telegram bot connection that started the current task. Use for channel history, thread and user lookup, posting, editing, deleting, reactions, subscriptions, and typing indicators.
metadata:
  internal: true
---

# Channel

The `channel` global in the REPL gives you the full Chat SDK `moderator` agent surface, acting through the bot connection that started this task.

When you need the platform or the default ids, start with `channel.current()`:

```js
console.log(channel.current());
// { platform, threadId, channelId, messageId }
```

Wherever a target is optional, it defaults to the current thread, channel and incoming message. To act somewhere else the same bot connection can reach, pass full Chat SDK ids.

## Reading

```js
await channel.fetchMessages({ limit: 20, cursor, direction: 'backward' });
await channel.fetchChannelMessages({ limit: 20, cursor, direction: 'backward' });
await channel.fetchThread();
await channel.listThreads({ limit: 20, cursor });
await channel.getThreadParticipants();
await channel.getChannelInfo();
await channel.getUser('platform-user-id');
```

`fetchMessages`, `fetchThread` and `getThreadParticipants` take an optional `threadId`. `fetchChannelMessages`, `listThreads` and `getChannelInfo` take an optional `channelId`.

## Writing

```js
await channel.postMessage({ message: { markdown: '**Hello**' } });
await channel.postChannelMessage({ message: 'Top-level message' });
await channel.sendDirectMessage({ userId: 'platform-user-id', message: 'Hello' });
await channel.editMessage({ messageId: 'bot-message-id', message: 'Updated' });
await channel.deleteMessage({ messageId: 'bot-message-id' });
await channel.addReaction({ emoji: 'moneybag' });
await channel.removeReaction({ emoji: 'moneybag' });
await channel.subscribeThread();
await channel.unsubscribeThread();
await channel.startTyping({ status: 'Working…' });
```

A message can be a plain string, `{ markdown }` or `{ raw }`. Posting methods take an optional `threadId` or `channelId`. Edit, delete and reaction methods take an optional `threadId`, and reactions also take an optional `messageId`.

Emoji: on Slack use the shortcode name without colons (`moneybag`); on Discord and Telegram use the Unicode character (`💰`).

Edit or delete only the bot's own messages. Make visible changes only when the user asked for them.
