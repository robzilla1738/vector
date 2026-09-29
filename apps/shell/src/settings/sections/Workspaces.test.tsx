// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WorkspacesSettings } from "./Workspaces";
import { SpaceMemory } from "./SpaceMemory";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../../store", () => ({ call: rpc }));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

function button(label: string) {
  const found = [...container.querySelectorAll("button")].find(item => item.textContent?.trim() === label);
  if (!found) throw new Error(`Missing ${label}`);
  return found;
}

it("reviews exact folder access and AGENTS.md before grant, then archives it", async () => {
  const workspaceId = "space-1";
  const path = "/private/tmp/fixture";
  const digest = "a".repeat(64);
  let folder: Record<string, unknown> | null = null;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Personal" }];
    if (method === "workspaces.folders.list") return folder ? [folder] : [];
    if (method === "commands.escalations.list") return [];
    if (method === "memory.pipeline.policy") return { workspaceId, enabled: false };
    if (method === "memory.pipeline.overview") return { workspaceId, enabled: false, summary: "", claimCount: 0, sourceCount: 0 };
    if (["memory.pipeline.sources", "memory.pipeline.inbox", "memory.pipeline.claims", "memory.pipeline.history"].includes(method)) return [];
    if (method === "workspaces.folders.inspect") return { ...params, path, agentsPreview: "Local notes", agentsDigest: digest, reviewDigest: digest };
    if (method === "workspaces.folders.add") { folder = { ...params, folderId: "folder-1", path, agentsChanged: false }; return folder; }
    if (method === "workspaces.folders.archive") { folder = { ...folder, archivedAt: Date.now() }; return folder; }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<WorkspacesSettings active />));
  const field = container.querySelector<HTMLInputElement>('input[aria-label="Local folder path"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, path);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => button("Review folder").click());
  expect(container.querySelector('[role="group"][aria-label="Folder access review"]')).not.toBeNull();
  expect(container.textContent).toContain("Local notes");
  expect(container.textContent).toContain(digest);
  await act(async () => button("Grant reviewed folder access").click());
  expect(rpc).toHaveBeenCalledWith("workspaces.folders.add", { workspaceId, path, access: "read", expectedDigest: digest });
  await act(async () => button("Archive folder access").click());
  expect(rpc).toHaveBeenCalledWith("workspaces.folders.archive", { workspaceId, folderId: "folder-1" });
});

it("reviews the exact command segment, reason and working folder before a local decision", async () => {
  const request = { requestId: "request-1", runId: "run-1", workspaceId: "space-1", segment: "pwd",
    workdir: "/private/tmp/fixture", justification: "Need owner-reviewed shell access",
    prefixRule: "pwd", state: "pending", createdAt: Date.now() };
  let state = "pending";
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId: "space-1", name: "Personal" }];
    if (method === "workspaces.folders.list") return [];
    if (method === "commands.escalations.list") return [{ ...request, state }];
    if (method === "memory.pipeline.policy") return { workspaceId: "space-1", enabled: false };
    if (method === "memory.pipeline.overview") return { workspaceId: "space-1", enabled: false, summary: "", claimCount: 0, sourceCount: 0 };
    if (["memory.pipeline.sources", "memory.pipeline.inbox", "memory.pipeline.claims", "memory.pipeline.history"].includes(method)) return [];
    if (method === "commands.escalations.decide") { state = "declined"; return { ...request, state }; }
    throw new Error(`Unexpected ${method}: ${JSON.stringify(params)}`);
  });
  await act(async () => root.render(<WorkspacesSettings active />));
  expect(container.textContent).toContain("Need owner-reviewed shell access");
  expect(container.textContent).toContain("/private/tmp/fixture");
  expect(container.textContent).toContain("pwd");
  await act(async () => button("Decline command").click());
  expect(rpc).toHaveBeenCalledWith("commands.escalations.decide", { requestId: "request-1", decision: "decline" });
  expect(container.textContent).toContain("No command requests awaiting review");
});

