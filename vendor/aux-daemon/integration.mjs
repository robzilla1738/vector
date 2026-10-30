/** Release-time integration of Aux's own daemon routers (browser-excellence plan, Batch 10 item 6).
 * Copies the dispatcher beside aux-native-entry.mjs under aux-daemon/ and makes two count-checked
 * edits: load it, and build the root tRPC router through it. scripts/release/transforms.mjs applies
 * them after the agent integration; any drifted anchor stops the release. */
import {applyExactEdits} from '../provided/provider-cli/integration.mjs';
import {NAMESPACES} from './registry.mjs';

/** Copied under node-development/aux-daemon/. Tests and the parity harness stay out. */
export const RUNTIME_FILES = Object.freeze(['dispatcher.mjs', 'registry.mjs', ...Object.values(NAMESPACES).map(file => file.slice(2))]);

/** The supplied root router, verbatim. */
const ROOT_ROUTER = 'agentRuntime:agentRuntimeRouter,accounts:accountsRouter,projects:projectsRouter,analytics:analyticsRouter,billing:billingRouter,'
  + 'capture:captureRouter,channels:channelRouter,cli:cliRouter,contextAwareness:contextAwarenessRouter,developers:developersRouter,inbox:inboxRouter,'
  + 'lasso:lassoRouter,sessions:sessionsRouter,settings:settingsRouter,sync:syncRouter,uiAttention:uiAttentionRouter,memory:memoryRouter,mcp:mcpRouter,'
  + 'models:modelsRouter,onboarding:onboardingRouter,fullDiskAccess:fullDiskAccessRouter,externalPasswordManagers:externalPasswordManagersRouter,'
  + 'referrals:referralsRouter,remoteControl:remoteControlRouter,routines:routinesRouter,meta:metaRouter';

/** Root namespace → supplied router variable. */
export const ROOT_NAMESPACES = Object.freeze(Object.fromEntries(ROOT_ROUTER.split(',').map(entry => entry.split(':'))));

/** What the namespace modules may use from the supplied bundle, as module name → bundle name:
 * its tRPC builder and procedures (so auth, logging and error shapes stay identical), its zod
 * builders, its state.db connection (so the SQLite schema stays the supplied one), and per
 * namespace the supplied schemas, stores and services a port still relies on. */
