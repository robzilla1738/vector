# Actual committed Agent document for toolbar tint

WebContentsImpl::GetLastCommittedURL returns NavigationEntry::GetVirtualURL. ExtensionUrlOverrides rewrites chrome://newtab to the actual Agent newtab.html document while preserving the visible alias. Consequently the previous extension-host condition did not activate for ordinary new tabs.

Use the primary RenderFrameHost committed URL, with a null guard, to identify the actual supplied document. This also recognizes directly navigated supplied Agent pages, without interpreting arbitrary visible aliases as ownership. No tint or other behavior changes.

Exact v526 preimage/output hashes and patch application checked. No shared native modification/build. Divider audit: both browser top-container and multi-contents separators use ContentsSeparator, which paints kColorToolbarContentAreaSeparator; the integrated palette sets this to transparent SkColor 0u. Native bounds may still reserve its one pixel, but it is not an opaque drawn divider. Actual combined visual inspection remains necessary.
