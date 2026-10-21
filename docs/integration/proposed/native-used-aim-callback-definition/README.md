# Out-of-line retirement callback

The590 build rejected a non-empty inline virtual override under Chromium style checks. Move the existing always-false callback body from the header into its implementation file. Two uniquely matched edits; no behavior or UI change. Full compilation remains required.
