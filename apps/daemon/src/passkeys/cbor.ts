// Minimal deterministic CBOR for WebAuthn attestation and COSE EC2 keys.
export type Cbor = number | string | Uint8Array | Map<Cbor, Cbor>;
function head(major: number, n: number): Buffer {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error('Invalid CBOR length.');
  if (n < 24) return Buffer.from([(major << 5) | n]);
  if (n < 256) return Buffer.from([(major << 5) | 24, n]);
  if (n < 65536) {
    const b = Buffer.alloc(3);
    b[0] = (major << 5) | 25;
    b.writeUInt16BE(n, 1);
    return b;
  }
  const b = Buffer.alloc(5);
  b[0] = (major << 5) | 26;
  b.writeUInt32BE(n, 1);
  return b;
}
export function cbor(value: Cbor): Buffer {
  if (typeof value === 'number')
    return value < 0 ? head(1, -1 - value) : head(0, value);
  if (typeof value === 'string') {
    const b = Buffer.from(value);
    return Buffer.concat([head(3, b.length), b]);
  }
  if (value instanceof Uint8Array)
    return Buffer.concat([head(2, value.length), value]);
  const entries = [...value]
    .map(([key, val]) => [cbor(key), cbor(val)] as const)
    .sort(([a], [b]) => a.length - b.length || Buffer.compare(a, b));
  return Buffer.concat([head(5, entries.length), ...entries.flat()]);
}
