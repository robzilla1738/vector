// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { RecoveryPackage } from "./RecoveryPackage";

const { call } = vi.hoisted(() => ({
  call: vi.fn(async (method: string) =>
    method === "installation.inspectRecovery"
      ? {
          sha256: "a".repeat(64),
          reviewToken: "00000000-0000-4000-8000-000000000001",
          manifest: {
            version: 1,
            createdAt: 1,
            sourceProfileId: "source",
            sqliteBytes: 1024,
            sqliteTables: ["protected_sqlite_v1:runs"],
            artifactIds: ["artifact"],
            spaceMemory: [{ workspaceId: "space", files: ["claims.json.enc"] }],
            pageMemoryCount: 1,
            excluded: ["Keychain credentials and connector tokens"],
          },
        }
      : { staged: true, artifactFiles: 1, spaceCount: 1, pageMemoryCount: 1 },
  ),
}));
vi.mock("../../store", async (original) => ({ ...(await original<typeof import("../../store")>()), call }));
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inNativeHost: true,
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    openFile: async () => "/tmp/review.auxrec",
    revealPath: async () => true,
  },
}));

it("requires an authenticated review before staging and clears the phrase afterward", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div"),
    root = createRoot(container),
    onStaged = vi.fn();
  document.body.append(container);
  const geometry = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{ width: 10, height: 10 }] as unknown as DOMRectList);
  const button = (label: string) =>
    [...container.querySelectorAll("button")].find((item) =>
      item.textContent?.includes(label),
    ) as HTMLButtonElement;
  try {
    await act(async () =>
      root.render(<RecoveryPackage active={true} refreshVersion={0} pending={false} onStaged={onStaged} />),
    );
    expect(container.textContent).toContain("Copies and phrases kept outside Aux cannot be revoked");
    expect(button("Stage reviewed recovery")).toBeUndefined();
    await act(async () => button("Choose package").click());
    const phrase = container.querySelector<HTMLInputElement>('input[type="password"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        phrase,
        "fixture recovery phrase",
      );
      phrase.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => button("Review package").click());
    expect(container.querySelector('[aria-label="Recovery package review"]')?.textContent).toContain(
      "Keychain credentials and connector tokens",
    );
    expect(button("Stage reviewed recovery").disabled).toBe(false);
    await act(async () => button("Stage reviewed recovery").click());
    expect(call).toHaveBeenCalledWith("installation.stageRecovery", {
      path: "/tmp/review.auxrec",
      phrase: "fixture recovery phrase",
      expectedSha256: "a".repeat(64),
      reviewToken: "00000000-0000-4000-8000-000000000001",
    });
    expect(onStaged).toHaveBeenCalledOnce();
    expect(phrase.value).toBe("");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    geometry.mockRestore();
    vi.unstubAllGlobals();
  }
});
