// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { recentConversations } from "./conversations";
import type { Run } from "@aux/contracts";
afterEach(() => vi.restoreAllMocks());
const first: Run = { runId: "first", goal: "Find order", status: "completed", pageIds: ["page"], config: { chatId: "chat" }, createdAt: 1, result: { answer: "Order 123" } };
it("continues the same saved conversation while leaving context assembly to the runtime", async () => {
  const next = { ...first, runId: "second", goal: "Check order", createdAt: 2, status: "running" as const };
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(next as never);
  useStore.setState({ runs: [first], activePageId: "page", settings: { modelConfigured: true }, mode: "conversation", conversationId: "chat" });
  const run = await useStore.getState().startRun("Check order", { pageId: "page", scope: "page", chatId: "chat" });
  expect(run?.runId).toBe("second");
  expect(invoke).toHaveBeenCalledWith("runs.start", expect.objectContaining({ chatId: "chat", pageIds: ["page"] }));
  expect(invoke.mock.calls[0]?.[1]).not.toHaveProperty("context");
  useStore.getState().openConversation("second");
  useStore.getState().applyEvent({ seq: 1, type: "page.updated", ts: 3, payload: { activePageId: "page" } });
  expect(useStore.getState().mode).toBe("conversation");
  expect(recentConversations([first,next])).toHaveLength(1);
});
it("keeps legacy runs separate and never merges unrelated page history into an explicit chat", () => {
  expect(recentConversations([first, { ...first, runId: "legacy", config: undefined }])).toHaveLength(2);
});
it("passes selected browser tabs and their identities to the existing run API", async () => {
  const next = { ...first, runId: "multi", pageIds: ["page", "other"], status: "queued" as const };
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(next as never);
  useStore.setState({ runs: [], activePageId: "page", settings: { modelConfigured: true }, mode: "conversation", conversationId: "multi-chat" });
  const extra = { pageId: "other", url: "https://example.test/other", documentEpoch: 2 };
  await useStore.getState().startRun("Compare both", { chatId: "multi-chat", pageId: "page", pageIds: ["page", "other"], contextPageRefs: [extra], scope: "page" });
  expect(invoke).toHaveBeenCalledWith("runs.start", expect.objectContaining({ pageIds: ["page", "other"], contextPageRefs: [extra] }));
});
it("keeps unrelated drafts intact through setup failure and successful submission", async () => {
  useStore.setState({ runs: [first], settings: { modelConfigured: false }, agentDraft: "New chat draft", conversationDrafts: {}, railView: { kind: "run", runId: first.runId } });
  useStore.getState().setConversationDraft("other", "Other reply");
  await useStore.getState().startRun("Saved reply", { chatId: "chat", pageId: "page", scope: "page" });
  expect(useStore.getState().conversationDrafts).toEqual({ "chat:other": "Other reply", "chat:chat": "Saved reply" });
  expect(useStore.getState().agentDraft).toBe("New chat draft");
  expect(useStore.getState().railView).toEqual({ kind: "run", runId: first.runId });
  useStore.setState({ settings: { modelConfigured: true } });
  vi.spyOn(bridge, "invoke").mockResolvedValue({ ...first, runId: "reply" } as never);
  await useStore.getState().startRun("Saved reply", { chatId: "chat", pageId: "page", scope: "page" });
  expect(useStore.getState().agentDraft).toBe("New chat draft");
  useStore.getState().setConversationDraft("chat", "");
  expect(useStore.getState().conversationDrafts).toEqual({ "chat:other": "Other reply" });
});
it("keeps a new-chat draft on setup failure and clears it only after a successful start",async()=>{
  useStore.setState({runs:[],settings:{modelConfigured:false},conversationDrafts:{},agentDraft:"",railView:{kind:"home"}});useStore.getState().setAgentDraft("Fresh request");useStore.getState().setConversationContext(null,"page");
  expect(await useStore.getState().startRun("Fresh request",{chatId:"new-chat",pageId:"page",scope:"page"})).toBeNull();expect(useStore.getState().agentDraft).toBe("Fresh request");expect(useStore.getState().conversationContexts.new).toBe("page");
  useStore.setState({settings:{modelConfigured:true}});vi.spyOn(bridge,"invoke").mockResolvedValue({...first,runId:"fresh",config:{chatId:"new-chat"}} as never);
  expect((await useStore.getState().startRun("Fresh request",{chatId:"new-chat",pageId:"page",scope:"page"}))?.runId).toBe("fresh");expect(useStore.getState().agentDraft).toBe("");expect(useStore.getState().conversationDrafts.new).toBeUndefined();
});
it("retains a prepared conversation's identity and context during model setup", async () => {
  useStore.setState({ runs: [], settings: { modelConfigured: false }, conversationId: "prepared", agentDraft: "Unrelated new draft", conversationDrafts: { "chat:prepared": "Use my attachment" }, conversationContexts: { "chat:prepared": "none" }, railView: { kind: "home" } });
  expect(await useStore.getState().startRun("Use my attachment", { chatId: "prepared", scope: "new" })).toBeNull();
  expect(useStore.getState().conversationId).toBe("prepared");
  expect(useStore.getState().conversationDrafts["chat:prepared"]).toBe("Use my attachment");
  expect(useStore.getState().conversationContexts["chat:prepared"]).toBe("none");
  expect(useStore.getState().agentDraft).toBe("Unrelated new draft");
});
it("retries an interrupted turn through the guarded runtime path and stays in its conversation",async()=>{
  const interrupted={...first,status:"interrupted" as const,error:"Runtime stopped",endedAt:3};
  const retry={...first,runId:"retry",status:"queued" as const,config:{chatId:"chat",retryOfRunId:"first"},createdAt:4};
  const invoke=vi.spyOn(bridge,"invoke").mockResolvedValue(retry as never);
  useStore.setState({runs:[interrupted],mode:"conversation",conversationId:"chat",railView:{kind:"run",runId:"first"}});
  expect((await useStore.getState().retryRun("first"))?.runId).toBe("retry");
  expect(invoke).toHaveBeenCalledWith("runs.retry",{runId:"first"});
  expect(useStore.getState().conversationId).toBe("chat");
  expect(useStore.getState().railView).toEqual({kind:"run",runId:"retry"});
});
