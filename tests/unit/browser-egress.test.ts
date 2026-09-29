import { afterEach, describe, expect, it, vi } from "vitest";
import type { EgressLease, EgressRequest } from "@aux/contracts";
import { BrowserEgress, type BrowserEgressDeps } from "../../apps/runtime/src/safety/browser-egress.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";

const active: BrowserEgress[] = [];
afterEach(() => { for (const service of active.splice(0)) service.close(); });

function fixture(approve: BrowserEgressDeps["approve"] = async () => true) {
  let now = 1000, revision = 4, epoch = 3, token = "native-document-1", owns = true, alive = true;
  let url = "https://source.test/page", controller = "none";
  const leases: EgressLease[] = [];
  const revoke = vi.fn(async () => ({ accepted: true as const }));
  const consent = vi.fn(approve);
  const native = Object.assign(new NullNativeBridge(), {
    egressContext: vi.fn(async () => ({ profileId: "profile", tabId: "tab", frameId: "process:frame", documentToken: token, sourceOrigin: url === "about:blank" ? "aux://blank" : new URL(url).origin })),
    egressInstall: vi.fn(async ({ lease }: { lease: EgressLease }) => { leases.push(lease); return { accepted: true as const }; }),
    egressRevoke: revoke,
  });
  const service = new BrowserEgress({
    profileId: "profile", native, now: () => now,
    run: () => alive ? { taskId: "task", taskRevision: revision, threadId: "thread" } : null,
    page: () => ({ url, documentEpoch: epoch, controller }),
    ownsPage: () => owns,
    audit: vi.fn(), approve: consent,
  });
  active.push(service);
  let sequence = 0;
  const request = (destination: string, body = "", patch: Partial<EgressRequest["evidence"]> = {}) => {
    const lease = leases.at(-1)!;
    return { requestId: `request-${++sequence}`, bodyBase64: Buffer.from(body).toString("base64"), evidence: {
      leaseId: lease.leaseId, profileId: lease.profileId, runId: lease.runId, taskId: lease.taskId,
      taskRevision: lease.taskRevision, tabId: lease.tabId, frameId: lease.frameId,
      documentEpoch: lease.documentEpoch, documentToken: lease.documentToken,
      destination, kind: "fetch" as const, method: "POST" as const,
      byteCount: Buffer.byteLength(body), bodyComplete: true, observedAt: now, ...patch,
    } };
  };
  return { service, native, consent, request, leases,
    navigate: (nextUrl?: string) => { epoch++; token = `native-document-${epoch}`; if (nextUrl) url = nextUrl; },
    takeover: () => { controller = "human"; },
    staleTask: () => { revision++; }, relinquish: () => { owns = false; },
    stop: () => { alive = false; }, advance: (ms: number) => { now += ms; } };
}

