# OPS prepared implementation

Source is `services/aux-cloud/scripts/{backup-runner-core,cloud-backup-runner}.mjs` with disabled configuration and three systemd timers in `services/aux-cloud/ops/backup-runner/`. Existing authenticated backup core gains a bounded signed-status reader; old backup/R2/restore receipts are unchanged. Root can integrate without root manifest/lockfile changes.

Implemented locally:

- Persistent exact-source capture intent, separate private roots/one filesystem, disk and retained-job limits, job/status authentication and a shared process-independent lock.
- Frozen-ciphertext delivery and explicit operator resume, never automatic recapture. Unknown mutation retains intent; next scheduled run refuses. Expiry resume requires the exact frozen job set, deletes marker-first remote bytes before local ciphertext and skips already expired metadata.
- Bounded payload-free HTTPS monitor pings; no redirects or secret URL logging. Independent capture/expiry/credential checks with success only after actual operation verification.
- Daily credential warning seven days before the reviewed November22 deadline; no renewal/rotation authority or automated key creation.
- Unprivileged, private, bounded one-shot units; no automatic restart, no core dumps, fixed startup timeout and control-group termination. Units/config are not installed or enabled.

Focused results: CORS OPTIONS fixture passed; service TypeScript typecheck passed; two runner fixtures passed using real local encrypted/HMAC jobs and in-memory R2. Capture interruption did not recapture; unknown remote delivery required exact-job resume; unknown marker deletion retained intent and blocked scheduled retries, and explicit expiry resume removed the exact remaining remote set before local copies. Invalid monitor host made zero calls, failures sent no body, configuration defaults remain disabled. Syntax checks passed. Initial fixture-only failures were canonical macOS `/var` path normalization and using `bytes` instead of the existing bundle `source` stream contract; corrected fixtures use realpath/Readable. No production resources, credentials, monitor pings or hosted restore were exercised.

No readiness claim: Linux unit validation, actual server provisioning/SSH firewall, approved production credential transfer, actual scheduled output, external failure and missed-heartbeat alert delivery, independently held key retrieval and isolated scheduled-output recovery remain external acceptance. The existing actual live R2 and current-schema hosted restore evidence remains valid for its historical scope; this local wrapper fixture does not replace it or establish RPO/RTO.

Concrete next owner/operator actions:

1. Approve the exact dedicated runner/admin-key/IP scope and intended provider accounts under the existing resource review.
2. Approve exact production source connections/credential transfer to that server, not broad vault access. Verify the existing R2 key's actual expiry (reviewed deadline November22), and plan its renewal before November15.
3. Configure three independent monitor checks and confirm recipient; privately store ping URLs. Owner retrieves the recovery key independently through1Password and keeps the emergency copy out of the server/R2 job trees.
4. Install exact pinned source/tool versions, run Linux unit verification, then approve activation of disabled config/timers and perform the bounded actual scheduled-output/alerts/recovery acceptance.

Marketing legal/docs/community hosting is root-owned and remains separate; no policy content was fabricated or published. Payments, Stripe and Aux-funded speech/inference remain deferred, not prerequisites added by this lane.
