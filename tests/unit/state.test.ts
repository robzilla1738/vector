import { describe, it, expect } from "vitest";
import { openDb, Repo, StateService } from "@vector/runtime";

const repo = () => new Repo(openDb(":memory:"));

const fakePages = { livePageIds: () => ["p1"] } as never;

const svc = () => {
  const r = repo();
  return { state: new StateService({ repo: r, pages: fakePages }), repo: r };
};

const seedResponses = (r: Repo) => {
  for (const [i, u] of ["/api/state", "/api/records", "/img.png"].entries()) {
    r.saveResponse({
      requestId: `req-${i}`,
      pageId: "p1",
      url: `http://app.test${u}`,
      method: "GET",
      status: 200,
      contentType: u.endsWith(".png") ? "image/png" : "application/json",
      startedAt: 1000 + i,
      endedAt: 1100 + i,
      durationMs: 100,
      bodyBytes: u.endsWith(".png") ? 99999 : 1200,
      truncated: 0,
    });
  }
};

describe("StateService", () => {
  it("queries captured responses with where-filters", () => {
    const { state, repo } = svc();
    seedResponses(repo);
    const json = state.query({
      entity: "responses",
      scope: { pageIds: ["p1"] },
      freshness: "current-required",
      completeness: "partial-allowed",
      where: [{ field: "contentType", op: "contains", value: "json" }],
    });
    expect(json.count).toBe(2);
    expect(json.rows.every((r) => String(r["contentType"]).includes("json"))).toBe(true);
    expect(json.explain).toContain("responses");
    // select projects fields
    const one = state.query({
      entity: "responses",
      scope: { pageIds: ["p1"] },
      freshness: "current-required",
      completeness: "partial-allowed",
      select: ["url", "status"],
      where: [{ field: "url", op: "contains", value: "img" }],
    });
    expect(one.rows[0]).toEqual({ url: "http://app.test/img.png", status: 200 });
  });

  it("cursor-paginates through a large entity set", () => {
    const { state, repo } = svc();
    for (let i = 0; i < 12; i++) {
      repo.saveResponse({
        requestId: `q${i}`,
        pageId: "p1",
        url: `http://app.test/x${i}`,
        method: "GET",
        status: 200,
        contentType: "text/plain",
        startedAt: i,
        endedAt: i + 1,
        durationMs: 1,
        bodyBytes: 10,
        truncated: 0,
      });
    }
    const first = state.query({ entity: "responses", scope: { pageIds: ["p1"] }, freshness: "current-required", completeness: "partial-allowed", limit: 5 });
    expect(first.rows).toHaveLength(5);
    expect(first.truncated).toBe(true);
    expect(first.nextCursor).toBeDefined();
    const second = state.query({ entity: "responses", scope: { pageIds: ["p1"] }, freshness: "current-required", completeness: "partial-allowed", limit: 20, cursor: first.nextCursor });
    expect(second.rows).toHaveLength(7);
    expect(second.truncated).toBe(false);
  });

  it("materializes datasets and runs every local transform", () => {
    const { state } = svc();
    const ds = state.saveDataset({
      source: "test",
      rows: [
        { name: "a", n: 3 },
        { name: "b", n: 1 },
        { name: "a", n: 2 },
      ],
    });
    expect(ds.rowCount).toBe(3);

    // dedup
    const dedup = state.transform(ds.datasetId, "dedup", { field: "name" });
    expect(dedup.rowCount).toBe(2);
    // sort desc
    const sorted = state.transform(ds.datasetId, "sort", { field: "n", dir: "desc" });
    expect(state.rows(sorted.datasetId)[0]).toEqual({ name: "a", n: 3 });
    // filter
    const filtered = state.transform(ds.datasetId, "filter", { where: [{ field: "n", op: "gt", value: 1 }] });
    expect(filtered.rowCount).toBe(2);
    // project
    const proj = state.transform(ds.datasetId, "project", { fields: ["name"] });
    expect(Object.keys(state.rows(proj.datasetId)[0]!)).toEqual(["name"]);
    // group
    const grouped = state.transform(ds.datasetId, "group", { field: "name" });
    expect(state.rows(grouped.datasetId).find((r) => r["name"] === "a")).toEqual({ name: "a", count: 2 });
    // limit
    expect(state.transform(ds.datasetId, "limit", { n: 1 }).rowCount).toBe(1);
  });

  it("joins two datasets on a shared key", () => {
    const { state } = svc();
    const left = state.saveDataset({
      source: "left",
      rows: [
        { id: "rec-1", summary: "x" },
        { id: "rec-2", summary: "y" },
      ],
    });
    const right = state.saveDataset({
      source: "right",
      rows: [
        { id: "rec-1", owner: "rob" },
        { id: "rec-9", owner: "nobody" },
      ],
    });
    const joined = state.transform(left.datasetId, "join", { right: right.datasetId, leftField: "id", rightField: "id" });
    const rows = state.rows(joined.datasetId);
    expect(rows).toHaveLength(1); // only rec-1 matches
    expect(rows[0]).toEqual({ id: "rec-1", summary: "x", r_id: "rec-1", r_owner: "rob" });
    expect(joined.provenance).toContain("join");
  });

  it("marks stale datasets after navigation invalidates them", () => {
    const { state, repo } = svc();
    state.saveDataset({ source: "test", pageId: "p1", rows: [{ a: 1 }] });
    repo.markDatasetsStale("p1", 1);
    const listed = state.listDatasets({ pageId: "p1" });
    expect(listed[0]!.stale).toBe(true);
    expect(listed[0]!.freshness).toBe("previously-observed");
  });
});
