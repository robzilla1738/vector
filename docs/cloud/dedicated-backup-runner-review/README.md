# Aux dedicated backup runner review

Prepared October 23, 2026 at the owner's request. **Review only:** no server, provider account, SSH credential, schedule, monitor or new recurring charge has been created. Existing Aux hosting remains on Vercel/Neon/private Blob. This runner performs encrypted backup operations separately.

## Proposed resources and cost

| Item | Proposed configuration | Incremental cost |
| --- | --- | --- |
| Runner | One DigitalOcean Basic **Regular bundled** Droplet, 1 vCPU, 2 GiB RAM, 50 GiB SSD; Ubuntu 24.04 LTS x86_64; proposed NYC3 region, subject to actual availability | Published $12/month bundled compute price |
| Name/project | `aux-backup-prod-01` in a new Aux-only DigitalOcean project | No separate project fee proposed |
| Remote ciphertext | Existing private Cloudflare `aux-recovery-prod` | Previously reviewed $5/month usage target; not a cap |
| Missed-run monitoring | Healthchecks.io, separate Aux project/checks for capture and expiry, no paid upgrade | Published free allowance of20 checks; verify actual account eligibility |

Initial incremental operating target: **$17/month before taxes and source-provider reads**, with a $20 spend notification target. This is not a guaranteed total bill or enforced spending cap. Do not select Premium, v5 unbundled pricing, automatic snapshots, paid Droplet backups, extra disks, a load balancer or any paid monitor/add-on under this review. Re-review if the exact bundled plan/region is unavailable. A powered-off bundled Droplet still incurs charges; stopping a timer or shutting down is not billing cancellation. Destruction is a separate irreversible action requiring approval and retained job review.

Published prices were checked against [DigitalOcean's official Droplet table](https://www.digitalocean.com/pricing/droplets) and [bundled-plan billing documentation](https://docs.digitalocean.com/products/droplets/details/pricing/). [Healthchecks.io](https://healthchecks.io/) supplies missed-job email monitoring; it is independent of the runner, Vercel, Neon and R2. These choices are an engineering recommendation, not an existing account or service acceptance.

## Access and credential scope

- Use only the owner's intended Aux DigitalOcean account/project. Account terms, payment verification and final recurring-resource/access approvals remain separate. Do not reuse an unrelated organization's account.
- One owner-controlled SSH public key; disable password SSH and remote root login after verifying the approved administrative path. Restrict inbound SSH to the owner-approved administrator IP/range. No public web listener, DNS record or inbound5432. Confirm that allowlist before creating the firewall; do not silently open SSH to the world.
- Dedicated unprivileged `aux-backup` service account, private persistent job/delivery directories with mode0700 and secret files with mode0600. Pin reviewed repository commit, lockfile, Node24 and PostgreSQL18 client tool versions. Set `AUX_PG_DUMP` / `AUX_PG_RESTORE` to the reviewed Linux binaries; the current macOS defaults cannot be used unchanged.
- Transfer only the source credentials needed for capture: the intended production unpooled database URL and Neon project ID, private Blob access and original `AUX_DATA_ENCRYPTION_KEY`; plus the separate backup recovery key and bucket-only R2 S3 credential. These allow access to production contents, so approving the server alone is **not** approval to install them or run production capture. Review and approve that concrete connection separately. Current source credentials may have broader provider capabilities than read-only capture; establish supported narrower credentials or explicitly review those existing capabilities before use.
- Keep the recovery key outside all job/delivery trees. Do not upload keys or plaintext to R2. Do not place the existing broadly scoped Agents-vault service-account token on the runner, and do not grant the runner general access to the owner's password vaults. The owner retains the recovery key in 1Password and needs a separately secured emergency copy.
- The setup R2 credential expires **November22, 2026**. Warn before expiry and review its renewal/rotation; never auto-create broader access. New monitor ping URLs are secrets and go in1Password Aux Recovery plus the runner's private configuration, not source/logs.

## Schedule and implementation still required

Prepare a reviewed systemd service/timer wrapper around the existing actual capture, delivery and expiry CLIs; do not claim that wrapper is implemented by this document. One persistent filesystem and one authorized writer are required. The current authenticated job binding includes device/inode identity, so copying an unfinished job to a new host or ephemeral CI filesystem is unsupported.

Proposed capture: daily02:00 UTC with seven-day authenticated retention and initial maximum **1 GiB ciphertext per capture**. Proposed expiry sweep: hourly. Both share a process-independent lock; refuse overlapping or replaced state. A stale lock, unknown network outcome, incomplete capture or changed inventory must preserve the exact job, send failure notification and stop for operator review. Do not automatically create a replacement snapshot, discard an uncertain job, or silently truncate a budget-exceeding capture. Disk/run-time/file-count limits must be set from the reviewed workload, not inferred from the tiny synthetic fixture.

Use separate Healthchecks capture and expiry checks. Send a success ping only after complete remote hash verification or authenticated expiry cleanup respectively, and an explicit failure ping for known failures. The monitor alerts when success is missed even if the host or notification process dies. Proposed grace: two hours for daily capture and thirty minutes for hourly expiry, to be adjusted only after a real observed run. Do not send sensitive output or backup contents in ping/alert payloads.

Proposed alert recipient: `robertcourson1738@gmail.com`, subject to owner confirmation. This document sends no email, enrolls no notifications and creates no monitoring account. Verify one controlled failure alert and one missed-heartbeat alert before calling the schedule operational. A provider uptime check alone cannot establish that backups completed.

## Acceptance and rollback boundary

The existing actual R2 check already verified four synthetic objects/669bytes, full ciphertext readback, fetch after deletion of original job/delivery state, authenticated expiry and exact cleanup. Do not repeat that fixture unnecessarily. Current12 hosted cross-store restore also already passed. Evidence: [R2 live check](../../integration/proposed/aux-backup-r2-live/README.md) and [current12 hosted restore](../../integration/proposed/aux-cloud-hosted-restore-12/README.md).

After concrete provisioning and credential approvals, accept this runner with: one bounded actual scheduled capture/delivery, a remote fetch and isolated restore using the owner-held key, exact expiry deletion, restart/resume of the same retained job state, and the two alert checks. Use reviewed disposable source/target fixtures before any real production capture. Verify secrets stay out of journal/command arguments and that only ciphertext leaves the runner. Persistent source staging/key files require explicit cleanup and retained-job handling; encryption does not establish physical secure erasure.

Rollback disables timers and stops the owned service while preserving uncertain job records. Revoke only the runner-specific reviewed access when safe; do not delete the owner's recovery key or rotate source encryption keys. Retain independently recoverable ciphertext until its authenticated deadline and reviewed expiry path. Existing Aux desktop/UI, production traffic and marketing remain unchanged.

## Next owner actions

1. Confirm the proposed DigitalOcean/Healthchecks approach and identify/sign in to the intended accounts. New legal terms and payment verification may require direct owner action.
2. Review the actual prepared $12 bundled instance, administrator-key/IP scope, credential connections and alert recipient before provisioning/activation.
3. Keep an emergency recovery-key copy through1Password's owner-controlled flow; never send the key in chat.

Live Aux Stripe account/KYC, a separately authorized audio-capable ZDR model and production/desktop activation remain independent open items. This review grants none of those actions.
