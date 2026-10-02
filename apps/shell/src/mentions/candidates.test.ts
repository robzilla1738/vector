import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { mentionCandidates, mentionChipStatus } from "./candidates";
const page: PageTarget = {
  pageId: "a",
  targetId: "target",
  backend: "aux",
  url: "https://mentions.test/a",
  title: "Inbox",
  documentEpoch: 1,
  sessionId: "real-session",
  lastRevision: 0,
  viewStatus: "visible",
  lifecycle: "live",
  controller: "human",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
};
it("offers only actually attached tabs and separates explicit read from act authority", () => {
  const candidates = mentionCandidates({
    pages: [
      page,
      { ...page, pageId: "dormant", sessionId: undefined },
      { ...page, pageId: "closed", viewStatus: "detached" },
    ],
  });
  expect(candidates.map((candidate) => candidate.id)).toEqual(["tabs", "tab:a:read", "tab:a:act"]);
  expect(candidates[0]?.ref).toEqual({ kind: "tabs" });
  expect(candidates[1]?.ref).toMatchObject({ access: "read", sessionId: "real-session" });
  expect(candidates[2]?.ref).toMatchObject({ access: "act" });
});
it("ignores title churn while distinguishing Changed and Closed snapshot chips", () => {
  const ref = mentionCandidates({ pages: [page] })[1]!.ref;
  expect(mentionChipStatus(ref, [{ ...page, title: "(3) Inbox" }])).toBe("Available");
  expect(mentionChipStatus(ref, [{ ...page, documentEpoch: 2 }])).toBe("Changed");
  expect(mentionChipStatus(ref, [{ ...page, sessionId: "reattached" }])).toBe("Changed");
  expect(mentionChipStatus(ref, [])).toBe("Closed");
});
