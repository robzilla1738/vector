# Const-safe top-container paint selection

The actual v545 compile rejected a call to BrowserView::top_container() from the const BrowserView pointer accepted by ThemedBackground::PaintBackground. Identify the painting TopContainerView through the existing views::IsViewClass API, already used here for MainBackgroundRegionView. The TopContainerView header is already included. No mutable cast, wider BrowserView API or painting behavior change is needed.

Exact v545 single-file preimage and output are pinned. Disposable patch replay/output hash passed. The integrator owns the compile; this lane made no shared native edits or builds.
