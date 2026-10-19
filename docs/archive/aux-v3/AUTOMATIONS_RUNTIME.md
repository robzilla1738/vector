# Automation event handoff

The runtime accepts three event triggers through the authenticated `aux-host-v1` channel's `routines.ingestEvent` method. This method is denied to loopback API clients, including scoped agent connections. The host must supply the typed `RoutineSourceEventSchema` payload and enforce its own provenance before submission:

| Trigger | Host obligation | Runtime check |
| --- | --- | --- |
| Site notification | Emit only after the browser permission store grants notifications for the exact origin. Set `permissionGranted: true`; use a stable notification event ID. Do not pass title or body text. | Exact origin is in the routine's reviewed site scope; occurrence ID deduplicates replay. |
| Page change | Observe a live Aux page, bind the page ID and document epoch to the current document, and hash bounded normalized page content. Do not pass page text. | Exact URL, origin, page epoch and saved task resource must match. The first hash is a baseline; only a changed hash can fire. Minimum interval coalesces changes. |
| Calendar event | Emit from the calendar connector with its connection ID, task grant ID, event ID, calendar ID and start time. | Grant is active for the saved task revision and connection. The event fires only within the configured `beforeMinutes` window. |

An event older than five minutes creates a `missed` record and is never replayed as work. A future event is ignored until the host observes it again near the due time. The host should submit only while Aux is open; no cloud worker or closed-app scheduler is implied. A running routine records an overlapping occurrence as `missed` unless the routine explicitly permits consecutive runs. Each occurrence appears in `routines.inbox`, with a durable read receipt from `routines.inboxRead`.

Schedules use the saved IANA time zone. A fall-back wall minute has one occurrence identity, so it fires once. A spring-forward minute that does not exist is skipped. Existing schedule and monitor timers run only in the open runtime. Three consecutive failed attempts or reaching the routine's configured model spend cap (default $50) pauses future automatic runs. The global AI Gateway spend ledger remains the hard account-wide limit.

The runtime stores event metadata, page hashes, run statuses and receipts. It does not store notification bodies or page content in automation records. Native adapters must use real browser permission and document provenance; a renderer, web page or agent must never fabricate `routines.ingestEvent` payloads.
