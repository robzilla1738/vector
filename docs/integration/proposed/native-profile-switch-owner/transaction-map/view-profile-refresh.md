# Original BrowserView profile refresh: bounded recovery

The supplied `04559f80` invokes `045b7db8` after actual target tab insertion. Its
bounded raw body is pinned in `original-view-profile-refresh.txt`. This is a
real view/service refresh and is distinct from BrowserWindowFeatures refresh
`04164b0c`. It does not justify calling whole BrowserView::Init or replacing the
window, nor does it prove that only eligibility/preferences change.

| Original slot/effect | Static proof | Port implication |
| --- | --- | --- |
| +618 is destroyed with destructor459fdd4, allocation size0xf8 | Destructor's459feb8 loads source literal0xdec9778 `chrome/browser/ui/views/frame/aside_tab_search_bubble.cc` | Retire supplied custom tab search UI; this is not an omnibox pointer. |
| +620 destroyed, then normal windows allocate0x150 with45a7e00(BrowserView) | Constructor stores BrowserView+40, installs vtable0xe5052d0, observes BrowserView→Browser+538→TabStripModel+88 at45a7f4c–68; class method45a8860 loads literal0xdec9afc `aside_tab_switcher.cc` | Actual custom tab-switcher controller must track the real target model; never substitute a fabricated tab list or visible omnibox. Exact full C++ class spelling is not recovered from RTTI. |
| +600/+608 detached/visible bookmark ownership cleared | 45b7e50–ee0 clears both slots, removes existing view link from owner+3f0/+e8, destroys detached unique view | Existing stable BookmarkBarView rebind proposal is an explicit155 adaptation; original destroys/recreates this owner instead. |
| +648 child collection +3a8/+3b0 iterated through45bf218 | 45b7ee4–f04 | Must recover real child refresh effects; no generic recursive Init is warranted. |
| 45ae2f0 called with actual active WebContents | 45b7f08–f20; helper accesses BookmarkBarController-like user-data and visible bookmark slots608/600 | It refreshes actual active content/bookmark visibility. Current counterpart must use actual active tab after insertion, not stale source contents. Exact155 method mapping remains pending. |
| +5b0 owner41f4b88 then15dcefc(activeWebContents) | 45b7f24–f48 | Separate real view-owner refresh remains important. Class name is not proven here; neither generic ToolbarView replacement nor declaring toolbar complete is justified. |
| +598 metadata branch chooses old/new horizontal strip | Metadata2c0f298 literal0xdeca8cd `HorizontalTabStripRegionViewOld`; a935e58 thunk→c779834→c77af60 literal0xdeca8ed `HorizontalTabStripRegionViewNew`; both source0xdeca975 `horizontal_tab_strip_region_view.h` | This branch is **not** ToolbarView or WebAppFrameToolbarView. Both actual horizontal variants must refresh their profile-bound preference observers. |
| old45d9b10/new45dec88 refresh profile+registrar | old profile450/registrar4c8/prefs4f0; new profile520/registrar580/prefs5a8; both use literal0xcf01e2d `horizontal_tab_strip.shrink_to_fit_enabled` and command-line override0xcef4d0c `aside.browser_preferences.horizontal_tab_strip_shrink_to_fit_enabled` | Preserve supplied key bytes and real target PrefService. Parent owns actual horizontal strip implementation/integration. |
| +658→4659f58, followed layout/paint | 45b7fec–801c | Exact vertical/organizer owner method must be recovered separately; this is not an arbitrary activation hook. |

Evidence is static bounded disassembly and byte-addressed literal reads from the
pinned supplied thin binary. No target execution, profile inspection, native
build or shared source edit occurred. No new implementation patch is included in
this recovery commit because the original custom owners are distinct from the
current155 classes and parent is composing their actual transaction. The concrete
manager/pinning rebind code in companion commits remains independently reviewable.
