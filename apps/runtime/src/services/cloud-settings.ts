import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  AuxError,
  CloudConfigureParamsSchema,
  CloudResourceQuoteSchema,
  type CloudConfigureParams,
  type CloudSettingsStatus,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import type { CloudConfiguration } from "./vercel-sandbox-executor.js";

const savedSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    teamId: z.string().min(1).max(200),
    projectId: z.string().min(1).max(200),
    quote: CloudResourceQuoteSchema,
    secretName: z.string().regex(/^aux\.cloud\.vercel\.[a-f0-9-]{36}$/),
  })
  .strict();
const setting = "cloudExecution";
const services = new WeakMap<Repo, CloudSettingsService>();
/** API and runtime factories share one creation-aware settings owner per real Repo. */
export function cloudSettingsFor(repo: Repo, native: NativeBridge): CloudSettingsService {
  let service = services.get(repo);
  if (!service) {
    service = new CloudSettingsService(repo, native);
    services.set(repo, service);
  }
  return service;
}
/** Creation-aware shutdown also covers Settings-only credential configuration. */
export async function closeCloudSettings(repo: Repo): Promise<void> {
  await services.get(repo)?.close();
}
export class CloudSettingsService {
  private writes: Promise<unknown> = Promise.resolve();
  private closed = false;
  constructor(
    private readonly repo: Repo,
    private readonly native: NativeBridge,
  ) {}
  private record() {
    const saved = this.repo.getSetting<unknown>(setting);
    if (saved === undefined && !this.repo.hasSetting(setting)) return undefined;
    const parsed = savedSchema.safeParse(saved);
    if (!parsed.success)
      throw new AuxError("permission_denied", "Review the invalid cloud account configuration in Settings.");
    if (
      parsed.data.quote.revision !== parsed.data.revision ||
      parsed.data.quote.accountDigest !==
        createHash("sha256")
          .update(
            JSON.stringify([
              parsed.data.teamId,
              parsed.data.projectId,
              parsed.data.secretName,
              parsed.data.revision,
            ]),
          )
          .digest("hex")
    )
      throw new AuxError(
        "permission_denied",
        "The saved cloud account quote does not match its original revision.",
      );
    return parsed.data;
  }
  status(): CloudSettingsStatus {
    const saved = this.record();
    return saved
      ? {
          configured: true,
          revision: saved.revision,
          teamId: saved.teamId,
          projectId: saved.projectId,
          quote: saved.quote,
        }
      : {
          configured: false,
          revision: z
            .number()
            .int()
            .nonnegative()
            .parse(this.repo.getSetting<unknown>("cloudExecutionRevision") ?? 0),
        };
  }
  private queueRetirement(secretName: string) {
    const names = z
      .array(savedSchema.shape.secretName)
      .max(1000)
      .parse(this.repo.getSetting<unknown>("cloudExecutionRetiredSecrets") ?? []);
    this.repo.setSetting("cloudExecutionRetiredSecrets", [...new Set([...names, secretName])]);
  }
  private async retireSecrets() {
    const names = z
      .array(savedSchema.shape.secretName)
      .max(1000)
      .parse(this.repo.getSetting<unknown>("cloudExecutionRetiredSecrets") ?? []);
    for (const name of names) {
      if (this.record()?.secretName === name)
        throw new AuxError("permission_denied", "The active cloud credential cannot be retired.");
      await this.native.storeSecret(name, "");
      const remaining = z
        .array(savedSchema.shape.secretName)
        .parse(this.repo.getSetting<unknown>("cloudExecutionRetiredSecrets") ?? []);
      this.repo.setSetting(
        "cloudExecutionRetiredSecrets",
        remaining.filter((other) => other !== name),
      );
    }
  }
  private async owner(token: string) {
    if (this.closed || !token || !this.native.turnSourceContext)
      throw new AuxError("permission_denied", "Cloud configuration requires the original Aux window.");
    const owner = await this.native.turnSourceContext(token);
    if (this.closed) throw new AuxError("cancelled", "Cloud settings closed during owner validation.");
    return owner;
  }
  async readStatus(nativeTurnContext: string): Promise<CloudSettingsStatus> {
    await this.owner(nativeTurnContext);
    if (this.closed) throw new AuxError("cancelled", "Cloud settings closed during status validation.");
    return this.status();
  }
  async configuration(): Promise<CloudConfiguration> {
    if (this.closed) throw new AuxError("cancelled", "Cloud settings are closed.");
    const saved = this.record();
    if (!saved)
      throw new AuxError(
        "needs_input",
        "Configure your Vercel account and review its resource rates in Settings before choosing Run in cloud.",
      );
    const identity = JSON.stringify(saved);
    const token = (await this.native.readSecret(saved.secretName)).value;
    if (this.closed || JSON.stringify(this.record()) !== identity)
      throw new AuxError("ref_stale", "The cloud account changed while reading its credential.");
    if (!token)
      throw new AuxError(
        "needs_input",
        "The configured Vercel credential is unavailable in the OS credential store.",
      );
    return { token, teamId: saved.teamId, projectId: saved.projectId, quote: saved.quote };
  }
  configure(raw: CloudConfigureParams, nativeTurnContext: string): Promise<CloudSettingsStatus> {
    const input = CloudConfigureParamsSchema.parse(raw);
    const write = this.writes.then(async () => {
      const original = await this.owner(nativeTurnContext);
      const before = this.status();
      if (input.expectedRevision !== before.revision)
        throw new AuxError(
          "ref_stale",
          "The cloud configuration changed. Review its latest account and rates.",
        );
      const previous = this.record();
      if (!input.token && !previous) throw new AuxError("invalid_params", "Enter your Vercel access token.");
      const secretName = input.token ? `aux.cloud.vercel.${randomUUID()}` : previous!.secretName;
      let committed = false;
      try {
        if (input.token) {
          // A durable retirement receipt precedes the uncertain Keychain write.
          this.queueRetirement(secretName);
          await this.native.storeSecret(secretName, input.token);
        }
        const current = await this.owner(nativeTurnContext);
        if (
          current.windowId !== original.windowId ||
          current.activePageId !== original.activePageId ||
          this.status().revision !== before.revision
        )
          throw new AuxError("ref_stale", "The original cloud settings window or account changed.");
        const revision = before.revision + 1;
        const accountDigest = createHash("sha256")
          .update(JSON.stringify([input.teamId, input.projectId, secretName, revision]))
          .digest("hex");
        this.repo.transaction(() => {
          this.repo.setSetting(setting, {
            revision,
            teamId: input.teamId,
            projectId: input.projectId,
            secretName,
            quote: { ...input.quote, revision, accountDigest },
          });
          this.repo.setSetting("cloudExecutionRevision", revision);
          const retired = z
            .array(savedSchema.shape.secretName)
            .parse(this.repo.getSetting<unknown>("cloudExecutionRetiredSecrets") ?? []);
          this.repo.setSetting(
            "cloudExecutionRetiredSecrets",
            retired.filter((name) => name !== secretName),
          );
          if (previous && previous.secretName !== secretName) this.queueRetirement(previous.secretName);
        });
        committed = true;
        await this.retireSecrets();
        return this.status();
      } finally {
        // Only this attempt's new credential is retired; later writes are serialized and never overwritten.
        if (!committed && input.token) await this.retireSecrets();
      }
    });
    this.writes = write.catch(() => {});
    return write;
  }
  clear(expectedRevision: number, nativeTurnContext: string): Promise<CloudSettingsStatus> {
    const write = this.writes.then(async () => {
      const original = await this.owner(nativeTurnContext),
        before = this.status();
      if (before.revision !== expectedRevision)
        throw new AuxError("ref_stale", "The cloud account changed before disconnection.");
      const previous = this.record();
      const current = await this.owner(nativeTurnContext);
      if (current.windowId !== original.windowId || current.activePageId !== original.activePageId)
        throw new AuxError("ref_stale", "The original cloud settings window changed.");
      this.repo.transaction(() => {
        this.repo.db.prepare("DELETE FROM kv WHERE key=?").run(`setting:${setting}`);
        this.repo.setSetting("cloudExecutionRevision", before.revision + 1);
        if (previous) this.queueRetirement(previous.secretName);
      });
      await this.retireSecrets();
      return this.status();
    });
    this.writes = write.catch(() => {});
    return write;
  }
  async close() {
    this.closed = true;
    await this.writes;
    await this.retireSecrets();
  }
}
