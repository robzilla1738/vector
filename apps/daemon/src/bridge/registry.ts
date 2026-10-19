import { EventEmitter } from 'node:events';
import {
  type BridgeCommand,
  type BridgeRoute,
  bridgeRegistrationSchema,
} from '@aux/contracts';
import type { WebSocket } from 'ws';

interface Connection {
  socket: WebSocket;
  connectionId: string;
  route: BridgeRoute;
  lastPong: number;
}
interface Pending {
  connection: Connection;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}
const defaultAllowed = new Set([
  'chat.activate',
  'context.activity',
  'history.visits',
  'tabs.owned.create',
  'tabs.owned.list',
  'tabs.owned.close',
  'tabs.owned.navigate',
  'tabs.owned.release',
  'tabs.query',
  'tabs.create',
  'tabs.update',
  'tabs.remove',
  'tabs.get',
  'tabs.captureVisibleTab',
  'page.snapshot',
  'page.navigate',
  'page.screenshot',
  'page.click',
  'page.type',
  'page.scroll',
  'cdp.send',
  'downloads.wait',
]);
export class BridgeRegistry extends EventEmitter {
  private connections = new Map<string, Connection>();
  private pending = new Map<number, Pending>();
  private serial = 0;
  private timer: NodeJS.Timeout;
  constructor(private allowed = defaultAllowed) {
    super();
    this.timer = setInterval(() => {
      for (const connection of this.connections.values()) {
        if (Date.now() - connection.lastPong >= 15000)
          connection.socket.close(1008, 'Liveness timeout');
        else connection.socket.send(JSON.stringify({ method: 'ping' }));
      }
    }, 5000);
    this.timer.unref();
  }
  private key(route: BridgeRoute) {
    return JSON.stringify([
      route.accountId,
      route.profileId,
      route.browserMode,
    ]);
  }
  attach(socket: WebSocket) {
    let connection: Connection | undefined;
    socket.on('message', (bytes) => {
      try {
        const message = JSON.parse(bytes.toString());
        if (message.method === 'register') {
          if (connection) {
            socket.close(1008, 'Already registered');
            return;
          }
          const registration = bridgeRegistrationSchema.parse(message);
          connection = {
            socket,
            connectionId: registration.connectionId,
            route: registration.route,
            lastPong: Date.now(),
          };
          const old = this.connections.get(this.key(connection.route));
          this.connections.set(this.key(connection.route), connection);
          if (old) old.socket.close(1008, 'Replaced');
          socket.send(
            JSON.stringify({
              method: 'registered',
              connectionId: connection.connectionId,
            }),
          );
          this.emit('registered', connection);
          return;
        }
        if (!connection) {
          socket.close(1008, 'Registration required');
          return;
        }
        if (message.method === 'pong') {
          connection.lastPong = Date.now();
          return;
        }
        const pending = this.pending.get(message.id);
        if (!pending || pending.connection !== connection) return;
        clearTimeout(pending.timer);
        this.pending.delete(message.id);
        if (typeof message.error === 'string')
          pending.reject(new Error(message.error));
        else pending.resolve(message.result);
      } catch {
        socket.close(1008, 'Invalid bridge message');
      }
    });
    socket.on('close', () => {
      if (!connection) return;
      if (this.connections.get(this.key(connection.route)) === connection)
        this.connections.delete(this.key(connection.route));
      for (const [id, pending] of this.pending)
        if (pending.connection === connection) {
          clearTimeout(pending.timer);
          this.pending.delete(id);
          pending.reject(new Error('Extension disconnected'));
        }
    });
  }
  status(filter: Partial<BridgeRoute> = {}) {
    const count = [...this.connections.values()].filter((c) =>
      Object.entries(filter).every(
        ([key, value]) => c.route[key as keyof BridgeRoute] === value,
      ),
    ).length;
    return { connected: count > 0, connectionCount: count };
  }
  async acquire(route: BridgeRoute) {
    const existing = this.connections.get(this.key(route));
    if (existing) return existing;
    return new Promise<Connection>((resolve, reject) => {
      const onRegister = (connection: Connection) => {
        if (this.key(route) === this.key(connection.route)) {
          clearTimeout(timer);
          this.off('registered', onRegister);
          resolve(connection);
        }
      };
      const timer = setTimeout(() => {
        this.off('registered', onRegister);
        reject(new Error('Extension unavailable'));
      }, 8000);
      this.on('registered', onRegister);
    });
  }
  async command(
    route: BridgeRoute,
    command: BridgeCommand,
    options: { signal?: AbortSignal; timeoutMs?: number } = {},
  ) {
    if (!this.allowed.has(command.method))
      throw new Error('Extension command not allowed');
    if (command.method === 'cdp.send') {
      const method = command.params?.method;
      if (
        typeof method !== 'string' ||
        !/^(Page\.(navigate|captureScreenshot|getFrameTree)|Runtime\.(evaluate|callFunctionOn)|DOM\.(getDocument|describeNode|querySelector)|Input\.(dispatchMouseEvent|dispatchKeyEvent|insertText)|Target\.(getTargets|activateTarget)|Aux\.waitForDownload)$/.test(
          method,
        )
      )
        throw new Error('CDP command not allowed');
    }
    if (options.signal?.aborted) throw new Error('Command cancelled');
    const connection = await this.acquire(route);
    if (options.signal?.aborted) throw new Error('Command cancelled');
    const id = ++this.serial;
    const timeout =
      options.timeoutMs ??
      (command.method === 'downloads.wait'
        ? Number(command.params?.timeoutMs ?? 30000) + 1000
        : 30000);
    return new Promise<unknown>((resolve, reject) => {
      const abort = () => {
        const pending = this.pending.get(id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this.pending.delete(id);
        connection.socket.send(JSON.stringify({ method: 'cancelCommand', id }));
        reject(new Error('Command cancelled'));
      };
      const cleanResolve = (value: unknown) => {
          options.signal?.removeEventListener('abort', abort);
          resolve(value);
        },
        cleanReject = (error: Error) => {
          options.signal?.removeEventListener('abort', abort);
          reject(error);
        };
      const timer = setTimeout(
        () => {
          this.pending.delete(id);
          connection.socket.send(
            JSON.stringify({ method: 'cancelCommand', id }),
          );
          cleanReject(new Error('Command timed out'));
        },
        Math.min(Math.max(timeout, 1), 3600000),
      );
      this.pending.set(id, {
        connection,
        resolve: cleanResolve,
        reject: cleanReject,
        timer,
      });
      options.signal?.addEventListener('abort', abort, { once: true });
      connection.socket.send(
        JSON.stringify({ id, method: 'runCommand', command, route }),
      );
    });
  }
  close() {
    clearInterval(this.timer);
    for (const connection of this.connections.values())
      connection.socket.close(1001, 'Daemon shutdown');
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Daemon shutdown'));
    }
    this.pending.clear();
    this.connections.clear();
  }
}
