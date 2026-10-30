/** The MCP manager: one client per enabled server, opened on first use and dropped when its
 * connection fails. Transports, the SDK client and OAuth stay the supplied ones. */
const STDERR_TAIL = 2e3;

export function create({mcpManager: m}) {
  return class McpManager {
    #servers;
    #clients = new Map();
    #startupTimeoutMs;
    #toolTimeoutMs;
    #accountId;
    #closed = false;

    constructor({servers}, {startupTimeoutMs, toolTimeoutMs, accountId} = {}) {
      this.#servers = new Map(Object.entries(servers).filter(([, server]) => server.enabled));
      this.#startupTimeoutMs = startupTimeoutMs ?? m.DEFAULT_STARTUP_TIMEOUT_MS;
      this.#toolTimeoutMs = toolTimeoutMs ?? m.DEFAULT_TOOL_TIMEOUT_MS;
      this.#accountId = accountId;
    }

    /** The agent tools of the saved inventories, for the enabled servers. */
    initialize(inventories) {
      return m.createMcpAgentTools(this, [...this.#servers.keys()].flatMap(serverName => (inventories[serverName]?.tools ?? []).map(tool => ({serverName, tool}))));
    }

    async #listServer(serverName, server) {
      try {
        const tools = await m.listAllMcpTools(await this.#client(serverName, server), m.MCP_TOOL_LIST_TOTAL_TIMEOUT_MS);
        return {serverName, tools: tools.map(tool => ({serverName, tool})), failure: null};
      } catch (error) {
        await this.#clients.get(serverName)?.then(client => client.close()).catch(() => undefined);
        this.#clients.delete(serverName);
        return {serverName, tools: null, failure: m.classifyMcpConnectionFailure(error)};
      }
    }

    async listTools() {
      if (this.#closed) throw Error('MCP manager is closed.');
      const listed = await Promise.all([...this.#servers].map(([name, server]) => this.#listServer(name, server)));
      return {tools: listed.flatMap(({tools}) => tools ?? []), failures: Object.fromEntries(listed.flatMap(({serverName, failure}) => failure ? [[serverName, failure]] : []))};
    }

    #server(name) {
      const server = this.#servers.get(name);
      if (!server) throw Error(`Unknown MCP server '${name}'`);
      return server;
    }

    async testConnection(name) {
      await this.#client(name, this.#server(name));
    }

    async callTool(serverName, name, input, signal) {
      const server = this.#server(serverName);
      let client;
      try {
        client = await this.#client(serverName, server);
      } catch (error) {
        throw new m.McpConnectionError(error instanceof Error ? error.message : String(error), {cause: error});
      }
      try {
        return await client.request({method: 'tools/call', params: {name, arguments: input}}, m.CallToolResultSchema, {signal, timeout: this.#toolTimeoutMs});
      } catch (error) {
        if (!signal?.aborted && (!(error instanceof m.McpError) || error.code === m.ErrorCode.ConnectionClosed)) {
          this.#clients.delete(serverName);
          await client.close().catch(() => undefined);
        }
        if (error instanceof m.McpError || signal?.aborted) throw error;
        throw new m.McpConnectionError(error instanceof Error ? error.message : String(error), {cause: error});
      }
    }

    async shutdown() {
      const clients = [...this.#clients.values()];
      this.#closed = true;
      this.#clients.clear();
      await Promise.all(clients.map(client => client.then(open => open.close()).catch(() => undefined)));
    }

    #client(name, server) {
      if (this.#closed) throw Error('MCP manager is closed.');
      const existing = this.#clients.get(name);
      if (existing) return existing;
      const connecting = (async () => {
        const transport = await m.createTransport(name, server, this.#accountId);
        let stderr = '';
        if (transport instanceof m.StdioClientTransport) transport.stderr?.on('data', chunk => { stderr = `${stderr}${String(chunk)}`.slice(-STDERR_TAIL); });
        const client = new m.Client({name: 'aux-browser', version: m.DAEMON_VERSION});
        client.onclose = () => {
          if (this.#clients.get(name) === connecting) this.#clients.delete(name);
        };
        try {
          await client.connect(transport, {timeout: this.#startupTimeoutMs});
          return client;
        } catch (error) {
          this.#clients.delete(name);
          await transport.close().catch(() => {});
          if (transport instanceof m.StdioClientTransport) throw new m.McpStdioConnectionError(stderr.trim() || (error instanceof Error ? error.message : String(error)), {cause: error});
          throw error;
        }
      })();
      this.#clients.set(name, connecting);
      return connecting;
    }
  };
}
