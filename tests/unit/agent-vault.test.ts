import { afterEach, expect, it } from "vitest";
import { VaultService, executeProgram, openDb, Repo } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native";
import type { DriverPage } from "@aux/chromium-driver";
import { AuxError } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

function memoryVault() {
  const secrets = new Map<string, string>();
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const native = {
    available: () => true,
    storeSecret: async (name: string, value: string) => { secrets.set(name, value); return { ok: true as const }; },
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
  } as NativeBridge;
  return { vault: new VaultService(new Repo(db), native), secrets, db };
}

function fakePage() {
  const calls: string[] = [];
  const page: DriverPage = {
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    url: () => "https://example.com/login",
    title: async () => "Login",
    isAttached: () => true,
    navigate: async () => {},
    back: async () => {},
    forward: async () => {},
    reload: async () => {},
    stop: async () => {},
    click: async () => { calls.push("click"); },
    dblclick: async () => {},
    hover: async () => {},
    fill: async (t, v) => { calls.push(`fill:${t}=${v}`); },
    typeText: async () => {},
    press: async () => {},
    check: async () => {},
    uncheck: async () => {},
    select: async () => {},
    scroll: async () => {},
    dragTo: async () => {},
    clickPoint: async () => {},
    uploadFiles: async () => { calls.push("upload"); },
    waitFor: async () => ({ ok: true, timedOut: false }),
    waitForDownload: async () => ({ suggestedFilename: "f.txt", path: "/tmp/f.txt" }),
    collectScroll: async () => ({ items: [], collected: 0 }),
    handleDialog: async () => { calls.push("dialog"); },
    screenshot: async () => ({ buffer: Buffer.from("png"), width: 1, height: 1, scale: 1 }),
    observe: async () => ({}) as never,
    expandRef: async () => [],
    extract: async () => ({ title: "ok" }),
    evaluate: async () => 1,
    setEvents: () => {},
    dispose: async () => {},
  };
  return { page, calls };
}

