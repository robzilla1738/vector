import { AuxError } from "@aux/contracts";
import type { CloudCodingIdentity } from "@aux/contracts/coding-files";
import type { CodingFileBackend, CodingFileContext } from "./coding-files.js";
import { requireCloudFilePath, validateCloudFileRequest } from "./cloud-files-protocol.js";

/** A backend is retained for exactly one original run and captured provider Session. */
export class CloudFileBackend implements CodingFileBackend {
  readonly execution: CloudCodingIdentity;
  constructor(
    private readonly runId: string,
    execution: CloudCodingIdentity,
    private readonly dispatch: (
      request: Record<string, unknown>,
      context: CodingFileContext,
      beforeDispatch?: () => void,
    ) => Promise<unknown>,
  ) {
    this.execution = Object.freeze({ ...execution });
  }
  requirePath(path: string, _access: "read" | "write", runId?: string): string {
    this.assertRun(runId);
    try {
      return requireCloudFilePath(path, this.execution.root);
    } catch {
      throw new AuxError(
        "permission_denied",
        "Cloud files use the original project and exclude protected paths.",
      );
    }
  }
  async coding<T>(
    request: Record<string, unknown>,
    runId?: string,
    signal?: AbortSignal,
    beforeDispatch?: () => void,
    context?: CodingFileContext,
  ): Promise<T> {
    this.assertRun(runId);
    if (!context || context.runId !== runId || context.signal !== signal)
      throw new AuxError("ref_stale", "Cloud file authority does not match the original request.");
    if (signal?.aborted) throw new AuxError("cancelled", "Cloud file operation was cancelled.");
    try {
      validateCloudFileRequest(request, this.execution.root);
    } catch {
      throw new AuxError("permission_denied", "Cloud file operation is outside the original project.");
    }
    return (await this.dispatch(request, context, beforeDispatch)) as T;
  }
  private assertRun(runId?: string): void {
    if (runId !== this.runId) throw new AuxError("ref_stale", "Cloud files belong to the original run.");
  }
}
