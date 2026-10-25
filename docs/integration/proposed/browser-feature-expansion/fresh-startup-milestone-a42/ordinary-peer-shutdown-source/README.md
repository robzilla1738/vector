# Ordinary peer-loss cleanup

A17's normal browser teardown closed the selected peer, then ReadyPulse called `node::Stop` before the supplied SIGTERM shutdown listener ran. That bypassed producer shutdown and left the native physical-drain loop held until the guardian terminated the remaining group.

This single-owner successor keeps authority/pulse failure status and the native exit result unchanged. In the ordinary build, peer-loss stop requests instead use the actual Node Environment's thread-safe immediate queue to invoke `process.emit('SIGTERM')` on the real event loop. A true return proves a listener was actually invoked; the supplied handler synchronously starts the existing idempotent shutdown sequence. No listener, unavailable JS or a thrown callback takes the existing fatal Stop fallback. This does not classify status -1 as normal quit or publish CLEAN. Physical drain and setup/thread lifetimes remain unchanged.

`projection.json` pins the exact A10 main source used by A17 and records four replayable anchors. The source is for root integration only. Because `Environment::SetImmediateThreadsafe` is a Node-internal inline API, the single Main.cc compilation must append the exact linked Node Release defines and includes in `node-release-compile-additions.json`. They are extracted from the pinned actual `out/libnode.target.mk`; using only `NODE_WANT_INTERNALS` could compile the wrong Environment layout. No Node rebuild is required.

No native build, signing, app execution or runtime success is claimed by this source lane. Root must compile/link and observe actual shutdown; a pending/unknown producer is still held, never declared drained by a timer.
