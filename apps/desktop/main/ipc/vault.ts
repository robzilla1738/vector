import { dialog } from "electron";
import { lstatSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { VaultTransferPackageSchema, VaultTransferPassphraseSchema } from "@aux/contracts";
import { registry } from "../app/services.js";
import { runAutofill } from "../features/autofill.js";
import { pendingVaultSaves, runVaultFill } from "../features/vault.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { handleShell, requireOwnedEntry } from "../windows/registry.js";

export function wireVaultIpc() {
  handleShell("ui.autofill", async (_, pageId: string) => {
    const wc = registry.get(pageId)?.view.webContents;
    return wc && !wc.isDestroyed() ? runAutofill(wc.mainFrame) : false;
  });
  handleShell("ui.vaultFill", async (state, pageId: unknown, itemId: unknown) => {
    const entry = requireOwnedEntry(state, pageId, "This tab is not available for sign-in fill.");
    if (typeof itemId !== "string" || !itemId) throw new Error("Choose a credential to fill.");
    await runVaultFill(entry.pageId, entry.view.webContents.mainFrame, itemId);
    return true;
  });
  handleShell("ui.vaultSave", async (state, pageId: unknown, origin: unknown) => {
    requireOwnedEntry(state, pageId, "That sign-in offer expired.");
    requireRuntime("The browser runtime is not connected yet.");
    const key = `${pageId}:${origin}`;
    const pending = pendingVaultSaves.get(key);
    if (!pending || !registry.get(pending.pageId)) throw new Error("That sign-in offer expired.");
    pendingVaultSaves.delete(key);
    clearTimeout(pending.timer);
    if (pending.itemId) {
      await runtimeInvoke("vault.update", { itemId: pending.itemId, secret: pending.password });
    } else {
      await runtimeInvoke("vault.save", { label: pending.username || pending.origin, origin: pending.origin, username: pending.username || undefined, secret: pending.password });
    }
    return { ok: true, updated: !!pending.itemId };
  });
  handleShell("ui.vaultDismiss", (state, pageId: unknown, origin: unknown) => {
    requireOwnedEntry(state, pageId, "That sign-in offer expired.");
    const pending = pendingVaultSaves.get(`${pageId}:${origin}`);
    if (pending) { clearTimeout(pending.timer); pendingVaultSaves.delete(`${pageId}:${origin}`); }
    return true;
  });
  handleShell("ui.vaultExport", async (state, passphrase: unknown) => {
    VaultTransferPassphraseSchema.parse(passphrase);
    requireRuntime("The browser runtime is not connected yet.");
    const result = await dialog.showSaveDialog(state.win, { title: "Export encrypted vault credentials", defaultPath: `aux-vault-${new Date().toISOString().slice(0, 10)}.auxvault`, filters: [{ name: "Aux encrypted vault", extensions: ["auxvault"] }] });
    if (result.canceled || !result.filePath) return null;
    const data = await runtimeInvoke("vault.export", { passphrase });
    const temporary = join(dirname(result.filePath), `.auxvault-${randomUUID()}.tmp`);
    try {
      writeFileSync(temporary, JSON.stringify(data, null, 2), { mode: 0o600, flag: "wx" });
      renameSync(temporary, result.filePath);
    } finally { rmSync(temporary, { force: true }); }
    return { path: result.filePath };
  });
  handleShell("ui.vaultImport", async (state, passphrase: unknown) => {
    VaultTransferPassphraseSchema.parse(passphrase);
    requireRuntime("The browser runtime is not connected yet.");
    const result = await dialog.showOpenDialog(state.win, { title: "Import encrypted vault credentials", filters: [{ name: "Aux encrypted vault", extensions: ["auxvault"] }], properties: ["openFile"] });
    if (result.canceled || !result.filePaths[0]) return null;
    const info = lstatSync(result.filePaths[0]);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 4_100_000) throw new Error("That vault package is not a regular file or is too large.");
    const pkg = VaultTransferPackageSchema.parse(JSON.parse(readFileSync(result.filePaths[0], "utf8")));
    return runtimeInvoke("vault.import", { passphrase, package: pkg });
  });
}
