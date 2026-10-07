import { lstatSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";

/** Original packaged helper only; arbitrary selected Node executables are unchanged. */
export function packagedNodeBootstrap(executable: string = process.execPath): { args: string[]; files: string[] } {
  if (executable !== process.execPath || basename(executable) !== "Aux Runtime")
    return { args: [], files: [] };
  const node = realpathSync(executable);
  const helpers = dirname(node), contents = dirname(helpers);
  if (basename(helpers) !== "Helpers" || basename(contents) !== "Contents" || basename(dirname(contents)) !== "Aux.app")
    throw new Error("The original packaged runtime location is invalid.");
  const directory = join(contents, "Resources", "aux-runtime", "vendor", "icu");
  const data = join(directory, "icudt78l.dat");
  const info = lstatSync(data);
  if (!info.isFile() || info.isSymbolicLink() || info.size !== 33_105_536 || realpathSync(data) !== data)
    throw new Error("The original packaged runtime ICU data is unavailable or changed.");
  return { args: [`--icu-data-dir=${directory}`], files: [data] };
}
