// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
vi.mock("./bridge", () => ({ bridge: { windowId: "original", privateMode: false } }));
vi.mock("./store", () => ({ errToast: vi.fn() }));
vi.mock("./commands", () => ({ executeCommand: vi.fn() }));
import { invokeScopedControl } from "./scoped-control-commands";
import { SearchEngineSetting } from "./components/SearchEngineSetting";
import { SearchEnginesSetting } from "./components/SearchEnginesSetting";
it("keeps two actual Settings save owners independent through false and successful ACK", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as never);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let one!: (ack: boolean) => void, two!: (ack: boolean) => void;
  const single = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        one = resolve;
      }),
  );
  const keyword = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        two = resolve;
      }),
  );
  const rows = [{ keyword: "gh", name: "GitHub", template: "https://github.com/search?q=%s" }];
  try {
    await act(async () =>
      root.render(
        <>
          <SearchEngineSetting value={DEFAULT_SEARCH_ENGINE} onSave={single} />
          <SearchEnginesSetting value={rows} onSave={keyword} />
        </>,
      ),
    );
    const google = [...host.querySelectorAll("button")].find((node) => node.textContent === "Google")!;
    const remove = host.querySelector<HTMLButtonElement>('button[aria-label="Remove gh engine"]')!;
    let first!: unknown, second!: unknown;
    google.focus();
    await act(async () => {
      first = invokeScopedControl("select-search-engine");
    });
    remove.focus();
    await act(async () => {
      second = invokeScopedControl("remove-keyword-search-engine");
    });
    expect(single).toHaveBeenCalledWith("https://www.google.com/search?q=%s");
    expect(keyword).toHaveBeenCalledWith([]);
    await act(async () => {
      one(false);
      expect(await first).toBe(false);
    });
    expect(host.querySelector(".search-engine-setting [role=alert]")!.textContent).toContain(
      "The search engine wasn’t saved. Try again.",
    );
    expect(remove.disabled).toBe(true);
    expect(google.disabled).toBe(false);
    await act(async () => {
      two(true);
      expect(await second).toBe(true);
    });
    expect(remove.disabled).toBe(false);
    expect(host.querySelector(".search-engines-setting [role=alert]")).toBeNull();
    expect(rows).toEqual([{ keyword: "gh", name: "GitHub", template: "https://github.com/search?q=%s" }]);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
