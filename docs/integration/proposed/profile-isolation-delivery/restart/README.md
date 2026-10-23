# Retained browser authority cancellation cache cleanup

The browser lifecycle lane still cannot produce a genuine complete writer-drain grant. Therefore admitted roots remain refused on restart; no parent-exit-only, free-lock or late-shutdown event is promoted into a clean certificate. Prepared-only v8 recovery from the previous batch remains unchanged.

This concrete source fix separates retained native ownership from retained response bytes. Previously an authority with unresolved browser custody returned pending on close and stayed alive indefinitely with its most recent cached signature, key or browser receipt. A callback completing after cancellation could likewise store its result even though publication was refused.

`AuxPreparedDaemonAuthority.swift` now wipes an idle request's actual owned cache when closing an authority that retains unresolved browser custody. It does not mutate that cache while an active callback might read it. Instead the actual callback completion fence wipes any late result under the authority lock before returning closed. Native provider/Owner graphs remain retained, admission remains closed, and unknown writer status remains pending. Request identity/high-watermark and closed-state semantics are preserved; no retry/reopen endpoint is added.

The focused fixture compiles the actual authority implementation with explicit synthetic native callbacks and inspects its real private cache in the same compilation unit. It checks idle and racing completion cache wipe alongside admission closure, retained owner custody, failed attempt handling and unchanged never-attempted close. It is not actual protected runtime evidence.

Only one Swift source replaces the preceding completion version. No protocol, policy, UI, signing, app installation, owner-state or cloud changes occur. Complete browser/network/content/descendant writer closure and admitted-session recovery remain implementation work, not merely untested toggles.
