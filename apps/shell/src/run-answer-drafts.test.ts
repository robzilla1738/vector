import { afterEach, expect, it } from "vitest";
import {
  clearSubmittedRunAnswer,
  readRunAnswerDrafts,
  RUN_ANSWER_PREFIX,
  writeRunAnswerDraft,
} from "./run-answer-drafts";
const entries = new Map<string, string>();
const storage: Storage = {
  get length() {
    return entries.size;
  },
  key: (index) => [...entries.keys()][index] ?? null,
  getItem: (key) => entries.get(key) ?? null,
  setItem: (key, value) => {
    entries.set(key, value);
  },
  removeItem: (key) => {
    entries.delete(key);
  },
  clear: () => entries.clear(),
};
afterEach(() => storage.clear());
it("restores independent replies and rejects malformed persisted entries", () => {
  const draft = { question: "Which site?", text: "The public site", chatId: "chat-one" };
  writeRunAnswerDraft(storage, "one", draft);
  writeRunAnswerDraft(storage, "two", { question: "Which folder?", text: "Research" });
  storage.setItem(RUN_ANSWER_PREFIX + "invalid", "{broken");
  storage.setItem(
    RUN_ANSWER_PREFIX + "oversized",
    JSON.stringify({ question: "Q", text: "x".repeat(20001) }),
  );
  expect(readRunAnswerDrafts(storage)).toEqual({
    one: draft,
    two: { question: "Which folder?", text: "Research" },
  });
  writeRunAnswerDraft(null, "private", draft);
  expect(storage.getItem(RUN_ANSWER_PREFIX + "private")).toBeNull();
  expect(readRunAnswerDrafts(null)).toEqual({});
});
it("clears a submitted draft without deleting a newer cross-window edit", () => {
  const first = { question: "Where?", text: "First" },
    newer = { question: "Where?", text: "New answer" };
  writeRunAnswerDraft(storage, "run", first);
  writeRunAnswerDraft(storage, "run", newer);
  clearSubmittedRunAnswer(storage, "run", first);
  expect(readRunAnswerDrafts(storage).run).toEqual(newer);
  clearSubmittedRunAnswer(storage, "run", newer);
  expect(readRunAnswerDrafts(storage)).toEqual({});
});
