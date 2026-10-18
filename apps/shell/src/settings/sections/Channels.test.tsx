// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChannelStatusSchema, type AuxEvent, type MethodParams, type MethodResult } from "@aux/contracts";
import { ChannelsSettings } from "./Channels";
import { call } from "../../store";

const events = new Set<(event: AuxEvent) => void>();
vi.mock("../../bridge", () => ({
  bridge: {
    windowId: "channel-ui",
    windowKind: "normal",
    privateMode: false,
    onEvent: (callback: (event: AuxEvent) => void) => {
      events.add(callback);
      return () => events.delete(callback);
    },
    onRuntimeStatus: () => () => {},
  },
  inNativeHost: true,
  inMock: false,
}));
vi.mock("../../store", () => ({ call: vi.fn() }));
vi.mock("../../commands", async () => {
  const { COMMANDS } = await import("@aux/contracts");
  const { invokeScopedControl } = await import("../../scoped-control-commands");
  const { commandExecutor } = await import("../../command-execution");
  const executor = commandExecutor(
    (id: string, context: Parameters<typeof invokeScopedControl>[1]) => {
      const command = COMMANDS.find((entry) => entry.id === id);
      return command && "dispatch" in command && command.dispatch === "scoped"
        ? () => invokeScopedControl(id, context)
        : undefined;
    },
    () => {},
  );
  return { executeCommand: executor.execute };
});

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
let connections: MethodResult<"channels.list">,
  peers: MethodResult<"channels.peers">,
  deliveries: MethodResult<"channels.deliveries">;
