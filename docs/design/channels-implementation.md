# Channels implementation boundary

Status: transport and encrypted-storage foundation is implemented; connection
lifecycle, native pairing, run/reply integration and Settings remain open.
References 091–096 require a separate Channels
Settings destination with messenger rows, Add (Slack/Telegram/Discord), and a
connection dialog containing Options, Pairing and Credentials. Options include
Paired people only / Everyone, Require mentions in threads, Queue / Steer and
Reconnect. Personal-assistant cards are a separate integration surface.

`channel-transport.ts` and the three provider modules implement bot identity,
durable acknowledgement, heartbeat/resume and safe delivery errors. `ChannelStore`
owns schema 6's encrypted connection, peer, thread, message, outbox and cursor bodies.
Its per-connection index key stays inside the protected envelope, so reviewed
recovery preserves lookup identity when Profile encryption keys change. Schema 2–5
migrations, dedupe/checkpoint atomicity, identity-bound deliveries, interrupted sends
and actual cross-Profile re-encryption have passing fixtures. No service loads
messenger credentials or exposes enabled controls yet.

Use a Profile-owned channel service, not the Calendar/MCP catalog or external-agent
session UI. Existing `CalendarConnectionService` demonstrates native secret storage
and reconnection; channel tokens should use independent opaque secret names, never
public settings or event payloads. Persist connection revision, provider identity,
paired provider-user identities, thread-to-conversation mappings, delivery identity
and transport cursor separately from credentials. Pairing/revocation and connection
changes belong to the authenticated local Settings flow. Private runtimes must not
load these connections.

Slack's [Socket Mode protocol](https://docs.slack.dev/apis/events-api/using-socket-mode/)
uses an app-level token to obtain a WebSocket URL and acknowledges each received
envelope. Telegram's [Bot API](https://core.telegram.org/bots/api#getupdates)
advances acknowledgement through the next getUpdates offset. Discord's
[Gateway](https://docs.discord.com/developers/events/gateway) requires heartbeat,
sequence/resume handling and selected intents. Implement durable deduplication
before dispatch, bounded reconnect/backoff, and cancellation when a connection is
disabled, replaced or removed. Authenticated provider identifiers—not display
names—determine peer and thread ownership.

Run integration must preserve actual Aux conversation identity and effect review.
`RunService.start` provides internal delivery identity; `RunMessageService.queue`
and `.steer` provide existing follow-up behavior. Inspect their ownership/admission
requirements before introducing an inbound channel caller. Remote messages cannot
claim a native window's human interaction proof. Reply delivery must bind to the
originating connection revision, authenticated peer/thread and original run;
retries must not duplicate messages or borrow another conversation's results.
Use the normal Stop/Take over and approval path, with channel status reflecting
when local review is required.

Implement connection persistence, pairing and transport lifecycle together with
run admission and reply delivery before exposing enabled messenger controls.
Use protocol fixtures for reconnect/deduplication and a deliberate disposable
connection for live acceptance. No messenger credential was read and no message
was sent during the October 17 protocol review.
