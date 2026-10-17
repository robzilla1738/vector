import { describe, expect, it, vi } from "vitest";
import { TurnSourceContextSchema, type TurnSourceContext } from "@aux/contracts/turn-source-context";
import {
  AuxError,
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
function fixture(privateBrowserProfile = false) {
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
  let sourceContext = TurnSourceContextSchema.parse({
    windowId: "main",
    activePageId: "a",
    revision: 1,
    layout: {
      shared: organization.shared,
      window: { activeSpaceId: "space", activeTabs: { space: "a" }, splitRatio: 0.5 },
    },
  });
  const prepareReadPage = vi.fn(async (_pageId: string) => {});
  const service = new TurnMentionService({
    privateBrowserProfile,
    page: (id) => pages.get(id),
    prepareReadPage,
    turnSourceContext: async () => sourceContext,
    organization: async () => organization,
    routine: (id) => (id === "skill" ? routine : undefined),
    connectors: () => catalog,
  });
  return {
    service,
    pages,
    prepareReadPage,
    sourceContext: () => sourceContext,
    setSourceContext: (value: TurnSourceContext) => {
      sourceContext = value;
    },
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
    expect(checks).toBe(4);
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

describe("original window default source reach", () => {
  const nativeTurnContext = "11111111-1111-4111-8111-111111111111";
  it("keeps actual active/current Space sources with only a skill mention", async () => {
    const f = fixture(),
      original = f.sourceContext();
    if (!original.layout) throw new Error("Fixturelayout missing");
    f.setSourceContext({
      ...original,
      layout: {
        ...original.layout,
        shared: { ...original.layout.shared, tabSpace: { a: "space", b: "space" } },
      },
    });
    const refs = [{ kind: "skill" as const, routineId: "skill", revision: 1 }];
    const started = await f.service.begin("run", refs, [], { nativeTurnContext });
    expect(started.refs).toEqual(refs);
    expect(f.service.hasPageSelection("run")).toBe(false);
    expect(f.service.selectedPages("run")).toEqual(["a", "b"]);
    expect(await f.service.require("run", "b", "read")).toEqual({ status: "available" });
  });
  it("keeps explicit read-only page selections narrower than defaults", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], [], { nativeTurnContext });
    expect(f.service.hasPageSelection("run")).toBe(true);
    expect(f.service.selectedPages("run")).toEqual(["a"]);
    expect(await f.service.require("run", "a", "act")).toMatchObject({ status: "unavailable" });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "unavailable" });
  });
  it("invalidates borrowed default sources when the original window changes Space", async () => {
    const f = fixture();
    await f.service.begin("run", [], [], { nativeTurnContext });
    const current = f.sourceContext();
    if (!current.layout) throw new Error("Fixturelayout missing");
    f.setSourceContext({
      ...current,
      layout: { ...current.layout, window: { ...current.layout.window, activeSpaceId: "other" } },
    });
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
  });
  it("resolves private source metadata without preparing or observing borrowed tabs", async () => {
    const f = fixture();
    await f.service.begin("run", [tab], [], { nativeTurnContext, privateTask: true });
    expect(f.prepareReadPage).not.toHaveBeenCalled();
    expect(f.service.sourcePages("run")).toMatchObject([{ pageId: "a", url: page.url }]);
    expect(f.service.selectedPages("run")).toEqual([]);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    f.pages.set("clone", { ...page, pageId: "clone", sessionId: "private-clone", ownedByRuntime: true });
    f.service.created("run", "clone");
    expect(f.service.selectedPages("run")).toEqual(["clone"]);
    expect(await f.service.require("run", "clone", "act")).toEqual({ status: "available" });
  });
  it("uses admitted OTR signed-in tabs with their exact identities instead of borrowing regular Profile tabs", async () => {
    const f = fixture(true);
    f.setSourceContext({ windowId: "main", activePageId: "a", revision: 0, layout: null });
    await f.service.begin("run", [], [], { nativeTurnContext, privateTask: true });
    expect(f.prepareReadPage).toHaveBeenCalledWith("a");
    expect(f.service.selectedPages("run")).toEqual(["a"]);
    expect(await f.service.require("run", "a", "act")).toEqual({ status: "available" });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "unavailable" });
    f.pages.set("a", { ...page, sessionId: "replacement" });
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
  });
  it("keeps a trusted child source binding narrow and retains exact document invalidation", async () => {
    const f = fixture();
    await f.service.begin("run", [], [], { nativeTurnContext, sourcePageIds: ["b"] });
    expect(f.service.selectedPages("run")).toEqual(["b"]);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    const original = f.pages.get("b")!;
    f.pages.set("b", { ...original, documentEpoch: original.documentEpoch + 1 });
    expect(await f.service.require("run", "b", "read")).toMatchObject({ status: "unavailable" });
  });
});

