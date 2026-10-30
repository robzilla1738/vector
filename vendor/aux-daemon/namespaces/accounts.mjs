/** The `accounts` tRPC namespace: the local account registry, browser profile bindings, CLI device
 * code approval, and the `auth` router for the Aux cloud account. Sign-in, tokens, device trust,
 * sync keys and their Keychain items stay entirely in the supplied auth functions; this module
 * passes them the same validated inputs and adds no state of its own. */
export function create({accountProcedure, publicProcedure, z, TRPCError, accounts: a}) {
  const accountId = z.number().int().nonnegative();
  const body = schema => schema.meta({param: {in: 'body'}});
  const profileContext = a.chromiumProfileContextSchema;

  const removeProfileBinding = async ({input}) => {
    let removedAccount;
    const result = a.AccountRegistry.removeProfileBinding(input, account => { removedAccount = account; });
    if (result?.removedAccountId !== undefined) {
      if (!removedAccount) throw Error(`Removed account ${result.removedAccountId} not found`);
      a.logger.warn('[accounts] Removing account after its browser profile was deleted', {accountId: result.removedAccountId, profileId: input.profileId, profilePath: input.profilePath});
      await a.forgetAccountBootstrap(result.removedAccountId);
      await a.removeAccountLocalArtifacts(removedAccount, a.removeContextAwarenessAccount);
      a.detachPwmProfile(result.removedAccountId);
    }
    a.reconcileContextAwareness();
    return result;
  };

  const auth = {
    prepareSignIn: publicProcedure.input(z.object({email: a.email().optional(), profileContext})).mutation(async ({input}) => {
      if ((input.profileContext.bindingVersion ?? 0) < 1) throw new TRPCError({code: 'BAD_REQUEST', message: 'A browser-owned profile context is required.'});
      const account = a.prepareChromiumSignIn(input.profileContext, input.email);
      await a.ensureAccountBootstrapped(account);
      return {accountId: account.id};
    }),
    startEmailAuth: publicProcedure.input(z.object({accountId, email: a.email(), intent: z.enum(['start', 'resend']).default('start'), signInAttemptId: a.uuid().optional(),
      profileContext: profileContext.optional()}))
      .mutation(({input}) => a.startEmailAuth(input.accountId, input.email, input.intent, input.signInAttemptId, input.profileContext)),
    verifyEmailCode: publicProcedure.input(z.object({accountId, email: a.email(), code: z.string().trim().regex(/^\d{6}$/), profileContext: profileContext.optional(),
      signInAttemptId: a.uuid().optional()}))
      .mutation(({input}) => a.verifyEmailCode(input.accountId, input.email, input.code, input.profileContext, input.signInAttemptId)),
    exchangeToken: publicProcedure.input(z.object({accountId, supabaseAccessToken: z.string().min(1), profileContext: profileContext.optional(), signInAttemptId: a.uuid().optional()}))
      .mutation(({input}) => a.exchangeToken(input.accountId, input.supabaseAccessToken, input.profileContext, input.signInAttemptId)),
    startGoogleOAuth: publicProcedure.input(z.object({accountId, profileContext: profileContext.optional(), returnUrl: a.url().refine(a.isAllowedGoogleOAuthReturnUrl).optional()}))
      .mutation(({input}) => a.startGoogleOAuth(input.accountId, input.profileContext, input.returnUrl)),
    cancelGoogleOAuth: publicProcedure.input(z.object({oauthAttemptId: z.string().min(1)})).mutation(({input}) => {
      a.clearPendingGoogleOAuthAttempt(input.oauthAttemptId);
      return {success: true};
    }),
    signOut: publicProcedure.input(z.object({accountId, strategy: a.signOutStrategySchema.optional()})).mutation(({input}) => a.signOut(input.accountId, input.strategy)),
    deleteAccount: publicProcedure.input(z.object({accountId})).mutation(async ({input}) => {
      await a.forgetAccountBootstrap(input.accountId);
      const registry = await a.deleteAccount(input.accountId, a.removeContextAwarenessAccount);
      a.detachPwmProfile(input.accountId);
      a.reconcileContextAwareness(registry.currentAccountId);
      return registry;
    }),
    me: publicProcedure.input(z.object({accountId})).query(({input}) => a.fetchCurrentUser(input.accountId)),
    devices: accountProcedure.query(({input}) => a.fetchAccountDevices(input.accountId)),
    signOutDevice: accountProcedure.input(z.object({deviceId: a.uuid()})).mutation(({input}) => a.signOutAccountDevice(input.accountId, input.deviceId)),
    updateProfile: publicProcedure.input(z.object({accountId, name: z.string().trim().min(1)})).mutation(({input}) => a.updateCurrentUserProfile(input.accountId, input.name)),
    syncKeyStatus: accountProcedure.query(({input}) => a.fetchAccountSyncKeyStatus(input.accountId)),
    enrollSyncKeyRecovery: accountProcedure.input(z.object({recoveryEntropyB64: z.string().min(1).optional(), expectedUserId: z.string().min(1).optional(),
      expectedSyncGeneration: z.number().int().nonnegative().optional()}))
      .mutation(({input}) => a.enrollAccountSyncKeyRecovery(input.accountId, input.recoveryEntropyB64, {userId: input.expectedUserId, generation: input.expectedSyncGeneration})),
    recoverSyncKey: accountProcedure.input(z.object({recoveryEntropyB64: z.string().min(1)})).mutation(({input}) => a.recoverAccountSyncKey(input.accountId, input.recoveryEntropyB64)),
    completeOnboarding: accountProcedure.mutation(async ({input}) => {
      try {
        return await a.completeOnboarding(input.accountId);
      } catch (error) {
        a.logger.alert('[Accounts] completeOnboarding failed', {accountId: input.accountId, error});
        throw error;
      }
    }),
  };

  return {
    deviceCodePending: a.deviceCodeUiProcedure.query(({ctx}) => a.deviceCodePending(ctx.account)),
    deviceCodeLookup: a.deviceCodeUiProcedure.input(a.deviceCodeLookupSchema).mutation(({ctx, input}) => a.deviceCodeLookup(ctx.account, input)),
    deviceCodeDecide: a.deviceCodeUiProcedure.input(a.deviceCodeDecisionSchema).mutation(({ctx, input}) => a.deviceCodeDecide(ctx.account, input)),
    list: publicProcedure.query(() => a.AccountRegistry.getAll()),
    summary: publicProcedure.query(() => {
      const registry = a.AccountRegistry.getAll();
      return {currentAccountId: registry.currentAccountId, accounts: registry.accounts.map(account => ({...account, hasSession: !!registry.sessions[String(account.id)],
        profileBindings: Object.values(registry.profileAccountBindings).filter(binding => binding.accountId === account.id)
          .map(({profileId, profileIndex, profilePath, updatedAt}) => ({profileId, profileIndex, profilePath, updatedAt}))}))};
    }),
    get: publicProcedure.input(z.object({accountId})).query(({input}) => a.AccountRegistry.getAccount(input.accountId)),
    current: publicProcedure.query(() => ({accountId: a.AccountRegistry.getCurrentAccountId()})),
    apiAccessToken: accountProcedure.query(async ({ctx}) => {
      if (!a.isConnectedFromLocalhost(ctx.honoCtx)) throw new TRPCError({code: 'FORBIDDEN', message: 'Forbidden'});
      return {token: await a.getValidAccessToken(ctx.accountId)};
    }),
    syncProfileMetadata: accountProcedure.mutation(async ({ctx, input}) => {
      if (ctx.account.mode !== 'cloud' || ctx.account.authStatus !== 'active' || !ctx.account.userId) throw new a.AuthorizationError('Sign in to continue.');
      await a.fetchAuxAPIAuthenticatedJson(input.accountId, '/profile/metadata', {method: 'POST', output: z.unknown(), timeoutMs: 2e4});
    }),
    bindProfile: publicProcedure.meta({method: 'POST', path: '/accounts/profile-binding'}).input(z.object({profileId: body(z.string().min(1)), userId: body(z.string().min(1)),
      accountId: body(accountId.optional()), profileIndex: body(z.number().int().nonnegative().optional()), profilePath: body(z.string().optional())}))
      .mutation(({input}) => a.AccountRegistry.upsertProfileBinding(input)),
    removeProfileBinding: publicProcedure.meta({method: 'POST', path: '/accounts/profile-binding/delete'})
      .input(z.object({profileId: body(z.string().min(1).optional()), profilePath: body(z.string().optional())})
        .refine(binding => binding.profileId !== undefined || binding.profilePath !== undefined, {message: 'profileId or profilePath is required'}))
      .mutation(removeProfileBinding),
    ensureProfileAccount: publicProcedure.input(profileContext).mutation(({input}) => a.ensureProfileAccount(input)),
    resolveProfileAccount: publicProcedure.input(profileContext).mutation(({input}) => a.ensureProfileAccount(input)),
    resolveProfileAccountByProfile: publicProcedure.input(profileContext).query(({input}) => a.ensureProfileAccount(input)),
    setCurrent: publicProcedure.input(z.object({accountId})).mutation(({input}) => {
      a.AccountRegistry.setCurrentAccountId(input.accountId);
      a.reconcileContextAwareness(input.accountId);
      return {accountId: input.accountId};
    }),
    add: publicProcedure.input(z.object({name: z.string(), provider: a.providerSchema, mode: a.modeSchema, userId: z.string().optional(), email: z.string().optional()}))
      .mutation(async ({input}) => {
        const account = a.AccountRegistry.addAccount(input);
        await a.ensureAccountBootstrapped(account);
        return account;
      }),
    update: publicProcedure.input(z.object({accountId, name: z.string().optional(), provider: a.providerSchema.optional(), mode: a.modeSchema.optional(),
      userId: z.string().optional(), email: z.string().optional(), profileUrl: z.string().url().optional()})).mutation(({input}) => {
      const {accountId: id, ...changes} = input;
      return a.AccountRegistry.updateAccount(id, changes);
    }),
    auth,
  };
}
