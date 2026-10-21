# Retain dormant iOS promo owner across Aux profile transitions

Actual v574 runtime reported unported.ios_promo_controller after the contextual-task lifecycle repair. This proposal pins current v576 source. Static defaults do not establish runtime owner absence; the existing owner must migrate correctly.

The original IOSPromoController constructor registers a callback with IOSPromoTriggerServiceFactory for its window's profile. That subscription is the retained profile boundary; eligibility and user-education lookups otherwise resolve through the same BrowserWindowInterface dynamically. Factor only the original subscription setup into a helper. Keep the controller, window pointer, unowned-userdata identity and original registration behavior.

Readiness rejects any pending weak-pointer tab-group task, editor-hidden subscription or active feature promo, and an already paused controller. The existing visible-window education guard additionally rejects queued promotion work. Pause disconnects the old profile callback before any tab/profile transfer. The transaction validates and pauses visible/source-cache/target-cache owners, then resumes their original factories only after successful commit or source rollback, using each window's actual final profile. Existing feature eligibility is retained; no owner is fabricated and no feature disabled. Callback entry points reject work while paused.

Count-checked three-file patch and exact isolated replay/hash validation passed. No shared native edits, compile, runtime/profile inspection or OS operation. Integrator should compile ios_promo_controller and browser_window_features_aux_profile_switch objects, then observe a genuine forward/back profile switch. Active/pending promo work intentionally remains a rejection.
