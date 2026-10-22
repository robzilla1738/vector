# Owner setup dependencies and remaining acceptance

Static supplied1852 source evidence; endpoint names below are contracts, not
instructions or authorization to contact Aside's service. Aux needs its own
configured compatible service where hosted behavior is desired. Branding cannot
create those servers or substitute an AI provider key for account authorization.

| Capability | Exact inspected routes / authentication | Required setup and acceptance |
| --- | --- | --- |
| Local browsing, tabs, local profiles, supplied settings | Chromium/native extension APIs; local Aux daemon installation authentication where Agent features need it | No hosted product sign-in is inherently required. Continue testing normal disposable profiles, account ownership and restart behavior. |
| Local BYOK AI | Original local account/provider credential and session APIs; isolated installation auth for local daemon; actual selected provider's authentication | Configure a real provider through existing secure API. Local mode does not require an Aside cloud account. Provider inference itself can be remote/paid; it is not an offline claim. Retain session/tool/approval ownership. |
| Email sign-in | Hosted POST /auth/email/start; POST /auth/email/verify-code; native sign-in attempt/account ownership and registered-device input | Compatible Aux account backend and email-code delivery; actual user verification. No borrowed owner account/session. |
| Google sign-in | Hosted POST /auth/oauth/google/start, original callback handoff and token exchange flows (/auth/callback/exchange, /auth/token/exchange); attempt-bound response | Compatible OAuth client, registered callback origin and backend handoff. Local app branding alone cannot configure OAuth or hosted callback delivery. |
| Session maintenance | POST /auth/token/refresh with refreshToken and registered-device data; /auth/me; device list/sign-out APIs | Actual issued account session. The original authenticated fetch wrapper gets the account's access token and refreshes rejected/expired tokens; absence yields no invented token. |
| Encrypted browser sync key | Authenticated /sync/key/status, POST /sync/key/enroll, /sync/key/resolve; local localhost-only /auth/sync-passphrase bridge | Signed-in account, actual secure key material and compatible service. Preserve crypto labels/wrapped formats. Key enrollment alone is not acceptance of complete Chromium cross-device sync. Full transport/server coverage remains to be verified separately. |
| History sync | /sync/history/sources/{sourceId}; POST /sync/history/uploads; PUT /sync/history/uploads/{uploadId}/batches; POST .../commit | Genuine account-authenticated service, revision/checkpoint protocol and source ownership. Requires deliberate cross-device acceptance; never upload owner history as an automatic check. |
| Shared conversation links | Authenticated POST /shared-sessions; GET/DELETE /shared-sessions/source/{sourceSessionId} | Compatible publishing/storage/public-view backend and account authorization. Local session creation does not provide public sharing hosting. A share action sends content externally and needs user intent. |
| Voice dictation | Browser getUserMedia/MediaRecorder → account-qualified local POST /stt/transcribe → authenticated hosted POST /stt/transcribe | Microphone/device permission and a reachable speech service accepting that account authorization. A local BYOK model key does not fulfill the inspected hosted STT contract. No silent alternate-provider upload. |
| Context observer / specific system integrations | Existing contextAwareness status/permissions/requestPermissions and helper manager; separate Contacts/Messages/FDA routes | Exact copied helper and applicable approved OS grants, plus actual live health/isolated observation. Public browser REPL is separate and does not imply generic OS control. See prior desktop-boundary audit. |
| Lasso | Original content-script activation and iframe interaction; runtime port → authenticated local POST /lasso/transform | Verify selection/capture locally before any authorized transform. New ownership fix prevents old request completion from displacing the current request. Region capture and content transformation are distinct acceptance steps. |
| Notifications | Profile-owned native inbox; original extension onClicked → current-profile tabs/windows API | Permission/delivery setup, exact profile routing and late-click behavior need real acceptance. A source trace does not prove OS delivery or stale-window recovery. |

The readiness ledger should keep these separate: local implementation built;
actual local interaction observed; external account/service configured; end-to-end
service accepted. Do not mark all unfinished items as UI work, or mark hosted
capabilities complete merely because their supplied controls render correctly.

Source basis: supplied daemon-original.mjs SHA-256
5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5;
frozen background.js exact hash in patch.json; voice/URL source hashes in the
previous native-mini-popup-work-ownership-v611/local-boundary-sources.json.
No backend was contacted, no credentials read, and no OS grants changed.
