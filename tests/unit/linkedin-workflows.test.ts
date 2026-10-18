import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import type { Observation, PlanStep } from "@aux/contracts";
import {
  LinkedInToolInputSchema,
  type LinkedInWorkflowInput,
  type LinkedInWorkflowSource,
} from "@aux/contracts/linkedin";
import {
  linkedInSurface,
  prepareLinkedInWorkflow,
  readLinkedInInPage,
} from "../../apps/runtime/src/agent/linkedin-adapter.js";
import { LinkedInWorkflows } from "../../apps/runtime/src/agent/linkedin-workflows.js";

const url = "https://www.linkedin.com/in/alex/";
const message: LinkedInWorkflowInput = {
  operation: "draft-message",
  recipientUrl: url,
  text: "Hello Alex",
  scopeRef: "r100",
};
function fixture() {
  const observation: Observation = {
    observationId: "native-1",
    pageId: "page",
    profileId: "profile",
    documentEpoch: 2,
    revision: 3,
    observedAt: Date.now(),
    scope: "subtree",
    content: {
      url,
      title: "Message Alex",
      viewport: { width: 1000, height: 700, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      frames: [],
      text: "Alex\nHello Alex\nSend",
      headings: ["Alex"],
      elements: [
        { ref: "recipient", tag: "a", frame: "main", name: "Alex", href: url, selector: {} },
        {
          ref: "editor",
          tag: "textarea",
          frame: "main",
          role: "textbox",
          name: "Write a message",
          value: "Hello Alex",
          selector: {},
        },
        { ref: "send", tag: "button", frame: "main", role: "button", name: "Send", selector: {} },
      ],
      formFields: [{ ref: "editor", label: "Write a message", value: "Hello Alex" }],
      tables: [],
      links: [{ ref: "recipient", text: "Alex", href: url }],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 3, elementsShown: 3, textChars: 20, approxTokens: 5 },
    },
  };
  const source: LinkedInWorkflowSource = {
    authorityDigest: "a".repeat(64),
    runId: "run",
    profileId: "profile",
    workspaceId: "space",
    sessionId: "session",
    pageId: "page",
    url,
    documentEpoch: 2,
    observationId: "native-1",
    observationRevision: 3,
    task: { taskId: "task", revision: 4 },
  };
  return {
    source,
    observation,
    observedScopeRef: "r100",
    observedScopeRole: "dialog",
    unresolvedEffects: false,
  };
}
function plan(request = message, captured = fixture()) {
  return prepareLinkedInWorkflow({
    ...captured,
    observedScopeRef: request.scopeRef ? captured.observedScopeRef : undefined,
    request,
  });
}

