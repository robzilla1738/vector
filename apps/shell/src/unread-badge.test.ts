import { describe, expect, it } from "vitest";
import { unreadBadge } from "./unread-badge";

describe("provider unread titles", () => {
  it("recognizes inbox counts, trailing provider counts and Slack activity", () => {
    expect(unreadBadge("(3) Inbox")).toEqual({ text: "3", label: "3 unread" });
    expect(unreadBadge("Inbox (12) – Gmail")).toEqual({ text: "12", label: "12 unread" });
    expect(unreadBadge("* Slack")).toEqual({ text: "•", label: "Unread messages" });
    expect(unreadBadge("(100) Inbox")?.text).toBe("99+");
    expect(unreadBadge("(99+) Inbox")?.text).toBe("99+");
  });
  it("ignores zero and incidental numbers", () => {
    for (const title of ["(0) Inbox", "Project (3)", "3 Inbox", "*Slack", "Inbox"]) expect(unreadBadge(title)).toBeNull();
  });
});
