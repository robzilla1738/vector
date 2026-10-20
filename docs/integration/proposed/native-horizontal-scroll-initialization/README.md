# Restore the real Chromium155 tab-container initialization order

Actual disposable v201 startup crashes in TabStrip::SetAvailableWidthCallback, called from the horizontal scroll wrapper constructor before TabStrip::Initialize creates its real TabContainer. The source-bound symbolicated stack and own ChromeMain return instruction identify that null dereference.

Install the unchanged shrink/scroll callback immediately after the region creates the actual TabContainer, before controller InitFromModel adds tabs. Every genuine reset/reinitialize passes through the same existing method and reinstalls the callback on the new container. No early fake initialization, empty container or silent null-only callback suppression is introduced. Scrolling and shrink policy are unchanged.

Compilation and a repeated disposable browser launch must verify the fix; the first failed run remains unaccepted. No owner profile, signing or OS-grant action.
