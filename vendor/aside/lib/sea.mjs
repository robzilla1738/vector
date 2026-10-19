/**
 * Reader and writer for Node single-executable-application blobs (Node 26 layout, as shipped
 * by the vendored daemon): magic, flags, 2 reserved bytes, entry path, entry code, assets,
 * then exec-argv extension bytes that are preserved verbatim.
 */
const MAGIC = 0x143da20;

export function readSeaBlob(buffer) {
  let offset = 0;
  const u32 = () => {
    const value = buffer.readUInt32LE(offset);
    offset += 4;
    return value;
  };
  const u64 = () => {
    const value = Number(buffer.readBigUInt64LE(offset));
    offset += 8;
    return value;
  };
  const string = () => {
    const length = u64();
    const value = buffer.subarray(offset, offset + length);
    offset += length;
    return value;
  };
  if (u32() !== MAGIC) throw new Error("Not a Node SEA blob");
  const flags = u32();
  const reserved = buffer.subarray(offset, offset + 2);
  offset += 2;
  const entryPath = string().toString();
  const code = string().toString();
  const assets = [];
  for (let remaining = u64(); remaining > 0; remaining--) {
    const key = string().toString();
    assets.push([key, Buffer.from(string())]);
  }
  return { flags, reserved: Buffer.from(reserved), entryPath, code, assets, tail: Buffer.from(buffer.subarray(offset)) };
}

export function writeSeaBlob({ flags, reserved, entryPath, code, assets, tail }) {
  const parts = [];
  const u32 = (value) => {
    const part = Buffer.alloc(4);
    part.writeUInt32LE(value);
    parts.push(part);
  };
  const u64 = (value) => {
    const part = Buffer.alloc(8);
    part.writeBigUInt64LE(BigInt(value));
    parts.push(part);
  };
  const string = (value) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    u64(bytes.length);
    parts.push(bytes);
  };
  u32(MAGIC);
  u32(flags);
  parts.push(reserved);
  string(entryPath);
  string(code);
  u64(assets.length);
  for (const [key, data] of assets) {
    string(key);
    string(data);
  }
  parts.push(tail);
  return Buffer.concat(parts);
}

/**
 * Replaces the blob in an already-injected Mach-O executable without moving any other
 * segment. The new blob must fit in the space the original segment reserved.
 */
export function injectMachOSeaBlob(binary, blob) {
  if (binary.readUInt32LE(0) !== 0xfeedfacf) throw new Error("Expected a 64-bit Mach-O executable");
  const commandCount = binary.readUInt32LE(16);
  const segments = [];
  let offset = 32;
  for (let index = 0; index < commandCount; index++) {
    const command = binary.readUInt32LE(offset);
    const size = binary.readUInt32LE(offset + 4);
    if (command === 0x19) {
      segments.push({
        at: offset,
        name: binary.toString("latin1", offset + 8, offset + 24).replace(/\0+$/, ""),
        fileoff: Number(binary.readBigUInt64LE(offset + 40)),
      });
    }
    offset += size;
  }
  const sea = segments.find((segment) => segment.name === "NODE_SEA");
  if (!sea) throw new Error("NODE_SEA segment not found");
  const next = segments.filter((segment) => segment.fileoff > sea.fileoff).sort((a, b) => a.fileoff - b.fileoff)[0];
  const capacity = (next?.fileoff ?? binary.length) - sea.fileoff;
  if (blob.length > capacity) throw new Error(`Blob is ${blob.length - capacity} bytes larger than the reserved ${capacity}`);

  binary.fill(0, sea.fileoff, sea.fileoff + capacity);
  blob.copy(binary, sea.fileoff);
  binary.writeBigUInt64LE(BigInt(blob.length), sea.at + 48);
  const sections = binary.readUInt32LE(sea.at + 64);
  for (let section = 0, at = sea.at + 72; section < sections; section++, at += 80) {
    if (binary.toString("latin1", at, at + 16).replace(/\0+$/, "") === "__NODE_SEA_BLOB") {
      binary.writeBigUInt64LE(BigInt(blob.length), at + 40);
      return binary;
    }
  }
  throw new Error("NODE_SEA section not found");
}

/** Locates the NODE_SEA blob inside a thin arm64 Mach-O executable. */
export function findMachOSeaSection(binary) {
  if (binary.readUInt32LE(0) !== 0xfeedfacf) throw new Error("Expected a 64-bit Mach-O executable");
  const commandCount = binary.readUInt32LE(16);
  let offset = 32;
  for (let index = 0; index < commandCount; index++) {
    const command = binary.readUInt32LE(offset);
    const size = binary.readUInt32LE(offset + 4);
    if (command === 0x19 && binary.toString("latin1", offset + 8, offset + 24).replace(/\0+$/, "") === "NODE_SEA") {
      const sections = binary.readUInt32LE(offset + 64);
      let sectionOffset = offset + 72;
      for (let section = 0; section < sections; section++, sectionOffset += 80) {
        if (binary.toString("latin1", sectionOffset, sectionOffset + 16).replace(/\0+$/, "") === "__NODE_SEA_BLOB") {
          return { offset: binary.readUInt32LE(sectionOffset + 48), size: Number(binary.readBigUInt64LE(sectionOffset + 40)) };
        }
      }
    }
    offset += size;
  }
  throw new Error("NODE_SEA section not found");
}