describe("LinkedIn current DOM projection", () => {
  it("runs serialized without imports, reads rendered product content and never includes hidden/private URLs", () => {
    const dom = new JSDOM(
      `<nav><a href='/in/me/' aria-label='View your profile'>Me</a></nav><main><h1>Alex</h1><p>Engineer</p><p hidden>secret</p><input value='password'><textarea>draft</textarea><a href='/company/acme/'>Acme</a><a href='https://evil.test/in/person/'>Other</a><a href='/voyager/api/me'>Private</a></main>`,
      { url, runScripts: "outside-only" },
    );
    dom.window.Element.prototype.getClientRects = () =>
      [{ x: 0, y: 0, width: 1, height: 1 }] as unknown as unknown as DOMRectList;
    const result = (dom.window.eval(`(${readLinkedInInPage.toString()})`) as typeof readLinkedInInPage)({
      pageUrl: url,
    });
    expect(result).toMatchObject({
      ok: true,
      linkedin: {
        surface: "profile",
        headings: ["Alex"],
        serviceAccountProfileUrl: "https://www.linkedin.com/in/me/",
        links: [{ kind: "company", text: "Acme" }],
      },
    });
    if (!result.ok) throw new Error(result.reason);
    expect(result.text).toContain("Engineer");
    expect(result.text).not.toMatch(/secret|password|draft/);
    expect(result.linkedin.links).toHaveLength(1);
    expect(
      (dom.window.eval(`(${readLinkedInInPage.toString()})`) as typeof readLinkedInInPage)({
        pageUrl: `${url}?old`,
      }),
    ).toEqual({
      ok: false,
      reason: "document-changed",
    });
    dom.window.close();
  });
  it("recognizes actual research/inbox product routes and refuses lookalikes/auth/private routes", () => {
    for (const [path, kind] of [
      ["/in/alex/", "profile"],
      ["/company/acme/", "company"],
      ["/jobs/view/123/", "job"],
      ["/jobs/search/", "jobs"],
      ["/messaging/", "inbox"],
      ["/messaging/thread/abc/", "thread"],
      ["/mynetwork/invitation-manager/sent/", "invitations"],
    ])
      expect(linkedInSurface(`https://www.linkedin.com${path}`)).toBe(kind);
    for (const bad of [
      "https://linkedin.com.evil.test/in/alex/",
      "http://www.linkedin.com/in/alex/",
      "https://www.linkedin.com/checkpoint/",
      "https://www.linkedin.com/voyager/api/me",
      "https://user@www.linkedin.com/in/alex/",
    ])
      expect(() => linkedInSurface(bad)).toThrow();
  });
  it("bounds rendered evidence and marks actual truncation", () => {
    const dom = new JSDOM(`<main><p>${"long ".repeat(20_000)}</p></main>`, {
      url,
      runScripts: "outside-only",
    });
    dom.window.Element.prototype.getClientRects = () => [{}] as unknown as DOMRectList;
    const result = (dom.window.eval(`(${readLinkedInInPage.toString()})`) as typeof readLinkedInInPage)({
      pageUrl: url,
    });
    if (!result.ok) throw new Error(result.reason);
    expect(result.linkedin.truncated).toBe(true);
    expect(result.text.length).toBeLessThanOrEqual(80_000);
    dom.window.close();
  });
});

describe("LinkedIn plans contain evidence, never action authority", () => {
  it("binds exact observed recipient and draft before proposing a normal send", () => {
    expect(plan()).toMatchObject({
      state: "review",
      execution: "no-actions-dispatched",
      source: { profileId: "profile", task: { revision: 4 } },
      next: {
        effect: "external-message",
        recipientUrl: url,
        exactContent: "Hello Alex",
        steps: [{ op: "click", target: "send" }],
        receipt: "normal-governed-action-ledger",
      },
    });
    const captured = fixture();
    captured.observation.content.elements[1]!.value = "Old draft";
    expect(plan(message, captured)).toMatchObject({
      state: "compose",
      next: {
        effect: "draft",
        replacesExistingDraft: true,
        undo: "existing-draft-undo",
        steps: [{ op: "fill", target: "editor", value: "Hello Alex" }],
      },
    });
  });
  it("requires fresh matching Profile/document/observation identity and actual native subtree", () => {
    const captured = fixture();
    captured.source.documentEpoch++;
    expect(() => plan(message, captured)).toThrow(/observation changed/);
    expect(() => plan({ ...message, scopeRef: "r999" })).toThrow();
    const noProfile = fixture();
    delete noProfile.observation.profileId;
    expect(plan(message, noProfile)).toMatchObject({ state: "blocked" });
    const wrong = fixture();
    wrong.observation.content.links[0]!.href = "https://www.linkedin.com/in/other/";
    expect(plan(message, wrong)).toMatchObject({ state: "blocked" });
  });
  it("never blind-clicks Connect, infers missing draft values or substitutes disabled/ambiguous send controls", () => {
    const connect = fixture();
    connect.observation.scope = "full";
    connect.observedScopeRef = undefined!;
    connect.observation.content.elements = [
      { ref: "connect", tag: "button", role: "button", name: "Connect", frame: "main", selector: {} },
    ];
    expect(plan({ operation: "draft-invitation", recipientUrl: url, text: "Hello" }, connect)).toMatchObject({
      state: "blocked",
    });
    const missing = fixture();
    delete missing.observation.content.elements[1]!.value;
    missing.observation.content.formFields = [];
    expect(plan(message, missing)).toMatchObject({ state: "blocked" });
    const disabled = fixture();
    disabled.observation.content.elements[2]!.disabled = true;
    expect(plan(message, disabled).next).toBeUndefined();
    const ambiguous = fixture();
    ambiguous.observation.content.elements.push({
      ...ambiguous.observation.content.elements[2]!,
      ref: "other-send",
    });
    expect(plan(message, ambiguous).next).toBeUndefined();
  });
  it("supports inert invitation dialogs and preserves unknown effects as inspection only", () => {
    const captured = fixture();
    captured.observation.content.elements[1]!.name = "Invitation message";
    captured.observation.content.elements[2]!.name = "Send invitation";
    expect(plan({ ...message, operation: "draft-invitation" }, captured)).toMatchObject({
      next: { effect: "external-invitation" },
    });
    captured.unresolvedEffects = true;
    expect(plan(message, captured)).toMatchObject({ state: "inspect" });
    expect(plan({ operation: "research" })).toMatchObject({ state: "read" });
    expect(plan({ operation: "inbox" })).toMatchObject({
      next: { effect: "navigate", steps: [{ op: "navigate", url: "https://www.linkedin.com/messaging/" }] },
    });
    expect(() =>
      LinkedInToolInputSchema.parse({ action: "prepare", request: message, source: fixture().source }),
    ).toThrow();
  });
});

