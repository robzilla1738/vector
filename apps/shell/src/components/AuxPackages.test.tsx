// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuxPackages } from "./AuxPackages";
import { call } from "../store";
vi.mock("../store", () => ({ call: vi.fn() }));
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.mocked(call).mockReset();
  vi.unstubAllGlobals();
});
it("distinguishes loading, an actual empty library and a failed read without installing anything", async () => {
  let finish!: (value: { packages: []; defaults: [] }) => void;
  vi.mocked(call).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => root.render(<AuxPackages />));
  expect(host.querySelector("output")?.textContent).toBe("Loading Aux Packages…");
  await act(async () => finish({ packages: [], defaults: [] }));
  expect(host.querySelector("output")?.textContent).toBe("No Aux Packages installed.");
  await act(async () => root.render(null));
  vi.mocked(call).mockRejectedValueOnce(new Error("Package library unavailable"));
  await act(async () => root.render(<AuxPackages />));
  expect(host.querySelector("output")).toBeNull();
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("Package library unavailable");
  expect(vi.mocked(call).mock.calls.every(([method]) => method === "packages.list")).toBe(true);
});
it("keeps an exact selected default set while retaining package versions, warnings and shipped removal limits", async () => {
  const library = {
    packages: [
      {
        name: "aux-core",
        version: "1.0.0",
        description: "Included guidance",
        shipped: true,
        warnings: [],
        skills: [],
        profiles: [],
      },
      {
        name: "custom-research",
        version: "2.1.0",
        description: "Owner-selected research",
        shipped: false,
        warnings: ["Review the imported instructions."],
        skills: [],
        profiles: [],
      },
    ],
    defaults: ["aux-core"],
  };
  vi.mocked(call)
    .mockResolvedValueOnce(library as never)
    .mockResolvedValueOnce({ ...library, defaults: ["aux-core", "custom-research"] } as never);
  await act(async () => root.render(<AuxPackages />));
  const toggle = host.querySelector<HTMLInputElement>('[aria-label="Use custom-research by default"]')!;
  expect(toggle.checked).toBe(false);
  await act(async () => toggle.click());
  expect(call).toHaveBeenLastCalledWith("packages.defaults", { names: ["aux-core", "custom-research"] });
  expect(toggle.checked).toBe(true);
  expect(host.textContent).toContain("2.1.0");
  expect(host.textContent).toContain("Review the imported instructions.");
  expect([...host.querySelectorAll("button")].filter((node) => node.textContent === "Remove")).toHaveLength(
    1,
  );
  expect(vi.mocked(call).mock.calls.some(([method]) => method === "packages.install")).toBe(false);
});
