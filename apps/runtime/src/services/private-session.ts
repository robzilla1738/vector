import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { z } from "zod";
import { SettingsSetParams, ModelProviderSchema } from "@aux/contracts";
import type { HostCapabilities } from "@aux/contracts/host-methods";
import type { Repo } from "../store/repo.js";

const preferences = SettingsSetParams.pick({
  modelProvider: true,
  imageModel: true,
  localModelsOnly: true,
  compatibleEndpoint: true,
  plannerModel: true,
  recoveryModel: true,
  visionModel: true,
  agentModelRoutes: true,
  budgets: true,
  maxWorkers: true,
  perOrigin: true,
  maxModelCalls: true,
  agentMode: true,
  agentPolicies: true,
  fileAccessMode: true,
}).extend({
  disabledModelProviders: ModelProviderSchema.array().optional(),
  providerModels: z
    .partialRecord(
      ModelProviderSchema,
      z
        .object({
          plannerModel: z.string().max(300).optional(),
          recoveryModel: z.string().max(300).optional(),
          visionModel: z.string().max(300).optional(),
        })
        .strict(),
    )
    .optional(),
  providerAgentModelRoutes: z
    .partialRecord(ModelProviderSchema, SettingsSetParams.shape.agentModelRoutes)
    .optional(),
});

/** Native OTR ownership, not a renderer's Temporary flag, admits this session. */
export class PrivateRuntimeSession {
  private admitted = false;
  private constructor(
    readonly id: string,
    readonly dataDir: string,
    private readonly settingsPath: string,
  ) {}

  static fromEnvironment(env: NodeJS.ProcessEnv): PrivateRuntimeSession | undefined {
    if (!env.AUX_PRIVATE_SESSION) return;
    const id = z.string().uuid().parse(env.AUX_PRIVATE_SESSION);
    if (
      !env.AUX_HOST_SOCKET ||
      !env.AUX_HOST_TOKEN ||
      !/^[1-9][0-9]*$/.test(env.AUX_HOST_GENERATION ?? "") ||
      env.AUX_BROWSER_PROFILE_ID !== `private:${id}` ||
      env.AUX_LOAD_DOTENV !== "0"
    )
      throw new Error("Private AI requires its original authenticated native session.");
    const dataDir = env.AUX_DATA_DIR ?? "";
    const settingsPath = env.AUX_PRIVATE_SETTINGS_PATH ?? "";
    if (
      !isAbsolute(dataDir) ||
      basename(dataDir) !== "Aux Runtime Data" ||
      !isAbsolute(settingsPath) ||
      basename(settingsPath) !== "settings.json" ||
      basename(dirname(settingsPath)) !== "Aux Runtime Data"
    )
      throw new Error("Private AI storage paths are invalid.");
    const root = dirname(dataDir),
      stat = lstatSync(root);
    if (
      !stat.isDirectory() ||
      stat.isSymbolicLink() ||
      stat.uid !== process.getuid?.() ||
      (stat.mode & 0o777) !== 0o700 ||
      !basename(root).startsWith("aux-private-") ||
      dirname(realpathSync(root)) !== realpathSync("/tmp")
    )
      throw new Error("Private AI storage must belong to its original native temporary directory.");
    try {
      const data = lstatSync(dataDir);
      if (!data.isDirectory() || data.isSymbolicLink() || data.uid !== stat.uid)
        throw new Error("Private AI storage must remain inside its native temporary directory.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return new PrivateRuntimeSession(id, join(realpathSync(root), "Aux Runtime Data"), settingsPath);
  }

  admit(identity: HostCapabilities): void {
    if (identity.privateSession?.id !== this.id)
      throw new Error("The native host is not this original private session.");
    this.admitted = true;
  }

  /** Copy only validated nonsecret connection preferences into the in-memory database. */
  seedSettings(repo: Repo): void {
    if (!this.admitted) throw new Error("Private AI ownership has not been admitted.");
    let file: number;
    try {
      file = openSync(this.settingsPath, constants.O_RDONLY | constants.O_NOFOLLOW);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    try {
      const stat = fstatSync(file);
      if (!stat.isFile() || stat.uid !== process.getuid?.() || stat.size > 1024 * 1024)
        throw new Error("Private AI connection preferences are unavailable.");
      const parsed = preferences.safeParse(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.success) throw new Error("Private AI connection preferences are invalid.");
      repo.transaction(() => {
        for (const [key, value] of Object.entries(parsed.data))
          if (value !== undefined) repo.setSetting(key, value);
      });
    } finally {
      closeSync(file);
    }
  }
}
