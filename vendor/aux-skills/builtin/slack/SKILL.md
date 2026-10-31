---
name: slack
description: Read this when you need to use Slack.
icon: "/builtin-skills/v1/slack.jpg"
autoInject:
  keywords: ["slack"]
---

# Slack

The `slack` global in the REPL takes the credentials from the user's signed-in Slack session in the browser and gives you a `@slack/web-api` WebClient. You don't need `openTab`; just call the official Slack API.

## Write like the user

Before writing to a channel or person, gather 3–5 messages the user wrote there and match their tone and style. Save what you learn to memory. The aim is for your messages to read as if the user wrote them: natural, with their habits, such as splitting a thought across several messages.

## At a glance

```js
// Workspaces
const workspaces = await slack.listWorkspaces();
console.log(workspaces);
// -> [{ teamId, name, slug, status, memberCount, iconUrl, userId, url, isLastActive? }, ...]

// A WebClient for one workspace. Keep it in a const so later REPL calls can reuse it.
const client = await slack.getClient('T05DP5U7M8X');

// Channels
const { channels } = await client.conversations.list({ types: 'public_channel,private_channel', limit: 50 });
console.log(channels.map(c => `#${c.name} (${c.id})`));

// Recent messages
const { messages } = await client.conversations.history({ channel: 'C0ARUCEK04A', limit: 20 });
console.log(JSON.stringify(messages, null, 2));

// Post
await client.chat.postMessage({ channel: 'C0ARUCEK04A', text: 'Hello from Aux!' });

// Search
const results = await client.search.messages({ query: 'from:alice quarterly report' });
console.log(JSON.stringify(results.messages.matches, null, 2));

// Post with files
await client.filesUploadV2({
  channel_id: 'C0ARUCEK04A',
  thread_ts: '1223313423434.131321', // optional: post into a thread
  initial_comment: 'Hey <@U05DP5U7M8X>, here are the files you\'ve requested:',
  file_uploads: [
    { file: './logo.png', filename: 'logo.png' },
    { file: './logo-sm.png', filename: 'logo-sm.png' },
  ],
});
// A file_uploads entry can have: file, content, filename, filetype, title, snippet_type (e.g. python), alt_text.
```

## `slack.listWorkspaces(): Promise<Workspace[]>`

Every workspace the user is in. It uses only the session cookie and opens no tab.

```ts
interface Workspace {
  teamId: string;       // like 'T05DP5U7M8X'
  name: string;         // like 'My Company'
  url: string;          // like 'https://app.slack.com/client/T05DP5U7M8X'
  iconUrl: string;      // 88×88 icon
  memberCount: number;
  status: 'joined' | 'pending-invite' | 'needs-login';
  isLastActive?: boolean;
  slug: string;         // 'mycompany' for mycompany.slack.com
  userId: string | null; // the user's id in this workspace
}
```

`status` is `'joined'` (a member, ready to go), `'needs-login'` (the session expired; they need to sign in again in the browser) or `'pending-invite'` (invited but not yet accepted).

## `slack.getClient(teamId?: string): Promise<WebClient>`

Returns a configured `@slack/web-api` WebClient. To get the token it briefly opens a Slack tab, reads the xoxc- token from localStorage and closes the tab. Without a `teamId` it uses the last active workspace.

This is the standard SDK client, with every method and parameter in Slack's API docs. If you're unsure of a method or its parameters, look it up at `https://docs.slack.dev/reference`.

## Uploading files

`client.filesUploadV2` uploads one or more files. Pass `file` (a path, Buffer or ReadStream) or `content` (a string).

```js
await client.filesUploadV2({
  channel_id: 'C0ARUCEK04A',
  file: './logo.png',
  filename: 'logo.png',
  initial_comment: 'New logo',
});
```
