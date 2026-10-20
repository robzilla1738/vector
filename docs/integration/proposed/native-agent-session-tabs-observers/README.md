# Agent session-tabs actual group observers

Followup to data-owner9dcab8c06, against that exact source output now compiled by root. The bounded original observer table e7223d8 points slots0/20/30/38 to the same4629df0 deferredRefresh thunk. Current155 ModelObserver has corresponding model, tab, grouped-state and group-metadata callbacks. The first data-owner port handled only model/tab; this restores both real group callbacks so actual agent-group metadata/membership updates reconcile the real target predicate immediately rather than waiting for the next2s successful poll. No graph/auth state or success response is fabricated. Original pinned-change slot28 is a noop and remains the upstream default.

Two-file pinned incremental proposal; no shared/native writes, builds or runtime. Original bytepins and independent filesystem replay pass with verify.py.