describe("native browser egress authority", () => {
  it("binds native frame/document identity before work and allows same-origin traffic", async () => {
    const f = fixture();
    const release = await f.service.acquire("run", "tab");
    expect(f.leases[0]).toMatchObject({ frameId: "process:frame", documentToken: "native-document-1", taskId: "task", taskRevision: 4 });
    expect((await f.service.request(f.request("https://source.test/save", "public query"))).decision.reason).toBe("same_origin");
    expect(f.consent).not.toHaveBeenCalled();
    release();
    expect((await f.service.request(f.request("https://source.test/save"))).decision.status).toBe("deny");
    expect(f.native.egressRevoke).toHaveBeenCalledWith({ leaseId: f.leases[0]!.leaseId });
  });

  it("refuses an identical-URL reload, substituted frame and stale task revision", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    expect((await f.service.request(f.request("https://source.test", "", { documentToken: "other" }))).decision.reason).toBe("identity_mismatch");
    f.navigate();
    expect((await f.service.request(f.request("https://source.test"))).decision.status).toBe("deny");
    await f.service.ensure("run", "tab");
    expect(f.leases).toHaveLength(2);
    f.staleTask();
    expect((await f.service.request(f.request("https://source.test"))).decision.status).toBe("deny");
  });

  it("asks for each exact recipient request and never exposes URL/body in consent", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    const req = f.request("https://recipient.test/path?public=value", "public-content");
    expect((await f.service.request(req)).decision.status).toBe("allow");
    expect(f.consent).toHaveBeenCalledWith(expect.objectContaining({
      sourceOrigin: "https://source.test", destinationOrigin: "https://recipient.test", digest: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
    expect(JSON.stringify(f.consent.mock.calls)).not.toContain("public-content");
    expect(JSON.stringify(f.consent.mock.calls)).not.toContain("?public");
    expect((await f.service.request(req)).decision.status).toBe("deny");
    await f.service.request(f.request("https://substituted.test/", "public-content"));
    expect(f.consent).toHaveBeenCalledTimes(2);
    expect(f.consent.mock.calls[0]![0].digest).not.toBe(f.consent.mock.calls[1]![0].digest);
  });

  it("cancellation aborts pending consent and a late acceptance cannot send", async () => {
    let accept!: (value: boolean) => void;
    const f = fixture(() => new Promise(resolve => { accept = resolve; }));
    await f.service.acquire("run", "tab");
    const waiting = f.service.request(f.request("https://recipient.test/"));
    expect(f.consent).toHaveBeenCalledTimes(1);
    f.service.revokeRun("run");
    expect(f.consent.mock.calls[0]![0].signal.aborted).toBe(true);
    accept(true);
    expect((await waiting).decision.status).toBe("deny");
  });

  it("never overrides protected memory after approval, renewal or navigation", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    f.service.protect("run", "Private memory: aurora-keeper-784991 confidential account", "memory");
    for (const body of ["aurora-keeper-784991", Buffer.from("aurora-keeper-784991").toString("base64")]) {
      expect((await f.service.request(f.request("https://recipient.test/", body))).decision).toMatchObject({ status: "deny", reason: "protected_overlap", protectedClass: "memory" });
    }
    expect(f.consent).not.toHaveBeenCalled();
    f.navigate();
    await f.service.ensure("run", "tab");
    expect((await f.service.request(f.request("https://source.test/", "aurora-keeper-784991"))).decision.status).toBe("deny");
  });

  it("reviews page-content reuse across origins and refuses incomplete/binary bodies", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    f.service.notePageText("run", "tab", "Please send the selected meeting schedule to another service");
    expect((await f.service.request(f.request("https://recipient.test/", "selected meeting schedule to another service"))).decision.status).toBe("allow");
    expect(f.consent.mock.calls[0]![0].pageContent).toBe(true);
    expect((await f.service.request(f.request("https://source.test/", "abc", { bodyComplete: false }))).decision.reason).toBe("incomplete_body");
    const binary = f.request("https://source.test/", "a");
    binary.bodyBase64 = Buffer.from([255]).toString("base64");
    expect((await f.service.request(binary)).decision.reason).toBe("incomplete_body");
  });

  it("keeps the original content source when it is reused from another document", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    f.service.notePageText("run", "tab", "The selected meeting schedule requires recipient review");
    f.navigate("https://recipient.test/page");
    await f.service.ensure("run", "tab");
    await f.service.request(f.request("https://recipient.test/save", "The selected meeting schedule requires recipient review"));
    expect(f.consent).toHaveBeenCalledWith(expect.objectContaining({
      sourceOrigin: "https://source.test", destinationOrigin: "https://recipient.test", pageContent: true,
    }));
  });

  it("retains protected context while authority is suspended and reacquired", async () => {
    const f = fixture();
    await f.service.acquire("run", "tab");
    f.service.protect("run", "private-remembered-91827", "memory");
    f.service.suspendRun("run");
    await f.service.acquire("run", "tab");
    expect((await f.service.request(f.request("https://source.test/", "private-remembered-91827"))).decision.reason).toBe("protected_overlap");
  });

  it("binds a blank tab's first GET to the exact intended URL and consumes it once", async () => {
    const f = fixture();
    f.navigate("about:blank");
    await f.service.acquire("run", "tab", "https://source.test/first");
    expect(f.leases[0]).toMatchObject({ sourceOrigin: "aux://blank", initialDestination: "https://source.test/first" });
    expect((await f.service.request(f.request("https://source.test/other", "", { kind: "navigation", method: "GET" }))).decision.status).toBe("deny");
    expect((await f.service.request(f.request("https://source.test/first", "", { kind: "fetch", method: "GET" }))).decision.status).toBe("deny");
    expect((await f.service.request(f.request("https://source.test/first", "", { kind: "navigation", method: "GET" }))).decision.status).toBe("allow");
    expect((await f.service.request(f.request("https://source.test/first", "", { kind: "navigation", method: "GET" }))).decision.status).toBe("deny");
    expect(f.consent).not.toHaveBeenCalled();
    // The native loader additionally binds this redirect to the admitted request chain.
    expect((await f.service.request(f.request("https://recipient.test/redirect", "", { kind: "redirect", method: "GET" }))).decision.status).toBe("allow");
  });

  it("refuses untargeted blank authority and still blocks private initial URL bytes", async () => {
    const f = fixture();
    f.navigate("about:blank");
    await expect(f.service.acquire("run", "tab")).rejects.toThrow(/exact HTTP/);
    f.service.protect("run", "private-new-tab-target-93812", "memory");
    const url = "https://source.test/?q=private-new-tab-target-93812";
    await f.service.acquire("run", "tab", url);
    expect((await f.service.request(f.request(url, "", { kind: "navigation", method: "GET" }))).decision)
      .toMatchObject({ status: "deny", reason: "protected_overlap", protectedClass: "memory" });
  });

  it("rechecks fingerprints learned while the exact recipient approval is pending", async () => {
    let accept!: (value: boolean) => void;
    const f = fixture(() => new Promise(resolve => { accept = resolve; }));
    await f.service.acquire("run", "tab");
    const waiting = f.service.request(f.request("https://recipient.test/", "new-private-memory-8756"));
    f.service.protect("run", "new-private-memory-8756", "memory");
    accept(true);
    expect((await waiting).decision.reason).toBe("protected_overlap");
  });

  it("rejects new authority during human takeover and rebinds a document that changes during install", async () => {
    const f = fixture();
    const install = f.native.egressInstall.getMockImplementation()!;
    let release!: () => void;
    const waiting = new Promise<void>(resolve => { release = resolve; });
    f.native.egressInstall.mockImplementationOnce(async input => { await install(input); await waiting; return { accepted: true }; });
    const old = f.service.acquire("run", "tab");
    const oldFailure = expect(old).rejects.toMatchObject({ code: "ref_stale" });
    await vi.waitFor(() => expect(f.leases).toHaveLength(1));
    f.navigate();
    const next = f.service.ensure("run", "tab");
    release();
    await oldFailure;
    await next;
    expect(f.leases).toHaveLength(2);
    expect((await f.service.request(f.request("https://source.test/"))).decision.status).toBe("allow");
    f.takeover();
    expect((await f.service.request(f.request("https://source.test/"))).decision.status).toBe("deny");
    await expect(f.service.ensure("run", "tab")).rejects.toMatchObject({ code: "permission_denied" });
  });

  it("fails closed before install on ownership loss or unavailable native support", async () => {
    const f = fixture();
    f.relinquish();
    await expect(f.service.acquire("run", "tab")).rejects.toMatchObject({ code: "permission_denied" });
    expect(f.native.egressInstall).not.toHaveBeenCalled();
  });
});
