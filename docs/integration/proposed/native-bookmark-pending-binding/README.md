# Original pending bookmark navigation binding

Port original4646654 into the actual handle cache owner. Only an actual queued navigation matched by the genuine BookmarksView can create this association. The exact Agent-group-only guard precedes queue consumption; this branch does not use the different retained-group userdata exclusion. It uses the real visible navigation URL, falling back to last committed only when invalid. An empty queued host falls back to the actual navigation host; an empty final host fails after source queue consumption.

A successful binding overwrites the actual f98 cache, stores the original WebContents userdata and persists through the existing real SessionService writer, then erases the handle from the caller's actual fb0 set. No title/URL inference creates an association without a queued original action. The original typed handle/model replaces raw tab fields.

Root owns registration/application/compile. Genuine coordinator callers and the fb0 state producer remain required before mounting; no empty substitute set or successful callback is supplied here. Original decompiler and assembly are preserved beside the patch. No browser/model execution, owner profile, Keychain, signing or release action.
