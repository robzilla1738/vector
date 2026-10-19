# Cookie controls: stable bubble, private profile owner

This is a Chromium 155 platform adaptation, not a claim that the original named these hooks. The original `04559f80` switches the same physical Browser and refreshes profile services; the actual current implementation stores CookieSettings and HostContentSettingsMap in its private CookieControlsController. Keeping that controller across identity transfer would use the source profile's settings.

The four-file patch is source-pinned, replay-checked, and uncompiled. It does not edit BrowserWindowFeatures or trigger a profile switch.

## Required owner ordering

1. Preflight the stable coordinator's `CanRebindForAuxProfileSwitch()`. It rejects the real bubble, its controller, any still-live closing Widget, and callback-stack reentrancy. It never closes UI on behalf of the user.
2. Begin calls coordinator `PrepareForAuxProfileSwitch()` before BrowserActions retires its action tree. This clears only the raw action alias and prevents new bubble creation. Keep the actual source CookieControlsController throughout source detach and every possible rollback.
3. If detach fails, restore the actual source tabs first, as the core already does. Their activation still resolves the genuine source CookieControlsController. Rebind the coordinator with the retained/rebuilt source BrowserActions root. No empty-model requirement is imposed on this action-alias-only operation.
4. Only after committed identity and real source detach, CHECK old controller `CanRetireWithoutUi()`, then destroy the old private controller. Its default destructor unregisters CookieSettings/TabObserver/timer/weak handles. Do not call OnUiClosing, OnBubbleCloseTriggered, OnPageFinishedLoading, or any user toggle/reload method to simulate completion.
5. Recreate the private controller with the existing exact BWF constructor: actual target CookieSettingsFactory, actual target HostContentSettingsMapFactory, and the existing original-profile/Incognito arguments. Preserve its same actual UnownedUserDataHost registration. Rebind the stable coordinator from the actual target BrowserActions root before target insertion/activation.
6. Real target insertion invokes the existing tab-owned CookieControlsPageActionController activation. Its already-applied dynamic binding resolves both current controller and coordinator, drops the previous controller observation, observes the real new controller, and calls Update with its actual WebContents. No fabricated activation event or source-profile setter is needed.

## Actual source anchors and async lifetime

* `cookie_controls_bubble_coordinator.cc`: ShowBubble creates the real Widget and registers both WindowClosingCallback and ViewObserver. OnViewIsDeleting clears both pointers before calling the stable closing callback list. The new weak Widget list prevents this early pointer clearing from incorrectly declaring destruction complete; callback depth prevents a switch during Notify before the final action state write. The stable callback list and testing override are retained.
* `cookie_controls_controller.cc:130-140`: default destructor, while OnUiClosing performs an actual page Reload when should_reload_ is set. Retirement therefore must use the default destructor, never a fake UI close. `CanRetireWithoutUi()` exposes only the actual observer-list emptiness and mutates nothing.
* `cookie_controls_controller.h`: actual CookieSettings scoped observation, TabObserver (PageSpecificContentSettings and WebContents observers plus repeating timer), weak factory, and UI observer list all belong to the private controller.
* `cookie_controls_page_action_controller.cc`: the tab object itself holds no retained Profile or CookieSettings. OnWillDeactivate drops the actual controller observation. Its existing dynamic OnDidActivate fix refreshes the stable bubble callback source and window controller. That fix is sufficient for moved tabs, but does not itself replace the BWF private profile owner.
* `cookie_controls_bubble_view_controller.cc`: the actual view controller observes the cookie controller and owns favicon cancellation/weak callbacks. This patch does not replace it while active, cancel a user flow, or manufacture a reload.

All real UI/model activity stays on the existing UI sequence. No owner profiles, cookies, network, OS prompts, or runtime tests were accessed. Full provider orchestration and compiled/runtime acceptance remain separate.
