import { MethodSchemas, type Bookmark } from "@aux/contracts";

const keyOf = (path: string[]) => JSON.stringify(path);
const within = (path: string[], parent: string[]) => path.length >= parent.length && parent.every((part, index) => path[index] === part);

/** Private-window Library. This collection never reads or writes a persistent store. */
export class PrivateBookmarks {
  private bookmarks = new Map<string, Bookmark>();
  private folders = new Map<string, string[]>();

  list(): Bookmark[] { return [...this.bookmarks.values()].sort((a, b) => b.createdAt - a.createdAt).map(item => ({ ...item, folderPath: [...(item.folderPath ?? [])] })); }
  paths(): string[][] { return [...this.folders.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, path]) => [...path]); }
  private ensureFolder(path: string[]) {
    for (let depth = 1; depth <= path.length; depth++) {
      const parent = path.slice(0, depth);
      this.folders.set(keyOf(parent), parent);
    }
  }

  invoke(method: string, input: unknown): unknown {
    switch (method) {
      case "bookmarks.list": return this.list();
      case "bookmarks.folders.list": return this.paths();
      case "bookmarks.add": {
        const item = MethodSchemas[method].parse(input);
        if (!["http:", "https:"].includes(new URL(item.url).protocol)) throw new Error("Only web bookmarks are supported.");
        const previous = this.bookmarks.get(item.url);
        const folderPath = item.folderPath ?? previous?.folderPath ?? [];
        this.ensureFolder(folderPath);
        this.bookmarks.set(item.url, { ...item, createdAt: previous?.createdAt ?? Date.now(), folderPath });
        return { ok: true };
      }
      case "bookmarks.update": {
        const item = MethodSchemas[method].parse(input), previous = this.bookmarks.get(item.originalUrl);
        if (!previous) throw new Error("This bookmark was removed. Save it again to create a new bookmark.");
        if (previous.title !== item.expected.title || keyOf(previous.folderPath ?? []) !== keyOf(item.expected.folderPath ?? [])) throw new Error("This bookmark changed. Cancel editing and reopen it to use the latest version.");
        if (item.url !== item.originalUrl && this.bookmarks.has(item.url)) throw new Error("That address is already bookmarked. Both bookmarks have been kept.");
        const folderPath = item.folderPath ?? previous.folderPath ?? [];
        this.ensureFolder(folderPath);
        this.bookmarks.delete(item.originalUrl);
        this.bookmarks.set(item.url, { url:item.url, title:item.title, folderPath, createdAt:previous.createdAt });
        return { ok:true };
      }
      case "bookmarks.move": {
        const move = MethodSchemas[method].parse(input);
        const selected = [...new Map(move.bookmarks.map(item => [item.url, item])).values()];
        for (const item of selected) {
          const current = this.bookmarks.get(item.url);
          if (!current || keyOf(current.folderPath ?? []) !== keyOf(item.folderPath)) throw new Error("A selected bookmark was moved or removed. Select the bookmarks again; nothing was moved.");
        }
        if (move.createFolder) {
          if (!move.folderPath.length || this.folders.has(keyOf(move.folderPath))) throw new Error("A folder with this name already exists. Choose another name.");
          const parent = move.folderPath.slice(0, -1);
          if (parent.length && !this.folders.has(keyOf(parent))) throw new Error("The parent folder no longer exists. Choose another folder.");
          this.ensureFolder(move.folderPath);
        }
        if (move.folderPath.length && !this.folders.has(keyOf(move.folderPath))) throw new Error("The destination folder no longer exists. Choose another folder.");
        let moved = 0;
        for (const item of selected) if (keyOf(item.folderPath) !== keyOf(move.folderPath)) {
          this.bookmarks.set(item.url, {...this.bookmarks.get(item.url)!, folderPath:[...move.folderPath]}); moved++;
        }
        return {moved};
      }
      case "bookmarks.remove": {
        const { url } = MethodSchemas[method].parse(input);
        this.bookmarks.delete(url);
        return { ok: true };
      }
      case "bookmarks.saveFolder": {
        const {name,bookmarks}=MethodSchemas[method].parse(input);
        if(this.folders.has(keyOf([name])))throw new Error("A bookmark folder already has this name. Choose a different name to keep this collection separate.");
        if(bookmarks.every(item=>this.bookmarks.has(item.url)))throw new Error("These pages are already bookmarked. Find them in Library to organize their folders.");
        return this.invoke("bookmarks.import",{bookmarks:bookmarks.map(item=>({...item,folderPath:[name]})),folders:[[name]]});
      }
      case "bookmarks.import": {
        // Validate the entire input before changing the in-memory collection.
        const { bookmarks, folders = [] } = MethodSchemas[method].parse(input);
        for (const path of folders) this.ensureFolder(path);
        let added = 0;
        for (const item of bookmarks) {
          this.ensureFolder(item.folderPath ?? []);
          if (this.bookmarks.has(item.url)) continue;
          this.bookmarks.set(item.url, { ...item, createdAt: Date.now() });
          added++;
        }
        return { added, skipped: bookmarks.length - added };
      }
      case "bookmarks.folders.create": {
        const { path } = MethodSchemas[method].parse(input);
        this.ensureFolder(path);
        return this.paths();
      }
      case "bookmarks.folders.rename": {
        const { path, name } = MethodSchemas[method].parse(input);
        const replacement = [...path.slice(0, -1), name];
        if (!this.folders.has(keyOf(path))) throw new Error("This bookmark folder no longer exists.");
        if (keyOf(path) === keyOf(replacement)) return this.paths();
        if (this.folders.has(keyOf(replacement))) throw new Error("A folder with this name already exists here.");
        for (const folder of this.paths().filter(folder => within(folder, path))) {
          this.folders.delete(keyOf(folder));
          const renamed = [...replacement, ...folder.slice(path.length)];
          this.folders.set(keyOf(renamed), renamed);
        }
        for (const [url, item] of this.bookmarks) {
          if (item.folderPath && within(item.folderPath, path)) this.bookmarks.set(url, { ...item, folderPath: [...replacement, ...item.folderPath.slice(path.length)] });
        }
        return this.paths();
      }
      case "bookmarks.folders.remove": {
        const { path } = MethodSchemas[method].parse(input);
        if (this.paths().some(folder => folder.length > path.length && within(folder, path)) || this.list().some(item => within(item.folderPath ?? [], path))) throw new Error("Move this folder’s bookmarks and remove its subfolders before deleting it.");
        this.folders.delete(keyOf(path));
        return this.paths();
      }
      default: throw new Error("This bookmark action is unavailable.");
    }
  }
}
