# Actual editor and draft writer closure — A1

This slice extends the existing, consumed state-v2 draft capture adapter with
actual supplied editor/composer/upload/claim owners. Native profile/view/epoch
control remains in the organization lane. No native tree or accepted app changed.

## Implemented

- The real shared `create-editor` factory registers each exact controller and
  element synchronously. Capture reads its latest real snapshot, including
  changes not yet delivered by an ordinary callback, freezes editability, and
  flushes through the original callback. Actual IME composition refuses.
- React composers register in `useLayoutEffect`, expose their exact controller,
  and inspect actual file-read, attachment-publication, queued-submit, response,
  interrupt and scope refs. The closure gate requires one matching real manager
  per editor. A committed core preceding its parent registration refuses; a zero
  owner count or document.readyState never establishes completeness.
- The actual file reader holds a work ticket until its original Promise settles.
  A late file read taints capture while preserving the File/completion path;
  there is no silent attachment drop or forced completion at component teardown.
- Actual composer submission, session creation/upload and chat-client command
  promises remain productive until their real settlement. The actual chat
  client's private state also fences pending ACKs, streaming, reconnect,
  interrupt and deferred publication. Local destruction/rejection after a sent
  command or uncertain create does not become clean: uncertainty stays latched
  for that document, with no reset/timeout endpoint.
- The existing pending-message claim path refuses new claims while held. Capture
  inspects both cached and actual stored claims, even aged claims. A known failed
  ACK removal becomes a tombstone for that exact acknowledged claim only; it
  cannot hide a newer stored claim. Claim IDs/times/modes are not reset/reclaimed.
- Late draft/settings/pending-message writes use the existing failed-write memory
  and dirty-intent mechanisms, tainting validation while retaining unsaved data.
  Unknown serializers and asynchronous flushes refuse rather than invent success.
- Standalone New Tab and retained Mini draft owners join the same registry. New
  Tab options use that actual module's native-backed scope with the existing
  settings codec for initialization/flush, including current model/permission/
  runtime options. No new storage format is introduced. Private/Incognito state,
  unfinished New Tab files/submission, and nonempty search-only transient text
  remain in their current view and refuse unsupported capture.
- Native-correlated prepare/read/validate/seal/release functions retain one finite
  lease. Read-only recovery never repeats an ambiguous flush. A separate
  read-only seal after genuine native cohort/backend closure captures final
  shared-store bytes; later changes refuse strict validation. The payload never
  authorizes native identity, writer closure, target writes or activation.

Normal stylesheet/class names, typography, artwork, layout, geometry and motion
are unchanged. The only input freeze is during an explicit finite capture lease.
State identity v1 is unchanged and has no claimed live-upgrade capability.

## Consumed integration and exact inputs

`vendor/provided/aux-ui-draft-capture.mjs`, already called by the real UI stager,
now composes `aux-ui-draft-closure.mjs`. Its new transitive runtime/pins project
40 exact single-occurrence adaptations across8 supplied modules. The original
source version remains1.26.1016.1852. `inputs.json` pins original files,
revision29 predecessor outputs and runtime; `source-plan.json` pins actual full
outputs and expanded anchors. The original snapshot, prior stage and native tree
are unchanged. No root manifest/GN/registration/revision/packaging file is edited.

The integrator must add these exact three provenance inputs to its owned
`scripts/lib/provided-stage-inputs.mjs` list before staging a successor:

- `vendor/provided/aux-ui-draft-closure.mjs`
- `vendor/provided/aux-ui-draft-closure-runtime.js.txt`
- `docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1/inputs.json`

The existing capture adapter path is already listed; its changed hash must also
participate. Root owns the next exact UI revision and full stage. Native caller
binding uses the five exports in [PROTOCOL.md](PROTOCOL.md); there is no renderer
migration API registration, new permission, test-only execution or caller-owned
profile/path/generation parameter in this slice.

## Focused evidence

`project-ui.mjs` passed all8 original/predecessor/output hashes,40 anchor counts,
syntax, repeated-derivation refusal and exact original class arrays. It leaves
state-v1 inputs unchanged. `check-composition.mjs` proves the real consumed
pre-feature transformation followed by the complete current feature pipeline
produces exactly the projected bytes from the actual revision29 stage; it is not
an independently maintained final-bundle patch.

Fifteen bounded synthetic cases in `check.mjs` ran the actual adapted codec,
shared editor factory, file reader, composer inspection/flush callbacks, actual
private chat-command method, session-create callback and settings initialization.
They cover latest snapshots, IME, actual pending Promise lifetimes, attachment
publication, reserved claim/tombstone semantics, unknown results, held writes,
mounting/manager mismatch/unknown route refusal, private mode, lost-reply read
recovery, shared-store sealing and strict post-seal byte changes. No real storage,
attachment file, provider or app ran; unrelated synthetic secret values were not
read. The two early harness failures were missing repeated-guard coverage for the
file module and missing already-composed research helper stubs; corrected final
projection/composition/focused checks pass. No native/app acceptance is inferred.

## Genuine remaining gates

Only the reviewed rich/composer states of newtab.html, sidepanel.html, main.html
and minipopup.html can qualify locally, and only with their actual required
owners present. Settings/auxiliary/unknown pages, unregistered/plain inputs with
unsaved text, unsupported private/search state and missing serializers refuse.
This is deliberate preservation of unknown state, not complete page coverage.
A native owner must handle/refuse every actual required frame, document, origin,
namespace, enabled extension and worker; complete ordinary backend writer gates,
origin inventory, cross-frame intent conflicts/CAS, target readback/recovery,
journal qualification and activation still remain separate prerequisites.

The paired native controller must consume this final protocol with actual
ScriptExecutor permissions/frame matching, genuine DOM/extension writer gates
and immutable result bytes. Existing loaded-area/file-data acknowledgements do
not qualify the complete writer set. Legacy cached state-v1 modules require a
separate explicit bootstrap preserving unsaved work; they must not be reloaded or
cleared to fabricate support. Root must stage/build the coherent successor and
observe bounded disposable multi-document/profile/interruption and real UI
journeys before acceptance. This slice enables none of COLD/signing/release.
