import { beforeEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import type { Layout } from "../../workspace";
const fixture = vi.hoisted(() => ({ state: {} as { layout: Layout; pages: PageTarget[] }, native: vi.fn(async (_command: unknown) => {}), persist: vi.fn() }));
vi.mock("../../bridge", () => ({ bridge: { windowId: "own" } }));
vi.mock("../../store", () => ({ useStore: { getState: () => fixture.state, setState: (value: { layout: Layout }) => { fixture.state = { ...fixture.state, ...value }; } }, tabCommand: fixture.native }));
vi.mock("../../store/persistence", () => ({ persistLayout: fixture.persist }));
import { commitSplit, splitResize } from "./split-actions";
import { emptyLayout, resizeSplit } from "../../workspace";
const page = (pageId: string): PageTarget => ({ pageId, windowId: "own", backend: "aux", targetId: pageId, url: `https://example.test/${pageId}`, title: pageId, documentEpoch: 1, lastRevision: 0, viewStatus: "visible", controller: "none", controllerEpoch: 0, ownedByRuntime: false, createdAt: 1, lastActiveAt: 1 });
beforeEach(() => {
  fixture.native.mockReset(); fixture.native.mockResolvedValue(undefined); fixture.persist.mockReset();
  const layout = emptyLayout();
  layout.tabSpace = { one: layout.spaces[0]!.id, two: layout.spaces[0]!.id };
  layout.splitGroups = [{ id: "pair", panes: ["one", "two"], layout: "row", ratios: [.5], focused: "one" }];
  fixture.state = { layout, pages: [page("one"), page("two")] };
});
it("persists and mirrors a divider release after its store preview already reached the final ratio", async () => {
  splitResize("one", 0, .62, false);
  expect(fixture.state.layout.splitGroups?.[0]?.ratios).toEqual([.62]);
  expect(fixture.native).not.toHaveBeenCalled(); expect(fixture.persist).not.toHaveBeenCalled();
  await splitResize("one", 0, .62);
  expect(fixture.native.mock.calls).toEqual([[{ kind: "split", pageIds: ["one", "two"], layout: "row", ratio: .62 }]]);
  expect(fixture.persist).toHaveBeenCalledWith(fixture.state.layout);
});
it("restores the prior native pair when a mutation ACK fails", async () => {
  const previous = fixture.state.layout;
  const error = new Error("Native split rejected"); fixture.native.mockRejectedValueOnce(error);
  await expect(commitSplit(resizeSplit(previous, "one", 0, .6), previous)).rejects.toBe(error);
  expect(fixture.state.layout).toBe(previous); expect(fixture.persist).not.toHaveBeenCalled();
  expect(fixture.native.mock.calls.slice(1)).toEqual([[{ kind: "unsplit", pageId: "one" }], [{ kind: "split", pageIds: ["one", "two"], layout: "row", ratio: .5 }]]);
});
it("reconciles native state to a concurrent organization update without overwriting it", async () => {
  const previous = fixture.state.layout, concurrent = resizeSplit(previous, "one", 0, .7);
  fixture.native.mockImplementationOnce(async () => { fixture.state.layout = concurrent; });
  await expect(commitSplit(resizeSplit(previous, "one", 0, .6), previous)).rejects.toThrow("tabs changed");
  expect(fixture.state.layout).toBe(concurrent); expect(fixture.persist).not.toHaveBeenCalled();
  expect(fixture.native.mock.calls.at(-1)).toEqual([{ kind: "split", pageIds: ["one", "two"], layout: "row", ratio: .7 }]);
});
it("reports rollback failure instead of claiming the rejected mutation was restored", async () => {
  const previous = fixture.state.layout;
  fixture.native.mockRejectedValue(new Error("Native unavailable"));
  await expect(commitSplit(resizeSplit(previous, "one", 0, .6), previous)).rejects.toBeInstanceOf(AggregateError);
  expect(fixture.persist).not.toHaveBeenCalled();
});
it("serializes competing mutations and refuses the stale second organization before native work", async () => {
  const previous = fixture.state.layout;
  let release!: () => void;
  fixture.native.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
  const first = commitSplit(resizeSplit(previous, "one", 0, .6), previous);
  const second = commitSplit(resizeSplit(previous, "one", 0, .7), previous);
  const rejected = second.catch(error => error);
  await Promise.resolve(); release(); await first; expect(await rejected).toMatchObject({ message: expect.stringContaining("tabs changed") });
  expect(fixture.native).toHaveBeenCalledTimes(1);
  expect(fixture.state.layout.splitGroups?.[0]?.ratios).toEqual([.6]);
});

it("restores a persisted pair after native session tabs return without split metadata", async () => {
  const layout = fixture.state.layout;
  await commitSplit(layout, layout, { ...layout, splitGroups: [] });
  expect(fixture.native.mock.calls).toEqual([[{ kind: "split", pageIds: ["one", "two"], layout: "row", ratio: .5 }]]);
  expect(fixture.state.layout.splitGroups).toEqual(layout.splitGroups);
});
it("refuses restoration when its owner unmounts before queued native dispatch", async () => {
  const layout = fixture.state.layout;
  await expect(commitSplit(layout, layout, { ...layout, splitGroups: [] }, () => false)).rejects.toThrow("tabs changed");
  expect(fixture.native).not.toHaveBeenCalled();
  expect(fixture.persist).not.toHaveBeenCalled();
});
it("refuses restoration for a persisted pair whose tab moved to another window", async () => {
  const layout = fixture.state.layout;
  fixture.state.pages[1] = { ...fixture.state.pages[1]!, windowId: "other" };
  await expect(commitSplit(layout, layout, { ...layout, splitGroups: [] })).rejects.toThrow("tabs changed");
  expect(fixture.native).not.toHaveBeenCalled();
});
