/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { openDb, Repo, VaultService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native";
import { AuxError } from "@aux/contracts";
import { captureLoginScript, credentialFillScript } from "../../apps/desktop/main/credential-fill";
import { CREDENTIAL_BINDING, credentialDetectScript } from "../../apps/desktop/main/credential-detect";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const fn of cleanup.splice(0).reverse()) fn();
  document.body.innerHTML = "";
  for (const name of bindingNames.splice(0)) delete (globalThis as Record<string, unknown>)[name];
});

function memoryVault() {
  const secrets = new Map<string, string>();
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const native = {
    available: () => true,
    storeSecret: async (name: string, value: string) => { secrets.set(name, value); return { ok: true as const }; },
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
  } as NativeBridge;
  return { vault: new VaultService(new Repo(db), native), secrets };
}

async function unlocked(vault: VaultService) {
  vault.lock("test-passphrase");
  await vault.unlock("test-passphrase", 60_000);
}

async function saved(vault: VaultService, origin = "https://example.com") {
  await unlocked(vault);
  return vault.save({ label: "Example", origin, username: "ada", secret: "s3cret!" });
}

/* ------------------------------- origin matching ------------------------------ */

it("itemsForOrigin returns only live credentials for the exact origin", async () => {
  const { vault } = memoryVault();
  const item = await saved(vault);
  await vault.save({ label: "Sub", origin: "https://app.example.com", secret: "x" });
  await vault.save({ label: "Other", origin: "https://example.com.evil.test", secret: "y" });
  const matches = vault.itemsForOrigin("https://example.com");
  expect(matches.map(i => i.itemId)).toEqual([item.itemId]);
  await vault.revoke({ itemId: item.itemId });
  expect(vault.itemsForOrigin("https://example.com")).toEqual([]);
  expect(vault.itemsForOrigin("not a url")).toEqual([]);
});

it("revealForHumanFill returns the secret for the matching origin and records the fill", async () => {
  const { vault, secrets } = memoryVault();
  const item = await saved(vault);
  const revealed = await vault.revealForHumanFill(item.itemId, { pageId: "p1", origin: "https://example.com" });
  expect(revealed).toEqual({ username: "ada", secret: "s3cret!" });
  expect(secrets.size).toBe(1);
  const history = vault.history(item.itemId, 10);
  const fill = history.find(row => row.action === "fill");
  expect(fill?.detail).toContain("human fill");
  expect(fill?.detail ?? "").not.toContain("s3cret!");
});

it("revealForHumanFill denies wrong, lookalike and subdomain origins", async () => {
  const { vault } = memoryVault();
  const item = await saved(vault);
  for (const origin of ["https://other.com", "https://example.com.evil.test", "https://app.example.com", "https://example.com:8443"]) {
    await expect(vault.revealForHumanFill(item.itemId, { pageId: "p1", origin })).rejects.toBeInstanceOf(AuxError);
  }
  const denials = vault.history(item.itemId, 20).filter(row => row.action === "denied" && row.detail === "origin mismatch");
  expect(denials.length).toBe(4);
});

it("revealForHumanFill denies revoked and expired credentials", async () => {
  const { vault } = memoryVault();
  const item = await saved(vault);
  await vault.revoke({ itemId: item.itemId });
  await expect(vault.revealForHumanFill(item.itemId, { pageId: "p1", origin: "https://example.com" })).rejects.toThrow(/revoked/);
  const second = await vault.save({ label: "Expiring", origin: "https://example.com", secret: "z", expiresAt: Date.now() - 1000 });
  await expect(vault.revealForHumanFill(second.itemId, { pageId: "p1", origin: "https://example.com" })).rejects.toThrow(/expired/);
});

it("itemsForOrigin excludes non-password secrets from the fill surface", async () => {
  const { vault } = memoryVault();
  await saved(vault);
  await vault.save({ label: "API key", origin: "https://example.com", kind: "secret", secret: "ak-123" });
  const matches = vault.itemsForOrigin("https://example.com");
  expect(matches.length).toBe(1);
  expect(matches[0]!.username).toBe("ada");
});

