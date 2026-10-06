import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";
import type { NativeBridge } from "../native.js";

type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret"> & {
  profileStorageRoot?: (args: { version: 1 }) => Promise<{ value: string }>;
};
type Envelope = { version: 2; wrappedKey: string; ciphertext: string };
const pendingRoots = new Map<string, Promise<string>>();

const base64 = (bytes: Buffer) => bytes.toString("base64");
const decode = (value: string, length?: number) => {
  const bytes = Buffer.from(value, "base64");
  if (base64(bytes) !== value || (length !== undefined && bytes.length !== length))
    throw new Error("Protected data is invalid.");
  return bytes;
};

function seal(key: Buffer, aad: Buffer, plain: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aad);
  return base64(Buffer.concat([iv, cipher.update(plain), cipher.final(), cipher.getAuthTag()]));
}

function open(key: Buffer, aad: Buffer, encoded: string) {
  const bytes = decode(encoded);
  if (bytes.length < 28) throw new Error("Protected data is incomplete.");
  const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
  decipher.setAAD(aad);
  decipher.setAuthTag(bytes.subarray(-16));
  return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]);
}

/** Profile root → domain-separated store KEK → disposable per-generation DEK. */
export class ProtectedStore {
  private readonly rootName: string;
  private rootPromise?: Promise<Buffer>;

  constructor(
    private readonly secrets: Secrets,
    private readonly profileId: string,
  ) {
    if (!profileId) throw new Error("Protected storage requires a Profile identity.");
    this.rootName = `aux_root_v1_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  }

  private async root(create: boolean): Promise<Buffer> {
    this.rootPromise ??= (async () => {
      let saved = (await this.secrets.readSecret(this.rootName)).value;
      if (!saved) {
        if (!create)
          throw new Error(
            "The Profile storage root is unavailable. Restore its OS credential or use reviewed recovery.",
          );
        if (!this.secrets.profileStorageRoot)
          throw new Error("Atomic Profile storage root creation is unavailable in this host.");
        let pending = pendingRoots.get(this.rootName);
        if (!pending) {
          pending = (async () => {
            const candidate = (await this.secrets.profileStorageRoot!({ version: 1 })).value;
            decode(candidate, 32);
            if ((await this.secrets.readSecret(this.rootName)).value !== candidate)
              throw new Error("The Profile storage root could not be confirmed.");
            return candidate;
          })();
          pendingRoots.set(this.rootName, pending);
        }
        try {
          saved = await pending;
        } finally {
          if (pendingRoots.get(this.rootName) === pending) pendingRoots.delete(this.rootName);
        }
      }
      return decode(saved, 32);
    })().catch((error) => {
      this.rootPromise = undefined;
      throw error;
    });
    return this.rootPromise;
  }

  /** A Keychain-only factor is retired when a generation is forgotten. */
  async generationKey(store: string, factor: Buffer, createRoot = false): Promise<Buffer> {
    if (!/^[a-z][a-z0-9-]{1,40}$/.test(store) || factor.length !== 32)
      throw new Error("Protected store domain or generation factor is invalid.");
    const root = await this.root(createRoot);
    const storeKey = Buffer.from(
      hkdfSync("sha256", root, Buffer.from(this.profileId), `aux/store/${store}/v1`, 32),
    );
    return Buffer.from(hkdfSync("sha256", storeKey, factor, "aux/generation/v1", 32));
  }

  seal(key: Buffer, store: string, record: string, plaintext: Buffer): string {
    if (key.length !== 32 || !record || !store) throw new Error("Protected record identity is invalid.");
    const aad = Buffer.from(`${this.profileId}\0${store}\0${record}\0v2`);
    const dataKey = randomBytes(32);
    const envelope: Envelope = {
      version: 2,
      wrappedKey: seal(key, Buffer.concat([aad, Buffer.from("\0key")]), dataKey),
      ciphertext: seal(dataKey, Buffer.concat([aad, Buffer.from("\0data")]), plaintext),
    };
    return JSON.stringify(envelope);
  }

  open(key: Buffer, store: string, record: string, encoded: string): Buffer {
    if (key.length !== 32 || !record || !store) throw new Error("Protected record identity is invalid.");
    const envelope = JSON.parse(encoded) as Partial<Envelope>;
    if (
      envelope.version !== 2 ||
      typeof envelope.wrappedKey !== "string" ||
      typeof envelope.ciphertext !== "string"
    )
      throw new Error("Protected record format is invalid.");
    const aad = Buffer.from(`${this.profileId}\0${store}\0${record}\0v2`);
    const dataKey = open(key, Buffer.concat([aad, Buffer.from("\0key")]), envelope.wrappedKey);
    if (dataKey.length !== 32) throw new Error("Protected data key is invalid.");
    return open(dataKey, Buffer.concat([aad, Buffer.from("\0data")]), envelope.ciphertext);
  }
}
