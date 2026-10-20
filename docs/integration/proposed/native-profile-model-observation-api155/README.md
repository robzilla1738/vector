# Actual Chromium155 model observation and static icon storage

Chromium155 explicitly forbids ScopedObservation for TabStripModel because TabStripModelObserver owns observation and destruction removal. Use AddObserver/StopObservingAll and retain the exact source-model pointer for the original destruction identity check. Retirement still clears the genuine edge request/monitor and releases the model pointer before model memory dies.

The immutable48-entry icon table points only at immortal descriptors defined in this translation unit; annotate those static pointers with the upstream RAW_PTR_EXCLUSION rather than introducing global owning/reference-wrapper state. All48 addresses, labels and vector bytes remain unchanged. This fixes actual compiler diagnostics; native runtime acceptance remains pending.
