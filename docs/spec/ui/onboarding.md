# Local account onboarding, import and recovery

Status: **ready** for local flow and explicit measurements; display artwork and exact pixel comparison **draft**. Sources: SP2-O1 and SP2-S1 in `../provenance.md`.

## Flow

New disposable/local state enters welcome, local account creation, browser import, password import, model connection, permission selection, appearance/default-browser/shortcut finishing and completion. The local product replaces cloud sign-in/verification with a locally minted account. Keep reference cloud/OAuth marketing out of shipped onboarding. Model-provider OAuth is still a provider-specific credential flow, not Aux cloud sign-in.

The welcome uses original Aux mark, display headline and original art. All copy comes from `../copy.md`. Back retains completed fields; skip is explicit for optional steps. Refresh/restart resumes saved onboarding stage without repeating imports or resetting encrypted state. A failed transition remains actionable on its step. Do not declare completion until required local account/model setup is valid, or clearly record model setup deferred.

## Browser import

Detect supported installed browser/profile sources through native API. A source row shows independently licensed/original icon, browser name, profile label and current selection; do not read an owner profile without the authorized user choosing it. Native importer owns keychain permission/decryption; extension must not scrape encrypted browser databases. Data categories, disabled unavailable categories and progress/count/errors come from native contract.

Inspected source rows54px high, 32px icon,12px secondary text,12px horizontal inset, 6px gap, rounded11.2px outer group and fine dividers. A preview/promo grid is maximum736px wide,4columns and10px gap; cards144px high,22.4px radius. Collapse at narrow width.

Progress lists category/source and honest completed/failed counts. Cancel stops pending work where supported and reports any already-imported data; never imply rollback if native importer lacks it. History should preserve title/time when native importer provides them. Safari ZIP import uses file selection and an explanatory original Aux instruction. Skip proceeds without profile access.

## Password import and Vault setup

Detect managers/import formats, choose source and file or supported authorized connection, preview item count/category/errors, then explicitly import into selected unlocked local Vault. Support the provider inventory from vault.md. Sensitive export files remain outside logs and repository. Skip preserves current vault; retry must not multiply duplicate entries silently. New Vault password/recovery setup uses vault.md and daemon crypto contract.

## Model connection

List configured and addable supported providers with API key, compatible base URL or supported provider OAuth flow. Credentials are masked/write-only. Invalid key/network/endpoint errors leave editable fields and show retry. Persist through model credential API. Select model and supported effort; test only approved model. Do not make an external paid request merely by rendering provider options.

## Permissions

Show each local helper capability, current OS grant and an action invoking the helper's actual system permission request. Accessibility, screen capture, automation, contacts, messages and full disk access remain separate. Denial is recoverable through System Settings. Users may finish without optional grants and later see a precise missing-permission state when using a dependent tool. Do not claim a grant based only on clicking an allow button.

## Completion

Appearance/system mode, popup shortcut, default-browser request and CLI install are explicit preferences/actions. Native default-browser or shortcut updates show actual result. The inspected finish dialog is640×520px capped at viewport minus32px, with48px side/32px vertical scrolling content inset. A narrower primary action area is440px wide maximum. Save onboarding completion only after successful daemon acknowledgment; then open newtab/task entry.

## Password gate and recovery

When an existing local Vault requires unlock, show a distinct gate with password field and biometric option only when enrolled. Wrong password retains gate and an original error, never resets vault. Recovery accepts a user-supplied recovery file or words, verifies them, then permits choosing a new password and creating a replacement key. Show recovery key once with save/copy confirmation and verification challenge. Old key invalidation and data-clear semantics must match crypto backend, with explicit warning/confirmation for unrecoverable reset. Exact word-count/KDF parameters are daemon-owned and currently not established by UI evidence.

## Acceptance

Exercise first launch, back/skip/resume, authorized disposable source import with actual progress, failed model validation, optional permission denial, complete setup, restart into unlocked/locked state and recovery success/failure. The owner real profile must remain untouched during acceptance.
