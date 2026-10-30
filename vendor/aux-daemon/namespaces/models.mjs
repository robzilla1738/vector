/** The `models` tRPC namespace: model listings and catalogs, credentials, custom providers,
 * routing, subscription usage, the provider CLI status, Aux's download name and tab productivity
 * requests, and the OAuth flow procedures as the release keeps them (Aux registers no sign-in
 * providers, so the flow manager has none to start). The model registry, flow manager and
 * request runners stay the supplied ones. */
export function create({accountProcedure, z, TRPCError, models: m}) {
  const request = {requestId: z.string().uuid(), profileId: z.string().min(1).max(256)};
  const registry = accountId => m.models(accountId);
  /** Runs a change on the account's models, then keeps routing pointed at models that exist. */
  const thenReroute = change => async ({ctx, input}) => {
    const models = registry(ctx.accountId);
    await change(models, input);
    await models.rewriteRoutingSelectionsToAvailableModels();
  };
  const modelIds = z.array(z.string().min(1)).min(1);
  const setCredential = async ({ctx, input}) => {
    if (m.isUnsupportedProviderId(input.providerId)) throw new TRPCError({code: 'BAD_REQUEST', message: `Provider is not supported: ${input.providerId}`});
    const models = registry(ctx.accountId);
    models.credentials.set(input.providerId, input.credential);
    if (input.providerId === 'openrouter' && !models.listOpenRouterModelIds().length) await models.setOpenRouterModelIds(['openrouter/auto']);
    if (input.providerId === 'commandcode') {
      try {
        await models.refreshCommandCodeModels(true);
      } catch (error) {
        if (!(error instanceof m.CommandCodeModelsError)) throw error;
        throw new TRPCError({code: error.status === 401 ? 'UNAUTHORIZED' : error.status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message});
      }
    }
    await models.rewriteRoutingSelectionsToAvailableModels();
  };
  const subscriptionUsage = async ({ctx, input}) => {
    const state = () => registry(ctx.accountId).credentials.getState(input.providerId);
    try {
      const usage = await registry(ctx.accountId).getSubscriptionUsage(input.providerId);
      return {providerId: input.providerId, usage, state: state()};
    } catch (error) {
      m.logger.warn('[models] Failed to fetch subscription usage', {accountId: ctx.accountId, providerId: input.providerId, error});
      return {providerId: input.providerId, usage: null, state: state()};
    }
  };
  /** OAuth failures are reported before they reach the caller. */
  const reported = (stage, run) => async ({ctx, input}) => {
    try {
      return await run(ctx, input);
    } catch (error) {
      m.captureOAuthFailure(ctx.accountId, {providerId: input.providerId, stage, error});
      throw error;
    }
  };
  const repairWhenCompleted = async (accountId, flow) => {
    if (flow.status === 'completed') await m.repairRoutingSelectionsAfterOAuth(accountId, flow.providerId);
    return flow;
  };
  return {
    downloadNameProposal: accountProcedure.input(z.object({...request, filename: z.string().min(1).max(400), mime: z.string().max(200), sourceHost: z.string().max(253)}))
      .mutation(({ctx, input}) => m.runDownloadNameRequest(ctx.accountId, input, ctx.account)),
    downloadNameCancel: accountProcedure.input(z.object(request)).mutation(({ctx, input}) => m.cancelDownloadNameRequest(ctx.accountId, input, ctx.account)),
    productivityPlan: accountProcedure.input(z.object({...request,
      tabs: z.array(z.object({id: z.string().min(1).max(64), title: z.string().max(512), origin: z.string().max(2048)})).min(2).max(128), customPrompt: z.string().max(2000).optional()}))
      .mutation(({ctx, input}) => m.runProductivityRequest(ctx.accountId, input, ctx.account)),
    productivityCancel: accountProcedure.input(z.object(request)).mutation(({ctx, input}) => m.cancelProductivityRequest(ctx.accountId, input, ctx.account)),
    listSupported: accountProcedure.query(async ({ctx}) => await registry(ctx.accountId).listSupportedAsync()),
    listAvailable: accountProcedure.query(async ({ctx}) => await registry(ctx.accountId).listAvailable()),
    listAvailableImages: accountProcedure.query(async ({ctx}) => await registry(ctx.accountId).listAvailableImageModels()),
    listCredentials: accountProcedure.query(async ({ctx}) => await m.listCredentialItems(registry(ctx.accountId))),
    listSettingsInventory: accountProcedure.query(async ({ctx}) => await registry(ctx.accountId).listSettingsInventory()),
    listOpenRouterModelIds: accountProcedure.query(({ctx}) => registry(ctx.accountId).listOpenRouterModelIds()),
    getCredentialStatus: accountProcedure.input(z.object({providerId: z.string().min(1)})).query(({ctx, input}) => {
      const credentials = registry(ctx.accountId).credentials;
      return {exists: credentials.hasAuth(input.providerId), type: credentials.get(input.providerId)?.type ?? null};
    }),
    addCustom: accountProcedure.input(m.customModelSchema).mutation(thenReroute((models, input) => models.addCustomModel(input))),
    removeCustom: accountProcedure.input(z.object({modelId: z.string().min(1)})).mutation(thenReroute((models, input) => models.removeCustomModel(input.modelId))),
    discoverCustomProviderModels: accountProcedure.input(m.discoveryInputSchema).query(async ({input}) => await m.discoverLocalProviderModels(input)),
    setCustomProvidersConfig: accountProcedure.input(m.customProvidersConfigSchema).mutation(thenReroute((models, input) => {
      for (const [providerId, config] of Object.entries(input.providers))
        models.setModelsJsonProvider(providerId, m.preserveExistingCustomProviderSecrets(config, models.getModelsJsonProvider(providerId)));
    })),
    getCustomProviderConfig: accountProcedure.input(z.object({providerId: m.uiManagedCustomProviderIdSchema})).query(({ctx, input}) => {
      const config = registry(ctx.accountId).getModelsJsonProvider(input.providerId);
      return {providerConfig: config ? m.redactCustomProviderConfigForUi(m.customProviderConfigSchema.parse(config)) : null};
    }),
    removeCustomProviderConfig: accountProcedure.input(z.object({providerId: z.string().min(1)})).mutation(thenReroute((models, input) => models.removeModelsJsonProvider(input.providerId))),
    listAuxModelIds: accountProcedure.query(async ({ctx}) => await registry(ctx.accountId).listAuxModelIds()),
    searchAuxModels: accountProcedure.input(z.object({query: z.string()})).query(async ({ctx, input}) => await registry(ctx.accountId).searchAuxModels(input.query)),
    setAuxModelIds: accountProcedure.input(z.object({modelIds})).mutation(async ({ctx, input}) => await registry(ctx.accountId).setAuxModelIds(input.modelIds)),
    listAiGatewayModelIds: accountProcedure.input(z.object({providerId: m.aiGatewayProviderIdSchema})).query(({ctx, input}) => registry(ctx.accountId).listAiGatewayModelIds(input.providerId)),
    searchAiGatewayModels: accountProcedure.input(z.object({providerId: m.aiGatewayProviderIdSchema, query: z.string()}))
      .query(async ({ctx, input}) => await registry(ctx.accountId).searchAiGatewayModels(input.providerId, input.query)),
    setAiGatewayModelIds: accountProcedure.input(z.object({providerId: m.aiGatewayProviderIdSchema, modelIds}))
      .mutation(async ({ctx, input}) => await registry(ctx.accountId).setAiGatewayModelIds(input.providerId, input.modelIds)),
    searchOpenRouterModels: accountProcedure.input(z.object({query: z.string()})).query(async ({ctx, input}) => await registry(ctx.accountId).searchOpenRouterModels(input.query)),
    setOpenRouterModelIds: accountProcedure.input(z.object({modelIds})).mutation(async ({ctx, input}) => {
      await registry(ctx.accountId).setOpenRouterModelIds(input.modelIds);
    }),
    ensureRoutingSelectionsAvailable: accountProcedure.mutation(async ({ctx}) => await registry(ctx.accountId).rewriteRoutingSelectionsToAvailableModels()),
    setCredential: accountProcedure.input(m.setCredentialInputSchema).mutation(setCredential),
    removeCredential: accountProcedure.input(z.object({providerId: z.string().min(1)})).mutation(thenReroute((models, input) => models.removeCredential(input.providerId))),
    getSubscriptionUsage: accountProcedure.input(z.object({providerId: z.enum(['aux', 'claude-code', 'kimi-code', 'openai-codex', 'xai-grok-oauth'])})).query(subscriptionUsage),
    listOAuthProviders: accountProcedure.query(({ctx}) => m.oauthFlowManager(ctx.accountId).listProviders()),
    oauthAuthorize: accountProcedure.input(z.object({providerId: z.string().min(1), redirectUri: m.url().optional(), kimiRegion: z.enum(['global', 'mainland-cn']).optional()}))
      .mutation(reported('authorize', (ctx, input) => m.oauthFlowManager(ctx.accountId).authorize(input.providerId, input.redirectUri, input.kimiRegion))),
    oauthCallback: accountProcedure.input(z.object({flowId: z.string().min(1), providerId: z.string().min(1).optional(), code: z.string().optional()}))
      .mutation(reported('callback', async (ctx, input) => repairWhenCompleted(ctx.accountId, await m.oauthFlowManager(ctx.accountId).callback(input.flowId, input.code)))),
    oauthStatus: accountProcedure.input(z.object({flowId: z.string().min(1), providerId: z.string().min(1).optional(), focusWindow: z.boolean().optional()})).mutation(async ({ctx, input}) => {
      if (input.focusWindow) await m.oauthFlowManager(ctx.accountId).focusWindow(input.flowId);
      return repairWhenCompleted(ctx.accountId, m.oauthFlowManager(ctx.accountId).status(input.flowId));
    }),
    oauthCancel: accountProcedure.input(z.object({flowId: z.string().min(1)})).mutation(({ctx, input}) => m.oauthFlowManager(ctx.accountId).cancel(input.flowId)),
    providerCliStatus: accountProcedure.query(() => m.providerCli.status()),
    providerCliRefresh: accountProcedure.mutation(() => m.providerCli.status({refresh: true})),
  };
}
