# Content blocking

Aux starts with a local built-in set of known tracker and ad hosts. **Settings → Site permissions → Filter lists** lets the user add an HTTPS hosts-format list after reviewing its source URL. A new installation does not fetch a maintained list until the user selects one. Each source can be paused, updated, or removed. Bad downloads keep the last accepted copy.

Downloads use Chromium's network stack with a 12-second timeout, no followed redirects, a 16 MB streaming cap, strict UTF-8, and hosts-line validation. The source URL must use HTTPS without embedded credentials or a local literal host. Source IDs are checked before use as cache filenames. The source sees the browser's network address when it is fetched.

The current desktop request policy applies the built-in set and enabled downloaded hosts to HTTP(S) subresources. A site-specific switch exempts that top-level host and its subdomains. The site controls show an in-memory blocked request count for the selected site; no blocked URL is stored in that count. Private windows keep their own site exceptions and counts, while reading the regular profile's downloaded lists.

`ContentBlockSnapshot`, `ChromiumContentBlockPort`, and `assertContentBlockReceipt` define the narrow native handoff for Chromium subresource filter or declarativeNetRequest. A native implementation must attest the applied generation and digest before reporting its rules active. The browser-only mock reports `preview` and does not claim to block requests.
