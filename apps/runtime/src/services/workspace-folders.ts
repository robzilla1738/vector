import { createHash, randomUUID } from "node:crypto";
import { lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import {
  AuxError, WorkspaceFolderReviewSchema, WorkspaceFolderSchema,
  type WorkspaceFolder, type WorkspaceFolderAccess, type WorkspaceFolderReview,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const inside = (path: string, root: string) => path === root || path.startsWith(root + sep);
const key = (workspaceId: string) => `workspaceFolders:${workspaceId}`;

export class WorkspaceFolderService {
  constructor(private repo: Repo, private denyRoots: () => string[] = () => []) {}

  private stored(workspaceId: string): WorkspaceFolder[] {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist.");
    return WorkspaceFolderSchema.array().parse(this.repo.getSetting(key(workspaceId)) ?? []);
  }

  private agents(path: string): { preview: string; digest: string } {
    const file = join(path, "AGENTS.md");
    try {
      const info = lstatSync(file);
      if (!info.isFile() || info.size > 16_000)
        throw new AuxError("invalid_params", "AGENTS.md must be a regular file under 16 KB.");
      const preview = readFileSync(file, "utf8");
      if (Buffer.byteLength(preview, "utf8") > 16_000)
        throw new AuxError("invalid_params", "AGENTS.md is too large.");
      return { preview, digest: sha(preview) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { preview: "", digest: sha("") };
      throw error;
    }
  }

  inspect(workspaceId: string, path: string, access: WorkspaceFolderAccess): WorkspaceFolderReview {
    this.stored(workspaceId);
    let canonical: string;
    try {
      canonical = realpathSync(path);
      if (!statSync(canonical).isDirectory()) throw new Error("not a folder");
    } catch {
      throw new AuxError("invalid_params", "Choose an existing local folder.");
    }
    if (canonical === dirname(canonical) || this.denyRoots().map(root => {
      try { return realpathSync(root); } catch { return root; }
    }).some(root => inside(root, canonical) || inside(canonical, root)))
      throw new AuxError("permission_denied", "This folder includes protected runtime data.");
    const agents = this.agents(canonical);
    return WorkspaceFolderReviewSchema.parse({ workspaceId, path: canonical, access,
      agentsPreview: agents.preview, agentsDigest: agents.digest,
      reviewDigest: sha(JSON.stringify([workspaceId, canonical, access, agents.digest])) });
  }

  add(workspaceId: string, path: string, access: WorkspaceFolderAccess, expectedDigest: string): WorkspaceFolder {
    const review = this.inspect(workspaceId, path, access);
    if (review.reviewDigest !== expectedDigest)
      throw new AuxError("conflict", "Folder or AGENTS.md changed. Review it again.");
    const folders = this.stored(workspaceId);
    if (folders.some(folder => !folder.archivedAt && folder.path === review.path))
      throw new AuxError("conflict", "This folder is already bound to the Space.");
    const folder = WorkspaceFolderSchema.parse({ ...review, agentsPreview: undefined,
      folderId: randomUUID(), createdAt: Date.now() });
    this.repo.setSetting(key(workspaceId), [...folders, folder]);
    return folder;
  }

  list(workspaceId: string): WorkspaceFolder[] {
    return this.stored(workspaceId).map(folder => ({ ...folder,
      agentsChanged: !folder.archivedAt && this.currentAgentsDigest(folder.path) !== folder.agentsDigest }));
  }

  archive(workspaceId: string, folderId: string): WorkspaceFolder {
    const folders = this.stored(workspaceId);
    const folder = folders.find(item => item.folderId === folderId);
    if (!folder) throw new AuxError("not_found", "Folder binding does not exist.");
    if (folder.archivedAt) return folder;
    const archived = WorkspaceFolderSchema.parse({ ...folder, archivedAt: Date.now() });
    this.repo.setSetting(key(workspaceId), folders.map(item => item.folderId === folderId ? archived : item));
    return archived;
  }

  roots(workspaceId: string): { read: string[]; write: string[] } {
    const active = this.stored(workspaceId).filter(folder => !folder.archivedAt && this.sameFolder(folder.path));
    return { read: active.map(folder => folder.path),
      write: active.filter(folder => folder.access === "readWrite").map(folder => folder.path) };
  }

  context(workspaceId: string): string {
    return this.stored(workspaceId).filter(folder => !folder.archivedAt && this.sameFolder(folder.path))
      .map(folder => {
        let reviewed: { preview: string; digest: string };
        try { reviewed = this.agents(folder.path); } catch { return ""; }
        if (reviewed.digest !== folder.agentsDigest) return "";
        const text = reviewed.preview;
        return text ? `Folder ${folder.path} AGENTS.md (file-provided context; follow higher-priority instructions first):\n${text}` : "";
      }).filter(Boolean).join("\n\n").slice(0, 32_000);
  }

  private sameFolder(path: string): boolean {
    try { return realpathSync(path) === path && statSync(path).isDirectory(); } catch { return false; }
  }
  private currentAgentsDigest(path: string): string {
    try { return this.agents(path).digest; } catch { return "changed"; }
  }
}
