import { createHash } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { openDb, Repo, ZapService } from "@aux/runtime";
import {
  RpcChannel,
  memoryTransportPair,
  ZapInstallReceiptSchema,
  ZapStylesheetInstallSchema,
  type ZapStylesheetInstall,
} from "@aux/contracts";
import type { NativeBridge } from "../../apps/runtime/src/native";
import { ChannelNativeBridge } from "../../apps/runtime/src/native";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function fixture(receiptPatch: Record<string, unknown> = {}) {
  const db = openDb(":memory:");
  databases.push(db);
  const calls: ZapStylesheetInstall[] = [];
  const native = {
    installZapStylesheet: async (request: ZapStylesheetInstall) => {
      calls.push(ZapStylesheetInstallSchema.parse(request));
      return ZapInstallReceiptSchema.parse({
        profileId: request.profileId,
        origin: request.origin,
        revision: request.revision,
        stylesheetSha256: request.stylesheetSha256,
        phase: "document_start",
        futureDocuments: true,
        appliedAt: Date.now(),
        activeDocuments: [{ pageId: "page-1", documentEpoch: 3, frameOrigin: request.origin, applied: true }],
        ...receiptPatch,
      });
    },
  } as NativeBridge;
  const repo = new Repo(db),
    zap = new ZapService(repo, native, "profile-a");
  return { repo, zap, calls, native };
}

it("grants one exact site, installs bounded stylesheet at document start, and persists a Profile snapshot", async () => {
  const f = fixture();
  const grant = await f.zap.grant("https://example.com");
  expect(grant.policy).toMatchObject({ origin: "https://example.com", revision: 1, enabled: true });
  const update = await f.zap.update({
    origin: "https://example.com",
    expectedRevision: 1,
    selectors: ["#sponsor", ".related-ad"],
    userCss: "article { max-width: 70ch; }",
    enabled: true,
  });
  const request = f.calls[1]!;
  expect(request).toMatchObject({
    profileId: "profile-a",
    origin: "https://example.com",
    revision: 2,
    phase: "document_start",
    frameScope: "matching_origin",
  });
  expect(request.stylesheet).toContain("#sponsor { display: none !important; }");
  expect(request.stylesheet).toContain("article { max-width: 70ch; }");
  expect(request.stylesheetSha256).toBe(createHash("sha256").update(request.stylesheet).digest("hex"));
  expect(update.receipt).toMatchObject({
    revision: 2,
    futureDocuments: true,
    activeDocuments: [
      { pageId: "page-1", documentEpoch: 3, frameOrigin: "https://example.com", applied: true },
    ],
  });
  expect(new ZapService(f.repo, f.native, "profile-a").snapshot("profile-a")).toEqual([request]);
  expect(() => f.zap.snapshot("profile-b")).toThrow(/another Profile/);
  const disabled = await f.zap.update({
    origin: "https://example.com",
    expectedRevision: 2,
    selectors: update.policy.selectors,
    userCss: update.policy.userCss,
    enabled: false,
  });
  expect(disabled.policy.enabled).toBe(false);
  expect(f.calls[2]?.stylesheet).toBe("");
  const revoked = await f.zap.revoke("https://example.com", 3);
  expect(revoked).toMatchObject({ policy: null, receipt: { revision: 4 } });
  expect(f.zap.list()).toEqual([]);
});

