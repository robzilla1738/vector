import { createHash, timingSafeEqual } from "node:crypto";
import { constants } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readdir,
  realpath,
  rename,
  rm,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { isAbsolute, join, posix, resolve } from "node:path";
import { spawn } from "node:child_process";
import { AuxError } from "@aux/contracts";
import { z } from "zod";

export const COPILOT_RELEASE = Object.freeze({
  sdkVersion: "1.0.16",
  runtimeVersion: "1.0.90",
  platform: "darwin-arm64",
  packageName: "@github/copilot-sdk-darwin-arm64",
  url: "https://registry.npmjs.org/@github/copilot-sdk-darwin-arm64/-/copilot-sdk-darwin-arm64-1.0.16.tgz",
  integrity:
    "sha512-+ACscTN4OuSYDQL7/1yoi1FfDeI8qNlekip+dt2hvb9ZC4rz3YNVrhWkzrZsc7gX1ATD0YHGp71JDKqNAxHmBg==",
  expandedBytes: 110740479,
  fileCount: 70,
  wrapper: "prebuilds/darwin-arm64/copilot-runtime",
  nativeModule: "prebuilds/darwin-arm64/runtime.node",
});
/** Official v1.0.16 repository license. Published npm archives omit this notice. */
export const COPILOT_RUNTIME_LICENSE = Object.freeze({
  path: "COPILOT-UPSTREAM-LICENSE.txt",
  sourceUrl:
    "https://raw.githubusercontent.com/github/copilot-sdk/f8ae645902b74b62cd47aac1fd9b29adaec3aff2/LICENSE",
  sourceCommit: "f8ae645902b74b62cd47aac1fd9b29adaec3aff2",
  sha256: "2510b446bc1f0cf9702453075d20cd88631e20e5642658edb7325d9c1eb534f7",
  size: 1060,
  text: 'MIT License\n\nCopyright GitHub, Inc.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n',
});
export const CopilotRuntimeEntrySchema = z
  .object({
    path: z.string().min(1).max(512),
    size: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    dev: z.string(),
    ino: z.string(),
    mtimeNs: z.string(),
    executable: z.boolean(),
  })
  .strict();
export const CopilotSupplementalLicenseSchema =
  CopilotRuntimeEntrySchema.extend({
    path: z.literal(COPILOT_RUNTIME_LICENSE.path),
    size: z.literal(COPILOT_RUNTIME_LICENSE.size),
    sha256: z.literal(COPILOT_RUNTIME_LICENSE.sha256),
    executable: z.literal(false),
    sourceUrl: z.literal(COPILOT_RUNTIME_LICENSE.sourceUrl),
    sourceCommit: z.literal(COPILOT_RUNTIME_LICENSE.sourceCommit),
  }).strict();
export const CopilotRuntimeReceiptSchema = z
  .object({
    version: z.literal(1),
    sdkVersion: z.literal("1.0.16"),
    runtimeVersion: z.literal("1.0.90"),
    platform: z.literal("darwin-arm64"),
    integrity: z.literal(COPILOT_RELEASE.integrity),
    downloadBytes: z
      .number()
      .int()
      .positive()
      .max(128 * 1024 * 1024),
    expandedBytes: z.literal(COPILOT_RELEASE.expandedBytes),
    files: z.array(CopilotRuntimeEntrySchema).length(COPILOT_RELEASE.fileCount),
    supplementalLicense: CopilotSupplementalLicenseSchema,
  })
  .strict();
export type CopilotInstallationReceipt = z.infer<
  typeof CopilotRuntimeReceiptSchema
