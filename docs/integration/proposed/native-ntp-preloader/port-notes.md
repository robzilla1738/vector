# Supplied NTP prerender port proposal

This follow-up supersedes the unresolved helper/content/geometry items in the historical first audit. It stages a real Chromium155 prerender implementation, not another hidden primary-page load. It is **unapplied, uncompiled and runtime-unverified**. Shared native sources were read only.

## Composition

Apply the eight-file `port-native.patch` with `port-manifest.json` atop the **unapplied v25** preference-consumers composition, then the ten-file `content-recovery.patch` with `content-recovery-manifest.json`. Both stages use `scripts/extend-provided-native.py --staged-base`; do not apply the second patch independently of the first. The composer verified all93 final source pins and independently replayed the cumulative patch from actual frozenv24 inputs in temporary storage. `port-validation.json` records exact parent/patch/cumulative hashes. The temporary compositions were removed afterward.

Example from the integration worktree (output directories must not already exist):

```sh
python3 scripts/extend-provided-native.py out/native-reuse-composition-v25 --staged-base --patch docs/integration/proposed/native-ntp-preloader/port-native.patch --metadata docs/integration/proposed/native-ntp-preloader/port-manifest.json --output out/native-reuse-ntp-service
python3 scripts/extend-provided-native.py out/native-reuse-ntp-service --staged-base --patch docs/integration/proposed/native-ntp-preloader/content-recovery.patch --metadata docs/integration/proposed/native-ntp-preloader/content-recovery-manifest.json --output out/native-reuse-ntp-content
```

The two new service sources are also saved under `port/` for direct review; modified existing sources are represented by the pinned patch rather than duplicated in full. The existing UI target compiles the service; the small Aux header target permits the profile gate and ChromeContentBrowserClient to call it without a UI dependency cycle. No shared GN or source changes have been made.

## Recovered behavior and port

The owner-supplied arm64 framework hash is `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. The bounded audit script and disassembly pin these paths:

- Eligibility042b14c0: reject incognito, guest and system profiles; require the enabled Agent extension, actual new-tab override, extension scheme/identity and exact manifest newtab URL. Helpers0529c24/04ce584 read the persisted profile-type enum and test system3.
- Service042b17e8/1c64/26d8: profile ownership, weak source-browser identity, browser-close invalidation,500ms scheduling, separate hidden WebContents, real embedder prerender handle, compositor/paint preparation and source-tab geometry. The geometry getter returns a Rect whose size is passed to WebContentsImpl::Resize; it is not a guessed window dimension.
- Take042b1f54 and caller036c5f74: only typed, browser-initiated foreground new-tab navigation can consume the preload. The creation browser and current source size must match, the live root must be prerendering the exact current eligible override. Normal navigator LoadURL remains in place to activate the prerender; the replaced independent early contents-to-insert shortcut skipped it.
- Handle042b3870/39b8: transfer the real handle into adopted WebContents user data; retain it until that WebContents dies. RenderFrameHostChanged copies fallback content from the weak source document into the matching activated frame and releases the source reference. Chromium155 WeakDocumentPtr provides the current safe document-lifetime equivalent.
- Reset042b34c0, preference callback042b2bcc and source-close042b35e8: cancel/reset on invalidation and schedule a replacement (zero delay after a hit,500ms after a miss/change). Current source-browser and frozen creation-browser weak identities remain distinct.

Original supplied account-pref names are preserved as evidence, not invented as new native state. The actual Aux registry/Vault gate enables or disables the service; registered override/network/theme preferences are observed directly. Successful existing authenticated gate checks still precede browser display/scheduling.

## Necessary content boundary

`content-recovery-notes.md` documents original callback0409ed78, attribute stamping04057aa0, registry04042320/43040, and throttle040437c4. The port adds a default-false browser callback and a per-request flag, revalidated at creation, start and every prerender navigation. Only a fresh browser-initiated embedder prerender for the exact current eligible Agent newtab URL skips the original recovered hidden-initiator/scheme/candidate-effective-URL guards. Redirects to another URL are rejected. Other eligibility, memory, origin, response and lifecycle guards remain.

The actual155 extension throttle permits browser-initiated navigation after enabled-extension/resource checks. Its prerender binder policies already grant extension LocalFrameHost, EventRouter and RendererHost, and its frame/port lifecycle admits prerender activation. No speculative extension binder bypass is proposed. `content-recovery-source-review.json` pins the inspected current headers and extension sources.

## Limits and next verification

The original initial-root byte is mapped conservatively to155 `is_on_initial_empty_document()` for the newly created empty WebContents. The native context initialization uses the active source's public native view. Both are explicit platform adaptations requiring focused compile and disposable runtime observation.

Recovered helper042b2454's sole caller045ce16c is a boolean UI/navigation-state helper with a GlobalRenderFrameHostId-set fallback. Its exact public-method identity is unresolved; it has not been shown to be an activation prerequisite. The evidence is retained and no speculative extra hook is added.

The public service signatures were reviewed against actual155 declarations, including prerender handle/observer, WeakDocumentPtr, RFH fallback, profile/browser weak pointers and collection observation. This is source review, not compilation. Required next checks are GN/focused object compilation after the root build lock is released, then real extension prerender creation, typed-navigation activation, first-frame fallback, replacement, account/lock/pref invalidation, source-close and incognito rejection in an approved disposable scope. The reported native DP/carrier authentication failure remains a separate functional-acceptance blocker; this proposal does not resolve it.
