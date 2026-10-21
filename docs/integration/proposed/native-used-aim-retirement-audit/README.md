# Used AIM retirement: static ownership audit

2026-10-21; current589 source. No shared native edits, guard relaxation, build or runtime. A safe narrow used-but-idle patch is **not established**. Keep the existing cold-only admission until the following owner contract is implemented and observed.

## Concrete source findings

- `OmniboxAimPopupWebUIContent::ShowUI` captures the active source tab, consumes pending `SearchboxContextData`, creates/reuses the profile-specific contextual session, sets invocation source and sends its text/context to the renderer.
- `OmniboxPopupAimPresenter::Hide` resets widget/focus observations and delegates to the base hide. The base hides the widget and calls content `Clear`; that is an asynchronous renderer transaction, not proof that source work finished.
- `aim_app.ts::clearPopup_` explicitly skips `composebox.resetSession()` when `preserveContextOnClose_` is true. This is intentional context/picker handoff behavior. Its Mojo reply carries **only input text**, so the C++ callback cannot tell a cleared session from a preserved one.
- `OnClearCallback` detaches and restores input to the original current/background source tab. `active_web_contents_` is never reset. Simply clearing it would hide ownership rather than prove cleanup.
- `resetSession()` resets renderer inputs/autocomplete/modes. Waiting on renderer `updateComplete` does not acknowledge completion of separate native searchbox/composebox Mojo calls. The browser-side contextual handler owns pending tab fetches, query contextualization, context/upload observers, Drive picker callbacks and screenshare state.
- `OmniboxPopupUI` owns a shared contextual session which must outlive both searchbox/composebox handlers. Session presence alone is not user work: constructor setup and query completion can create a warm session. Conversely a hidden widget is not proof of an empty session.
- `ContextualSearchboxHandler` destructor cancels fetches, tears down contextualizer/observer and completes a pending Drive callback. Destruction is memory-safe cleanup, but cancelling live work or losing intentionally retained context does not preserve user behavior.

## Required narrow lifecycle contract before implementation

1. Extend the internal AIM clear reply to report whether context was deliberately preserved and a per-invocation close generation. Preserve existing input restoration before any source identity changes. Reject stale close replies/reopened popup generations.
2. Track pending clear completion explicitly. Do not use a historical invocation bit or generic WeakPtr existence as a proxy for all asynchronous work.
3. Obtain a native settled-state acknowledgment from the actual composebox/contextual owner after its reset requests have completed. The owner must report active query/navigation handoff, tab fetches/uploads, file/picker/screenshare/permission work, retained context and renderer pending close. A no-op renderer frame acknowledgment is insufficient across distinct Mojo pipes.
4. Admit only hidden, detached, reset-complete, non-preserving sessions with no user work. Keep an intentional preserved-context close rejected or implement per-source-profile retention; do not force its reset to permit switching.
5. Once complete transition preflight is stable, destroy the whole source AIM presenter/content/WebContents/controller ownership tree in Begin, after stopping callbacks. Retain the existing constructor-based recreation on coherent target End and coherent source Abort. Do not reuse profile-bound handlers or transfer raw session pointers.
6. Use the existing presenter widget/focus/permission/blocker checks plus file-selector ownership checks. A used-but-idle content allowance cannot override independent active picker/file work.

This is an implementation dependency contract, not a safe ready-to-apply patch. It is larger than the classic popup change because AIM intentionally retains source context across some closes. The most useful focused acceptance is open/type/close/settle/switch/back preserving source text, plus a refusal while a context-preserving picker/session is active. No paid AI suite or broad UI rebuild is warranted for the audit.

The supplied recovered-C++ directory was searched narrowly for `ClearPopup`, `preserveContextOnClose` and `OnClearCallback`; no matching text was returned. That negative search is not proof of missing behavior or authority to remove it. The pinned current native and original Chromium renderer ownership is the concrete evidence here.