>;
export interface CopilotInstalledRuntime {
  path: string;
  supportDirectory: string;
  receipt: CopilotInstallationReceipt;
  assertCurrent(): Promise<void>;
}
type RootIdentity = { dev: bigint; ino: bigint };
interface Attempt {
  owner: string;
  controller: AbortController;
  work: Promise<CopilotInstalledRuntime>;
}
/** root is an exclusive, protected Aux provider-runtime directory; never a user-selected extraction path. */
export interface CopilotInstallDeps {
  root: string;
  /** Parent resolves the packaged trusted worker entry; never renderer/model-controlled. */
  workerPath: string;
  checkOwner(original: string, requester?: string): Promise<void>;
  network?: typeof fetch;
  progress?(input: {
    downloadBytes: number;
    totalBytes?: number;
    expandedBytes: number;
  }): void;
}
const MAX_DOWNLOAD = 128 * 1024 * 1024;
export function copilotArchivePath(path: string, type: string): string {
  const p = type === "Directory" ? path.replace(/\/$/, "") : path;
  if (
    p.length > 512 ||
    p.includes("\\") ||
    /[\x00-\x1f\x7f]/.test(p) ||
    isAbsolute(p) ||
    p !== posix.normalize(p) ||
    p.split("/").some((s) => !s || s === ".." || s === ".") ||
    (p !== "package" && !p.startsWith("package/"))
  )
    throw new AuxError(
      "permission_denied",
      "Copilot runtime archive contains an unsafe path.",
    );
  if (type !== "File" && type !== "Directory")
    throw new AuxError(
      "permission_denied",
      "Copilot runtime archive contains unsupported links or special files.",
    );
  return p;
}
async function boundedFile(path: string, max: number): Promise<string> {
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > max)
      throw new AuxError(
        "permission_denied",
        "Invalid Copilot installation metadata.",
      );
    const buffer = Buffer.alloc(max + 1);
    let used = 0;
    while (used < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        used,
        buffer.length - used,
        used,
      );
      if (!bytesRead) break;
      used += bytesRead;
    }
    if (used > max)
      throw new AuxError(
        "permission_denied",
        "Copilot installation metadata exceeds its limit.",
      );
    return buffer.subarray(0, used).toString("utf8");
  } finally {
    await handle.close();
  }
}
export async function copilotRuntimeFileIdentity(
  path: string,
  expectedSize?: number,
): Promise<z.infer<typeof CopilotRuntimeEntrySchema>> {
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.uid !== BigInt(process.getuid?.() ?? -1) ||
      (before.mode & 0o022n) !== 0n
    )
      throw new AuxError(
        "permission_denied",
        "Copilot runtime artifact is not owned privately by Aux.",
      );
    if (
      before.size > BigInt(COPILOT_RELEASE.expandedBytes) ||
      (expectedSize !== undefined && before.size !== BigInt(expectedSize))
    )
      throw new AuxError(
        "permission_denied",
        "Copilot runtime artifact differs from its reviewed size.",
      );
    const hash = createHash("sha256");
    for await (const chunk of handle.createReadStream({
      autoClose: false,
      start: 0,
    }))
      hash.update(chunk);
    const after = await handle.stat({ bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs
    )
      throw new AuxError(
        "permission_denied",
        "Copilot runtime artifact changed while being verified.",
      );
    return {
      path: "",
      size: Number(before.size),
      sha256: hash.digest("hex"),
      dev: String(before.dev),
      ino: String(before.ino),
      mtimeNs: String(before.mtimeNs),
      executable: (before.mode & 0o100n) !== 0n,
    };
  } finally {
    await handle.close();
  }
}

