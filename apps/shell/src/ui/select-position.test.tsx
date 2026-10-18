// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Select } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

async function fixture() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn();
  const render = async (value = "dark", alignSelected = true) => {
    await act(async () =>
      root.render(
        <form>
          <Select
            name="theme"
            aria-label="Theme"
            alignSelected={alignSelected}
            value={value}
            onChange={changed}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </form>,
      ),
    );
  };
  await render();
  const select = host.querySelector("select")!;
  const options = [...select.options];
  let open = false;
  const originalMatches = select.matches.bind(select);
  vi.spyOn(select, "matches").mockImplementation((selector) =>
    selector === ":open" ? open : originalMatches(selector),
  );
  const geometry = { left: 600, top: 200, width: 144, height: 108, rowHeight: 32, inset: 6 };
  vi.spyOn(select, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(geometry.left, geometry.top, 100, 32),
  );
  vi.spyOn(select, "getClientRects").mockReturnValue([new DOMRect()] as unknown as DOMRectList);
  for (const [index, option] of options.entries()) {
    option.tabIndex = -1;
    vi.spyOn(option, "getBoundingClientRect").mockImplementation(
      () => new DOMRect(600, 400 + index * geometry.rowHeight, 132, geometry.rowHeight),
    );
  }
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) =>
    pseudo === "::picker(select)"
      ? ({
          width: `${geometry.width}px`,
          height: `${geometry.height}px`,
          paddingTop: `${geometry.inset}px`,
          paddingBottom: `${geometry.inset}px`,
          borderTopWidth: "0px",
          borderBottomWidth: "0px",
        } as CSSStyleDeclaration)
      : computedStyle(element, pseudo),
  );
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => void frames.delete(id));
  const focus = async (option = options[select.selectedIndex]!) =>
    act(async () => {
      option.focus();
    });
  return {
    host,
    select,
    options,
    geometry,
    changed,
    render,
    focus,
    frames,
    position: () => [
      select.style.getPropertyValue("--ui-select-picker-left"),
      select.style.getPropertyValue("--ui-select-picker-top"),
    ],
    open: async (option?: HTMLOptionElement) => {
      open = true;
      await focus(option);
    },
    close: async () => {
      open = false;
      await act(async () => select.focus());
    },
    dispose: async () => act(async () => root.unmount()),
  };
}

it("aligns the opening value once and leaves native focus, arrow navigation and change events in charge", async () => {
  const f = await fixture();
  try {
    await f.open();
    expect(f.position()).toEqual(["596px", "130px"]);
    expect(document.activeElement).toBe(f.options[2]);
    await f.focus(f.options[0]);
    const arrow = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    f.options[0]!.dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBe(false);
    expect(f.position()).toEqual(["596px", "130px"]);
    expect(document.activeElement).toBe(f.options[0]);
    expect(f.select.value).toBe("dark");
    expect(new FormData(f.host.querySelector("form")!).get("theme")).toBe("dark");
    expect(f.changed).not.toHaveBeenCalled();
    const change = new Event("change", { bubbles: true, cancelable: true });
    await act(async () => {
      f.select.value = "light";
      f.select.dispatchEvent(change);
    });
    expect(change.defaultPrevented).toBe(false);
    expect(f.changed).toHaveBeenCalledTimes(1);
    expect(f.changed.mock.calls[0]![0].nativeEvent).toBe(change);
    expect(f.position()).toEqual(["", ""]);
  } finally {
    await f.dispose();
  }
});

it("clamps the measured picker to the visible viewport at either edge", async () => {
  const f = await fixture();
  try {
    vi.stubGlobal("innerWidth", 800);
    vi.stubGlobal("innerHeight", 600);
    f.geometry.left = 790;
    f.geometry.top = 560;
    await f.open();
    expect(f.position()).toEqual(["648px", "484px"]);
    await f.close();
    f.geometry.left = 0;
    f.geometry.top = 0;
    await f.open();
    expect(f.position()).toEqual(["8px", "8px"]);
  } finally {
    await f.dispose();
  }
});

it("aligns a disabled selected value even when native opening focuses the first enabled option", async () => {
  const f = await fixture();
  try {
    f.options[2]!.disabled = true;
    await f.open(f.options[0]);
    expect(f.position()).toEqual(["596px", "130px"]);
    expect(document.activeElement).toBe(f.options[0]);
    expect(f.options[2]!.disabled).toBe(true);
    expect(f.select.value).toBe("dark");
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.dispose();
  }
});

