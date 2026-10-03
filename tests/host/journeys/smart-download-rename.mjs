import { captureHomeJourneyState } from '../lib/home-capture.mjs';
import { withFailureEvidence } from '../lib/journey-diagnostics.mjs';
import { revealSettingsControl } from "../lib/settings-control.mjs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
const execute = promisify(execFile);
const shell = (name) => ({ role: "AXButton", name, match: "exact", scope: "shell", index: 0 });
export const journey = {
  id: "smart-download-rename",
  title: "Name a downloaded invoice and conditionally undo it",
  features: ["smartDownloadNames"],
  devAcceptance: ["smartDownloadNames", "commandRegistry"],
  needs: ["accessibility", "screen-recording"],
  model: "loopback",
  launch: {},
  timeoutMs: 180_000,
  owner: "L9",
  async prepare({ app }) {
    const downloads = join(app.userDataDir, "fixture-downloads");
    await mkdir(downloads, { recursive: true });
    await mkdir(join(app.userDataDir, "Default"), { recursive: true });
    await writeFile(
      join(app.userDataDir, "Default", "Preferences"),
      JSON.stringify({ download: { default_directory: downloads, prompt_for_download: false } }),
    );
  },
};
export function invoicePdf() {
  const stream = "BT /F1 24 Tf 72 700 Td (Invoice 4471) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let bytes = "%PDF-1.4\n";
  const positions = [0];
  objects.forEach((object, index) => {
    positions.push(Buffer.byteLength(bytes));
    bytes += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(bytes);
  bytes += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${positions
    .slice(1)
    .map((position) => `${String(position).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(bytes);
}
export async function run(t) {
  const downloads = join(t.app.userDataDir, "fixture-downloads");
  t.fixture.route(
    "/invoice",
    '<!doctype html><title>Invoice 4471</title><h1>Invoice 4471</h1><a href="/download.pdf?private=DO_NOT_SEND" download>Download invoice</a>',
  );
  t.fixture.route("/download.pdf", invoicePdf(), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="download.pdf"',
    },
  });
  await t.rpc("settings.set", {
    modelProvider: "openai-compatible",
    compatibleEndpoint: t.model.endpoint,
    plannerModel: t.model.model,
    agentModelRoutes: { fast: [{ modelId: t.model.model, reasoning: "low" }] },
  });
  const settings = {
    mode: "unclear",
    useAi: true,
    excludedHosts: [],
    excludedExtensions: [],
    excludedMimeTypes: [],
    template: "{date} {site} {title}",
  };
  async function saveNaming(mode) {
    await t.ax.key("command+,", "hid");
    await t.ax.waitFor(shell("Downloads"));
    await t.ax.press(shell("Downloads"));
    const renameMode = { name: "Rename downloads", match: "exact", scope: "shell", index: 0 };
    await t.ax.waitFor(renameMode);
    if (mode === "all") {
      await t.ax.click(renameMode);
      await t.ax.key("end", "hid");
      await t.ax.key("return", "hid");
    }
    await revealSettingsControl(t, shell("Save naming preferences"), "Downloads settings");
    await t.ax.press(shell("Save naming preferences"));
    await t.until("person naming preferences saved", async () => {
      const current = (await t.rpc("settings.get", {})).downloadNaming;
      return current?.mode === mode && current.useAi && current.template === settings.template && current;
    });
    await t.ax.key("escape", "hid");
  }
  await t.assert.rejects(t.rpc("downloads.renameReceipts", {}), error => error.code === "permission_denied");
  await saveNaming("unclear");
  t.model.respond((payload) => {
    const prompt = String(payload.messages.findLast((message) => message.role === "user").content);
    t.assert.ok(Buffer.byteLength(prompt) <= 2048);
    t.assert.ok(!prompt.includes("DO_NOT_SEND") && !prompt.includes("/download.pdf"));
    const metadata = JSON.parse(prompt);
    t.assert.match(metadata.firstPageText, /Invoice 4471/);
    return { content: JSON.stringify({ stem: "Invoice 4471" }) };
  });
  const page = await t.rpc("pages.open", { url: `${t.fixture.url}/invoice`, activate: true });
  await t.until("invoice fixture loaded", async () =>
    (await t.rpc("pages.list")).some((item) => item.pageId === page.pageId && !item.loading),
  );
  let receipt;
  await t.step(
    "download invoice through the page and observe a renamed native file",
    { kind: "ui", features: ["smartDownloadNames"] },
    async () => withFailureEvidence(t, "download-rename", async () => {
      await t.ax.press({ role: "AXLink", name: "Download invoice", match: "exact", scope: "page", index: 0 });
      receipt = await t.until("durable renamed invoice receipt", async () =>
        (await t.rpc("downloads.list", {})).find((item) => item.filename === "Invoice 4471.pdf" && item.state === "completed"),
      );
      const toast = { role: "AXStaticText", name: "Renamed to Invoice 4471.pdf", scope: "shell", index: 0 };
      await t.ax.waitFor(toast);
      await access(join(downloads, receipt.filename));
      const attributes = await execute("/usr/bin/xattr", [
        "-p",
        "com.apple.quarantine",
        join(downloads, receipt.filename),
      ]);
      t.assert.ok(attributes.stdout.trim(), "The same-directory rename must preserve quarantine");
      await captureHomeJourneyState(t, "download-renamed", "download-renamed-toast");
      return {
        ax: await t.ax.dump(),
        rpc: {
          receipt,
          downloads: await t.rpc("downloads.list"),
          quarantine: attributes.stdout.trim(),
          modelCalls: t.model.calls,
        },
      };
    }, async () => ({ downloads: (await t.rpc("downloads.list", {})).slice(-32),
      namingPreferences: (await t.rpc("settings.get", {})).downloadNaming, fixtureRequests: t.fixture.requests.slice(-16) })),
  );
  await t.step(
    "Undo the rename from the Downloads row after restarting",
    { kind: "ui", features: ["smartDownloadNames"] },
    async () => withFailureEvidence(t, "download-undo", async () => {
      const beforeRestartCalls = t.model.calls.length;
      await t.restart();
      t.assert.equal(
        t.model.calls.length,
        beforeRestartCalls,
        "Restored COMPLETE items must not trigger naming again",
      );
      t.assert.ok((await t.rpc("downloads.list", {})).some(item => item.id === receipt.id && item.filename === receipt.filename));
      await t.ax.key("command+shift+j", "hid");
      await t.ax.waitFor(shell("Undo rename"));
      await t.ax.press(shell("Undo rename"));
      await t.until(
        "original native filename restored",
        async () =>
          (await t.rpc("downloads.list", {})).some(item => item.id === receipt.id && item.filename === "download.pdf"),
      );
      await access(join(downloads, "download.pdf"));
      t.assert.equal(await readFile(join(downloads, "download.pdf"), "utf8"), invoicePdf().toString());
      await t.ax.waitFor({ role: "AXStaticText", name: "download.pdf", scope: "shell", index: 0 });
      await captureHomeJourneyState(t, "download-undo", "downloads-row-undo");
      return {
        ax: await t.ax.dump(),
        rpc: {
          restoredDownload: (await t.rpc("downloads.list", {})).find(item => item.id === receipt.id),
          downloads: await t.rpc("downloads.list"),
        },
      };
    }, async () => ({ downloads: (await t.rpc("downloads.list", {})).slice(-32),
      namingPreferences: (await t.rpc("settings.get", {})).downloadNaming, fixtureRequests: t.fixture.requests.slice(-16) })),
  );
  await t.step(
    "provider failure uses the template name",
    { kind: "ui", features: ["smartDownloadNames"] },
    async () => withFailureEvidence(t, "download-fallback", async () => {
      t.model.respond(() => {
        throw new Error("Fixture model 500");
      });
      await t.ax.key("escape", "hid");
      await saveNaming("all");
      await t.rpc("pages.activate", { pageId: page.pageId });
      await t.ax.press({ role: "AXLink", name: "Download invoice", match: "exact", scope: "page", index: 0 });
      const fallback = await t.until("template filename after model refusal", async () =>
        (await t.rpc("downloads.list", {})).find(
          (item) =>
            item.id !== receipt.id &&
            /^\d{4}-\d{2}-\d{2} 127\.0\.0\.1 Invoice 4471\.pdf$/.test(item.filename),
        ),
      );
      await access(join(downloads, fallback.filename));
      await t.ax.waitFor({
        role: "AXStaticText",
        name: `Renamed to ${fallback.filename}`,
        scope: "shell",
        index: 0,
      });
      await captureHomeJourneyState(t, "download-template-fallback", "download-template-fallback-toast");
      return {
        ax: await t.ax.dump(),
        rpc: { receipt: fallback, modelErrors: t.model.errors, downloads: await t.rpc("downloads.list") },
      };
    }, async () => ({ downloads: (await t.rpc("downloads.list", {})).slice(-32),
      namingPreferences: (await t.rpc("settings.get", {})).downloadNaming, fixtureRequests: t.fixture.requests.slice(-16) })),
  );
  await t.step(
    "a Save dialog download is never renamed",
    { kind: "ui", features: ["smartDownloadNames"] },
    async () => withFailureEvidence(t, "download-save-dialog", async () => {
      await t.app.quit();
      const path = join(t.app.userDataDir, "Default", "Preferences");
      const prefs = JSON.parse(await readFile(path, "utf8"));
      prefs.download.prompt_for_download = true;
      await writeFile(path, JSON.stringify(prefs));
      await t.restart();
      const before = (await t.rpc("downloads.list", {})).map(item => ({ id: item.id, filename: item.filename })),
        modelCalls = t.model.calls.length;
      const savePage = await t.rpc("pages.open", { url: `${t.fixture.url}/invoice`, activate: true });
      await t.until("save-dialog fixture loaded", async () =>
        (await t.rpc("pages.list")).some((item) => item.pageId === savePage.pageId && !item.loading),
      );
      await t.ax.press({ role: "AXLink", name: "Download invoice", match: "exact", scope: "page", index: 0 });
      await t.ax.waitFor({ role: "AXSheet", scope: "window", index: 0 });
      await t.ax.savePanel(join(downloads, "person-chosen.pdf"));
      await t.until("person-selected download complete", async () =>
        (await t.rpc("downloads.list")).some(
          (item) => item.filename === "person-chosen.pdf" && item.state === "completed",
        ),
      );
      const after = await t.rpc("downloads.list", {});
      for (const prior of before) t.assert.ok(after.some(item => item.id === prior.id && item.filename === prior.filename));
      t.assert.equal(after.length, before.length + 1, "One person-selected file must complete without a second naming operation");
      t.assert.equal(t.model.calls.length, modelCalls);
      await access(join(downloads, "person-chosen.pdf"));
      await captureHomeJourneyState(t, "download-save-dialog-refusal", "download-person-filename-preserved");
      return {
        ax: await t.ax.dump(),
        rpc: { unchangedPriorDownloads: before, downloads: await t.rpc("downloads.list"), modelCalls },
      };
    }, async () => ({ downloads: (await t.rpc("downloads.list", {})).slice(-32),
      namingPreferences: (await t.rpc("settings.get", {})).downloadNaming, fixtureRequests: t.fixture.requests.slice(-16) })),
  );
}
