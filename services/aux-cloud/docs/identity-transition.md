# Aux cloud identity transition (version 1)

This change updates cloud API producers to Aux while preserving existing account,
billing and UI state. It changes no prices, plan features, geometry, CSS, icons or
interaction implementation. No provider resources or existing records are edited.

New responses use provider `aux` and checkout lookup identities
`aux_pro_month`, `aux_pro_year`, `aux_max_month`, `aux_max_year`. CORS allows
`X-Aux-Auth-Protocol` within the existing origin allowlist. The auth header is a
client protocol marker, not a replacement authorization credential.

The supplied pricing-table consumer takes checkout keys from the server response.
The pinned original consumer fixture is executed against these new responses,
without modifying its formatting/layout code. Its checkout calls already forward
the selected key. Desktop model-provider schema, model selection and persisted
provider configurations must migrate to `aux` in the coordinated successor before
it consumes the new catalog. This service change alone does not migrate desktop
state or establish integrated acceptance. Deploy with the compatible successor;
no deployment was performed as part of this change.

## Existing billing state

Stripe subscriptions and invoice reconciliation select plans from the configured
`STRIPE_PRICE_*` IDs, not provider lookup-key text. Existing Aux customer,
subscription and checkout metadata already uses `aux_user_id`. Those identities,
price IDs, subscription IDs, ownership checks and idempotency keys are preserved.
There is no automatic remote metadata rewrite, duplicate subscription, new price,
or database reset.

The explicit reader `src/billing-identity-transition.ts` accepts exactly four
historical prefixed keys and maps them to canonical Aux identities. All new
responses and checkout request keys use Aux. A pending stored request key may
still carry the older prefix: comparison canonicalizes that read only, retaining
the same checkout/session and idempotency identity instead of expiring a purchase
because its spelling changed. Different plans and return targets keep the current
replacement behavior; malformed or unknown keys gain no equivalence. No general
prefix replacement or unrecognized historical owner-metadata fallback is allowed.

The four original literals deliberately remain in this isolated compatibility
reader and synthetic tests. Original supplied fixtures and historical evidence
remain truthful. This is **not** a claim of zero original-name bytes throughout
the delivered system. Remove the reader only after old-client and pending-checkout
retention is explicitly retired; don't delete customer or payment records to do
so. A later at-rest rewrite can canonicalize known Aux-owned request keys without
changing their request/session IDs if zero legacy database text is required.

## Focused verification

- Original supplied pricing consumer renders new server keys and unchanged prices.
- Historical/current key canonicalization preserves valid target and plan mapping.
- Actual checkout acquisition reuses a historical active request without expiring it.
- Actual CORS preflight admits the new header within the existing origin boundary.
- Actual model catalog returns provider `aux` using a synthetic catalog fetch.
- Service TypeScript check.

These are local synthetic/source-consumer checks. No live checkout, hosted
rollout, paid model call, provider data mutation or real desktop acceptance is
claimed.
