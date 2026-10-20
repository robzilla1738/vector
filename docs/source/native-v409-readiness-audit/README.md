# Bounded v409 implementation-readiness audit

This reviews the current integrated native sources named by the older readiness notes. It introduces no native patch. `source-pins.json` records exact actual409 inputs; no app, profile, network, signing or OS operation was performed.

The older STATUS sentence saying agent-tabs row layout/model/ownership recovery is incomplete predates the later native UI, model, paint and API proposals. It should not be used as evidence that the old independent HTTP bubble is still active:

- `aux_agent_tabs_bubble.cc:694` selects the first real model group whose actual `TabGroupFeatures::is_agent_group()` is true, computes its real tab range/count, and hides/retires the button/bubble when absent. Group titles do not establish ownership.
- Rows at306 retain genuine stable TabHandles. Activate/Close at423/430 resolve the handle against the actual model; close uses native user-gesture/historical-tab flags. The row's title, favicon, intrinsic geometry, focus/hover close visibility and native hover-card context are implemented. Recovered role colors/paint are present. The button observes model/group changes at675–686.
- The bubble at481 uses real group/model observations, actual native group CloseAllTabsInGroup, native widget retirement, and model-destruction cleanup. The independent session HTTP feed/policy/error controls are absent. These correspond to the already integrated native-agent-tabs-native-ui, native-agent-tabs-paint and API155 adaptations; their earlier README gaps must be read with later proposals.

The generic claim that preview coordinator/gesture integration is still wholly missing is likewise outdated for the delivered preview path:

- `vertical_tab_strip_region_view.cc:1690` creates the real capture cache, `ProfilePreviewRegionOwner` and `ProfilePreviewInput` after actual header/tab-strip/admission prerequisites; it attaches input to the real widget. Retirement at1719 detaches before destruction. Input uses the real admission callback, not a width-only success stub.
- `aux_profile_preview_region_owner.cc:249` enforces actual source/profile/OTR/target predicates. Begin populates real profile metadata and chooses actual borrowed live surfaces, captured imagery or genuine metadata fallback in order. It does not manufacture live content.
- The owner's Commit at344 distinguishes immediate native dispatch from queued preview settlement through `ProfileSwitchRequest::Start/QueuePreviewCommit`. Input Commit at321 and OnCommitted at360 settle from the actual completion/result and retain crossfade cancellation/lifetime handling. A loaded profile alone does not mark a successful switch.

This bounded audit found no concrete missing implementation in those described paths that justifies another patch. It does **not** prove complete original ownership restoration, every gesture state or visual parity. Those require genuine normal-profile operation, which current disposable observations have not established.

The mini-popup's exact original locked-route policy remains a separate genuine source-evidence gap. Current `aux_mini_popup_api.cc:260` fetches actual profile security, checks sender/profile generation, then routes locked state to the supplied main entrypoint and unlocked state to minipopup. This audit did not recover a more exact original route or justify bypassing actual authentication/security state. No route change is proposed.

Actual remaining acceptance gate: supplied account/Vault/authentication readiness and normal-profile end-to-end validation, followed by real marked-group/gesture/popup observations. The successful incognito Collapse interactions and full409 build do not cover those states. Keep those runtime gates explicit while retiring the obsolete blanket “missing row/model” and “no coordinator integration” descriptions.
