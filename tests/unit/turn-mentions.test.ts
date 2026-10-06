import { describe, expect, it } from "vitest";
import { TurnMentions, type MentionPage } from "../../apps/runtime/src/agent/turn-mentions.js";
import type { MentionRef } from "@aux/contracts";

const tab = {
  kind: "tab" as const,
  pageId: "a",
  url: "https://example.test/a",
  title: "Inbox",
  documentEpoch: 1,
  sessionId: "s",
  access: "act" as const,
};
function fixture(refs: MentionRef[] = [tab]) {
  const pages = new Map<string, MentionPage>([
    ["a", tab],
    ["b", { ...tab, pageId: "b" }],
  ]);
  const turns = new TurnMentions((id) => pages.get(id), {
    space: () => [tab],
    skill: (ref) => ref.routineId === "skill" && ref.revision === 1,
    connector: (ref) => ref.connectorId === "c",
  });
  turns.begin("r", refs);
  return { turns, pages };
}
describe("turn mention authority", () => {
  it("refuses unmentioned, drifted and closed tabs while ignoring display titles", () => {
    const { turns, pages } = fixture();
    expect(turns.require("r", "a", "act").status).toBe("available");
    expect(turns.require("r", "b", "read").status).toBe("unavailable");
    pages.set("a", { ...tab, documentEpoch: 2 });
    expect(turns.require("r", "a", "read").status).toBe("unavailable");
    pages.delete("a");
    expect(turns.require("r", "a", "read")).toMatchObject({
      status: "unavailable",
      reason: "This tab is closed.",
    });
  });
  it("lists titles and URLs with @Tabs without granting page reads or acts", () => {
    const { turns } = fixture([{ kind: "tabs" }]);
    const listed = { ...tab, secret: "excluded" };
    expect(turns.list("r", [listed])).toEqual([{ pageId: "a", title: "Inbox", url: tab.url }]);
    expect(turns.require("r", "a", "read").status).toBe("unavailable");
  });
  it("enforces read-only group members and revokes connector and skill grants at turn end", () => {
    const { turns } = fixture([
      {
        kind: "group",
        groupId: "g",
        members: [
          {
            pageId: tab.pageId,
            url: tab.url,
            title: tab.title,
            documentEpoch: tab.documentEpoch,
            sessionId: tab.sessionId,
            access: "read",
          },
        ],
      },
      { kind: "connector", connectorId: "c" },
      { kind: "skill", routineId: "skill", revision: 1 },
    ]);
    expect(turns.require("r", "a", "read").status).toBe("available");
    turns.created("r", "a");
    expect(turns.require("r", "a", "act").status).toBe("unavailable");
    expect(turns.grants("r")).toEqual({ skills: ["skill"], connectors: ["c"] });
    turns.end("r");
    expect(turns.grants("r")).toEqual({ skills: [], connectors: [] });
    expect(turns.require("r", "a", "read").status).toBe("unavailable");
  });
  it("advances only the run's receipt and refuses person navigation racing that receipt", async () => {
    const { turns, pages } = fixture();
    const next = { ...tab, url: "https://example.test/next", documentEpoch: 2 };
    expect(
      await turns.navigate("r", "a", async () => {
        pages.set("a", next);
        return { result: "done", page: next };
      }),
    ).toBe("done");
    expect(turns.require("r", "a", "act").status).toBe("available");
    expect(
      await turns.navigate("r", "a", async () => {
        pages.set("a", { ...next, documentEpoch: 4 });
        return { result: "bad", page: { ...next, documentEpoch: 3 } };
      }),
    ).toMatchObject({ status: "unavailable" });
    expect(turns.require("r", "a", "read").status).toBe("unavailable");
  });
  it("refuses late navigation after the original turn ends even if its id is reused", async () => {
    const { turns, pages } = fixture();
    const next = { ...tab, documentEpoch: 2 };
    const result = await turns.navigate("r", "a", async () => {
      turns.end("r");
      pages.set("a", next);
      turns.begin("r", []);
      return { result: "late", page: next };
    });
    expect(result).toMatchObject({ status: "unavailable" });
    expect(turns.require("r", "a", "read").status).toBe("unavailable");
  });
  it("does not return an observation when person navigation races an asynchronous read", async () => {
    const { turns, pages } = fixture();
    let dispatched = 0;
    expect(
      await turns.withPage("r", "b", "read", async () => {
        dispatched++;
        return "secret";
      }),
    ).toMatchObject({ status: "unavailable" });
    expect(dispatched).toBe(0);
    expect(
      await turns.withPage("r", "a", "read", async () => {
        pages.set("a", { ...tab, documentEpoch: 2 });
        return "new document content";
      }),
    ).toMatchObject({ status: "unavailable" });
  });
  it("rejects inconsistent snapshots instead of broadening access", () => {
    expect(() => fixture([tab, { ...tab, documentEpoch: 2 }])).toThrow("Conflicting mention snapshots");
    const { turns } = fixture([{ kind: "space", spaceId: "space", workspaceId: "w", revision: 1 }]);
    expect(turns.require("r", "a", "read").status).toBe("available");
    expect(turns.require("r", "a", "act").status).toBe("unavailable");
    expect(() => fixture([{ kind: "skill", routineId: "skill", revision: 2 }])).toThrow("skill changed");
    expect(() => fixture([{ kind: "connector", connectorId: "revoked" }])).toThrow(
      "connector is unavailable",
    );
  });
});

it("explicit tab metadata stays visible without exposing unrelated tabs or granting action", () => {
  const page = { pageId: "a", url: "https://mentions.test/", documentEpoch: 1, sessionId: "attachment" };
  const turns = new TurnMentions((id) => (id === "a" ? page : undefined));
  turns.begin("run", [{ kind: "tab", ...page, title: "A", access: "read" }], []);
  expect(
    turns.list("run", [
      { ...page, title: "A" },
      { pageId: "b", title: "B", url: "https://other.test/" },
    ]),
  ).toEqual([{ pageId: "a", title: "A", url: page.url }]);
  expect(turns.require("run", "a", "act")).toMatchObject({ status: "unavailable" });
});

it("run-created attachments require a matching document receipt and never inherit replacement authority", async () => {
  const { turns, pages } = fixture([]);
  turns.created("r", "b");
  expect(turns.require("r", "b", "act")).toEqual({ status: "available" });
  const next = { ...tab, pageId: "b", documentEpoch: 2, url: "https://example.test/next" };
  expect(
    await turns.navigate("r", "b", async () => {
      pages.set("b", next);
      return { result: "committed", page: next };
    }),
  ).toBe("committed");
  expect(turns.require("r", "b", "read")).toEqual({ status: "available" });
  pages.set("b", { ...next, sessionId: "replacement" });
  expect(turns.require("r", "b", "read")).toMatchObject({ status: "unavailable" });
  pages.set("b", { ...next, documentEpoch: 3 });
  expect(turns.require("r", "b", "act")).toMatchObject({ status: "unavailable" });
  pages.delete("b");
  expect(() => turns.created("r", "missing")).toThrow("attachment is unavailable");
});
