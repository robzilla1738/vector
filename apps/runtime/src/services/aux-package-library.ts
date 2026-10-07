import { AuxError, type AuxPackageSnapshot } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { FilesystemAccessService } from "./filesystem-access.js";
import { requireFilesystemPath } from "./filesystem-policy.js";
import { shippedAuxPackageDirectories } from "./shipped-aux-packages.js";
import { loadAuxPackage } from "./aux-packages.js";
import type { CodingFileState } from "@aux/contracts/coding-files";
type PackageDirectory = { name: string; path: string; shipped?: boolean };
export class AuxPackageLibrary {
  constructor(
    private readonly repo: Repo,
    private readonly filesystem: FilesystemAccessService,
    private readonly tools: ReadonlySet<string>,
  ) {}
  private directories(): PackageDirectory[] {
    return [
      ...shippedAuxPackageDirectories(),
      ...(this.repo.getSetting<PackageDirectory[]>("auxPackageDirectories") ?? []),
    ];
  }
  async snapshot(directory: PackageDirectory): Promise<AuxPackageSnapshot> {
    if (!directory.shipped) requireFilesystemPath(this.filesystem.codingPolicy(), directory.path, "read");
    return loadAuxPackage(
      directory.path,
      this.tools,
      directory.shipped
        ? undefined
        : async (path) => {
            const file = await this.filesystem.coding<CodingFileState>({ kind: "read", path });
            if (file.content === null) throw new AuxError("not_found", "Aux package file is unavailable.");
            return file.content;
          },
    );
  }
  async resolve(names: string[]): Promise<AuxPackageSnapshot[]> {
    return Promise.all(
      [...new Set(names)].map(async (name) => {
        const directories = this.directories().filter((directory) => directory.name === name);
        if (directories.length !== 1)
          throw new AuxError("not_found", `Choose an installed Aux package: ${name}`);
        return this.snapshot(directories[0]!);
      }),
    );
  }
  defaults(): string[] {
    return this.repo.getSetting<string[]>("auxPackageDefaults") ?? ["aux-core"];
  }
  async list() {
    const packages = await Promise.all(
      this.directories().map(async (directory) => {
        const snapshot = await this.snapshot(directory);
        return {
          name: snapshot.manifest.name,
          version: snapshot.manifest.version,
          description: snapshot.manifest.description,
          shipped: directory.shipped === true,
          warnings: snapshot.warnings,
          skills: snapshot.skills.map(({ name, description }) => ({ name, description })),
          profiles: snapshot.manifest.profiles.map(({ name }) => ({ name })),
        };
      }),
    );
    return { packages, defaults: this.defaults() };
  }
  async install(path: string, checkOwner: () => Promise<void>) {
    const snapshot = await this.snapshot({ name: "import", path });
    const name = snapshot.manifest.name;
    if (
      snapshot.manifest.profiles.some((profile) =>
        ["default", "coder", "explorer", "read_only"].includes(profile.name),
      )
    )
      throw new AuxError(
        "invalid_params",
        "Custom profiles must use a name distinct from shipped Aux profiles.",
      );
    if (shippedAuxPackageDirectories().some((directory) => directory.name === name))
      throw new AuxError("conflict", "Customize a shipped package under a new name.");
    await checkOwner();
    const saved = this.repo.getSetting<PackageDirectory[]>("auxPackageDirectories") ?? [];
    this.repo.setSetting("auxPackageDirectories", [
      ...saved.filter((directory) => directory.name !== name),
      { name, path },
    ]);
    return this.list();
  }
  async remove(name: string) {
    if (shippedAuxPackageDirectories().some((directory) => directory.name === name))
      throw new AuxError("permission_denied", "Shipped Aux packages cannot be removed.");
    const saved = this.repo.getSetting<PackageDirectory[]>("auxPackageDirectories") ?? [];
    this.repo.setSetting(
      "auxPackageDirectories",
      saved.filter((directory) => directory.name !== name),
    );
    this.repo.setSetting(
      "auxPackageDefaults",
      this.defaults().filter((item) => item !== name),
    );
    return this.list();
  }
  async setDefaults(names: string[], checkOwner: () => Promise<void>) {
    await this.resolve(names);
    await checkOwner();
    this.repo.setSetting("auxPackageDefaults", [...new Set(names)]);
    return this.list();
  }
}
