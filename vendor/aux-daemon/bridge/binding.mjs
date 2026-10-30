/** Which browser window a CLI task works in: the profiles connected for an account, and the window
 * a task binds to, with an error that tells the person what to do when there is none. */
import path from 'node:path';

const NOT_CONNECTED = 'Chrome extension not connected for the requested browser profile';
const failure = (code, category) => ({code, category});

export function create({z, logger, bridge: b}) {
  const accountLabel = accountId => {
    const email = b.AccountRegistry.getAccount(accountId)?.email;
    if (!email) return `u${accountId}`;
    const [name = '', domain] = email.split('@');
    return `u${accountId} — ${domain ? `${name.slice(0, 4)}***@${domain}` : `${email.slice(0, 4)}***`}`;
  };

  function profileLabel(profileId, bindings) {
    const binding = bindings[profileId];
    if (binding?.profileIndex !== undefined) return `Profile ${binding.profileIndex}`;
    return binding?.profilePath ? path.basename(binding.profilePath) : profileId;
  }

  function bindingMessage(code, {accountLabel: account, profileLabel: profile, profileLabels, tabCount, candidateWindowIds}) {
    const owner = `account ${account}`, named = profile ? `${owner} ("${profile}")` : owner;
    switch (code) {
      case 'no-profile': return `${b.BROWSER_BINDING_REQUIRED_MESSAGE} This applies to account ${account}.`;
      case 'multiple-profiles': return `Multiple browser profiles are open for ${owner}: ${profileLabels?.join(', ') ?? 'unknown profiles'}. Select one with --profile <id>; run 'aux host profiles' (with the same --host) to see profile ids.`;
      case 'profile-not-found': return `Browser profile "${profile}" is not available for ${owner}. Run 'aux host profiles' (with the same --host) to see profile ids.`;
      case 'bridge-unreachable': return `Aux Browser profile for ${named} is not connected to the daemon. Make sure that profile is running, or pick another account with --account.`;
      case 'binding-command-failed': return `Could not inspect browser windows for ${named}. Retry; if this repeats, restart Aux Browser.`;
      case 'no-normal-window': return `No browser window is open for ${named}. Open a window in that Aux profile and retry, or pick another account with --account.`;
      case 'tabs-without-normal-window': return `Aux Browser reports ${tabCount ?? 0} open tabs but no normal browser window for ${named} — its tabs may be parked in a background window after a profile switch. Open a new window in that profile and retry.`;
      case 'ambiguous-windows': return `Multiple browser windows are open for ${named} and none is focused (windows: ${candidateWindowIds?.join(', ') ?? 'unknown'}). Focus the window you want the agent to use, then retry.`;
      default: return undefined;
    }
  }

  const bindingError = (code, details) => new b.CliBrowserBindingError(code, bindingMessage(code, details));

  function classifyBridgeError(error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === NOT_CONNECTED) return failure('bridge-unreachable', 'not-connected');
    if (message === 'extension disconnected') return failure('bridge-unreachable', 'disconnected');
    if (message === b.BRIDGE_CONNECTION_REPLACED_MESSAGE) return failure('bridge-unreachable', 'connection-replaced');
    if (message.startsWith('extension request timeout: ')) return failure('binding-command-failed', 'request-timeout');
    if (message.startsWith('Unsupported command: ')) return failure('binding-command-failed', 'unsupported-command');
    return failure('binding-command-failed', error instanceof b.ZodError ? 'invalid-response' : 'handler-error');
  }

  const listOpenTabs = (accountId, profileId) => b.globalExtensionBridge.sendCommandToExtension({method: 'Aux.listTabs', params: {accountId}}, {accountId, profileId})
    .then(reply => b.commands.listTabsResponseSchema.parse(reply).items);

  const windowsApi = (method, args) => ({method: 'Aux.callExtensionMV3Api', params: {method, args}});

  /** For extensions from before `Aux.resolveBindingWindow`: the same answer from the windows API. */
  async function resolveLegacyBindingWindow(accountId, profileId) {
    const route = {accountId, profileId}, {globalExtensionBridge: extension} = b;
    const [allWindows, lastFocused, tabs] = await Promise.all([extension.sendCommandToExtension(windowsApi('chrome.windows.getAll', [{populate: true}]), route),
      extension.sendCommandToExtension(windowsApi('chrome.windows.getLastFocused', [{windowTypes: ['normal']}]), route).catch(() => undefined), listOpenTabs(accountId, profileId)]);
    const windows = z.array(b.legacyWindowSchema).parse(allWindows), lastFocusedWindowId = b.legacyLastFocusedWindowSchema.safeParse(lastFocused).data?.id;
    const windowCountByType = Object.create(null);
    let tabCount = 0;
    for (const window of windows) {
      windowCountByType[window.type] = (windowCountByType[window.type] ?? 0) + 1;
      tabCount += window.tabs.length;
    }
    const diagnostics = {windowCount: windowCountByType.normal ?? 0, windowCountByType, tabCount, ...lastFocusedWindowId === undefined ? {lastFocusedError: 'Legacy last-focused lookup failed'} : {}};
    const selected = b.selectBindingWindow({windows, lastFocusedWindowId: lastFocusedWindowId ?? null, tabCount});
    if (selected.status !== 'ok') return {...selected, diagnostics};
    const anchor = tabs.find(tab => tab.windowId === selected.windowId && tab.active) ?? tabs.find(tab => tab.windowId === selected.windowId);
    return {...selected, ...anchor ? {anchorTargetId: anchor.targetId} : {}, diagnostics};
  }

  function listCliBrowserProfiles(accountId) {
    const bindings = b.AccountRegistry.getAll().profileAccountBindings, connected = new Set(b.globalExtensionBridge.listConnectedProfiles(accountId).map(({profileId}) => profileId));
    const registered = Object.values(bindings).filter(binding => binding.accountId === accountId).map(({profileId}) => profileId);
    return [...new Set([...registered, ...connected])].map(profileId => ({profileId, label: profileLabel(profileId, bindings), connected: connected.has(profileId)}));
  }

  /** The extension's answer, retried once if the bridge connection was just replaced; a command
   * from before `Aux.resolveBindingWindow` falls back to the windows API. */
  async function askForWindow(accountId, profileId) {
    let failed;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const reply = await b.globalExtensionBridge.sendCommandToExtension({method: 'Aux.resolveBindingWindow', params: {}}, {accountId, profileId});
          return {resolved: b.commands.resolveBindingWindowResponseSchema.parse(reply), protocol: 'binding-window'};
        } catch (error) {
          if (attempt > 0 || !(error instanceof Error) || error.message !== b.BRIDGE_CONNECTION_REPLACED_MESSAGE) throw error;
        }
      }
    } catch (error) {
      failed = error;
    }
    if (failed instanceof Error && failed.message === b.RESOLVE_BINDING_UNSUPPORTED_MESSAGE) {
      try {
        return {resolved: await resolveLegacyBindingWindow(accountId, profileId), protocol: 'legacy-mv3'};
      } catch (error) {
        failed = error;
      }
    }
    return {failed};
  }

  async function resolveCliBrowserBinding(accountId, requested) {
    const started = Date.now(), log = outcome => (outcome.outcome === 'ok' ? logger.info : logger.warn)('[CliBinding] resolve', {...outcome, accountId, elapsedMs: Date.now() - started});
    const connected = b.globalExtensionBridge.listConnectedProfiles(accountId), bindings = b.AccountRegistry.getAll().profileAccountBindings;
    const registered = Object.values(bindings).filter(binding => binding.accountId === accountId), live = connected.map(({profileId}) => profileId);
    const candidates = live.length > 0 ? live : registered.map(binding => binding.profileId);
    const counts = {liveProfileCount: connected.length, registryProfileCount: registered.length}, account = accountLabel(accountId);
    if (requested && !live.includes(requested) && !registered.some(binding => binding.profileId === requested)) {
      log({outcome: 'profile-not-found', ...counts});
      throw bindingError('profile-not-found', {accountLabel: account, profileLabel: requested});
    }
    const profileId = requested ?? candidates[0];
    if (!profileId) {
      log({outcome: 'no-profile', ...counts});
      throw bindingError('no-profile', {accountLabel: account});
    }
    if (!requested && candidates.length > 1) {
      log({outcome: 'multiple-profiles', ...counts, profileIds: candidates});
      throw bindingError('multiple-profiles', {accountLabel: account, profileLabels: candidates.map(candidate => profileLabel(candidate, bindings))});
    }
    const label = profileLabel(profileId, bindings), {resolved, protocol, failed} = await askForWindow(accountId, profileId);
    if (!resolved) {
      const {code, category} = classifyBridgeError(failed);
      log({outcome: code, ...counts, profileId, bridgeError: category});
      throw bindingError(code, {accountLabel: account, profileLabel: label});
    }
    const {diagnostics} = resolved, ambiguous = resolved.status === 'ambiguous-windows' ? {candidateWindowIds: resolved.candidateWindowIds} : {};
    const facts = {...counts, profileId, bridgeProtocol: protocol, windowCount: diagnostics.windowCount, windowCountByType: diagnostics.windowCountByType, tabCount: diagnostics.tabCount,
      lastFocusedStatus: diagnostics.lastFocusedError === undefined ? 'ok' : 'error'};
    if (resolved.status !== 'ok') {
      log({outcome: resolved.status, ...facts, ...ambiguous});
      throw bindingError(resolved.status, {accountLabel: account, profileLabel: label, tabCount: diagnostics.tabCount, ...ambiguous});
    }
    log({outcome: 'ok', ...facts, via: resolved.via, windowId: resolved.windowId, hasAnchor: !!resolved.anchorTargetId});
    return {profileId, browserMode: 'default', windowId: resolved.windowId, ...resolved.anchorTargetId ? {anchorTargetId: resolved.anchorTargetId} : {}};
  }

  const isCliSession = ({trigger, title, ephemeral, incognito}) => trigger?.type === 'user' && (trigger.source === 'cli' || trigger.client === 'cli')
    || trigger === undefined && title === 'Aux CLI' && ephemeral === true && incognito === false;

  async function restoreCliBrowserBinding(accountId, session) {
    if (session.browserBinding?.browserMode || !isCliSession(session)) return session;
    const browserBinding = session.browserBinding ? {...session.browserBinding, browserMode: 'default'} : await resolveCliBrowserBinding(accountId);
    b.SessionStore.update(accountId, session.id, {browserBinding});
    return {...session, browserBinding};
  }

  return {listOpenTabs, listCliBrowserProfiles, resolveCliBrowserBinding, restoreCliBrowserBinding, isCliSession};
}
