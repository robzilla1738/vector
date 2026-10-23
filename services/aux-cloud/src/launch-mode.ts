// Deliberate opt-ins: saved credentials never enable purchases or Aux-funded AI.
export const paymentsEnabled = () => process.env.AUX_PAYMENTS_ENABLED === 'true';
export const hostedAiEnabled = () => process.env.AUX_HOSTED_AI_ENABLED === 'true';
export const launchCapabilities = () => ({ paymentsEnabled: paymentsEnabled(), hostedAiEnabled: hostedAiEnabled() });
