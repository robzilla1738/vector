# Production source profile — not activation

The source profile now contains only three public values:

- DB: `ep-red-snow-b8ctxcyx-pooler.c-14.us-east-1.aws.neon.tech`, exactly the approved production migration012 receipt's actual host; all twelve migration hashes were verified there.
- App: `https://app.getaux.co`, matching the recorded Production origin settings.
- API: `https://api.getaux.co`, matching the existing production metadata auditor's explicit expected public value; the prior inventory recorded no public-value mismatch and did not classify this API field as unverified. The implementation ledger records that public app/API/share values matched. This is recorded evidence, not a new DNS/provider/runtime check.

Development is byte-for-byte unchanged. The source guard is unchanged. The focused `check.mjs` imports the real `checkEnvironment`, uses synthetic strings only and proves each of the nine recorded missing variables still independently refuses, their combined missing shape refuses, wrong database/origins/test Stripe mode refuse, and the development Preview shape still selects development. A complete synthetic shape passing proves only source guard behavior, not real keys, webhook recipient pairing, readiness or deployment eligibility.

`node docs/integration/proposed/aux-production-profile/check.mjs` passed, with zero provider/deployment operations. Exact inputs are in `source-pins.json`. No actual environment values, secret files, provider clients, email, Gateway/terms, database or deployment were accessed. The old production configuration receipt remains unchanged and historically reports a null profile; the new profile does not repair its nine missing fields or two unverified origin values. Production activation, actual secret pairing/runtime values, operational recovery and acceptance remain pending.
