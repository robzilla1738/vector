# local-daemon-a1

Daemon JS edits from the 2026-10-27 excellence audit, applied with `scripts/candidate/prepare_edits.py` to the sealed `aux-native-entry.mjs` and `index.mjs` (`edits.json`).

- **D1, local-only:** the API, share and password-manager issuer origins use the pipeline's `127.0.0.1:9/aux-unavailable` placeholders (`vendor/provided/cloud-service-policy.mjs`), CORS admits no remote origin, and the share URL no longer reads `AUX_SHARED_SESSION_WEB_URL`.
- **D1/D3:** history sync and cookie backup are not started.
- Trusted UI origins are the Agent extension and the daemon's own origin on its port, not every local web page.
- Shutdown has one 15 s budget, then exits 75, instead of retaining a 503-only daemon.
- Provider keys inherited from a launching shell (`OPENAI_API_KEY` and similar) are dropped at startup.
- The PostHog project key is replaced (analytics were already disabled at every call site).
- `loadBinding` returns null on a load failure, as the supplied contract expects.
- Feedback uploads use the `feedback` purpose; without a cloud account the error points to hello@getaux.co.
- `index.mjs` keeps only its refusal line: the daemon starts from `aux-native-entry.mjs`.
