import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { conversationsMethods } from "../../apps/runtime/dist/api/methods/conversations.js";
import type { MethodCtx } from "../../apps/runtime/dist/api/methods/context.js";
import { MethodSchemas, type MethodResult } from "@aux/contracts";

it("finds old saved messages across 300 turns, preserves exact cursors, yields and cancels replaced scans", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    for (let index = 0; index < 300; index++)
      repo.saveRun({
        runId: `run-${String(index).padStart(3, "0")}`,
        goal: `Question ${index}`,
        status: "completed",
        pageIds: [],
        createdAt: Math.floor(index / 2),
        result: {
          answer:
            index === 5
              ? "quartz **harvest** then [quartz harvest](https://example.com/hidden-link) again"
              : "An ordinary answer",
        },
        config: { chatId: "chat", context: "Hidden source-only quartz secret" },
      });
    repo.saveRun({
      ...repo.getRun("run-006")!,
      result: {
        answer:
          "A note.[^n]\n\n<div>Hidden HTML</div>\n\n![Chart caption](https://example.com/image.png)\n\n[^n]: A visible footnote.",
      },
    });
    repo.insertRunMessage({
      messageId: "steer",
      chatId: "chat",
      targetRunId: "run-005",
      deliveryRunId: "unused",
      mode: "steer",
      status: "delivered",
      text: "Clarify the quartz harvest",
      pageIds: [],
      contextPageRefs: [],
      mentions: [],
      expectedRevision: 0,
      createdAt: 4,
      updatedAt: 4,
    });
    repo.insertRunMessage({
      ...repo.getRunMessage("steer")!,
      messageId: "pending",
      deliveryRunId: "pending-delivery",
      targetRunId: "run-299",
      status: "accepted",
      text: "Unsent request",
    });
    expect(repo.visibleRunMessages("chat", ["run-299"]).map((message) => message.messageId)).toEqual([
      "pending",
    ]);
    expect(repo.visibleRunMessages("chat", ["run-005"]).map((message) => message.messageId)).toEqual([
      "pending",
      "steer",
    ]);
    const search = (params: unknown) =>
      conversationsMethods["conversations.search"]!({
        params: MethodSchemas["conversations.search"].parse(params),
        client: { external: false, nativeTurnContext: "window" },
        s: { repo },
      } as unknown as MethodCtx) as Promise<MethodResult<"conversations.search">>;
    const first = await search({ chatId: "chat", query: "quartz harvest" });
    expect(first).toMatchObject({
      matches: 3,
      activeMatch: 1,
      match: { runId: "run-005", part: "steer:steer", offset: 12 },
    });
    const cursor = (result: typeof first) => ({
      runId: result.match!.runId,
      part: result.match!.part,
      offset: result.match!.offset,
    });
    const second = await search({
      chatId: "chat",
      query: "quartz harvest",
      cursor: cursor(first),
      direction: "next",
    });
    const third = await search({
      chatId: "chat",
      query: "quartz harvest",
      cursor: cursor(second),
      direction: "next",
    });
    expect(second).toMatchObject({ activeMatch: 2, match: { part: "reply", offset: 0, occurrence: 0 } });
    expect(third).toMatchObject({ activeMatch: 3, match: { part: "reply", offset: 20, occurrence: 1 } });
    expect(
      await search({ chatId: "chat", query: "quartz harvest", cursor: cursor(first), direction: "previous" }),
    ).toEqual(third);
    expect(await search({ chatId: "chat", query: "quartz secret" })).toMatchObject({
      matches: 0,
      match: null,
    });
    expect(await search({ chatId: "chat", query: "hidden-link" })).toMatchObject({ matches: 0 });
    expect(await search({ chatId: "chat", query: "Hidden HTML" })).toMatchObject({ matches: 0 });
    expect(await search({ chatId: "chat", query: "Image: Chart caption" })).toMatchObject({ matches: 1 });
    expect(await search({ chatId: "chat", query: "visible footnote" })).toMatchObject({ matches: 1 });
    const old = search({ chatId: "chat", query: "ordinary" });
    const rejected = expect(old).rejects.toMatchObject({ name: "AbortError" });
    const fresh = search({ chatId: "chat", query: "quartz harvest" });
    await rejected;
    expect(await fresh).toEqual(first);
    const window = repo.conversationTurnWindow("chat", "run-150");
    expect(window.runs).toHaveLength(49);
    expect(window.runs[24]?.runId).toBe("run-150");
    expect(window).toMatchObject({ earlierRunId: "run-125", laterRunId: "run-175" });
    expect(() => repo.conversationTurnWindow("another-chat", "run-150")).toThrow(
      "no longer in the conversation",
    );
  } finally {
    repo.close();
  }
});
