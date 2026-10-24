# Profile bootstrap and remaining window controls — batch A3

This slice fixes native profile controls that can outlive their original source. It preserves the accepted UI, native pages/history, preview timing and row styles. It also establishes the exact remaining admission dependency rather than pretending a daemon-ready signal admits browser writers.

## Implemented behavior

- Edit-profile Save retains the genuine source Profile and cookie/account binding epoch through the native modal. A later profile/account switch, cookie restore, closing window or shutdown refuses that stale command. A deleted/omitted target does not become an empty edit dialog or a later write.
- Delete-profile confirmation retains the same genuine source through final confirmation and still rechecks the actual native deletion eligibility. This changes source only; no profile was deleted or owner state read during this work.
- Deferred menu actions and New Profile completion now also refuse closing/deleted/shutting-down native windows. All current-source commands retain their existing implementation and UI.
- Queued native profile-preview commits retain the actual source Profile and binding epoch at queue time. The existing 50ms frame-settle timer cannot silently apply an old target to a replacement source in the same live window.
- Starting a preview switch captures its actual source before restoring borrowed Views, then rechecks that source after restoration, which can reenter profile/account changes. A stale intent completes with null instead of dispatching against a replacement profile. No preview, animation, timeout, polling loop or generic readiness helper is added.

## Overlay composition

The shared native tree remains frozen at the first63 composition. `source-plan.json` and `native.patch` therefore use those exact actual input bytes. The sidebar and request implementation outputs **include and supersede the corresponding reviewed A2 outputs**, followed by A3's counted changes. The request header is a new A3 overlay. Preserve A2's other ten files; do not apply A2 then this full patch sequentially to the same files.

There are **3 native files / 39 sequential counted anchors: 19 retained A2 anchors plus 20 A3 anchors**. Each file has its exact input/output SHA-256 and source output path; superseded A2 output hashes are explicit. Root owns composition, projection, GN, compilation, packaging and startup.

## Admission inspection: actual result

`inspect_admission.py` pins six actual native producer/public-hook files and fourteen exact evidence anchors. `actual-admission-inspection-a3.json` records the result. `root-cold-entry-observation-a1.json` copies the integrator's exact object/command observation, with source-path and SHA-256 provenance recorded. No compiler or native process was executed by this lane.

The genuine admission producer is `AuthorizeNativeBrowserStartupBeforeLocalState` in `AuxSelectedStateHome.cc`. It obtains and validates the real startup lease, accepts the actual authority reply, binds descendant scope and revalidates roots/child/pulse. Only then does it assign the retained browser roots and nonzero generation. Its public interface is synchronous; it publishes no admission-ready observer.

The pinned dormant consumer in `ChromeFeatureListCreator::CreatePrefService` checks real private roots, the sealed native daemon's selected route and that genuine admission function **before** locating/reading Local State. The actual compiled target command lacks `AUX_SEALED_NATIVE_COLD_ENTRY`; the observed object has no direct startup-gate references. This is source/compiled-object evidence, not execution of startup.

The selected-home monitor services its actual child and closes admission on failure. `ReadyHomePulse` is explicitly observational. Browser drain ACKs report drain observation; feature-ready/settled callbacks describe local store I/O. None assigns browser writer admission. Substituting any of them for an admission-ready event would create false authority.

Consequently this slice adds **no fresh-profile retry callback**. A2's initializer remains truthful and unavailable without genuine admission. Once the real pre-Local-State admission path is integrated and active, genuine profile creation/setup should follow admission; it must not be simulated by a late UI retry after profile I/O already happened.

## Concrete root integration handoff

The necessary owner is the existing native startup/COLD path, outside this lane's ownership:

1. Integrate the existing exact native root preparation, sealed child selection and `AuthorizeNativeBrowserStartupBeforeLocalState` calls into the actual Aux metrics/startup target before Local State or Profile construction. Build-definition activation alone is not runtime acceptance, and the path must retain all current real lease/ACK/root/descendant checks.
2. Verify the real target command and resulting object consume that existing path, using the current cold observation as a precise negative baseline. Do not add profile creation, UUID writes, feature-store opens or a ready boolean to bypass missing admission.
3. Keep package pairing, product signing and any disposable startup execution under their separate root gates. This proposal authorizes or performs none of them.
4. After genuine admission exists, the real `FinalizeNewProfileSetup` bootstrap and direct sidebar creation completion already call A2's `InitializeFreshProfileIdentity`. Its actual pref change wakes the initially identity-less organization window and account updater. Verify this lifecycle with a bounded disposable fresh profile, not a fabricated ready event.
5. Retain `kCreatedPending` until the real pref writer owner can demonstrate persistence. A success-less PrefService completion, callback destruction or elapsed time must not become durable success or whole-browser drain acceptance. Ambiguous existing missing IDs still require explicit migration handling; do not silently repair them.

This handoff deliberately changes no root startup source or build registration while the build is frozen. No supported existing late-ready producer was found in the pinned owner/API set, so no executable retry patch is claimed.

## Lean checks performed and remaining

One exact patch replay checked all input/output hashes and 39 counted anchors, applied the patch in a disposable tree, verified reverse applicability and changed-line whitespace, and confirmed the shared native inputs were unchanged. `actual-source-check-a3.json` contains the actual result. The admission inspection is read-only source/object-evidence analysis.

Root still needs to compile `aux_sidebar_view` and `aux_profile_switch_request` with these composed outputs. A bounded disposable-app observation must confirm current commands still save/confirm/switch normally, while stale dialog/preview commands refuse after a profile/account transition or window close. Genuine COLD admission, pending-pref persistence, app/runtime acceptance and visual comparison remain separate gates. No app/helper lifecycle, provider request, cloud access, owner data operation, OS grant, signing or release occurred here.
