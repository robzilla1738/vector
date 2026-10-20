// Transform provenance prevents an older, internally consistent UI stage from
// silently passing after its branding/platform adaptation code has changed.
export const providedStageInputs = Object.freeze([
  'scripts/stage-provided.mjs',
  'scripts/lib/provided-ui.mjs',
  'scripts/lib/provided-apps.mjs',
  'vendor/provided/daemon-adapter.mjs',
  'vendor/provided/daemon-node-development.mjs',
  'scripts/lib/aux-mark.mjs',
  'scripts/lib/provided-wire.mjs',
  'scripts/lib/provided-ui-boundary.mjs',
  'vendor/provided/native-ui-compat.mjs',
]);
