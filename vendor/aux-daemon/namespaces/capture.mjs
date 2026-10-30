/** The `capture` tRPC namespace: page screenshots for a document the caller holds a capability
 * for. The CDP capture itself stays the supplied one. */
export function create({publicProcedure, z, capture: c}) {
  const target = z.object({targetId: z.string().min(1), documentCapability: z.string().uuid()});
  return {
    fullPage: publicProcedure.input(target).mutation(async ({input}) => c.fullPage(input)),
    viewport: publicProcedure.input(target).mutation(async ({input}) => c.viewport(input)),
  };
}
