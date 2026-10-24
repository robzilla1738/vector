# Profile routing completion slice

Two current native sources receive nine counted edits, with no UI/style changes.

- Automatic routing now treats fragment and hash-router authentication parameters consistently with query parameters. A `code`/`state` callback stays with its original profile, alongside the existing token/verifier protections. Only parameter names are inspected; values are neither logged nor decoded.
- A route rechecks its actual source/target/window/epoch after native navigation, including locating the resulting view in the retained window's live tab model before dereferencing it. Native navigation can synchronously reenter profile/window observers. A changed binding returns a handled error; it never retries the already-issued navigation or falls through into another profile.
- If the UI task runner definitively rejects the next external-link batch continuation, the unissued remainder is refused and the existing settlement callback runs. A successful submission retains its existing lifetime; no timeout or missing callback is called completion. The exact current TaskRunner contract states that false means the task definitely will not run; its file hash is pinned in `source-plan.json`.

Root will compile these two owners with the parallel organization/navigation/productivity batch. This proposal has not been compiled or executed yet. Actual named-profile routing, external-open behavior and changed-profile/callback journeys remain unaccepted. The native checkout, accepted app/UI and current inactive package remain unchanged. No lifecycle, signing/release, provider request, owner state or permission was used.
