# Actual process-shutdown ordering and browser receipt provider

Depends on browser-drain and browser-drain-transport. All source-only. Register
`chrome/browser/ui/aux_browser_shutdown_drain.{h,cc}` in existing UI target;
ChromeBrowserMainParts already depends on UI. No new app entry or UI surface.

1. Actual process-shutdown start closes admissions and invokes a bounded UI
   callback drain before ProfileManager teardown. Normal window close and profile
   switch never call this irreversible path. The selected daemon peer is excluded
   from migration helper-close and retained for the final handshake.
2. Process shutdown flushes current queued session commands; it does NOT reset
   last-session state to the now-empty current-window list. Migration retains
   original reset behavior. Original native-messaging reaper becomes
   BLOCK_SHUTDOWN; no second reaper is added.
3. Existing real phase sequence observes Profile teardown, content IO/ThreadPool
   shutdown, BrowserProcess destruction, post-shutdown IO and MainParts destruction.
   The final report requires that sequence plus the actual captured session,
   worker, navigation, profile-init outcomes AND current retained feature,
   content child, native-host and carrier counts. Missing callbacks/uncertainty
   remain unknown/pending. Phase6 alone cannot settle the report.
4. Selected daemon supervisor sends its existing /shutdown request, but defers
   peer closure instead of claiming the daemon stopped before browser teardown.
   The actual daemon /shutdown response must acknowledge closure promptly; it
   cannot wait synchronously for the phase6 CLEAN callback. Root owns that caller.
5. At phase6 the process keeps the native monitor alive for a bounded10seconds.
   Only authenticated same-receipt CLEAN ACK permits native peer close; actual
   original child reaping and monitor join are separately required. Timeout does
   not certify anything or erase retained ownership. ACK loss does not erase
   independently durable CLEAN; it leaves old-parent completion unknown.

The browser report is the supervised browser cohort only. The registry must
independently require actual daemon/broker/OS/worker settlement before using it.
The historical whole_writer_drain_proven field is deliberately unchanged; no
claim about unrelated same-UID programs or arbitrary third-party descendants.
Actual root-denied native-messaging children stay governed by their existing
path restrictions. Any newly authorized/untracked Aux writer must retain a ticket
or keep the registry unknown rather than be silently treated as covered.

Verification: exact ordered replay/patch equality and source-whitespace checks;
source review caught and fixed empty-session-reset and skipped-host-reaper
shutdown hazards. No native compile, app lifecycle or clean-restart acceptance.
