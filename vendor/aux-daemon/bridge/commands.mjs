/** The extension bridge's protocol: every `Aux.*` command's request and response schema and the
 * WebSocket messages around them. The commands that carry credentials or cookies (password managers,
 * Apple Passwords, cookie sync) stay in the supplied namespace; `adopt` adds them to the unions here,
 * in the supplied order. fixtures/aux-daemon/bridge.json is the reference. */
export function create({z, bridge: b}) {
  const commands = {};
  const ei = commands.openBrowserTabSchema = z.object({id:z.string(),targetId:z.string(),url:z.string(),title:z.string().default(``),faviconUrl:z.string().default(``),active:z.boolean().default(false),windowId:z.number().int(),focusedWindow:z.boolean().optional(),group:z.object({id:z.number().int(),title:z.string()}).optional()});
  const ti = commands.listTabsRequestSchema = z.object({method:z.literal(`Aux.listTabs`),params:z.object({accountId:z.number().int().nonnegative().optional(),groupWindowId:z.number().int().nonnegative().optional(),extensionId:z.string().regex(/^[a-p]{32}$/).optional()})});
  commands.listTabsResponseSchema=z.object({items:z.array(ei)});
  const ni = commands.ownsTargetRequestSchema = z.object({method:z.literal(`Aux.ownsTarget`),params:z.object({targetId:z.string().trim().min(1)})});
  commands.ownsTargetResponseSchema=z.object({owned:z.boolean()});
  const ri = commands.createAgentTabRequestSchema = z.object({method:z.literal(`Aux.createAgentTab`),params:z.object({url:z.string().trim().min(1),anchorTargetId:z.string().trim().min(1).optional()})});
  commands.createAgentTabResponseSchema=z.object({targetId:z.string().trim().min(1),tabId:z.number().int().nonnegative(),windowId:z.number().int()});
  const ii = commands.resolveBindingWindowRequestSchema = z.object({method:z.literal(`Aux.resolveBindingWindow`),params:z.object({})});
  const ai = z.object({windowCount:z.number().int().nonnegative(),windowCountByType:z.record(z.string(),z.number().int().nonnegative()),tabCount:z.number().int().nonnegative(),lastFocusedError:z.string().optional()});
  commands.resolveBindingWindowResponseSchema=z.discriminatedUnion(`status`,[z.object({status:z.literal(`ok`),windowId:z.number().int(),via:z.enum([`last-focused`,`single-window`,`focused-flag`]),anchorTargetId:z.string().trim().min(1).optional(),diagnostics:ai}),z.object({status:z.literal(`no-normal-window`),diagnostics:ai}),z.object({status:z.literal(`tabs-without-normal-window`),diagnostics:ai}),z.object({status:z.literal(`ambiguous-windows`),candidateWindowIds:z.array(z.number().int()).min(2),diagnostics:ai})]);
  const oi = commands.searchHistoryRequestSchema = z.object({method:z.literal(`Aux.searchHistory`),params:z.object({query:z.string().trim().default(``),startTime:z.number().positive().optional(),endTime:z.number().positive().optional(),maxResults:z.number().int().positive().optional()})});
  commands.searchHistoryResponseSchema=z.object({items:z.array(z.object({id:z.string(),url:z.string(),title:z.string().default(``),faviconUrl:z.string().default(``),visitCount:z.number().nonnegative().default(0),typedCount:z.number().nonnegative().default(0),lastVisitTime:z.number().default(0)}))});
  const si = commands.getThirdPartyCookiesRequestSchema = z.object({method:z.literal(`Aux.getThirdPartyCookies`),params:z.object({})});
  commands.thirdPartyCookiesSettingResponseSchema=z.object({value:z.enum([`allow`,`block`]).nullable(),levelOfControl:z.enum([`not_controllable`,`controlled_by_other_extensions`,`controllable_by_this_extension`,`controlled_by_this_extension`]).nullable(),isAvailable:z.boolean()});
  const ci = commands.setThirdPartyCookiesRequestSchema = z.object({method:z.literal(`Aux.setThirdPartyCookies`),params:z.object({value:z.enum([`allow`,`block`])})});
  commands.setThirdPartyCookiesResponseSchema=z.object({success:z.boolean().default(true)});
  const li = commands.ensureTabInAiTabsGroupRequestSchema = z.object({method:z.literal(`Aux.ensureTabInAiTabsGroup`),params:z.object({targetId:z.string().trim().min(1)})});
  commands.ensureTabInAiTabsGroupResponseSchema=z.object({success:z.boolean().default(true),groupId:z.number().int().nonnegative(),tabId:z.number().int().nonnegative()});
  const ui = commands.controlTabRequestSchema = z.object({method:z.literal(`Aux.controlTab`),params:z.discriminatedUnion(`action`,[z.object({action:z.literal(`open`),url:z.string().trim().min(1),targetId:z.string().trim().min(1).optional()}),z.object({action:z.literal(`close`),targetId:z.string().trim().min(1).optional(),url:z.string().trim().min(1).optional(),skipIfActive:z.boolean().optional()})])});
  commands.controlTabResponseSchema=z.object({success:z.boolean().default(true),action:z.enum([`open`,`close`]),created:z.boolean().optional(),closed:z.boolean().optional(),tabId:z.number().int().nonnegative().optional(),targetId:z.string().trim().min(1).optional()});
  const di = commands.waitForDownloadRequestSchema = z.object({method:z.literal(`Aux.waitForDownload`),params:z.object({startedAfterMs:z.number().int().nonnegative(),timeoutMs:z.number().int().positive().optional(),expectedFilename:z.string().trim().min(1).optional(),referrerUrl:z.string().trim().min(1).optional()})});
  commands.waitForDownloadResponseSchema=z.object({downloadId:z.number().int().nonnegative(),absolutePath:z.string().trim().min(1)});
  const fi = z.enum([`notification`,`success`]);
  const pi = z.object({mimeType:z.string().min(1),data:z.string().min(1)});
  const mi = commands.showNotificationRequestSchema = z.object({method:z.literal(`Aux.showNotification`),params:z.object({title:z.string().min(1),message:z.string().min(1),contextMessage:z.string().optional(),clickPath:z.string().trim().startsWith(`/`).optional(),type:z.enum([`basic`,`image`,`list`,`progress`]).default(`basic`),requireInteraction:z.boolean().optional(),silent:z.boolean().optional(),sound:fi.optional(),customSound:pi.optional(),buttons:z.array(z.object({title:z.string().min(1)})).max(2).optional(),imageUrl:z.string().optional(),progress:z.number().int().min(0).max(100).optional(),items:z.array(z.object({title:z.string(),message:z.string()})).optional()})});
  commands.showNotificationResponseSchema=z.object({notificationId:z.string()});
  const hi = commands.playNotificationSoundRequestSchema = z.object({method:z.literal(`Aux.playNotificationSound`),params:z.object({sound:fi,customSound:pi.optional()})});
  commands.playNotificationSoundResponseSchema=z.object({ok:z.literal(true)});
  const gi = commands.grantNotificationPermissionRequestSchema = z.object({method:z.literal(`Aux.grantNotificationPermission`),params:z.object({targetId:z.string().trim().min(1)})});
  commands.grantNotificationPermissionResponseSchema=z.object({success:z.boolean().default(true)});
  const _i = commands.revokeNotificationPermissionRequestSchema = z.object({method:z.literal(`Aux.revokeNotificationPermission`),params:z.object({origin:z.string().trim().url()})});
  commands.revokeNotificationPermissionResponseSchema=z.object({revoked:z.boolean()});
  const vi = commands.clearAiTabsGroupRequestSchema = z.object({method:z.literal(`Aux.clearAiTabsGroup`),params:z.object({keepTargetIds:z.array(z.string().trim().min(1)).optional()})});
  commands.clearAiTabsGroupResponseSchema=z.object({success:z.boolean().default(true),closedCount:z.number().int().nonnegative()});
  const yi = z.string().trim().refine(b.isAllowedExtensionMv3ApiMethod,{message:`Chrome MV3 API method is not whitelisted`}).transform(Cn=>Cn);
  const bi = commands.callExtensionMv3ApiRequestSchema = z.object({method:z.literal(`Aux.callExtensionMV3Api`),params:z.object({method:yi,args:z.array(z.unknown()).default([])})});
  commands.callExtensionMv3ApiResponseSchema=z.unknown();
  const xi = commands.openProfileUrlRequestSchema = z.object({method:z.literal(`Aux.openProfileUrl`),params:z.object({url:z.url()})});
  commands.openProfileUrlResponseSchema=z.object({success:z.boolean().default(true)});
  const Si = commands.pickDirectoryRequestSchema = z.object({method:z.literal(`Aux.pickDirectory`),params:z.object({prompt:z.string().trim().min(1).optional()})});
  commands.pickDirectoryResponseSchema=z.object({status:z.enum([`selected`,`cancelled`,`unavailable`]),path:z.string().trim().min(1).optional()});
  const validateTabReferences = z.object({method:z.literal(`Aux.validateTabReferences`),params:z.object({references:z.array(z.object({targetId:z.string().min(1),url:z.string().min(1),documentCapability:z.string().uuid()})).min(1).max(64)})});
  const routeBrowserLink = z.object({method:z.literal(`Aux.routeBrowserLink`),params:z.object({operation:z.enum([`open`,`resolve`,`list`]),url:z.string().max(16384).optional(),profile:z.string().max(256).optional(),space:z.string().max(256).optional()}).strict()});

  /** The supplied namespace, with Aux's schemas in place and its credential commands still there. */
  function adopt(supplied) {
    Object.assign(supplied, commands);
    const {cookieSyncContextRequestSchema, cookieRestoreRequestSchema, createPasswordManagerGeneratedPasswordRefRequestSchema, fillPasswordManagerGeneratedPasswordRefRequestSchema,
      resolvePasswordManagerGeneratedPasswordRefsRequestSchema, clearPasswordManagerGeneratedPasswordRefsRequestSchema, performPasswordManagerAutofillRequestSchema, applePasswordsCapabilitiesRequestSchema,
      applePasswordsRequestAuthRequestSchema, applePasswordsVerifyAuthRequestSchema, applePasswordsListLoginsRequestSchema, applePasswordsGetPasswordsRequestSchema, applePasswordsSaveLoginRequestSchema,
      applePasswordsGetOtpsRequestSchema} = supplied;
    const extensionCommands = [cookieSyncContextRequestSchema, cookieRestoreRequestSchema, ti, ni, ri, xi, ii, oi, si, ci, li, ui, di, mi, hi, gi, _i, vi, bi, createPasswordManagerGeneratedPasswordRefRequestSchema,
      fillPasswordManagerGeneratedPasswordRefRequestSchema, resolvePasswordManagerGeneratedPasswordRefsRequestSchema, clearPasswordManagerGeneratedPasswordRefsRequestSchema, performPasswordManagerAutofillRequestSchema,
      applePasswordsCapabilitiesRequestSchema, applePasswordsRequestAuthRequestSchema, applePasswordsVerifyAuthRequestSchema, applePasswordsListLoginsRequestSchema, applePasswordsGetPasswordsRequestSchema,
      applePasswordsSaveLoginRequestSchema, applePasswordsGetOtpsRequestSchema, validateTabReferences, routeBrowserLink];
    supplied.extensionRequestSchema = z.discriminatedUnion('method', extensionCommands);
    supplied.requestSchema = z.discriminatedUnion('method', [...extensionCommands, Si]);
  }

  /** The WebSocket messages between the daemon and the extension. */
  function adoptProtocol(protocol) {
    const route = protocol.routeSchema = z.object({accountId: z.number().int().nonnegative(), profileId: z.string().min(1), browserMode: b.browserModeSchema.default('default'), windowId: z.number().int().optional()});
    protocol.registerMessageSchema = z.object({method: z.literal('register'), connectionId: z.string().min(1), route: route.omit({windowId: true})});
    protocol.registeredMessageSchema = z.object({method: z.literal('registered'), connectionId: z.string().min(1)});
    const commandRoute = protocol.commandRouteSchema = route.extend({accountId: z.number().int().nonnegative().optional(), profileId: z.string().min(1).optional(), browserMode: b.browserModeSchema.default('default')});
    protocol.commandRequestSchema = z.object({command: b.commands.requestSchema, route: commandRoute});
    protocol.runCommandMessageSchema = z.object({id: z.number(), method: z.literal('runCommand'), command: b.commands.extensionRequestSchema, route});
    protocol.runCommandMessageEnvelopeSchema = z.object({id: z.number(), method: z.literal('runCommand'), command: z.object({method: z.string()})});
    protocol.cancelCommandMessageSchema = z.object({id: z.number(), method: z.literal('cancelCommand')});
    protocol.runCommandMessageResponseSchema = z.object({id: z.number(), result: z.unknown(), error: z.string().optional()});
    protocol.pingMessageSchema = z.object({method: z.literal('ping')});
    protocol.pingMessageResponseSchema = z.object({method: z.literal('pong')});
  }

  return {adopt, adoptProtocol};
}
