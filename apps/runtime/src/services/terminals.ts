import { randomUUID } from "node:crypto";
import { accessSync, constants, realpathSync, statSync } from "node:fs";
import { AuxError } from "@aux/contracts";
import { TerminalSessionSchema, type TerminalStart, type TerminalSession } from "@aux/contracts/terminal";
import { TerminalPreviewParams, TerminalPreviewSchema, type TerminalPreview } from "@aux/contracts/terminal";
import type { z } from "zod";
import type { NativeBridge } from "../native.js";
import type { WorkspaceFolderService } from "./workspace-folders.js";

type TerminalNative = Pick<
  NativeBridge,
  | "turnSourceContext"
  | "terminalStart"
  | "terminalRead"
  | "terminalInput"
  | "terminalResize"
  | "terminalClose"
  | "terminalListeners"
  | "terminalPreview"
  | "terminalPreviewClose"
>;

type Owned = {
  session: TerminalSession;
  token: string;
  cwd: string;
  rootDigest: string;
  launched: boolean;
  previews: Map<string, TerminalPreview | undefined>;
  retiringPreviews: Set<string>;
  previewClosures: Map<string, Promise<{ closed: boolean }>>;
};
function executable(): string {
  const shell = process.env.SHELL ?? "/bin/zsh";
  const path = realpathSync(shell);
  if (!["/bin/zsh", "/bin/bash", "/bin/sh"].includes(path))
    throw new AuxError("permission_denied", "Choose a system shell for the Aux terminal.");
  accessSync(path, constants.X_OK);
  return path;
}
/** Human terminal sessions are ephemeral and belong to one original native document. */
export class TerminalService {
  private sessions = new Map<string, Owned>();
  private closed = false;
  private previewReceipts = new Map<string, { terminalId: string; token: string }>();
  private work = new Set<Promise<unknown>>();
  constructor(
    private native: TerminalNative | undefined,
    private folders: WorkspaceFolderService,
  ) {}
  private track<T>(work: Promise<T>): Promise<T> {
    this.work.add(work);
    void work.finally(() => this.work.delete(work)).catch(() => {});
    return work;
  }
  private owner(terminalId: string, token: string): Owned {
    const owned = this.sessions.get(terminalId);
    if (this.closed || !owned || owned.token !== token)
      throw new AuxError("permission_denied", "The original terminal owner is unavailable.");
    return owned;
  }
  private async current(owned: Owned): Promise<void> {
    if (!this.native?.turnSourceContext)
      throw new AuxError("capability_unsupported", "Native Terminal is unavailable.");
    try {
      await this.native.turnSourceContext(owned.token);
      if (
        this.closed ||
        this.sessions.get(owned.session.terminalId) !== owned ||
        this.folders.scopeDigest(owned.session.workspaceId, owned.cwd) !== owned.rootDigest
      )
        throw new AuxError("permission_denied", "The original Project review or terminal owner changed.");
    } catch (error) {
      if (owned.launched) {
        try {
          const stopped = await this.native.terminalClose!({
            terminalId: owned.session.terminalId,
            token: owned.token,
          });
          if (stopped.state !== "closed") throw new Error("Terminal termination is not acknowledged.");
          this.acknowledgeTerminalClosure(owned);
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Terminal authority retired but termination still needs acknowledgement.",
          );
        }
      }
      throw error;
    }
  }
  start(input: TerminalStart, token: string) {
    return this.track(this.startOriginal(input, token));
  }
  private async startOriginal(input: TerminalStart, token: string): Promise<TerminalSession> {
    if (this.closed || !this.native?.terminalStart)
      throw new AuxError("capability_unsupported", "Native Terminal is unavailable.");
    const folder = this.folders.list(input.workspaceId).find((item) => item.folderId === input.folderId);
    if (!folder || folder.archivedAt || folder.agentsChanged || folder.access !== "readWrite")
      throw new AuxError(
        "permission_denied",
        "Choose a current read/write Project before starting a terminal.",
      );
    const session = TerminalSessionSchema.parse({ ...input, terminalId: randomUUID(), state: "running" });
    const owned = {
      session,
      token,
      cwd: folder.path,
      rootDigest: this.folders.scopeDigest(input.workspaceId, folder.path),
      launched: false,
      previews: new Map<string, TerminalPreview | undefined>(),
      retiringPreviews: new Set<string>(),
      previewClosures: new Map(),
    };
    this.sessions.set(session.terminalId, owned);
    try {
      await this.current(owned);
      const root = statSync(owned.cwd, { bigint: true });
      if (this.folders.scopeDigest(input.workspaceId, owned.cwd) !== owned.rootDigest)
        throw new AuxError("permission_denied", "The original Project identity changed before launch.");
      const request = {
        ...input,
        token,
        terminalId: session.terminalId,
        cwd: owned.cwd,
        executable: executable(),
        rootDevice: root.dev.toString(),
        rootInode: root.ino.toString(),
      };
      await this.current(owned);
      // After dispatch, an ambiguous failure still owns actual native cleanup.
      owned.launched = true;
      const started = await this.native.terminalStart(request);
      await this.current(owned);
      if (started.terminalId !== session.terminalId)
        throw new AuxError("conflict", "Native Terminal returned another session.");
      owned.session = started;
      return started;
    } catch (error) {
      if (!owned.launched) {
        this.sessions.delete(session.terminalId);
        throw error;
      }
      try {
        const stopped = await this.native.terminalClose!({ terminalId: session.terminalId, token });
        if (stopped.state !== "closed")
          throw new AuxError("backend_unavailable", "Terminal termination is not acknowledged.");
        this.sessions.delete(session.terminalId);
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Terminal launch failed and termination still needs acknowledgement.",
        );
      }
      throw error;
    }
  }
  read(terminalId: string, offset: number, token: string) {
    return this.track(this.readOriginal(terminalId, offset, token));
  }
  private async readOriginal(terminalId: string, offset: number, token: string) {
    const owned = this.owner(terminalId, token);
    await this.current(owned);
    const result = await this.native!.terminalRead!({ terminalId, offset, token });
    await this.current(owned);
    owned.session = { ...owned.session, state: result.state };
    return result;
  }
  input(terminalId: string, sequence: number, data: string, token: string) {
    return this.track(this.inputOriginal(terminalId, sequence, data, token));
  }
  private async inputOriginal(terminalId: string, sequence: number, data: string, token: string) {
    const owned = this.owner(terminalId, token);
    await this.current(owned);
    const result = await this.native!.terminalInput!({ terminalId, sequence, data, token });
    await this.current(owned);
    return result;
  }
  resize(terminalId: string, cols: number, rows: number, token: string) {
    return this.track(this.resizeOriginal(terminalId, cols, rows, token));
  }
  private async resizeOriginal(terminalId: string, cols: number, rows: number, token: string) {
    const owned = this.owner(terminalId, token);
    await this.current(owned);
    const result = await this.native!.terminalResize!({ terminalId, cols, rows, token });
    await this.current(owned);
    owned.session = result;
    return result;
  }
  listeners(terminalId: string, token: string) {
    return this.track(this.listenersOriginal(terminalId, token));
  }
  private async listenersOriginal(terminalId: string, token: string) {
    const owned = this.owner(terminalId, token);
    await this.current(owned);
    if (!this.native?.terminalListeners)
      throw new AuxError("capability_unsupported", "Project Preview is unavailable.");
    const result = await this.native.terminalListeners({ terminalId, token });
    await this.current(owned);
    if (result.terminalId !== terminalId)
      throw new AuxError("conflict", "Another terminal supplied Project listeners.");
    return result;
  }
  preview(input: z.infer<typeof TerminalPreviewParams>, token: string) {
    return this.track(this.previewOriginal(input, token));
  }
  private async previewOriginal(input: z.infer<typeof TerminalPreviewParams>, token: string) {
    const owned = this.owner(input.terminalId, token);
    await this.current(owned);
    if (!this.native?.terminalPreview || !this.native.terminalPreviewClose)
      throw new AuxError("capability_unsupported", "Project Preview is unavailable.");
    const previewId = randomUUID();
    const request = { ...input, token, previewId };
    // Initial guest requests are checked against this original admitted ownership.
    owned.previews.set(previewId, undefined);
    let sent = false;
    try {
      await this.current(owned);
      sent = true;
      const result = TerminalPreviewSchema.parse(await this.native.terminalPreview(request));
      await this.current(owned);
      if (result.terminalId !== input.terminalId || result.previewId !== previewId)
        throw new AuxError("conflict", "Another Project returned the Preview surface.");
      owned.previews.set(previewId, result);
      return result;
    } catch (error) {
      if (!sent) {
        owned.previews.delete(previewId);
        throw error;
      }
      try {
        await this.closePreview(input.terminalId, previewId, token);
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Project Preview still needs cleanup acknowledgement.",
        );
      }
      throw error;
    }
  }
  async admitPreview(terminalId: string, previewId: string, token: string): Promise<boolean> {
    const owned = this.owner(terminalId, token);
    if (!owned.launched || !owned.previews.has(previewId) || owned.retiringPreviews.has(previewId))
      return false;
    // This runs on the authenticated native channel. Avoid calling current(),
    // whose terminal cleanup would deadlock the very request being admitted.
    if (!this.native?.turnSourceContext) return false;
    await this.native.turnSourceContext(token);
    return (
      !this.closed &&
      this.sessions.get(terminalId) === owned &&
      owned.previews.has(previewId) &&
      !owned.retiringPreviews.has(previewId) &&
      this.folders.scopeDigest(owned.session.workspaceId, owned.cwd) === owned.rootDigest
    );
  }
  private acknowledgeTerminalClosure(owned: Owned) {
    for (const previewId of owned.previews.keys())
      this.previewReceipts.set(previewId, { terminalId: owned.session.terminalId, token: owned.token });
    this.sessions.delete(owned.session.terminalId);
  }
  closePreview(terminalId: string, previewId: string, token: string) {
    const receipt = this.previewReceipts.get(previewId);
    if (receipt && receipt.terminalId === terminalId && receipt.token === token)
      return Promise.resolve({ closed: true });
    const owned = this.owner(terminalId, token);
    const pending = owned.previewClosures.get(previewId);
    if (pending) return pending;
    const work = this.track(this.closePreviewOriginal(terminalId, previewId, token, owned));
    owned.previewClosures.set(previewId, work);
    void work.catch(() => {
      if (owned.previewClosures.get(previewId) === work) owned.previewClosures.delete(previewId);
    });
    return work;
  }
  private async closePreviewOriginal(terminalId: string, previewId: string, token: string, owned: Owned) {
    if (!owned.previews.has(previewId) || !this.native?.terminalPreviewClose)
      throw new AuxError("permission_denied", "Original Project Preview is unavailable.");
    // Retain original reduction identity and shared cleanup work until real ACK.
    owned.retiringPreviews.add(previewId);
    const result = await this.native.terminalPreviewClose({ terminalId, previewId, token });
    if (!result.closed) throw new AuxError("backend_unavailable", "Preview cleanup is not acknowledged.");
    this.previewReceipts.set(previewId, { terminalId, token });
    owned.previews.delete(previewId);
    owned.retiringPreviews.delete(previewId);
    return result;
  }
  close(terminalId: string, token: string) {
    return this.track(this.closeOriginal(terminalId, token));
  }
  private async closeOriginal(terminalId: string, token: string) {
    const owned = this.owner(terminalId, token);
    const result = await this.native!.terminalClose!({ terminalId, token });
    owned.session = result;
    if (result.state !== "closed")
      throw new AuxError("backend_unavailable", "The terminal process has not acknowledged termination.");
    this.acknowledgeTerminalClosure(owned);
    return result;
  }
  async dispose() {
    this.closed = true;
    const sessions = [...this.sessions.values()];
    const results = await Promise.allSettled(
      sessions.map(async (owned) => {
        if (!owned.launched) {
          this.sessions.delete(owned.session.terminalId);
          return;
        }
        const stopped = await this.native!.terminalClose!({
          terminalId: owned.session.terminalId,
          token: owned.token,
        });
        if (stopped.state !== "closed")
          throw new AuxError("backend_unavailable", "Terminal termination is not acknowledged.");
        this.acknowledgeTerminalClosure(owned);
      }),
    );
    await Promise.allSettled(this.work);
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason);
    if (failures.length)
      throw new AggregateError(failures, "Terminal processes still need termination acknowledgement.");
  }
}
