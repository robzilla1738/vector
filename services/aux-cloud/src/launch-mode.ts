// Aux launches bring-your-own-provider only: no payments and no Aux-funded AI.
// Clients still read these flags, so they stay part of every billing and readiness reply.
export const launchCapabilities = () => ({ paymentsEnabled: false, hostedAiEnabled: false });
