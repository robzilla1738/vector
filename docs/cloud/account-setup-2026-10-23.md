# Aux account setup — 2026-10-23

## Completed in the actual accounts

The owner approved the 1Password desktop client connection. The current desktop MCP account and Agents-vault service account were verified to have the same account ID. Three Developer Environments were created through the 1Password MCP server:

| Environment | ID | Verified contents |
| --- | --- | --- |
| Aux Development | `kj5jo2wwpsh2nbjf3dgdpsx6zq` | Seven public configuration variables |
| Aux Production | `tgl4lxfw5ang6pgluyjrop3ncu` | Eight public configuration variables |
| Aux Recovery | `tiqx3r27nvdpnhpldrrbugximu` | Recovery-key vault reference |

Development contains `NEXT_PUBLIC_APP_URL`, `AUX_API_ORIGIN`, `AUX_ALLOWED_ORIGINS`, `CLERK_AUTHORIZED_PARTIES`, `RESEND_FROM`, `AUX_AI_MODEL` and `AUX_AI_FAST_MODEL`. Production additionally contains `AUX_SHARE_ORIGIN`. These are public configuration values; no provider credentials have yet been copied into these Environments. No local Environment mounts were created, and existing private bootstrap files were not overwritten.

A new generic Agents-vault item, **Aux Cloud Recovery Key**, was created through `op-agents` using 32 CSPRNG bytes represented as hexadecimal. Private field readback matched without exposing its value. Aux Recovery contains only `AUX_RECOVERY_KEY_REF=op://Agents/c2spe7d5jhft5falu424bbyzu4/password`. The key has not yet been used for a production capture. This proves vault storage/retrieval; it does not prove a separately secured emergency copy, independent owner retrieval, a functioning schedule or disaster recovery.

## Actual dashboard observations

- Cloudflare is logged in as the owner's `robertcourson1738@gmail.com` account, ID `5a5f6f8a4d1c1d35cfe82c4a74c966b9`. R2 is already enabled. Existing unrelated buckets remain unchanged. The new-bucket form is prepared for `aux-recovery-prod`, Standard, automatic Eastern North America location, private by default. Creation remains unsubmitted pending the concrete bucket/cost approval. Existing total account storage was 12.84 GB, so a new bucket does not have a separate unused account free tier.
- Gateway checkout was revalidated at $11.58 for $10 credit, with auto-reload off. The checkout remains unsubmitted pending the requested AI Product Terms consent. No paid inference success or purchase is claimed.
- Aux production Clerk's form retains the intended API URL and five reviewed events. Creation remains unsubmitted pending the requested production-access confirmation. No new webhook signing secret exists yet.
- Stripe's Aux Development sandbox remains under the existing Joyflow parent account. The account switcher did not identify a separate live Aux business. Selecting the Robert Courson entry returned the same previously known parent account, `acct_1S8lUsGiH5gJuWEu`; no live settings or payment data were changed. The owner was asked to create the separate Aux live account and complete legal/identity/payout steps directly.

## Still pending

Concrete approval questions for Gateway terms/purchase, Clerk production webhook and the private R2 bucket are pending. Subsequent R2 credential creation needs the exact bucket-limited access review at action time. Production Stripe configuration depends on the separate live Aux account. A persistent backup runner, schedule, failure alerts and independent heartbeat monitor remain unconfigured. No production deployment/activation, new signing, owner-profile operation, desktop build or accepted UI change occurred in this account-setup pass.

The independently verified current12 hosted restore remains complete as recorded in `../integration/proposed/aux-cloud-hosted-restore-12/`; it does not establish those operating backup controls.
