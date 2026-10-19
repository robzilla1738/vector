/**
 * Authenticated CDP front door for the browser, standing in for the secure debugging
 * endpoint Aside builds into its Chromium. The browser listens privately on `upstreamPort`;
 * this gate listens on `port`, runs the daemon's challenge/session handshake against the
 * installation key, and only then proxies HTTP and WebSocket traffic to the browser.
 */
import { createPublicKey, randomBytes, randomUUID, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer, request } from "node:http";
import { join } from "node:path";
import { WebSocket, WebSocketServer } from "ws";

const TOKEN_TTL_SECONDS = 86_400;
const CHALLENGE_TTL_MS = 30_000;
// Profile windows are an Aside-browser concept; a single stock window already satisfies them.
const LOCAL_COMMANDS = new Set(["Browser.ensureChromiumProfile", "Browser.ensureProfile"]);

export function startCdpGate({ port, upstreamPort, home, log = () => {} }) {
  const challenges = new Map();
  const tokens = new Map();

  const publicKey = () => createPublicKey(readFileSync(join(home, "install/sig.pem")));
  const json = (response, status, body) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  };
  const authorized = (header) => {
    const [kind, token] = String(header ?? "").split(" ");
    const expiry = kind === "AsideSessionToken" ? tokens.get(token) : undefined;
    return expiry !== undefined && expiry > Date.now();
  };
  const rewriteSocketUrl = (url) => url.replace(/^ws:\/\/[^/]+/, `ws://localhost:${port}`);

  const server = createServer(async (incoming, response) => {
    const url = new URL(incoming.url, "http://localhost");
    if (url.pathname === "/json/challenge" && incoming.method === "GET") {
      const challenge = randomBytes(32);
      const challengeId = randomUUID();
      challenges.set(challengeId, { challenge, expiresAt: Date.now() + CHALLENGE_TTL_MS });
      return json(response, 200, { challengeId, challenge: challenge.toString("base64") });
    }
    if (url.pathname === "/json/auth/session" && incoming.method === "POST") {
      const chunks = [];
      for await (const chunk of incoming) chunks.push(chunk);
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return json(response, 400, { error: "invalid body" });
      }
      const entry = challenges.get(body.challengeId);
      challenges.delete(body.challengeId);
      const valid =
        entry &&
        entry.expiresAt > Date.now() &&
        verify("sha256", entry.challenge, publicKey(), Buffer.from(String(body.signedChallenge), "base64"));
      if (!valid) return json(response, 401, { error: "Unauthorized" });
      const token = randomBytes(32).toString("base64url");
      tokens.set(token, Date.now() + TOKEN_TTL_SECONDS * 1000);
      return json(response, 200, { token_type: "AsideSessionToken", access_token: token, expiresInSeconds: TOKEN_TTL_SECONDS });
    }
    if (!authorized(incoming.headers.authorization)) return json(response, 401, { error: "Unauthorized" });

    const { authorization: _credentials, ...forwarded } = incoming.headers;
    const upstream = request(
      { host: "127.0.0.1", port: upstreamPort, path: incoming.url, method: incoming.method, headers: { ...forwarded, host: `127.0.0.1:${upstreamPort}` } },
      (answer) => {
        if (!url.pathname.startsWith("/json")) {
          response.writeHead(answer.statusCode ?? 502, answer.headers);
          return answer.pipe(response);
        }
        const chunks = [];
        answer.on("data", (chunk) => chunks.push(chunk));
        answer.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8").replace(/"(webSocketDebuggerUrl|devtoolsFrontendUrl)":\s*"([^"]*)"/g, (_, key, value) => `"${key}": "${rewriteSocketUrl(value)}"`);
          response.writeHead(answer.statusCode ?? 502, { "content-type": "application/json" });
          response.end(text);
        });
      },
    );
    upstream.on("error", () => json(response, 502, { error: "browser unavailable" }));
    incoming.pipe(upstream);
  });

  const sockets = new WebSocketServer({ noServer: true });
  server.on("upgrade", (incoming, socket, head) => {
    if (!authorized(incoming.headers.authorization)) {
      socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return;
    }
    sockets.handleUpgrade(incoming, socket, head, (client) => {
      const upstream = new WebSocket(`ws://127.0.0.1:${upstreamPort}${incoming.url}`, { perMessageDeflate: false });
      const pending = [];
      client.on("message", (data, isBinary) => {
        const text = isBinary ? undefined : data.toString();
        if (text?.includes('"Browser.ensure')) {
          try {
            const message = JSON.parse(text);
            if (!message.sessionId && LOCAL_COMMANDS.has(message.method)) {
              client.send(JSON.stringify({ id: message.id, result: {} }));
              return;
            }
          } catch {
            // Not a command envelope; forward untouched.
          }
        }
        if (upstream.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
        else pending.push([data, isBinary]);
      });
      upstream.on("open", () => {
        for (const [data, isBinary] of pending) upstream.send(data, { binary: isBinary });
        pending.length = 0;
      });
      upstream.on("message", (data, isBinary) => client.readyState === WebSocket.OPEN && client.send(data, { binary: isBinary }));
      const closeBoth = () => {
        client.close();
        upstream.close();
      };
      client.on("close", closeBoth);
      upstream.on("close", closeBoth);
      upstream.on("error", (error) => {
        log(`cdp upstream error: ${error.message}`);
        client.close();
      });
      client.on("error", () => upstream.close());
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve({ port, close: () => new Promise((done) => (sockets.close(), server.close(done))) }));
  });
}