export const BINDINGS = Object.freeze({
  router: 'router', accountProcedure: 'accountProcedure', publicProcedure: 'publicProcedure', TRPCError: 'TRPCError', stateDb: 'stateDb',
  z: {object: 'object', string: 'string$3', number: 'number$2', boolean: 'boolean$1', record: 'record', enum: '_enum', array: 'array', literal: 'literal', unknown: 'unknown$1', custom: 'custom'},
  uiAttention: {attentionByAccountId: 'attentionByAccountId'},
  fullDiskAccess: {runComputerUseCommand: 'runComputerUseCommand', prepareHelper: 'prepareComputerUseHelperRuntime',
    helperAppPath: 'COMPUTER_USE_HELPER_APP_PATH', contextAwarenessHelper: 'nativeContextAwarenessHelper'},
  agentRuntime: {statusSchema: 'agentRuntimeStatusSchema', jobSchema: 'agentRuntimeJobSchema', status: 'getAgentRuntimeStatus', job: 'getAgentRuntimeJob', install: 'startAgentRuntimeInstall'},
  capture: {fullPage: 'captureFullPage', viewport: 'captureViewport'},
  routines: {typeSchema: 'routineTypeSchema', createSchema: 'routineCreateSchema', updateSchema: 'routineUpdateSchema', settings: 'settings',
    list: 'listRoutines', summary: 'getRoutineSummary', detail: 'getRoutineDetail', create: 'createRoutine', update: 'updateRoutine',
    get: 'getRoutine', updateServer: 'updateServerRoutine', remove: 'deleteRoutine', run: 'runRoutine'},
  projects: {ProjectStore: 'ProjectStore', projectSchema: 'projectSchema', SessionStore: 'SessionStore', GlobalAgentSessionServer: 'GlobalAgentSessionServer',
    EventBus: 'EventBus', getAccountTaskRoot: 'getAccountTaskRoot', stopCoderWork: 'stopCoderWork', notifyAgentFileChange: 'notifyAgentFileChange'},
  billing: {lookupKeySchema: 'stripePriceLookupKeySchema', creditCentsSchema: 'addOnCreditCentsSchema', autoReloadSchema: 'autoReloadSettingsSchema',
    fetchAuxAPIAuthenticated: 'fetchAuxAPIAuthenticated', fetchBillingSubscription: 'fetchBillingSubscription', summaryResponseSchema: 'billingSummaryResponseSchema',
    usageResponseSchema: 'billingUsageResponseSchema', SessionStore: 'SessionStore', datetime: 'datetime'},
  referrals: {AccountRegistry: 'AccountRegistry'},
  settings: {settings: 'settings', setInputSchema: 'settingsSetInputSchema', putRemoteUserSettings: 'putRemoteUserSettings', isContextAwarenessSupported: 'isContextAwarenessSupported',
    accountHasAllowedPlan: 'accountHasAllowedPlan', contextAwarenessPlans: 'CONTEXT_AWARENESS_ALLOWED_PLANS', isAccountExperimentalEligible: 'isAccountExperimentalEligible',
    reconcileContextAwareness: 'reconcileContextAwareness', refreshRoutineTimezone: 'refreshRoutineTimezone', RecentSessionsStore: 'RecentSessionsStore',
    auxAgent: 'auxAgent', auxAgentView: 'auxAgentView', auxAgentApply: 'auxAgentApply', auxAgentUsable: 'auxAgentUsable', auxAgentWriteContext: 'auxAgentWriteContext',
    SessionStore: 'SessionStore', contextFileSchema: 'accountContextFileSchema', getAccountTaskRoot: 'getAccountTaskRoot',
    readCompletionSound: 'readCustomCompletionSound', writeCompletionSound: 'writeCustomCompletionSound', deleteCompletionSound: 'deleteCustomCompletionSound'},
  developers: {skill: 'AUX_BROWSER_SKILL', cliStatus: 'getCliInstallationStatus', installCli: 'installCli', refreshSkills: 'refreshInstalledAuxBrowserSkills',
    listAgentInstallations: 'listAgentInstallations', generalSkillInstallation: 'getGeneralSkillInstallation', targetIdSchema: 'developerSkillTargetIdSchema',
    installedSkillTargetDirs: 'listInstalledSkillTargetDirs', writeSkill: 'writeAuxBrowserSkill', skillTargetDir: 'getSkillTargetDir'},
  onboarding: {detectBrowsers: 'detectBrowsers', passwordManagersInputSchema: 'detectPasswordManagersInputSchema', detectPasswordManagers: 'detectPasswordManagers',
    detectAISubscription: 'detectAISubscription', analyzeUserApps: 'analyzeUserApps'},
  meta: {localhostProcedure: 'localhostProcedure', openFileSchema: 'openFileSchema', sessionPathSchema: 'sessionPathSchema', openWithSchema: 'openWithSchema',
    openAppSchema: 'openAppSchema', resolveLocalPath: 'resolveLocalPath', openSystemPath: 'openSystemPath', copyFileToClipboard: 'copyFileToClipboard',
    listOpenApps: 'listOpenApps', openFileWithApp: 'openFileWithApp'},
  tabs: {list: 'listSessionTabs', resolveByTargetId: 'resolveSessionTabByTargetId', get: 'getSessionTab', remove: 'removeSessionTab', GlobalAgentSessionServer: 'GlobalAgentSessionServer'},
  memory: {memoryDir: 'memoryDir', getAccountRoot: 'getAccountRoot', MemoryManager: 'MemoryManager', isContextAwarenessReadable: 'isContextAwarenessReadable',
    isContextAwarenessMemoryPath: 'isContextAwarenessMemoryPath', MemorySearchUnavailableError: 'MemorySearchUnavailableError', listMarkdownFiles: 'listMarkdownFiles',
    slowListMs: 'MEMORY_LIST_FILES_SLOW_MS', logger: 'logger', assertWithinDirectory: 'assertWithinDirectory$1', getLastUpdatedAt: 'getLastUpdatedAt$1',
    writeMemoryPage: 'writeMemoryPage', listMemoryHistory: 'listMemoryHistory', withoutContextAwarenessArtifacts: 'withoutContextAwarenessArtifacts',
    getMemoryHistoryEntry: 'getMemoryHistoryEntry', loadDreamState: 'loadDreamState', settings: 'settings', dreamingAccounts: 'dreamingAccounts', runDreaming: 'runDreaming',
    DreamingModelResolveError: 'DreamingModelResolveError', SessionStore: 'SessionStore', isMemoryExtractionDisabledByPlan: 'isMemoryExtractionDisabledByPlan',
    runningStatuses: 'runningStatuses', models: 'models', extractMemories: 'extractMemories', revertMemoryHistoryEntry: 'revertMemoryHistoryEntry'},
  mcp: {serverInput: 'serverInput', settings: 'settings', McpManager: 'McpManager', testTimeoutMs: 'MCP_CONNECTION_TEST_TIMEOUT_MS', serverNameSchema: 'mcpServerNameSchema',
    serverSettingsSchema: 'mcpServerSettingsSchema', isEqual: 'isEqual', disconnectMcpServer: 'disconnectMcpServer', forgetMcpConnectionStatus: 'forgetMcpConnectionStatus',
    setMcpClientSecret: 'setMcpClientSecret', inspectMcpConnection: 'inspectMcpConnection', cancelMcpConnection: 'cancelMcpConnection', connectMcpServer: 'connectMcpServer',
    getMcpConnectionStatus: 'getMcpConnectionStatus'},
  contextAwareness: {settings: 'settings', isCaptureAllowed: 'isCaptureAllowed', helper: 'nativeContextAwarenessHelper', getContextAwarenessStats: 'getContextAwarenessStats',
    listNativeCaptureHealth: 'listNativeCaptureHealth', getContextCaptureStats: 'getContextCaptureStats', getSummaryJobStatus: 'getSummaryJobStatus',
    eventQuerySchema: 'contextAwarenessEventQuerySchema', listContextAwarenessEvents: 'listContextAwarenessEvents', searchQuerySchema: 'contextAwarenessSearchQuerySchema',
    assembleHistoryEvidence: 'assembleHistoryEvidence', readQuerySchema: 'contextAwarenessReadQuerySchema', readContextAwarenessEvents: 'readContextAwarenessEvents',
    clearTargetSchema: 'clearContextAwarenessTargetSchema', clearContextAwarenessAndFrames: 'clearContextAwarenessAndFrames', listContextAwarenessView: 'listContextAwarenessView',
    resolveAppIcons: 'resolveAppIcons', listContextAwarenessRecents: 'listContextAwarenessRecents', getContextAwarenessViewStatus: 'getContextAwarenessViewStatus',
    summaryKindSchema: 'contextAwarenessSummaryKindSchema', listHistorySummaries: 'listHistorySummaries', verifyContextAwarenessStore: 'verifyContextAwarenessStore',
    runContextAwarenessComprehension: 'runContextAwarenessComprehension', tenMinuteWindow: 'tenMinuteWindow', replayContextAwarenessWindow: 'replayContextAwarenessWindow',
    resetTenMinuteWindow: 'resetTenMinuteWindow', digestContextAwareness: 'digestContextAwareness', reportUserTabSignal: 'reportUserTabSignal',
    resolveContextAwarenessSummaryModel: 'resolveContextAwarenessSummaryModel', models: 'models'},
  channels: {planProcedure: 'planProcedure', allowedPlans: 'CHANNELS_ALLOWED_PLANS', rethrowAsTRPCError: 'rethrowAsTRPCError',
    createConnectionInputSchema: 'createConnectionInputSchema', connectionPublicSchema: 'connectionPublicSchema', createChannelConnection: 'createChannelConnection',
    listConnections: 'listConnections', toPublicConnection: 'toPublicConnection', updateConnectionInputSchema: 'updateConnectionInputSchema',
    updateChannelConnection: 'updateChannelConnection', getConnection: 'getConnection', manager: 'globalChannelManager', deleteConnection: 'deleteConnection',
    clearChannelSecrets: 'clearChannelSecrets', restartChannelConnection: 'restartChannelConnection', listPairingRequests: 'listPairingRequests',
    resolveSenderProfiles: 'resolveSenderProfiles', approvePairingInputSchema: 'approvePairingInputSchema', approvePairingAndReplay: 'approvePairingAndReplay',
    rejectPairing: 'rejectPairing', principalPublicSchema: 'principalPublicSchema', listPrincipals: 'listPrincipals', removePrincipalInputSchema: 'removePrincipalInputSchema',
    deletePrincipal: 'deletePrincipal', updatePrincipalInputSchema: 'updatePrincipalInputSchema', setPrincipalPairingApproval: 'setPrincipalPairingApproval',
    getConnectionPolicy: 'getConnectionPolicy', updatePolicyInputSchema: 'updatePolicyInputSchema', setConnectionPolicy: 'setConnectionPolicy'},
  cli: {accountInstanceProcedure: 'accountInstanceProcedure', assertAccountInstance: 'assertAccountInstance', AccountRegistry: 'AccountRegistry',
    listCliBrowserProfiles: 'listCliBrowserProfiles', resolveCliBrowserBinding: 'resolveCliBrowserBinding', sendCommandToExtension: 'sendCommandToExtension',
    replDescription: 'REPL_TOOL_DESCRIPTION', listCliSkills: 'listCliSkills', nanoid: 'nanoid', createCliReplSession: 'createCliReplSession', replSessions: 'replSessions',
    getCliReplSession: 'getCliReplSession', scheduleIdleCleanup: 'scheduleIdleCleanup', runInCliReplSession: 'runInCliReplSession',
    rememberedRuns: 'REMEMBERED_RUNS_PER_SESSION', closeCliReplSession: 'closeCliReplSession'},
  models: {models: 'models', runDownloadNameRequest: 'auxRunDownloadNameRequest', cancelDownloadNameRequest: 'auxCancelDownloadNameRequest',
    runProductivityRequest: 'auxRunProductivityRequest', cancelProductivityRequest: 'auxCancelProductivityRequest', listCredentialItems: 'listCredentialItems',
    providerCli: 'auxProviderCli', isUnsupportedProviderId: 'isUnsupportedProviderId', CommandCodeModelsError: 'CommandCodeModelsError', logger: 'logger',
    captureOAuthFailure: 'captureOAuthFailure', repairRoutingSelectionsAfterOAuth: 'repairRoutingSelectionsAfterOAuth', customModelSchema: 'customModelSchema',
    discoveryInputSchema: 'customProviderModelDiscoveryInputSchema', discoverLocalProviderModels: 'discoverLocalProviderModels',
    customProvidersConfigSchema: 'customProvidersConfigSchema', preserveExistingCustomProviderSecrets: 'preserveExistingCustomProviderSecrets',
    uiManagedCustomProviderIdSchema: 'uiManagedCustomProviderIdSchema', redactCustomProviderConfigForUi: 'redactCustomProviderConfigForUi',
    customProviderConfigSchema: 'customProviderConfigSchema', aiGatewayProviderIdSchema: 'aiGatewayProviderIdSchema', setCredentialInputSchema: 'setCredentialInputSchema',
    oauthFlowManager: 'oauthFlowManager', url: 'url$2'},
  accounts: {AccountRegistry: 'AccountRegistry', reconcileContextAwareness: 'reconcileContextAwareness', providerSchema: 'accountProviderSchema', modeSchema: 'accountModeSchema',
    chromiumProfileContextSchema: 'chromiumProfileContextSchema', logger: 'logger', forgetAccountBootstrap: 'forgetAccountBootstrap',
    removeAccountLocalArtifacts: 'removeAccountLocalArtifacts', removeContextAwarenessAccount: 'removeContextAwarenessAccount', detachPwmProfile: 'detachPwmProfile',
    email: 'email', uuid: 'uuid$1', url: 'url$2', prepareChromiumSignIn: 'prepareChromiumSignIn', ensureAccountBootstrapped: 'ensureAccountBootstrapped',
    startEmailAuth: 'startEmailAuth', verifyEmailCode: 'verifyEmailCode', exchangeToken: 'exchangeToken', isAllowedGoogleOAuthReturnUrl: 'isAllowedGoogleOAuthReturnUrl',
    startGoogleOAuth: 'startGoogleOAuth', clearPendingGoogleOAuthAttempt: 'clearPendingGoogleOAuthAttempt', signOutStrategySchema: 'signOutStrategySchema',
    signOut: 'signOut', deleteAccount: 'deleteAccount', fetchCurrentUser: 'fetchCurrentUser', fetchAccountDevices: 'fetchAccountDevices',
    signOutAccountDevice: 'signOutAccountDevice', updateCurrentUserProfile: 'updateCurrentUserProfile', fetchAccountSyncKeyStatus: 'fetchAccountSyncKeyStatus',
    enrollAccountSyncKeyRecovery: 'enrollAccountSyncKeyRecovery', recoverAccountSyncKey: 'recoverAccountSyncKey', completeOnboarding: 'completeOnboarding',
    deviceCodeUiProcedure: 'deviceCodeUiProcedure', deviceCodePending: 'deviceCodePending', deviceCodeLookupSchema: 'deviceCodeLookupSchema',
    deviceCodeLookup: 'deviceCodeLookup', deviceCodeDecisionSchema: 'deviceCodeDecisionSchema', deviceCodeDecide: 'deviceCodeDecide',
    isConnectedFromLocalhost: 'isConnectedFromLocalhost', getValidAccessToken: 'getValidAccessToken', AuthorizationError: 'AuthorizationError',
    fetchAuxAPIAuthenticatedJson: 'fetchAuxAPIAuthenticatedJson', ensureProfileAccount: 'ensureProfileAccount'},
  sessions: {SessionStore: 'SessionStore', sessionByIdProcedure: 'sessionByIdProcedure', browserBindingSchema: 'browserBindingSchema', researchCapability: 'auxResearchCapability',
    listOptionsSchema: 'sessionListOptionsSchema', startCloudSessionDiscovery: 'auxCloudStartSessionDiscovery', previewItemsOptionsSchema: 'sessionPreviewItemsOptionsSchema',
    hasPendingCoderWork: 'hasPendingCoderWork', GlobalAgentSessionServer: 'GlobalAgentSessionServer', reportFeedbackInputSchema: 'reportFeedbackInputSchema',
    submitSessionFeedback: 'auxSubmitSessionFeedback', archiveSession: 'archiveSession', settings: 'settings', createSession: 'createSession$1',
    captureInitialPrompt: 'auxCaptureInitialPrompt', runResearchSession: 'auxRunResearchSession', logger: 'logger', isCliSession: 'isCliSession',
    resolveCliBrowserBinding: 'resolveCliBrowserBinding', channelDeliverySchema: 'channelDeliverySchema', registerDeviceTaskPreviews: 'registerDeviceTaskPreviews',
    deliverChannelInput: 'deliverChannelInput', publicationState: 'publicationState', channelTaskPreview: 'channelTaskPreview', textContent: 'textContent$3',
    ProjectStore: 'ProjectStore', localSessionByIdProcedure: 'localSessionByIdProcedure', listSessionFiles: 'listSessionFiles', getSessionTaskDir: 'getSessionTaskDir',
    fileQuerySchema: 'sessionFileQuerySchema', fileMetadataSchema: 'sessionFileMetadataSchema', resolveSessionFile: 'resolveSessionFile',
    fileAttachmentSchema: 'fileAttachmentSchema', prepareFileAttachment: 'prepareFileAttachment', cloudBackupAttachment: 'auxCloudBackupAttachment',
    buildSessionFileResponse: 'buildSessionFileResponse', cloudForgetAttachment: 'auxCloudForgetAttachment', statusSchema: 'sessionStatusSchema',
    runtimeConfigPatchSchema: 'sessionRuntimeConfigPatchSchema', modelSelectionSchema: 'modelSelectionSchema', permissionModeSchema: 'sessionPermissionModeSchema',
    optionalPermissionConfigSchema: 'optionalPermissionConfigSchema', getAccountRoot: 'getAccountRoot', permissionForMode: 'permissionForMode',
    mergePermissionConfig: 'mergePermissionConfig', moveSessionToProject: 'moveSessionToProject', getSharedSessionLink: 'getSharedSessionLink',
    publishSharedSession: 'publishSharedSession', unpublishSharedSession: 'unpublishSharedSession', queuedUserMessageSchema: 'queuedUserMessageSchema',
    resolveSuspension: 'resolveSuspension', rejectSuspension: 'rejectSuspension', deleteSession: 'deleteSession', createSessionInputSchema: 'createSessionInputSchema'},
  skills: {collectImmediateSkills: 'collectImmediateSkills', getBuiltinSkillPaths: 'getBuiltinSkillPaths', isAuxSkill: 'isAuxSkill',
    dedupeSkillsByRuntimePriority: 'dedupeSkillsByRuntimePriority', toListedSkill: 'toListedSkill', markOverriddenSkills: 'markOverriddenSkills',
    collectSkillsForSettings: 'collectSkillsForSettings', createSkillInputSchema: 'createSkillInputSchema', userSkillsPrefix: 'USER_SKILLS_PATH_PREFIX',
    slugifySkillFolderName: 'slugifySkillFolderName', assertWithinDirectory: 'assertWithinDirectory', createUserSkillSource: 'createUserSkillSource',
    parseSkillDefinition: 'parseSkillDefinition', Skills: 'Skills', updateSkillInputSchema: 'updateSkillInputSchema', getUserSkillTarget: 'getUserSkillTarget',
    parseSkillFrontmatter: 'parseSkillFrontmatter', copySkillInputSchema: 'copySkillForCustomizationInputSchema', deleteSkillInputSchema: 'deleteSkillInputSchema',
    writeSkillFrontmatter: 'writeSkillFrontmatter', getSkillDefinitionFile: 'getSkillDefinitionFile', skillAgentSchema: 'skillAgentSchema', skillAgents: 'SKILL_AGENTS',
    getLastUpdatedAt: 'getLastUpdatedAt', listFilesRecursive: 'listFilesRecursive$1'},
  analytics: {updateUserProfile: 'updateAnalyticsUserProfile', propertiesSchema: 'analyticsPropertiesSchema', posthog: 'posthog', isAccountExperimentalEligible: 'isAccountExperimentalEligible'},
  sync: {loadAgentFileSyncMeta: 'loadAgentFileSyncMeta', listAgentFileConflicts: 'listAgentFileConflicts', isSyncEnabled: 'isSyncEnabled', resolveAgentFileConflict: 'resolveAgentFileConflict'},
  lasso: {resolveDefaultOverlayModel: 'resolveDefaultOverlayModel', models: 'models', createTextStreamResponse: 'createTextStreamResponse', Agent: 'Agent$1',
    modelRuntime: 'modelRuntime', createOverlaySystemPrompt: 'createOverlaySystemPrompt', createOverlayMessages: 'createOverlayMessages',
    getAssistantErrorMessage: 'getAssistantErrorMessage', getAssistantTextContent: 'getAssistantTextContent', streamErrorPrefix: 'LASSO_STREAM_ERROR_PREFIX',
    extensionOnlyProcedure: 'extensionOnlyProcedure', inputSchema: 'lassoTransformInputSchema'},
});

