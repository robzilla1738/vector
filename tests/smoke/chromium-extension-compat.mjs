// Disposable Chromium extension capability matrix. No personal profile, account or remote site is used.
// Run with AUX_CANDIDATE_BIN=/absolute/path/to/out/AuxProof/.../MacOS/... for an Aux proof candidate.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  macNativeMessagingLocations,
  scanNativeMessagingLocations,
  validateNativeMessagingManifest,
} from "./native-messaging-manifests.mjs";

const root = resolve(import.meta.dirname, "../..");
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const candidate = process.env.AUX_CANDIDATE_BIN;
if (candidate) {
  assert.ok(existsSync(candidate), `Candidate executable missing: ${candidate}`);
  assert.match(
    realpathSync(candidate),
    /\/out\/(?:AuxProof|AuxDev)\/.*\/Contents\/MacOS\//,
    "Use an isolated compiled Aux candidate, not a reference browser",
  );
}
const temporary = mkdtempSync(join(tmpdir(), "aux-extension-compat-"));
const extension = join(temporary, "extension");
const profile = join(temporary, "profile");
const downloads = join(temporary, "downloads");
mkdirSync(extension);
mkdirSync(profile);
mkdirSync(downloads);
const manifest = {
  manifest_version: 3,
  name: "Aux local compatibility probe",
  version: "1.0.0",
  permissions: [
    "storage",
    "tabs",
    "downloads",
    "contextMenus",
    "cookies",
    "nativeMessaging",
    "declarativeNetRequest",
    "declarativeNetRequestFeedback",
    "management",
  ],
  host_permissions: ["http://127.0.0.1/*"],
  background: { service_worker: "worker.js" },
  action: { default_popup: "popup.html" },
  devtools_page: "devtools.html",
};
writeFileSync(join(extension, "manifest.json"), JSON.stringify(manifest));
writeFileSync(
  join(extension, "worker.js"),
  `const boot=crypto.randomUUID();
chrome.runtime.onInstalled.addListener(()=>{});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(message?.type==='aux-wake')reply({boot,echo:message.value});
});`,
);
writeFileSync(
  join(extension, "probe.html"),
  "<!doctype html><title>Aux extension probe</title><button id=popup>Open action popup</button><script src=probe.js></script>",
);
writeFileSync(
  join(extension, "probe.js"),
  `document.querySelector('#popup').onclick=async()=>{
  try { await chrome.action.openPopup(); document.body.dataset.popup='opened'; }
  catch(error) { document.body.dataset.popup=String(error); }
};`,
);
writeFileSync(
  join(extension, "popup.html"),
  "<!doctype html><title>Aux action popup</title><p id=aux-popup-proof>Action popup opened</p>",
);
writeFileSync(join(extension, "devtools.html"), "<!doctype html><script src=devtools.js></script>");
writeFileSync(
  join(extension, "devtools.js"),
  `chrome.storage.local.set({auxDevtoolsProbe:{panels:typeof chrome.devtools?.panels,
  inspectedWindow:typeof chrome.devtools?.inspectedWindow}});`,
);

const server = createServer((request, response) => {
  if (request.url?.startsWith("/download")) {
    response.setHeader("content-type", "text/plain");
    response.setHeader("content-disposition", "attachment; filename=aux-probe.txt");
    response.end("Aux synthetic download\n");
  } else {
    response.setHeader("content-type", "text/html");
    response.end("<!doctype html><title>Aux local fixture</title><h1>Local extension fixture</h1>");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const results = {};
const record = async (name, work, timeoutMs = 20_000) => {
  try {
    const detail = await Promise.race([
      work(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`timed out after ${timeoutMs} ms`)), timeoutMs),
      ),
    ]);
    results[name] = { status: "pass", detail };
  } catch (error) {
    results[name] = { status: "fail", reason: error instanceof Error ? error.message : String(error) };
  }
};
const hostScript = join(temporary, "native-host.cjs");
writeFileSync(
  hostScript,
  `#!/usr/bin/env node
let buffer=Buffer.alloc(0);
process.stdin.on('data',chunk=>{
  buffer=Buffer.concat([buffer,chunk]);
  while(buffer.length>=4){
    const size=buffer.readUInt32LE(0);if(size>1024*1024)process.exit(2);
    if(buffer.length<4+size)return;
    const payload=JSON.parse(buffer.subarray(4,4+size).toString('utf8'));
    buffer=buffer.subarray(4+size);
    const body=Buffer.from(JSON.stringify({echo:payload.probe,host:'aux.synthetic_echo'}));
    const header=Buffer.alloc(4);header.writeUInt32LE(body.length);
    process.stdout.write(Buffer.concat([header,body]));
  }
});
`,
);
chmodSync(hostScript, 0o700);

