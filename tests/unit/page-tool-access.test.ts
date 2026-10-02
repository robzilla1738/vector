import { expect, it } from "vitest";
import { pageToolTarget } from "../../apps/runtime/src/safety/page-tool-access.js";
import { TurnMentions } from "../../apps/runtime/src/agent/turn-mentions.js";

const snapshot = {
  pageId: "page",
  url: "https://page-tools.test/",
  documentEpoch: 1,
  sessionId: "attachment",
};
function readTurn() {
  const turn = new TurnMentions(() => snapshot);
  turn.begin("run", [{ kind: "tab", ...snapshot, title: "Page", access: "read" }], []);
  return turn;
}

it("a graph write or operation call cannot hide behind a read-only steps array", () => {
  const turn = readTurn();
  const readSteps = [{ id: "read", op: "extract", fields: [{ name: "text" }] }];
  const read = pageToolTarget("pages.execute", { program: { pageId: "page", steps: readSteps } });
  expect(read).toEqual({ pageId: "page", access: "read" });
  expect(turn.require("run", "page", read!.access)).toEqual({ status: "available" });
  for (const nodes of [
    [
      {
        kind: "forEach",
        items: [1],
        itemName: "item",
        body: [{ kind: "step", step: { id: "write", op: "click", target: "r1" } }],
      },
    ],
    [{ kind: "forEach", items: [], itemName: "item", body: [{ kind: "call", operation: "site/send" }] }],
  ]) {
    const target = pageToolTarget("pages.execute", { program: { pageId: "page", steps: readSteps, nodes } });
    expect(target).toEqual({ pageId: "page", access: "act" });
    expect(turn.require("run", "page", target!.access)).toMatchObject({ status: "unavailable" });
  }
});

it("read-only discovery grants no WebMCP or dialog action authority", () => {
  const turn = readTurn();
  expect(pageToolTarget("pages.webmcp", { pageId: "page", op: "tools" })).toEqual({
    pageId: "page",
    access: "read",
  });
  expect(pageToolTarget("pages.dialog", { pageId: "page", action: "list" })).toEqual({
    pageId: "page",
    access: "read",
  });
  for (const target of [
    pageToolTarget("pages.webmcp", { pageId: "page", op: "call", name: "send" }),
    pageToolTarget("pages.dialog", { pageId: "page", action: "accept" }),
  ])
    expect(turn.require("run", target!.pageId, target!.access)).toMatchObject({ status: "unavailable" });
  expect(() =>
    pageToolTarget("pages.webmcp", { pageId: "page", op: "call", name: "send", access: "read" }),
  ).toThrow();
});

it("response diagnostics and page captures remain bound to the exact mentioned page", () => {
  const turn = readTurn();
  for (const target of [
    pageToolTarget("responses.list", { pageId: "other" }),
    pageToolTarget("pages.capture", { pageId: "other" }),
  ]) {
    expect(target).toEqual({ pageId: "other", access: "read" });
    expect(turn.require("run", target!.pageId, target!.access)).toMatchObject({ status: "unavailable" });
  }
});

it("stored program dispatch cannot acquire action authority from a read mention", () => {
  const target = pageToolTarget("programs.run", { programId: "saved", pageId: "page" });
  expect(target).toEqual({ pageId: "page", access: "act" });
  expect(readTurn().require("run", target!.pageId, target!.access)).toMatchObject({ status: "unavailable" });
});