/** Every binding is a getter, so a port reads the bundle's variable when it runs, as the supplied
 * code does, even one the bundle assigns after the routers are built. */
const literal = value => `{${Object.entries(value).map(([key, name]) => typeof name === 'string' ? `get ${key}(){return ${name}}` : `${key}:${literal(name)}`).join(',')}}`;
/** A function declaration, so it is hoisted above init_router, which calls it. */
export const BINDINGS_FUNCTION = `function auxOwnedDaemonBindings(){return${literal(BINDINGS)}}`;

const edit = (name, find, replace, count = 1) => Object.freeze({name, find, replace, count});

export const DAEMON_EDITS = Object.freeze([
  edit('load the Aux daemon dispatcher beside the entry',
    'const __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);',
    'const auxOwnedDaemon=await (await import(new URL("./aux-daemon/dispatcher.mjs",import.meta.url))).createAuxOwnedDaemon();\nconst __auxCryptoBaseURL=new URL("./aux-crypto/",import.meta.url);'),
  edit('the root router goes through the dispatcher',
    `auxRouter=router({${ROOT_ROUTER}})`,
    `auxRouter=router(auxOwnedDaemon.compose({${ROOT_ROUTER}},auxOwnedDaemonBindings()))`),
]);

export function integrateDaemon(text) {
  if (text.includes('function auxOwnedDaemonBindings(')) throw Error('Aux daemon integration: the entry already has the dispatcher');
  return `${applyExactEdits('aux daemon', DAEMON_EDITS, text)}\n${BINDINGS_FUNCTION}\n`;
}
