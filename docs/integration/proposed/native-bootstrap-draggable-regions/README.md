# Original bootstrap popup draggable-region lifecycle

Proposed source only. No shared native writes, build, browser/helper launch, auth call, profile read, signing, OS grant or runtime acceptance occurred. This is a normal-onboarding native interaction port, not a repair or bypass of the genuine unavailable installation authority.

The v394 normal-profile account error has the same already-established chain as `native-helper-availability-v257`: the supplied Agent's profile context is immediate, but its real `accounts.ensureProfileAccount` call requires actual signed daemon authorization. Current native context matches supplied4274bb4's UUID/path/index and optional bound IDs. There is no source justification for inventing `bindingVersion`, an anonymous account, local completion, unlocked state, or successful token. The existing refusal stays intact.

## Positive missing behavior

The original popup markers `aside-account-password-popup` and `aside-extension-popup` participate in a complete renderer/native input chain which the current stock155 PWA-only path omits:

* Original Browser insertion3355fd8 (actual `browser.cc` assertion/path retained in its decompile) compares the real BrowserInitState app name and sets WebContents' renderer draggable-region support true at3356354..639c. Original detach33555b8 disables that same producer at335567c..56b0 before the genuine detach/delegate cleanup. The port uses those same insertion/detach phases, preserving the real model/transaction owners.
* Original BrowserView45b3000 checks the same markers, rejects updates from any WebContents except the actual active tab, then applies each rectangle in source order using union for draggable and difference for exclusions. It records both that real source WebContents and the resulting SkRegion. Current155's AppBrowserController has the same rectangle operation but runs only for PWA controllers/display modes, which the actual bootstrap popup is not.
* Original45b3380 rejects absent/empty state and a different active WebContents. It converts the point from BrowserView into the actual current contents view, checks that view's local bounds, and queries the stored region. Its actual caller45b6900/45b6cac returns the genuine owned-widget hit result when a region matches. The port wires this native child-event routing with the existing `WidgetOwnedByAnchorContainsPoint`, preserving actual permission/alert/find widgets rather than stealing their input.

The two fixed internal app identities change only to their Aux spellings. This grants no account/private API/auth permission. It does not apply to arbitrary normal tabs or PWAs. PWA forwarding remains untouched. The port retains region provenance with a genuine WebContents WeakPtr and discards the detached page's state at the actual removal phase; this is a155 ownership adaptation of the original active-pointer guard, preventing a freed/reused pointer from restoring authority over an unrelated page. No primary navigation completion or other fabricated event supplies a region.

## Integration and limits

Five existing files: `Browser.cc`, `BrowserWebContentsDelegate.{h,cc}`, and `BrowserView.{h,cc}`. The patch is enabled only for Aux Mac. Root reserved these files for this proposal; the baselines are the current read-only native outputs while v397 is being packaged. No Body/Region changes, new source files or registration are needed. BrowserWebContentsDelegate already includes BrowserView; BrowserView already publicly depends on the Blink and Skia interfaces used here. Root owns any actual GN dependency/compiler adjustment.

The supplied numeric NonClientHitTest/native frame-style policy is **not** guessed or replaced with an invented HTCAPTION result. This proposal ports the positively recovered producer, region state, and exact owned-widget child-event route. Other original marker consumers (native window style/titlebar/layout/session policy) need separate source-backed ports and real observation; this patch alone is not a claim of complete popup chrome or working onboarding/authentication.

`verify.py --native-root <Chromium src>` verifies the pinned original byte ranges, retained assembly, marker literals, reference sources, exact five-file baseline/output hashes, and patch replay in a disposable directory. Native compilation and actual popup drag/selection/permission-widget behavior remain integrator work after the current build/package boundary.
