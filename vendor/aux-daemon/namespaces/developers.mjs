/** The `developers` tRPC namespace: the `aux` CLI install and the aux-browser skill that local
 * agents read. The skill text, installer and target directories stay the supplied ones. */
export function create({publicProcedure, z, developers: d}) {
  return {
    getAuxBrowserSkill: publicProcedure.query(() => ({filename: 'SKILL.md', content: d.skill})),
    checkCliInstallation: publicProcedure.query(async () => d.cliStatus()),
    installCli: publicProcedure.mutation(async () => {
      await d.installCli();
      await d.refreshSkills().catch(() => undefined);
      return d.cliStatus();
    }),
    checkAgentInstallations: publicProcedure.query(() => ({agents: d.listAgentInstallations(), general: d.generalSkillInstallation()})),
    installAuxBrowserSkill: publicProcedure.input(z.object({id: d.targetIdSchema})).mutation(async ({input}) => input.id === 'general'
      ? {paths: await Promise.all(d.installedSkillTargetDirs().map(d.writeSkill)), version: 3}
      : {paths: [await d.writeSkill(d.skillTargetDir(input.id))], version: 3}),
    refreshAuxBrowserSkills: publicProcedure.mutation(async () => ({paths: await d.refreshSkills()})),
  };
}
