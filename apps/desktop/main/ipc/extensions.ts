import { dialog, ipcMain } from "electron";
import { extensionManager } from "../app/services.js";
import { profileSession } from "../native-views.js";
import { requireShellUi } from "../windows/registry.js";

export function wireExtensionsIpc() {
  ipcMain.handle("app.extensions", event => {
    requireShellUi(event);
    return extensionManager.list(profileSession());
  });
  ipcMain.handle("app.installUnpackedExtension", async event => {
    const state = requireShellUi(event);
    const selected = await dialog.showOpenDialog(state.win, { title: "Choose an unpacked Chrome extension", properties: ["openDirectory"] });
    if (selected.canceled || !selected.filePaths[0]) return null;
    return extensionManager.install(selected.filePaths[0], profileSession(), async details => {
      const permissionDetail = details.permissions.length ? details.permissions.join("\n") : "No permissions declared in the manifest.";
      const { response } = await dialog.showMessageBox(state.win, {
        type: "warning",
        title: "Install unpacked extension?",
        message: `${details.name} ${details.version}`,
        detail: `Extensions can read or change browser data according to their manifest. Aux installs the reviewed copy in this profile.\n\nDeclared access:\n${permissionDetail}`,
        buttons: ["Cancel", "Install extension"],
        defaultId: 0,
        cancelId: 0,
        noLink: true,
      });
      return response === 1;
    });
  });
  ipcMain.handle("app.updateUnpackedExtension", async (event, key: unknown) => {
    const state = requireShellUi(event);
    if (typeof key !== "string") throw new Error("Invalid extension.");
    const selected = await dialog.showOpenDialog(state.win, { title: "Choose the updated extension folder", properties: ["openDirectory"] });
    if (selected.canceled || !selected.filePaths[0]) return null;
    return extensionManager.update(key, selected.filePaths[0], profileSession(), async details => {
      const added = details.addedPermissions.length ? details.addedPermissions.join("\n") : "No additional declared access.";
      const declared = details.permissions.length ? details.permissions.join("\n") : "No permissions declared.";
      const decision = await dialog.showMessageBox(state.win, {
        type: "warning", title: "Update extension?", message: `${details.name}: ${details.fromVersion} → ${details.version}`,
        detail: `Aux will replace its installed copy. ${details.enabled ? "The extension will restart; reload affected pages if needed." : "The extension will remain disabled."}\n\nAdditional declared access:\n${added}\n\nAll declared access:\n${declared}`,
        buttons: ["Cancel", "Update extension"], defaultId: 0, cancelId: 0, noLink: true,
      });
      return decision.response === 1;
    });
  });
  ipcMain.handle("app.setExtensionEnabled", async (event, key: unknown, enabled: unknown) => {
    requireShellUi(event);
    if (typeof key !== "string" || typeof enabled !== "boolean") throw new Error("Invalid extension state.");
    return extensionManager.setEnabled(key, enabled, profileSession());
  });
  ipcMain.handle("app.removeExtension", async (event, key: unknown) => {
    const state = requireShellUi(event);
    if (typeof key !== "string") throw new Error("Invalid extension.");
    const extension = extensionManager.list(profileSession()).find(item => item.key === key && item.managed);
    if (!extension) throw new Error("The extension is no longer installed.");
    const { response } = await dialog.showMessageBox(state.win, {
      type: "warning",
      title: "Remove extension?",
      message: `Remove ${extension.name}?`,
      detail: "Aux will delete its managed copy and the extension’s profile data may remain until browser data is cleared.",
      buttons: ["Cancel", "Remove extension"],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
    });
    return response === 1 ? extensionManager.remove(key, profileSession()) : false;
  });
}
