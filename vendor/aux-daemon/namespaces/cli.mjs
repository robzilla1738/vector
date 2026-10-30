/** The `cli` tRPC namespace: what the native `aux` CLI calls. `browserRoute` is Aux's routing of
 * `aux open|resolve|list` to a browser profile, by exact id or by the profile's native name; the
 * account must stay the same one the CLI started with. Profile bindings, the extension bridge,
 * skills and the REPL stay the supplied ones. */
const CHANGED = 'The selected profile binding changed; try again';

export function create({accountProcedure, publicProcedure, z, TRPCError, cli: c}) {
  const procedure = c.accountInstanceProcedure;
  const route = (ctx, binding, params) => c.sendCommandToExtension({method: 'Aux.routeBrowserLink', params},
    {accountId: ctx.accountId, profileId: binding.profileId, browserMode: 'default', windowId: binding.windowId, timeoutMs: 20000});

  const browserRoute = async ({input, ctx}) => {
    const currentAccount = () => c.assertAccountInstance(c.AccountRegistry.getAccount(ctx.accountId), ctx.accountCreatedAt);
    currentAccount();
    const profileIds = () => c.listCliBrowserProfiles(ctx.accountId).map(profile => profile.profileId);
    const candidates = c.listCliBrowserProfiles(ctx.accountId), selector = input.profile, candidateIds = candidates.map(profile => profile.profileId).sort();
    const authorized = id => profileIds().includes(id);
    const exactBinding = async id => {
      currentAccount();
      if (id && !authorized(id)) throw new TRPCError({code: 'CONFLICT', message: CHANGED});
      const binding = await c.resolveCliBrowserBinding(ctx.accountId, id);
      currentAccount();
      if (id && binding.profileId !== id || binding.browserMode !== 'default' || !authorized(binding.profileId)) throw new TRPCError({code: 'CONFLICT', message: CHANGED});
      return binding;
    };
    /** A profile's native name, or null when it cannot be read right now. */
    const nativeName = async candidate => {
      try {
        const binding = await exactBinding(candidate.profileId);
        currentAccount();
        const value = await route(ctx, binding, {operation: 'list', profile: binding.profileId});
        currentAccount();
        if (!authorized(candidate.profileId) || value?.ok !== true || value.profile?.id !== candidate.profileId || typeof value.profile.name !== 'string' || !value.profile.name.length) return null;
        return {id: candidate.profileId, name: value.profile.name};
      } catch {
        currentAccount();
        return null;
      }
    };

    let chosen = selector ? candidates.find(profile => profile.profileId === selector)?.profileId : undefined;
    if (selector && !chosen) {
      const profiles = await Promise.all(candidates.map(nativeName));
      currentAccount();
      if (JSON.stringify(candidateIds) !== JSON.stringify(profileIds().sort()))
        throw new TRPCError({code: 'CONFLICT', message: 'Profile bindings changed while resolving the name; try again'});
      if (profiles.some(profile => profile === null))
        throw new TRPCError({code: 'PRECONDITION_FAILED', message: 'Native profile names are unavailable; open the profiles or use an exact profile id from aux host profiles'});
      const matches = profiles.filter(profile => profile.name === selector);
      if (matches.length !== 1) throw new TRPCError({code: 'BAD_REQUEST',
        message: matches.length ? 'Profile name is ambiguous; use an exact profile id' : 'Profile name was not found; use an exact profile id or native profile name'});
      chosen = matches[0].id;
    }
    const binding = await exactBinding(chosen);
    const params = {operation: input.operation, ...input.url === undefined ? {} : {url: input.url}, ...selector ? {profile: binding.profileId} : {}, ...input.space ? {space: input.space} : {}};
    currentAccount();
    const result = await route(ctx, binding, params);
    currentAccount();
    return result;
  };

  return {
    browserRoute: procedure.input(z.object({operation: z.enum(['open', 'resolve', 'list']), url: z.string().max(16384).optional(), profile: z.string().max(256).optional(), space: z.string().max(256).optional()}))
      .mutation(browserRoute),
    replDescription: publicProcedure.query(() => c.replDescription),
    browserProfiles: accountProcedure.query(({ctx}) => c.listCliBrowserProfiles(ctx.accountId)),
    resolveBrowserBinding: accountProcedure.input(z.object({profileId: z.string().min(1)})).query(({input, ctx}) => c.resolveCliBrowserBinding(ctx.accountId, input.profileId)),
    skillsList: accountProcedure.query(async ({ctx}) => (await c.listCliSkills(ctx.accountId)).map(({name, description}) => ({name, description}))),
    skillsShow: accountProcedure.input(z.object({name: z.string().min(1)})).query(async ({input, ctx}) => {
      const skill = (await c.listCliSkills(ctx.accountId)).find(candidate => candidate.name === input.name);
      if (!skill) throw new TRPCError({code: 'NOT_FOUND', message: `Unknown skill: ${input.name}. Run 'aux skills list'.`});
      return {name: skill.name, description: skill.description, body: skill.body, path: skill.path};
    }),
    replStart: procedure.input(z.object({profileId: z.string().min(1).optional()})).mutation(async ({ctx, input}) => {
      const id = c.nanoid(), session = await c.createCliReplSession(id, ctx.accountId, ctx.accountCreatedAt, input.profileId);
      c.replSessions.set(id, session);
      return {id, sessionDir: session.sessionDir, idempotentRuns: true};
    }),
    replRun: procedure.input(z.object({id: z.string(), code: z.string().min(1), runId: z.string().min(1).max(128).optional()})).mutation(async ({input, ctx}) => {
      const session = c.getCliReplSession(input.id, ctx.accountId, ctx.accountCreatedAt);
      clearTimeout(session.cleanupTimer);
      session.cleanupTimer = c.scheduleIdleCleanup(input.id);
      if (!input.runId) return await c.runInCliReplSession(session, input.code);
      const earlier = session.runs.get(input.runId);
      if (earlier) return await earlier;
      const run = c.runInCliReplSession(session, input.code);
      session.runs.set(input.runId, run);
      if (session.runs.size > c.rememberedRuns) session.runs.delete(session.runs.keys().next().value);
      return await run;
    }),
    replState: procedure.input(z.object({id: z.string()})).query(({input, ctx}) => c.getCliReplSession(input.id, ctx.accountId, ctx.accountCreatedAt).toolState),
    replClose: publicProcedure.input(z.object({accountId: z.number().int().nonnegative(), accountCreatedAt: z.number().int().nonnegative().optional(), id: z.string()})).mutation(async ({input}) => {
      const session = c.replSessions.get(input.id);
      if (!session) return {ok: true};
      if (session.accountId !== input.accountId || input.accountCreatedAt !== undefined && session.accountCreatedAt !== input.accountCreatedAt) throw Error('REPL session not found');
      await c.closeCliReplSession(input.id);
      return {ok: true};
    }),
  };
}
