// Transform provenance prevents an older, internally consistent UI stage from
// silently passing after its branding/platform adaptation code has changed.
export const providedStageInputs = Object.freeze([
  'scripts/stage-provided.mjs',
  'scripts/lib/provided-ui.mjs',
  'scripts/lib/provided-apps.mjs',
  'vendor/provided/daemon-adapter.mjs',
  'vendor/provided/vault-product-exclusion.mjs',
  'vendor/provided/daemon-node-development.mjs',
  'scripts/lib/aux-mark.mjs',
  'scripts/lib/provided-wire.mjs',
  'scripts/lib/provided-ui-boundary.mjs',
  'scripts/lib/provided-newtab-unavailable-controls.mjs',
  'scripts/lib/provided-password-manager-scope.mjs',
  'scripts/lib/provided-settings-import-copy.mjs',
  'scripts/lib/provided-draft-flush.mjs',
  'vendor/provided/native-ui-compat.mjs',
]);
