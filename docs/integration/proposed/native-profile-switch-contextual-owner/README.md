# Dormant Contextual Tasks profile-switch lifecycle

Root observed566 reject Your Aux→Person1 at unported.contextual_tasks_browser_controller → bindings.source-unported-owners → transaction.prepare-bindings. This proposal is pinned to the actual current native preimages; no shared native change, build or runtime operation was performed.

## Source/effect basis

Chromium155 BrowserWindowFeatures constructs ContextualTasksBrowserController when IsContextualTasksUIEnabled, even before any contextual task is opened. Its presence alone therefore rejects an otherwise idle browser. This is a newer Chromium owner integration, not original Aside C++ recovered verbatim. The preserved supplied transaction owner (4559f80, documented in native-profile-switch-transaction) requires cold admission, all-window observation pause, real collection/identity transfer and coherent target/source finish/abort. This patch fills that lifecycle; it does not bypass the transaction or copy profile data.

The existing155 constructor caches actual profile services in ActiveTaskContextProviderImpl, EntryPointEligibilityManager and ContextualTasksSidePanelCoordinator. The native host's destructor removes its observer but leaves the registry entry whose factory holds its old weak pointer. TabUnderlineController observes the stable ActiveTaskContextProvider and only detaches on destruction; replacing that provider would strand existing observers. Eligibility listeners also exist outside the owner. These facts require retaining the two stable public owners while retiring their profile-bound observations and dormant panel host.

## Admission and effects

Cold/revalidation accepts the controller only when there are no pending or service-associated tasks on any window tab, no cached panel WebContents, visible/initialized panel, toolbar WebContents, co-browsing state or closing session state. The stable context provider must also have no local/backend underline state, active task or session handle. This check deliberately avoids GetCurrentTask, which can materialize a pending association and is not a cold read. Source and both actual cache windows are checked before mutation.

Begin pauses all three controller graphs before tab transfer. Existing Shutdown tears down close/ephemeral controls and the dormant coordinator. Its exact contextual-task registry entry is deregistered so a resumed host can register a live factory. Eligibility subscriptions are disconnected; the retained context provider invalidates async callbacks, disconnects WebContents/tab/service observation and clears its old service reference. Stable public objects and their external observer lists remain intact.

Finish and abort run the original constructor's profile-owner initialization against each window's now-settled Profile and tabs. The visible window gets the target on commit or source on rollback; both caches retain their actual fixed profiles. The new coordinator resumes the stable provider through its existing injection/observation method. Eligibility notification is delayed until the new graph is complete. Every outer effect keeps the existing weak-window/provider liveness checks. Active contextual-task usage remains an honest guarded case, not silently dropped data.

## Validation / remaining check

Nine-file exact preimages and outputs are in manifest.json; `git apply --check` passes on the current native tree. API source review covered registry Deregister, actual factory constructors, tab enumeration, service lookup and callback-list/scoped-observation teardown. No full native compile or runtime claim. Root should compile changed objects, then switch the two disposable profiles forward/back, confirming each retains its own tabs, bookmarks, settings and Agent identity, with no old-profile UI or observer crash. Existing other unported-owner guards remain. A live contextual Google task will still refuse switching; supporting active cached tasks requires a separate explicit retention lifecycle.
