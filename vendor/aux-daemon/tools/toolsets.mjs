/** Which tools each kind of session gets, and the MCP tools a session's servers add. A tool's
 * availability rules are here; the tools are the families beside this file. */
import {reply, text} from './common.mjs';

export function create({typebox, tools: t}) {
  /** A fixed tool, tied to the account and session that made it. */
  const fixed = (context, tool) => t.registerDirectFixedTool(context, tool);
  /** Aux has no in-app shell in 1.0: local CLIs bring their own (roadmap decision 4). */
  const noShell = () => t.usesBoundBrowserActions();

  function createCoreToolset(context, browser = context.browser) {
    if (!browser) throw Error('The desktop toolset requires a local browser');
    const {accountId, session, accountRoot} = context;
    const repl = t.createLazyDesktopRepl(() => t.createDesktopRepl({accountId, agentSessionId: session.id, sessionCreatedAt: session.createdAt, cwd: session.cwd, sessionStorageDir: context.sessionDir,
      accountRoot, browser, hooks: context.hooks,
      isPathAllowed: (file, mode) => t.hasPermission(t.resolvePermission({accountRoot, permissionMode: session.permissionMode, accountPermission: context.settings.get('permission'), sessionPermission: session.permission}), {type: 'file', path: file, mode}) === 'allow',
      incognito: session.incognito, channelEnabled: session.trigger?.type === 'channel', imageGenerationModels: context.models, canSendMessages: !session.parentId || t.isForkSelfSubagent(session),
      settings: t.settings(accountId)}), accountId, session.id, session.createdAt);
    const tools = [t.registerBrowserReplTool(Object.assign(t.createReplTool(repl), {dispose: () => repl.dispose()}), repl), t.createReadFileTool({context}), ...noShell() ? [] : [t.createTerminalTool(context), t.createTerminalInteractTool(context)],
      fixed(context, t.createWebFetchTool(context)), fixed(context, t.createWebSearchTool(context)), fixed(context, t.createGetTimeTool())];
    if (session.permissionMode !== 'read-only' && !t.isReadOnlySubagent(session)) tools.push(fixed(context, t.createWriteFileTool(context)), fixed(context, t.createEditFileTool(context)));
    if (!session.incognito) tools.push(fixed(context, t.createMemoryReadTool(context)));
    return tools;
  }

  function createAgentToolset(context, browser = context.browser) {
    if (!browser) throw Error('The desktop toolset requires a local browser');
    const {accountId, session} = context, tools = createCoreToolset(context, browser);
    const child = !!session.parentId, forkSelf = t.isForkSelfSubagent(session), headless = t.isHeadlessSessionTrigger(session.trigger);
    const finalConfirm = session.permissionMode !== 'read-only' && !t.isReadOnlySubagent(session) && !headless && session.runtimeConfig.finalConfirm;
    const coder = t.canStartCoder(session, accountId), contextAwareness = !session.incognito && !t.isOnboardingSessionTrigger(session.trigger) && t.isContextAwarenessReadable(accountId);
    tools.push(fixed(context, t.createTodosTool(context)));
    if (!session.incognito) {
      tools.push(fixed(context, t.createHistorySearchTool({accountId, contextAwareness, extensionBridgeRoute: () => browser.extensionBridgeRoute})));
      if (contextAwareness) tools.push(fixed(context, t.createHistoryReadTool({accountId})));
    }
    if (!session.routineId && t.canUseAgentMessaging(session)) tools.push(fixed(context, t.createMessageAgentTool(context)));
    if (!child || forkSelf || session.trigger?.type === 'routine') tools.push(fixed(context, t.createSubagentTool(context, coder ? ['code_explorer'] : [])), fixed(context, t.createSubagentWaitTool(context)));
    if ((!child || forkSelf) && !session.routineId) tools.push(fixed(context, t.createRoutineUpdateTool(context)), fixed(context, t.createNotificationTool(context)));
    if (!child || t.isSideChat(session)) {
      if (!headless) tools.push(fixed(context, t.createAskUserQuestionTool(context)));
      if (finalConfirm) tools.push(fixed(context, t.createActionConfirmationTool(context)));
    }
    if (session.routineId && session.parentId) tools.push(fixed(context, t.createRoutineNotifyParentTool(context)));
    if (coder && !noShell()) tools.push(t.createStartCoderTool(context));
    return tools;
  }

  function createCoderTools(context) {
    const core = new Map(createCoreToolset(context).map(tool => [tool.name, tool]));
    const available = {...Object.fromEntries(core), ...core.has('write_file') && {write_file: t.createWriteFileTool(context, {overwrite: true})},
      ...core.has('bash') && process.platform !== 'win32' && {bash: t.createBashTool(context, {moveToBackground: (...args) => t.moveToBackground(context, ...args)})},
      ...t.createBackgroundProcessTools(context), fd: t.createFdTool(context), rg: t.createRgTool(context), ...core.has('memory_search') && t.createMemoryTools(context),
      message_agent: t.createMessageAgentTool(context), subagent: t.createSubagentTool(context, ['context_explorer']), subagent_wait: t.createSubagentWaitTool(context),
      workflow: t.createWorkflowTool(context), ...t.createAutomationTools(context)};
    const tools = t.coderToolNames(context.session).flatMap(name => available[name] ?? []);
    return context.session.trigger?.type === 'subagent' ? tools.map(t.withChildTimeout) : tools;
  }

  /** A channel task's transcript reads through read_file; everything else runs as usual. */
  function createChannelToolset(context) {
    const tools = createAgentToolset(context);
    if (context.session.trigger?.type !== 'v2-channel') return tools;
    const {channelId} = context.session.trigger, transcript = `/channels/${encodeURIComponent(channelId)}/transcript.txt`;
    return tools.map(tool => ({...tool, execute: async (...args) => {
      const input = args[1];
      if ((input.path ?? input.file_path) !== transcript) return tool.execute(...args);
      if (tool.name !== 'read_file') throw Error('Channel transcripts are read-only projections.');
      const {text: body} = await t.fetchAuxAPIAuthenticated(context.accountId, `/channel-chat/channels/${encodeURIComponent(channelId)}/transcript`);
      return reply(body, {});
    }}));
  }

  /** The agent's name for an MCP tool, numbered when two would collide. */
  function agentToolName(taken, server, name) {
    let candidate = t.getAgentToolName(server, name);
    for (let suffix = 2; taken.has(candidate); suffix += 1) candidate = t.getAgentToolName(server, name, `_${suffix}`);
    taken.add(candidate);
    return candidate;
  }

  const isConnectionFailure = error => error instanceof t.McpConnectionError || error instanceof t.UnauthorizedError || error instanceof t.McpError && error.code === t.ErrorCode.ConnectionClosed;

  /** context: the session the tools belong to. Its read-only mode allows only tools a server marks
   * read-only, checked again on every call because a chat's mode can change after it loads. */
  function createMcpAgentTools(manager, listed, context) {
    const taken = new Set(), held = context ? tool => fixed(context, tool) : tool => tool;
    const blocked = tool => !!context && tool.annotations?.readOnlyHint !== true && (context.session.permissionMode === 'read-only' || t.isReadOnlySubagent(context.session));
    return listed.filter(({tool}) => !blocked(tool)).map(({serverName, tool}) => {
      const schema = structuredClone(tool.inputSchema);
      // Some servers escape `_` in patterns, which the model providers reject.
      for (const property of Object.values(schema.properties ?? {}))
        if (property && typeof property === 'object' && 'pattern' in property && typeof property.pattern === 'string')
          property.pattern = property.pattern.replace(/\\\\|\\_/g, match => match === '\\_' ? '_' : match);
      return held({
        name: agentToolName(taken, serverName, tool.name), label: `${serverName}: ${tool.title ?? tool.name}`, description: tool.description ?? `MCP tool '${tool.name}' from server '${serverName}'.`,
        parameters: typebox.Unsafe(schema), executionMode: 'sequential',
        execute: async (id, input, signal) => {
          if (blocked(tool)) return {content: [text(`This chat is read-only, and ${serverName} doesn't mark ${tool.name} as read-only.`)], details: {}, isError: true};
          try {
            const result = await manager.callTool(serverName, tool.name, input, signal);
            return {content: await t.mcpResultToAgentContent(result), details: {}, isError: result.isError === true};
          } catch (error) {
            if (signal?.aborted) throw error;
            return {content: [text(error instanceof Error ? error.message : String(error))], details: {openSettings: isConnectionFailure(error)}, isError: true};
          }
        },
      });
    });
  }

  return {createCoreToolset, createAgentToolset, createCoderTools, createTools: createChannelToolset, createMcpAgentTools};
}
