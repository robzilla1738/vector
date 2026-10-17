// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { CloudExecution, CloudExecutionEditor } from "./CloudExecution";
const rpc = vi.hoisted(() => vi.fn());
const owner = vi.hoisted(() => ({
  windowId: "original-window",
  windowKind: "main",
  privateMode: false,
}));
vi.mock("../../store", () => ({ call: rpc }));
vi.mock("../../bridge", () => ({ bridge: owner }));

it("requires explicit rates and review, sends only the protected setup API and clears the credential draft", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  rpc.mockImplementation(async (method: string, params?: Record<string, unknown>) => {
    if (method === "settings.cloud.status") return { configured: false, revision: 4 };
    if (method === "settings.cloud.configure")
      return {
        configured: true,
        revision: 5,
        teamId: params!.teamId,
        projectId: params!.projectId,
        quote: {
          ...(params!.quote as object),
          revision: 5,
          accountDigest: "a".repeat(64),
        },
      };
    throw new Error(`Unexpected ${method}`);
  });
  const input = (label: string) =>
    [...container.querySelectorAll("label")]
      .find((item) => item.textContent?.startsWith(label))!
      .querySelector<HTMLInputElement>("input")!;
  const change = async (label: string, value: string) => {
    const field = input(label);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const save = () =>
    [...container.querySelectorAll("button")].find(
      (item) => item.textContent === "Save cloud account and rates",
    )!;
  try {
    await act(async () => root.render(<CloudExecutionEditor />));
    expect(
      [...container.querySelectorAll('input[type="number"]')].every(
        (field) => (field as HTMLInputElement).value === "",
      ),
    ).toBe(true);
    await act(async () => save().click());
    expect(rpc.mock.calls.filter(([method]) => method === "settings.cloud.configure")).toHaveLength(0);
    for (const [label, value] of Object.entries({
      "Vercel access token": "ephemeral-test-token",
      "Team ID": "team_fixture",
      "Project ID": "project_fixture",
      Region: "iad1",
      vCPUs: "2",
      "Maximum session lifetime": "60000",
      CPU: "0.12",
      Memory: "0.02",
      "Outgoing traffic": "0.15",
      "Session creation": "0.000001",
      "Rate documentation": "https://vercel.com/docs/sandbox/pricing",
    }))
      await change(label, value);
    await act(async () => {
      const basis = container.querySelector<HTMLSelectElement>("select")!;
      basis.value = "public-estimate";
      basis.dispatchEvent(new Event("change", { bubbles: true }));
      container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    });
    await act(async () => save().click());
    expect(rpc).toHaveBeenCalledWith(
      "settings.cloud.configure",
      expect.objectContaining({
        expectedRevision: 4,
        token: "ephemeral-test-token",
        teamId: "team_fixture",
        projectId: "project_fixture",
        quote: expect.objectContaining({
          rateBasis: "public-estimate",
          rates: {
            cpuUsdPerCoreHour: 0.12,
            memoryUsdPerGBHour: 0.02,
            outboundUsdPerGB: 0.15,
            creationUsd: 0.000001,
          },
        }),
      }),
    );
    expect(input("Vercel access token").value).toBe("");
    expect(rpc.mock.calls.every(([method]) => method.startsWith("settings.cloud."))).toBe(true);
    owner.windowId = "replacement-window";
    await act(async () => save().click());
    expect(rpc.mock.calls.filter(([method]) => method === "settings.cloud.configure")).toHaveLength(1);
  } finally {
    act(() => root.unmount());
    container.remove();
    owner.windowId = "original-window";
    vi.unstubAllGlobals();
  }
});

it("loads cloud setup on demand and clears the credential draft when the dialog is dismissed", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  rpc.mockReset().mockResolvedValue({ configured: false, revision: 4 });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CloudExecution />));
    expect(rpc).not.toHaveBeenCalled();
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    const token = document.querySelector<HTMLInputElement>('dialog input[type="password"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        token,
        "temporary-test-credential",
      );
      token.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () =>
      document
        .querySelector("dialog")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.querySelector("dialog")).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    expect(document.querySelector<HTMLInputElement>('dialog input[type="password"]')!.value).toBe("");
    expect(rpc.mock.calls.map(([method]) => method)).toEqual([
      "settings.cloud.status",
      "settings.cloud.status",
    ]);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});

it("recovers a failed status read without reopening the editor or admitting a save before status arrives", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc
    .mockReset()
    .mockRejectedValueOnce(new Error("Runtime is reconnecting"))
    .mockResolvedValueOnce({ configured: false, revision: 7 });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CloudExecutionEditor />));
    const save = () =>
      [...host.querySelectorAll("button")].find(
        (item) => item.textContent === "Save cloud account and rates",
      )!;
    expect(save().disabled).toBe(true);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Runtime is reconnecting");
    await act(async () =>
      [...host.querySelectorAll("button")]
        .find((item) => item.textContent === "Retry loading cloud account")!
        .click(),
    );
    expect(save().disabled).toBe(false);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(rpc.mock.calls.map(([method]) => method)).toEqual([
      "settings.cloud.status",
      "settings.cloud.status",
    ]);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