/** Worker-owned notice is additional to, never counted as, an archive entry. */
export async function writeCopilotRuntimeLicense(payload: string) {
  const path = join(payload, COPILOT_RUNTIME_LICENSE.path);
  const handle = await open(
    path,
    constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(COPILOT_RUNTIME_LICENSE.text, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  const actual = await copilotRuntimeFileIdentity(
    path,
    COPILOT_RUNTIME_LICENSE.size,
  );
  return CopilotSupplementalLicenseSchema.parse({
    ...actual,
    path: COPILOT_RUNTIME_LICENSE.path,
    sourceUrl: COPILOT_RUNTIME_LICENSE.sourceUrl,
    sourceCommit: COPILOT_RUNTIME_LICENSE.sourceCommit,
  });
}
export async function assertCopilotRuntimeLicense(
  payload: string,
  saved: z.infer<typeof CopilotSupplementalLicenseSchema>,
) {
  const expected = CopilotSupplementalLicenseSchema.parse(saved);
  const actual = await copilotRuntimeFileIdentity(
    join(payload, expected.path),
    expected.size,
  );
  if (
    Object.keys(CopilotRuntimeEntrySchema.shape).some(
      (k) =>
        k !== "path" &&
        actual[k as keyof typeof actual] !==
          expected[k as keyof typeof expected],
    )
  )
    throw new AuxError(
      "permission_denied",
      "The pinned Copilot upstream notice changed.",
    );
}

/** Optional full official runtime; no postinstall scripts, private SDK loader, or ambient executable. */
export class CopilotRuntimeInstaller {
  private closed = false;
  private attempt: Attempt | undefined;
  private rootIdentity: RootIdentity | undefined;
  private readonly cleanup = new Map<
    string,
    { owner: string; identity: RootIdentity }
  >();
  constructor(private readonly deps: CopilotInstallDeps) {
    if (!isAbsolute(deps.workerPath))
      throw new AuxError(
        "invalid_params",
        "Copilot worker must be a packaged absolute entry.",
      );
    if (!isAbsolute(deps.root))
      throw new AuxError(
        "invalid_params",
        "Copilot runtime storage must be absolute.",
      );
  }
  private directory() {
    return join(
      this.deps.root,
      `copilot-${COPILOT_RELEASE.sdkVersion}-${COPILOT_RELEASE.platform}`,
    );
  }
  private async root() {
    await mkdir(this.deps.root, { recursive: true, mode: 0o700 });
    const s = await lstat(this.deps.root, { bigint: true });
    if (
      !s.isDirectory() ||
      s.isSymbolicLink() ||
      s.uid !== BigInt(process.getuid?.() ?? -1) ||
      (s.mode & 0o077n) !== 0n ||
      (await realpath(this.deps.root)) !== resolve(this.deps.root)
    )
      throw new AuxError(
        "permission_denied",
        "Copilot runtime storage is not an exclusive Aux directory.",
      );
    if (
      this.rootIdentity &&
      (this.rootIdentity.dev !== s.dev || this.rootIdentity.ino !== s.ino)
    )
      throw new AuxError(
        "permission_denied",
        "The original Copilot runtime storage changed.",
      );
    this.rootIdentity ??= { dev: s.dev, ino: s.ino };
  }
  private async current(a: Attempt) {
    if (this.closed || this.attempt !== a)
      throw new AuxError("cancelled", "Copilot runtime installation retired.");
    a.controller.signal.throwIfAborted();
    await this.deps.checkOwner(a.owner);
    if (this.closed || this.attempt !== a)
      throw new AuxError("cancelled", "Original installation window retired.");
    a.controller.signal.throwIfAborted();
    await this.root();
    if (this.closed || this.attempt !== a)
      throw new AuxError("cancelled", "Original installation retired.");
    a.controller.signal.throwIfAborted();
  }
  install(owner: string): Promise<CopilotInstalledRuntime> {
    if (this.closed)
      return Promise.reject(
        new AuxError("cancelled", "Copilot installation is closed."),
      );
    if (process.platform !== "darwin" || process.arch !== "arm64")
      return Promise.reject(
        new AuxError(
          "capability_unsupported",
          "This reviewed runtime release is for Apple silicon macOS.",
        ),
      );
    if (this.attempt)
      return Promise.reject(
        new AuxError(
          "conflict",
          "Join the original Copilot installation first.",
        ),
      );
    if (this.cleanup.size)
      return Promise.reject(
        new AuxError(
          "operation_uncertain",
          "Join the original installation staging cleanup first.",
        ),
      );
    const a: Attempt = {
      owner,
      controller: new AbortController(),
      work: Promise.resolve().then(() => this.installOwned(a)),
    };
    this.attempt = a;
    return a.work.finally(() => {
      if (this.attempt === a) this.attempt = undefined;
    });
  }
  private async installOwned(a: Attempt): Promise<CopilotInstalledRuntime> {
    await this.current(a);
    const installed = await this.status();
    await this.current(a);
    if (installed) return installed;
    const staging = await mkdtemp(join(this.deps.root, ".copilot-install-"));
    const identity = await lstat(staging, { bigint: true });
    this.cleanup.set(staging, {
      owner: a.owner,
      identity: { dev: identity.dev, ino: identity.ino },
    });
    let accepted = false;
    try {
      const archive = await open(
        join(staging, "runtime.tgz"),
        constants.O_CREAT |
          constants.O_EXCL |
          constants.O_RDWR |
          constants.O_NOFOLLOW,
        0o600,
      );
      let downloadBytes: number;
      try {
        downloadBytes = await this.download(a, archive);
        await this.current(a);
        const payload = join(staging, "payload");
        await mkdir(payload, { mode: 0o700 });
        const receipt = await this.extract(a, archive, payload, downloadBytes);
        const receiptHandle = await open(
          join(payload, "receipt.json"),
          "wx",
          0o600,
        );
        try {
          await receiptHandle.writeFile(JSON.stringify(receipt));
          await receiptHandle.sync();
        } finally {
          await receiptHandle.close();
        }
        await this.current(a);
        // Final original-owner check is the acceptance boundary. Accepted installation is persistent,
        // not retrospectively undone if the document retires while rename is already accepted.
        await rename(payload, this.directory());
        accepted = true;
      } finally {
        await archive.close();
      }
      const result = await this.status();
      if (!result)
        throw new AuxError(
          "operation_uncertain",
          "Accepted Copilot installation could not be verified.",
        );
      return result;
    } finally {
      try {
        await this.retireStaging(staging);
      } catch (error) {
        throw new AggregateError(
          [error],
          accepted
            ? "Installation accepted; staging cleanup is unconfirmed."
            : "Original installation staging cleanup is unconfirmed.",
        );
      }
    }
  }
  private async retireStaging(path: string): Promise<void> {
    const receipt = this.cleanup.get(path);
    if (!receipt) return;
    await this.root();
    const current = await lstat(path, { bigint: true });
    if (
      !current.isDirectory() ||
      current.isSymbolicLink() ||
      current.dev !== receipt.identity.dev ||
      current.ino !== receipt.identity.ino
    )
      throw new AuxError(
        "operation_uncertain",
        "Original Copilot staging ownership changed; cleanup was retained.",
      );
    await rm(path, { recursive: true });
    this.cleanup.delete(path);
  }
  private async download(a: Attempt, handle: FileHandle): Promise<number> {
    const signal = AbortSignal.any([
      a.controller.signal,
      AbortSignal.timeout(10 * 60 * 1000),
    ]);
    const response = await (this.deps.network ?? fetch)(COPILOT_RELEASE.url, {
      redirect: "error",
      signal,
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel().catch(() => {});
      throw new AuxError(
        "backend_unavailable",
        "Official Copilot runtime download failed.",
      );
    }
    const length = response.headers.get("content-length");
    const total = length === null ? undefined : Number(length);
    const hash = createHash("sha512"),
      reader = response.body.getReader();
    const abort = () => {
      void reader.cancel().catch(() => {});
    };
    signal.addEventListener("abort", abort, { once: true });
    let bytes = 0;
    try {
      await this.current(a);
      if (
        total !== undefined &&
        (!Number.isSafeInteger(total) || total <= 0 || total > MAX_DOWNLOAD)
      )
        throw new AuxError(
          "backend_unavailable",
          "Copilot runtime download exceeds its limit.",
        );
      for (;;) {
        signal.throwIfAborted();
        const part = await reader.read();
        signal.throwIfAborted();
        await this.current(a);
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > MAX_DOWNLOAD || (total !== undefined && bytes > total))
          throw new AuxError(
            "backend_unavailable",
            "Copilot runtime download exceeds its stated size.",
          );
        hash.update(part.value);
        let offset = 0;
        while (offset < part.value.byteLength) {
          const { bytesWritten } = await handle.write(
            part.value,
            offset,
            part.value.byteLength - offset,
          );
          if (!bytesWritten)
            throw new AuxError(
              "backend_unavailable",
              "Copilot runtime download could not be stored.",
            );
          offset += bytesWritten;
        }
        this.deps.progress?.({
          downloadBytes: bytes,
          ...(total === undefined ? {} : { totalBytes: total }),
          expandedBytes: 0,
        });
      }
    } finally {
      signal.removeEventListener("abort", abort);
      await reader.cancel().catch(() => {});
    }
    if (total !== undefined && bytes !== total)
      throw new AuxError(
        "backend_unavailable",
        "Official runtime download was truncated.",
      );
    const expected = Buffer.from(
        COPILOT_RELEASE.integrity.slice("sha512-".length),
        "base64",
      ),
      actual = hash.digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new AuxError(
        "permission_denied",
        "Official Copilot runtime integrity does not match its reviewed release.",
      );
    await handle.sync();
    return bytes;
  }
  private async extract(
    a: Attempt,
    archive: FileHandle,
    payload: string,
    downloadBytes: number,
  ): Promise<CopilotInstallationReceipt> {
    await this.current(a);
    // The trusted child has no inherited credentials, no npm scripts, and no runtime execution.
    // FD3 is the same already-SRI-verified held archive, not a pathname reopened by the worker.
    const child = spawn(
      process.execPath,
      [this.deps.workerPath, payload, String(downloadBytes)],
      {
        env: {},
        stdio: ["ignore", "ignore", "ignore", archive.fd, "ipc"],
        serialization: "json",
      },
    );
    let receipt: CopilotInstallationReceipt | undefined, failure: unknown;
    child.on("message", (value: unknown) => {
      if (receipt) {
        failure = new AuxError(
          "permission_denied",
          "Duplicate worker completion receipt.",
        );
        return;
      }
      const parsed = CopilotRuntimeReceiptSchema.safeParse(value);
      if (!parsed.success) {
        failure = new AuxError(
          "backend_unavailable",
          "Invalid runtime extraction receipt.",
        );
        return;
      }
      receipt = parsed.data;
    });
    child.on("error", (error: Error) => {
      failure = error;
    });
    const joined = new Promise<{
      code: number | null;
      signal: NodeJS.Signals | null;
    }>((resolve) => {
      child.once("close", (code, signal) => resolve({ code, signal }));
    });
    const stop = () => {
      // A failed signal does not manufacture an exit ACK: joined remains pending on the original child.
      if (child.exitCode === null && child.signalCode === null) {
        try {
          if (!child.kill("SIGTERM"))
            failure ??= new AuxError(
              "operation_uncertain",
              "Original extraction worker retirement is unconfirmed.",
            );
        } catch (error) {
          failure ??= error;
        }
      }
    };
    a.controller.signal.addEventListener("abort", stop, { once: true });
    if (a.controller.signal.aborted) stop();
    let exit: Awaited<typeof joined>;
    try {
      exit = await joined;
    } finally {
      a.controller.signal.removeEventListener("abort", stop);
    }
    // All descriptor/writer lifetime is joined before staging can ever be removed or accepted.
    await this.current(a);
    if (failure) throw failure;
    if (exit.code !== 0 || exit.signal || !receipt)
      throw new AuxError(
        "backend_unavailable",
        "The original extraction worker did not complete.",
      );
    this.deps.progress?.({
      downloadBytes,
      expandedBytes: receipt.expandedBytes,
    });
    return receipt;
  }
  async status(): Promise<CopilotInstalledRuntime | undefined> {
    if (this.closed)
      throw new AuxError("cancelled", "Copilot installation is closed.");
    await this.root();
    const directory = this.directory();
    try {
      await lstat(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
    const receipt = CopilotRuntimeReceiptSchema.parse(
      JSON.parse(await boundedFile(join(directory, "receipt.json"), 262144)),
    );
    const validate = async () => {
      await this.root();
      if (this.closed)
        throw new AuxError("cancelled", "Copilot runtime storage retired.");
      const observed: string[] = [];
      const expectedPaths = [
        ...receipt.files.map((file) => file.path),
        receipt.supplementalLicense.path,
      ];
      const visit = async (root: string, prefix: string) => {
        const before = await lstat(root, { bigint: true });
        if (
          !before.isDirectory() ||
          before.isSymbolicLink() ||
          before.uid !== BigInt(process.getuid?.() ?? -1) ||
          (before.mode & 0o077n) !== 0n ||
          (await realpath(root)) !== root
        )
          throw new AuxError(
            "permission_denied",
            "Installed runtime directory ownership changed.",
          );
        for (const entry of await readdir(root, { withFileTypes: true })) {
          const p = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (p === "receipt.json") continue;
          if (entry.isSymbolicLink())
            throw new AuxError(
              "permission_denied",
              "Installed Copilot runtime contains a link.",
            );
          if (entry.isDirectory()) await visit(join(root, entry.name), p);
          else if (entry.isFile()) {
            if (observed.length >= expectedPaths.length)
              throw new AuxError(
                "permission_denied",
                "Installed runtime contains unexpected artifacts.",
              );
            observed.push(p);
          } else
            throw new AuxError(
              "permission_denied",
              "Installed runtime contains a special file.",
            );
        }
        const after = await lstat(root, { bigint: true });
        if (
          after.dev !== before.dev ||
          after.ino !== before.ino ||
          after.mtimeNs !== before.mtimeNs
        )
          throw new AuxError(
            "permission_denied",
            "Installed runtime directory changed during verification.",
          );
      };
      await visit(directory, "");
      if (
        observed.length !== expectedPaths.length ||
        new Set(expectedPaths).size !== expectedPaths.length ||
        observed.some((p) => !expectedPaths.includes(p))
      )
        throw new AuxError(
          "permission_denied",
          "Installed runtime payload differs from its accepted receipt.",
        );
      for (const expected of receipt.files) {
        if (
          copilotArchivePath(`package/${expected.path}`, "File") !==
          `package/${expected.path}`
        )
          throw new AuxError(
            "permission_denied",
            "Invalid installed artifact path.",
          );
        const actual = await copilotRuntimeFileIdentity(
          join(directory, expected.path),
          expected.size,
        );
        if (
          Object.entries(expected).some(
            ([k, v]) => k !== "path" && actual[k as keyof typeof actual] !== v,
          )
        )
          throw new AuxError(
            "permission_denied",
            "The original installed Copilot artifact changed.",
          );
      }
      await assertCopilotRuntimeLicense(directory, receipt.supplementalLicense);
      if (this.closed)
        throw new AuxError(
          "cancelled",
          "Copilot runtime installation retired.",
        );
    };
    await validate();
    return {
      path: join(directory, COPILOT_RELEASE.wrapper),
      supportDirectory: directory,
      receipt,
      assertCurrent: validate,
    };
  }
  async cancel(owner: string): Promise<void> {
    const a = this.attempt;
    if (!a) {
      for (const [path, receipt] of this.cleanup) {
        await this.deps.checkOwner(receipt.owner, owner);
        await this.retireStaging(path);
      }
      return;
    }
    await this.deps.checkOwner(a.owner, owner);
    a.controller.abort();
    await a.work.then(
      () => {},
      (error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          throw error;
      },
    );
  }
  /** Retirement prevents new work and aborts the same original download.
   * File cleanup remains close()'s joined step; no installed payload is released. */
  retireAdmission(): void {
    this.closed = true;
    this.attempt?.controller.abort();
  }
  async close(): Promise<void> {
    this.retireAdmission();
    const failures: unknown[] = [];
    await this.attempt?.work.catch((error: unknown) => {
      if (
        !(error instanceof DOMException && error.name === "AbortError") &&
        !(error instanceof AuxError && error.code === "cancelled")
      )
        failures.push(error);
    });
    for (const path of this.cleanup.keys()) {
      try {
        await this.retireStaging(path);
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length)
      throw new AggregateError(
        failures,
        "Original installation retirement reported errors.",
      );
  }
}
