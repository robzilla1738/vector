# Preserve the original idle-close semantics

The actual585 first profile switch rejects aim-cold.content-invoked. Source tracing identifies a deterministic non-user call: OmniboxPopupTabSelectionListener::OnTabStripModelChanged calls host CloseUI on initial active-tab selection. The original CloseUI immediately returns when not shown, but585 placed the sticky invocation marker before that return.

Move only that marker after the original guard. No original behavior, UI, profile transaction, pending callback or context admission guard changes. ShowUI and every genuine content action remain sticky. Active source WebContents and pending clear callbacks remain rejection conditions. This is a source-proven correction; runtime profile acceptance remains required and is not inferred.
