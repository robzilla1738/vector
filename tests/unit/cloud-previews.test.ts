import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { CloudPreviews } from "../../apps/runtime/dist/services/cloud-previews.js";
import { cloudListeners } from "../../apps/runtime/dist/services/cloud-process-worker.js";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
function fixture() {
  const order: string[] = [],
    token = randomUUID(),
    processId = randomUUID();
  const execution = {
    backend: "cloud" as const,
    resourceId: "resource",
    sessionId: "session",
    sandboxName: "aux-resource",
    root: "/vercel/sandbox/project",
    commandId: "command",
    supervisor: { pid: 10, startTicks: "1", groupPid: 11, groupStartTicks: "2" },
  };
  const process: CodingProcessReceipt = {
    processId,
    runId: "run",
    actionId: "start",
    requestHash: "hash",
    command: "dev",
    workdir: execution.root,
    startedAt: 1,
    state: "running",
    undoAvailable: false,
    execution,
  };
  let listener = { pid: 12, startTicks: "3", fd: 4, inode: "123", port: 3000 };
  const close = vi.fn(async () => {
    order.push("native-close");
    return { closed: true as const };
  });
  const expose = vi.fn(async (_port: number, _token: string, _signal?: AbortSignal, fence?: () => void) => {
    fence?.();
    order.push("expose");
    return "https://original.vercel.run/";
  });
  const previews = new CloudPreviews({
    context: { runId: "run", threadId: "chat", turnId: "run" },
    native: {
      cloudPreview: async (binding) => {
        order.push("native-open");
        return { previewId: binding.previewId, processId, url: binding.url, contentId: "native-content" };
      },
      cloudPreviewClose: close,
      turnSourceContext: async () => ({}) as never,
    },
    current: async () => {},
    process: () => process,
    listeners: async () => [listener],
    expose,
    hide: async () => {
      order.push("hide");
    },
    authorize: async () => () => {},
  });
  return {
    previews,
    processId,
    token,
    order,
    close,
    expose,
    replace: () => {
      listener = { ...listener, inode: "456" };
    },
  };
}
it("binds the exact listener and removes its port only after native guest retirement acknowledges", async () => {
  const f = fixture(),
    [preview, duplicate] = await Promise.all([
      f.previews.open({ processId: f.processId, port: 3000 }, f.token),
      f.previews.open({ processId: f.processId, port: 3000 }, f.token),
    ]);
  expect(duplicate).toEqual(preview);
  expect(f.expose).toHaveBeenCalledTimes(1);
  expect(await f.previews.admit(preview.previewId, f.token)).toBe(true);
  f.replace();
  expect(await f.previews.admit(preview.previewId, f.token)).toBe(false);
  f.close.mockRejectedValueOnce(new Error("Guest still stopping"));
  await expect(f.previews.close(preview.previewId, f.token)).rejects.toThrow("still stopping");
  expect(f.order).not.toContain("hide");
  await f.previews.close(preview.previewId, f.token);
  expect(f.order).toEqual(["expose", "native-open", "native-close", "hide"]);
  await f.previews.close(preview.previewId, f.token);
  expect(f.order.filter((event) => event === "hide")).toHaveLength(1);
});
it("does not adopt a preview from another source token or reopen a replaced listener", async () => {
  const f = fixture(),
    preview = await f.previews.open({ processId: f.processId, port: 3000 }, f.token);
  expect(await f.previews.admit(preview.previewId, randomUUID())).toBe(false);
  await expect(f.previews.close(preview.previewId, randomUUID())).rejects.toMatchObject({
    code: "ref_stale",
  });
  f.replace();
  await expect(f.previews.open({ processId: f.processId, port: 3000 }, f.token)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.expose).toHaveBeenCalledTimes(1);
  await f.previews.close(preview.previewId, f.token);
});
it("verifies Linux process start identities and socket ownership instead of printed port text", async () => {
  const root = mkdtempSync(join(tmpdir(), "aux-cloud-proc-"));
  const stat = (pid: number, group: number, ticks: string) =>
    `${pid} (fixture) S 1 ${group} ${Array(16).fill("0").join(" ")} ${ticks} 0\n`;
  try {
    mkdirSync(join(root, "net"));
    writeFileSync(
      join(root, "net/tcp"),
      "header\n0: 00000000:0BB8 00000000:0000 0A 00000000:00000000 00:00000000 00000000 1000 0 123 1\n",
    );
    writeFileSync(join(root, "net/tcp6"), "header\n");
    for (const [pid, group, ticks] of [
      [10, 10, "1"],
      [11, 11, "2"],
      [12, 11, "3"],
      [13, 13, "4"],
    ] as const) {
      mkdirSync(join(root, String(pid), "fd"), { recursive: true });
      writeFileSync(join(root, String(pid), "stat"), stat(pid, group, ticks));
    }
    symlinkSync("socket:[123]", join(root, "12/fd/4"));
    symlinkSync("socket:[123]", join(root, "13/fd/5"));
    const supervisor = { pid: 10, startTicks: "1", groupPid: 11, groupStartTicks: "2" };
    expect(await cloudListeners(supervisor, 3000, root)).toEqual([
      { pid: 12, startTicks: "3", fd: 4, inode: "123", port: 3000 },
    ]);
    writeFileSync(join(root, "11/stat"), stat(11, 11, "99"));
    await expect(cloudListeners(supervisor, 3000, root)).rejects.toThrow("retired");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
