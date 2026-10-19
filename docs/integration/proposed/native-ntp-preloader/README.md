# Supplied new-tab prerender pipeline audit

**Historical first audit:** follow-up [port notes](port-notes.md) and content-recovery-notes.md supersede the resolved profile/geometry/content-exception/handle gaps below. A real staged native port now exists in port-native.patch plus content-recovery.patch; it remains unapplied/uncompiled and has no runtime acceptance.

This is a static fidelity audit, **not an implemented native port or an eligibility-only parity claim**. No native.patch is supplied: the exact original content/renderer scheme exceptions and activation-lifetime semantics remain unproven, so simply calling155 StartPrerendering would fail, and weakening global restrictions would be unjustified. Existing product/source behavior is unchanged.

Baseline: frozen shared nativev24 plus the unapplied preference-consumers proposal9649055af/root27c42708d, represented by root out/native-reuse-composition-v25. `current-boundary.json` pins parent composition/patch, verifies a temporary replay of all three preference-consumer outputs, and matches its profile_gate.cc output to v25. Shared native hashes are pinned in source-pins.json; there were no shared writes or native builds. Root may compose a future delta against that v25 profile_gate.cc output; do not accidentally base it on earlier lane code.

## Supplied implementation recovered

Target is the exact supplied arm64 framework SHA25664c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c. Static target opening confirmed the hash and was closed without starting Ghidra analysis or executing the target. Existing owner-supplied decompiles are independently pinned; new bounded LLVM instruction extracts provide checks below. Analysis labels are descriptive, not recovered C++ symbols; ambiguous fields/helpers stay ambiguous.

| Entry | Observed behavior and source anchors |
| --- | --- |
| Eligible override042b14c0 | Checks feature object0xebae788 (name AsideNtpPrerender, raw default1); rejects profile flag +0x18→+0x30 bit0, helper0529c24 result2 and helper04ce584 true. Resolves actual chrome://newtab/ override, requires chrome-extension scheme and exact supplied Agent host, and compares the extension manifest's newtab mapping to that resolved URL. Exact strings are pinned at0xce48949,0xcbd441e,0xced7481. The meanings of the two profile helpers are not sufficiently recovered to name or replace them with guessed Profile methods. |
| Service lookup/constructor042b17e8 | Stores the service on the profile under aside-ntp-prerender, rejects the observed private-profile flag, subscribes to profile/browser lifetime, and observes seven preference paths listed below. This is distinct from a browser bootstrap gate. |
| Schedule042b1c64 | Requires same profile for service and source browser, source type integer0, and unset UnloadController flag. Remembers a weak source-browser identity; source disappearance stops scheduling and clears prerender state via042b35e8. Avoids another pending preload, calls eligibility and arms the timer with the caller-provided delay. The type0 interpretation as a normal browser is consistent with the layout/caller, but the raw guard is the authoritative evidence. |
| Start042b26d8 | Stops timer, rechecks source weak validity/profile and absence of a preload, resolves current override again, and checks network prediction0/1/3 allowed (2/unknown disabled). Creates a separate WebContents using source browser context/delegate-related state, initializes its helpers, records a native two-integer geometry token, and calls04057aa0 with embedder trigger3 and AsideNewTabPage suffix. Retains returned real prerender handle, observes lifecycle, and tears down on failed creation. This is not an ordinary hidden primary-page LoadURL. |
| Take042b1f54 | First requires exact requested chrome://newtab/ and matching profile. A remembered source-browser or geometry mismatch resets the candidate. Obtains a candidate frame via011ae06c/042b36b0; requires a real candidate, handle state less than2 and current resolved override equal to stored URL. Transfers the prerender handle into a custom user-data object aside-ntp-prerender-handle on the returned WebContents, retains weak frame/source context, changes observation/visibility state, then schedules replacement with delay0. A miss resets invalid state, schedules500000 microseconds, and returns null. Exact packed geometry meaning and helper semantics remain unresolved rather than asserted as a particular window-size API. |
| Reset042b34c0; pref callback042b2bcc | Reset removes handle observation, destroys handle before WebContents and clears stored URL/source candidate state. The preference callback stops timer, resets, and schedules500000 microseconds only if remembered source is still valid and matches profile. |
| Handle check042b2454 | Reads the transferred custom data during navigation and rechecks retained weak/current frame relationships and handle states. This proves activation lifetime extends beyond simply moving a WebContents out of the service. The full user-data class callbacks/destructor remain to be recovered. |

The constructor's exact observer table0xe8aa1f8 contains:

- extensions.chrome_url_overrides
- net.network_prediction_options
- aside.account_user_id
- aside.account_id
- aside.account_has_persisted_session
- aside.account_auth_paused
- browser.theme.color_scheme2

These are the supplied original preference identities. A port must map only the native account identity boundary consistently with actual account consumers, not silently rename cryptographic/wire domains or invent another storage convention.

## Difference from currentv25 ProfileGate

Current ProfileGate uses a single initially-hidden primary-page WebContents, ordinary LoadURL(newtab.html), DidStopLoading as readiness, and SetVirtualURL(chrome://newtab/) before returning it. Its Take API accepts only Profile*/URL, so it cannot enforce the supplied remembered source-browser/geometry checks and can consume one profile's preload from a different window. It accepts direct extension newtab URL too, while the supplied Take gate is exact chrome://newtab/. The current immediate PostTask warm-up is not the supplied500ms miss/invalidated-pref schedule, and only network-prediction preference observation is present after v25. No real PrerenderHandle or activation-lifetime transfer exists. The earlier bootstrap allowed()/Vault/extension checks do not substitute for the original service's own guards and pipeline.

## Concrete155 boundaries and missing source required before a faithful patch

1. **Eligibility semantics:** Recover0529c24 (enum2 predicate) and04ce584 (boolean profile predicate) and their profile-type/cache meaning. Original source function042b14c0 supplies exact branch/call anchors. Preserve feature/default and actual manifest override resolution; do not replace with a broad fixed extension URL eligibility check.
2. **Source-browser/geometry:** Recover the source browser window vtable+0x28 returning the two integers recorded at service+0x1c8/+0x1cc, original CreateParams/delegate plumbing around042b26d8, and lifecycle subscribers around042b1c64. A port requires a BrowserWindowInterface-aware Take/Schedule API and call-site change at chrome/browser/ui/navigator/browser_navigator.cc, not merely ProfileGate::Take(Profile*,url).
3. **Trusted extension prerender exceptions:** Current content/browser/preloading/prerender/prerender_host_registry.cc rejects every nonHTTP(S) initial URL (around664) and effective URLs. prerender_navigation_throttle.cc repeats scheme/effective-URL rejection for initial/redirect navigation (around130). Direct155 StartPrerendering would therefore return no usable handle for this extension URL. Recover the original narrow extension-ID/trigger/profile checks in the supplied original content host-registry/throttle and any renderer/extension API deferral path. Do not globally exempt chrome-extension URLs or substitute a different preload feature.
4. **Creation/activation handoff:** Recover the original04057aa0 entry/callee contract,011ae06c candidate-frame callback042b36b0, and02a61cb4/0259ab8c handoff meaning. Determine the exact original transition/navigation activation after return, rather than treating an already committed extension primary page as prerender activation.
5. **Transferred handle lifetime:** Recover the class at vtables0xe286730/0xe286760, custom aside-ntp-prerender-handle fields and callbacks/destructor referenced in042b1f54/042b2454. It retains the real prerender handle and weak frame/source associations after Take. A proposed155 observer must preserve this cancellation/navigation teardown behavior; moving/destroying the handle at arbitrary time can cancel activation or retain stale state.

A future faithful composition should introduce a distinct profile-owned NTP prerender service with the recovered browser-aware scheduler and lifetime handle, then replace only the independent ProfileGate preload responsibilities and navigator handoff. Bootstrap authentication/visibility can remain separately scoped. Keep real155 resource/visibility/critical-memory/privacy and activation checks unless supplied behavior demonstrates a narrowly authorized platform adaptation. No global content bypass is justified by this audit.

## Reproduction and readiness

```sh
python3 vendor/provided/audit-native-ntp-preload.py \
  /absolute/path/to/pinned/Aside-Framework-arm64
```

The audit validates full target hash, zero-based text mapping,11 bounded instruction ranges,7 direct-call anchors, feature/name/default, exact Agent/scheme/override key/request URL, seven preference strings, preload lookup and0/500000us scheduling instructions. Its output is static-audit.json. This stripped image has no LC_FUNCTION_STARTS; bounded windows are explicit and do not assert exhaustive function-body discovery. Existing decompile sizes can omit tail blocks, so assembly coverage is separately recorded.

The source-boundary temporary replay checks all preference-consumer outputs and matches profile_gate.cc to the pinnedv25 manifest. No native compiler, native target, browser/profile/preference operation, grant, Keychain, network, renderer or real new-tab activation was used. Native build/runtime/fidelity acceptance remains pending; this evidence does not mark the supplied prerender pipeline implemented.