it("omits an uncommitted implicit tab but keeps explicit and recovered sources strict", async () => {
  const f = fixture();
  const source = f.sourceContext();
  f.setSourceContext({
    ...source,
    layout: { ...source.layout!, shared: { ...source.layout!.shared, tabSpace: { a: "space", b: "space" } } },
  });
  f.prepareReadPage.mockImplementation(async (id?: string) => {
    if (id === "a") throw new AuxError("ref_stale", "Source tab is not loaded.");
  });
  await f.service.begin("run", [], [], { nativeTurnContext: "owner" });
  expect(f.service.selectedPages("run")).toEqual(["b"]);
  expect(f.service.unavailableImplicitPages("run")).toEqual(["a"]);
  expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
  await expect(f.service.begin("explicit", [tab], [], { nativeTurnContext: "owner" })).rejects.toMatchObject({
    code: "ref_stale",
  });
  await expect(
    f.service.begin("recovered", [], [], { nativeTurnContext: "owner", sourcePageIds: ["a"] }),
  ).rejects.toMatchObject({ code: "ref_stale" });
});

it.each([
  "chrome://newtab/",
  "chrome://aux/",
  "about:blank",
  "file:///tmp/example.txt",
  "https://person:secret@mentions.test/",
])(
  "omits implicit non-website context %s without reading it or dropping eligible website tabs",
  async (url) => {
    const f = fixture();
    f.pages.set("a", { ...page, url });
    const source = f.sourceContext();
    f.setSourceContext({
      ...source,
      layout: {
        ...source.layout!,
        shared: { ...source.layout!.shared, tabSpace: { a: "space", b: "space" } },
      },
    });
    f.prepareReadPage.mockImplementation(async (id) => {
      if (id === "a") throw new AuxError("permission_denied", "This page could not be read");
    });
    await f.service.begin("run", [], [], { nativeTurnContext: "owner" });
    expect(f.prepareReadPage).toHaveBeenCalledExactlyOnceWith("b");
    expect(f.service.selectedPages("run")).toEqual(["b"]);
    expect(await f.service.require("run", "a", "read")).toMatchObject({ status: "unavailable" });
    await expect(
      f.service.begin("explicit", [{ ...tab, url }], [], { nativeTurnContext: "owner" }),
    ).rejects.toMatchObject({ code: "permission_denied" });
    await expect(
      f.service.begin("restored", [], [], { nativeTurnContext: "owner", sourcePageIds: ["a"] }),
    ).rejects.toMatchObject({ code: "permission_denied" });
  },
);

it.each([{ navigationError: { url: page.url, code: -20, message: "Blocked" } }, { showBlankDocument: true }])(
  "omits failed implicit documents while keeping explicit selections strict: %j",
  async (state) => {
    const f = fixture();
    f.pages.set("a", { ...page, ...state });
    const source = f.sourceContext();
    f.setSourceContext({
      ...source,
      layout: {
        ...source.layout!,
        shared: { ...source.layout!.shared, tabSpace: { a: "space", b: "space" } },
      },
    });
    await f.service.begin("run", [], [], { nativeTurnContext: "owner" });
    expect(f.prepareReadPage).toHaveBeenCalledExactlyOnceWith("b");
    expect(f.service.selectedPages("run")).toEqual(["b"]);
    expect(f.service.unavailableImplicitPages("run")).toEqual(["a"]);
    await expect(
      f.service.begin("explicit", [tab], [], { nativeTurnContext: "owner" }),
    ).rejects.toMatchObject({
      code: "ref_stale",
    });
    await expect(
      f.service.begin("restored", [], [], { nativeTurnContext: "owner", sourcePageIds: ["a"] }),
    ).rejects.toMatchObject({ code: "ref_stale" });
    expect(f.prepareReadPage).toHaveBeenCalledExactlyOnceWith("b");
  },
);