it("stores secrets outside sqlite and fills only through opaque grants", async () => {
  const { vault, secrets, db } = memoryVault();
  vault.lock("passphrase-ok");
  vault.unlock("passphrase-ok");
  const item = await vault.save({ label: "Example", origin: "https://example.com/login", secret: "s3cret-value", accountLabel: "work" });
  expect(JSON.stringify(db.prepare("SELECT * FROM vault_items").all())).not.toContain("s3cret-value");
  expect([...secrets.values()]).toContain("s3cret-value");
  const grant = vault.grant({ itemId: item.itemId, origin: "https://example.com" });
  expect(grant.credentialRef).toMatch(/^cref_[a-z0-9]{24,64}$/);
  const filled = await vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://example.com/account", target: "r1" });
  expect(filled).toBe("s3cret-value");
  expect(vault.history(item.itemId).some(row => row.action === "fill" && !JSON.stringify(row).includes("s3cret"))).toBe(true);
  await expect(vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://other.test", target: "r1" })).rejects.toMatchObject({ code: "conflict" });
});

it("fails closed on lock, expiry and revoke without retrying the write", async () => {
  const { vault, db } = memoryVault();
  await expect(vault.save({ label: "Example", origin: "https://example.com", secret: "x" })).rejects.toMatchObject({ code: "conflict" });
  vault.lock("passphrase-ok");
  expect(() => vault.unlock("nope-nope")).toThrow(AuxError);
  vault.unlock("passphrase-ok");
  const item = await vault.save({ label: "Example", origin: "https://example.com", secret: "x" });
  const grant = vault.grant({ itemId: item.itemId, origin: "https://example.com", ttlMs: 60_000 });
  vault.revoke({ grantId: grant.grantId });
  await expect(vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://example.com", target: "r1" })).rejects.toMatchObject({ code: "permission_denied" });
  const expired = vault.grant({ itemId: item.itemId, origin: "https://example.com", ttlMs: 60_000 });
  db.prepare("UPDATE vault_grants SET expires_at=1 WHERE grant_id=?").run(expired.grantId);
  await expect(vault.revealForFill(expired.credentialRef, { pageId: "p1", origin: "https://example.com", target: "r1" })).rejects.toMatchObject({ code: "permission_denied" });
});

it("keeps task-scoped grants from filling other tasks and never batches secrets", async () => {
  const { vault, db } = memoryVault();
  vault.lock("passphrase-ok");
  vault.unlock("passphrase-ok");
  db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES('ws','W',1)").run();
  for (const taskId of ["task-a", "task-b"]) {
    db.prepare("INSERT INTO tasks(task_id,workspace_id,revision,state,updated_at,json) VALUES(?,?,?,?,?,?)")
      .run(taskId, "ws", 1, "open", 1, "{}");
  }
  const item = await vault.save({ label: "Example", origin: "https://example.com", secret: "s3cret-value" });
  const grant = vault.grant({ itemId: item.itemId, origin: "https://example.com", taskId: "task-a" });
  await expect(vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://example.com", target: "r1" })).rejects.toMatchObject({ code: "conflict" });
  await expect(vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://example.com", target: "r1", taskId: "task-b" })).rejects.toMatchObject({ code: "conflict" });
  expect(await vault.revealForFill(grant.credentialRef, { pageId: "p1", origin: "https://example.com", target: "r1", taskId: "task-a" })).toBe("s3cret-value");

  const { page, calls } = fakePage();
  const result = await executeProgram(page, {
    pageId: "p1",
    steps: [
      { id: "s1", op: "fillCredential", target: "r1", credentialRef: grant.credentialRef },
      { id: "s2", op: "click", target: "r2" },
    ],
  }, {
    taskId: "task-a",
    pageOrigin: "https://example.com",
    resolveCredential: (ref, info) => vault.revealForFill(ref, info),
  });
  expect(result.status).toBe("completed");
  expect(JSON.stringify(result)).not.toContain("s3cret-value");
  expect(calls).toContain("fill:r1=s3cret-value");
  expect(calls).toContain("click");
});

it("renews an expired grant without duplicating the secret", async () => {
  const { vault, secrets, db } = memoryVault();
  vault.lock("passphrase-ok");
  vault.unlock("passphrase-ok");
  const item = await vault.save({ label: "Example", origin: "https://example.com", secret: "s3cret-value" });
  const grant = vault.grant({ itemId: item.itemId, origin: "https://example.com", ttlMs: 60_000 });
  db.prepare("UPDATE vault_grants SET expires_at=1 WHERE grant_id=?").run(grant.grantId);
  expect(vault.expiredGrants(Date.now()).map(row => row.grantId)).toEqual([grant.grantId]);
  const renewed = vault.renewGrant({ grantId: grant.grantId, ttlMs: 60_000 });
  expect(renewed.grantId).toBe(grant.grantId);
  expect(renewed.credentialRef).toBe(grant.credentialRef);
  expect(renewed.expiresAt).toBeGreaterThan(Date.now());
  expect(vault.expiredGrants()).toEqual([]);
  expect([...secrets.values()].filter(value => value === "s3cret-value")).toHaveLength(1);
  expect(vault.history(item.itemId).some(row => row.detail?.includes("renewed without duplicating"))).toBe(true);
});

it("scopes the visible grants to a run's declared account labels", async () => {
  const { vault } = memoryVault();
  vault.lock("passphrase-ok");
  vault.unlock("passphrase-ok");
  const work = await vault.save({ label: "Work login", origin: "https://example.com", secret: "work-secret", accountLabel: "Work" });
  const personal = await vault.save({ label: "Personal login", origin: "https://example.com", secret: "personal-secret", accountLabel: "Personal" });
  const unlabeled = await vault.save({ label: "Old login", origin: "https://example.com", secret: "old-secret" });
  const grants = {
    work: vault.grant({ itemId: work.itemId, origin: "https://example.com" }),
    personal: vault.grant({ itemId: personal.itemId, origin: "https://example.com" }),
    unlabeled: vault.grant({ itemId: unlabeled.itemId, origin: "https://example.com" }),
  };

  // No declared boundary — every grant for the origin is visible (unchanged behavior).
  expect(vault.grants({ origin: "https://example.com" }).map(grant => grant.grantId).sort())
    .toEqual([grants.work.grantId, grants.personal.grantId, grants.unlabeled.grantId].sort());
  expect(vault.grants({ origin: "https://example.com", accountLabels: [] })).toHaveLength(3);

  // A declared boundary shows only its labeled accounts; unlabeled grants are never in scope.
  expect(vault.grants({ origin: "https://example.com", accountLabels: ["Work"] }).map(grant => grant.grantId))
    .toEqual([grants.work.grantId]);
  expect(vault.grants({ origin: "https://example.com", accountLabels: ["Work", "Personal"] }).map(grant => grant.grantId).sort())
    .toEqual([grants.work.grantId, grants.personal.grantId].sort());
  expect(vault.grants({ origin: "https://example.com", accountLabels: ["NotSaved"] })).toEqual([]);
});

it("refuses a fill whose grant is outside the run's declared account labels", async () => {
  const { vault } = memoryVault();
  vault.lock("passphrase-ok");
  vault.unlock("passphrase-ok");
  const work = await vault.save({ label: "Work login", origin: "https://example.com", secret: "work-secret", accountLabel: "Work" });
  const unlabeled = await vault.save({ label: "Old login", origin: "https://example.com", secret: "old-secret" });
  const workGrant = vault.grant({ itemId: work.itemId, origin: "https://example.com" });
  const oldGrant = vault.grant({ itemId: unlabeled.itemId, origin: "https://example.com" });
  const fill = { pageId: "p1", origin: "https://example.com", target: "r1" };

  await expect(vault.revealForFill(oldGrant.credentialRef, { ...fill, accountLabels: ["Work"] }))
    .rejects.toMatchObject({ code: "permission_denied" });
  await expect(vault.revealForFill(workGrant.credentialRef, { ...fill, accountLabels: ["Work"] }))
    .resolves.toBe("work-secret");
  await expect(vault.revealForFill(oldGrant.credentialRef, fill)).resolves.toBe("old-secret");
});