it("rejects ungranted sites, CSS network escapes, unsafe selectors, and stale revisions before native apply", async () => {
  const f = fixture();
  await expect(
    f.zap.update({
      origin: "https://example.com",
      expectedRevision: 1,
      selectors: [],
      userCss: "",
      enabled: true,
    }),
  ).rejects.toThrow(/Grant/);
  await expect(f.zap.grant("https://user:pw@example.com")).rejects.toThrow();
  await f.zap.grant("https://example.com");
  for (const userCss of [
    "@import 'https://evil.test/x.css';",
    "p { background: url(https://evil.test/x); }",
    "p { background: u/**/rl(https://evil.test/x); }",
    "p { background: u\\72l(https://evil.test/x); }",
    "p { background: var(--page-image); }",
  ]) {
    await expect(
      f.zap.update({
        origin: "https://example.com",
        expectedRevision: 1,
        selectors: [],
        userCss,
        enabled: true,
      }),
    ).rejects.toThrow();
  }
  await expect(
    f.zap.update({
      origin: "https://example.com",
      expectedRevision: 1,
      selectors: ["x } body { color: red"],
      userCss: "",
      enabled: true,
    }),
  ).rejects.toThrow();
  await expect(
    f.zap.update({
      origin: "https://example.com",
      expectedRevision: 2,
      selectors: [],
      userCss: "",
      enabled: true,
    }),
  ).rejects.toThrow(/changed/);
  expect(f.calls).toHaveLength(1);
  expect(f.zap.list()[0]?.revision).toBe(1);
});

it("requires a matching native receipt and preserves the previous revision on failure", async () => {
  const f = fixture();
  await f.zap.grant("https://example.com");
  const bad = fixture({ stylesheetSha256: "f".repeat(64) });
  const shared = new ZapService(f.repo, bad.native, "profile-a");
  await expect(
    shared.update({
      origin: "https://example.com",
      expectedRevision: 1,
      selectors: [".ad"],
      userCss: "",
      enabled: true,
    }),
  ).rejects.toThrow(/mismatched receipt/);
  expect(f.zap.list()[0]?.revision).toBe(1);
  const unavailable = new ZapService(f.repo, undefined, "profile-a");
  await expect(unavailable.revoke("https://example.com", 1)).rejects.toThrow(/unavailable/);
  expect(f.zap.list()).toHaveLength(1);
});

it("enforces the per-Profile site limit and serializes competing updates", async () => {
  const f = fixture();
  for (let index = 0; index < 100; index++) await f.zap.grant(`https://site-${index}.example`);
  await expect(f.zap.grant("https://site-100.example")).rejects.toThrow(/100 granted sites/);
  const changes = await Promise.allSettled([
    f.zap.update({
      origin: "https://site-0.example",
      expectedRevision: 1,
      selectors: [".one"],
      userCss: "",
      enabled: true,
    }),
    f.zap.update({
      origin: "https://site-0.example",
      expectedRevision: 1,
      selectors: [".two"],
      userCss: "",
      enabled: true,
    }),
  ]);
  expect(changes.map((item) => item.status)).toEqual(["fulfilled", "rejected"]);
  expect(f.zap.list().find((item) => item.origin === "https://site-0.example")?.revision).toBe(2);
});

it("round-trips the typed native install request and receipt through the host channel", async () => {
  const [runtimeTransport, hostTransport] = memoryTransportPair();
  const runtime = new RpcChannel(runtimeTransport),
    host = new RpcChannel(hostTransport);
  host.onMethod("native.zapInstallStylesheet", (value) => {
    const request = ZapStylesheetInstallSchema.parse(value);
    return ZapInstallReceiptSchema.parse({
      profileId: request.profileId,
      origin: request.origin,
      revision: request.revision,
      stylesheetSha256: request.stylesheetSha256,
      phase: "document_start",
      futureDocuments: true,
      activeDocuments: [],
      appliedAt: Date.now(),
    });
  });
  const request = ZapStylesheetInstallSchema.parse({
    profileId: "profile-a",
    origin: "https://example.com",
    revision: 1,
    stylesheet: "#ad { display:none!important; }",
    stylesheetSha256: createHash("sha256").update("#ad { display:none!important; }").digest("hex"),
    phase: "document_start",
    frameScope: "matching_origin",
  });
  expect(await new ChannelNativeBridge(runtime).installZapStylesheet(request)).toMatchObject({
    profileId: "profile-a",
    origin: "https://example.com",
    revision: 1,
    futureDocuments: true,
  });
});
