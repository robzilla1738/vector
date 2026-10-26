# Apple entitlement request draft

Prepared October 26, 2026 after the owner chose to keep general Bash, PTY and CLI REPL required. This is a reviewable draft. Nothing has been submitted to Apple, provisioned, signed or activated.

| Field | Proposed value |
| --- | --- |
| Product | Aux, a macOS browser with user-directed AI tasks |
| Website | https://getaux.co |
| Existing developer team | `9F2JXY8TCK`, subject to confirming the same team in Apple's portal |
| Executable receiving entitlement | The embedded Aux Daemon app |
| Existing App ID / signing identifier | `dev.aux.browser.daemon` |
| Requested entitlement | `com.apple.developer.endpoint-security.client` |
| Intended API | `es_new_descendants_client` on macOS 27 or later |
| Contact | Owner's existing Apple Developer account contact; enter directly in the portal |

## Purpose text

Aux is a desktop browser that lets users direct AI tasks in their own browser profiles and local workspaces. Some explicitly requested tasks need a shell process or interactive terminal. We need to retain and enforce the lifetime and file-access policy of those task processes, including recursively created children, through cancellation, account changes and application shutdown.

The existing embedded Aux daemon is the parent of these task processes. It will create a descendant-scoped Endpoint Security client at its fresh native entry before admitting Node workers or task children. Account and session owners retain the original process identities, pipes and recovery records. Failed initialization, an incomplete event fence or a lost observation stream prevents further task admission and preserves unresolved state for review.

We are requesting the entitlement for that existing daemon App ID to use the descendant-only API. Its purpose is enforcing user-requested task boundaries and clean lifecycle settlement. The intended integration runs in the user's application session with the API's native subtree scope.

## Submission boundary

Use Apple's [entitlement request form](https://developer.apple.com/contact/request/system-extension/), reached from its official [System Extensions page](https://developer.apple.com/system-extensions/). The form requires Apple Developer sign-in; its current fields and any terms have not been inspected. Adapt the text to the actual visible fields without inventing company, contact, registration or approval details. Keep the entitlement, Team and App ID scope above unchanged unless the owner explicitly revises it.

The owner's instruction authorizes preparation. A separate explicit instruction is still required to submit this request. Any binding agreement requires the owner's direct review/action. Do not select a new paid plan, provision a profile, change certificates, access signing keys or weaken OS protections as part of preparation.
