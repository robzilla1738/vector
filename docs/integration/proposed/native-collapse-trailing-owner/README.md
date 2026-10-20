# Recover the missing trailing Collapse branch

The earlier `native-sidebar-top-controls` proposal correctly identified the leading Collapse emission but incorrectly generalized it to every expanded layout. The actual full supplied routine contains a second emission of the same child, selected when the combo owner is hidden. Aux now faithfully creates no combo leaves, so this omitted branch is the active case.

Original `03479440` layout, pinned arm64 framework:

- `34794d4..3479508`: read combo member +358 and its actual visibility at +1c8. A visible combo puts 1 into stack+30. Null/hidden combo goes through `34798f4..34798f8`, writing 0 there.
- `347a450..347a468`: the leading emission for Collapse +360 requires that flag and the existing not-hidden predicate. This is conditional, not the universal expanded placement.
- `347a558..347a574`: when that flag is zero and Collapse is allowed, branch to the alternate emission at `347a610`.
- `347a618..347a640`: get Collapse preferred size; subtract its width from host width w23.
- `347a644..347a664`: clamp coordinates nonnegative and add the explicit original 2 to x. The same child +360 is emitted at `347a680`.

The typed correction therefore uses leading placement when the real combo is visible, otherwise `max(0, host_width - collapse_width) + 2`. It preserves collapsed/compact branches, caption allowances, handlers, context menus, and genuine combo visibility. No new control is mounted and no profile/preference state is overridden.

Reference `/Users/rcourson/AI Blueprints/06/assets/runtime/ax-tree.txt` independently confirms this branch: sidebar width280; top-row x8,width264; Collapse x242,width32 relative to sidebar. The source expression gives 8 + 264 - 32 + 2 = 242 exactly. The integrator's live Aside inspection matches that trailing position. The two-pixel adjustment comes from original machine code, not screenshot tuning.

`files.json` pins the actual composition preimage/output. Exact-preimage patch application was verified in a temporary directory. No native checkout edit/build/sign/profile access occurred here. Integrated compile/live comparison remains the integrator's responsibility.
