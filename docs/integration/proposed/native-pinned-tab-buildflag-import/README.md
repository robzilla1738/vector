# Tabs feature flag import

GN generation found enable_aux_browser undefined in the newly shared tabs target. Import its actual declaring buildflags.gni, as the UI target does. No runtime or visual behavior change.
