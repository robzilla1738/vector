import { mkdtempSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import type { Extension, Session } from "electron";
import { ExtensionManager } from "../../apps/desktop/main/extensions";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

class FakeSession {
  loaded = new Map<string, Extension>();
  extensions = {
    loadExtension: (path: string) => this.loadExtension(path),
    getAllExtensions: () => this.getAllExtensions(),
    removeExtension: (id: string) => this.removeExtension(id),
  };
  async loadExtension(path: string) {
    const manifest = JSON.parse(readFileSync(join(path, "manifest.json"), "utf8"));
    const extension = { id: `ext-${basename(path)}`, name: manifest.name, version: manifest.version, path: resolve(path), manifest, url: `chrome-extension://ext-${basename(path)}/` } as Extension;
    this.loaded.set(extension.id, extension);
    return extension;
  }
  getAllExtensions() { return [...this.loaded.values()]; }
  removeExtension(id: string) { this.loaded.delete(id); }
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aux-extension-manager-")); roots.push(root);
  const source = join(root, "source"); mkdirSync(source);
  writeFileSync(join(source, "manifest.json"), JSON.stringify({ manifest_version: 3, name: "Synthetic helper", version: "1.2.3", permissions: ["storage"], host_permissions: ["https://example.test/*"] }));
  writeFileSync(join(source, "content.js"), "document.documentElement.dataset.synthetic = 'yes';");
  return { root, source, data: join(root, "data") };
}

it("copies, disables, restores, enables and removes a managed extension durably", async () => {
  const { source, data } = fixture();
  const session = new FakeSession();
  const manager = new ExtensionManager(data);
  expect(manager.inspect(source)).toEqual({ name: "Synthetic helper", version: "1.2.3", permissions: ["https://example.test/*", "storage"] });
  const installed = (await manager.install(source, session as unknown as Session, async () => true))!;
  expect(installed).toMatchObject({ name: "Synthetic helper", enabled: true, loaded: true, managed: true });
  expect(readdirSync(manager.root)).toEqual([installed.key]);
  await manager.setEnabled(installed.key, false, session as unknown as Session);
  expect(manager.list(session as unknown as Session)[0]).toMatchObject({ enabled: false, loaded: false });

  const restartedSession = new FakeSession();
  const restarted = new ExtensionManager(data);
  await restarted.loadAll(restartedSession as unknown as Session);
  expect(restarted.list(restartedSession as unknown as Session)[0]).toMatchObject({ enabled: false, loaded: false });
  await restarted.setEnabled(installed.key, true, restartedSession as unknown as Session);
  expect(restarted.list(restartedSession as unknown as Session)[0]).toMatchObject({ enabled: true, loaded: true });
  expect(restarted.remove(installed.key, restartedSession as unknown as Session)).toBe(true);
  expect(restarted.list(restartedSession as unknown as Session)).toEqual([]);
});

it("rejects symbolic links before copying extension code", () => {
  const { root, source, data } = fixture();
  writeFileSync(join(root, "outside.js"), "secret");
  symlinkSync(join(root, "outside.js"), join(source, "linked.js"));
  expect(() => new ExtensionManager(data).inspect(source)).toThrow(/symbolic links/i);
});

it("keeps failed enable attempts disabled and exposes a recoverable load error",async()=>{
  const {source,data}=fixture(),session=new FakeSession(),manager=new ExtensionManager(data);
  const installed=(await manager.install(source,session as unknown as Session, async () => true))!;
  await manager.setEnabled(installed.key,false,session as unknown as Session);
  const load=session.extensions.loadExtension;
  session.extensions.loadExtension=async()=>{throw new Error("Fixture load interrupted");};
  await expect(manager.setEnabled(installed.key,true,session as unknown as Session)).rejects.toThrow("interrupted");
  expect(manager.list(session as unknown as Session)[0]).toMatchObject({enabled:false,loaded:false,error:"Fixture load interrupted"});
  expect(JSON.parse(readFileSync(join(manager.root,installed.key,".aux-managed.json"),"utf8")).enabled).toBe(false);
  session.extensions.loadExtension=load;
  expect(await manager.setEnabled(installed.key,true,session as unknown as Session)).toMatchObject({enabled:true,loaded:true});
  expect(manager.list(session as unknown as Session)[0]?.error).toBeUndefined();
});

function updateFixture(source: string, version = "2.0.0") {
  writeFileSync(join(source, "manifest.json"), JSON.stringify({ manifest_version: 3, name: "Synthetic helper", version,
    permissions: ["storage"], content_scripts: [{ matches: ["https://new.example.test/*"], js: ["content.js"] }] }));
}

it("updates the reviewed snapshot at the same extension identity and reports content-script access", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  const installed = (await manager.install(source, session as unknown as Session, async () => true))!;
  updateFixture(source);
  const updated = await manager.update(installed.key, source, session as unknown as Session, async details => {
    expect(details.addedPermissions).toEqual(["https://new.example.test/*"]);
    updateFixture(source, "9.0.0");
    return true;
  });
  expect(updated).toMatchObject({ key: installed.key, id: installed.id, version: "2.0.0", enabled: true, loaded: true });
  expect(readdirSync(manager.root)).toEqual([installed.key]);
});

