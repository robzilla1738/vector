/** The `settings` tRPC namespace: account settings, the agent's profile and its `aux ask` chat (Aux's
 * agent layer), the agent context files, and the completion sound. The settings store, the agent
 * module and its entry helpers, and the side effects of particular keys stay the supplied ones. */
import {readFileSync} from 'node:fs';
import path from 'node:path';

export function create({accountProcedure, z, TRPCError, settings: s}) {
  const accountSettings = accountId => s.settings(accountId);

  /** Keys whose change reaches beyond the store: cloud sync, Context Awareness, routines, the sidebar. */
  const set = async ({ctx, input}) => {
    const {accountId, account} = ctx;
    if (input.key === 'experimental') {
      const current = accountSettings(accountId).get('experimental');
      if (input.value.sync !== current.sync && account.mode === 'cloud' && account.authStatus === 'active' && account.userId != null)
        await s.putRemoteUserSettings(accountId, {sync: input.value.sync});
    }
    if (input.key === 'contextAwareness' && input.value.enabled) {
      if (!s.isContextAwarenessSupported()) throw new TRPCError({code: 'BAD_REQUEST', message: 'Context Awareness is not available on this platform.'});
      if (!s.accountHasAllowedPlan(account, s.contextAwarenessPlans) && !await s.isAccountExperimentalEligible(accountId))
        throw new TRPCError({code: 'PAYMENT_REQUIRED', message: 'Context Awareness requires the Max plan.'});
    }
    if (input.key === 'timezone' && account.mode === 'cloud') await s.putRemoteUserSettings(accountId, {timezone: input.value});
    const result = accountSettings(accountId).set(input.key, () => input.value);
    if (input.key === 'contextAwareness') await s.reconcileContextAwareness(accountId);
    if (input.key === 'timezone') s.refreshRoutineTimezone(accountId);
    if (input.key === 'sidebarRecentChatLimit') s.RecentSessionsStore.loadCache(accountId);
    return result;
  };

  return {
    get: accountProcedure.input(z.object({key: z.string()})).query(async ({ctx, input}) => accountSettings(ctx.accountId).get(input.key)),
    getAll: accountProcedure.query(async ({ctx}) => accountSettings(ctx.accountId).getAll()),
    set: accountProcedure.input(s.setInputSchema).mutation(set),
    agentGet: accountProcedure.query(({ctx}) => s.auxAgentView(ctx.accountId)),
    agentUpdate: accountProcedure.input(z.object({name: z.string().max(200).optional(), setupCompleted: z.boolean().optional()})).mutation(async ({ctx, input}) => {
      const previousName = s.auxAgent.read(ctx.accountId).name;
      s.auxAgent.update(ctx.accountId, input);
      await s.auxAgentApply(ctx.accountId, previousName);
      return s.auxAgentView(ctx.accountId);
    }),
    agentAvatar: accountProcedure.input(z.object({revision: z.string().max(64)})).query(({ctx}) => ({dataUrl: s.auxAgent.avatarDataUrl(ctx.accountId)})),
    agentSetAvatar: accountProcedure.input(z.object({dataUrl: z.string().max(11e5)})).mutation(({ctx, input}) => {
      try {
        s.auxAgent.setAvatar(ctx.accountId, input.dataUrl);
      } catch (error) {
        throw new TRPCError({code: 'BAD_REQUEST', message: error.message});
      }
      return s.auxAgentView(ctx.accountId);
    }),
    agentClearAvatar: accountProcedure.mutation(({ctx}) => {
      s.auxAgent.clearAvatar(ctx.accountId);
      return s.auxAgentView(ctx.accountId);
    }),
    agentSetHome: accountProcedure.input(z.object({sessionId: z.string().min(1)})).mutation(async ({ctx, input}) => {
      const view = s.auxAgentView(ctx.accountId);
      if (view.homeSessionId) return view;
      const session = s.SessionStore.get(ctx.accountId, input.sessionId);
      if (!session || session.parentId || !s.auxAgentUsable(session)) throw new TRPCError({code: 'BAD_REQUEST', message: 'This chat cannot be the agent home.'});
      s.auxAgent.setAskChat(ctx.accountId, session.id);
      await s.auxAgentApply(ctx.accountId);
      return s.auxAgentView(ctx.accountId);
    }),
    readContextFile: accountProcedure.input(z.object({fileName: s.contextFileSchema})).query(({ctx, input}) => {
      try {
        return {content: readFileSync(path.join(s.getAccountTaskRoot(ctx.accountId), input.fileName), 'utf-8')};
      } catch {
        return {content: ''};
      }
    }),
    writeContextFile: accountProcedure.input(z.object({fileName: s.contextFileSchema, content: z.string()})).mutation(({ctx, input}) => {
      s.auxAgentWriteContext(ctx.accountId, input.fileName, input.content);
      return {success: true};
    }),
    getCompletionSound: accountProcedure.query(({ctx}) => s.readCompletionSound(ctx.accountId, accountSettings(ctx.accountId).get('completionSound'))),
    setCompletionSound: accountProcedure.input(z.object({fileName: z.string().min(1).max(255), mimeType: z.string().min(1), data: z.string().min(1)})).mutation(({ctx, input}) => {
      try {
        const written = s.writeCompletionSound(ctx.accountId, input);
        return accountSettings(ctx.accountId).set('completionSound', sound => ({...sound, customFileName: written.fileName}));
      } catch (error) {
        throw new TRPCError({code: 'BAD_REQUEST', message: error instanceof Error ? error.message : 'Failed to save completion sound.'});
      }
    }),
    resetCompletionSound: accountProcedure.mutation(({ctx}) => {
      s.deleteCompletionSound(ctx.accountId);
      return accountSettings(ctx.accountId).set('completionSound', sound => ({enabled: sound.enabled}));
    }),
  };
}
