# Preserve derived-owner weak factory destruction order

Actual v158 compilation rejected the derived-owner WeakPtrFactory before the existing base-interface WeakPtrFactory. Place the derived-owner factory last, preserving both identities and all callbacks while invalidating derived mutation scopes first during destruction. The single header caused two failed objects (nudge implementation and split controller); it is not two distinct source errors. Actual compilation of 22 other selected objects passed.
