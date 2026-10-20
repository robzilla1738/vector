# Complete source snapshot and history destination integration

The supplied current-profile owner reads its source batch before destination writes. V427 replays that proposal’s unchanged four-file patch after the registry/profile changes; v428 replays the unchanged two-file history-owner patch after it. Original source evidence and parent replays are independently verified. These manifests pin complete composed input/output hashes without changing either behavioral patch.

A failed source snapshot admits no destination writes. Successful Chromium history retains original URL summary counts, times and hidden flags through the same actual Chromium history primitive. Native compilation is separate from live import acceptance. No source profile, Keychain or OS operation runs during preparation.
