import { createHash, randomBytes } from "node:crypto";

/** Disposable Keychain stand-in; each Profile gets independent storage material. */
export function profileSecrets(profileId: string) {
  const values = new Map<string, string>();
  const name = (kind: string) =>
    `${kind}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const ensure = (kind: string) => {
    const key = name(kind);
    if (!values.has(key)) values.set(key, randomBytes(32).toString("base64"));
    return { value: values.get(key)! };
  };
  const native = {
    async readSecret(key: string) {
      return { value: values.get(key) };
    },
    async storeSecret(key: string, value: string) {
      values.set(key, value);
      return { ok: true as const };
    },
    async profileStorageRoot() {
      return ensure("aux_root_v1");
    },
    async profileStorageFactor() {
      return ensure("sqlite_factor_v1");
    },
  };
  return { native, values, name };
}
