# Authenticated invalidation snapshots

`GET /events/poll?topics=account,billing,devices,user-settings,drive,routines,sessions[&cursor=aux-ev1.<hex>]` is mounted at `/api/v1` behind live `requireUser` authentication. The response is `{protocol:"aux-events.poll.v1",cursor,changed,retryAfterMs:60000}`. Topics are unique and bounded; cursors do not authorize access. Private source rows remain owner-scoped and no private content, token or row identifier enters the reply.

A source digest change invalidates subscribed topics. This is a coarse, conservative snapshot protocol, not an event log or proof that consumers applied data. Initial/reconnected clients reconcile using existing content APIs. No new migration is needed. Poll at most once per minute; existing owner rate limits and SQL time bounds apply. Deleted/revoked accounts fail existing authentication.

Desktop integration and exact source/runtime limits are recorded in `docs/integration/proposed/completion-20261026/integration/events/README.md` at repository root. Current-source deployment, real two-session sync/conflicts, cancellation/quit and private share/revoke/delete still require actual acceptance.
