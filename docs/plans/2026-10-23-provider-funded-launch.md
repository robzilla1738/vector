# Aux provider-funded launch

Owner direction, October23, 2026: launch Aux without payments. Users bring an AI-provider API key or connect an eligible ChatGPT/Codex plan. Aux subscriptions, paid tiers, credit purchases and Aux-funded hosted inference are deferred. Preserve the current supplied UI styling, native geometry, glass, sidebars and interactions; change only availability and copy needed for this launch scope.

This supersedes launch-blocking Stripe/paid-plan requirements in the older cloud roadmap. Keep completed resources and implementation recoverable for a later explicit paid release. Do not delete accounts, credentials, historical evidence or user data. Cloud account/sync/private storage/share operations remain separate services with real operating costs; payment deferral does not remove their readiness or backup requirements.

## Current changes and boundaries

- Stop live billing setup. The newly owner-created Aux Stripe account is retained. One in-flight Aux Pro product, `prod_VUgIfM4F7pO2jp`, with a $20 monthly price was created before the pivot and then reversibly archived. The actual Archived filter shows the product as Archived. No other live products, payment links, customers, charges, new live credentials, webhook or portal were created in this setup pass. Do not resume those steps without a new direction.
- Default source launch mode is provider-funded: `AUX_PAYMENTS_ENABLED` and `AUX_HOSTED_AI_ENABLED` are false unless their exact value is `true`. The flags are separate; opting into one does not silently enable the other. `AUX_LIVE_BILLING` remains a separate future live-payment gate.
- Both flags are explicitly stored as `false` in aux-cloud Vercel Development/Preview/Production and the matching 1Password Development/Production Environments. No deployment occurred; existing deployed code does not gain new guards from an environment edit alone.
- Stripe variables are not default build/readiness requirements. Default billing mutations/webhooks cannot create or reconcile charges. Default hosted inference cannot reserve credits or spend the Aux Gateway balance. Do not create introductory or recurring hosted allowances in this mode. Existing stored balances and subscriptions remain preserved, rather than being deleted or recast as new grants.
- The cloud account page should show provider setup information without plan pickers, checkout, payment management or hosted-credit marketing in the default mode. Keep the prior billing panel recoverable behind explicit opt-in; no CSS or accepted desktop binary changes are part of this source adjustment.
- Reuse the supplied BYOK dialog, account-scoped credential API and provider transport. Static source existence is not real-app acceptance: credential custody, account isolation, restart/recovery and one bounded inference need verification on the same accepted candidate.

## ChatGPT/Codex subscription connection

This is an actual supported integration category. Current [OpenAI integration documentation](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) describes eligible ChatGPT plan use through an application's OAuth connection. Sign-in identity and permission to consume plan usage are separate. Availability remains subject to OpenAI's [integration eligibility](https://developers.openai.com/siwc/quickstart); a free Aux launch is not by itself proof that an unpublished/private app has production access.

The accepted supplied runtime currently contains an older shared Codex OAuth/provider path. Preserve its UI structure, but adapt its authentication and provider boundary to the current [official registration contract](https://developers.openai.com/siwc/token-sharing-open-source/sign-in), using Aux's actual app identity. Do not reuse another product's identity, session cookies, OAuth tokens or owner login files.

Required integration work:

1. Retain a local per-installation host ID, register Aux through the eligible official flow and persist the issued client registration per verified account/workspace.
2. Keep fresh PKCE/state/nonce and the exact loopback callback bound to each attempt. Reject missing/mismatched state, incorrect identity or a replaced returning client ID. Verify token signature/issuer/audience/expiry/nonce and returned permissions.
3. Enable subscription inference only after the user grants the plan-usage scope; use permitted model discovery and Responses API transport. An ordinary ChatGPT login is insufficient.
4. Keep subscription tokens protected and local, excluded from synced provider-credential files. Preserve existing keys through explicit migration rather than silently overwriting or deleting them.
5. Verify one real connect, model selection, bounded completed request, refresh/restart and disconnect on a disposable Aux account/profile. No such runtime acceptance is claimed by this plan or static audit.

No application-registration consent, owner sign-in, subscription-token migration, new privileged OS access, native signing, production deployment or release is granted by this document. Show an honest availability state until that integration is accepted; BYOK remains the independently usable launch path.

## Launch acceptance

- Confirm a regular Aux window keeps the accepted UI and works without an Aux payment plan.
- Connect a disposable provider key through the actual supplied credential API; verify model discovery, chat/tool behavior and restart/account isolation with lean focused checks. Remove test credentials after the approved check.
- Accept ChatGPT plan usage only through its real integrated flow and actual account permission, with truthful provider errors/limits; do not substitute a mock successful connection.
- Confirm paid prompts and hosted spend are disabled in the same built candidate and deployed cloud mode. Source tests alone do not update the existing accepted desktop or hosted Preview.
- Keep sign-in/sync/sharing, password-manager extension compatibility, backup operations and native startup/lifetime acceptance on the remaining roadmap. Payments and Aux-hosted speech/inference are later opt-ins, not blockers for provider-funded launch.
