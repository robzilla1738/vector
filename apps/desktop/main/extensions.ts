import type { Extension, Session } from "electron";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

const META = ".aux-managed.json";
const MAX_FILES = 2_000;
const MAX_BYTES = 100 * 1024 * 1024;

type Manifest = { manifest_version: number; name: string; version: string; key?: string; permissions?: unknown; host_permissions?: unknown; optional_permissions?: unknown; optional_host_permissions?: unknown; content_scripts?: unknown };
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
  ...(Array.isArray(manifest.content_scripts) ? manifest.content_scripts.flatMap(script =>
    script && Array.isArray(script.matches) ? script.matches : []) : []),
  ...[manifest.optional_permissions, manifest.optional_host_permissions].flatMap(values =>
    Array.isArray(values) ? values.filter(value => typeof value === "string").map(value => `Optional: ${value}`) : []),
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
  private changing = new Set<string>();
  private installing = new Set<string>();

  constructor(dataDir: string) {
    this.root = join(dataDir, "extensions");
    mkdirSync(this.root, { recursive: true, mode: 0o700 });
    // A previous process stopped before committing its replacement. Restore the
    // old directory before Chromium loads any extension from this profile.
    for (const name of readdirSync(this.root)) {
      const match = /^\.([0-9a-f-]{36})\.previous$/i.exec(name);
      if (!match) continue;
      const destination = join(this.root, match[1]!);
      rmSync(destination, { recursive: true, force: true });
      renameSync(join(this.root, name), destination);
    }
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
    await Promise.all([...new Set([...this.managedPaths(true), ...configured.map(path => resolve(path))])].map(async path => {
      try { await session.extensions.loadExtension(path, { allowFileAccess: false }); }
      catch (error) { this.failures.set(resolve(path), error instanceof Error ? error.message : String(error)); }
    }));
  }

  async install(sourcePath: string, session: Session,
    review: (details: { name: string; version: string; permissions: string[] }) => Promise<boolean>,
  ): Promise<AuxExtension | null> {
    const source = resolve(sourcePath);
    this.inspect(source);
    const key = randomUUID();
    const temporary = join(this.root, `.${key}.installing`);
    const destination = join(this.root, key);
    let reservedName: string | undefined;
    let installed = false;
    try {
      copyTree(source, temporary);
      const description = this.inspect(temporary);
      if (this.installing.has(description.name) || this.list(session).some(item => item.managed && item.name === description.name)) {
        throw new Error(`${description.name} is already installed or being installed.`);
      }
      reservedName = description.name;
      this.installing.add(reservedName);
      writeFileSync(join(temporary, META), JSON.stringify({ enabled: true, installedAt: Date.now() } satisfies Meta), { mode: 0o600 });
      if (!await review(description)) return null;
      renameSync(temporary, destination);
      await session.extensions.loadExtension(destination, { allowFileAccess: false });
      const result = this.item(destination, session);
      if (!result?.loaded) throw new Error("The extension did not finish loading.");
      installed = true;
      this.failures.delete(destination);
      return result;
    } finally {
      if (reservedName) this.installing.delete(reservedName);
      if (!installed) {
        const loaded = session.extensions.getAllExtensions().find(item => resolve(item.path) === destination);
        if (loaded) session.extensions.removeExtension(loaded.id);
        rmSync(destination, { recursive: true, force: true });
      }
      rmSync(temporary, { recursive: true, force: true });
    }
  }

  async update(key: string, sourcePath: string, session: Session,
    review: (details: { name: string; fromVersion: string; version: string; permissions: string[]; addedPermissions: string[]; enabled: boolean }) => Promise<boolean>,
  ): Promise<AuxExtension | null> {
    const path = this.managedPath(key);
    if (this.changing.has(path)) throw new Error("This extension is already changing. Try again when it finishes.");
    this.changing.add(path);
    const staged = join(this.root, `.${randomUUID()}.updating`);
    const backup = join(this.root, `.${key}.previous`);
    let swapped = false;
    let current: AuxExtension | null = null;
    try {
      current = this.item(path, session);
      const original = manifestAt(path);
      this.inspect(sourcePath);
      copyTree(resolve(sourcePath), staged);
      const replacement = manifestAt(staged);
      validateTree(staged);
      if (replacement.name !== original.name || replacement.key !== original.key) {
        throw new Error("Choose an update for the same extension, with the same name and manifest key.");
      }
      const declared = permissions(replacement);
      const previous = permissions(original);
      const meta = this.meta(path);
      this.writeMeta(staged, meta);
      // Review the copied snapshot; changing the source folder during the dialog
      // cannot introduce unreviewed code or additional declared permissions.
      if (!await review({ name: replacement.name, fromVersion: original.version, version: replacement.version,
        permissions: declared, addedPermissions: declared.filter(value => !previous.includes(value)), enabled: meta.enabled })) return null;
      if (current?.loaded && current.id) session.extensions.removeExtension(current.id);
      renameSync(path, backup); swapped = true;
      renameSync(staged, path);
      if (meta.enabled) {
        const loaded = await session.extensions.loadExtension(path, { allowFileAccess: false });
        if (current?.id && loaded.id !== current.id) throw new Error("The update changed the extension identity.");
      }
      // Atomic commit: startup only restores directories still named .previous.
      const discarded = join(this.root, `.${key}.${randomUUID()}.discarded`);
      renameSync(backup, discarded); swapped = false;
      this.failures.delete(path);
      try { rmSync(discarded, { recursive: true, force: true }); } catch { /* Old code remains inactive. */ }
      return this.item(path, session)!;
    } catch (error) {
      try {
        if (swapped) {
          const loaded = session.extensions.getAllExtensions().find(item => resolve(item.path) === path);
          if (loaded) session.extensions.removeExtension(loaded.id);
          rmSync(path, { recursive: true, force: true });
          renameSync(backup, path);
        }
        if (current?.loaded && !session.extensions.getAllExtensions().some(item => resolve(item.path) === path)) {
          await session.extensions.loadExtension(path, { allowFileAccess: false });
        }
      } catch (restoreError) {
        const message = `The update failed and the previous version could not be restored: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`;
        this.failures.set(path, message);
        throw new Error(message, { cause: error });
      }
      throw error;
    } finally {
      this.changing.delete(path);
      try { rmSync(staged, { recursive: true, force: true }); } catch { /* Staged code is never loaded. */ }
    }
  }

  async setEnabled(key: string, enabled: boolean, session: Session): Promise<AuxExtension> {
    const path = this.managedPath(key);
    if(this.changing.has(path))throw new Error("This extension is already changing. Try again when it finishes.");
    this.changing.add(path);
    const current = this.item(path, session);
    try {
      if (!current) throw new Error("The extension is no longer installed.");
      if (enabled && !current.loaded) await session.extensions.loadExtension(path, { allowFileAccess: false });
      if (!enabled && current.id && current.loaded) session.extensions.removeExtension(current.id);
      this.writeMeta(path,{...this.meta(path),enabled});
      this.failures.delete(path);
      return this.item(path,session)!;
    } catch(error) {
      // A metadata write failure must not leave the running extension in a state
      // that contradicts what will happen on the next browser launch.
      const loaded=session.extensions.getAllExtensions().find(extension=>resolve(extension.path)===path);
      try {
        if(current?.loaded&&!loaded)await session.extensions.loadExtension(path,{allowFileAccess:false});
        else if(!current?.loaded&&loaded)session.extensions.removeExtension(loaded.id);
      } catch(rollback) {
        const message=`${error instanceof Error?error.message:String(error)} The previous running state could not be restored: ${rollback instanceof Error?rollback.message:String(rollback)}`;
        this.failures.set(path,message);throw new Error(message);
      }
      this.failures.set(path,error instanceof Error?error.message:String(error));
      throw error;
    } finally {this.changing.delete(path);}
  }

  private writeMeta(path:string,value:Meta) {
    const temporary=join(path,`.aux-state-${randomUUID()}.tmp`);
    try {writeFileSync(temporary,JSON.stringify(value),{mode:0o600});renameSync(temporary,join(path,META));}
    finally {rmSync(temporary,{force:true});}
  }

  remove(key: string, session: Session) {
    const path = this.managedPath(key);
    if(this.changing.has(path))throw new Error("This extension is already changing. Try again when it finishes.");
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
