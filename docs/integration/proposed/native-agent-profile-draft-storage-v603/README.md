# Preserve supplied Agent drafts across same-window profile switching

Source-only proposal pinned to composition603. Nine native files/25 count-checked anchors; six newly touched upstream files are directly SHA-pinned, the existing three match603 manifest output pins. Generator refuses changed baselines. No shared native mutation, build, UI/runtime, credentials or signing.

## Actual loss and ownership

Root typed an unsent draft using actual typeText in603 and observed it through AX, switched Your Aux→Person1→Your Aux, and reopened the panel to find an empty composer. Native Prepare currently deregisters all extension entries and destroys their hosts. Supplied1852 stores draft text/attachments/settings in document sessionStorage, so destruction loses them. Ordinary close/reopen retention does not address profile teardown.

The window-scoped extension manager now retains only the Agent's `SessionStorageNamespaceHandleMap`, keyed by weak exact Profile, retained exact Extension object and initial panel URL. It still deregisters and destroys the old coordinator/view/host and all browser delegates before identity moves. The successor global Agent host consumes the namespace only after that same Profile returns in that same physical window with the same Extension object/URL. The existing lazy CreateView path constructs WebContents with the retained namespace through Chromium's `CreateWithSessionStorage`, the API intended for reconstitution. There are never two live WebContents sharing that namespace. Default host construction for every other caller is unchanged.

Profile destruction clears its namespace and observer. Window destruction clears the manager and all namespace references. Extension unload/reload creates a different Extension object and prevents restoration even at the same version; option URL changes also reject reuse. A namespace is consumed once. Incognito namespace forwarding fails closed; tab-scoped panels never participate. No old profile document or live browser delegate is parked, and no sessionStorage bytes are copied into files, logs, another profile or another window. Rollback uses the same reconstruction path and therefore also preserves the source namespace.

This is same-window/profile-return draft preservation, not restart persistence or proof of in-flight agent/attachment execution migration. Original active-work guards stay intact.

## Latest-edit persistence boundary

The supplied draft writer debounces its sessionStorage callback250ms; preserving a namespace alone can still lose the latest immediate edit. `scripts/lib/provided-draft-flush.mjs` changes one exact writer anchor to flush the existing debouncer after every write. It retains the original callback, record format, storage backend, scope key, clear semantics and unmount flush. This does not serialize arbitrary editor state or invent a competing persistence layer. Model/project/permission storage was already synchronous.

Staging invokes this narrow transformation after the existing transformations and includes its source in stage provenance. A new UI stage is required; the old stage cannot satisfy new adaptation provenance. No signed daemon bytes change. Old supplied CSS/layout/components stay unchanged.

## Lean validation and limits

- Native count checks and `git apply --check` pass.
- Supplied1852 draft anchor matches exactly once.
- Executed the transformed writer with the actual supplied debounce implementation: latest edit and clearing persisted before write returned, without a timer wait.
- Independent source reviewer found no profile/namespace leak; exact identity/lifetime checks and sole host ownership retained.
- Host creation remains lazy: RegisterEntry supplies a create callback; it does not instantiate the host during Rebuild, whose prepared flag stays set until registration completes.

Integrator: build once, make a fresh supplied stage, then actual immediate unsent edit→profile switch→return/reopen (no send), verify target has no source draft and source retains exact text; one close/reopen and fullscreen-return observation as requested. Do not claim in-flight runtime migration or restart persistence from this change.
