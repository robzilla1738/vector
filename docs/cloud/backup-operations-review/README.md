# Aux independent backup setup review

Prepared locally on 2026-10-23. No Cloudflare account, bucket, credential, schedule, alert, or paid resource has been created. The existing Vercel/Neon/Resend/Clerk/Stripe projects and accepted desktop UI stay unchanged.

## Destination decision

Use a new private Cloudflare R2 Standard bucket named `aux-recovery-prod` under the owner's intended Aux account. Do not move getaux.co DNS, attach a public domain, enable r2.dev/public access, or connect the marketing project. Only the already encrypted recovery bundles leave the capture host; recovery keys, database credentials and plaintext staging never go to R2. Use a bucket-scoped backup-only credential and exclude competing writers. The current explicit expiry implementation verifies every owned object before deletion; it does not provide a distributed writer lease or immutable object lock.

R2's S3-compatible PutObject evaluates `If-None-Match: *` atomically. The new transport uses this create-only operation, verifies complete returned bytes against the authenticated inventory and publishes bundle.json last. Expiry uses the authenticated capture deadline, removes the completion marker first and refuses unknown or modified objects. A network error remains an unknown outcome, never proof that a write did not happen. Retry only the same frozen job. Fetch must authenticate the complete bundle before accepting a local recovery copy; retaining the original workstation is not a recovery requirement.

Official references: [R2 conditional operations](https://developers.cloudflare.com/r2/api/s3/api/), [SDK integration](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/), [pricing](https://developers.cloudflare.com/r2/pricing/).

## Cost and initial operating limits

Proposed incremental target: $5/month, usage-based and not a guaranteed provider cap. R2 Standard currently lists $0.015/GB-month, $4.50/million Class A operations and $0.36/million Class B operations, with no Internet egress charge; the monthly free tier includes 10 GB-month, one million Class A and ten million Class B operations. Confirm actual account eligibility and billing before activation. Runner compute and source Neon/Blob reads are additional costs, not included in the R2 figures.

Start with a 1 GiB total ciphertext budget per capture and seven-day authenticated retention. File-count and runtime limits must be reviewed against the actual workload before a schedule is enabled. A budget failure aborts the capture or delivery; it must alert rather than silently truncate data. Provider lifecycle rules are a fallback, not evidence of physical deletion at the exact manifest deadline. No immutability or exact deletion-time guarantee is claimed.

## Separate key custody

The owner must keep a recovery-key copy in separately controlled custody, preferably an Aux-only item in their existing password manager plus a separately secured emergency copy. This is operator key custody, not a built-in Aux password manager. Do not send the key in chat or put it beside remote ciphertext. Verify retrieval locally without displaying it. The capture operator necessarily uses the key while encrypting; this transient access does not establish an independently recoverable owner copy.

## Schedule and alerts

Use the actual Node/PostgreSQL18 capture tools on an approved always-on operator runner with persistent private job state and a single scheduled writer. The existing authenticated job binding retains directory identities; copying that state to a new ephemeral CI filesystem is not a supported scheduler migration. Choose and review the runner and its private environment before installing a schedule. Do not use a development laptop's occasional availability as a production backup SLA.

Proposed initial cadence is one capture daily, exact-job retries after operator review, and hourly expiry processing. A capture or delivery failure must preserve its job and alert; an independent missed-heartbeat monitor must detect an offline runner. The alert recipient, sending credential, monitor account and runner access have not been authorized/configured. No email or hosted Action is sent/run by this review. A daily schedule is a candidate operating target, not a verified RPO/RTO.

## Activation gate

1. Identify/sign in to the intended Cloudflare account. Any new-account terms/payment steps remain with the owner.
2. Approve the concrete private bucket, scoped credential, encrypted-data destination and usage-based cost target before creation/connection.
3. Review actual private-access settings and independently retrieve the owner-held recovery key.
4. Run one bounded synthetic deliver/fetch/expiry check against the actual bucket; local protocol fixtures do not establish provider acceptance.
5. Approve/configure the persistent runner, schedule, failure alert and independent missed-heartbeat monitor. Observe an actual scheduled run and retention deletion.
6. Restore the remotely fetched bundle through the already verified isolated Neon/private-Blob path. Keep production traffic unserved until its separate readiness/cutover review.

Production Clerk/live Stripe, Gateway terms/funded ZDR execution and protected native startup remain separate open requirements. This review grants no deployment, signing, production activation, provider connection or new credential access.
