import type { Extension, Session } from "electron";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

const META = ".aux-managed.json";
const MAX_FILES = 2_000;
const MAX_BYTES = 100 * 1024 * 1024;

type Manifest = { manifest_version: number; name: string; version: string; permissions?: unknown; host_permissions?: unknown };
type Meta = { enabled: boolean; installedAt: number };

export interface AuxExtension {
  key: string;
  id?: string;
  name: string;
  version: string;
  permissions: string[];
  enabled: boolean;
  loaded: boolean;
  managed: boolean;
  source: "managed" | "environment";
  error?: string;
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;
const manifestAt = (path: string): Manifest => {
  const manifest = readJson<Manifest>(join(path, "manifest.json"));
  if (![2, 3].includes(manifest.manifest_version) || typeof manifest.name !== "string" || !manifest.name.trim() || typeof manifest.version !== "string" || !manifest.version.trim()) {
    throw new Error("Choose an unpacked Chrome extension folder with a valid Manifest V2 or V3 manifest.json.");
  }
  return manifest;
};
const permissions = (manifest: Manifest) => [...new Set([
  ...(Array.isArray(manifest.permissions) ? manifest.permissions : []),
  ...(Array.isArray(manifest.host_permissions) ? manifest.host_permissions : []),
].filter((value): value is string => typeof value === "string"))].sort();
const pathInside = (parent: string, child: string) => {
  const rel = relative(resolve(parent), resolve(child));
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
};

function validateTree(root: string) {
  let files = 0;
  let bytes = 0;
  const visit = (path: string) => {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw new Error("Unpacked extensions containing symbolic links are not accepted.");
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) visit(join(path, entry));
      return;
    }
    if (!stat.isFile()) throw new Error("The extension contains an unsupported filesystem entry.");
    files++;
    bytes += stat.size;
    if (files > MAX_FILES || bytes > MAX_BYTES) throw new Error("The unpacked extension is too large to copy safely.");
  };
  visit(root);
}

function copyTree(source: string, destination: string) {
  mkdirSync(destination, { recursive: true, mode: 0o700 });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Unpacked extensions containing symbolic links are not accepted.");
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) copyFileSync(from, to);
    else throw new Error("The extension contains an unsupported filesystem entry.");
  }
}

export class ExtensionManager {
  readonly root: string;
  private failures = new Map<string, string>();

  constructor(dataDir: string) {
    this.root = join(dataDir, "extensions");
    mkdirSync(this.root, { recursive: true, mode: 0o700 });
  }

  inspect(path: string) {
    const source = resolve(path);
    if (!lstatSync(source).isDirectory()) throw new Error("Choose an unpacked extension folder.");
    validateTree(source);
    const manifest = manifestAt(source);
    return { name: manifest.name, version: manifest.version, permissions: permissions(manifest) };
  }

  async loadAll(session: Session, configured: string[] = []) {
    this.failures.clear();
    for (const path of [...new Set([...this.managedPaths(true), ...configured.map(path => resolve(path))])]) {
      try { await session.extensions.loadExtension(path, { allowFileAccess: false }); }
      catch (error) { this.failures.set(resolve(path), error instanceof Error ? error.message : String(error)); }
    }
  }

  async install(sourcePath: string, session: Session): Promise<AuxExtension> {
    const source = resolve(sourcePath);
    const description = this.inspect(source);
    if (this.list(session).some(item => item.managed && item.name === description.name)) throw new Error(`${description.name} is already installed.`);
    const key = randomUUID();
    const temporary = join(this.root, `.${key}.installing`);
    const destination = join(this.root, key);
    try {
      copyTree(source, temporary);
      writeFileSync(join(temporary, META), JSON.stringify({ enabled: true, installedAt: Date.now() } satisfies Meta), { mode: 0o600 });
      renameSync(temporary, destination);
      await session.extensions.loadExtension(destination, { allowFileAccess: false });
      this.failures.delete(destination);
      return this.list(session).find(item => item.key === key)!;
    } catch (error) {
      rmSync(temporary, { recursive: true, force: true });
      rmSync(destination, { recursive: true, force: true });
      throw error;
    }
  }

  async setEnabled(key: string, enabled: boolean, session: Session): Promise<AuxExtension> {
    const path = this.managedPath(key);
    const current = this.item(path, session);
    if (!current) throw new Error("The extension is no longer installed.");
    if (enabled && !current.loaded) await session.extensions.loadExtension(path, { allowFileAccess: false });
    if (!enabled && current.id && current.loaded) session.extensions.removeExtension(current.id);
    const prior = this.meta(path);
    writeFileSync(join(path, META), JSON.stringify({ ...prior, enabled } satisfies Meta), { mode: 0o600 });
    this.failures.delete(path);
    return this.item(path, session)!;
  }

  remove(key: string, session: Session) {
    const path = this.managedPath(key);
    const current = this.item(path, session);
    if (!current) throw new Error("The extension is no longer installed.");
    if (current.id && current.loaded) session.extensions.removeExtension(current.id);
    rmSync(path, { recursive: true, force: true });
    this.failures.delete(path);
    return true;
  }

  list(session: Session): AuxExtension[] {
    const loaded = session.extensions.getAllExtensions();
    const managed = this.managedPaths().map(path => this.item(path, session)).filter((item): item is AuxExtension => !!item);
    const managedLoadedIds = new Set(managed.map(item => item.id).filter(Boolean));
    const unmanaged = loaded.filter(extension => !managedLoadedIds.has(extension.id) && !pathInside(this.root, extension.path)).map(extension => this.fromLoaded(extension));
    return [...managed, ...unmanaged].sort((a, b) => a.name.localeCompare(b.name));
  }

  private fromLoaded(extension: Extension): AuxExtension {
    return { key: extension.id, id: extension.id, name: extension.name, version: extension.version, permissions: permissions(extension.manifest as Manifest), enabled: true, loaded: true, managed: false, source: "environment" };
  }

  private item(path: string, session: Session): AuxExtension | null {
    try {
      const manifest = manifestAt(path);
      const meta = this.meta(path);
      const loaded = session.extensions.getAllExtensions().find(extension => resolve(extension.path) === resolve(path));
      return { key: basename(path), id: loaded?.id, name: manifest.name, version: manifest.version, permissions: permissions(manifest), enabled: meta.enabled, loaded: !!loaded, managed: true, source: "managed", error: this.failures.get(resolve(path)) };
    } catch (error) {
      return { key: basename(path), name: basename(path), version: "Unknown", permissions: [], enabled: false, loaded: false, managed: true, source: "managed", error: error instanceof Error ? error.message : String(error) };
    }
  }

  private meta(path: string): Meta {
    try { return readJson<Meta>(join(path, META)); }
    catch { return { enabled: true, installedAt: 0 }; }
  }

  private managedPaths(onlyEnabled = false) {
    return readdirSync(this.root)
      .map(name => join(this.root, name))
      .filter(path => {
        try { return !basename(path).startsWith(".") && lstatSync(path).isDirectory() && existsSync(join(path, "manifest.json")) && (!onlyEnabled || this.meta(path).enabled); }
        catch { return false; }
      });
  }

  private managedPath(key: string) {
    if (!/^[0-9a-f-]{36}$/i.test(key)) throw new Error("Invalid managed extension identifier.");
    const path = join(this.root, key);
    if (!pathInside(this.root, path) || !existsSync(path)) throw new Error("The extension is no longer installed.");
    return path;
  }
}
