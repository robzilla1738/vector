# extension-ui-a1

Agent extension edits from the 2026-10-27 excellence audit (`edits.json`, applied with `scripts/candidate/prepare_edits.py`). The supplied UI stays as is; only these surfaces change.

- **D4/D6:** the billing route redirects to General settings. "Plan & Usage", referral and Aux Pro entries leave the settings search, the referral block and Remote Control section stop rendering, and the Remote Control FAQ (Pro plan copy, dead install command) is gone. The Personal Assistants channel (Pro, needs Remote Control) is hidden. Other upgrade prompts were already gated by `AUX_LAUNCH_POLICY`.
- **D1:** no `dev-cloud.getaux.co` remains: the API origin uses the local placeholder, the credits dialog's server-side fallback uses the share placeholder, and the manifest drops the dev-cloud web-accessible entry.
- **D5:** Send Feedback stays only in the chat session menu; the settings sidebar, new-tab menu and `/feedback` command entries are removed.
- The new-tab menu's link to Aside's Discord is removed, and the settings sidebar no longer links to the undeployed docs and community pages.
- The test routes `/artifact-test`, `/error-test` and `/liquid-glass-playground` redirect home.
- **D8:** the extension has no i18n layer (all copy is English); the four number and date formatters that used the browser locale now use `en-US`.
- A stray `}` in the channel help URL is fixed, and messenger setup defaults to manual (automatic setup pointed the agent at a dead URL).

Recovery and Vault copy needed no change: every screen that mentions a Vault or built-in password manager sits behind a route that already redirects.