it("secretMatches distinguishes unchanged secrets without a fill record", async () => {
  const { vault } = memoryVault();
  const item = await saved(vault);
  expect(await vault.secretMatches(item.itemId, "s3cret!")).toBe(true);
  expect(await vault.secretMatches(item.itemId, "changed")).toBe(false);
  expect(vault.history(item.itemId, 10).some(row => row.action === "fill")).toBe(false);
  await vault.revoke({ itemId: item.itemId });
  expect(await vault.secretMatches(item.itemId, "s3cret!")).toBe(false);
});

it("revealForHumanFill rejects non-http origins and credential-bearing URLs", async () => {
  const { vault } = memoryVault();
  const item = await saved(vault);
  await expect(vault.revealForHumanFill(item.itemId, { pageId: "p1", origin: "file:///etc/passwd" })).rejects.toThrow();
  await expect(vault.revealForHumanFill(item.itemId, { pageId: "p1", origin: "https://user:pw@example.com" })).rejects.toThrow();
});

/* ----------------------------- update / generate ------------------------------ */

it("updateSecret replaces the secret and rejects revoked items", async () => {
  const { vault, secrets } = memoryVault();
  const item = await saved(vault);
  await vault.updateSecret(item.itemId, "new-secret");
  const name = [...secrets.keys()][0]!;
  expect(secrets.get(name)).toBe("new-secret");
  await vault.revoke({ itemId: item.itemId });
  await expect(vault.updateSecret(item.itemId, "x")).rejects.toThrow(/revoked/);
});

