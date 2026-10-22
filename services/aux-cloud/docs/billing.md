# Aux billing implementation and remaining acceptance

This service creates and operates only Aux-mapped Stripe customers. Customer metadata must match the authenticated Aux user before the backend reads payment details, opens a portal, grants credits or schedules cancellation. A configured price ID must match the selected plan's USD amount and recurring interval before checkout. Existing account resources are not modified by setup or by this implementation lane.

## Product decisions

- Free: local browser/BYOK plus a one-time $0.25 hosted allowance.
- Pro: $20/month or $200/year, $5 service credits per month.
- Max: $60/month or $600/year, $20 service credits per month.
- Unused included and purchased credits roll over. Purchased credits do not expire merely because a subscription ends.
- Yearly invoicing grants the same monthly allowance schedule as monthly subscriptions. Missing paid months accrue when the wallet is next accessed, including after an offline subscription year ends; annual subscribers are not limited to the first month's allowance.
- A paid upgrade tops up only the current allowance period. Historical granted periods cannot be retroactively upgraded.
- Automatic reload is not implemented or enabled. `/auto-reload` returns409; the existing UI receives `canAutoReload:false,enabled:false`. No off-session charges are attempted. Explicit credit purchases remain available.

## Contracts and ownership

`/subscription` follows the supplied `billingSubscriptionResponseSchema`, including actual Stripe invoices and the saved default card/Link payment-method shape. Empty invoices/payment method now represent actual absence rather than placeholders. `/v2/subscription` keeps the supplied summary subset. Checkout accepts the unchanged `aside_pro_month`, `aside_pro_year`, `aside_max_month`, `aside_max_year` wire lookup keys; display names are Aux.

One durable checkout request per account/mode provides a stable Stripe idempotency key. Simultaneous requests share the same checkout; changing the pending purchase returns409. Existing nonterminal subscriptions block another subscription checkout and direct the user to the portal. Completed sessions are retrieved afresh and release the checkout lock; an old cached Stripe create response is not treated as still open. Return URLs are limited to configured HTTPS origins or exact local `http://127.0.0.1:21520/billing/return`/localhost callback, without embedded credentials.

Stripe webhook signatures are verified before mutation. State is reconciled from current Stripe objects rather than stale webhook snapshots. Subscription writes reject older event versions and cross-subscription overwrites. An invoice can establish the subscription mapping and paid coverage before a subscription webhook arrives. Stale invoice delivery still records paid coverage for the matching current subscription without overwriting newer subscription state. Unknown customers, foreign metadata or unrelated prices cannot grant credits.

Subscription allowance reconciliation runs in PostgreSQL under a wallet row lock; unique subscription-period grants make duplicate events and concurrent API requests idempotent. `ensureWallet` calls that reconciliation before every usage reservation, so annual monthly grants require no separate cron. Current cancellation end timestamps cap future paid coverage; prior earned credits remain available.

Add-on grants use the payment intent ID as their unique source, and credit only paid USD sessions with matching amount, Aux user and customer ownership. Refund handling retrieves current cumulative refund totals and reverses only known Aux add-on grants. A PostgreSQL function locks the wallet and re-reads refund state, preserving idempotency for repeated/out-of-order partial refunds. An early refund webhook is reconciled again when the paid checkout grant arrives. Subscription refunds require the merchant to cancel/adjust the subscription in Stripe; Aux does not initiate refunds automatically.

## Usage accounting

Wallets track aggregate, purchased and debt balances separately. Reservations consume included credits before purchased credits and record exactly how much purchased balance was used. Settlement restores the correct purchased portion on refunds, applies actual-cost differences atomically and cannot settle a reservation twice. A provider overrun beyond the reserved/remaining balance becomes explicit debt rather than silently disappearing; further reservations are blocked until a later allowance or purchase pays that debt. Credits and debt never become negative.

The provided UI's visible credit strings/percentages remain unchanged. No owner credentials, profiles, production payment data or prior Stripe resources were used for verification.

## Evidence and remaining checks

- Billing, usage and inference TypeScript checks passed.
- Four focused billing tests passed, including actual PostgreSQL execution of migration003 and the production tagged-template reservation/settlement SQL in disposable PGlite.
- Verified included/purchased allocation, partial refund, repeated settlement, provider-cost overrun, annual monthly backfill, duplicate reconciliation, current-month upgrade, canceled/offline paid-year credit recovery, cumulative add-on refunds and older refund-event refusal.
- No migration was applied to Neon by this lane.
- No Stripe resources were created/updated, checkout was completed or payment was charged by this lane.
- Actual sandbox checkout, webhook delivery/reordering, portal changes, saved payment method and invoice rendering still require the configured Aux Stripe account/keys and focused end-to-end acceptance. Live billing is gated by `AUX_LIVE_BILLING=true`; default local setup does not enable live charges.

Sources: https://docs.stripe.com/webhooks and https://docs.stripe.com/billing/subscriptions/webhooks . Installed Stripe API types were used for current invoice parent/subscription and line pricing shapes.

## Direct Agent plan-consumer compatibility — 2026-10-22

The direct `/billing/plans` consumer in `error-content-CCom8r6s.js` returns JSON without validation; its actual shared pricing transform then filters `active` and reads `prices.month/year`. The earlier backend list lacked both and would have rendered no plans. `billingPlansSnapshot()` now returns the exact source-consumed fields: `slug`, `name`, `tier`, `active`, `features`, and `prices.{month,year}.{currency,unitAmount,interval,lookupKey}` (free prices are null). Lookup keys become null if that environment has no configured Stripe price, preserving the supplied disabled-purchase behavior rather than advertising an unconfigured checkout.

The focused test executes the original pinned shared consumer from `test-fixtures/provided-pricing-table-shared.js`, SHA256 `5e5bb01e9e3d391b7522a8f00f62d17ded5c7705a1157a55026e09957607d642`, with only its export adapted into an isolated VM. It proves free/Pro/Max row availability, currency formatting, monthly/yearly checkout keys and unconfigured-price behavior. This is source-consumer acceptance, not a claim that the rebuilt desktop has been observed.

Aux's configured $200/$600 annual prices save two months against $20/$60 monthly (16.67%). The supplied UI hardcodes20%; the separate, count-checked `vendor/provided/cloud-billing-adapter.mjs` changes only that label to `Save yearly`. Its two focused tests pass against the exact pinned original. The adapter remains inactive until root composes it into the reviewed native/UI staging pipeline; no shared UI adapter was edited.

Root reports that fresh Aux development Neon migrations001–007 were successfully applied using a real PostgreSQL WebSocket transaction, and that four Aux sandbox prices and the portal configuration were created with the new restricted Aux backend key. These are resource/migration evidence, not completed live customer checkout. Existing data was preserved. This lane made no external mutations and did not change applied migration003 after that report.

The auth lane has integrated `cancelUserSubscription` before account revocation/deletion; a cancellation configuration/ownership failure preserves account access. Actual Clerk sign-in and full native/Stripe lifecycle acceptance remain root's runtime checks.
