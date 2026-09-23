import { dialog, ipcMain } from "electron";
import { readFileSync, writeFileSync } from "node:fs";
import { registry } from "../app/services.js";
import { runAutofill } from "../features/autofill.js";
import { pendingVaultSaves, runVaultFill } from "../features/vault.js";
import { channel } from "../runtime/supervisor.js";
import { requireOwnedEntry, requireShellUi } from "../windows/registry.js";

export function wireVaultIpc() {
  ipcMain.handle("ui.autofill", async (event, pageId: string) => {
    requireShellUi(event);
    const wc = registry.get(pageId)?.view.webContents;
    return wc && !wc.isDestroyed() ? runAutofill(wc.mainFrame) : false;
  });
  ipcMain.handle("ui.vaultFill", async (event, pageId: unknown, itemId: unknown) => {
    const state = requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId, "This tab is not available for sign-in fill.");
    if (typeof itemId !== "string" || !itemId) throw new Error("Choose a credential to fill.");
    await runVaultFill(entry.pageId, entry.view.webContents.mainFrame, itemId);
    return true;
  });
  ipcMain.handle("ui.vaultSave", async (event, pageId: unknown, origin: unknown) => {
    const state = requireShellUi(event);
    requireOwnedEntry(state, pageId, "That sign-in offer expired.");
    if (!channel) throw new Error("The browser runtime is not connected yet.");
    const key = `${pageId}:${origin}`;
    const pending = pendingVaultSaves.get(key);
    if (!pending || !registry.get(pending.pageId)) throw new Error("That sign-in offer expired.");
    pendingVaultSaves.delete(key);
    clearTimeout(pending.timer);
    if (pending.itemId) {
      await channel.call("api.invoke", { method: "vault.update", params: { itemId: pending.itemId, secret: pending.password }, desktopUser: true });
    } else {
      await channel.call("api.invoke", { method: "vault.save", params: { label: pending.username || pending.origin, origin: pending.origin, username: pending.username || undefined, secret: pending.password }, desktopUser: true });
    }
    return { ok: true, updated: !!pending.itemId };
  });
  ipcMain.handle("ui.vaultDismiss", (event, pageId: unknown, origin: unknown) => {
    const state = requireShellUi(event);
    requireOwnedEntry(state, pageId, "That sign-in offer expired.");
    const pending = pendingVaultSaves.get(`${pageId}:${origin}`);
    if (pending) { clearTimeout(pending.timer); pendingVaultSaves.delete(`${pageId}:${origin}`); }
    return true;
  });
  ipcMain.handle("ui.vaultExport", async (event) => {
    const state = requireShellUi(event);
    if (!channel) throw new Error("The browser runtime is not connected yet.");
    const result = await dialog.showSaveDialog(state.win, { title: "Export vault credentials", defaultPath: `aux-vault-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: "JSON", extensions: ["json"] }] });
    if (result.canceled || !result.filePath) return null;
    const data = await channel.call("api.invoke", { method: "vault.export", params: {}, desktopUser: true });
    writeFileSync(result.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    return { path: result.filePath };
  });
  ipcMain.handle("ui.vaultImport", async (event) => {
    const state = requireShellUi(event);
    if (!channel) throw new Error("The browser runtime is not connected yet.");
    const result = await dialog.showOpenDialog(state.win, { title: "Import vault credentials", filters: [{ name: "JSON", extensions: ["json"] }], properties: ["openFile"] });
    if (result.canceled || !result.filePaths[0]) return null;
    const parsed = JSON.parse(readFileSync(result.filePaths[0], "utf8")) as { items?: unknown };
    if (!Array.isArray(parsed.items)) throw new Error("That file is not an Aux vault export.");
    return channel.call("api.invoke", { method: "vault.import", params: { items: parsed.items }, desktopUser: true });
  });
}
