/** The `analytics` tRPC namespace: product analytics events, error reports and feature flags for
 * the account. The analytics client stays the supplied one. */
export function create({accountProcedure, z, analytics: a}) {
  return {
    identify: accountProcedure.input(z.object({appVersion: z.string().trim().min(1)})).mutation(({ctx, input}) => a.updateUserProfile(ctx.accountId, input.appVersion)),
    capture: accountProcedure.input(z.object({event: z.string(), properties: a.propertiesSchema})).mutation(({ctx, input}) => {
      a.posthog(ctx.accountId).capture(input);
    }),
    captureException: accountProcedure.input(z.object({name: z.string().optional(), message: z.string(), stack: z.string().optional(), properties: a.propertiesSchema}))
      .mutation(({ctx, input}) => {
        const error = Error(input.message);
        if (input.name) error.name = input.name;
        if (input.stack) error.stack = input.stack;
        a.posthog(ctx.accountId).captureException(error, input.properties);
      }),
    isFeatureEnabled: accountProcedure.input(z.object({key: z.string()})).query(({ctx, input}) => a.posthog(ctx.accountId).isFeatureEnabled(input.key)),
    isExperimentalEligible: accountProcedure.query(({ctx}) => a.isAccountExperimentalEligible(ctx.accountId)),
  };
}
