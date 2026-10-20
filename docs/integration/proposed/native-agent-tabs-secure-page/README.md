# Original secure page-client capability

One-call fidelity follow-up for the real Chromium155 DevTools WebSocket path. The supplied native agent-group producer tests an actual attached DevTools client's authenticated-endpoint capability; it is not IsTrusted and is not a group-title-only check. This proposal passes the existing reviewed capability into the accepted page-target client, exactly as the current accepted browser-target client already receives it. It does not change HTTP authentication, request filters, allowed origins, approval mode or public/default clients.

## Positive original identification

Actual original RemoteDebugger client vptr `0e0ce070` has GetTypeForMetrics at+70 (`040330d4` returns literal RemoteDebugger), AgentHostClosed at+18 (`033a6ce8` sends Inspector.detached), and capability at+58 (`03faa500`, exactly load byte client+28; return). IsTrusted is a distinct slot+30 pointing to shared true. Original generic constructor `04032ebc` initializes byte28 false. Original OnWebSocketRequest `02f93f68` computes the configured-endpoint capability from its authentication strings/filter and copies the same bit into both real browser client (`02f942e4`) and page client (`02f9460c`). No boolean is accepted from a page/request payload. The constructor/vtable/getter and both writes are independently pinned.

The already integrated155 IsAuthenticatedRemoteDebuggingSession is the bounded adapter for that capability. Its generic default is false; only the real accepted WebSocket client's actual configured-filter bit can be true. Source's additional password/token endpoint representations are not independently reimplemented here; Aux already uses its actual installation-authenticated HTTP filter.

## Usage audit and integration

Current effective native source has one production reader, ChromeDevToolsSession's BrowserHandler construction. Its expression also requires DevToolsAgentHost::kTypeBrowser, so granting the authenticated bit to an actual filtered page connection does not enable Browser.ensureProfile on a page host. The other occurrences are the base declaration/default and HTTP client override. This read-only audit used source, not live clients or browser profiles. Native agent-group support will add a separate reviewed read of this capability.

Only the final page-target constructor call changes. Approval-only HandleDebuggingApproval remains defaultfalse; unfiltered HTTP handlers retain request_filter_authorizes_origins_ false. The underlying ServerWrapper still applies its actual request filter before accepted request delivery; rejected requests never reach this path. No header/body can choose this capability and no IsTrusted result is substituted.

Apply native.patch only against manifest.json's exact baseline. No GN changes. Run verify.py for input/byte-range pins and exact one-call patch replay. No native compilation, WebSocket request, source target execution, browser launch or OS action occurred. Root performs composition and actual verification separately.
