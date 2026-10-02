import { afterEach, expect, it, vi } from "vitest";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import type { EgressLease } from "@aux/contracts";
const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach(fn => fn()));
function fixture() {
  const native = Object.assign(new NullNativeBridge(), {
    egressContext: vi.fn(async () => ({ profileId: "profile", tabId: "tab", frameId: "frame", documentToken: "document",
      sourceOrigin: "https://source.test", isolation: { isolationId: "isolated", runId: "run", taskId: "task", taskRevision: 1, inMemory: true as const, cookies: "empty" as const } })),
    egressInstall: vi.fn(async (_input: { lease: EgressLease; expectedUrl: string }) => ({ accepted: true as const })),
    egressRevoke: vi.fn(async (_input: { leaseId: string }) => ({ accepted: true as const })),
  });
  const service = new BrowserEgress({ profileId: "profile", native, run: () => ({ taskId: "task", taskRevision: 1, threadId: "thread" }),
    page: () => ({ url: "https://source.test/page", documentEpoch: 1 }), ownsPage: () => true, audit: () => {}, approve: async () => false });
  cleanup.push(() => service.close());
  return { service, native };
}
it("revocation during native document lookup prevents installation", async () => {
  const f = fixture(), context = await f.native.egressContext();
  let release!: () => void;
  f.native.egressContext.mockImplementationOnce(async () => { await new Promise<void>(resolve => { release = resolve; }); return context; });
  const acquire = f.service.acquire("run", "tab");
  await f.service.invalidateAuthority((_runId, origins) => origins.includes("https://source.test"));
  release();
  await expect(acquire).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.native.egressInstall).not.toHaveBeenCalled();
});
it("revocation during native installation refuses the late acknowledgement and repeats the exact tombstone", async () => {
  const f = fixture();
  let release!: () => void, entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  f.native.egressInstall.mockImplementationOnce(async () => { entered(); await new Promise<void>(resolve => { release = resolve; }); return { accepted: true }; });
  const acquire = f.service.acquire("run", "tab");
  await started;
  const lease = f.native.egressInstall.mock.calls[0]![0].lease;
  const finalCheck = f.service.permissionAuthority(lease);
  const retired = f.service.invalidateAuthority(() => true);
  expect(finalCheck).toThrow();
  await retired;
  release();
  await expect(acquire).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.native.egressRevoke.mock.calls.every(([request]) => request.leaseId === lease.leaseId)).toBe(true);
  expect(f.native.egressRevoke.mock.calls.length).toBeGreaterThanOrEqual(2);
});
it("an unrelated origin leaves the current exact document lease active", async () => {
  const f = fixture();
  await f.service.acquire("run", "tab");
  const lease = f.native.egressInstall.mock.calls[0]![0].lease;
  await f.service.invalidateAuthority((_runId, origins) => origins.includes("https://unrelated.test"));
  expect(() => f.service.permissionAuthority(lease)()).not.toThrow();
  expect(f.native.egressRevoke).not.toHaveBeenCalled();
});
it("a backend without exact native revocation cannot install transport authority", async () => {
  const f = fixture();
  Reflect.deleteProperty(f.native, "egressRevoke");
  await expect(f.service.acquire("run", "tab")).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(f.native.egressInstall).not.toHaveBeenCalled();
});
