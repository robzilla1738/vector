# Chromium cleanup return adaptation

The focused466 build compiled the other13 requested objects and regenerated bindings, but rejected the ignored nodiscard ScopedTempDir::Delete result. Explicitly discard that return, preserving the supplied reset/destruction behavior. No cleanup policy or native side effect changes. Generation is unchanged; rerun the focused objects against467 before recording success.
