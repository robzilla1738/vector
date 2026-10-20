# Profile gate construction re-entry

The v498 signed disposable normal-browser preview crashed with a stack overflow when the existing automatic-gate suppression preference was enabled. LLDB shows ProfileGate construction calling Refresh → DidRead(true) → BrowserView::Show → CanShowBrowser → another ProfileGate construction before the first unique_ptr has been assigned to the registry.

Defer the initial Refresh to the UI task runner using the existing weak pointer. The gate is registered before its first show callback. Account, Vault and onboarding state are unchanged. This also fixes the same constructor path for an already-completed real account.

The owner requested seeing the actual browser without logging in. Only the existing disposable profile uses the original automatic gate suppression preference for this preview. No account completion is fabricated.

Canonical composition: `out/native-reuse-composition-v499`, built successfully through `scripts/build-provided-native.py` with the generated-key probe. Receipt: `docs/acceptance/native-full-build-v499.json`. The actual native rebuild completed in 6m08.26s (7 steps). Browser UI verification remains pending.
