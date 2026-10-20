# Glic staged graph verification

2026-10-19 source-only combined replay verified these immutable proposals in one disposable filesystem: glic-iph-profile-lifecycle, glic-button-profile-lifecycle, glic-dormant-bubble-profile, glic-private-graph-profile, glic-split-profile-lifecycle. Twenty unique source files matched their actual applied135 baseline hashes before replay and final hashes afterward. Shared source remained unchanged. This is source/patch verification, not a compile, actual OS, AI or UI acceptance test.

The two-file check-op-dependencies follow-up adds explicit dependencies for new CHECK_EQ/CHECK_GT uses on top of the previously committed IPH/bubble outputs; it does not change behavior. Apply after those predecessors. The private graph and Split patches already carry this direct header dependency.

All new member call-depth scopes use weak leave closures, not member AutoReset. Private nudge Finish is a pure prepared-flag toggle. The outer callback-list traversal weak-checks lifetime between its two real delegate callbacks; source/target finish operations that can invoke real UI callbacks weak-check before accessing the next owner.

REA metadata open verified the supplied thin binary SHA. Its provider byte request timed out; it was not used as evidence. Queued close completed successfully with result null: no active binary target remains. Original feature evidence comes from the pinned static Mach-O records and bounded llvm disassembly, as recorded separately.

Remaining deliberate limitations: actual target/source Glic eligibility must match existing stable owners, both real delegate bubbles must be destroyed (including closing observation), no source task/nudge/promo/panel/queued callback may remain, and the owner transaction must remain non-yielding. No profile-switch trigger, fake data, silent callback cancellation, fabricated UI completion, shared native write or build was introduced.
