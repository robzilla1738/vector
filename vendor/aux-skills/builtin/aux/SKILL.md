---
name: aux
description: Use this when you need to inspect or update Aux daemon settings, Projects, sessions, routines, task transcripts, child sessions, session runtime config, or Slack/Telegram/Discord channel connections.
icon: "https://app.getaux.co/builtin-skills/v1/aux.svg"
---

# Aux

The `aux` global in the REPL reads and changes this account's daemon settings, Projects, sessions, routines and channel connections. When the user is asking about a particular Aux task, look at that session's transcript.

Read before you write. Call a write method only when the user asked for the change or the task plainly needs it.

## At a glance

```js
const allSettings = aux.settings.getAll();
const memory = aux.settings.get('memory');
aux.settings.set('memory', { ...memory, enabled: true });

const projects = aux.projects.list();

const recent = aux.sessions.list({ limit: 10 });
const current = aux.sessions.current();
const session = aux.sessions.get('session-id');
const messages = await aux.sessions.messages('session-id', { limit: 40, order: 'asc' });
const rows = aux.sessions.messageRows('session-id');
const children = aux.sessions.childSessions('session-id');

const routines = aux.routines.list({ limit: 10 });
const routine = aux.routines.get('routine-id');

const connections = aux.channels.list();
```

## Settings

- `aux.settings.getAll(): SettingsData` returns the account's daemon settings (from `settings.json`).
- `aux.settings.get(key): SettingsData[key]` reads one key, for example `defaultModel`, `modelCategories`, `followUpBehavior`, `lasso`, `memory`, `compaction` or `retry`.
- `aux.settings.set(key, value): SettingsData` replaces one key; the value is schema-checked. Read the current value first and carry over the fields you aren't changing:

```js
const current = aux.settings.get('compaction');
aux.settings.set('compaction', { ...current, enabled: false });
```

## Projects

`aux.projects.list(): Project[]` lists the active Projects that new tasks and channel connections can use. Pass a Project's `id` as `projectId`, or `null` for none.

## Sessions

Session results are trimmed: they leave out heavy fields such as `systemPrompt`, `toolState` and the bodies of queued messages.

- `aux.sessions.current(): SessionSummary | undefined` is the agent session the REPL is running in, if any.
- `aux.sessions.list(options?): SessionSummary[]` lists sessions. By default: visible, not archived, root sessions only, newest first, 20 at most. Options:

```ts
{
  projectId?: string;
  order?: 'desc' | 'asc';
  cursor?: number;
  limit?: number; // up to 200
}
```

- `aux.sessions.get(sessionId?): SessionSummary` returns one session. You can leave out the id only when running inside a real agent session.
- `aux.sessions.messages(sessionId?, options?): Promise<AgentMessage[]>` reads the transcript, by default the first 50 messages, oldest first. Keep the limit small before printing anything:

```js
const messages = await aux.sessions.messages('session-id', { limit: 20, order: 'asc' });
console.log(messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
  role: m.role,
  text: typeof m.content === 'string' ? m.content : m.content.filter(c => c.type === 'text').map(c => c.text).join('\n'),
})).slice(-5));
```

- `aux.sessions.messageRows(sessionId?): { id, role, timestamp }[]` gives the message row ids in order, for cutting a transcript or branching at an exact point.
- `aux.sessions.childSessions(parentId?, options?): SessionSummary[]` lists child (subagent) sessions. Pass `{ triggeredBy }` to limit it to the ones a single tool call started.
- `aux.sessions.update(sessionId, patch): SessionSummary` changes only safe metadata and config: `title`, `activeTabTargetId`, `model`, `permissionMode`, `permission` and `runtimeConfig`. Setting `permissionMode` also rewrites the concrete permission config the runtime hooks use.

```js
aux.sessions.update('session-id', {
  runtimeConfig: { proactiveMode: true },
});
```

- `aux.sessions.archive(sessionId)` and `unarchive(sessionId)` archive or restore a session. Only when the user asks.
- `aux.sessions.markRead(sessionId)` and `markUnread(sessionId)` set a task's unread state.

## Routines

These are read-only. They return saved routine definitions: schedule, prompt, lifecycle status and parent session. To change or delete a routine, use the `routine_update` tool.

- `aux.routines.list(options?): Routine[]` lists routines that aren't deleted, newest first, 20 by default. Options: `{ projectId?: string; limit?: number /* up to 200 */ }`.
- `aux.routines.get(id): Routine` returns one routine by id, paused and deleted ones included.

## Channels

A channel connection lets people on Slack, Telegram or Discord start Aux tasks. Connection objects never contain tokens.

- `aux.channels.list(): Connection[]`: every connection and its status.
- `aux.channels.create(input): Promise<Connection>`: saves the credentials and starts the connection.
- `aux.channels.update(input): Promise<Connection>`: changes settings or credentials.
- `aux.channels.restart(connectionId): Promise<Connection>`: restarts with the saved configuration.

For what to pass at setup, how to identify the owner, and how to verify and recover a connection, follow that platform's channel guide.

## Device connections

- `await aux.device.listPendingConnections()` returns `{ requests: [{ requestId, deviceName, createdAt, expiresAt }] }`, 100 at most.
- `await aux.device.approveConnection(requestId, code)` approves a waiting CLI login and returns `{ status: 'approved' }`. Use the request's UUID and the public code the user read from that CLI.

Approve a device only when the user explicitly asks you to connect it.