it("generate produces bounded-length passwords from the symbol alphabet", async () => {
  const { vault } = memoryVault();
  await unlocked(vault);
  for (const [ask, want] of [[8, 12], [20, 20], [500, 64]] as const) {
    const password = vault.generate(ask);
    expect(password.length).toBe(want);
    expect(/^[a-zA-Z0-9!@#$%^&*\-+]+$/.test(password)).toBe(true);
  }
});

/* ------------------------------- import / export ------------------------------ */

it("export/import round-trips credentials and skips duplicates", async () => {
  const { vault } = memoryVault();
  await saved(vault);
  await vault.save({ label: "Second", origin: "https://two.test", username: "bob", secret: "pw2" });
  const exported = await vault.exportItems();
  expect(exported.items.length).toBe(2);
  expect(exported.items.every(i => i.secret.length > 0)).toBe(true);

  const { vault: target } = memoryVault();
  await unlocked(target);
  const first = await target.importItems({ items: exported.items });
  expect(first).toEqual({ added: 2, skipped: 0 });
  const again = await target.importItems({ items: exported.items });
  expect(again).toEqual({ added: 0, skipped: 2 });
  const imported = await target.list();
  for (const source of exported.items) {
    const item = imported.find(i => i.origin === source.origin);
    expect(item).toBeTruthy();
    const filled = await target.revealForHumanFill(item!.itemId, { pageId: "p", origin: source.origin });
    expect(filled.secret).toBe(source.secret);
  }
});

it("import rejects entries without origin or secret", async () => {
  const { vault } = memoryVault();
  await unlocked(vault);
  const result = await vault.importItems({ items: [
    { origin: "", secret: "x" },
    { origin: "https://ok.test", secret: "  " },
    { origin: "https://ok.test", secret: "good" },
  ] });
  expect(result).toEqual({ added: 1, skipped: 2 });
});

/* ------------------------------ injected scripts ------------------------------ */

function loginForm() {
  document.body.innerHTML = `<form id="f"><input name="user" type="email" value="ada@example.com"><input name="pw" type="password" value=""><button type="submit">Sign in</button></form>`;
  return { user: document.querySelector<HTMLInputElement>("input[name=user]")!, pw: document.querySelector<HTMLInputElement>("input[name=pw]")! };
}

function showInputs() {
  // jsdom reports 0-size rects — pretend the login fields are laid out.
  for (const input of Array.from(document.querySelectorAll("input"))) {
    Object.defineProperty(input, "getBoundingClientRect", { value: () => ({ width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20, x: 0, y: 0, toJSON: () => ({}) }), configurable: true });
  }
}

const runScript = (source: string) => {
  // oxlint-disable-next-line no-eval — exercising the real serialized script.
  return (0, eval)(source) as unknown;
};

describe("credentialFillScript", () => {
  it("fills the password and hinted username field", () => {
    const { user, pw } = loginForm();
    showInputs();
    const filled = runScript(credentialFillScript({ username: "ada@example.com", secret: "hunter2" }));
    expect(filled).toBe(2);
    expect(pw.value).toBe("hunter2");
    expect(user.value).toBe("ada@example.com");
  });

  it("fills only the password when no username is supplied", () => {
    const { pw } = loginForm();
    showInputs();
    expect(runScript(credentialFillScript({ secret: "hunter2" }))).toBe(1);
    expect(pw.value).toBe("hunter2");
  });

  it("returns 0 without a usable password field", () => {
    document.body.innerHTML = `<input name="q" type="text">`;
    showInputs();
    expect(runScript(credentialFillScript({ username: "a", secret: "b" }))).toBe(0);
  });

  it("skips disabled and read-only password fields", () => {
    document.body.innerHTML = `<input name="pw" type="password" disabled><input name="pw2" type="password" readonly>`;
    showInputs();
    expect(runScript(credentialFillScript({ secret: "hunter2" }))).toBe(0);
  });

  it("embeds the credential safely — quotes cannot break the serialization", () => {
    const { pw } = loginForm();
    showInputs();
    const tricky = `pa");alert(1);//"ss`;
    runScript(credentialFillScript({ secret: tricky }));
    expect(pw.value).toBe(tricky);
  });
});

describe("captureLoginScript", () => {
  it("returns the submitted username and password", () => {
    const { user, pw } = loginForm();
    showInputs();
    pw.value = "typed-secret";
    const captured = runScript(captureLoginScript()) as { username: string; password: string } | null;
    expect(captured).toEqual({ username: "ada@example.com", password: "typed-secret" });
    expect(user.value).toBe("ada@example.com");
  });

  it("returns null when the password field is empty", () => {
    loginForm();
    showInputs();
    expect(runScript(captureLoginScript())).toBeNull();
  });
});

// Document listeners registered by the serialized script persist for the life of
// the jsdom document — each install gets a fresh binding name so a stale listener
// can never reach a later test's spy. The sequence must never reset.
const bindingNames: string[] = [];
let bindingSeq = 0;
function installDetector() {
  const name = `${CREDENTIAL_BINDING}_${bindingSeq++}`;
  bindingNames.push(name);
  const send = vi.fn();
  (globalThis as Record<string, unknown>)[name] = send;
  runScript(credentialDetectScript(name));
  return send;
}

describe("credentialDetectScript", () => {
  it("reports the username — never the password — on form submit", () => {
    const { user, pw } = loginForm();
    pw.value = "typed-secret";
    user.value = "ada@example.com";
    const send = installDetector();
    document.getElementById("f")!.dispatchEvent(new Event("submit", { bubbles: true }));
    expect(send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(send.mock.calls[0]![0] as string) as { username: string; origin: string; url: string };
    expect(payload.username).toBe("ada@example.com");
    expect(JSON.stringify(payload)).not.toContain("typed-secret");
  });

  it("reports on a sign-in button click when a filled password exists", () => {
    const { pw } = loginForm();
    pw.value = "typed-secret";
    const send = installDetector();
    document.querySelector("button")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // Click + jsdom's submit activation coalesce into a single report.
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(send.mock.calls.map(c => c[0]))).not.toContain("typed-secret");
  });

  it("ignores unrelated clicks and empty password fields", () => {
    document.body.innerHTML = `<button id="plain">Save settings</button><input type="password" name="pw" value="">`;
    const send = installDetector();
    document.getElementById("plain")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(send).not.toHaveBeenCalled();
  });
});
