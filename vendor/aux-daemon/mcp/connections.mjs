/** Each MCP server's connection state: what the settings page shows, the saved tool inventory, and
 * the one operation at a time per server. Tokens, client secrets and code verifiers stay behind the
 * supplied OAuth provider and credential functions. */
const AUTHORIZATION_FAILED = 'Authorization failed. Try connecting again.', FLOW_GONE = 'The authorization session is invalid or expired.';
const CONNECT_TIMEOUT_MS = 1e4;

export function create({mcpConnections: m}) {
  const statuses = new Map(), flows = new Map(), flowByServer = new Map(), operations = new Map(), migrations = new Map();
  const key = (accountId, name) => `${accountId}:${name}`;
  const remember = (accountId, name, status) => {
    statuses.set(key(accountId, name), status);
    return status;
  };

  /** Runs `work` after the server's earlier operations have finished. */
  async function withLock(accountId, name, work) {
    const id = key(accountId, name), previous = operations.get(id) ?? Promise.resolve();
    const {promise: finished, resolve: finish} = Promise.withResolvers(), tail = previous.then(() => finished);
    operations.set(id, tail);
    await previous;
    try {
      return await work();
    } finally {
      finish();
      if (operations.get(id) === tail) operations.delete(id);
    }
  }

  function getServer(accountId, name) {
    const server = m.settings(accountId).get('mcp').servers[name];
    if (!server) throw Error(`Unknown MCP server '${name}'.`);
    return server;
  }

  /** Saves the tools, unless the server's settings changed meanwhile. */
  function cacheInventory(accountId, name, server, tools) {
    m.settings(accountId).set('mcp', mcp => {
      if (m.isEqual(mcp.servers[name], server)) mcp.inventories[name] = {tools, refreshedAt: new Date().toISOString()};
      return mcp;
    });
  }

  const usesOAuth = server => server.transport === 'streamable-http' && server.auth.type === 'auto';
  const hasTokens = (accountId, serverName, settings) => new m.McpOAuthProvider({accountId, serverName, settings}).tokens();

  async function failureStatus(accountId, name, server, failure) {
    if (failure.type === 'authentication_required') {
      if (!usesOAuth(server)) return {status: 'invalid_server', message: 'The configured authentication was rejected. Edit this server.'};
      return {status: await hasTokens(accountId, name, server) ? 'reconnect' : 'connect', authStatus: 'required', message: failure.message};
    }
    return failure.type === 'timeout' || failure.type === 'unreachable' ? {status: 'unreachable', message: failure.message} : {status: 'invalid_server', message: failure.message};
  }

  async function connectedStatus(accountId, name, server) {
    if (!usesOAuth(server)) return {status: 'connected', authStatus: 'not_required'};
    if (await hasTokens(accountId, name, server)) return {status: 'connected', authStatus: 'authorized'};
    return {status: 'connected', authStatus: 'required', message: 'Authentication is required before tools can run.'};
  }

  function detachFlow(flow) {
    clearTimeout(flow.expirationTimer);
    flows.delete(flow.state);
    const id = key(flow.accountId, flow.serverName);
    if (flowByServer.get(id) === flow.state) flowByServer.delete(id);
  }

  async function closeFlow(flow) {
    detachFlow(flow);
    await flow.client.close().catch(() => undefined);
  }

  async function expireFlow(state) {
    const flow = flows.get(state);
    if (!flow) return;
    await withLock(flow.accountId, flow.serverName, async () => {
      if (flows.get(state) !== flow) return;
      remember(flow.accountId, flow.serverName, {status: 'connect', message: 'The authorization session expired. Try connecting again.'});
      await closeFlow(flow);
      await m.clearMcpCodeVerifier(flow.accountId, flow.serverName);
    });
  }

  function startOAuthFlow(flow, authorizationUrl) {
    const expirationTimer = setTimeout(() => void expireFlow(flow.state).catch(() => undefined), m.OAUTH_FLOW_TTL_MS);
    expirationTimer.unref();
    flows.set(flow.state, {...flow, expirationTimer});
    flowByServer.set(key(flow.accountId, flow.serverName), flow.state);
    remember(flow.accountId, flow.serverName, {status: 'connecting'});
    return {status: 'connecting', authorizationUrl: authorizationUrl.toString()};
  }

  async function inspectUnlocked(accountId, name) {
    const server = getServer(accountId, name), manager = new m.McpManager({servers: {[name]: {...server, enabled: true}}}, {accountId});
    try {
      const {tools, failures} = await manager.listTools(), failure = failures[name];
      if (failure) return remember(accountId, name, await failureStatus(accountId, name, server, failure));
      const status = await connectedStatus(accountId, name, server);
      cacheInventory(accountId, name, server, tools.map(({tool}) => tool));
      return remember(accountId, name, status);
    } finally {
      await manager.shutdown();
    }
  }

  async function cancelUnlocked(accountId, name) {
    const id = key(accountId, name), state = flowByServer.get(id), flow = state && flows.get(state);
    if (flow) {
      await closeFlow(flow);
      await m.clearMcpCodeVerifier(accountId, name);
    }
    if (statuses.get(id)?.status === 'connecting') statuses.set(id, {status: 'connect'});
    return statuses.get(id) ?? {status: 'connect'};
  }

  async function connectUnlocked(accountId, name) {
    await cancelUnlocked(accountId, name);
    const server = getServer(accountId, name);
    if (!usesOAuth(server)) return inspectUnlocked(accountId, name);
    const state = crypto.randomUUID(), serverUrl = new URL(server.url);
    let redirect;
    const authProvider = new m.McpOAuthProvider({accountId, serverName: name, settings: server, state, onRedirect: url => { redirect = url; }});
    const transport = new m.StreamableHTTPClientTransport(serverUrl, {authProvider, fetch: m.secureOAuthFetch}), client = new m.Client({name: 'aux-browser', version: m.DAEMON_VERSION});
    const flow = {accountId, serverName: name, state, client, transport};
    let startedAuthorization = false;
    try {
      if (!await authProvider.tokens()) {
        startedAuthorization = true;
        if (await m.auth(authProvider, {serverUrl, fetchFn: m.secureOAuthFetch}) === 'REDIRECT') {
          if (!redirect) throw new m.UnauthorizedError('OAuth authorization URL was not provided.');
          return startOAuthFlow(flow, redirect);
        }
      }
      await client.connect(transport, {timeout: CONNECT_TIMEOUT_MS});
      cacheInventory(accountId, name, server, await m.listAllMcpTools(client, m.MCP_TOOL_LIST_TOTAL_TIMEOUT_MS));
      await client.close();
      return remember(accountId, name, await connectedStatus(accountId, name, server));
    } catch (error) {
      if (error instanceof m.UnauthorizedError && redirect) return startOAuthFlow(flow, redirect);
      await client.close().catch(() => undefined);
      if (error instanceof m.UnauthorizedError) return remember(accountId, name, {status: 'invalid_server', message: 'OAuth setup could not be completed. Check the server URL and OAuth client settings.'});
      const failure = m.classifyMcpConnectionFailure(error);
      return remember(accountId, name, startedAuthorization && failure.type === 'invalid_server' && error instanceof Error
        ? {status: 'invalid_server', authStatus: 'required', message: error.message} : await failureStatus(accountId, name, server, failure));
    }
  }

  const inspectMcpConnection = (accountId, name) => withLock(accountId, name, () => inspectUnlocked(accountId, name));

  async function migrateUnlocked(accountId) {
    const store = m.settings(accountId), mcp = store.get('mcp');
    if (mcp.toolInventoryMigrationVersion === 1) return;
    const missing = Object.entries(mcp.servers).filter(([name, server]) => server.enabled && !mcp.inventories[name]);
    await Promise.allSettled(missing.map(([name]) => inspectMcpConnection(accountId, name)));
    store.set('mcp', current => {
      for (const [name, server] of missing) {
        const saved = current.servers[name];
        if (saved && !current.inventories[name] && m.isEqual(saved, server)) saved.enabled = false;
      }
      current.toolInventoryMigrationVersion = 1;
      return current;
    });
  }

  /** Servers saved before inventories existed: inspected once, and disabled if that fails. */
  async function migrateLegacyMcpInventories(accountId) {
    const running = migrations.get(accountId);
    if (running) return running;
    const migration = migrateUnlocked(accountId);
    migrations.set(accountId, migration);
    try {
      await migration;
    } finally {
      if (migrations.get(accountId) === migration) migrations.delete(accountId);
    }
  }

  const getMcpConnectionStatus = (accountId, name) => withLock(accountId, name, async () => {
    const known = statuses.get(key(accountId, name));
    if (known) return known;
    const mcp = m.settings(accountId).get('mcp'), server = mcp.servers[name];
    if (!server) throw Error(`Unknown MCP server '${name}'.`);
    return mcp.inventories[name] ? connectedStatus(accountId, name, server) : {status: 'connect'};
  });

  const connectMcpServer = (accountId, name) => withLock(accountId, name, () => connectUnlocked(accountId, name));

  /** The OAuth redirect came back; `state` names the flow it belongs to. */
  async function finishMcpOAuthFlow(state, code, error) {
    const flow = flows.get(state);
    if (!flow) throw Error(FLOW_GONE);
    const {accountId, serverName, client, transport} = flow;
    return withLock(accountId, serverName, async () => {
      if (flows.get(state) !== flow) throw Error(FLOW_GONE);
      detachFlow(flow);
      if (error || !code) {
        remember(accountId, serverName, {status: 'connect', message: error === 'access_denied' ? 'Authorization was cancelled.' : 'Authorization failed.'});
        await client.close().catch(() => undefined);
        await m.clearMcpCodeVerifier(accountId, serverName);
        return error === 'access_denied' ? 'cancelled' : 'failed';
      }
      try {
        await transport.finishAuth(code);
        await client.close().catch(() => undefined);
        await inspectUnlocked(accountId, serverName);
        return 'connected';
      } catch (failure) {
        await client.close().catch(() => undefined);
        remember(accountId, serverName, {status: 'reconnect', message: AUTHORIZATION_FAILED});
        throw Error(AUTHORIZATION_FAILED, {cause: failure});
      } finally {
        await m.clearMcpCodeVerifier(accountId, serverName);
      }
    });
  }

  const cancelMcpConnection = (accountId, name) => withLock(accountId, name, () => cancelUnlocked(accountId, name));

  const disconnectMcpServer = (accountId, name) => withLock(accountId, name, async () => {
    await cancelUnlocked(accountId, name);
    await m.clearMcpOAuthCredential(accountId, name);
    return remember(accountId, name, {status: 'connect'});
  });

  const forgetMcpConnectionStatus = (accountId, name) => { statuses.delete(key(accountId, name)); };

  return {inspectMcpConnection, migrateLegacyMcpInventories, getMcpConnectionStatus, connectMcpServer, finishMcpOAuthFlow, cancelMcpConnection, disconnectMcpServer, forgetMcpConnectionStatus};
}
