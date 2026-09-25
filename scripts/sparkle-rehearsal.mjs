#!/usr/bin/env node
/** Local-only signed-update fixture preparation. Never installs or publishes. */
import { createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status !== 0)
    throw new Error(`${basename(command)} failed: ${result.error?.message ?? result.stderr?.trim()}`);
  return `${result.stdout}${result.stderr}`.trim();
}

function flags(argv) {
  const parsed = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    if (!argv[index]?.startsWith("--") || !argv[index + 1] || argv[index + 1].startsWith("--"))
      throw new Error("Every option needs a value.");
    parsed.set(argv[index], argv[index + 1]);
  }
  return parsed;
}

export function publicKeyForSeed(seed) {
  if (seed.length !== 32) throw new Error("Sparkle EdDSA private seed must be 32 bytes.");
  const key = createPrivateKey({
    key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]),
    format: "der",
    type: "pkcs8",
  });
  return createPublicKey(key).export({ format: "der", type: "spki" }).subarray(-32).toString("base64");
}

export function compareBuildVersions(left, right) {
  const parse = (value) => {
    if (!/^\d+(?:\.\d+)*$/.test(value))
      throw new Error("CFBundleVersion must be numeric for this rehearsal.");
    return value.split(".").map(Number);
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return Math.sign((a[index] ?? 0) - (b[index] ?? 0));
  }
  return 0;
}

const escapeXml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );

export function appcast({ url, shortVersion, buildVersion, signature, bytes, channel }) {
  if (!/^[A-Za-z0-9+/]{86}==$/.test(signature)) throw new Error("Sparkle EdDSA signature is invalid.");
  const channelXml = channel === "beta" ? "<sparkle:channel>beta</sparkle:channel>" : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"><channel><title>Aux local update rehearsal</title><item><title>Aux ${escapeXml(shortVersion)}</title><sparkle:version>${escapeXml(buildVersion)}</sparkle:version><sparkle:shortVersionString>${escapeXml(shortVersion)}</sparkle:shortVersionString><sparkle:minimumSystemVersion>12.0</sparkle:minimumSystemVersion>${channelXml}<enclosure url="${escapeXml(url)}" sparkle:edSignature="${signature}" length="${bytes}" type="application/octet-stream"/></item></channel></rss>\n`;
}

function readApp(path) {
  if (basename(path) !== "Aux.app") throw new Error("Use an Aux.app bundle for each rehearsal version.");
  const info = JSON.parse(
    run("plutil", ["-convert", "json", "-o", "-", join(path, "Contents", "Info.plist")]),
  );
  if (info.CFBundleIdentifier !== "dev.aux.browser") throw new Error("Rehearsal app bundle ID is not Aux.");
  run("codesign", ["--verify", "--deep", "--strict", path]);
  const signature = run("codesign", ["-dv", "--verbose=4", path]);
  const teamId = /TeamIdentifier=([A-Z0-9]{10})/.exec(signature)?.[1];
  if (!teamId || /Signature=adhoc/.test(signature))
    throw new Error("Sparkle delivery rehearsal requires Developer ID signed Aux builds.");
  if (!existsSync(join(path, "Contents", "Frameworks", "Sparkle.framework")))
    throw new Error("Signed Aux build does not bundle Sparkle.framework.");
  return {
    path,
    teamId,
    buildVersion: String(info.CFBundleVersion),
    shortVersion: String(info.CFBundleShortVersionString),
    publicKey: info.SUPublicEDKey,
    feed: info.SUFeedURL,
  };
}

function loopbackBase(value) {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Rehearsal feed base must be a plain loopback HTTP origin.");
  return url.origin;
}

