# Actual profile preview tab data

This ports the supplied preview producer `455ca00` and capture helper `45589b0`, and restores its same-window per-path metadata retention. It does not ask a model for target state, read arbitrary browser storage, load a profile merely for a preview, or create replacement tabs.

The source's `2104368` factory is **BrowserManagerService**, proven by its literal `dec5965`, and its visitor `455e4ac` iterates real browser windows. This corrects an earlier tentative “session service” description. Chromium155's `ProfileBrowserCollection::GetForProfile` returns the actual BrowserManagerService, so the port uses that same real collection and creation order.

Exact producer order:

1. Matching source profile: actual current TabStripModel.
2. Already-loaded target original profile: other real NORMAL windows, excluding this sender, a genuinely closing UnloadController, and hidden profile-switch caches. Visit until real tabs are found.
3. This window's registered hidden target workspace: actual model, positive cache flag, normal type, distinct owner.
4. This same window's saved per-path preview metadata, otherwise the original empty result.

Capture retains every nonnull real tab's WebContents title, original tab index compared against nonnegative active index, and actual pin state. It preserves empty titles and does not substitute URLs or “New Tab” in the producer. The original UI's New Tab placeholder remains confined to the page renderer.

Original Browser `+0xa8` is a per-path metadata map. `455b3d4` captures the real source model before migration and `455b61c` captures the real cache model for that window's own map. The port retains these maps in the corresponding same-window BrowserInitState and writes them while both actual models still exist before ownership moves. A rejected transfer does not fake completion or discard a metadata record. No process-global profile map is introduced.

The original also traverses its transient detached-collection map before metadata. Current155 transfer retains those actual collections in the owned hidden cache instead of that additional detached map; the live workspace lookup is used for that real data. Exact fallback equivalence if preview is queried synchronously during transfer is **not claimed**. The original gesture/commit admission must prohibit such queries; owner wiring remains separate. No fabricated successful data or silent profile load is used to fill this gap.

## Integration order

Apply after `5e548e42d` renderer. Existing file baselines are actual170 BrowserInitState/core and that renderer's header. The page's public `ProfilePreviewTab` becomes an alias to the plain metadata type, keeping the caller API and preventing BrowserInitState from depending on Views.

Add `chrome/browser/ui/aux_profile_preview_data.cc/.h` to the enabled Mac Aux implementation sources. Header is plain data; implementation depends on existing browser/profile/TabStripModel/UnloadController/ProfileBrowserCollection/workspaces. Root owns GN and focused compile. The core/InitState overlap is explicit in the manifest; do not apply against a drifting source without a counted rebase.

Static source/literal pins and isolated exact input/output patch replay passed. No actual target runtime, owner profile, Keychain, network, shared native edit, or build. Metadata is not yet connected to the real region page owner, so this is not UI parity acceptance.
