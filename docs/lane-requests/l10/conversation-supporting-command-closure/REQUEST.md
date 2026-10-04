# Supporting Conversation content commands

Four source/test leaves, five scoped normal rows: open, close/collapse, width +16, width −16, reset320. Existing DetailPane original closeRef/event API is reused unchanged. Only Conversation opts in with actual supportingKey/committed current owner and actual root container. Original unopted SupportingContent remains usable without registry ownership.

Scoped controls use actual mounted chip, close button and separator, original native events, no lookup/click synthesis. Existing overlay/ResizeObserver, Escape/nativecancel/backdrop, width clamps and continuous pointer capture/edge coordinates remain. Exact original container binds after DOM refs exist; until then admission refuses without permanently retiring an unbound owner. Committed owner identity retires at layout; observed original parent/container mismatch permanently refuses. Gesture retains exact original element/pointer/owner; retired old up cannot release a newer distinct capture. Cleanup releases only retained original capture.

47 mounted controls pass including10 new and2 unchanged Supporting cases; shelltypes/scopedlint pass with original warnings. Original pointer move owner guard removal reproduces actual stale width320→400 after observed window ABA. Initial positive failures revealing child-layout/parent-ref timing retained, actual producer owner corrected. Exact F/R/F/result bytes pass.

No Vite/native/App/helper effects or budget/qualification claim. Attachment5/Source6 untouched. Child Document/Saved/Generated preview actions remain separate.
