import { expect, it, vi } from "vitest";
import { openDb } from "@aux/runtime/database";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

it("starts and restarts without scanning stored content and refuses a missing key", async () => {
  const db = openDb(":memory:");
  const fixture = profileSecrets("p");
  try {
    const prepare = vi.spyOn(db, "prepare");
    await initializeFieldCodec(db, fixture.native, "p");
    expect(prepare.mock.calls.every(([sql]) => sql.includes("aux_meta"))).toBe(true);
    prepare.mockClear();
    await initializeFieldCodec(db, fixture.native, "p");
    expect(prepare.mock.calls).toHaveLength(1);
    fixture.values.delete(fixture.name("sqlite_factor_v1"));
    await expect(initializeFieldCodec(db, fixture.native, "p")).rejects.toThrow(/factor is missing/);
    expect(fixture.values.has(fixture.name("sqlite_factor_v1"))).toBe(false);
  } finally {
    vi.restoreAllMocks();
    db.close();
  }
});
