import { describe, expect, it } from "vitest";
import { executeProgram } from "@aux/runtime";
import type { DriverPage } from "@aux/chromium-driver";
import type { Program, ProgramNode } from "@aux/contracts";

/** Tracks how many page calls overlap. */
function trackingPage() {
  const state = { active: 0, peak: 0 };
  const op = async () => {
    state.active++;
    state.peak = Math.max(state.peak, state.active);
    await new Promise((r) => setTimeout(r, 10));
    state.active--;
  };
  const page = {
    identity: { pageId: "p1", targetId: "t", backend: "aux" },
    url: () => "https://a.test/",
    title: async () => "",
    isAttached: () => true,
    click: op,
    extract: async () => {
      await op();
      return { v: 1 };
    },
  } as unknown as DriverPage;
  return { page, state };
}
const forEach = (body: ProgramNode[]): Program => ({
  pageId: "p1",
  nodes: [{ kind: "forEach", items: { literal: [1, 2, 3, 4] }, itemName: "n", concurrency: 4, body }],
});

describe("forEach concurrency on one page", () => {
  it("serializes bodies that drive the page", async () => {
    const { page, state } = trackingPage();
    const res = await executeProgram(
      page,
      forEach([{ kind: "step", step: { id: "c", op: "click", target: "r1" } }]),
    );
    expect(res.status).toBe("completed");
    expect(state.peak).toBe(1);
  });

  it("lets read-only bodies overlap", async () => {
    const { page, state } = trackingPage();
    const res = await executeProgram(
      page,
      forEach([{ kind: "step", step: { id: "x", op: "extract", fields: [{ name: "v" }] } }]),
    );
    expect(res.status).toBe("completed");
    expect(state.peak).toBeGreaterThan(1);
  });
});
