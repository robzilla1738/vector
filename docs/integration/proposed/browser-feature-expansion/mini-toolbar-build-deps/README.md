# Full-URL mini-toolbar build dependencies

The new public header owns PrefChangeRegistrar, and the implementation directly includes Profile and omnibox prefs. Declare their actual GN owners on the two existing mini-toolbar targets. No new target, startup, ABI or visual behavior. The actual native projection/build remains the integrator’s serialized step; this file is a pinned source overlay, not compile evidence.
