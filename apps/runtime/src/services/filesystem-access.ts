import { packagedNodeBootstrap } from "./packaged-node.js";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AuxError } from "@aux/contracts";
import {
  canonicalFilePath,
  filesystemSeatbelt,
  requireFilesystemPath,
  type FileAccessMode,
  type FilesystemPolicy,
} from "./filesystem-policy.js";

export interface FilesystemAccessOptions {
  homeDir?: string;
  internalRoots: string[];
  scratchDir: string;
  protectedRoots: string[];
  settings: () => { fileAccessMode?: FileAccessMode; fileAccessRevision?: number };
  reviewedRoots: (runId?: string) => { read: string[]; write: string[] };
}
const sensitiveLocations = [
  ".ssh",
  ".gnupg",
  ".aws",
  ".azure",
  ".kube",
  ".netrc",
  ".npmrc",
  ".pypirc",
  ".git-credentials",
  ".codex/auth.json",
  ".codex/config.toml",
  ".claude.json",
  ".claude/.credentials.json",
  ".cursor/mcp.json",
  ".docker/config.json",
  ".config/gh",
  ".config/gcloud",
  ".config/op",
  ".config/1Password",
  ".password-store",
  ".local/share/keyrings",
  "Library/Keychains",
  "Library/Application Support/Google/Chrome",
  "Library/Application Support/Chromium",
  "Library/Application Support/Microsoft Edge",
  "Library/Application Support/BraveSoftware",
  "Library/Application Support/Firefox",
  "Library/Application Support/1Password",
  "Library/Group Containers/2BUA8C4S2C.com.1password",
  "Library/Application Support/com.agilebits.onepassword4",
  "Library/Safari",
  "Library/Containers/com.apple.Safari",
  "Library/Containers/com.agilebits.onepassword7",
];
const unique = (paths: string[]) => [...new Set(paths.map(canonicalFilePath))];

export class FilesystemAccessService {
  constructor(private readonly options: FilesystemAccessOptions) {}
  snapshot(runId?: string): FilesystemPolicy {
    const settings = this.options.settings();
    const mode = settings.fileAccessMode ?? "guard",
      home = canonicalFilePath(this.options.homeDir ?? homedir());
    const reviewed = this.options.reviewedRoots(runId);
    const internalRoots = unique([...this.options.internalRoots, this.options.scratchDir]);
    const readRoots = unique([home, ...internalRoots, ...reviewed.read, ...reviewed.write]);
    const writeRoots = unique([
      ...internalRoots,
      ...(mode === "read-only"
        ? []
        : mode === "full"
          ? [home, ...reviewed.write]
          : ["Documents", "Downloads", "Desktop", "Projects"]
              .map((name) => join(home, name))
              .concat(reviewed.write)),
    ]);
    return {
      mode,
      revision: settings.fileAccessRevision ?? 0,
      readRoots,
      writeRoots,
      internalRoots,
      protectedRoots: unique(this.options.protectedRoots),
      deniedRoots: unique([
        "/private/var/db/dslocal",
        "/private/var/db/shadow",
        "/Library/Keychains",
        "/private/etc/master.passwd",
        "/private/etc/sudoers",
        ...(mode === "full" ? [] : sensitiveLocations.map((name) => join(home, name))),
      ]),
    };
  }
  roots(runId: string | undefined, access: "read" | "write"): string[] {
    return this.snapshot(runId)[access === "read" ? "readRoots" : "writeRoots"];
  }
  async readText(path: string, runId?: string, signal?: AbortSignal): Promise<string> {
    return (await this.execute("read", path, undefined, runId, signal)).toString("utf8");
  }
  async writeText(path: string, content: string, runId?: string, signal?: AbortSignal): Promise<void> {
    await this.execute("write", path, content, runId, signal);
  }
  readUpload(path: string, runId?: string, signal?: AbortSignal): Promise<Buffer> {
    return this.execute("read", path, undefined, runId, signal);
  }
  private execute(
    operation: "read" | "write",
    path: string,
    content: string | undefined,
    runId?: string,
    signal?: AbortSignal,
  ): Promise<Buffer> {
    if (process.platform !== "darwin")
      throw new AuxError("capability_unsupported", "Supervised file access requires the macOS sandbox.");
    if (signal?.aborted) throw new AuxError("cancelled", "File access was cancelled.");
    const policy = this.snapshot(runId);
    const target = requireFilesystemPath(policy, path, operation);
    const worker = fileURLToPath(new URL("./filesystem-worker.js", import.meta.url));
    const nodeBootstrap = packagedNodeBootstrap();
    const bootstrapFiles = [worker, process.execPath, ...nodeBootstrap.files];
    for (let directory = dirname(worker); ; directory = dirname(directory)) {
      bootstrapFiles.push(join(directory, "package.json"));
      if (directory === dirname(directory)) break;
    }
    return new Promise((resolve, reject) => {
      const child = spawn(
        "/usr/bin/sandbox-exec",
        ["-p", filesystemSeatbelt(policy, false, bootstrapFiles), process.execPath, ...nodeBootstrap.args, worker],
        {
          cwd: this.options.scratchDir,
          env: { PATH: "/usr/bin:/bin", HOME: this.options.scratchDir, TMPDIR: this.options.scratchDir },
          signal,
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
      const output: Buffer[] = [];
      child.stdout.on("data", (chunk: Buffer) => output.push(chunk));
      child.stderr.resume();
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) {
          reject(new AuxError("permission_denied", "Supervised file access failed."));
          return;
        }
        if (JSON.stringify(this.snapshot(runId)) !== JSON.stringify(policy)) {
          reject(new AuxError("ref_stale", "File permissions changed."));
          return;
        }
        resolve(Buffer.concat(output));
      });
      child.stdin.on("error", () => {});
      child.stdin.end(JSON.stringify({ operation, path: target, content }));
    });
  }
}
