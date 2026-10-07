import { packagedNodeBootstrap } from "./packaged-node.js";
import { randomUUID } from "node:crypto";
import { chmodSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { AuxError } from "@aux/contracts";

const marker = "# Aux managed CLI launcher v1";
const quote = (value: string) => `'${value.replaceAll("'", `'"'"'`)}'`;

/** Install only the launcher; the CLI and Node remain in the actual app payload. */
export async function installCli(options: {
  current: () => Promise<void>;
  home?: string;
  node?: string;
  entry?: string;
  path?: string;
}): Promise<{ path: string; pathConfigured: boolean }> {
  const home = resolve(options.home ?? homedir());
  const directory = join(home, ".local", "bin");
  const path = join(directory, "aux");
  const node = options.node ?? process.execPath;
  const nodeBootstrap = packagedNodeBootstrap(node);
  const entry = options.entry ?? join(dirname(process.argv[1] ?? ""), "cli.js");
  for (const file of [node, entry]) {
    if (!lstatSync(file).isFile())
      throw new AuxError("backend_unavailable", "The packaged Aux CLI is missing from this build.");
  }
  const read = (): { bytes: Buffer; mode: number } | undefined => {
    for (const candidate of [home, join(home, ".local"), directory, path]) {
      try {
        const stat = lstatSync(candidate);
        if (stat.isSymbolicLink() || (candidate === path ? !stat.isFile() : !stat.isDirectory()))
          throw new AuxError(
            "permission_denied",
            "CLI installation requires regular user files and folders.",
          );
        if (candidate === path) {
          if (stat.size > 64 * 1024)
            throw new AuxError("conflict", "An existing aux command was left unchanged.");
          return { bytes: readFileSync(path), mode: stat.mode & 0o777 };
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    return undefined;
  };
  await options.current();
  const before = read();
  if (before && !before.bytes.toString("utf8").startsWith(`#!/bin/sh\n${marker}\n`))
    throw new AuxError(
      "conflict",
      "An existing aux command was left unchanged. Choose another name or remove it yourself.",
    );
  const after = Buffer.from(`#!/bin/sh\n${marker}\nexec ${[node, ...nodeBootstrap.args, entry].map(quote).join(" ")} "$@"\n`);
  const unchanged = (snapshot: typeof before) => {
    const current = read();
    return current === undefined
      ? snapshot === undefined
      : snapshot !== undefined && current.bytes.equals(snapshot.bytes) && current.mode === snapshot.mode;
  };
  const replace = (bytes: Buffer, mode: number) => {
    const temporary = join(directory, `.aux-${randomUUID()}.tmp`);
    try {
      writeFileSync(temporary, bytes, { flag: "wx", mode });
      chmodSync(temporary, mode);
      renameSync(temporary, path);
    } finally {
      rmSync(temporary, { force: true });
    }
  };
  await options.current();
  mkdirSync(directory, { recursive: true, mode: 0o755 });
  if (!unchanged(before))
    throw new AuxError("conflict", "The aux command changed during installation. Retry.");
  replace(after, 0o755);
  try {
    await options.current();
  } catch (error) {
    if (unchanged({ bytes: after, mode: 0o755 })) {
      if (before) replace(before.bytes, before.mode);
      else rmSync(path);
    }
    throw error;
  }
  return {
    path,
    pathConfigured: (options.path ?? process.env.PATH ?? "")
      .split(":")
      .some((part) => part && resolve(part) === directory),
  };
}
