# L1 shortcut feedback review — October 1, 2026

Outcome: new open P2 DR-006. No P0/P1 visual finding from this supplied state. DR-001 through DR-005 remain open. Full appearance, interaction and reduced-preference evidence remains pending; no F1 functional/performance/qualification approval is claimed.

Review worktree merged only integration 5ee81b09 before this review. Product source remains untouched by reviewer. Native evidence was read from `/Users/rcourson/Code/web/release/test-artifacts/l1-f4428484-shortcut-perf/`.

| Field | Independently verified value |
|---|---|
| Product | f4428484e8ee677b277245f3a246acf1bfd2b4af, clean |
| Tree | e3703397e259e446a185959728b9a792493e9a48 |
| Native manifest | de283406805e7e5d28c8b20ddb35aad1b71037b719e9ab77a7df702589ca4fe9 |
| Shell digest | c6c75fe4df2add5ecf7ae432a895619b50564177688eadd42cd4e674466bdeed |
| Manifest SHA256 | 841bcf3c438120b624722cb23c3299e794f597980dcdf2aba0c416ea2a2a9a57 |
| Capture | shortcut-performance.png, window 10028 |
| Capture SHA256 | 1b3b448aa249c7040ba2c789de279b706e442f984b2fe94055af09067c48601f |
| Capture bytes | 671278 |
| Native window | x22,y56,width1200,height949 |

Capture was directly inspected and hash/bytes independently checked. The shell visibly uses dark chrome; forced theme, Reduce Motion and Reduce Transparency values remain unproven. The image shows expanded vertical sidebar and a native Red page. The horizontal collapsed page-side Show sidebar control implicated in DR-005 is absent. Consequently the new opaque backing source repair cannot be verified or closed by this image.

## DR-006 — P2 — Repeated shortcut advisory stacks duplicate toasts

Feature: commandRegistry/F1 and F21 toasts. Owner: L1 command feedback, with integrator shared toast adapter if needed. Status: open.

The capture shows two identical toasts simultaneously at the top of the page: Press again to use this shortcut on the website. Both have the same check icon and dismiss action. Repeated first presses during the physical shortcut trials accumulate identical guidance, covering an additional row of page content without giving the person new information. Toast copy is legible and each dismiss control fits; the concrete issue is repeated equivalent feedback.

Required: coalesce or refresh the advisory for the same chord/context while preserving correct second-press website delivery and actual command outcomes. Distinct error/action receipts must retain their independent semantics; avoid blanket deduplication that discards meaningful feedback.

Closure: new native evidence after repeated first presses shows one current advisory for an equivalent chord/context; distinct feedback still works; real dismiss input and website second-press delivery assertions pass. Inspect hover/focus and four appearance cells for final F21 acceptance. This static capture cannot verify popup 82ms/default 150ms timing or reduced-motion behavior.

L1 and root received this finding directly. The performance manifest's 20-trial recording step passes but its p95 gate fails at 99.82ms against 50ms. The separate functional core run fails on second website keyup, according to root. Those failures remain functional/performance blockers and are not waived by this visual review.
