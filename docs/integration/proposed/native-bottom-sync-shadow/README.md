# Original hidden sync-card ViewShadow

Follow-up to `802100102`, with two exact pinned bottom-container outputs and eight counted anchors. This closes the previously explicit `a6ddb24` helper gap: it is the original `views::ViewShadow`, rather than a blur controller.

The original constructor allocates a `ui::Shadow`, initializes it with the passed elevation12, ensures the target View has a layer, adds the Shadow layer below it, copies the View layer's bounds and observes both lifetimes. The actual155 `ui/views/view_shadow.cc` has this same sequence and ownership. The existing implementation is reused directly, preserving automatic bounds tracking, region insertion and removal on View deletion. No new shadow design or custom ownership registry is introduced.

The original BottomContainer initializes its card's Layer rounded corners to12 and creates `ViewShadow(card,12)`, then sets the Shadow's four corner radii to0. Setter `6e01164` clamps the integer to nonnegative, duplicates it to four floats and forwards the exact rounded-corners setter. Its fixed-field compares and negative rejection match current `ui::Shadow::SetRoundedCorners`.

Original override `4245240` calls base View layout at `1428754` (clearing the actual needs-layout flag and using the real layout manager), then updates the Shadow radius to `max(0,min(12,min(card.width,card.height)/2))`. The source uses integer arithmetic with truncation toward zero before clamping. The155 port calls `LayoutSuperclass<views::FlexLayoutView>(this)` from the supported `Layout(PassKey)` override and uses the same integer clamp. This is a platform API adaptation, not a different update trigger.

The real card and row remain hidden in the recovered owner paths. No visibility, label or SyncService state is changed here. The remaining source color221-to-shared155-color-ID binding for the hidden, stopped Throbber stays explicit in the owner README; no unsupported animation/paint is claimed.

Run `python3 docs/integration/proposed/native-bottom-sync-shadow/verify.py`. It pins original function bytes, actual155 ViewShadow/Shadow/Layout sources, exact clamp instructions, eight anchors and disposable two-file replay. No original app, View/Shadow, service or owner profile is executed. Native compilation and real presentation acceptance remain pending with the integrator. No new source files or GN registrations are required.
