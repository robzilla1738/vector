import { describe, expect, it } from "vitest";
import {
  RoutineSchema,
  type ConnectorCatalog,
  type PageTarget,
  type ProfileOrganizationSnapshot,
} from "@aux/contracts";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
const page: PageTarget = {
  pageId: "a",
  backend: "aux",
  targetId: "target-a",
  windowId: "main",
  url: "https://mentions.test/a",
  title: "A",
  documentEpoch: 1,
  sessionId: "attachment-a",
  lastRevision: 0,
  viewStatus: "visible",
  lifecycle: "live",
  controller: "human",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
};
const tab = {
  kind: "tab" as const,
  pageId: page.pageId,
  url: page.url,
  title: page.title,
  documentEpoch: page.documentEpoch,
  sessionId: "attachment-a",
  access: "read" as const,
};
function fixture() {
  const pages = new Map([
    ["a", { ...page }],
    ["b", { ...page, pageId: "b", sessionId: "attachment-b" }],
  ]);
  let organization: ProfileOrganizationSnapshot = {
    revision: 1,
    shared: {
      spaces: [{ id: "space", name: "Research", color: "blue", grain: 0, workspaceId: "workspace" }],
      archivedSpaces: [],
      pins: {},
      folders: [],
      tabSpace: { a: "space" },
      order: ["a"],
      tabFolder: {},
      tabNames: {},
      splitGroups: [],
    },
  };
  let routine = RoutineSchema.parse({
    routineId: "skill",
    title: "Fixture skill",
    objective: "Read fixture",
    workspaceId: "workspace",
    revision: 1,
    createdAt: 1,
    updatedAt: 1,
  });
  let catalog: ConnectorCatalog = {
    entries: [
      {
        kind: "mcp",
        connectorId: "connector",
        serverId: "11111111-1111-4111-8111-111111111111",
        label: "Fixture",
        state: "active",
        authority: "connected_server",
      },
    ],
    access: [],
  };
  const service = new TurnMentionService({
    page: (id) => pages.get(id),
    organization: async () => organization,
    routine: (id) => (id === "skill" ? routine : undefined),
    connectors: () => catalog,
  });
  return {
    service,
    pages,
    setOrganization: (value: ProfileOrganizationSnapshot) => {
      organization = value;
    },
    organization: () => organization,
    updateSkill: () => {
      routine = { ...routine, revision: routine.revision + 1 };
    },
    setCatalog: (value: ConnectorCatalog) => {
      catalog = value;
    },
    catalog: () => catalog,
  };
}
describe("Profile-owned turn mention service", () => {
  it("validates real Space membership/revision and never gives it act access", async () => {
    const f = fixture();
    await f.service.begin(
      "run",
      [{ kind: "space", spaceId: "space", workspaceId: "workspace", revision: 1 }],
      [],
    );
    expect(await f.service.require("run", "a", "read")).toEqual({ status: "available" });
    expect(await f.service.require("run", "a", "act")).toMatchObject({ status: "unavailable" });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "unavailable" });
    f.setOrganization({ ...f.organization(), revision: 2 });
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
  });
  it("suppresses a pending observation if the Space revision changes during the read", async () => {
    const f = fixture();
    await f.service.begin(
      "run",
      [{ kind: "space", spaceId: "space", workspaceId: "workspace", revision: 1 }],
      [],
    );
    const result = await f.service.withPage("run", "a", "read", async () => {
      f.setOrganization({ ...f.organization(), revision: 2 });
      return "private observation";
    });
    expect(result).toMatchObject({ status: "unavailable" });
  });
  it("composes connector mentions with current reviewed tool grants and revokes both kinds at turn end", async () => {
    const f = fixture();
    await f.service.begin(
      "run",
      [
        { kind: "skill", routineId: "skill", revision: 1 },
        { kind: "connector", connectorId: "connector" },
      ],
      [],
      { workspaceId: "workspace", taskId: "task", taskRevision: 1 },
    );
    expect(f.service.requireSkill("run", "skill")).toEqual({ status: "available" });
    expect(f.service.requireConnector("run", "connector", "search")).toMatchObject({ status: "unavailable" });
    f.setCatalog({
      ...f.catalog(),
      access: [
        {
          kind: "mcp",
          connectorId: "connector",
          taskId: "11111111-1111-4111-8111-111111111111",
          taskRevision: 1,
          toolsRevision: 1,
          toolName: "search",
          authority: "enabled_mcp_tool",
        },
      ],
    });
    expect(f.service.requireConnector("run", "connector", "search")).toEqual({ status: "available" });
    expect(f.service.requireConnector("run", "connector", "send")).toMatchObject({ status: "unavailable" });
    expect(f.service.skills("run")[0]?.objective).toBe("Read fixture");
    f.updateSkill();
    expect(() => f.service.skills("run")).toThrow(/skill changed/);
    expect(f.service.requireSkill("run", "skill")).toMatchObject({ status: "unavailable" });
    f.service.end("run");
    expect(f.service.requireConnector("run", "connector", "search")).toMatchObject({ status: "unavailable" });
  });
  it("refuses dormant pages and revokes pending work when a turn ends", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], []);
    f.pages.set("a", { ...page, sessionId: undefined });
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    f.pages.set("a", { ...page });
    const read = await f.service.withPage("run", "a", "read", async () => {
      f.service.end("run");
      return "late observation";
    });
    expect(read).toMatchObject({ status: "unavailable" });
  });
  it("retires previous authority before awaiting a new Space and cancels the pending begin on end", async () => {
    let resolve!: (value: ProfileOrganizationSnapshot) => void;
    const f = fixture();
    const snapshot = new Promise<ProfileOrganizationSnapshot>((done) => {
      resolve = done;
    });
    const service = new TurnMentionService({
      page: (id) => f.pages.get(id),
      organization: () => snapshot,
      routine: () => undefined,
      connectors: () => ({ entries: [], access: [] }),
    });
    await service.begin("run", [tab], []);
    const pending = service.begin(
      "run",
      [{ kind: "space", spaceId: "space", workspaceId: "workspace", revision: 1 }],
      [],
    );
    expect(await service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    service.end("run");
    resolve(f.organization());
    await expect(pending).rejects.toThrow(/ended/);
    expect(service.has("run")).toBe(false);
  });

  it("keeps only the newest concurrent begin and never lets a late begin resurrect an older authority", async () => {
    let resolve!: (value: ProfileOrganizationSnapshot) => void;
    const f = fixture();
    const snapshot = new Promise<ProfileOrganizationSnapshot>((done) => {
      resolve = done;
    });
    const service = new TurnMentionService({
      page: (id) => f.pages.get(id),
      organization: () => snapshot,
      routine: () => undefined,
      connectors: () => ({ entries: [], access: [] }),
    });
    const older = service.begin(
      "run",
      [{ kind: "space", spaceId: "space", workspaceId: "workspace", revision: 1 }],
      [],
    );
    await service.begin("run", [tab], []);
    resolve(f.organization());
    await expect(older).rejects.toThrow(/ended/);
    expect(await service.require("run", "a", "read")).toEqual({ status: "available" });
    service.clear();
    expect(await service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
  });

  it("a rejected Space or skill revision cannot retain an older turn's grants", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], []);
    await expect(
      f.service.begin(
        "run",
        [{ kind: "space", spaceId: "space", workspaceId: "workspace", revision: 99 }],
        [],
      ),
    ).rejects.toThrow(/Space changed/);
    expect(f.service.has("run")).toBe(false);
    await f.service.begin("run", [tab], []);
    await expect(
      f.service.begin("run", [{ kind: "skill", routineId: "skill", revision: 99 }], []),
    ).rejects.toThrow(/skill changed/);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    expect(() => f.service.created("run", "a")).toThrow(/ended/);
  });
  it("fences a previously captured tool turn even when its replacement mentions the identical snapshot", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], []);
    const oldTurn = f.service.capture("run");
    await f.service.begin("run", [tab], []);
    await expect(f.service.assert("run", "a", "read", oldTurn)).rejects.toThrow(/turn changed/i);
    await expect(f.service.assert("run", "a", "read", f.service.capture("run"))).resolves.toBeUndefined();
  });

  it("failed answer acknowledgement retires only its own replacement generation", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], []);
    const old = f.service.capture("run");
    await f.service.begin("run", [tab], []);
    const replacement = f.service.capture("run");
    f.service.endIfCurrent("run", old);
    await expect(f.service.assert("run", "a", "read", replacement)).resolves.toBeUndefined();
    f.service.endIfCurrent("run", replacement);
    expect(f.service.has("run")).toBe(false);
    await expect(f.service.assert("run", "a", "read", replacement)).rejects.toThrow();
  });

  it("a failed human answer acknowledgement cannot leave newly selected page authority active", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], []);
    let commits = 0;
    await expect(
      f.service.acknowledge("run", [{ ...tab, pageId: "b", sessionId: "attachment-b" }], [], {}, () => {
        commits++;
        throw new Error("The pending question changed");
      }),
    ).rejects.toThrow(/question changed/);
    expect(commits).toBe(1);
    expect(f.service.has("run")).toBe(false);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "unavailable" });
  });
  it("a newer human message wins before an older acknowledgement commits", async () => {
    const f = fixture();
    let commits = 0;
    const older = f.service.acknowledge("run", [tab], [], {}, () => {
      commits++;
    });
    await f.service.begin("run", [{ ...tab, pageId: "b", sessionId: "attachment-b" }], []);
    await expect(older).rejects.toThrow(/turn changed/);
    expect(commits).toBe(0);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "available" });
  });
  it("preserves actual source authority without minting mentions, and narrows it for explicit refs", async () => {
    const f = fixture();
    await f.service.begin("run", [], []);
    let checks = 0,
      calls = 0;
    expect(
      await f.service.useSourcePage(
        "run",
        "a",
        "read",
        () => {
          checks++;
        },
        async () => {
          calls++;
          return "approved resource";
        },
      ),
    ).toBe("approved resource");
    expect(checks).toBe(3);
    expect(f.service.ownedPages("run")).toEqual([]);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    await f.service.begin("run", [tab], []);
    await expect(
      f.service.useSourcePage(
        "run",
        "b",
        "read",
        () => {
          checks++;
        },
        async () => {
          calls++;
        },
      ),
    ).rejects.toThrow();
    await expect(
      f.service.useSourcePage(
        "run",
        "a",
        "act",
        () => {
          checks++;
        },
        async () => {
          calls++;
        },
      ),
    ).rejects.toThrow();
    expect(calls).toBe(1);
  });
  it("suppresses source results after producer revocation, attachment drift, or replacement turn", async () => {
    const f = fixture();
    for (const change of ["revision", "attachment", "document", "turn"] as const) {
      await f.service.begin("run", [], []);
      f.pages.set("a", { ...page });
      let valid = true;
      await expect(
        f.service.useSourcePage(
          "run",
          "a",
          "read",
          () => {
            if (!valid) throw new Error("Source task revision changed");
          },
          async () => {
            if (change === "revision") valid = false;
            if (change === "attachment") f.pages.set("a", { ...page, sessionId: "replacement" });
            if (change === "document") f.pages.set("a", { ...page, documentEpoch: 2 });
            if (change === "turn") await f.service.begin("run", [], []);
            return "withheld";
          },
        ),
      ).rejects.toThrow();
    }
  });
  it("withholds connector results after current tool access is revoked", async () => {
    const f = fixture();
    const grant = {
      kind: "mcp" as const,
      connectorId: "connector",
      taskId: "11111111-1111-4111-8111-111111111111",
      taskRevision: 1,
      toolsRevision: 1,
      toolName: "search",
      authority: "enabled_mcp_tool" as const,
    };
    f.setCatalog({ ...f.catalog(), access: [grant] });
    await f.service.begin("run", [{ kind: "connector", connectorId: "connector" }], [], {
      workspaceId: "workspace",
    });
    expect(
      await f.service.useConnector("run", "connector", "search", async () => {
        f.setCatalog({ ...f.catalog(), access: [] });
        return "consumed once";
      }),
    ).toBe("consumed once");
    f.setCatalog({ ...f.catalog(), access: [grant] });
    await expect(
      f.service.useConnector("run", "connector", "search", async () => {
        f.setCatalog({ entries: [], access: [] });
        return "revoked result";
      }),
    ).rejects.toThrow(/connector changed/);
  });
});