const workspace = { workspaceId: "synthetic-space", name: "Synthetic Space", createdAt: 1 };
const status = () =>
  ChannelStatusSchema.parse({
    connectionId: randomUUID(),
    revision: randomUUID(),
    provider: "telegram",
    name: "Synthetic messenger",
    workspaceId: workspace.workspaceId,
    enabled: true,
    options: { audience: "paired", requireMentionsInThreads: true, followUp: "queue" },
    identity: { provider: "telegram", botId: "100", name: "Synthetic bot" },
    createdAt: 1,
    updatedAt: 1,
    status: "connected",
    credentialAvailable: true,
    pendingMessages: 0,
    uncertainDeliveries: 0,
  });
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  connections = [];
  peers = [];
  deliveries = [];
  events.clear();
  vi.mocked(call).mockImplementation(async (method, input) => {
    if (method === "channels.list") return connections as never;
    if (method === "workspaces.list") return [workspace] as never;
    if (method === "channels.peers") return peers as never;
    if (method === "channels.deliveries") return deliveries as never;
    if (method === "channels.save") {
      const value = input as MethodParams<"channels.save">;
      const next = ChannelStatusSchema.parse({
        ...status(),
        provider: value.provider,
        name: value.name,
        workspaceId: value.workspaceId,
        options: value.options,
      });
      connections = [next];
      return next as never;
    }
    if (method === "channels.peer") {
      const value = input as { peerKey: string; action: "pair" | "block" };
      peers = peers.map((peer) =>
        peer.peerKey === value.peerKey
          ? { ...peer, state: value.action === "pair" ? "paired" : "blocked" }
          : peer,
      );
      return peers[0] as never;
    }
    if (method === "channels.retryDelivery") {
      deliveries = [];
      return { queued: true } as never;
    }
    throw new Error(`Unexpected channel fixture method: ${method}`);
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  events.clear();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
const render = () => act(async () => root.render(<ChannelsSettings active />));
function button(label: string) {
  const found = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent?.trim() === label || node.getAttribute("aria-label") === label,
  );
  if (!found) throw new Error(`Missing channel button: ${label}`);
  return found;
}
async function click(label: string) {
  await act(async () => button(label).click());
}
async function enter(label: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it("connects from the actual registered form and retains a credential draft during status refresh", async () => {
  await render();
  await click("Add messenger");
  await click("Telegram");
  await enter("Channel name", "Synthetic channel label");
  await enter("Bot token", "100:synthetic-ui-only");
  await act(async () => {
    for (const notify of events)
      notify({ type: "channels.changed", payload: {}, seq: 1, streamId: "fixture", ts: 1 });
  });
  expect(document.querySelector<HTMLInputElement>('input[aria-label="Bot token"]')?.value).toBe(
    "100:synthetic-ui-only",
  );
  expect(document.querySelector<HTMLSelectElement>('select[aria-label="Channel Space"]')?.value).toBe(
    workspace.workspaceId,
  );
  expect(button("Connect").type).toBe("submit");
  await act(async () =>
    document
      .querySelector<HTMLFormElement>('form[data-command-id="save-channel"]')!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(call).toHaveBeenCalledWith(
    "channels.save",
    expect.objectContaining({
      provider: "telegram",
      name: "Synthetic channel label",
      workspaceId: workspace.workspaceId,
      expectedRevision: null,
      credentials: { provider: "telegram", botToken: "100:synthetic-ui-only" },
    }),
  );
  expect(document.querySelector("dialog")).toBeNull();
  expect(host.textContent).toContain("Synthetic channel label");
});

it("pairs only the displayed original messenger identity and revision", async () => {
  const connection = status();
  connections = [connection];
  const peer = {
    peerKey: "synthetic-peer",
    providerUserId: "200",
    name: "Synthetic person",
    state: "pending" as const,
    requestId: randomUUID(),
    expiresAt: Date.now() + 600000,
    createdAt: 1,
    updatedAt: 1,
  };
  peers = [peer];
  await render();
  await click("Manage Synthetic messenger");
  expect(document.querySelectorAll("select")).toHaveLength(3);
  await click("Pairing");
  expect(document.querySelector("dialog")?.textContent).toContain("200");
  await click("Pair");
  expect(call).toHaveBeenCalledWith("channels.peer", {
    connectionId: connection.connectionId,
    expectedRevision: connection.revision,
    peerKey: peer.peerKey,
    action: "pair",
    requestId: peer.requestId,
  });
  expect(document.querySelector("dialog")?.textContent).toContain("Paired");
  expect(document.querySelector<HTMLInputElement>('input[aria-label="Bot token"]')).toBeNull();
  await click("Credentials");
  expect(document.querySelector<HTMLInputElement>('input[aria-label="Bot token"]')?.value).toBe("");
});

it("shows the exact reply and duplicate-delivery uncertainty before the retry action", async () => {
  const connection = status();
  connections = [connection];
  const delivery = {
    deliveryId: randomUUID(),
    connectionId: connection.connectionId,
    state: "unknown" as const,
    createdAt: 1,
    updatedAt: 1,
    text: "Synthetic reply for review",
    peerName: "Synthetic person",
    canRetry: true,
    conversationId: "300",
  };
  deliveries = [delivery];
  await render();
  await click("Manage Synthetic messenger");
  await click("Pairing");
  await click("Review…");
  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain(delivery.text);
  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain(
    "Retrying can create a duplicate",
  );
  expect(vi.mocked(call).mock.calls.filter(([method]) => method === "channels.retryDelivery")).toHaveLength(
    0,
  );
  await click("Retry reply");
  expect(call).toHaveBeenCalledWith("channels.retryDelivery", {
    connectionId: connection.connectionId,
    expectedRevision: connection.revision,
    deliveryId: delivery.deliveryId,
  });
});

it("retains the original modal opener across Options, Pairing and Credentials before Escape", async () => {
  connections = [status()];
  await render();
  const opener = button("Manage Synthetic messenger");
  opener.focus();
  await click("Manage Synthetic messenger");
  for (const tab of ["Pairing", "Credentials", "Options", "Credentials"]) await click(tab);
  const dialog = document.querySelector<HTMLDialogElement>(
    'dialog[aria-label="Manage Synthetic messenger"]',
  )!;
  expect(dialog.open).toBe(true);
  button("Done").focus();
  await act(async () =>
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(document.querySelector("dialog")).toBeNull();
  expect(document.activeElement).toBe(opener);
});
