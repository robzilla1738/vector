/** The `agentRuntime` tRPC namespace: status and install of the agent runtime. The installer and
 * its job state stay the supplied ones until the runtime itself is rebuilt (Batch 10 item 1). */
export function create({publicProcedure, z, agentRuntime: r}) {
  return {
    status: publicProcedure.output(r.statusSchema).query(() => r.status()),
    job: publicProcedure.output(r.jobSchema).query(() => r.job()),
    install: publicProcedure.input(z.object({force: z.boolean()}).strict()).output(r.jobSchema).mutation(({input}) => r.install({force: input.force})),
  };
}
