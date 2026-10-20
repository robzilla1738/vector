# Firefox password result transport

Typed155 transport for the supplied bool/uint32 utility result, positively pinned in native-firefox-password-result-proof. ImporterBridge gains a result notification, ExternalProcessImporterBridge sends the actual pair through ProfileImportObserver, and the real browser client declares its corresponding handler. Names are documented adaptation spellings, not recovered C++ symbols. The existing form transport is unchanged.

Only the external utility bridge is a valid producer path; the generic bridge rejects unexpected calls with NOTREACHED rather than inventing success. No handler implementation, result values, native writes or completion notification is fabricated. The real Mac producer and browser buffering/write-settlement handler must be integrated before this source can compile or be mounted. Root owns resulting Mojo regeneration/GN. No library/profile/credential/runtime operation is performed.
