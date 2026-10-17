// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  windowId: "one",
  privateMode: false,
  state: { bookmarks: [] as { url: string; title: string }[] },
  publish: vi.fn(),
}));
vi.mock("../store", () => ({
  call: mocks.rpc,
  useStore: Object.assign((select: (value: typeof mocks.state) => unknown) => select(mocks.state), {
    setState: (patch: Partial<typeof mocks.state>) => {
      mocks.publish(patch);
      Object.assign(mocks.state, patch);
    },
  }),
}));
vi.mock("../bridge", () => ({
  bridge: {
    get windowId() {
      return mocks.windowId;
    },
    get privateMode() {
      return mocks.privateMode;
    },
    windowKind: "normal",
  },
}));
vi.mock("../commands", () => ({ executeCommand: vi.fn() }));
import { BookmarkImportSetting } from "./BookmarkFileImport";
const source =
  '<DL><DT><H3>Synthetic folder</H3><DL><DT><A HREF="https://example.test/one">Synthetic page</A><DT><A HREF="javascript:alert(1)">Unsafe</A><DT><A HREF="https://example.test/one">Duplicate</A></DL></DL>';
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const close = vi.fn();
const render = async (active = true) => {
  await act(async () => root.render(<BookmarkImportSetting active={active} onClose={close} />));
};
async function file(text: string | Promise<string> = source, size = source.length) {
  const input = host.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [{ name: "synthetic-bookmarks.html", size, text: () => Promise.resolve(text) }],
  });
  await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
}
async function click(label: string) {
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")]
      .find((item) => item.textContent === label)!
      .click(),
  );
}
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.windowId = "one";
  mocks.privateMode = false;
  mocks.publish.mockReset();
  close.mockReset();
  mocks.state.bookmarks = [];
  mocks.rpc.mockReset().mockImplementation(async (method: string) => {
    if (method === "bookmarks.import") return { added: 1, skipped: 0 };
    if (method === "bookmarks.list") return [{ url: "https://example.test/one", title: "Synthetic page" }];
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("previews an inert file and imports only reviewed supported bookmarks and folders after confirmation", async () => {
  await render();
  expect(mocks.rpc).not.toHaveBeenCalled();
  await file();
  expect(host.textContent).toContain("1 web bookmarks ready");
  expect(host.textContent).toContain("2 duplicate or unsupported links skipped");
  expect(mocks.rpc).not.toHaveBeenCalled();
  await click("Import bookmarks");
  expect(mocks.rpc.mock.calls).toEqual([
    [
      "bookmarks.import",
      {
        bookmarks: [
          { url: "https://example.test/one", title: "Synthetic page", folderPath: ["Synthetic folder"] },
        ],
        folders: [["Synthetic folder"]],
      },
    ],
    ["bookmarks.list", {}],
  ]);
  expect(host.querySelector('[aria-label="Bookmark import preview"]')).toBeNull();
  expect(host.textContent).toContain("Imported 1 bookmarks");
  expect(mocks.publish).toHaveBeenCalledOnce();
});
it("Cancel import discards the selected file without a native write", async () => {
  await render();
  await file();
  await click("Cancel import");
  expect(host.querySelector('[aria-label="Bookmark import preview"]')).toBeNull();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("retains a refused import for explicit retry", async () => {
  mocks.rpc.mockRejectedValueOnce(new Error("native import refused"));
  await render();
  await file();
  await click("Import bookmarks");
  expect(host.textContent).toContain("native import refused");
  expect(host.querySelector('[aria-label="Bookmark import preview"]')).not.toBeNull();
  await click("Import bookmarks");
  expect(host.textContent).toContain("Imported 1 bookmarks");
});
it("never offers to replay an acknowledged import when the refresh fails", async () => {
  mocks.rpc
    .mockResolvedValueOnce({ added: 1, skipped: 0 })
    .mockRejectedValueOnce(new Error("refresh refused"));
  await render();
  await file();
  await click("Import bookmarks");
  expect(host.querySelector('[aria-label="Bookmark import preview"]')).toBeNull();
  expect(host.textContent).toContain("Bookmarks were imported, but the view could not refresh");
  expect(mocks.rpc.mock.calls.filter(([method]) => method === "bookmarks.import")).toHaveLength(1);
});
for (const retirement of ["window", "Private", "inactive"] as const)
  it(`retires an asynchronous file read across ${retirement} A→B→A`, async () => {
    const old = held<string>();
    await render();
    await file(old.promise);
    if (retirement === "window") mocks.windowId = "two";
    else if (retirement === "Private") mocks.privateMode = true;
    await render(retirement !== "inactive");
    mocks.windowId = "one";
    mocks.privateMode = false;
    await render();
    await file('<A HREF="https://example.test/fresh">Fresh synthetic page</A>');
    await act(async () => old.resolve(source));
    expect(host.textContent).toContain("Fresh synthetic page");
    expect(host.textContent).not.toContain("Synthetic folder");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
it("does not publish an old acknowledged import into a replacement window", async () => {
  const pending = held<{ added: number; skipped: number }>();
  mocks.rpc.mockReturnValueOnce(pending.promise);
  await render();
  await file();
  await click("Import bookmarks");
  mocks.windowId = "two";
  await render();
  mocks.windowId = "one";
  await render();
  await file('<A HREF="https://example.test/fresh">Fresh synthetic page</A>');
  await act(async () => pending.resolve({ added: 1, skipped: 0 }));
  expect(mocks.publish).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Fresh synthetic page");
  expect(mocks.rpc).toHaveBeenCalledTimes(1);
});
it("refuses oversized or unsupported files before any native write", async () => {
  await render();
  await file(source, 5_000_001);
  expect(host.textContent).toContain("smaller than 5 MB");
  await file('<A HREF="file:///tmp/secret">Unsupported</A>');
  expect(host.textContent).toContain("No supported");
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it("keeps the fresh pending file read busy when an old read finishes", async () => {
  const old = held<string>(),
    fresh = held<string>();
  await render();
  await file(old.promise);
  await render(false);
  await render();
  await file(fresh.promise);
  await act(async () => old.reject(new Error("retired read")));
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
  expect(host.textContent).not.toContain("retired read");
  await act(async () => fresh.resolve('<A HREF="https://example.test/fresh">Fresh synthetic page</A>'));
  expect(host.textContent).toContain("Fresh synthetic page");
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(false);
});
