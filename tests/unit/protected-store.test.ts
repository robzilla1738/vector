import { createHash, randomBytes } from "node:crypto";
import { expect, it } from "vitest";
import { ProtectedStore } from "../../apps/runtime/src/services/protected-store.js";

it("requires the Profile root and binds envelopes to store, record and generation", async () => {
  const saved = new Map<string, string>();
  const secrets = {
    async readSecret(name: string) { return { value: saved.get(name) }; },
    async storeSecret(name: string, value: string) { if (value) saved.set(name, value); else saved.delete(name); return { ok: true as const }; },
    async profileStorageRoot() {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
  };
  const profile = new ProtectedStore(secrets, "profile-one");
  const factor = randomBytes(32);
  await expect(profile.generationKey("space-memory", factor)).rejects.toThrow(/root is unavailable/);
  const key = await profile.generationKey("space-memory", factor, true);
  const ciphertext = profile.seal(key, "space-memory", "space-1/claims", Buffer.from("private fixture"));
  expect(ciphertext).not.toContain("private fixture");
  expect(profile.open(key, "space-memory", "space-1/claims", ciphertext).toString()).toBe("private fixture");
  expect(() => profile.open(key, "space-memory", "space-2/claims", ciphertext)).toThrow();
  const otherGeneration = await profile.generationKey("space-memory", randomBytes(32));
  expect(() => profile.open(otherGeneration, "space-memory", "space-1/claims", ciphertext)).toThrow();
  const otherStore = await profile.generationKey("page-memory", factor);
  expect(() => profile.open(otherStore, "space-memory", "space-1/claims", ciphertext)).toThrow();
  const otherProfile = new ProtectedStore(secrets, "profile-two");
  await expect(otherProfile.generationKey("space-memory", factor)).rejects.toThrow(/root is unavailable/);
});

it("creates one root when independent stores initialize the same Profile together", async () => {
  const saved = new Map<string, string>();
  let rootWrites = 0;
  const secrets = {
    async readSecret(name: string) { return { value: saved.get(name) }; },
    async storeSecret(name: string, value: string) {
      if (name.startsWith("aux_root_v1_")) rootWrites++;
      saved.set(name, value);
      return { ok: true as const };
    },
    async profileStorageRoot() {
      rootWrites++;
      const name = `aux_root_v1_${createHash("sha256").update("shared-profile").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
  };
  const factor = randomBytes(32);
  const [memory, page] = await Promise.all([
    new ProtectedStore(secrets, "shared-profile").generationKey("space-memory", factor, true),
    new ProtectedStore(secrets, "shared-profile").generationKey("page-memory", factor, true),
  ]);
  expect(rootWrites).toBe(1);
  expect(memory).not.toEqual(page);
});
