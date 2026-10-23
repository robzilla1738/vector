# Aux recovery development deployment

The existing personal Aux project received a Preview deployment, not Production. Identity and exact project were checked; CLI upload review excluded credentials and local evidence. Additive migration012 was applied only to the configured development Neon host after authenticating all11 existing migration hashes. All12 hashes and both new tables verified afterward. No preexisting account or Sync key was edited by that migration.

- URL: https://dev-cloud.getaux.co
- Target: Preview (`dpl_D9jPRFDv9msez8mAQAsy2jEpvixE`)
- Status: READY; actual development environment guard, build and TypeScript passed.
- Source code commit:6344ec464; subsequent local changes only record execution evidence.

The development hostname was explicitly assigned to this Preview after readiness. Production domains/resources, marketing and desktop were untouched. No signing, provisioning, owner profile/credential access, AI spend or email occurred.

The real disposable hosted recovery check passed against this deployment: enrollment and exact retry, recovery-material decryption, missing-key guards, and signed same-CSK recovery with exact retry. It used one marked synthetic Aux principal/session and P256 key, not a provider sign-in or owner account. Its principal/session/recovery/key records were removed. A fixture cleanup delimiter mistake left anonymous rate-limit cleanup unverified; those rows may remain until normal expiry/maintenance. No guessed rows were deleted. The future fixture now persists its nonsecret cleanup scope and uses the actual NUL-delimited hash; the remote flow was not repeated merely to conceal this gap. See `services/aux-cloud/evidence/sync-recovery-deployed.json`.

Desktop use remains blocked by confirmed12-word enrollment wiring, trusted native startup and actual runtime acceptance. Atomic native CSK publication is now implemented and compiled, rather than merely proposed, but has not run against protected storage. The deployed API and schema are not proof that the app can recover. Production activation, real user/provider sign-in/PQ coverage, backup operations and release remain separate requirements.

## Recovery setup metadata successor

Preview `dpl_A5688gw74rBAKPU39GJjQpC4P2CJ` is READY and now owns the same development hostname. Build guard and TypeScript passed. The status response distinguishes the real current-generation recovery backup/revision from server key readiness. Four changed API states passed for one marked synthetic account. Initial cleanup failed because sessions require explicit removal before the user; the retained fixture scope was then removed in the correct transaction order, without repeating the API checks. The corrected fixture preserves unresolved scope and supports cleanup-only. See `status-deployment.json`, `status-upload-review.json` and `services/aux-cloud/evidence/sync-recovery-status-deployed.json`.

The upload review initially flagged three local public proof files, but a sequencing mistake still started an unused Preview. It was deleted without changing the development alias. The files contained only store IDs, hashes, timestamps and synthetic markers, with no credentials. Root and nested local proof files are now excluded; the corrected113-file upload was reviewed before deployment. Historical receipts remain unchanged. Production and marketing were untouched.
