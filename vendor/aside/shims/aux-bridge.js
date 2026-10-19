// Loopback bridge for the extension shim (aux-private-shim.js): signs the daemon's auth
// challenge with the installation key and reads other Chromium browsers' bookmarks and history
// for the importer. Only the two Aside extensions may call it, identified by their Origin,
// which web pages cannot forge.
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

  const support = path.join(os.homedir(), "Library", "Application Support");
  const IMPORT_SOURCES = [
    { id: "chrome", name: "Google Chrome", root: path.join(support, "Google", "Chrome") },
    { id: "edge", name: "Microsoft Edge", root: path.join(support, "Microsoft Edge") },
    { id: "brave", name: "Brave", root: path.join(support, "BraveSoftware", "Brave-Browser") },
    { id: "arc", name: "Arc", root: path.join(support, "Arc", "User Data") },
    { id: "dia", name: "Dia", root: path.join(support, "Dia", "User Data") },
    { id: "chatgpt-atlas", name: "ChatGPT Atlas", root: path.join(support, "com.openai.atlas", "browser-data", "host") },
    { id: "comet", name: "Comet", root: path.join(support, "Comet") },
  ];
  const readJson = (file) => {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return undefined;
    }
  };
  const profilesOf = (source) => {
    const state = readJson(path.join(source.root, "Local State"));
    const info = state?.profile?.info_cache ?? {};
    let ids = Object.keys(info);
    if (ids.length === 0) {
      try {
        ids = fs.readdirSync(source.root).filter((entry) => entry === "Default" || /^Profile \d+$/.test(entry));
      } catch {
        ids = [];
      }
    }
    return ids
      .filter((id) => fs.existsSync(path.join(source.root, id, "Bookmarks")) || fs.existsSync(path.join(source.root, id, "History")))
      .map((id) => ({ id, name: info[id]?.name || id }));
  };
  const importSources = () =>
    IMPORT_SOURCES.flatMap((source) => {
      if (!fs.existsSync(source.root)) return [];
      const profiles = profilesOf(source);
      return profiles.length ? [{ id: source.id, name: source.name, profiles, supportedDataKinds: ["bookmarks", "history"], requiresFileImport: false }] : [];
    });

  const readHistory = (file) => {
    if (!fs.existsSync(file)) return [];
    // Chromium keeps the live History database locked, so query a snapshot.
    const snapshot = path.join(os.tmpdir(), `aux-import-${process.pid}-${Date.now()}.sqlite`);
    try {
      fs.copyFileSync(file, snapshot);
      const output = process
        .getBuiltinModule("node:child_process")
        .execFileSync(
          "/usr/bin/sqlite3",
          ["-readonly", "-json", snapshot, "SELECT url, title, last_visit_time AS time FROM urls WHERE hidden = 0 AND (url LIKE 'http://%' OR url LIKE 'https://%') ORDER BY last_visit_time DESC LIMIT 3000"],
          { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
        );
      return output.trim() ? JSON.parse(output) : [];
    } finally {
      fs.rmSync(snapshot, { force: true });
    }
  };

  const readImport = ({ sourceId, profileId, dataKinds }) => {
    const source = IMPORT_SOURCES.find((entry) => entry.id === sourceId);
    if (!source || !profilesOf(source).some((profile) => profile.id === profileId)) throw new Error("Unknown browser profile.");
    const directory = path.join(source.root, profileId);
    const wants = (kind) => !dataKinds || dataKinds.includes(kind);
    return {
      bookmarks: wants("bookmarks") ? (readJson(path.join(directory, "Bookmarks"))?.roots ?? null) : null,
      history: wants("history") ? readHistory(path.join(directory, "History")) : [],
    };
  };

  const server = http.createServer((request, response) => {
    const origin = request.headers.origin;
    const allowed = origin && allowedOrigins.has(origin);
    if (process.env.AUX_BRIDGE_DEBUG) console.error("[aux-bridge]", request.method, request.url, origin ?? "no-origin");
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
        if (request.method !== "POST" || request.headers["x-aux-bridge"] !== "1") {
          response.writeHead(404, headers).end();
          return;
        }
        const json = (value) => response.writeHead(200, { ...headers, "content-type": "application/json" }).end(JSON.stringify(value));
        if (request.url === "/import/sources") return json(importSources());
        if (request.url === "/import/read") return json(readImport(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
        if (request.url !== "/account/sign") {
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
