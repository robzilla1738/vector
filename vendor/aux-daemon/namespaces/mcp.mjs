/** The `mcp` tRPC namespace: the account's MCP servers. A server that needs a connection check or
 * sign-in before use is saved disabled and enabled only once it connects. The MCP manager,
 * connections and OAuth secrets stay the supplied ones. */
export function create({accountProcedure, z, mcp: m}) {
  const serverInput = m.serverInput;
  const all = accountId => m.settings(accountId).getAll();
  return {
    testConnection: accountProcedure.input(z.object({name: m.serverNameSchema, server: m.serverSettingsSchema})).mutation(async ({ctx, input}) => {
      const manager = new m.McpManager({servers: {[input.name]: {...input.server, enabled: true}}}, {accountId: ctx.accountId, startupTimeoutMs: m.testTimeoutMs});
      try {
        await manager.testConnection(input.name);
        return {status: 'connected'};
      } finally {
        await manager.shutdown();
      }
    }),
    saveServer: accountProcedure.input(z.object({previousName: m.serverNameSchema.optional(), name: m.serverNameSchema, server: m.serverSettingsSchema, clientSecret: z.string().max(1e4).optional()}))
      .mutation(async ({ctx, input}) => {
        const store = m.settings(ctx.accountId), previousName = input.previousName ?? input.name, previous = store.get('mcp').servers[previousName];
        const changed = !!previous && (previousName !== input.name || !m.isEqual(previous, input.server));
        const needsCheck = input.server.enabled && (input.server.transport !== 'streamable-http' || input.server.auth.type !== 'auto');
        const saved = needsCheck ? {...input.server, enabled: false} : input.server;
        let {settings} = store.set('mcp', mcp => {
          if (changed) {
            delete mcp.inventories[previousName];
            delete mcp.inventories[input.name];
          }
          if (input.previousName && input.previousName !== input.name) delete mcp.servers[input.previousName];
          mcp.servers[input.name] = saved;
          return mcp;
        });
        let credentialError, connection;
        try {
          if (changed) {
            await m.disconnectMcpServer(ctx.accountId, previousName);
            m.forgetMcpConnectionStatus(ctx.accountId, previousName);
          }
          m.forgetMcpConnectionStatus(ctx.accountId, input.name);
          if (input.clientSecret !== undefined && input.server.transport === 'streamable-http' && input.server.auth.type === 'auto')
            await m.setMcpClientSecret(ctx.accountId, input.name, input.clientSecret);
          if (needsCheck) {
            connection = await m.inspectMcpConnection(ctx.accountId, input.name);
            settings = connection.status === 'connected' ? store.set('mcp', mcp => {
              const server = mcp.servers[input.name];
              if (server && m.isEqual(server, saved)) server.enabled = true;
              return mcp;
            }).settings : store.getAll();
          }
        } catch {
          credentialError = 'The server was saved, but its OAuth credential could not be updated.';
        }
        return {settings, credentialError, connection};
      }),
    deleteServer: accountProcedure.input(serverInput).mutation(async ({ctx, input}) => {
      const {settings} = m.settings(ctx.accountId).set('mcp', mcp => {
        delete mcp.servers[input.name];
        delete mcp.inventories[input.name];
        return mcp;
      });
      let credentialError;
      try {
        await m.disconnectMcpServer(ctx.accountId, input.name);
        m.forgetMcpConnectionStatus(ctx.accountId, input.name);
      } catch {
        credentialError = 'The server was deleted, but its OAuth credential could not be removed.';
      }
      return {settings, credentialError};
    }),
    setEnabled: accountProcedure.input(serverInput.extend({enabled: z.boolean()})).mutation(async ({ctx, input}) => {
      const store = m.settings(ctx.accountId), mcp = store.get('mcp');
      if (!mcp.servers[input.name]) throw Error(`Unknown MCP server '${input.name}'.`);
      if (!input.enabled) await m.cancelMcpConnection(ctx.accountId, input.name);
      m.forgetMcpConnectionStatus(ctx.accountId, input.name);
      if (input.enabled && !mcp.inventories[input.name]) {
        const connection = await m.inspectMcpConnection(ctx.accountId, input.name);
        if (connection.status !== 'connected' && connection.authStatus !== 'required') throw Error(connection.message ?? `Could not load tools from '${input.name}'.`);
      }
      return store.set('mcp', current => {
        const server = current.servers[input.name];
        if (!server) throw Error(`Unknown MCP server '${input.name}'.`);
        server.enabled = input.enabled;
        return current;
      }).settings;
    }),
    connect: accountProcedure.input(serverInput).mutation(async ({ctx, input}) => ({connection: await m.connectMcpServer(ctx.accountId, input.name), settings: all(ctx.accountId)})),
    connectionStatus: accountProcedure.input(serverInput).query(({ctx, input}) => m.getMcpConnectionStatus(ctx.accountId, input.name)),
    cancel: accountProcedure.input(serverInput).mutation(async ({ctx, input}) => ({connection: await m.cancelMcpConnection(ctx.accountId, input.name), settings: all(ctx.accountId)})),
    refreshTools: accountProcedure.input(serverInput).mutation(async ({ctx, input}) => ({connection: await m.inspectMcpConnection(ctx.accountId, input.name), settings: all(ctx.accountId)})),
  };
}
