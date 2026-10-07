import { randomUUID } from "node:crypto";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { AuxError } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { WorkspaceFolderService } from "./workspace-folders.js";
import type { FilesystemAccessService } from "./filesystem-access.js";
import { filesystemSeatbelt, pathInside, requireFilesystemPath } from "./filesystem-policy.js";
type NativeProjects = Pick<
  NativeBridge,
  "turnSourceContext" | "projectFiles" | "projectFile" | "projectChanges" | "projectCancel"
>;
type Project = { workspaceId: string; folderId: string };
/** Human Project inspection is ephemeral; no file text is persisted or sent to a model. */
export class ProjectsService {
  private operations = new Map<string, { token: string; sent: boolean }>();
  private closed = false;
  private work = new Set<Promise<unknown>>();
  constructor(
    private native: NativeProjects | undefined,
    private folders: WorkspaceFolderService,
    private filesystem: FilesystemAccessService,
  ) {}
  private track<T>(work: Promise<T>): Promise<T> {
    this.work.add(work);
    void work.finally(() => this.work.delete(work)).catch(() => {});
    return work;
  }
  private async perform<T>(
    input: Project,
    token: string,
    path: string | undefined,
    dispatch: (context: {
      workspaceId: string;
      folderId: string;
      token: string;
      operationId: string;
      cwd: string;
      rootDevice: string;
      rootInode: string;
      deniedRoots: string[];
      sandboxProfile: string;
    }) => Promise<T>,
  ): Promise<T> {
    if (
      this.closed ||
      !this.native?.projectFiles ||
      !this.native.projectFile ||
      !this.native.projectChanges ||
      !this.native.projectCancel ||
      !this.native.turnSourceContext
    )
      throw new AuxError("capability_unsupported", "Native Projects are unavailable.");
    const folder = this.folders.list(input.workspaceId).find((item) => item.folderId === input.folderId);
    if (!folder || folder.archivedAt || folder.agentsChanged)
      throw new AuxError("permission_denied", "Review this Project again before opening it.");
    if (
      path !== undefined &&
      (path.includes("\0") ||
        path.startsWith("/") ||
        path.split("/").some((part) => part === "." || part === "..") ||
        path.includes("//"))
    )
      throw new AuxError("invalid_params", "Choose a relative Project path.");
    const reviewedRoots = this.folders.roots(input.workspaceId).read;
    const reviews = JSON.stringify(
      reviewedRoots.map((root) => [root, this.folders.scopeDigest(input.workspaceId, root)]),
    );
    const policy = this.filesystem.snapshot(),
      rootDigest = this.folders.scopeDigest(input.workspaceId, folder.path);
    const deniedRoots = [...policy.deniedRoots, ...policy.protectedRoots];
    if (deniedRoots.some((root) => pathInside(folder.path, root)))
      throw new AuxError("permission_denied", "This Project is excluded by current file permissions.");
    requireFilesystemPath(
      { ...policy, readRoots: [...policy.readRoots, folder.path] },
      resolve(folder.path, path ?? ""),
      "read",
    );
    const operationId = randomUUID();
    this.operations.set(operationId, { token, sent: false });
    const current = async () => {
      await this.native!.turnSourceContext!(token);
      if (
        this.closed ||
        this.operations.get(operationId)?.token !== token ||
        JSON.stringify(this.filesystem.snapshot()) !== JSON.stringify(policy) ||
        this.folders.scopeDigest(input.workspaceId, folder.path) !== rootDigest ||
        JSON.stringify(
          this.folders
            .roots(input.workspaceId)
            .read.map((root) => [root, this.folders.scopeDigest(input.workspaceId, root)]),
        ) !== reviews
      )
        throw new AuxError(
          "permission_denied",
          "The original Project review, window or file permissions changed.",
        );
    };
    let started = false,
      acknowledged = false;
    try {
      await current();
      const root = statSync(folder.path, { bigint: true });
      const context = {
        ...input,
        token,
        operationId,
        cwd: folder.path,
        rootDevice: root.dev.toString(),
        rootInode: root.ino.toString(),
        deniedRoots,
        // Fixed Git queries get read-only reviewed roots, no network and no runtime credential paths.
        sandboxProfile: filesystemSeatbelt(
          {
            ...policy,
            readRoots: reviewedRoots,
            writeRoots: [],
            internalRoots: [],
            protectedRoots: policy.protectedRoots,
          },
          false,
        ),
      };
      started = true;
      this.operations.get(operationId)!.sent = true;
      const result = await dispatch(context);
      acknowledged = true; // Native replies only after the original worker/process has joined.
      await current();
      this.operations.delete(operationId);
      return result;
    } catch (error) {
      if (!started || acknowledged) {
        this.operations.delete(operationId);
        throw error;
      }
      try {
        const stopped = await this.native.projectCancel!({
          operationId,
          token,
        });
        if (!stopped.closed)
          throw new AuxError("backend_unavailable", "Project inspection termination is not acknowledged.");
        this.operations.delete(operationId);
      } catch (cleanup) {
        throw new AggregateError(
          [error, cleanup],
          "Project inspection failed and termination still needs acknowledgement.",
        );
      }
      throw error;
    }
  }
  files(input: Project & { path: string }, token: string) {
    return this.track(
      this.perform(input, token, input.path, ({ sandboxProfile: _profile, ...context }) =>
        this.native!.projectFiles!({ ...context, path: input.path }),
      ),
    );
  }
  file(input: Project & { path: string }, token: string) {
    return this.track(
      this.perform(input, token, input.path, ({ sandboxProfile: _profile, ...context }) =>
        this.native!.projectFile!({ ...context, path: input.path }),
      ),
    );
  }
  changes(input: Project, token: string) {
    return this.track(
      this.perform(input, token, undefined, (context) => this.native!.projectChanges!(context)),
    );
  }
  async dispose() {
    this.closed = true;
    const results = await Promise.allSettled(
      [...this.operations].map(async ([operationId, operation]) => {
        if (!operation.sent) return;
        const { token } = operation;
        const stopped = await this.native!.projectCancel!({
          operationId,
          token,
        });
        if (!stopped.closed)
          throw new AuxError("backend_unavailable", "Project inspection termination is not acknowledged.");
        this.operations.delete(operationId);
      }),
    );
    await Promise.allSettled(this.work);
    const failures = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (failures.length)
      throw new AggregateError(failures, "Project inspection still needs termination acknowledgement.");
  }
}
