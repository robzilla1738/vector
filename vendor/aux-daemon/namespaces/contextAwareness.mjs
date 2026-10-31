/** The `contextAwareness` tRPC namespace: what the Context Awareness helper captured, its
 * permissions, history views and summaries. Aux and Aux Canary never appear among the apps to
 * choose from. The native helper and summarizer stay the supplied ones. */
const OWN_BUNDLE_IDS = new Set(['dev.aux.browser', 'dev.aux.browser.canary']);

export function create({accountProcedure, z, contextAwareness: c}) {
  const settingsOf = accountId => c.settings(accountId).get('contextAwareness');
  return {
    status: accountProcedure.input(z.object({url: z.string().optional()})).query(({input, ctx: {accountId}}) => ({
      capture: c.isCaptureAllowed(accountId, {url: input.url}), settings: settingsOf(accountId), nativeHelper: c.helper.statusFor(accountId),
      storage: c.getContextAwarenessStats(accountId), captureHealth: c.listNativeCaptureHealth(accountId, Date.now() - 36e5),
      captureSignals: c.getContextCaptureStats(accountId), comprehension: c.getSummaryJobStatus(accountId),
    })),
    permissions: accountProcedure.query(async ({ctx: {accountId}}) => {
      const {built, health} = await c.helper.requestHealth(accountId);
      return {supported: process.platform === 'darwin' || process.platform === 'win32', platform: process.platform, built,
        accessibility: health.accessibilityTrusted ?? false, inputMonitoring: health.inputMonitoringTrusted ?? false,
        secureInput: health.secureInput ?? false, screenRecording: health.screenRecordingTrusted ?? true};
    }),
    requestPermissions: accountProcedure.mutation(async ({ctx: {accountId}}) => {
      await c.helper.requestPermissions(accountId);
      return {requested: true};
    }),
    events: accountProcedure.input(c.eventQuerySchema).query(({input, ctx: {accountId}}) => c.listContextAwarenessEvents(accountId, input)),
    search: accountProcedure.input(c.searchQuerySchema).query(({input, ctx: {accountId}}) => c.assembleHistoryEvidence(accountId, input)),
    read: accountProcedure.input(c.readQuerySchema).query(({input, ctx: {accountId}}) => c.readContextAwarenessEvents(accountId, input)),
    pause: accountProcedure.input(z.object({until: z.number().optional(), durationMs: z.number().int().positive().optional()})).mutation(({input, ctx: {accountId}}) => {
      c.helper.pause(accountId, input.until ?? (input.durationMs ? Date.now() + input.durationMs : undefined));
      return settingsOf(accountId);
    }),
    resume: accountProcedure.mutation(({ctx: {accountId}}) => {
      c.helper.resume(accountId);
      return settingsOf(accountId);
    }),
    clear: accountProcedure.input(z.object({target: c.clearTargetSchema})).mutation(async ({input, ctx: {accountId}}) => {
      await c.helper.discardCaptureBuffer(accountId);
      return c.clearContextAwarenessAndFrames(accountId, input.target);
    }),
    historyList: accountProcedure.input(z.object({from: z.number(), to: z.number()})).query(({input, ctx: {accountId}}) => c.listContextAwarenessView(accountId, input)),
    appIcons: accountProcedure.input(z.object({bundleIds: z.array(z.string().min(1)).max(80)})).query(({input, ctx: {account}}) => c.resolveAppIcons(input.bundleIds, account)),
    listApplications: accountProcedure.query(async ({ctx: {account, accountId}}) => {
      const installed = [...await c.helper.invoke('applications.list', {}, {owner: account}).catch(() => [])];
      if (process.platform === 'darwin' && !installed.some(app => app.bundleId === 'com.apple.Safari')) installed.push({name: 'Safari', bundleId: 'com.apple.Safari'});
      const known = new Set(installed.map(app => app.bundleId));
      const recent = c.listContextAwarenessRecents(accountId, 30).filter(app => app.bundleId && !known.has(app.bundleId)).map(app => ({name: app.appName || app.bundleId, bundleId: app.bundleId}));
      const apps = [...installed, ...recent].filter(app => !OWN_BUNDLE_IDS.has(app.bundleId)).sort((a, b) => a.name.localeCompare(b.name));
      const icons = await c.resolveAppIcons(apps.map(app => app.bundleId), account);
      return apps.map(app => ({...app, icon: icons[app.bundleId] ?? null}));
    }),
    historyStatus: accountProcedure.query(({ctx: {accountId}}) => c.getContextAwarenessViewStatus(accountId)),
    summaries: accountProcedure.input(z.object({from: z.number().optional(), to: z.number().optional(), kinds: z.array(c.summaryKindSchema).optional(), limit: z.number().int().min(1).max(200).optional()}))
      .query(({input, ctx: {accountId}}) => c.listHistorySummaries(accountId, input)),
    verifyStore: accountProcedure.input(z.object({sample: z.number().int().min(1).max(2e3).default(200), all: z.boolean().default(false)}))
      .mutation(({input, ctx: {accountId}}) => c.verifyContextAwarenessStore(accountId, input)),
    comprehend: accountProcedure.input(z.object({closeOpenWindow: z.boolean().optional(), maxJobs: z.number().int().min(1).max(20).optional()}))
      .mutation(({input, ctx: {accountId}}) => c.runContextAwarenessComprehension(accountId, {now: input.closeOpenWindow ? c.tenMinuteWindow(Date.now()).to : undefined, maxJobs: input.maxJobs})),
    replay: accountProcedure.input(z.object({at: z.number(), briefingOnly: z.boolean().optional()})).mutation(({input, ctx: {accountId}}) => c.replayContextAwarenessWindow(accountId, input.at, input.briefingOnly)),
    resummarize: accountProcedure.input(z.object({at: z.number()})).mutation(async ({input, ctx: {accountId}}) => {
      const window = c.tenMinuteWindow(input.at);
      c.resetTenMinuteWindow(accountId, window);
      await c.runContextAwarenessComprehension(accountId, {maxJobs: 1});
      return (await c.listHistorySummaries(accountId, {from: window.from, to: window.to, kinds: ['10min']})).find(summary => summary.windowFrom === window.from) ?? null;
    }),
    digest: accountProcedure.mutation(({ctx: {accountId}}) => c.digestContextAwareness(accountId)),
    reportTabSignal: accountProcedure.input(z.object({targetId: z.string().min(1), url: z.string(), kind: z.enum(['activation', 'media', 'unobservable']), audible: z.boolean().optional(),
      dwelled: z.boolean().optional(), observedAt: z.number().int().nonnegative().optional(), sequence: z.number().int().nonnegative().optional()}))
      .mutation(async ({input, ctx: {accountId}}) => {
        await c.reportUserTabSignal(accountId, input);
        return {ok: true};
      }),
    summaryModelDefault: accountProcedure.query(({ctx: {accountId}}) => c.resolveContextAwarenessSummaryModel(c.models(accountId))),
  };
}
