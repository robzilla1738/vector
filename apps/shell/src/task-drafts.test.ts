import { afterEach, expect, it } from "vitest";
import { readTaskDraft, readTaskSelection, rememberTask, taskDraftKey, writeTaskDraft } from "./task-drafts";

const original = globalThis.localStorage;
afterEach(() => {
  if (original) Object.defineProperty(globalThis, "localStorage", { configurable: true, value: original });
});

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

it("restores task drafts and the last selected task after a simulated restart", () => {
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const key = taskDraftKey("space-1", "task-9");
  writeTaskDraft(key, { title: "Compare vendors", objective: "Draft objective", criteria: "Table saved", baseRevision: 3 });
  rememberTask("space-1", "task-9");
  expect(readTaskDraft(key)).toEqual({ title: "Compare vendors", objective: "Draft objective", criteria: "Table saved", baseRevision: 3 });
  expect(readTaskSelection().tasks["space-1"]).toBe("task-9");
  writeTaskDraft(key, null);
  expect(readTaskDraft(key)).toBeNull();
});
