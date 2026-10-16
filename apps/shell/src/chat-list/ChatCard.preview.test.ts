// @vitest-environment jsdom
import { expect, it } from "vitest";
import type { ConversationSummary } from "@aux/contracts";
import { makeRun } from "../mock/fixtures";
import { previewText } from "./ChatCard";

it("previews real report completions while preserving an unsent draft and answer precedence", () => {
  const item: ConversationSummary = {
    chatId: "chat",
    title: "Question",
    archived: false,
    privateTask: false,
    createdAt: 1,
    updatedAt: 2,
    turnCount: 1,
    latestRun: makeRun({
      status: "completed",
      statusMessage: "Done",
      result: { report: "Actual completed report" },
    }),
  };
  expect(previewText(item)).toBe("Actual completed report");
  expect(previewText(item, "New unsent reply")).toBe("New unsent reply");
  item.latestRun.result = { answer: "Primary answer", report: "Report fallback" };
  expect(previewText(item)).toBe("Primary answer");
});
