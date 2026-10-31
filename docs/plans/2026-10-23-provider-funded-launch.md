# Aux provider-funded launch

> **Superseded:** the [finish plan](../ROADMAP-EXECUTION-GRAPH.md) replaces this page wherever they disagree. It stays for its decisions and history.

Launch policy still stands. Which candidate has been observed, and what provider journeys remain, is in [STATUS](../STATUS.md).

Owner direction, October23, 2026: launch Aux without payments. Users bring an AI-provider API key or use a local agent CLI they are signed in to (Codex, Claude Code, Cursor and others). Aux subscriptions, paid tiers, credit purchases and Aux-funded hosted inference are deferred. Preserve the current supplied UI styling, native geometry, glass, sidebars and interactions; change only availability and copy needed for this launch scope.

This supersedes launch-blocking Stripe/paid-plan requirements in the older cloud roadmap. Keep completed resources and implementation recoverable for a later explicit paid release. Do not delete accounts, credentials, historical evidence or user data. Cloud account/sync/private storage/share operations remain separate services with real operating costs; payment deferral does not remove their readiness or backup requirements.

## Current changes and boundaries

- Stop live billing setup. The newly owner-created Aux Stripe account is retained. One in-flight Aux Pro product, `prod_VUgIfM4F7pO2jp`, with a $20 monthly price was created before the pivot and then reversibly archived. The actual Archived filter shows the product as Archived. No other live products, payment links, customers, charges, new live credentials, webhook or portal were created in this setup pass. Do not resume those steps without a new direction.
- Default source launch mode is provider-funded: `AUX_PAYMENTS_ENABLED` and `AUX_HOSTED_AI_ENABLED` are false unless their exact value is `true`. The flags are separate; opting into one does not silently enable the other. `AUX_LIVE_BILLING` remains a separate future live-payment gate.
- Both flags are explicitly stored as `false` in aux-cloud Vercel Development/Preview/Production and the matching 1Password Development/Production Environments. No deployment occurred; existing deployed code does not gain new guards from an environment edit alone.
- Stripe variables are not default build/readiness requirements. Default billing mutations/webhooks cannot create or reconcile charges. Default hosted inference cannot reserve credits or spend the Aux Gateway balance. Do not create introductory or recurring hosted allowances in this mode. Existing stored balances and subscriptions remain preserved, rather than being deleted or recast as new grants.
- The cloud account page should show provider setup information without plan pickers, checkout, payment management or hosted-credit marketing in the default mode. Keep the prior billing panel recoverable behind explicit opt-in; no CSS or accepted desktop binary changes are part of this source adjustment.
- Reuse the supplied BYOK dialog, account-scoped credential API and provider transport. Static source existence is not real-app acceptance: credential custody, account isolation, restart/recovery and one bounded inference need verification on the same accepted candidate.

## Subscriptions through the provider CLIs (updated 2026-10-29)

Subscriptions reach Aux through the agent CLIs the user has already installed and signed in to, the way T3 Code does (browser excellence plan, answer 5 and Batch 8). Aux never signs in on the user's behalf and ships no in-app subscription sign-in.

- Supported today: Codex (`codex app-server`), Claude Code, Cursor, Grok Build and OpenCode, plus Copilot and Gemini (and any other agent that speaks the Agent Client Protocol) when installed. The code is `vendor/provided/provider-cli/`.
- Settings › Models has two sections: Local agents (Ready, Not signed in with the CLI's login command, or Not installed with its install link) and API keys. Detection runs at daemon start.
- The in-app ChatGPT, Claude, Copilot, Kimi, Meta and Grok sign-in flows are removed (`borrowed-identity-removal.mjs`), with no borrowed client IDs or editor headers. The earlier plan for Aux's own registered ChatGPT sign-in is withdrawn.
- A CLI's own shell and file tools run under Aux's permission modes and approvals, and Aux's browser tools reach the CLI over the daemon's per-turn MCP endpoint.
- Remaining acceptance: one turn per CLI on Robert's own logins, with his yes at the time, plus the approval card on a CLI turn. BYOK API keys stay the other launch path.

## Launch acceptance

- Confirm a regular Aux window keeps the accepted UI and works without an Aux payment plan.
- Connect a disposable provider key through the actual supplied credential API; verify model discovery, chat/tool behavior and restart/account isolation with lean focused checks. Remove test credentials after the approved check.
- Accept ChatGPT plan usage only through its real integrated flow and actual account permission, with truthful provider errors/limits; do not substitute a mock successful connection.
- Confirm paid prompts and hosted spend are disabled in the same built candidate and deployed cloud mode. Source tests alone do not update the existing accepted desktop or hosted Preview.
- Keep sign-in/sync/sharing, password-manager extension compatibility, backup operations and native startup/lifetime acceptance on the remaining roadmap. Payments and Aux-hosted speech/inference are later opt-ins, not blockers for provider-funded launch.

## Routine execution scope — owner decision October26

Launch routines run on the selected Aux device only. The owner explicitly chose “Launch with device routines only” during completion. Remove cloud execution choices and new cloud-routine creation from the launch UI/producer path. Preserve existing unsupported cloud records without executing, deleting or retargeting them. This does not exclude general Bash/PTY requirements or authorize hosted infrastructure. Actual device-routine behavior remains a final-app/deployment acceptance gate.
