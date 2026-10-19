# Lens real source abort

The transaction core can abort only before browser identity commits. Its completion callback runs after genuine source collections are restored. The existing target rebind correctly requires an empty target model; using it as an abort would CHECK on the restored source model.

This patch captures the source Profile WeakPtr during real Prepare and provides AbortAuxProfileSwitch. Abort verifies the actual same window/userdata and captured source identity, then runs the existing initialization of genuine source preferences/DSE/fullscreen/location-bar observations. Target Rebind keeps all original actual-target and empty-model guards. Both paths clear the capture, and neither opens Lens or synthesizes overlay/capture state. Actual post-insertion/abort entry-state refresh remains the owner's normal UpdateEntryPointsState(true).

Source anchors: actual LensOverlayEntryPointController Initialize/Prepare/Rebind bodies; ProfileSwitchTransaction Complete and Run rollback branches. This adapts those real current155 lifecycles to the supplied in-place owner; it does not infer a new original activation gesture.

Verification: exact two-file source SHA pins and disposable patch replay PASS. No shared edits, native build, owner profile, network or runtime parity assertion.