it("keeps extracted notes pending until the owner accepts or discards them", async () => {
  const workspaceId = "space-1";
  let enabled = false;
  let pending = false;
  let approved = false;
  const note = { claimId: "11669024-a817-444b-bafa-7622510e51a2", sourceRunId: "run-1",
    text: "The silver memory fixture belongs to this Space.", capturedAt: 1 };
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Personal" }];
    if (method === "workspaces.folders.list" || method === "commands.escalations.list") return [];
    if (method === "memory.pipeline.policy") return { workspaceId, enabled };
    if (method === "memory.pipeline.setPolicy") { enabled = params.enabled as boolean; return { workspaceId, enabled }; }
    if (method === "memory.pipeline.overview") return { workspaceId, enabled,
      summary: approved ? `- ${note.text} [run:run-1]` : "", claimCount: approved ? 1 : 0, sourceCount: approved ? 1 : 0 };
    if (method === "memory.pipeline.sources") return pending || approved ? [] : [{ runId: "run-1", goal: "Research", endedAt: 1 }];
    if (method === "memory.pipeline.inbox") return pending ? [note] : [];
    if (method === "memory.pipeline.claims") return approved ? [note] : [];
    if (method === "memory.pipeline.history") return approved ? [{ revisionId: "11669024-a817-444b-bafa-7622510e51a3",
      capturedAt: 1, claimCount: 1, summary: note.text, sourceRunIds: ["run-1"] }] : [];
    if (method === "memory.pipeline.extractRun") { pending = true; return { extracted: 1 }; }
    if (method === "memory.pipeline.review") { pending = false; approved = params.decision === "accept"; return { accepted: approved, remaining: 0 }; }
    if (method === "memory.pipeline.forget") { approved = false; return { forgotten: 1, remaining: 0 }; }
    if (method === "memory.pipeline.revert") return { workspaceId, enabled, summary: note.text, claimCount: 1, sourceCount: 1 };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<SpaceMemory workspaceId={workspaceId} />));
  const toggle = container.querySelector<HTMLInputElement>('input[aria-label="Enable Space memory"]')!;
  await act(async () => toggle.click());
  await act(async () => button("Create review notes").click());
  expect(container.textContent).toContain("1 pending notes · 0 approved notes");
  expect(container.textContent).toContain(note.text);
  await act(async () => button("Accept note").click());
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.review", { workspaceId, claimId: note.claimId, decision: "accept" });
  expect(container.textContent).toContain("0 pending notes · 1 approved notes");
  expect(container.querySelector("pre")?.textContent).toContain(note.text);
  await act(async () => button("Restore this revision").click());
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.revert", { workspaceId,
    revisionId: "11669024-a817-444b-bafa-7622510e51a3" });
  await act(async () => button("Forget note").click());
  expect(rpc).not.toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, claimId: note.claimId });
  expect(container.textContent).toContain("Forget run run-1");
  await act(async () => {
    const cancel = [...document.querySelectorAll<HTMLButtonElement>('dialog button')]
      .find(item => item.textContent?.trim() === "Keep memory");
    expect(cancel).toBeDefined();
    cancel!.click();
  });
  expect(rpc).not.toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, claimId: note.claimId });
  await act(async () => button("Forget note").click());
  await act(async () => {
    const confirm = [...document.querySelectorAll<HTMLButtonElement>('dialog button')]
      .find(item => item.textContent?.trim() === "Forget permanently");
    expect(confirm).toBeDefined();
    confirm!.click();
  });
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, claimId: note.claimId });
  expect(container.textContent).toContain("0 pending notes · 0 approved notes");
  expect(container.textContent).toContain("Previously copied offline exports cannot be revoked");
  expect(button("Create fresh local backup…")).toBeDefined();
});

it("offers UI-confirmed Forget for a source present only in history", async () => {
  const workspaceId = "space-1";
  const sourceRunId = "older-run";
  let historical = true;
  rpc.mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.policy") return { workspaceId, enabled: true };
    if (method === "memory.pipeline.overview") return { workspaceId, enabled: true,
      summary: "", claimCount: 0, sourceCount: 0 };
    if (method === "memory.pipeline.history") return historical ? [{
      revisionId: "11669024-a817-444b-bafa-7622510e51a4", capturedAt: 1,
      claimCount: 1, summary: "", sourceRunIds: [sourceRunId],
    }] : [];
    if (["memory.pipeline.sources", "memory.pipeline.inbox", "memory.pipeline.claims"].includes(method)) return [];
    if (method === "memory.pipeline.forget") { historical = false; return { forgotten: 1, remaining: 0 }; }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<SpaceMemory workspaceId={workspaceId} />));
  expect(container.textContent).toContain("Forget run older-run");
  await act(async () => button("Forget run older-run").click());
  await act(async () => {
    const cancel = [...document.querySelectorAll<HTMLButtonElement>('dialog button')]
      .find(item => item.textContent?.trim() === "Keep memory");
    cancel!.click();
  });
  expect(rpc).not.toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, sourceRunId });
  await act(async () => button("Forget run older-run").click());
  await act(async () => {
    const confirm = [...document.querySelectorAll<HTMLButtonElement>('dialog button')]
      .find(item => item.textContent?.trim() === "Forget permanently");
    confirm!.click();
  });
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, sourceRunId });
  expect(container.textContent).not.toContain("Forget run older-run");
});

it("requires UI confirmation before forgetting all pending and historical notes", async () => {
  const workspaceId = "space-1";
  const note = { claimId: "11669024-a817-444b-bafa-7622510e51a5", sourceRunId: "pending-run",
    text: "A pending Space note.", capturedAt: 1 };
  let forgotten = false;
  rpc.mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.policy") return { workspaceId, enabled: true };
    if (method === "memory.pipeline.overview") return { workspaceId, enabled: true,
      summary: "", claimCount: 0, sourceCount: 0 };
    if (method === "memory.pipeline.history") return forgotten ? [] : [{
      revisionId: "11669024-a817-444b-bafa-7622510e51a6", capturedAt: 1,
      claimCount: 1, summary: "", sourceRunIds: ["older-run"],
    }];
    if (method === "memory.pipeline.inbox") return forgotten ? [] : [note];
    if (["memory.pipeline.sources", "memory.pipeline.claims"].includes(method)) return [];
    if (method === "memory.pipeline.forget") { forgotten = true; return { forgotten: 2, remaining: 0 }; }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<SpaceMemory workspaceId={workspaceId} />));
  await act(async () => button("Forget all Space memory").click());
  expect(rpc).not.toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, all: true });
  await act(async () => {
    const confirm = [...document.querySelectorAll<HTMLButtonElement>('dialog button')]
      .find(item => item.textContent?.trim() === "Forget permanently");
    confirm!.click();
  });
  expect(rpc).toHaveBeenCalledWith("memory.pipeline.forget", { workspaceId, all: true });
  expect(container.textContent).not.toContain("A pending Space note.");
});

it("shows the gated memory preview without an unusable toggle", async () => {
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "space-1", name: "Personal" }];
    if (method === "workspaces.folders.list" || method === "commands.escalations.list") return [];
    throw new Error("AuxError: memory is preview in chromium-fork");
  });
  await act(async () => root.render(<SpaceMemory workspaceId="space-1" />));
  expect(container.textContent).toContain("Space memory is in preview in this build.");
  expect(container.querySelector('input[aria-label="Enable Space memory"]')).toBeNull();
});
