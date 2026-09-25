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
  resources: [
    {
      resourceId: "repo",
      kind: "repository",
      projectId: "22222222-2222-4222-8222-222222222222",
      locator: "/synthetic/repo",
      label: "Repo",
      access: "read",
    },
  ],
});

it("keeps preview connector access bound to reviewed task grants and revocation", async () => {
  let github = true;
  const handlers = connectorFixtures(
    workspaceId,
    async () => [task],
    true,
    () => github,
  );
  const query = { workspaceId, taskId: task.taskId, expectedRevision: task.revision };
  const first = ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query));
  expect(first.access.map((item) => item.kind).sort()).toEqual(["github", "mcp"]);
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
      .sort(),
  ).toEqual(["calendar", "github", "mcp"]);
  await handlers["calendar.taskGrants.revoke"]({ taskId: task.taskId, grantId: grant.grantId });
  github = false;
  const after = ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query));
  expect(after.access.map((item) => item.kind)).toEqual(["mcp"]);
  const mcp = after.access.find((item) => item.kind === "mcp");
  if (mcp?.kind !== "mcp") throw new Error("Preview MCP grant is unavailable");
  await handlers["mcp.grants.revoke"]({ grantId: mcp.grantId });
  expect(ConnectorCatalogSchema.parse(await handlers["connectors.catalog"](query)).access).toEqual([]);
});
