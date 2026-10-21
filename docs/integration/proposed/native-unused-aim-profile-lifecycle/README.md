# Retire only never-invoked AIM owners during a profile transition

Pinned to v584 (the broad exact-admission diagnostics are present). This is a Chromium155 ownership adaptation, not claimed recovered Aside C++. Current kWebUIOmniboxAimPopup is ENABLED by default; every normal nonpopup LocationBar creates an AIM presenter plus file selector. The prior predicate categorically rejected those owner pointers even when unused since construction.

## Scope and ownership

Permit retirement only if the presenter and content have never entered an invocation, focus, context, clear callback or permission interaction, and the file selector has never started any work. Sticky flags are set BEFORE the relevant original method body, including callback entry, and never cleared during an owner's lifetime. Any previously used owner remains rejected, even after its window closes; this conservative batch does not implement migration of a used AIM session.

Twenty-seven explicit cold checks additionally reject visible/deferred popups, destruction in progress, widgets awaiting deletion, permission observation/prompt/dismissal, deactivation blockers, focus state/observers/restoration, captured source-tab context, pending content callbacks, file dialog/edit-model/tab references, pending file/upload weak callbacks, and externally installed file callbacks. Each failure emits only its fixed `aim-cold.*` stage; stages.json maps the conditions. No runtime data is printed. No mutable owner is retired during admission.

LocationBar Begin already marks the transaction paused after complete admission/revalidation. Immediately after invalidating its own weak callbacks, it records which original optional helpers existed and destroys those cold helpers before autocomplete/pref mutations. The original presenter destructor closes/drains its widgets and destroys the old-profile WebUI wrapper and observers; the original file-selector destructor releases its listener, with admission proving it has no dialog or work. This does not reset arbitrary client receivers or cancel user work.

LocationBar End uses the exact original presenter and file-selector constructors after profile identity/client/pref rebinding is coherent. Abort already restores original source observations and delegates to End, so it reconstructs the same source-profile helpers. Original optional presence is preserved. No feature is disabled and normal AIM/address/context-menu behavior remains available after reconstruction.

## Source audit and limitations

Original current155 flow: AIM presenter constructor creates content; SetContentURL calls LoadContent, which creates a profile WebUI wrapper, tab-selection listener, permissions manager and host callbacks. SetWebUIContent creates its widget. Show invokes content ShowUI; ShowUI can also arrive through WebUIContentsWrapper::Host. Both invocation paths are covered independently. ShowUI captures active-tab context, takes pending searchbox context and can create a contextual session. Initial cached WebContents alone are not classified as user work, but any such context-bearing ShowUI invocation permanently rejects cold retirement.

The file selector starts dialog/tab/edit-model ownership in OpenFileUploadDialog. FileSelected/MultiFilesSelected can post ThreadPool reads; OnFileDataReady starts uploads; UpdateSearchboxContextData and OpenAiMode can mutate actual source context later. Every work/callback entry is sticky, so closing the OS dialog cannot make in-flight or previously used state appear cold. Callback setters/issued weak handles also prevent retirement before invocation when another owner already retained the helper.

Supplied recovered-cpp indexes and native named-functions/string-xref-map contain no matches for the exact WebUIOmniboxAimPopup, OmniboxPopupAimPresenter or OmniboxPopupFileSelector symbols. This is absence in partial recovery, NOT proof the original disables AIM. No source-backed original startup override was established. Current native address/context-menu routes can reach original AIM, so this proposal does not exclude its construction or remove those routes.

If actual initial renderer lifecycle automatically invokes ShowUI/Clear or installs file callbacks, admission will still reject with an exact reason. Do not weaken the cold predicates merely to pass; that result requires a real used-session lifecycle adaptation. The batch is intended to repair genuinely never-invoked default owners only.

## Lean verification

All ten files use exact v584 baseline/output SHA-256 pins and count-checked replacements. Isolated git apply --check, patch replay and byte comparison passed. Current WeakPtrFactory::HasWeakPtrs is const; no getter here creates WebContents. Getter predicates are evaluated in fixed order and once. Existing outer LocationBar guards for active popup, state transition, WebUI full/classic popup modes, menu activity, source identity and initialized controller remain unchanged.

No shared checkout changes, build, runtime/profile reads, credential access or OS actions occurred. Integrator owns targeted compile, full build and one normal profile switch/rollback check, with existing native search/UI preservation. The supplied recovered hashes and relevant unchanged source are pinned in evidence.json.
