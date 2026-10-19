# Supplied NTP visual handoff proposal

This seven-source follow-up is pinned against appliedv26; the v27 profile-gate/navigator compiler fixes do not overlap it. `native.patch` + `manifest.json` are for the root composer after the active native build ends. They have **not** been applied or compiled. Shared sources are unchanged. New helper sources are saved in `port/`; existing changes are represented only by the patch.

## Recovered implementation

The pinned supplied framework (`64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`) has a second visual handoff path in ContentsWebView, in addition to content prerender activation:

- `045cc690` is PrepareAsideNtpTransition (provided decompile and embedded diagnostic). It requires distinct old/new WebContents with the same BrowserContext and matching Agent ownership. It clones the old holder's compositor layer tree, requires real surface content, converts origin into the owning view, sets opacity1 and a named transition layer, retains a weak destination and starts a2000000us timeout. `045cc578` recursively calls virtual Layer::Clone, checks primary/fallback surface content and attaches descendant clones.
- `030ae900` is UpdateBackgroundColor (embedded diagnostic at `0xdeca752`). `045cedc0` applies native-layer opacity, rather than changing holder visibility/input/focus. While the target background is unready or an old transition layer is held, the native layer is hidden behind the saved/theme content; readiness restores native opacity and allows the page body to paint without a solid matte.
- `045cd440` schedules the target-extension body probe. The exact original UTF16 expression at `0xd6e4064` reads only computed body background color, rejects missing/empty/transparent values and accepts alpha>=0.5. It runs in browser-owned isolated world4; Chromium155 names that world ISOLATED_WORLD_ID_CHROME_INTERNAL. It does not replace renderer APIs or inspect form values.
- `045ce128` is a background-readiness query, not a prerender activation selector. It consults `042b2454` when no transition layer exists, otherwise the current primary RFH's ready-ID set. The transferred handle is ready when its live candidate is the current primary, or while its actual handle remains loading/ready and the adopted primary still has an empty committed URL. Chromium155 PrerenderHandleImpl::IsValid precisely covers its kLoading/kReady states; the actual handle still owns all resources.
- `045ce9f8` accepts only boolean JS results, validates FromID/same WebContents/current primary and, while a transition is held, waits for InsertVisualStateCallback. `045ccff8` success marks the frame ready; failure retries. `045cf31c` deduplicates pending work, revalidates identity and retries after exactly50000us. Non-boolean/transparent results never fabricate readiness.
- Timeout `045cfcc0` stops the timer, releases transition-layer/weak-target state and invokes UpdateBackgroundColor only if a widget exists. It does not mark the page ready. This is preserved; the body probe remains responsible for readiness.

Raw bounded instructions, exact addresses and hashes are in `boolean-recovery.md`, `boolean-recovery-proof.json` and `transition-timeout-proof.txt`. `initial-root-proof.md` independently resolves the prior initial-empty-document mapping: the original+0x138 field is checked by the exact FrameTreeNode source diagnostics at981/982/988, matching current155. No content activation change is needed for that limit.

## Port scope and adaptation

The new AuxNtpTransitionState preserves the layer clone/opacity, real transferred-handle readiness, original expression,50ms retry,2s hold timeout, boolean-only result and visual fence. It uses document-lifetime weak pointers in addition to current primary/WebContents checks. Pending callbacks cannot clear another document's pending work; readiness is cleared on actual WebContents switches and cross-document commits, while hash navigation preserves it. Observer-driven background updates wait for a widget.

The target receives the original transparent page-base-color override separately from the theme matte and native-layer opacity. Navigating that same owned WebContents to ordinary content restores its unset page-base color; unrelated surfaces are not modified.

Current155 LayerSurface::Clone preserves its primary/fallback surfaces; LayerTreeOwner owns recursive descendants. Mac NativeViewHost creates its compositor layer and exposes it through holder()->layer(). This uses the real compositor tree; it does not substitute a screenshot or emulate a renderer.

The supplied target classifier covers other Agent extension surfaces and excludes an address-only WebContents user-data marker (`0xcee54b8`) whose exact class is unresolved. This proposal deliberately applies the recovered handoff only to the current enabled **actual newtab manifest override** or its still-empty owned transferred prerender. Other extension/dialog surfaces retain their existing behavior; parity there is not claimed. Permanent handle user data cannot classify a tab after it navigates to ordinary content: the transferred fallback also requires empty visible/committed URLs, a live candidate and a loading/ready actual handle.

## Validation and remaining acceptance

Temporary patch replay verifies all seven outputs and exact source baselines. Read-only review checks actual155 public weak-document, layer/surface ownership, observer, isolated-script, visual-state and timer signatures. Eleven authored fixed-expression fixtures execute the unchanged original probe (no target process, DOM, profile or network), and verify its embedded bytes exactly. No C++ compilation or UI observation has occurred for this follow-up.

After the active full build, focused targets are the new aux_ntp_transition_state.o, contents_web_view.o and ntp_prerender_service.o plus GN dependency checks. Approved disposable acceptance must cover prerender hit/miss, existing-source image continuity, theme/opacity, visual-fence failure/retry, timeout, hash navigation, cross-document navigation, source/destination closure, profile mismatch, incognito and switching to ordinary web content. The separate reported native DP/carrier authentication failure remains unresolved. No Keychain or owner scope operation is authorized by this proposal.
