import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
  const installed = await manager.install(source, session as unknown as Session);
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
