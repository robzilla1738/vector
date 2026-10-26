# Privacy information — review draft

This draft describes the implemented architecture and proposed service configuration. It has not been approved as Aux's public privacy policy. Public hosted activation remains pending. The owner must complete the decisions below before publication.

## Local browser and AI activity

Aux profiles hold browser data and account-scoped app state on your Mac. Provider credentials use the application's account-scoped secure credential path; they should not be included in diagnostics, screenshots or shared content. When you choose to use an AI provider, your request and the context you select are sent through the configured provider integration. Your provider's own processing and retention policies apply. Aux-hosted AI is disabled in the current launch configuration.

Optional desktop observation and OS integrations require their supported implementation and explicit permissions. This draft does not authorize desktop capture or access to Messages, Contacts, the Keychain or unrelated private files. Aux does not ship a built-in password vault; an external password-manager extension has its own privacy terms and permissions.

## Hosted accounts, sync and files

The proposed Aux cloud uses Clerk for identity/session services, Vercel for the web/API application, Neon Postgres for service records, Vercel private Blob for file storage and Resend for transactional email. The source includes encrypted sync/content records and private file access controls. Some account, device, synchronization, timestamp and file-size metadata must remain available for the service to authenticate requests, resolve conflicts and operate. Encryption of a content record does not mean every service record is unreadable to the operator; no blanket claim of anonymous operation or zero operator access is made.

Private files are not intended to be public by default. Creating a share gives access through the chosen sharing capability; revocation and deletion require their actual service operations. Do not share material you lack permission to disclose. Email sign-in and other transactional messages necessarily pass their addressing/delivery information to the configured email or identity provider.

## Feedback reports

If you explicitly save session feedback, the source adapter submits your comment and the existing session-data export as a bounded JSON report through authenticated private attachment storage. Aux service operators with the existing private-store custody can read that report for review; it is not hidden from the operator by client-only encryption. The success message confirms verified private storage, not an email, response or human review. Actual storage and operator readback acceptance remain pending for this preview. Reports follow existing attachment quota, account access and deletion/purge handling and can be included in approved recovery captures. A distinct feedback review/retention policy and contact still require owner/legal approval; the upload token's expiry is not a ready report's deletion deadline.

## Recovery and diagnostics

Recovery source can encrypt a database/private-file capture for storage in the configured Cloudflare R2 recovery bucket. Scheduled operation, alerts, independent recovery-key custody and isolated restore are not yet accepted for the production service. A configured retention target is not proof that a deletion or backup deadline has been met. Operational records may be needed to investigate failed requests and incomplete writes; credentials and private payloads must be excluded from diagnostic output.

## Decisions required before public publication

Confirm the legal operator and contact for privacy requests; the exact purposes and legal bases for each data category; actual provider agreements and processing locations; log and content retention periods; deletion/export and backup-expiry handling; request-verification procedures; international transfer safeguards; age rules; and how policy changes are communicated. Confirm any analytics/crash reporting and browser network services present in the final delivered package rather than claiming they are absent from this source review.
