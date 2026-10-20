# External password managers: product scope

The owner excludes the supplied Vault product from Aux. `provided-assembly.mjs` now omits `ui/vault` from shipped resources and records `excludedProducts: ["vault"]`; the immutable source inventory and staging audit still retain it as provenance. Existing profiles and credentials are not deleted.

`provided-password-manager-scope.mjs` removes the Agent Passwords settings navigation/search entry and the Vault-backed Payment Use entry. Legacy settings URLs redirect to General before loading those components. Password-import onboarding is skipped, including forward/back navigation and progress steps. Account copy no longer advertises Vault retention/recovery. The original Extensions entry remains available for third-party password managers. No replacement UI or successful auth state is synthesized.

These exact, count-checked edits apply before native adaptations and branding. Seven real pinned Agent chunks were transformed, replay-checked and parsed successfully. The focused resource assembly tests pass, including absence of `apps/vault` in output.

The matching native/daemon changes now remove Vault from component-extension loading and startup gates, disable first-party save/autofill, and omit the built-in password-manager REPL and skill. Shared auth/provider crypto must remain. Third-party extension autofill and desktop companion integration still require actual observation; this patch does not claim those work.

## Rebuild from the frozen source

`stage-provided.mjs --source-snapshot /absolute/project/path/out/provided-source-snapshot-1.26.1016.1852 --output /absolute/project/path/out/fresh-stage --app-path /absolute/final/Aux.app` validates all seven frozen source inventories with the existing snapshot validator before staging. This avoids relying on the installed Aside version. Both snapshot and stage must satisfy the existing workspace/canonical-path checks. Run the normal preservation audit against the same explicit snapshot before packaging.

## Local browser route trace

The pinned `extension-main-Dz1-AsCT.js` already admits the real local account on explicit `/u/<id>/tasks/new` and settings routes. Its profile/account resolver and authentication are retained. A narrow native UI adaptation changes bare `main.html` routing from hosted sign-in to the supplied new-chat component, using the same actual account resolver already used by sidepanel/minipopup entrypoints; no completed-onboarding or authenticated-cloud state is set.

Settings must load `main.html#/u/<id>/settings/general`. Supplied `newtab.html` has the static new-tab editor and React slots, not the main extension router/root, so adding a settings hash to it cannot mount Settings. The matching native route fix is required.

When a genuine local account has no available models, the supplied composer now directs the user to its existing model/provider settings instead of hosted sign-in. It uses the original connection notice component and leaves model availability and authentication untouched. Paused cloud accounts retain their existing sign-in notice.

The assembler also verifies but omits the nested `Aux Password Importer.app` and credential-provider extension. The daemon resolves its path lazily; only explicit Apple credential-import operations require that bundle and report missing output when absent. No installation-auth or normal startup helper uses it. Excluded leaf hashes remain in the assembly receipt, and the stage/provenance is unchanged.
