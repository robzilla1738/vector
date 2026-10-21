# Used, settled AIM lifecycle proposal

Baseline v589. **Source proposal only: not compiled, integrated or observed.** Eighteen files,37 uniquely count-checked edits, before/after SHA pins and clean `git apply --check`. Shared Chromium, UI styling, running app and build outputs are untouched.

## Ownership flow

The existing `ClearPopup() => input` contract and original renderer reset/draft restoration stay intact. After the original clear reply restores source input, C++ asks a new internal AIM `GetAuxRetirementState` query. The renderer rejects intentional context preservation and any reopened/new-context generation. It then awaits the new searchbox `GetAuxRetirementState` reply on the **same Mojo remote** used by original `clearFiles` and `stopAutocomplete`; this establishes processing order rather than assuming `updateComplete` drained native requests.

The renderer additionally requires empty input/context/uploads and no submission, voice overlay or context menu. The native contextual owner checks actual tab-fetch maps, cached context, selected tabs, autocomplete completion, async query-contextualizer continuations, Drive picker/disclaimer/sign-in ownership, screenshots/screenshare and URL/navigation completion. A shared contextual session must have no uploaded/submitted tokens, persistent tabs or prior turns. Warm session allocation alone is allowed; it is not created or mutated by admission.

Native URL generation and navigation handoff callbacks receive scoped completion tokens. Counters decrement when callbacks complete **or are discarded**; no timeout pretends work finished. Query contextualizer inspection uses its own weak-factory continuations (the four GetWeakPtr sites are async selection/context retrieval/upload work), not the contextual handler's weak factory, which also owns permanent eligibility subscriptions.

Each native clear captures its generation before sending the request. A stale reply cannot detach or overwrite a reopened current popup; its background-source draft is preserved where applicable. The later settlement reply must match that generation and actual hidden state, and rechecks all native owner state. Only then is the old source-tab capture released. Live admission rechecks the native predicate again. Existing outstanding clear/query callbacks remain covered by the content WeakPtr check.

The presenter uses existing actual idle widget/focus/permission/blocker checks rather than the historical never-used bit. Its content still requires either the original cold checks or this completed settlement proof. File selector and all outer LocationBar/transaction guards remain intact. The already-present Begin/End/Abort lifecycle destroys/recreates whole source-profile owners after preflight; no source handler/session is reused against a target profile.

## Deliberate refusal boundaries

This does not force-close context or cancel work to make switching pass. Intentionally preserved contexts, persistent turns/tabs, pending navigation/upload/screenshare/permissions remain rejected. Existing cold-only native file-selector guard remains, so a previously used file-selector may still require its own settled lifecycle. The Drive disclaimer/sign-in controller checks are conservative object-presence checks; if a completed flow retains those objects, it remains rejected until their owner exposes an exact idle predicate. No broad full-AIM acceptance is claimed for such flows.

The common searchbox method is read-only and defaults to false. The other direct searchbox Mojo implementation, ContextualTasksExtensionHandler, explicitly returns false. Only the contextual owner can attest its state. CSS, geometry, displayed text, model behavior and original async clear callback signature are unchanged.

## Integrator acceptance

Review/apply after actual589 baseline. Native/Mojo/TS compilation is still required; static pins are not compile evidence. One focused real-app sequence should open/type/close/settle/switch/back, confirming source input and identity preservation; a preserved-context/picker or pending navigation must still refuse. Check reopen-before-clear-reply behavior if an actual failure warrants it. No paid AI suite or broad UI retest is needed. Normal outer profile/draft guards can still legitimately refuse independently of this AIM owner.
