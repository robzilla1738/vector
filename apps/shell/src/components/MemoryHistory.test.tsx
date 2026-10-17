// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { MemoryHistory } from "./MemoryHistory";
vi.mock("./MemoryDocument", () => ({ MemoryDocument: ({ text }: { text: string }) => <p>{text}</p> }));

it("selects the matching restore target and falls back when that revision disappears", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const restore = vi.fn();
  const revisions = [
    { revisionId: "new", capturedAt: 2000, claimCount: 2, summary: "Latest notes", sourceRunIds: ["run"] },
    { revisionId: "old", capturedAt: 1000, claimCount: 1, summary: "Earlier notes", sourceRunIds: ["run"] },
  ];
  const render = (items: typeof revisions) =>
    root.render(
      <MemoryHistory
        revisions={items}
        restore={(revision) => <button onClick={() => restore(revision.revisionId)}>Restore</button>}
      />,
    );
  try {
    await act(async () => render(revisions));
    expect(host.querySelector("section")?.textContent).toContain("Latest notes");
    await act(async () => host.querySelectorAll<HTMLButtonElement>("nav button")[1]!.click());
    expect(host.querySelector("section")?.textContent).toContain("Earlier notes");
    await act(async () => host.querySelector<HTMLButtonElement>("section button")!.click());
    expect(restore).toHaveBeenLastCalledWith("old");
    await act(async () => render([revisions[0]!]));
    expect(host.querySelector("section")?.textContent).toContain("Latest notes");
    await act(async () => host.querySelector<HTMLButtonElement>("section button")!.click());
    expect(restore).toHaveBeenLastCalledWith("new");
    await act(async () => render([]));
    expect(host.textContent).toContain("No memory revisions yet.");
    expect(host.querySelector("button")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
