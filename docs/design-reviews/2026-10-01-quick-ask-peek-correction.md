# Corrected Quick Ask and Link Peek review — October 1, 2026

Outcome: earlier Quick Ask capture-target defect closed for this candidate. No new P0/P1/P2 found in the supplied default states. Full F21 feature/theme/reduced-preference/state/motion acceptance remains pending. Foundation DR-001 through DR-004 remain open; no new Reader/About closure captures were supplied in this review.

Candidate product 631f3a44afd2f9b241300c9f7d25f23947c3ab51 is clean; tree 3ab7a8c995139d0a01b628eda5dcc410a2237038. Native manifest 386a28167923c9fab3ead96c185e2c3abfe679862317c59e59c58392458fa4b4. Shell digest c2342cba909a34d9556560fd76c4eb256168b9183b5075b28fb7e3fa2914493c. Images visibly use dark chrome; actual theme and reduced-preference settings are not established by these manifests. Each capture was inspected directly; all four image hashes and byte counts were independently verified.

Evidence root: `/Users/rcourson/Code/web/release/test-artifacts/`.

| Artifact | SHA256 | Bytes |
|---|---|---|
| `lj-dfe9a314-quick-ask-2026-10-01/manifest.json` | 4e0ceae561d3225d766c14c60613745af39f09f15e2a413e338de421ca794f32 | Manifest |
| `lj-dfe9a314-quick-ask-2026-10-01/quick-ask-focused.png` | 423cbd5f76461078041ae92a32183b9c8ac5b598e578ec8d944de29bf6e95a66 | 372414 |
| `lj-dfe9a314-link-peek-2026-10-01/manifest.json` | 93ece6b6861835bb5c485902f8fa6aae3dcea95689e0cbffbf8b963b25f6db23 | Manifest |
| `lj-dfe9a314-link-peek-2026-10-01/peek-bookmark.png` | 39c3d71756a357b1c3859c8e33a2285954e480a74df45072b1be5e83406a516c | 651980 |
| `lj-dfe9a314-link-peek-2026-10-01/peek-promoted.png` | ac8c5151ffce97e2337bf90e08a5e47b8a162fdfcc02313629030762e10b3468 | 641989 |
| `lj-dfe9a314-link-peek-2026-10-01/peek-dismissed.png` | ac8c5151ffce97e2337bf90e08a5e47b8a162fdfcc02313629030762e10b3468 | 641989 |

## Quick Ask

The corrected windowId 9724 capture shows the compact native window, Ask Aux header, New chat/Expand actions, Aux-branded empty state, focused composer with visible insertion caret, context picker, dictation and disabled empty Send button. The AX focus step describes window x595,y210,width520,height640 with focused Reply to conversation textarea x645,y710,width420,height57. Screenshot and AX now agree on the intended target. The earlier Settings-window capture defect is therefore closed; that closure does not approve unrelated states or preferences.

The default empty-state heading and explanatory copy are readable without clipping. Header actions and composer controls fit the compact width; native traffic lights occupy distinct space. The composer context picker reads Conversation tab unavailable because this fresh window has no linked browser page; its chooser/dropdown recovery state was not exercised in these captures. No functional or visual defect is inferred from that unexercised state. Keyboard-tab focus of other actions, draft expansion/preservation, loading/error/reply states and exact focus-ring token consistency remain pending.

## Link Peek

The preview capture shows Preview link and the fixture URL, with separate Open as tab and Close preview controls. Their labels are legible and do not collide with the URL at the tested width. The native Red fixture appears below the preview header; the normal sidebar retains selected Blue. The promoted capture removes the preview header and selects Red as a normal tab. The dismissed capture returns to the same normal Red state after the second preview is dismissed. Equal promoted/dismissed hashes are consistent with this stable restored state, and are not counted as distinct appearance cells.

All three journey steps pass; the native window remains x22,y56,width1200,height949. Fixtures' red page color/default typography belong to page content, not Aux theme tokens. No source inference is used to claim native glass or motion compliance. Both themes, reduced transparency, both tab layouts, long URLs/narrow width, hover/keyboard focus and popup/motion timings require additional builder evidence before final approval.
