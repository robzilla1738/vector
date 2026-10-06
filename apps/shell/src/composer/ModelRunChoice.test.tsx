// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ModelRunChoice, type ModelRunSelection } from "./ModelRunChoice";
const rpc = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({
  settings: { modelProvider: "configured-original" },
}));
const owner = vi.hoisted(() => ({
  windowId: "original",
  windowKind: "main",
  privateMode: false,
}));
vi.mock("../bridge", () => ({ bridge: owner }));
vi.mock("../store", () => ({
  call: rpc,
  useStore: Object.assign(
    (select: (value: typeof state) => unknown) => select(state),
    { getState: () => state },
  ),
}));
it("loads the actual catalog on demand, rejects a retired Settings reply and preserves explicit draft overrides", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let reply!: (value: unknown) => void;
  rpc
    .mockReset()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          reply = resolve;
        }),
    )
    .mockResolvedValue({
      source: "configured",
      models: [
        {
          id: "actual/model",
          name: "Actual model",
          source: "configured",
          reasoning: "none",
        },
      ],
    });
  const changed = vi.fn();
  let value: ModelRunSelection = {};
  const render = async () =>
    act(async () =>
      root.render(
        <ModelRunChoice value={value} disabled={false} onChange={changed} />,
      ),
    );
  try {
    await render();
    expect(rpc).not.toHaveBeenCalled();
    const model = container.querySelector<HTMLSelectElement>(
      '[aria-label="Composer model"]',
    )!;
    await act(async () => model.focus());
    expect(rpc).toHaveBeenCalledTimes(1);
    state.settings = { modelProvider: "configured-replacement" };
    await act(async () =>
      reply({ models: [{ id: "retired/model", name: "Retired reply" }] }),
    );
    expect(container.textContent).not.toContain("Retired reply");
    await render();
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("Actual model");
    value = { reasoning: "high" };
    await render();
    await act(async () => {
      model.value = "actual/model";
      model.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(changed).toHaveBeenLastCalledWith({
      modelId: "actual/model",
      reasoning: undefined,
    });
    value = { modelId: "actual/model" };
    await render();
    expect(
      container.querySelector<HTMLSelectElement>(
        '[aria-label="Thinking level"]',
      )!.disabled,
    ).toBe(true);
    owner.windowId = "retired-window";
    await act(async () => {
      model.value = "";
      model.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(changed).toHaveBeenCalledTimes(1);
  } finally {
    act(() => root.unmount());
    container.remove();
    owner.windowId = "original";
    state.settings = { modelProvider: "configured-original" };
    vi.unstubAllGlobals();
  }
});