describe("LinkedIn sealed recipes use the same normal act callback once", () => {
  function harness() {
    let current = fixture(),
      now = 100;
    const act = vi.fn(async (_steps: PlanStep[], _actionId: string) => ({
      output: { status: "uncertain", intentId: "normal-ledger" },
    }));
    const checkOwner = vi.fn(() => {});
    const recipes = new LinkedInWorkflows({
      checkOwner,
      approval: () => undefined,
      undispatched: () => true,
      capture: async () => structuredClone(current),
      act,
      now: () => now,
    });
    const prepare = async () => {
      const result = await recipes.invoke({ action: "prepare", request: message }, "prepare-call");
      if (!("output" in result)) throw new Error("Unexpected park");
      return result.output as { recipeId: string };
    };
    return {
      recipes,
      act,
      checkOwner,
      prepare,
      current: () => current,
      replace: (value: typeof current) => {
        current = value;
      },
      expire: () => {
        now += 300_001;
      },
    };
  }
  it("re-observes and delegates current refs to the original executor, returning its receipt unchanged", async () => {
    const h = harness();
    const { recipeId } = await h.prepare();
    const current = h.current();
    current.observation.observationId = "fresh";
    current.source.observationId = "fresh";
    current.observation.revision++;
    current.source.observationRevision++;
    current.observation.content.elements[2]!.ref = "fresh-send";
    await expect(h.recipes.invoke({ action: "execute", recipeId }, "original-tool-call")).resolves.toEqual({
      output: { status: "uncertain", intentId: "normal-ledger" },
    });
    expect(h.act).toHaveBeenCalledExactlyOnceWith(
      [{ id: "linkedin-send-message", op: "click", target: "fresh-send" }],
      "original-tool-call",
      undefined,
      expect.objectContaining({
        kind: "linkedin",
        recipientUrl: url,
        exactContent: "Hello Alex",
        targetRef: "fresh-send",
      }),
      {},
    );
    await expect(h.recipes.invoke({ action: "execute", recipeId }, "retry")).rejects.toMatchObject({
      code: "ref_stale",
    });
  });
  it.each(["recipient", "draft", "Profile", "Space", "task", "epoch", "session", "unresolved"])(
    "rejects changed %s before dispatch",
    async (change) => {
      const h = harness();
      const { recipeId } = await h.prepare();
      const current = h.current();
      if (change === "recipient")
        current.observation.content.links[0]!.href = "https://www.linkedin.com/in/other/";
      if (change === "draft") current.observation.content.elements[1]!.value = "changed";
      if (change === "Profile") {
        current.observation.profileId = "new";
        current.source.profileId = "new";
      }
      if (change === "Space") current.source.workspaceId = "new";
      if (change === "task") current.source.task!.revision++;
      if (change === "epoch") {
        current.observation.documentEpoch++;
        current.source.documentEpoch++;
      }
      if (change === "session") current.source.sessionId = "new";
      if (change === "unresolved") current.unresolvedEffects = true;
      await expect(h.recipes.invoke({ action: "execute", recipeId }, "execute")).rejects.toMatchObject({
        code: "ref_stale",
      });
      expect(h.act).not.toHaveBeenCalled();
    },
  );
  it("does not replay across concurrent calls, expiry, closure or host restart", async () => {
    const h = harness();
    const { recipeId } = await h.prepare();
    const results = await Promise.allSettled([
      h.recipes.invoke({ action: "execute", recipeId }, "one"),
      h.recipes.invoke({ action: "execute", recipeId }, "two"),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(h.act).toHaveBeenCalledTimes(1);
    const expired = await h.prepare();
    h.expire();
    await expect(
      h.recipes.invoke({ action: "execute", recipeId: expired.recipeId }, "expired"),
    ).rejects.toMatchObject({ code: "ref_stale" });
    const fresh = await h.prepare();
    h.recipes.close();
    await expect(
      h.recipes.invoke({ action: "execute", recipeId: fresh.recipeId }, "closed"),
    ).rejects.toMatchObject({ code: "ref_stale" });
    await expect(
      harness().recipes.invoke({ action: "execute", recipeId: fresh.recipeId }, "resumed"),
    ).rejects.toMatchObject({ code: "ref_stale" });
  });
  it("honors Stop/Take over during fresh observation and consumes recipes on approval parking", async () => {
    const h = harness();
    const { recipeId } = await h.prepare();
    h.checkOwner.mockImplementation(() => {
      throw new Error("Take over");
    });
    await expect(h.recipes.invoke({ action: "execute", recipeId }, "stopped")).rejects.toThrow("Take over");
    expect(h.act).not.toHaveBeenCalled();
    const parked = harness();
    parked.act.mockResolvedValueOnce({
      park: { kind: "approval", instruction: "Review exact recipient/content" },
    } as never);
    const p = await parked.prepare();
    await expect(
      parked.recipes.invoke({ action: "execute", recipeId: p.recipeId }, "approval"),
    ).resolves.toMatchObject({ park: { kind: "approval" } });
    await expect(
      parked.recipes.invoke({ action: "execute", recipeId: p.recipeId }, "resume"),
    ).rejects.toMatchObject({ code: "ref_stale" });
  });
});

it("requires the real final dialog even when a generic subtree contains a matching recipient", () => {
  const captured = fixture();
  captured.observedScopeRole = "main";
  captured.observation.content.elements[1]!.name = "Invitation message";
  captured.observation.content.elements[2]!.name = "Send invitation";
  expect(plan({ ...message, operation: "draft-invitation" }, captured).next).toBeUndefined();
  captured.observedScopeRole = "dialog";
  captured.observation.content.elements = captured.observation.content.elements.filter(
    (element) => element.ref !== "editor",
  );
  captured.observation.content.elements[1]!.name = "Send without a note";
  expect(plan({ ...message, operation: "draft-invitation", text: undefined }, captured)).toMatchObject({
    next: { effect: "external-invitation", exactContent: "" },
  });
});
