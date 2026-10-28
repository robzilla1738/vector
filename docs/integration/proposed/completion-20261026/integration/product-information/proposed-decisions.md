# Proposed answers to the open legal decisions

Prepared 2026-10-27. **Confirmed by the owner on 2026-10-27** as the basis of the published terms and privacy pages (`services/aux-cloud/app/policy/`, terms version `2026-10-27`). Not legal advice; counsel review remains the owner's choice. Items marked **Owner fact** cannot be proposed, because they depend on facts only the owner has.

## Facts established from the delivered package (seal `3b9f9b68`)

- **Analytics:** the supplied daemon's PostHog client is constructed with `disabled:!0` at every call site (24), so no analytics events are sent. The extension bundle contains no PostHog host. The privacy page can say the desktop app sends no product analytics.
- **Crash reporting:** this is a non-official Chromium build (`is_official_build=false`, Chromium branding) with no crash-upload endpoint configured, so crash reports stay on the Mac. Re-check before any official build.
- **AI requests:** they go only to the provider the user configures (BYOK). Aux-hosted AI is off (`AUX_HOSTED_AI_ENABLED` unset), so the hosted catalog returns no models and makes no provider call.
- **Built-in vault:** none. Password managers are the user's own extensions.

## Terms

| Decision | Proposed answer |
|---|---|
| Eligibility and age | Users must be at least 13; under 18 requires a parent's or guardian's permission. If the service is offered in the EU, use 16 there. |
| Content ownership | Users keep all rights to their content. Courson Digital LLC gets a limited licence to store, process and transmit it only to provide the features the user chooses (sync, shares, feedback), ending when the content is deleted. |
| Acceptable use | No unlawful use. No accessing accounts or data without authorization. No malware, spam, or circumventing security or rate limits. No using Aux automation to violate third-party sites' terms. No sharing others' private material without permission. |
| Suspension and termination | Accounts may be suspended for serious or repeated violations, with notice where practical. Users can delete their account at any time. After termination, users can export their data for 30 days unless that is unlawful. |
| Paid services | None. No payments or Aux-funded AI are offered. Provider charges are between the user and their provider. Add terms only if payments are ever enabled. |
| Warranty and liability | Provided "as is" during the development preview. Liability is capped at the greater of fees paid in the prior 12 months (currently $0) or US $100, except where the law does not allow limits. |
| Governing law and disputes | **Owner fact:** the state where Courson Digital LLC is organized. Proposal: that state's law and courts, with small-claims court available. No arbitration clause unless counsel recommends one. |
| Changes to terms | Material changes are notified in-app and by email at least 14 days before they take effect. Continued use after that counts as acceptance. |
| Consumer rights | Nothing limits rights the user has under local consumer law that cannot be waived. |

## Privacy

| Decision | Proposed answer |
|---|---|
| Purposes and legal bases | Account and sync: contract. Security, abuse prevention and diagnostics: legitimate interests. Transactional email: contract. No advertising or sale of data. |
| Processors and locations | Clerk (identity), Vercel (application, private Blob), Neon (Postgres), Resend (email), Cloudflare R2 (encrypted recovery, inactive while backups are deferred). **Owner fact:** confirm each account's region; US is expected. |
| Retention | Service logs: 30 days. Feedback reports: 90 days. Deleted accounts and content: removed within 30 days, then gone from any encrypted backup within 35 more days once backups exist. Shares: until revoked or deleted. |
| Deletion and export | In-app account deletion (`DELETE /me`) plus email requests to hello@getaux.co, answered within 30 days. Export of synced content on request. |
| Request verification | Requests must come from the account's verified email, or be confirmed by a code sent to it. |
| International transfers | Processors' standard contractual clauses or equivalent safeguards. |
| Age | Matches the terms (13+, 16 in the EU). No knowing collection from younger children; such accounts are deleted when discovered. |
| Policy changes | Same as the terms: in-app and email notice, 14 days ahead for material changes. |
| Analytics and crash reporting | None sent by the desktop app, per the package facts above. |
