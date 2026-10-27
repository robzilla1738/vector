# Aux cloud identity transition (version 1)

The cloud API speaks Aux identities. CORS allows `X-Aux-Auth-Protocol` within the existing origin allowlist; the header is a client protocol marker, not a credential.

## Billing state

Aux takes no payments, so the billing code and its historical-key reader were removed. The billing tables from migration 003 stay in the schema as applied history and are cleared for each deleted account; nothing writes to them. Billing routes answer read-only with the free plan, and the hosted AI catalog is empty, so the desktop's provider and pricing views show bring-your-own-provider only.

## Verification

- Actual CORS preflight admits the new header within the existing origin boundary.
- `src/launch-mode.test.ts`: billing answers read-only, payment and AI routes return 404, and the catalog is empty.
- Service TypeScript check.

These are local checks. No hosted rollout or desktop acceptance is claimed.
