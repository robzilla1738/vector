// Disposable native journeys must never inherit a person's model connection.
// Keep this closed list aligned with Settings/PROVIDER_ENV; unrelated fixture
// transport, runtime engine, admission and cleanup variables remain unchanged.
const MODEL_ENVIRONMENT_KEYS = new Set([
  'AI_GATEWAY_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY', 'OPENAI_COMPATIBLE_API_KEY',
  'AUX_PLANNER_MODEL', 'AUX_RECOVERY_MODEL', 'AUX_VISION_MODEL',
]);
export function modelFixtureEnvironment(original) {
  const environment = {};
  for (const key of Object.keys(original)) {
    // Do not even read excluded credential values.
    if (!MODEL_ENVIRONMENT_KEYS.has(key)) environment[key] = original[key];
  }
  return environment;
}
