// Loopback bridge for the extension shim (aux-private-shim.js): signs the daemon's auth
// challenge with the installation key. Only the two Aside extensions may call it, identified
// by their Origin, which web pages cannot forge.
(() => {
  const http = process.getBuiltinModule("node:http");
  const crypto = process.getBuiltinModule("node:crypto");
  const fs = process.getBuiltinModule("node:fs");
  const os = process.getBuiltinModule("node:os");
  const path = process.getBuiltinModule("node:path");

  const port = (Number(process.env.ASIDE_PORT) || 21520) + 2;
  const home = process.env.ASIDE_HOME ? path.resolve(process.env.ASIDE_HOME) : path.join(os.homedir(), ".aux");
  const allowedOrigins = new Set([
    "chrome-extension://fjdhphbdlfjogobdofoaagnlnkoibdge",
    "chrome-extension://clcdgiameigmljcbkkcbjiljinmfkncl",
  ]);
  const prefix = Buffer.from("Aside Daemon Auth v1\0");

  const server = http.createServer((request, response) => {
    const origin = request.headers.origin;
    const allowed = origin && allowedOrigins.has(origin);
    const headers = {
      "access-control-allow-origin": allowed ? origin : "null",
      "access-control-allow-headers": "content-type, x-aux-bridge",
      "access-control-allow-methods": "POST, OPTIONS",
      vary: "origin",
    };
    if (!allowed) {
      response.writeHead(403, headers).end();
      return;
    }
    if (request.method === "OPTIONS") {
      response.writeHead(204, headers).end();
      return;
    }
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      try {
        if (request.method !== "POST" || request.url !== "/account/sign" || request.headers["x-aux-bridge"] !== "1") {
          response.writeHead(404, headers).end();
          return;
        }
        const { challenge } = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const key = crypto.createPrivateKey(fs.readFileSync(path.join(home, "install", "sig.pem")));
        const signedChallenge = crypto
          .sign("sha256", Buffer.concat([prefix, Buffer.from(challenge, "base64")]), key)
          .toString("base64");
        response.writeHead(200, { ...headers, "content-type": "application/json" }).end(JSON.stringify({ signedChallenge }));
      } catch (error) {
        response.writeHead(500, headers).end(JSON.stringify({ error: String(error?.message ?? error) }));
      }
    });
  });
  server.on("error", () => {});
  server.listen(port, "127.0.0.1");
  server.unref();
})();
