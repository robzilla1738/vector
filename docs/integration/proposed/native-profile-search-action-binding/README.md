# Search-page extension action binding

Source-only followup against actual native257. Apply `native.patch` using the pinned manifest after the live full build finishes. No shared native files were modified.

The supplied `tabsearch-3k_2hgil.js` extension-result action calls `chrome.management.launchExtension`. Its original native delegate at40c9570 reads search WebContents userdata keyd6e3e58, selects its alive weak Browser, validates the action, closes the positive search sender via WebContents::Close, then activates that Browser and executes the action. The only direct caller407a608 passes the target extension, sender contents and BrowserContext. Complete resolver and close bodies, a bounded caller excerpt and exact artifact hashes are included.

Current generic tab association cannot identify a native search WebContents, so it can select another same-profile last-active window. This patch consults the existing positive search binding before that fallback and restores the source close-before-action effect. After Close, the actual weak Browser and action are reacquired rather than retaining views across a callback. Private component entitlement, enabled-extension lookup, BrowserContext, incognito eligibility and enabled-action checks remain intact. Unknown/dead search contents retain the existing tab/profile fallback. Other native browser resolvers are unchanged.

## Required integrator GN registration

Do not add a dependency from extensions to all of `//chrome/browser/ui:ui` (would introduce a cycle). Expose the existing public declaration through a narrow header-only target under `enable_aux_browser && is_mac` in `chrome/browser/ui/BUILD.gn`:

```gn
source_set("aux_profile_search_headers") {
  public = [ "views/frame/aux_tab_search_bubble.h" ]
  public_deps = [ "//base" ]
}
```

Import `//chrome/browser/buildflags.gni` into `chrome/browser/extensions/BUILD.gn` (currently absent), then add inside its existing `source_set("extensions")`:

```gn
if (enable_aux_browser && is_mac) {
  deps += [ "//chrome/browser/ui:aux_profile_search_headers" ]
}
```

That target already publicly depends on `//chrome/browser:buildflags`. The header forward-declares BrowserWindowInterface/WebContents/View/Widget and includes only base callbacks. The implementation remains in the existing Mac Aux UI sources; no new source registration or runtime API is needed.

## Verification and limits

`python3 verify.py` independently replays the patch in a disposable Git directory, checks both file hashes, checks that the private API entitlement/caller source matches its pin and verifies the lookup/close ordering and callback revalidation. These are source checks. Parent native compilation/link and actual disposable multi-window search-action behavior remain required; no browser, notification, network, credential or owner-profile operation was performed here.