let context;
try {
  const options = {
    headless: false,
    ...(candidate ? { executablePath: realpathSync(candidate) } : {}),
    env: { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary },
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
      "--use-mock-keychain",
      "--password-store=basic",
      "--no-first-run",
    ],
    downloadsPath: downloads,
    acceptDownloads: true,
  };
  context = await chromium.launchPersistentContext(profile, options);
  const browserVersion = context.browser()?.version();
  const worker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker", { timeout: 30_000 }));
  const extensionId = new URL(worker.url()).host;
  const probe = await context.newPage();
  await probe.goto(`chrome-extension://${extensionId}/probe.html`);

  await record("runtimeSendMessage", async () => {
    const result = await probe.evaluate(() =>
      chrome.runtime.sendMessage({ type: "aux-wake", value: "initial" }),
    );
    assert.equal(result.echo, "initial");
    assert.match(result.boot, /^[0-9a-f-]{36}$/);
    return result;
  });
  await record(
    "mv3WorkerWakeAfter35Seconds",
    async () => {
      assert.equal(results.runtimeSendMessage.status, "pass");
      const before = results.runtimeSendMessage.detail.boot;
      // Stop the real worker before the wait so debugger attachment cannot mask the wake test.
      const session = await context.newCDPSession(probe);
      try {
        await session.send("ServiceWorker.enable");
        await session.send("ServiceWorker.stopAllWorkers");
        await new Promise((resolve) => setTimeout(resolve, 35_000));
        const result = await probe.evaluate(() =>
          chrome.runtime.sendMessage({ type: "aux-wake", value: "after-idle" }),
        );
        assert.equal(result.echo, "after-idle");
        assert.notEqual(
          result.boot,
          before,
          "The stopped worker must actually restart, not just answer while alive",
        );
        return {
          waitMs: 35000,
          stoppedWith: "ServiceWorker.stopAllWorkers",
          before,
          after: result.boot,
          echo: result.echo,
        };
      } finally {
        await session.detach();
      }
    },
    45_000,
  );

  await record("tabs", async () => {
    const result = await probe.evaluate(async (url) => {
      const tab = await chrome.tabs.create({ url, active: false });
      const found = await chrome.tabs.get(tab.id);
      const queried = (await chrome.tabs.query({})).some((item) => item.id === tab.id);
      await chrome.tabs.remove(tab.id);
      return { id: tab.id, found: found.id === tab.id, queried };
    }, base);
    assert.ok(result.found && result.queried);
    return result;
  });
  await record("downloads", async () => {
    const id = await probe.evaluate(
      (url) => chrome.downloads.download({ url, saveAs: false }),
      `${base}/download`,
    );
    let item;
    for (let attempt = 0; attempt < 40; attempt++) {
      item = await probe.evaluate((id) => chrome.downloads.search({ id }).then((items) => items[0]), id);
      if (item?.state === "complete" || item?.state === "interrupted") break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.equal(item?.state, "complete");
    return { id, state: item.state };
  });
  await record("contextMenus", async () => {
    const result = await probe.evaluate(async () => {
      await new Promise((resolve, reject) =>
        chrome.contextMenus.create(
          { id: "aux-local-probe", title: "Aux local probe", contexts: ["page"] },
          () => (chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve()),
        ),
      );
      await chrome.contextMenus.remove("aux-local-probe");
      return "create/remove succeeded";
    });
    return result;
  });
  await record("cookies", async () => {
    const result = await probe.evaluate(async (url) => {
      await chrome.cookies.set({ url, name: "aux_probe", value: "isolated" });
      const value = (await chrome.cookies.get({ url, name: "aux_probe" }))?.value;
      await chrome.cookies.remove({ url, name: "aux_probe" });
      return value;
    }, base);
    assert.equal(result, "isolated");
    return "set/get/remove succeeded";
  });
  await record("declarativeNetRequest", async () => {
    await probe.evaluate(
      async (url) =>
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [9001],
          addRules: [
            {
              id: 9001,
              priority: 1,
              action: { type: "block" },
              condition: { urlFilter: `${url}/blocked`, resourceTypes: ["xmlhttprequest"] },
            },
          ],
        }),
      base,
    );
    try {
      const page = await context.newPage();
      await page.goto(base);
      const outcome = await page.evaluate(async (url) => {
        const allowed = await fetch(`${url}/allowed`).then((response) => response.ok);
        const blocked = await fetch(`${url}/blocked`).then(
          () => false,
          () => true,
        );
        return { allowed, blocked };
      }, base);
      await page.close();
      assert.deepEqual(outcome, { allowed: true, blocked: true });
      return outcome;
    } finally {
      await probe
        .evaluate(() => chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [9001] }))
        .catch(() => {});
    }
  });
  await record(
    "actionPopup",
    async () => {
      const configured = await probe.evaluate(() => chrome.action.getPopup({}));
      assert.ok(configured.endsWith("popup.html"));
      const popup = context.waitForEvent("page", { timeout: 8_000 }).catch(() => null);
      await probe.locator("#popup").click();
      const opened = await popup;
      const promiseState = await probe.evaluate(() => document.body.dataset.popup ?? "unresolved");
      if (!opened || !opened.url().includes("popup.html")) {
        assert.equal(promiseState, "opened");
        return { openPopup: "resolved", browserPopupObservableByPlaywright: false };
      }
      assert.equal(await opened.locator("#aux-popup-proof").textContent(), "Action popup opened");
      await opened.close();
      return "browser action popup opened";
    },
    12_000,
  );
  if (
    results.actionPopup.status === "pass" &&
    results.actionPopup.detail?.browserPopupObservableByPlaywright === false
  )
    results.actionPopup.status = "partial";

  const hosts = join(profile, "NativeMessagingHosts");
  mkdirSync(hosts, { recursive: true });
  const echoManifest = join(hosts, "aux.synthetic_echo.json");
  writeFileSync(
    echoManifest,
    JSON.stringify({
      name: "aux.synthetic_echo",
      description: "Local synthetic echo host",
      path: hostScript,
      type: "stdio",
      allowed_origins: [`chrome-extension://${extensionId}/`],
    }),
  );
  assert.equal(validateNativeMessagingManifest(echoManifest).valid, true);
  const deniedManifest = join(hosts, "aux.synthetic_denied.json");
  const otherId = extensionId === "a".repeat(32) ? "b".repeat(32) : "a".repeat(32);
  writeFileSync(
    deniedManifest,
    JSON.stringify({
      name: "aux.synthetic_denied",
      description: "Denied synthetic host",
      path: hostScript,
      type: "stdio",
      allowed_origins: [`chrome-extension://${otherId}/`],
    }),
  );
  assert.equal(validateNativeMessagingManifest(deniedManifest).valid, true);
  await record("nativeMessaging", async () => {
    const result = await probe.evaluate(() =>
      chrome.runtime.sendNativeMessage("aux.synthetic_echo", { probe: "roundtrip" }),
    );
    assert.deepEqual(result, { echo: "roundtrip", host: "aux.synthetic_echo" });
    return result;
  });
  await record("nativeMessagingOriginGrant", async () => {
    const result = await probe.evaluate(async () => {
      try {
        await chrome.runtime.sendNativeMessage("aux.synthetic_denied", { probe: "should_not_launch" });
        return "accepted";
      } catch {
        return "rejected";
      }
    });
    assert.equal(result, "rejected");
    return "unlisted extension origin denied";
  });
  const hostDiscovery = scanNativeMessagingLocations(macNativeMessagingLocations(profile));

  await context.close();
  context = undefined;
  await record(
    "devTools",
    async () => {
      context = await chromium.launchPersistentContext(profile, {
        ...options,
        args: [...options.args, "--auto-open-devtools-for-tabs"],
      });
      const worker =
        context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker", { timeout: 30_000 }));
      const id = new URL(worker.url()).host;
      const tab = await context.newPage();
      await tab.goto(base);
      const extensionPage = await context.newPage();
      await extensionPage.goto(`chrome-extension://${id}/probe.html`);
      for (let attempt = 0; attempt < 30; attempt++) {
        const value = await extensionPage.evaluate(() =>
          chrome.storage.local.get("auxDevtoolsProbe").then((result) => result.auxDevtoolsProbe),
        );
        if (value) {
          assert.deepEqual(value, { panels: "object", inspectedWindow: "object" });
          return value;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error("Extension DevTools page did not report its API context");
    },
    25_000,
  );
  results.storeLifecycle = {
    status: "manual_gate",
    reason:
      "Live Chrome Web Store UI install, permission prompt, restart, update, and uninstall need a candidate UI review; unpacked loading does not prove Store lifecycle.",
  };
  const evidence = {
    at: new Date().toISOString(),
    scope: candidate ? "AuxProof/AuxDev compiled candidate" : "Chrome for Testing reference",
    binary: candidate ? realpathSync(candidate) : undefined,
    browser: browserVersion,
    extensionId,
    profile: "disposable",
    hostDiscovery,
    results,
  };
  const artifact = join(
    root,
    "release/test-artifacts",
    candidate ? "aux-candidate-extension-compat.json" : "chrome-reference-extension-compat.json",
  );
  mkdirSync(join(root, "release/test-artifacts"), { recursive: true });
  writeFileSync(artifact, JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
  if (Object.values(results).some((result) => result.status === "fail")) process.exitCode = 1;
} finally {
  await context?.close().catch(() => {});
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  rmSync(temporary, { recursive: true, force: true, maxRetries: 30, retryDelay: 200 });
}
