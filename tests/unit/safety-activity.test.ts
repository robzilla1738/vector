import { afterEach, expect, it } from "vitest";
import { openDb } from "@aux/runtime";
import { listSafetyActivity } from "../../apps/runtime/src/services/safety-activity.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

it("pages equal-time decisions without duplicates and exposes only the current Profile's metadata", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const insert = db.prepare(`INSERT INTO safety_decisions(
    decision_id,at,profile_id,scope_kind,scope_id,actor,effect,category,action,
    origin,status,source,request_json,decision_json)
    VALUES(?,1000,?,'task','task-one','builtin_agent','write','input','fill',
      'https://example.test','allow','agent_policy',?,?)`);
  const ids = [1, 2, 3, 4].map((id) => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`);
  for (const [index, id] of ids.entries())
    insert.run(
      id,
      index === 3 ? "other-profile" : "profile-one",
      JSON.stringify({ runId: "run-one", pageText: "private page text", credential: "secret specimen" }),
      JSON.stringify({ status: "allow", privateData: "sensitive approval payload" }),
    );
  const first = listSafetyActivity(db, "profile-one", { limit: 2 });
  expect(first.entries.map((entry) => entry.decisionId)).toEqual([ids[2], ids[1]]);
  expect(first.nextCursor).toEqual({ at: 1000, decisionId: ids[1] });
  const second = listSafetyActivity(db, "profile-one", { limit: 2, cursor: first.nextCursor });
  expect(second.entries.map((entry) => entry.decisionId)).toEqual([ids[0]]);
  expect(second.nextCursor).toBeNull();
  expect(first.entries[0]).toMatchObject({ taskId: "task-one", runId: "run-one", guidance: null });
  const output = JSON.stringify([first, second]);
  for (const excluded of [ids[3], "private page text", "secret specimen", "sensitive approval payload"])
    expect(output).not.toContain(excluded);
});
