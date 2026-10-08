// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { StructuredResult } from "./StructuredResult";
import { SavedResultPreview } from "./SavedResultPreview";
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const source = "A,B\nOne,Two\nThree,Four",
  ids = {
    format: "toggle-saved-result-format",
    row: "select-saved-result-row",
    close: "close-saved-result-row-details",
  };
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ ...initial, connected: false, toasts: [] }, true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = originalWindow;
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(content = source, mediaType = "text/csv") {
  await act(async () => root.render(<StructuredResult content={content} mediaType={mediaType} />));
}
const control = (id: string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
const row = (index: number) => host.querySelector<HTMLTableRowElement>(`[aria-label="Row ${index + 1}"]`)!;
async function command(id: string, node = control(id)) {
  let completion!: Promise<unknown>;
  await act(async () => {
    node.focus();
    completion = executeCommand(id);
    void completion.catch(() => {});
  });
  return { completion };
}
async function key(index: number, value: string) {
  const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true });
  await act(async () => row(index).dispatchEvent(event));
  return event;
}
it("three actual actions retain normal scoped registry and disconnected source toggle", async () => {
  await render();
  for (const id of Object.values(ids))
    expect(COMMANDS.find((value) => value.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
    });
  await command(ids.format);
  expect(host.querySelector("pre")?.textContent).toBe(source);
  expect(control(ids.format).getAttribute("aria-pressed")).toBe("true");
  await command(ids.format);
  expect(row(0).textContent).toBe("AB");
  expect(useStore.getState().connected).toBe(false);
});
it("original cell click selects exact row, detail close focuses same original row", async () => {
  await render();
  await act(async () => row(1).querySelector("td")!.click());
  expect(host.querySelector('[aria-label="Row 2 details"]')?.textContent).toContain("One");
  expect(row(1).getAttribute("aria-selected")).toBe("true");
  await command(ids.close);
  expect(document.activeElement).toBe(row(1));
  expect(host.querySelector(".result-row-detail")).toBeNull();
});
it("original Arrow/Home/End bounds, Enter/Space and exact focus stay unchanged", async () => {
  await render();
  expect((await key(0, "ArrowDown")).defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(row(1));
  await key(1, "End");
  expect(document.activeElement).toBe(row(2));
  await key(2, "ArrowDown");
  expect(document.activeElement).toBe(row(2));
  await key(2, "ArrowUp");
  expect(document.activeElement).toBe(row(1));
  await key(1, "Home");
  expect(document.activeElement).toBe(row(0));
  await key(0, "ArrowUp");
  expect(document.activeElement).toBe(row(0));
  await key(0, " ");
  expect(row(0).getAttribute("aria-selected")).toBe("true");
  await key(2, "Enter");
  expect(row(2).getAttribute("aria-selected")).toBe("true");
});
it("actual remapped row/format/close commands preserve current native row focus", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        [ids.row]: [{ key: "j", command: true, alt: true }],
        [ids.close]: [{ key: "k", command: true, alt: true }],
        [ids.format]: [{ key: "l", command: true, alt: true }],
      },
    },
  });
  await render();
  await act(async () => {
    row(1).focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector('[aria-label="Row 2 details"]')).not.toBeNull();
  await act(async () => {
    control(ids.close).focus();
    expect(dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(document.activeElement).toBe(row(1));
  await act(async () => {
    control(ids.format).focus();
    expect(dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector("pre")?.textContent).toBe(source);
});
it("observed native window ABA refuses row mutation, close focus and later source actions", async () => {
  await render();
  await command(ids.row, row(1));
  const focused = control(ids.close);
  focused.focus();
  bridge.windowId = "foreign";
  await act(async () => focused.click());
  bridge.windowId = originalWindow;
  expect(host.querySelector('[aria-label="Row 2 details"]')).not.toBeNull();
  expect(document.activeElement).toBe(focused);
  const event = await key(1, "ArrowDown");
  expect(event.defaultPrevented).toBe(true);
  expect(host.querySelector('[aria-label="Row 3 details"]')).toBeNull();
  control(ids.format).focus();
  await expect(executeCommand(ids.format)).rejects.toThrow();
  expect(useStore.getState().toasts).toEqual([]);
});
it("source/media changes reset original selection/raw and renewed controls remain usable", async () => {
  await render();
  await command(ids.row, row(1));
  await command(ids.format);
  await render('{"original":true}', "application/json");
  expect(host.querySelector(".result-row-detail")).toBeNull();
  expect(host.querySelector("pre")?.textContent).toBe('{\n  "original": true\n}');
  expect(control(ids.format).getAttribute("aria-pressed")).toBe("false");
  await command(ids.format);
  expect(host.querySelector("pre")?.textContent).toBe('{"original":true}');
  await render();
  await command(ids.row, row(2));
  expect(host.querySelector('[aria-label="Row 3 details"]')).not.toBeNull();
});
it("layout-cut source change refuses old local display state before original reset effect", async () => {
  let attack = false,
    completion: Promise<unknown> | undefined;
  function Probe({ attack }: { attack: boolean }) {
    useLayoutEffect(() => {
      if (attack) {
        control(ids.format).focus();
        completion = executeCommand(ids.format);
        void completion.catch(() => {});
      }
    }, [attack]);
    return null;
  }
  function View({ content }: { content: string }) {
    return (
      <>
        <StructuredResult content={content} mediaType="text/csv" />
        <Probe attack={attack} />
      </>
    );
  }
  await act(async () => root.render(<View content={source} />));
  await command(ids.row, row(1));
  attack = true;
  await act(async () => root.render(<View content={"Changed,source\nCurrent,row"} />));
  await expect(completion).rejects.toThrow();
  expect(host.querySelector("pre")).toBeNull();
  expect(host.querySelector(".result-row-detail")).toBeNull();
  await command(ids.format);
  expect(host.querySelector("pre")?.textContent).toBe("Changed,source\nCurrent,row");
});
it("hidden/unfocused/Private rows and toolbar refuse local actions", async () => {
  await render();
  row(1).hidden = true;
  row(1).focus();
  await expect(executeCommand(ids.row)).rejects.toThrow();
  document.body.focus();
  await expect(executeCommand(ids.close)).rejects.toThrow();
  bridge.privateMode = true;
  control(ids.format).focus();
  await expect(executeCommand(ids.format)).rejects.toThrow();
  expect(host.querySelector("pre")).toBeNull();
  expect(host.querySelector(".result-row-detail")).toBeNull();
});
it("original bounded CSV and inert JSON/error/empty formatting remain", async () => {
  await render(Array.from({ length: 205 }, (_, i) => `${i},Value`).join("\n"));
  expect(host.textContent).toContain("Preview limited to 201 rows and 40 columns");
  expect(host.querySelectorAll("tbody tr").length).toBeLessThanOrEqual(201);
  await render("{broken", "application/json");
  expect(host.textContent).toContain("could not be formatted");
  expect(host.querySelector("pre")?.textContent).toBe("{broken");
  expect(control(ids.format)).toBeNull();
  await render("", "text/plain");
  expect(host.querySelector("pre")?.textContent).toBe("Empty result");
});
it("actual Saved read publication owns structured row scope and retired reply stays refused", async () => {
  let resolve!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation((method) => {
    if (method !== "results.read") throw new Error(`Unexpected ${method}`);
    return new Promise((yes) => {
      resolve = yes;
    });
  });
  await act(async () =>
    root.render(<SavedResultPreview artifactId="original" chatId="chat" onClose={() => {}} />),
  );
  await act(async () =>
    resolve({
      artifactId: "original",
      chatId: "chat",
      filename: "report.csv",
      mediaType: "text/csv",
      content: source,
      createdAt: 1,
      revision: 2,
    }),
  );
  await command(ids.row, row(1));
  expect(host.querySelector('[aria-label="Row 2 details"]')).not.toBeNull();
  bridge.windowId = "foreign";
  await act(async () => control(ids.close).click());
  bridge.windowId = originalWindow;
  await expect((await command(ids.row, row(2))).completion).rejects.toThrow();
  expect(host.querySelector('[aria-label="Row 3 details"]')).toBeNull();
  expect(bridge.invoke).toHaveBeenCalledExactlyOnceWith("results.read", { artifactId: "original" });
});