function prepare(options) {
  const output = resolve(options.get("--output") ?? "");
  const keyPath = resolve(options.get("--key-file") ?? "");
  const appN = readApp(resolve(options.get("--app-n") ?? ""));
  const appNext = readApp(resolve(options.get("--app-next") ?? ""));
  const rollback = options.get("--rollback-app")
    ? readApp(resolve(options.get("--rollback-app")))
    : undefined;
  const base = loopbackBase(options.get("--base-url") ?? "");
  const channel = options.get("--channel") ?? "stable";
  if (!["stable", "beta"].includes(channel)) throw new Error("Rehearsal channel must be stable or beta.");
  if (existsSync(output)) throw new Error("Rehearsal output already exists; choose a clean directory.");
  const seed = Buffer.from(readFileSync(keyPath, "utf8").trim(), "base64");
  const publicKey = publicKeyForSeed(seed);
  const apps = [appN, appNext, ...(rollback ? [rollback] : [])];
  if (
    apps.some(
      (app) =>
        app.teamId !== appN.teamId || app.publicKey !== publicKey || app.feed !== `${base}/appcast.xml`,
    )
  )
    throw new Error("Rehearsal builds must share Team ID, fixture public key, and loopback appcast URL.");
  if (compareBuildVersions(appN.buildVersion, appNext.buildVersion) >= 0)
    throw new Error("N+1 CFBundleVersion must exceed N.");
  if (rollback && compareBuildVersions(appNext.buildVersion, rollback.buildVersion) >= 0)
    throw new Error("Rollback build needs a new, higher CFBundleVersion; Sparkle will not downgrade.");
  const signUpdate = resolve(options.get("--sign-update") ?? "");
  if (!existsSync(signUpdate))
    throw new Error("Supply the pinned Sparkle bin/sign_update with --sign-update.");
  mkdirSync(output, { recursive: true });
  const artifacts = [];
  for (const [phase, app] of [["upgrade", appNext], ...(rollback ? [["rollback", rollback]] : [])]) {
    const name = `Aux-${app.buildVersion}.zip`;
    const archive = join(output, name);
    run("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", app.path, archive]);
    const signature = run(signUpdate, ["-p", "--ed-key-file", keyPath, archive]);
    const xml = appcast({
      url: `${base}/${name}`,
      shortVersion: app.shortVersion,
      buildVersion: app.buildVersion,
      signature,
      bytes: statSync(archive).size,
      channel,
    });
    writeFileSync(join(output, `${phase}-appcast.xml`), xml);
    artifacts.push({
      phase,
      name,
      version: app.buildVersion,
      sha256: run("shasum", ["-a", "256", archive]).split(/\s/)[0],
    });
  }
  writeFileSync(
    join(output, "rehearsal.json"),
    `${JSON.stringify(
      { base, teamId: appN.teamId, publicKey, channel, from: appN.buildVersion, artifacts },
      null,
      2,
    )}\n`,
  );
  return {
    output,
    artifacts,
    publicKey,
    next: "Serve this directory, then use signed Aux N to check for updates.",
  };
}

function serve(options) {
  const directory = resolve(options.get("--output") ?? "");
  const phase = options.get("--phase") ?? "upgrade";
  const port = Number(options.get("--port") ?? "8765");
  if (!["upgrade", "rollback"].includes(phase) || !Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("Use --phase upgrade|rollback and a nonprivileged port.");
  const manifest = JSON.parse(readFileSync(join(directory, "rehearsal.json"), "utf8"));
  if (manifest.base !== `http://127.0.0.1:${port}`)
    throw new Error("Serve port must match the prepared loopback feed URL.");
  const names = new Set(manifest.artifacts.map((artifact) => artifact.name));
  const feed = join(directory, `${phase}-appcast.xml`);
  if (!existsSync(feed)) throw new Error(`No ${phase} feed was prepared.`);
  const server = createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405);
      response.end();
      return;
    }
    let name;
    try {
      name = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname).slice(1);
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }
    const path = name === "appcast.xml" ? feed : names.has(name) ? join(directory, name) : undefined;
    if (!path || !existsSync(path)) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": name === "appcast.xml" ? "application/xml" : "application/zip",
      "Content-Length": statSync(path).size,
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(path).pipe(response);
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(`Aux ${phase} feed: http://127.0.0.1:${port}/appcast.xml`),
  );
}

const [command, ...argv] = process.argv.slice(2);
if (command === "keygen") {
  const options = flags(argv);
  const output = resolve(options.get("--output") ?? "");
  if (existsSync(output)) throw new Error("Fixture key already exists; it will not be replaced.");
  const jwk = generateKeyPairSync("ed25519").privateKey.export({ format: "jwk" });
  const seed = Buffer.from(jwk.d, "base64url");
  writeFileSync(output, `${seed.toString("base64")}\n`, { mode: 0o600, flag: "wx" });
  console.log(JSON.stringify({ keyFile: output, publicKey: publicKeyForSeed(seed) }, null, 2));
} else if (command === "prepare") {
  console.log(JSON.stringify(prepare(flags(argv)), null, 2));
} else if (command === "serve") {
  serve(flags(argv));
} else if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  throw new Error("Use keygen, prepare, or serve. This script never installs or publishes an update.");
}
