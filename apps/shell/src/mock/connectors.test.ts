import { expect, it } from "vitest";
import { ConnectorCatalogSchema, TaskSchema } from "@aux/contracts";
import { connectorFixtures } from "./connectors";

const workspaceId = "preview-space";
const task = TaskSchema.parse({
  taskId: "11111111-1111-4111-8111-111111111111",
  workspaceId,
  title: "Review project",
  objective: "Inspect the project",
  criteria: [{ criterionId: "review", description: "Review", verification: "manual" }],
  revision: 1,
  state: "open",
  createdAt: 1,
  updatedAt: 1,
});

it("keeps preview connector access bound to reviewed task grants and revocation", async () => {
  const handlers = connectorFixtures(workspaceId, async () => [task], true);
  const query = { workspaceId, taskId: task.taskId, expectedRevision: task.revision };
  const first = ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query));
  expect([...new Set(first.access.map((item) => item.kind))].sort()).toEqual(["mcp"]);
  const calendar = first.entries.find((item) => item.kind === "calendar");
  if (calendar?.kind !== "calendar") throw new Error("Preview Calendar account is unavailable");
  const grant = await handlers["calendar.taskGrants.create"]({
    taskId: task.taskId,
    expectedRevision: task.revision,
    connectionId: calendar.connectionId,
  });
  expect(
    ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query))
      .access.map((item) => item.kind)
      .filter((kind, index, kinds) => kinds.indexOf(kind) === index)
      .sort(),
  ).toEqual(["calendar", "mcp"]);
  await handlers["calendar.taskGrants.revoke"]({ taskId: task.taskId, grantId: grant.grantId });
  const after = ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query));
  expect([...new Set(after.access.map((item) => item.kind))]).toEqual(["mcp"]);
  const mcp = after.access.find((item) => item.kind === "mcp");
  if (mcp?.kind !== "mcp") throw new Error("Preview MCP tool is unavailable");
  await handlers["mcp.servers.revoke"]({ serverId: mcp.connectorId.slice("mcp:".length) });
  expect(ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query)).access).toEqual([]);
});
