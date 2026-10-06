// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import type { PageTarget } from "@aux/contracts";
afterEach(() => vi.restoreAllMocks());
it("ignores out-of-order, previous-tab and closed-search responses; clearing stops native highlights", async () => {
  const responses: ((value: unknown) => void)[] = [];
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation((method) =>
      method === "pages.find"
        ? new Promise((resolve) => responses.push(resolve))
        : Promise.resolve({ ok: true }),
    );
  useStore.setState({
    activePageId: "first",
    overlay: "find",
    findText: "",
    findMatches: null,
    pages: [{ pageId: "first", documentEpoch: 1 } as PageTarget],
  });
  const first = useStore.getState().find("order");
  const second = useStore.getState().find("paid");
  responses[1]!({ matches: 1, activeMatch: 1 });
  await second;
  responses[0]!({ matches: 9, activeMatch: 3 });
  await first;
  expect(useStore.getState().findMatches).toEqual({ matches: 1, activeMatch: 1 });
  const previousTab = useStore.getState().find("paid");
  useStore.setState({ activePageId: "second" });
  responses[2]!({ matches: 8 });
  await previousTab;
  expect(useStore.getState().findMatches).toBeNull();
  const closed = useStore.getState().find("paid");
  useStore.setState({ overlay: null });
  responses[3]!({ matches: 7 });
  await closed;
  expect(useStore.getState().findMatches).toBeNull();
  await useStore.getState().find("");
  expect(invoke).toHaveBeenLastCalledWith("pages.stopFind", { pageId: "second", action: "clear" });
});
