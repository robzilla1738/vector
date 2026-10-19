# Local channel service

Implements the local channel inventory in `docs/spec/daemon/services.md` with an
independent Telegram Bot API transport. Primary protocol documentation:
https://core.telegram.org/bots/api#getupdates and https://core.telegram.org/bots/api#sendmessage
(accessed 2026-10-19). No cloud relay or unsupported platforms are advertised.

Integrator:

```ts
const channels = new ChannelService(store, engine);
const channel = createChannelRouter(services, channels);
channels.resume(store.accounts().map(account => account.id));
// Compose into AgentExtensions.tools: channelTools(channels, session, signal)
// Shutdown: await channels.close() before engine/store shutdown.
```

Router tree is `channel.connections.create/list/update/remove/restart`,
`channel.pairing.list/approve/reject`, `channel.principals.list/update/remove`, and
`channel.policies.get/update`. All inputs include accountId. Owned connectionId is a
UUID, requestId is a UUID, senderId is the Telegram numeric user ID string.
Create accepts `{platform:'telegram',name,token,enabled?:true}` and verifies getMe.
Update accepts optional name/enabled/token; token rotation must preserve bot identity.
Connection/principal/public pairing results never include tokens or inbound bodies.
Connection tokens live in atomic owner-only `channel-credentials.json`, excluded from
agent file tools and redacted alongside model credentials. Removal stops polling,
aborts associated sessions and clears credentials/local pairing/delivery/send records.

Only private human text messages are supported. Unknown senders are durably queued for
local pairing approval and cannot create a task. Rejection drops pending bodies.
Principal disabling stops its active task and drops pending requests. Approved senders
receive a separate durable session per connection/sender; per-connection replay claims
and session idempotency keys prevent replayed updates from starting another turn.
Polling offsets advance only after durable intake, and interrupted pending deliveries
replay through the same idempotent session queue on resume. Deleted/archived threads
receive a fresh session on their next approved message.

Policy: `{permissionMode:'read-only'|'guard',allowTasks:boolean,allowReplies:boolean,model?}`.
Defaults: read-only, tasks enabled after pairing, replies disabled. Changing a policy
stops existing task work before the next input applies the new policy. All normal
browser/file/OS/action session approval boundaries continue to apply.
`channel_send` requires replies enabled, an approved active principal, a writable
session policy and exact local human action-confirmation. Channel-origin tasks can
reply only to their own sender. Outbound operation claims precede network mutation;
completed identical operations return their prior message ID, while uncertain operations
never retry. No bot responses or pairing messages are sent automatically.

Focused tests use an injected synthetic transport and disposable homes: sender pairing,
account isolation, replay, default task permission, credential redaction/mode, principal
revocation, removal and uncertain-send retry rejection. No real bot login/messages were
performed. Continuous Telegram polling and outbound delivery remain unverified against
a live owner-authorized bot; OAuth/cloud transports and groups/media remain unsupported.
