# Agent panel330DIP default and minimum

The actual supplied desktop reference panel is approximately660 physical pixels at2x, hence330DIP. Aux547 was approximately720 physical pixels/360DIP, matching the unchanged stock default and minimum. This is an actual-reference-measured155 integration adjustment, not a recovered native source constant or evidence of a660DIP preference bug.

Use330 only for the genuine current bundled Agent entry on Mac; leave third-party panels, constructor fallback and explicit user resize preference precedence unchanged. The current entry key is set before UpdateWidthOnEntryChanged. Agent minimum is likewise330 so the layout does not re-clamp the new default to360. Null border avoids a UI lookup during early construction. No profile preferences were inspected or modified.

Pinned actual547 single-file baseline; two exact anchors and patch dry-run checked. No native edits/build. Integrator should open fresh Agent panel, resize/reopen to verify retained width, and open another extension panel to confirm stock default.
