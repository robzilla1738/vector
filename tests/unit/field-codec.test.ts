import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import {
  FieldCodec,
  ENCRYPTED_FIELDS,
  initializeFieldCodec,
} from "../../apps/runtime/src/store/field-codec.js";
import { TranscriptStore } from "../../apps/runtime/src/agent/loop/transcript.js";
import { profileSecrets } from "../support/profile-secrets.js";

it("authenticates Profile, row and column, and refuses plaintext or tampering", async () => {
  const a = profileSecrets("a");
  const codec = await FieldCodec.create(a.native, "a", true);
  const sealed = codec.encrypt("runs", '["one"]', "goal", "private request");
  expect(sealed).not.toContain("private request");
  expect(codec.decrypt("runs", '["one"]', "goal", sealed)).toBe("private request");
  expect(() => codec.decrypt("runs", '["two"]', "goal", sealed)).toThrow();
  expect(() => codec.decrypt("runs", '["one"]', "result", sealed)).toThrow();
  expect(() => codec.decrypt("runs", '["one"]', "goal", "plaintext")).toThrow();
  const other = await FieldCodec.create(profileSecrets("b").native, "b", true);
  expect(() => other.decrypt("runs", '["one"]', "goal", sealed)).toThrow();
});

it("encrypts transcripts at write time and leaves general metadata in ordinary SQLite", async () => {
  const db = openDb(":memory:");
  try {
    const codec = await initializeFieldCodec(db, profileSecrets("p").native, "p");
    const repo = new Repo(db, codec);
    repo.setSetting("display", { text: "ordinary setting" });
    repo.saveRun({ runId: "r", goal: "private request", status: "running", pageIds: [], createdAt: 1 });
    const transcript = new TranscriptStore(db, codec);
    transcript.append("r", [{ role: "user", content: "private message" }]);
    const raw = db.prepare("SELECT message FROM run_transcript").get() as { message: string };
    expect(raw.message).not.toContain("private message");
    expect(transcript.load("r")).toEqual([{ role: "user", content: "private message" }]);
    expect(transcript.entries("r")[0]?.seq).toBe(0);
    expect(repo.getRun("r")?.goal).toBe("private request");
    expect(db.prepare("SELECT value FROM kv WHERE key='setting:display'").get()).toMatchObject({
      value: '{"text":"ordinary setting"}',
    });
    for (const [table, columns] of Object.entries(ENCRYPTED_FIELDS)) {
      const names = new Set(
        (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((item) => item.name),
      );
      expect(columns.every((column) => names.has(column))).toBe(true);
    }
    transcript.rewrite("r", [{ seq: 0, message: { role: "user", content: "edited" } }]);
    expect(transcript.load("r")[0]?.content).toBe("edited");
    transcript.truncateFrom("r", 0);
    expect(transcript.count("r")).toBe(0);
    expect(db.prepare("PRAGMA secure_delete").get()).toMatchObject({ secure_delete: 0 });
  } finally {
    db.close();
  }
});