it.each(["grouped", "scrolling", "unresolved", "hidden row", "oversize"])(
  "retains native placement for a %s picker without rewriting its value or focus",
  async (kind) => {
    const f = await fixture();
    try {
      if (kind === "grouped") f.select.append(document.createElement("optgroup"));
      if (kind === "scrolling") f.geometry.height = 72;
      if (kind === "unresolved") f.geometry.width = Number.NaN;
      if (kind === "hidden row") f.geometry.rowHeight = 0;
      if (kind === "oversize") f.geometry.width = window.innerWidth + 1;
      await f.open();
      expect(f.position()).toEqual(["", ""]);
      expect(f.select.hasAttribute("data-ui-select-positioned")).toBe(false);
      expect(f.select.value).toBe("dark");
      expect(document.activeElement).toBe(f.options[2]);
      expect(f.changed).not.toHaveBeenCalled();
    } finally {
      await f.dispose();
    }
  },
);

it("retires a replaced controlled value and does not adopt a new highlight during that opening", async () => {
  const f = await fixture();
  try {
    await f.open();
    await f.render("light");
    expect(f.position()).toEqual(["", ""]);
    await f.focus(f.options[1]);
    expect(f.position()).toEqual(["", ""]);
    expect(f.changed).not.toHaveBeenCalled();
    await f.close();
    await f.open();
    expect(f.position()).toEqual(["596px", "162px"]);
    await act(async () => {
      f.options[0]!.textContent = "A replacement option label";
    });
    expect(f.position()).toEqual(["", ""]);
    await f.focus(f.options[0]);
    expect(f.position()).toEqual(["", ""]);
  } finally {
    await f.dispose();
  }
});

it.each(["resize", "scroll", "reset", "disabled"])("retires the exact opening on %s", async (event) => {
  const f = await fixture();
  try {
    await f.open();
    await act(async () => {
      if (event === "reset") f.host.querySelector("form")!.reset();
      else if (event === "disabled") f.select.disabled = true;
      else window.dispatchEvent(new Event(event));
    });
    expect(f.position()).toEqual(["", ""]);
    expect(f.select.hasAttribute("data-ui-select-positioned")).toBe(false);
    if (event !== "disabled") await f.focus(f.options[0]);
    expect(f.position()).toEqual(["", ""]);
  } finally {
    await f.dispose();
  }
});

it("restores original styles and retires listeners and queued work when the opt-in control detaches", async () => {
  const f = await fixture();
  try {
    f.select.style.setProperty("--ui-select-picker-left", "23px", "important");
    // jsdom drops custom-property priorities; assert the browser-facing restore call.
    vi.spyOn(f.select.style, "getPropertyPriority").mockImplementation((name) =>
      name === "--ui-select-picker-left" ? "important" : "",
    );
    const setProperty = vi.spyOn(f.select.style, "setProperty");
    f.select.style.setProperty("--ui-select-picker-top", "17px");
    f.select.setAttribute("data-ui-select-positioned", "previous");
    await f.open();
    f.options[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    const stale = [...f.frames.values()][0]!;
    expect(stale).toBeTypeOf("function");
    await f.render("dark", false);
    expect(f.position()).toEqual(["23px", "17px"]);
    expect(setProperty).toHaveBeenCalledWith("--ui-select-picker-left", "23px", "important");
    expect(f.select.getAttribute("data-ui-select-positioned")).toBe("previous");
    expect(f.frames.size).toBe(0);
    f.select.style.setProperty("--ui-select-picker-top", "99px");
    stale(0);
    window.dispatchEvent(new Event("resize"));
    await f.focus(f.options[0]);
    expect(f.position()).toEqual(["23px", "99px"]);
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.dispose();
  }
});

it("ignores an old opening's queued check and preserves a newer style owner on close", async () => {
  const f = await fixture();
  try {
    await f.open();
    f.options[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    const oldCheck = [...f.frames.values()][0]!;
    await f.close();
    await f.open();
    f.options[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(f.frames.size).toBe(1);
    oldCheck(0);
    f.select.style.setProperty("--ui-select-picker-left", "77px");
    await f.close();
    expect(f.frames.size).toBe(0);
    expect(f.position()).toEqual(["77px", ""]);
    expect(f.select.hasAttribute("data-ui-select-positioned")).toBe(false);
    expect(document.activeElement).toBe(f.select);
  } finally {
    await f.dispose();
  }
});
