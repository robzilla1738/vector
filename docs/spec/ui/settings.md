# Settings surfaces

Status: **ready** for route/control coverage. Dimensions not listed and exact screenshot parity remain **draft**. Sources: SP2-S1/S4 in `../provenance.md`.

## Shared frame

Account-scoped settings preserve the selected section through refresh/deep link. Navigation groups labels and active route, scrolls independently when necessary and uses keyboard focus. Main section uses shared secondary-page geometry. Title 24px DM Sans at approximately450 weight with 24px bottom margin. Section headings use 14px display text with secondary tint; section caption 12px medium. Each setting row is label/description left and control right, wrapping on narrow width rather than clipping. Label 14px medium, description12px medium, content groups separated32px. Promotional illustrations must be Aux-created; measured image slot288×160px, never reference art. Save pending disables repeated mutation; failures retain previous authoritative value.

## Route and control catalog

| Route | Required controls and states |
| --- | --- |
| general | Default search provider; newtab default mode; preferred languages; automatic picture-in-picture; capture preferences; spellcheck; default-browser state/action; background service; browser bookmark import and browser data import; app version/about. Import launches actual importer flow. |
| appearance | System/light/dark theme; window material transparency/tint; vertical/horizontal tabs; theme swatches; horizontal shrink-to-fit; zoom; sidebar sections visibility; number of recent sessions; new-tab insertion position; task-tab cleanup/grouping preference and customization text; tab-switch order. Native-affecting values use native API and persist, not CSS-only imitation. |
| account | Local account identity/avatar, rename, account switch/add/remove if supported, password/recovery security. Display local-only storage explanation. Hide billing, sync, organization and device-cloud controls. |
| agents | Completion sound with independent Aux audio, preview/reset; task notification categories (attention/completion/routine completion); runtime version; tab cleanup delay choices5/10/15/30/60/120min; default permission and follow-up queue/steer behavior; messages permission setup; allowed file roots; per-tool policy allow/ask/deny with tool-name/glob; sandbox enable/disable with consequence confirmation; browser-tab change/new-session preference. |
| model | Configured provider accounts and available models; credential add/replace/remove with secret masking and no secret echo; OAuth device/browser flow where supported; custom compatible endpoint; category/default routing; model-specific effort/fast/vision capabilities; compaction limits where available. Test connectivity shows real result. Live AI testing is restricted to owner's approved model. |
| plugins/mcps | Configured server list and enable toggle; add/edit/remove; stdio command/args/environment or remote URL/headers; optional OAuth fields; connecting/connected/failed/disconnected; test connection and tool inventory; show actionable server errors without leaking credentials. |
| plugins/skills | Built-in/user/system inventory, enable toggle, folder import, create/edit user skill, copy built-in for customization, inspect instruction/files and delete owned skills. Detail route uses actual skill ID and preserves category/back navigation. |
| channels | Local channel integrations: detected/configured providers, connect/disconnect and health, credential/OAuth fields when supported. Hide cloud-only hosted channel operations and clearly show local unsupported integrations without pretending connection. |
| communication | Per-app detected integration enablement; sending permission; ask-before-send; follow-up enable/duration; tone matching and custom instructions. Saving a preference never authorizes sending a message by itself. Draft review remains in task conversation. |
| context-awareness | Enable capture; pause15/30/60min or until resumed; typed-text capture toggle; screen-recording permission; excluded apps/domains; raw-capture retention days; summary model; searchable app/web activity timeline and status; clear all with irreversible confirmation. Capturing requires backend permission, excludes password fields and never stores raw keystrokes. Disabled capture keeps existing history until expiry/deletion. |
| lasso | Enable selection transformation, trigger/shortcuts, available transform modes and page-selection preferences. Native shortcut capture handles conflicts explicitly. |
| mini-popup | Enable global popup and capture/change shortcut; show current shortcut or clear unavailable state. Preview illustration original Aux. |
| password | Enable Vault, setup/unlock/lock, biometric enrollment/removal/status, unlock password/recovery replacement, auto-lock where supported, import/export and destructive clear. Never expose decrypted values in general settings cache. See vault.md. |
| privacy | Blocking enable with confirmation when disabling; filter catalog search, recommended/regional categories, per-list enable, custom HTTPS list add/edit/remove and custom filter text; site exceptions; data deletion modal with time range and history/cookies/cache/downloads/autofill/site-storage toggles; third-party cookies; site permissions, DNS/certificates/safe-browsing advanced links; analytics toggle is local no-op or hidden per daemon contract. |
| projects | Workspace/project defaults, project list and per-project instructions/files/skills. Link to project detail and use backend path selection. |
| routines | Routine list/create/edit, schedule/timezone, activation, run-now and suggestion scan, as in secondary.md. |
| memories | Generation toggle, retention and directory/history controls; choices no expiry/30/90days for episodic history. Link memory editor. |
| archived-chats | Paginated archive, restore and confirmed permanent deletion. |
| statistics | Local session metrics and activity heatmap from local data. |
| developers | CLI installation status/install, coding-agent detection and Aux browser skill installation, original skill instructions view, MCP connection instructions. Remote-control cloud tab hidden locally. No reference CLI/skills bundled. |
| experimental | Local feature flags with explicit experimental status, live-tab preview and tool-discovery controls if supported. Hide cloud sync/hosted code handoff; do not run an unapproved default model from reference onboarding. |

## Behavioral detail

Privacy time-range choices: all history,15min,30min,24hours,7days,4weeks. Removal retains the dialog on error. Custom lists require HTTPS URL plus human label, expose download/parse/update failure, and confirm removal before rules stop. Context history uses56px time-label column plus flexible activity column with12px gap, selection/filter controls and an explicit empty/error state. Communication app grid uses6columns with8px gaps in roomy layout, collapses responsively.

Browser-setting changes honor promise errors and missing native capabilities. Controls that depend on a disabled parent are disabled or hidden with the saved value preserved. System theme tracks OS changes; explicit light/dark overrides them. Avoid showing a success toast before persistence succeeds. Credential fields are write-only and clear on success; logs/errors must redact secrets.

## Unknowns

Exact ordering of every subheading, native preference value schemas and some feature-flag defaults need daemon/native specs. This catalog describes required UI behavior, not invented APIs. Each route must be checked for no console errors and visual captures in light/dark before parity acceptance.
