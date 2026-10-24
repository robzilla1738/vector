# Profile-owned Meta context destruction callback — a2

Narrow native-only correction layered after immutable `meta-connection-lifetime-a1`. Its daemon transformer, 14 source anchors, PDL response and native memory qualification remain unchanged.

The actual selected GN owner of `profile_impl.cc` is `//chrome/browser/profiles:misc`; it has no direct DevTools dependency. DevTools already consumes the public Profile layer. Instead of adding a reverse dependency or widening GN, this correction removes the new DevTools include/call from ProfileImpl. Public Profile supplies default-refusing observer/cancel methods; the real parent ProfileImpl owns the exact child callback in a separate map. DevTools subscribes from the existing higher layer.

Registration checks that the child is the exact existing unique_ptr entry, is a DevTools OTR profile, has no existing observer and has a real callback. It retains without invoking synchronously. Only after registration succeeds does DevTools publish its pending response and initiate the original disposal. Unsupported registration sends failure before disposal or pending-map mutation.

The real parent moves the registered callback out, takes the same native storage qualification, erases the child unique_ptr and invokes the callback only after that erase/destructor returns. No `OnProfileWillBeDestroyed`, request acceptance, callback destruction or parent teardown is promoted to completion. Losing the parent callback leaves the independently held DevTools response pending.

If normal disposal refuses, the higher layer unregisters through the captured weak original/child identities before removing its pending response and delivering failure. A vanished child is never reconstructed from a path or ID. Such a failure remains unknown in the daemon; successful disposal request still waits for actual destruction. No browser-wide shutdown, other-window behavior, GN registration, runtime or signature changes.

`native-replacements.json` contains six exact before/after files and twelve count-one changes. Four before files are a1 proposed outputs, while Profile public/header implementations are untouched selected native inputs. `check.py` verifies the pinned immutable replay, exact registration/disposal/callback source ordering and unchanged a1 daemon dependencies. GN inputs are pinned in `manifest.json`. This is source evidence, not compilation or runtime acceptance; root owns native projection/build.
