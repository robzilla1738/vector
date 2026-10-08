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
  it("retains all identities when more than sixteen sources are mentioned", () => {
    let value = { text: "", tokens: [] } as ReturnType<typeof draft>;
    for (let index = 0; index < 30; index++) {
      const start = value.text.length;
      value = insertMention(
        { ...value, text: value.text + "@" },
        { start, end: start + 1, query: "" },
        `Source${index}`,
        ref,
      );
    }
    expect(mentionRefs(value)).toHaveLength(30);
  });
});
