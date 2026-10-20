# External password managers: product scope

The owner excludes the supplied Vault product from Aux. `provided-assembly.mjs` now omits `ui/vault` from shipped resources and records `excludedProducts: ["vault"]`; the immutable source inventory and staging audit still retain it as provenance. Existing profiles and credentials are not deleted.

`provided-password-manager-scope.mjs` removes the Agent Passwords settings navigation/search entry and the Vault-backed Payment Use entry. Legacy settings URLs redirect to General before loading those components. Password-import onboarding is skipped, including forward/back navigation and progress steps. Account copy no longer advertises Vault retention/recovery. The original Extensions entry remains available for third-party password managers. No replacement UI or successful auth state is synthesized.

These exact, count-checked edits apply before native adaptations and branding. Seven real pinned Agent chunks were transformed, replay-checked and parsed successfully. The focused resource assembly tests pass, including absence of `apps/vault` in output.

Native component-extension loading, startup gates, first-party save/autofill prompts and agent tool exposure require the matching native/daemon changes from this implementation pass. Shared auth/provider crypto must remain. Third-party extension autofill and desktop companion integration still require actual observation; this patch does not claim those work.

## Rebuild from the frozen source

`stage-provided.mjs --source-snapshot /absolute/project/path/out/provided-source-snapshot-1.26.1016.1852 --output /absolute/project/path/out/fresh-stage --app-path /absolute/final/Aux.app` validates all seven frozen source inventories with the existing snapshot validator before staging. This avoids relying on the installed Aside version. Both snapshot and stage must satisfy the existing workspace/canonical-path checks. Run the normal preservation audit against the same explicit snapshot before packaging.