it("leaves cancellation untouched and keeps a disabled extension disabled after update and restart", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  const installed = (await manager.install(source, session as unknown as Session, async () => true))!;
  updateFixture(source);
  expect(await manager.update(installed.key, source, session as unknown as Session, async () => false)).toBeNull();
  expect(manager.list(session as unknown as Session)[0]).toMatchObject({ version: "1.2.3", loaded: true });
  await manager.setEnabled(installed.key, false, session as unknown as Session);
  expect(await manager.update(installed.key, source, session as unknown as Session, async () => true)).toMatchObject({ version: "2.0.0", enabled: false, loaded: false });
  const restarted = new ExtensionManager(data), freshSession = new FakeSession();
  await restarted.loadAll(freshSession as unknown as Session);
  expect(restarted.list(freshSession as unknown as Session)[0]).toMatchObject({ version: "2.0.0", enabled: false, loaded: false });
});

it("restores the previous code and running extension when replacement loading fails", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  const installed = (await manager.install(source, session as unknown as Session, async () => true))!;
  updateFixture(source);
  const load = session.extensions.loadExtension;
  session.extensions.loadExtension = async path => {
    if (JSON.parse(readFileSync(join(path, "manifest.json"), "utf8")).version === "2.0.0") throw new Error("Broken update");
    return load(path);
  };
  await expect(manager.update(installed.key, source, session as unknown as Session, async () => true)).rejects.toThrow("Broken update");
  expect(manager.list(session as unknown as Session)[0]).toMatchObject({ id: installed.id, version: "1.2.3", loaded: true });
  expect(readdirSync(manager.root)).toEqual([installed.key]);
});

it("restores an interrupted update before startup loads extension code", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  const installed = (await manager.install(source, session as unknown as Session, async () => true))!;
  const path = join(manager.root, installed.key);
  renameSync(path, join(manager.root, `.${installed.key}.previous`));
  mkdirSync(path); updateFixture(path);
  const restarted = new ExtensionManager(data), freshSession = new FakeSession();
  await restarted.loadAll(freshSession as unknown as Session);
  expect(restarted.list(freshSession as unknown as Session)[0]).toMatchObject({ id: installed.id, version: "1.2.3", loaded: true });
});

it("installs only the reviewed copy and prevents concurrent duplicate installations", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  let approve!: (value: boolean) => void;
  const pending = manager.install(source, session as unknown as Session, async details => {
    expect(details.version).toBe("1.2.3");
    return new Promise<boolean>(resolve => { approve = resolve; });
  });
  updateFixture(source);
  await expect(manager.install(source, session as unknown as Session, async () => true)).rejects.toThrow("already installed");
  approve(true);
  expect(await pending).toMatchObject({ version: "1.2.3", loaded: true });
  expect(manager.list(session as unknown as Session)).toHaveLength(1);
});

it("cancels installation without loading code and cleans up a partially loaded failure", async () => {
  const { source, data } = fixture(), session = new FakeSession(), manager = new ExtensionManager(data);
  expect(await manager.install(source, session as unknown as Session, async () => false)).toBeNull();
  expect(readdirSync(manager.root)).toEqual([]);
  expect(session.getAllExtensions()).toEqual([]);
  const load = session.extensions.loadExtension;
  session.extensions.loadExtension = async path => { await load(path); throw new Error("Fixture interrupted after load"); };
  await expect(manager.install(source, session as unknown as Session, async () => true)).rejects.toThrow("interrupted after load");
  expect(readdirSync(manager.root)).toEqual([]);
  expect(session.getAllExtensions()).toEqual([]);
});
