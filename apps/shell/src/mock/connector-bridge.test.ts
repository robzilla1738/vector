// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { ConnectorCatalogSchema } from "@aux/contracts";
import type { AuxBridge } from "../bridge";
import { DEFAULT_SPACE } from "../workspace";
import { installMockBridge } from "./bridge";

afterEach(() => vi.unstubAllGlobals());

it("wires the connector preview through the same renderer bridge methods as Settings", async () => {
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });
  installMockBridge(new URLSearchParams("scenario=connectors"));
  const bridge = (window as unknown as { aux: AuxBridge }).aux;
  const workspaceId = `workspace:${DEFAULT_SPACE.id}`;
  const tasks = await bridge.invoke("tasks.list", { includeArchived: false, limit: 500 });
  const task = tasks.find((item) => item.resources.some((resource) => resource.kind === "repository"))!;
  const query = { workspaceId, taskId: task.taskId, expectedRevision: task.revision };
  const first = ConnectorCatalogSchema.parse(await bridge.invoke("connectors.catalog", query));
  expect(first.access.map((item) => item.kind).sort()).toEqual(["github", "mcp"]);
  const calendar = first.entries.find((item) => item.kind === "calendar");
  if (calendar?.kind !== "calendar") throw new Error("Preview Calendar account is unavailable");
  await bridge.invoke("calendar.taskGrants.create", {
    taskId: task.taskId,
    expectedRevision: task.revision,
    connectionId: calendar.connectionId,
  });
  const granted = ConnectorCatalogSchema.parse(await bridge.invoke("connectors.catalog", query));
  expect(granted.access.map((item) => item.kind).sort()).toEqual(["calendar", "github", "mcp"]);
  await bridge.invoke("settings.set", { githubCredential: "" });
  const disconnected = ConnectorCatalogSchema.parse(await bridge.invoke("connectors.catalog", query));
  expect(disconnected.access.map((item) => item.kind).sort()).toEqual(["calendar", "mcp"]);
});
