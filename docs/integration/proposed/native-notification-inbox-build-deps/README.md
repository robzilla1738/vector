# Supplied inbox build integration

Adds the supplied inbox implementation to its actual notifications implementation owner only when enable_aux_browser is enabled. Its existing public owner exports the buildflags dependency used by the guarded service header. Actual platform/key-provider, crypto, SQLite, extension messaging and PNG dependencies are explicit. Existing sources and dependencies are extended; ordinary Chromium retains the preceding sources.

This is compile integration for the pinned notification pipeline, with no OS permission or Keychain operation.
