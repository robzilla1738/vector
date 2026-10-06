import { describe, expect, it } from "vitest";
import { backspaceMention, editMentionDraft, insertMention, mentionQuery, mentionRefs } from "./tokens";
const ref = { kind: "tabs" as const };
const draft = () =>
  insertMention({ text: "read @Ta", tokens: [] }, { start: 5, end: 8, query: "Ta" }, "Tabs", ref);
describe("composer mention offsets", () => {
  it("recognizes a caret query without matching an email address", () => {
    expect(mentionQuery("mail a@b.test", 13)).toBeNull();
    expect(mentionQuery("read @Ta later", 8)).toEqual({ start: 5, end: 8, query: "Ta" });
  });
  it("moves offsets across edits before a token and drops edits inside it", () => {
    const shifted = editMentionDraft(draft(), "Please read @Tabs ");
    expect(shifted.tokens[0]).toMatchObject({ start: 12, end: 17 });
    expect(mentionRefs(shifted)).toEqual([ref]);
    expect(mentionRefs(editMentionDraft(shifted, "Please read @Tubs "))).toEqual([]);
    expect(editMentionDraft(draft(), "read @TaXbs ").tokens).toEqual([]);
  });
  it("backspace deletes the whole token and tracks following tokens", () => {
    const first = draft();
    const second = insertMention(
      { ...first, text: first.text + "@" },
      { start: 11, end: 12, query: "" },
      "Other",
      ref,
    );
    const deleted = backspaceMention(second, 11)!;
    expect(deleted.draft.text).toBe("read @Other ");
    expect(deleted.draft.tokens[0]).toMatchObject({ start: 5, end: 11 });
  });
  it("refuses a seventeenth mention without changing the draft", () => {
    const value = {
      text: "@",
      tokens: Array.from({ length: 16 }, (_, index) => ({ start: index, end: index + 1, text: "@", ref })),
    };
    expect(() => insertMention(value, { start: 0, end: 1, query: "" }, "Tabs", ref)).toThrow("16 sources");
    expect(value.text).toBe("@");
  });
});
