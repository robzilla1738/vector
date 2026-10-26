# Close the shutdown ACK connection

The actual A17 Quit completed the full JavaScript drain and physical normal exit, but HTTP closure waited until browser network teardown. The shutdown request's own active keep-alive connection was still in flight when the existing server called `closeIdleConnections`.

The existing authenticated `POST /shutdown` handler now sets `Connection: close` after its original `requestShutdown` call and before returning the unchanged JSON ACK. The shipped Hono context's `header` method sets the same prepared response headers consumed by `json`; the existing Node HTTP server can finish the response and close that one connection. Authentication, origin checks, status, body and trigger order remain unchanged. The ACK remains a start acknowledgment, not a physical-drain receipt.

No timeout, server-wide connection termination, guard, resource wait, UI or native change is included. A50 diagnostic labels remain intact for the final affected HTTP close observation.

`prepare.py` pins the exact actual A50 leaves and applies one single-count anchor per leaf. Forward and exact reverse replay and both `node --check` commands passed. `source-plan.json` identifies the paired temporary outputs and hashes. Actual HTTP settlement before the native deadline and normal Quit remain parent-owned verification; no product execution, signing or build occurred here.
