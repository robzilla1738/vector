# Supplied native tab-search owner

This replaces the independent Checking/Unlock wrapper with the actual supplied native search owner. Two files are pinned to frozen actual241 (unchanged through249), with source-only outputs and a cumulative patch. No shared native edits, native build, browser launch, network, credentials/OS grants or signing occurred.

Original BrowserView45b63c0 calls459fbcc, which combines all five ExtensionRegistry sets before testing the Agent identity. Without Agent it calls the actual stock TabSearchBubbleHost::ShowTabSearchBubble(true). With Agent it closes stock search and toggles the per-window coordinator459fce0 at BrowserView+618. Existing enabled-only ExtensionPopup::ShowPopup is a different implementation and must be replaced by the root-owned binding below.

The port retains an actual search Widget and WebContents per actual browser Widget, with a weak BrowserWindowInterface and positive weak WebContents→window user data. It never infers an owning window from a matching profile. A changed actual browser Profile retires the old native Widget/WebContents before reuse. The Agent route is the exact original five-fragment URL descriptor, with only the extension ID mapped to Aux: `chrome-extension://<Aux Agent ID>/tabsearch.html`. No native Checking/Unlock screen or alternative search UI is introduced. Existing private API/auth boundaries remain authoritative.

Original45a0198 shows620×340 centered over the actual browser Widget. Opening interpolates real native-window bounds from centered96% to full size and opacity0.01→1 over120ms with FAST_OUT_SLOW_IN. Original45a1474 closes from actual current bounds/opacity to centered96%/0 over90ms with EASE_IN, then hides the genuine Widget and restores opacity. Explicit reduced-motion behavior uses the actual gfx::Animation platform guidance. NativeWidgetMac already recognizes the exact internal name `DesktopMediaPickerVisualEffect`; keeping that nonbranding implementation literal activates its real native visual effect. The same actual WebView is transparent via WebContentsSetBackgroundColor and remains the renderer of the supplied page.

Focus and visibility use the actual WebContents. Escape/CmdShiftA accelerators and the exact source application key monitor are installed while visible. The renderer's PreHandle shortcut path still returns NOT_HANDLED, as original45a2284. Active-contents changes and real tab insertions hide search, matching45a2014. Toggle, WebContents close and the explicit reset shortcut request a reload of the same original route after actual hide; ordinary Hide preserves the existing page. Browser/child native Widget retirement removes the real monitor, model observation and animation, rather than returning a fabricated success.

## Exact integration hooks (root owns BrowserView edits)

Header/region callback already calls:

```cpp
void ToggleAuxProfileSearch(BrowserWindowInterface*, views::View* anchor);
```

Replace BrowserView::CreateTabSearchBubble's enabled-only hardcoded-ID ExtensionPopup branch with:

```cpp
ToggleAuxProfileSearch(browser(), GetLocationBarView());
```

Replace BrowserView::CloseTabSearchBubble with:

```cpp
CloseAuxProfileSearch(browser());
```

Include `chrome/browser/ui/views/frame/aux_tab_search_bubble.h`. Close actual search before the same-window profile transaction; this is actual dismissal, not completion of that transaction. The hidden old-profile WebContents is retired before any new-profile reuse.

The original WebContents association is available to genuine native consumers as:

```cpp
BrowserWindowInterface* GetAuxProfileSearchBrowser(content::WebContents*);
```

It returns null for unknown, destroyed or changed-profile senders; consumers must not replace that with profile-only window inference. The historical ShowAuxTabSearchBubble API opens this same actual owner and runs on_closed only at actual hide.

No new sources/GN registrations are introduced. Root should review any target dependencies surfaced by actual compilation (existing WebView/native Widget/TabStripModel facilities).

## Evidence and acceptance

Original whole-artifact hash, complete bounded LLVM guard/controller/toggle/views bodies, URL descriptor fragments and the actual upstream Mac visual-effect source are pinned in source-evidence.json. Bounded REA guard/hide and show snapshots are retained at the listed paths; raw external procedure discovery limitations are explicit and full LLVM remains authoritative. The5-fragment URL, animation constants/tweens, actual model event discriminator and metadata names are preserved as evidence rather than inferred from screenshots.

`python3 docs/integration/proposed/native-profile-search-owner/verify.py` verifies those pins and independently applies/replays the two-file patch in a disposable directory. No native compile or UI/runtime acceptance is claimed. Native material/OS focus delivery, hosted-extension private API operation, repeated open/close, actual tab selection and profile-switch dismissal still need observation in the local disposable candidate. Stock fallback and the supplied renderer remain real implementations; this verification does not fabricate their results.
