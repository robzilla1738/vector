/** The daemon's end of the extension bridge: one WebSocket per browser profile, the `/extension`,
 * `/` and `/command` routes, and each command's request, timeout and cancellation. The bound
 * browser actions and the window lookups it calls stay the supplied ones. */
const PING_INTERVAL_MS = 5e3, STALE_TIMEOUT_MS = 15e3, CONNECT_TIMEOUT_MS = 8e3;
const WAIT_FOR_DOWNLOAD_MARGIN_MS = 1e3, DEFAULT_COMMAND_TIMEOUT_MS = 3e4;
const SOCKET_OPEN = 1;

const connectionKey = (accountId, profileId, browserMode) => `${accountId}:${profileId}:${browserMode}`;
const commandTimeoutMs = (command, timeoutMs) => timeoutMs ?? (command.method === 'Aux.waitForDownload' ? (command.params.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS) + WAIT_FOR_DOWNLOAD_MARGIN_MS : DEFAULT_COMMAND_TIMEOUT_MS);

function abortError(signal) {
  if (signal?.reason instanceof Error) return signal.reason;
  const error = Error('Extension command aborted');
  error.name = 'AbortError';
  return error;
}

const isOpen = connection => connection?.ws.readyState === SOCKET_OPEN;

export function create({Hono, bridge: b, logger}) {
  return class ExtensionBridgeServer {
    connections = new Map();
    disconnectHandlers = [];
    connectHandlers = [];
    pendingCommandRequests = new Map();
    nextRequestId = 1;

    onConnect(handler) {
      this.connectHandlers.push(handler);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        const index = this.connectHandlers.indexOf(handler);
        if (index >= 0) this.connectHandlers.splice(index, 1);
      };
    }

    onDisconnect(handler) {
      this.disconnectHandlers.push(handler);
    }

    get isExtensionConnected() {
      return [...this.connections.values()].some(isOpen);
    }

    listConnectedProfiles(accountId, browserMode = 'default') {
      return [...this.connections.values()].filter(connection => connection.accountId === accountId && connection.browserMode === browserMode && isOpen(connection))
        .map(({connectionId, profileId}) => ({accountId, connectionId, profileId, browserMode}));
    }

    /** Takes a register message; the connection it makes, once it is the profile's. */
    #register(ws, {connectionId, route: {accountId, profileId, browserMode}}) {
      const key = connectionKey(accountId, profileId, browserMode), previous = this.connections.get(key);
      const connection = {accountId, browserMode, connectionId, profileId, ws, lastPongAt: Date.now(), keepAlive: setInterval(() => {
        if (this.connections.get(key) !== connection) return;
        if (Date.now() - connection.lastPongAt > STALE_TIMEOUT_MS) {
          console.warn('[ExtensionBridge] Profile bridge heartbeat timed out', {profileId, accountId, browserMode});
          b.safeWebsocketClose(ws, 1011, 'heartbeat timeout');
          return;
        }
        b.safeWebsocketSend(ws, {method: 'ping'});
      }, PING_INTERVAL_MS)};
      this.connections.set(key, connection);
      if (previous && previous.ws !== ws) {
        console.warn('[ExtensionBridge] Replacing bridge connection for browser profile', {profileId, browserMode});
        this.#drop(previous, 'replaced by newer connection');
        b.safeWebsocketClose(previous.ws, 1012, 'replaced by newer connection');
      }
      b.safeWebsocketSend(ws, {method: 'registered', connectionId: connection.connectionId});
      logger.info('🟢 Extension bridge connected', {profileId, accountId, browserMode});
      for (const handler of this.connectHandlers) handler(connection);
      return connection;
    }

    #settle(connection, reply) {
      const pending = this.pendingCommandRequests.get(reply.id);
      if (!pending || pending.connectionId !== connection.connectionId) return;
      this.pendingCommandRequests.delete(reply.id);
      clearTimeout(pending.timeout);
      if (reply.error) pending.reject(pending.boundBrowserAction ? b.markSettledBrowserActionError(Error(reply.error)) : Error(reply.error));
      else pending.resolve(reply.result);
    }

    #isCurrent(connection) {
      return !!connection && this.connections.get(connectionKey(connection.accountId, connection.profileId, connection.browserMode)) === connection;
    }

    #onSocketMessage(ws, data, current) {
      let message;
      try {
        message = b.parseWsData(data);
      } catch {
        return current;
      }
      const registration = b.protocol.registerMessageSchema.safeParse(message);
      if (registration.success) {
        if (current) {
          b.safeWebsocketClose(ws, 1008, 'duplicate registration');
          return current;
        }
        return this.#register(ws, registration.data);
      }
      if (!this.#isCurrent(current)) return current;
      if (message?.method === 'aux.browserActionEvent' && typeof message.taskId === 'string' && message.context && message.event && typeof message.event.method === 'string') {
        for (const handler of b.browserEventHandlers) {
          try {
            handler({message, connection: current});
          } catch { /* A handler's failure is its own. */ }
        }
        return current;
      }
      if (b.protocol.pingMessageResponseSchema.safeParse(message).data) {
        current.lastPongAt = Date.now();
        return current;
      }
      const reply = b.protocol.runCommandMessageResponseSchema.safeParse(message).data;
      if (reply) this.#settle(current, reply);
      return current;
    }

    #socketEvents(context) {
      let socket = null, connection = null;
      return {
        onOpen: (event, ws) => {
          socket = ws;
          const origin = context.req.header('origin');
          if (origin && !origin.startsWith('chrome-extension://')) ws.close?.(1008, 'invalid origin');
          else if (!b.isConnectedFromLocalhost(context)) ws.close?.(1008, 'forbidden');
        },
        onMessage: event => {
          if (socket) connection = this.#onSocketMessage(socket, event.data, connection);
        },
        onClose: event => {
          if (!this.#isCurrent(connection)) return;
          logger.warn('🔴 Extension bridge disconnected', {code: event.code, profileId: connection.profileId, accountId: connection.accountId, browserMode: connection.browserMode});
          this.#drop(connection, 'extension disconnected');
        },
      };
    }

    #status(context) {
      const account = context.req.query('accountId'), accountId = account === undefined ? undefined : Number(account), profileId = context.req.query('profileId');
      const mode = b.browserModeSchema.safeParse(context.req.query('browserMode') ?? 'default');
      if (!mode.success) return context.json({error: 'Invalid browser mode'}, 400);
      const browserMode = mode.data;
      const exact = profileId && accountId !== undefined ? this.connections.get(connectionKey(accountId, profileId, browserMode)) : undefined;
      const any = profileId && accountId === undefined ? [...this.connections.values()].find(connection => connection.profileId === profileId && connection.browserMode === browserMode) : undefined;
      return context.json({connected: profileId ? isOpen(exact ?? any) : this.isExtensionConnected, connectionCount: this.connections.size});
    }

    async #command(context) {
      if (!b.isConnectedFromLocalhost(context)) return context.json({error: 'forbidden'}, 403);
      try {
        const {command, route} = b.protocol.commandRequestSchema.parse(await context.req.json());
        if (command.method === 'Aux.pickDirectory' || command.method === 'Aux.openProfileUrl') {
          const origin = context.req.header('origin');
          if (!origin || !b.isTrustedLocalUiOrigin(origin)) return context.json({error: 'forbidden'}, 403);
        }
        return context.json(await this.sendCommandToExtension(command, route));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[ExtensionBridge] /command failed:', message);
        return context.json({error: message}, 500);
      }
    }

    createRouter() {
      const router = new Hono();
      router.get('/', context => this.#status(context));
      router.get('/extension', b.upgradeWebSocket(context => this.#socketEvents(context)));
      router.post('/command', context => this.#command(context));
      return router;
    }

    async sendCommandToExtension(command, route = {}) {
      if (b.usesBoundBrowserActions()) return await b.runOwnedBrowserAction(this, command, route, (next, options) => this.#sendBrowserCommand(next, options));
      b.requireSupervisedTasks();
      return await this.#sendBrowserCommand(command, route);
    }

    async auxCloseBoundBrowserTask(taskId, context, options) {
      if (typeof taskId !== 'string' || !context || !options?.profileId || !Number.isSafeInteger(options.accountId) || options.browserMode !== 'default'
        || !this.listConnectedProfiles(options.accountId).some(profile => profile.profileId === options.profileId && profile.connectionId === options.connectionId))
        throw Error('Original browser task connection is required for closure');
      return await this.#sendBrowserCommand({method: 'Aux.runBoundBrowserAction', params: {taskId, context, command: {method: 'Aux.debuggerCloseTask', params: {}}}},
        {accountId: options.accountId, profileId: options.profileId, browserMode: 'default', windowId: options.windowId, auxBoundBrowserAction: true});
    }

    /** The two commands the daemon answers itself; undefined for the rest. */
    async #answerLocally(command, route) {
      if (command.method === 'Aux.openProfileUrl' && route.browserMode !== 'incognito') {
        const found = route.accountId === undefined || !route.profileId ? this.#connection(route) : undefined;
        const accountId = route.accountId ?? found?.accountId, profileId = route.profileId ?? found?.profileId;
        if (accountId === undefined || !profileId) throw Error('Browser profile route is required to open a URL');
        await b.ensureProfileWindow(accountId, profileId, command.params.url, true);
        return {success: true};
      }
      return command.method === 'Aux.pickDirectory' ? b.pickDirectory(command.params) : undefined;
    }

    async #sendBrowserCommand(command, route = {}) {
      const local = await this.#answerLocally(command, route);
      if (local !== undefined) return local;
      const connection = await this.#awaitConnection(route, route.timeoutMs ?? CONNECT_TIMEOUT_MS, route.signal);
      if (route.signal?.aborted) throw abortError(route.signal);
      const {ws} = connection, id = this.nextRequestId++;
      const request = {id, method: 'runCommand', command, route: {accountId: connection.accountId, profileId: connection.profileId, browserMode: connection.browserMode, ...route.windowId === undefined ? {} : {windowId: route.windowId}}};
      const {resolve, reject, promise} = Promise.withResolvers();
      const timeout = setTimeout(() => {
        if (route.auxBoundBrowserAction) {
          const error = Error(`Browser action settlement timed out: ${command.method}`);
          b.safeWebsocketSend(ws, {id, method: 'cancelCommand'});
          route.auxCancelBoundBrowserAction?.(error);
          return;
        }
        this.pendingCommandRequests.delete(id);
        if (route.logTimeout !== false) console.warn('[CDPRelayServer] Extension command timeout', {id, method: command.method});
        reject(Error(`extension request timeout: ${command.method}`));
      }, commandTimeoutMs(command, route.timeoutMs));
      this.pendingCommandRequests.set(id, {connectionId: connection.connectionId, resolve, reject, timeout, boundBrowserAction: !!route.auxBoundBrowserAction});
      let sent = false;
      const onAbort = route.signal ? () => {
        clearTimeout(timeout);
        if (sent) {
          b.safeWebsocketSend(ws, {id, method: 'cancelCommand'});
          if (route.auxBoundBrowserAction) return;
        }
        this.pendingCommandRequests.delete(id);
        reject(abortError(route.signal));
      } : undefined;
      route.signal?.addEventListener('abort', onAbort, {once: true});
      if (route.signal?.aborted) {
        onAbort?.();
        return await promise;
      }
      try {
        route.auxManagedWrite?.();
        ws.send(JSON.stringify(request));
        sent = true;
      } catch (error) {
        console.error(error);
        clearTimeout(timeout);
        this.pendingCommandRequests.delete(id);
        reject(error instanceof Error ? error : Error(String(error)));
      }
      try {
        return await promise;
      } finally {
        if (onAbort) route.signal?.removeEventListener('abort', onAbort);
      }
    }

    async #awaitConnection(route, timeoutMs, signal) {
      const found = this.#connection(route);
      if (found) return found;
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        await b.sleep(50, signal);
        const connection = this.#connection(route);
        if (connection) return connection;
      }
      throw Error('Chrome extension not connected for the requested browser profile');
    }

    async stop() {
      for (const connection of this.connections.values()) {
        try {
          connection.ws.close?.(1001, 'server stopping');
        } catch { /* Already gone. */ }
        clearInterval(connection.keepAlive);
      }
      this.connections.clear();
      for (const pending of this.pendingCommandRequests.values()) {
        clearTimeout(pending.timeout);
        pending.reject(Error('extension disconnected'));
      }
      this.pendingCommandRequests.clear();
    }

    /** The open connection `route` names; more than one match is an error. */
    #connection(route) {
      const browserMode = route.browserMode ?? 'default';
      if (route.profileId && route.accountId !== undefined) {
        const connection = this.connections.get(connectionKey(route.accountId, route.profileId, browserMode));
        return isOpen(connection) ? connection : undefined;
      }
      const matches = [...this.connections.values()].filter(connection => isOpen(connection) && connection.browserMode === browserMode
        && (route.accountId === undefined || connection.accountId === route.accountId) && (route.profileId === undefined || connection.profileId === route.profileId));
      if (matches.length > 1) throw Error('Multiple browser profiles match this extension bridge command');
      return matches[0];
    }

    #drop(connection, reason) {
      clearInterval(connection.keepAlive);
      const key = connectionKey(connection.accountId, connection.profileId, connection.browserMode);
      if (this.connections.get(key) === connection) {
        this.connections.delete(key);
        for (const handler of this.disconnectHandlers) handler(connection);
      }
      for (const [id, pending] of this.pendingCommandRequests) {
        if (pending.connectionId !== connection.connectionId) continue;
        clearTimeout(pending.timeout);
        pending.reject(Error(reason));
        this.pendingCommandRequests.delete(id);
      }
    }
  };
}
