/** The `onboarding` tRPC namespace: what the first run detects on this Mac. The detectors stay the
 * supplied ones. */
export function create({publicProcedure, z, onboarding: o}) {
  return {
    detectBrowsers: publicProcedure.query(() => o.detectBrowsers()),
    detectPasswordManagers: publicProcedure.input(o.passwordManagersInputSchema).query(({input}) => o.detectPasswordManagers(input)),
    detectAISubscription: publicProcedure.query(() => o.detectAISubscription()),
    analyzeUserApps: publicProcedure.input(z.object({days: z.number().int().positive().optional(), limit: z.number().int().positive().optional()}).optional())
      .query(({input}) => o.analyzeUserApps(input)),
  };
}
