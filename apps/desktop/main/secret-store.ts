import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

interface Encryption {
  isEncryptionAvailable(): boolean;
  getSelectedStorageBackend?(): string;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

const HEADER = Buffer.from("aux-secret-v1\n");

/** Encryption is supplied by Electron in production, never by tests. */
export class SecretStore {
  constructor(private directory: string, private encryption: Encryption) {}

  private path(name: string): string {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(name)) throw new Error("Invalid credential name");
    return join(this.directory, name);
  }

  private requireEncryption() {
    if (!this.encryption.isEncryptionAvailable() || this.encryption.getSelectedStorageBackend?.() === "basic_text") {
      throw new Error("Secure credential storage is unavailable. Unlock your OS credential store or supply a key for this process through its environment.");
    }
  }

  read(name: string): string | undefined {
    const path = this.path(name);
    if (!existsSync(path)) return undefined;
    this.requireEncryption();
    const payload = readFileSync(path);
    if (!payload.subarray(0, HEADER.length).equals(HEADER)) {
      throw new Error("Legacy credential storage requires re-entry in Settings; the original file has been preserved.");
    }
    try { return this.encryption.decryptString(payload.subarray(HEADER.length)); }
    catch { throw new Error("Saved credential could not be decrypted. Unlock the OS credential store or re-enter the key in Settings."); }
  }

  write(name: string, value: string): void {
    const path = this.path(name);
    if (!value) {
      try { unlinkSync(path); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      return;
    }
    this.requireEncryption();
    let encrypted: Buffer;
    try { encrypted = this.encryption.encryptString(value); }
    catch { throw new Error("Credential encryption failed; the previous saved credential is unchanged."); }
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
      const fd = openSync(temporary, "wx", 0o600);
      try { writeFileSync(fd, Buffer.concat([HEADER, encrypted])); fsyncSync(fd); }
      finally { closeSync(fd); }
      renameSync(temporary, path);
    } finally { rmSync(temporary, { force: true }); }
  }
}
