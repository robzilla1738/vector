# Initial cache setup settlement — native594

Source-only proposal. Seven files, sixteen uniquely count-checked edits, native594 before/after hashes. No shared native mutation, build, app interaction, UI or signing.

## Confirmed cause

Integrator actual594 observed `container.pending-notifications failed=1 count=1`, `bindings.cache-actor.02 cache=target`, `transaction.revalidate.02`. Creating the fixed target cache attaches its initial tab and posts `RunPostedWebContentsAttached`. The synchronous transaction then runs its cold guard before that callback. Retrying after settlement progressed beyond this guard (and exposed an independent avatar lifecycle crash; that belongs to a separate fix).

The original Actor attachment calls `UpdateUi`, whose `ConcurrentClosures::Done` posts its completion even when all default inactive UI work finishes synchronously. One task hop alone is insufficient.

## Lifecycle change

The transaction recognizes only newly constructed caches or a freshly added target initial tab. It returns `kAwaitingCacheSetup` before any binding begin/commit, tab transfer or identity mutation; its existing RAII source mutation flag releases normally. This result is distinct from rejection/security and is not reported as successful switching. The existing source preflight and cache identity validation still run.

The native request posts one continuation through two UI queue turns, allowing the original attachment and its original default completion to run. It creates a completely fresh transaction/binding plan afterward; **every existing cold, identity, active-task, callback and ownership guard still applies**. Two turns are scheduling, never proof of readiness. Longer asynchronous work still rejects. There is no timer, nested RunLoop, counter manipulation, synthetic callback, cancellation, weakened guard or indefinite retry. If caches were destroyed/recreated before continuation, another setup result ends as rejection rather than rescheduling.

## Identity and completion

Each valid native dispatch gets a monotonically increasing generation in that exact physical BrowserInitState, including a selection of the already-current profile. Async profile-load completion and deferred cache continuation require the captured source Profile weak pointer still to be that window's actual profile, the same request generation, a live target and a live source window. New selections invalidate old continuations even after an away/back switch; closing/destroying either identity rejects. Full transaction entry checks still reject closing windows and unsupported state.

Only weak window/profile references cross queue boundaries. The target weak reference is captured before the transaction can invoke observers. Completion is moved once into either the deferred request or the existing rejection/success path. Rejection returns null; activation/Browser success occurs only after an actual switched/no-change result. Preview loading remains owned by its original completion wrapper, while direct menus introduce no persistent pending flag. Existing profile-loader/shutdown callback-drop behavior is unchanged.

## Integration and focused acceptance

Apply native.patch only after baseline hash review. Avatar state-manager crash fix must accompany this proposal before calling profile switching ready. This patch does not address that independently observed fatal. Build once with both fixes; exercise fresh-cache first selection, return selection and source data/identity preservation. Existing diagnostic logs remain available. Native compile and actual-app observation have not been performed by this lane.
