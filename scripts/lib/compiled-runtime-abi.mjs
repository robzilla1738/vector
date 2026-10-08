import { closeSync, fstatSync, openSync, readFileSync, readSync } from "node:fs";
import { join } from "node:path";

/** Read the ABI literal actually linked into the macOS arm64 app, never a staging receipt. */
export function assertCompiledRuntimeAbi(app, generatedHeader) {
  const failure = () =>
    new Error(
      "Runtime-only staging requires a built Aux app with matching host contracts. Run node scripts/dev.mjs --temp-profile without --runtime-only (using the same --flavor) to rebuild native and renderer.",
    );
  const hash = readFileSync(generatedHeader, "utf8").match(/kManifestHash = "([a-f0-9]{64})"/)?.[1];
  if (!hash) throw failure();
  let fd;
  try {
    fd = openSync(
      join(app, "Contents/Frameworks/Aux Framework.framework/Versions/Current/Aux Framework"),
      "r",
    );
    const fileSize = fstatSync(fd).size;
    const read = (offset, size) => {
      if (
        !Number.isSafeInteger(offset) ||
        !Number.isSafeInteger(size) ||
        offset < 0 ||
        size < 0 ||
        size > 64 * 1024 * 1024 ||
        offset + size > fileSize
      )
        throw failure();
      const bytes = Buffer.alloc(size);
      if (readSync(fd, bytes, 0, size, offset) !== size) throw failure();
      return bytes;
    };
    const header = read(0, 32);
    if (header.readUInt32LE(0) !== 0xfeedfacf || header.readUInt32LE(4) !== 0x0100000c) throw failure();
    const commands = read(32, header.readUInt32LE(20));
    let offset = 0;
    for (let index = 0; index < header.readUInt32LE(16); index++) {
      if (offset + 8 > commands.length) throw failure();
      const command = commands.readUInt32LE(offset),
        size = commands.readUInt32LE(offset + 4);
      if (size < 8 || offset + size > commands.length) throw failure();
      if (command === 0x19) {
        // LC_SEGMENT_64
        if (size < 72) throw failure();
        const count = commands.readUInt32LE(offset + 64);
        if (72 + count * 80 > size) throw failure();
        for (let section = offset + 72; section < offset + 72 + count * 80; section += 80) {
          const name = commands
            .subarray(section, section + 16)
            .toString()
            .replace(/\0.*$/, "");
          const segment = commands
            .subarray(section + 16, section + 32)
            .toString()
            .replace(/\0.*$/, "");
          if (name !== "__cstring" || segment !== "__TEXT") continue;
          const strings = read(
            commands.readUInt32LE(section + 48),
            Number(commands.readBigUInt64LE(section + 40)),
          );
          if (strings.includes(Buffer.from(hash + "\0"))) return;
        }
      }
      offset += size;
    }
    throw failure();
  } catch {
    throw failure();
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
