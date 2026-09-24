import { EvidenceCommandSelectionParams, MethodSchemas } from "@aux/contracts";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { projectCommands, registry } from "../app/services.js";
import { liveDownloads } from "../downloads/controller.js";
import { rendererMayInvoke } from "../renderer-methods.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { type RegularWindowState, handleShell } from "../windows/registry.js";

export function scopeRuntimeResult(method: string, result: unknown, state: RegularWindowState) {
  const owns = (page: unknown) => {
    const value = page as { windowId?: string; ownedByRuntime?: boolean };
    return value?.ownedByRuntime === true || (value?.windowId ?? PRIMARY_WINDOW_ID) === state.id;
  };
  if (method === "pages.list" && Array.isArray(result)) return result.filter(owns);
  if (method === "workspace.get" && result && typeof result === "object") {
    const workspace = result as { pages?: unknown[]; activePageId?: string | null; pendingRestoreTabs?: {pageId:string;windowId:string}[] };
    return { ...workspace, pages: (workspace.pages ?? []).filter(owns), pendingRestoreTabs:workspace.pendingRestoreTabs?.filter(tab=>tab.windowId===state.id), activePageId: state.focusedPageId };
  }
  return result;
}

export function wireRuntimeIpc() {
  handleShell("api.invoke", async (state, method: string, params: unknown) => {
    requireRuntime("runtime not connected");
    if (!rendererMayInvoke(method)) throw new Error("This action is not available from the Aux window.");
    if (method === "pages.open" && params && typeof params === "object") params = { ...params, windowId: state.id };
    const requestedPageId = params && typeof params === "object" && "pageId" in params ? (params as { pageId?: unknown }).pageId : undefined;
    if (typeof requestedPageId === "string") {
      const entry = registry.get(requestedPageId);
      if (entry && (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) throw new Error("That tab belongs to another Aux window.");
    }
    if (method === "runs.queue" || method === "runs.steer") {
      const selected = MethodSchemas["runs.queue"].parse(params);
      for (const pageId of selected.pageIds) {
        const entry = registry.get(pageId);
        if (entry && (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) throw new Error("That tab belongs to another Aux window.");
      }
    }
    if (method === "workspaces.browsingMemory.record" || method === "workspaces.contentMemory.capture") {
      const entry = typeof requestedPageId === "string" ? registry.get(requestedPageId) : undefined;
      if (!entry || entry.popup || entry.runtimeOwned || !state.win.isFocused() || state.overlayOpen || state.stagePageId !== requestedPageId || !entry.view.getVisible()) {
        if (method === "workspaces.contentMemory.capture") throw new Error("Select the visible tab before remembering its content.");
        return { recorded: false };
      }
    }
    if (method === "downloads.remove") {
      const selection = MethodSchemas["downloads.remove"].parse(params);
      params = { ids: selection.ids.filter(id => !liveDownloads.has(id)) };
      if (!(params as { ids: string[] }).ids.length) return { removed: [] };
    }
    if (method === "tasks.importCommandEvidence") {
      const selection = EvidenceCommandSelectionParams.parse(params);
      const command = projectCommands.list(selection.projectId).find(record => record.commandId === selection.commandId);
      if (!command || command.state === "running" || command.state === "stopping") throw new Error("Select a finished local command result.");
      params = {...selection, command};
    }
    const result = await runtimeInvoke(method, params, 60_000);
    return scopeRuntimeResult(method, result, state);
  });
}
