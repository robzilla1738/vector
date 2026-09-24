import { describe, expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, RunCoordinator, verifyDoneAgainstObservation } from "@aux/runtime";
import type { ModelClient } from "@aux/runtime";
import type { Observation, PlanStep } from "@aux/contracts";

const obs = (text = "visible page heading"): Observation =>
  ({
    pageId: "p1",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "http://x.test/",
      title: "x",
      viewport: { width: 1, height: 1, scale: 1 },
      scroll: { y: 0, maxY: 0 },
      frames: [],
      text,
      headings: ["visible page heading"],
      elements: [{ ref: "r1", tag: "button", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

describe("verifyDoneAgainstObservation", () => {
  it("rejects long claims that are not on the page", () => {
    const v = verifyDoneAgainstObservation(
      { answer: "totally-fabricated-secret-xyz" },
      obs(),
      [],
    );
    expect(v.ok).toBe(false);
  });

  it("accepts grounded claims", () => {
    const v = verifyDoneAgainstObservation({ answer: "visible page heading" }, obs(), []);
    expect(v.ok).toBe(true);
  });

  it("accepts a formatted cited report only when its lines and links come from observed sources", () => {
    const report = "# Report\n- visible page heading. [Source](http://x.test/)";
    expect(verifyDoneAgainstObservation({report}, obs(), []).ok).toBe(true);
    expect(verifyDoneAgainstObservation({report:report.replace("visible page heading", "fabricated page heading")}, obs(), []).ok).toBe(false);
    expect(verifyDoneAgainstObservation({report:report.replace("http://x.test/", "http://elsewhere.test/")}, obs(), []).ok).toBe(false);
    const other={...obs("Beta detail"),pageId:"p2",content:{...obs("Beta detail").content,url:"http://beta.test/",headings:["Beta detail"]}};
    expect(verifyDoneAgainstObservation({report:report.replace("http://x.test/", "http://beta.test/")},[obs(),other],[]).ok).toBe(false);
    expect(verifyDoneAgainstObservation({report:"# Report\n[False claim](http://x.test/)"}, obs(), []).ok).toBe(false);
    expect(verifyDoneAgainstObservation({report:"# Report\n[Source](javascript:alert(1))"}, obs(), []).ok).toBe(false);
  });

  it("accepts a claim from the selected document excerpt actually included in the prompt", () => {
    const claim = { answer: "Option B has offline support" };
    expect(verifyDoneAgainstObservation(claim, obs(), []).ok).toBe(false);
    expect(verifyDoneAgainstObservation(claim, obs(), [], "LOCAL DOCUMENT SNAPSHOT: Option B has offline support").ok).toBe(true);
  });

  it("uses the exact selected verified report excerpt for a later turn", () => {
    const claim = {report:"# Report\nOption B has offline support."};
    expect(verifyDoneAgainstObservation(claim,obs(),[]).ok).toBe(false);
    expect(verifyDoneAgainstObservation(claim,obs(),[],undefined,"AUX-GENERATED ARTIFACT: Option B has offline support.").ok).toBe(true);
  });

  it("grounds a cited saved article only while its source evidence is supplied", () => {
    const claim = { report: "# Report\nThe harvest begins in October.\n[Source](https://example.test/harvest)" };
    expect(verifyDoneAgainstObservation(claim, obs(), []).ok).toBe(false);
    expect(verifyDoneAgainstObservation(claim, obs(), [], undefined, undefined,
      [{ url: "https://example.test/harvest", title: "Coffee harvest", text: "The harvest begins in October." }]).ok).toBe(true);
  });

  it("accepts a write only when observed or remoteConfirmed", () => {
    const click = {
      stepId: "c",
      op: "click",
      status: "ok" as const,
      startedAt: 1,
      durationMs: 1,
    };
    const bare = verifyDoneAgainstObservation({ note: "xyz" }, obs(), [click]);
    expect(bare).toMatchObject({ ok: false, reason: "write not observed or remoteConfirmed" });
    expect(verifyDoneAgainstObservation({ note: "visible page heading" }, obs(), [click])).toMatchObject({ ok: false, reason: "write not observed or remoteConfirmed" });
    const observed = verifyDoneAgainstObservation({ note: "xyz" }, obs(), [
      { ...click, receipt: { observed: "clicked", remoteConfirmed: false, uncertain: false, dispatchedBeforeTakeover: false } },
    ]);
    expect(observed).toMatchObject({ ok: true, reason: "writes-confirmed" });
    const remote = verifyDoneAgainstObservation({ note: "xyz" }, obs(), [
      { ...click, receipt: { remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false } },
    ]);
    expect(remote).toMatchObject({ ok: true, reason: "writes-confirmed" });
    expect(verifyDoneAgainstObservation({ note: "visible page heading" }, obs(), [
      { ...click, receipt: { observed: "first click", remoteConfirmed: false, uncertain: false, dispatchedBeforeTakeover: false } },
      { ...click, stepId: "other" },
    ])).toMatchObject({ ok: false, reason: "write not observed or remoteConfirmed" });
  });
});

it("saves a completed conversation report once and keeps a failed report out of saved results", () => {
  const repo = new Repo(openDb(":memory:"));
  const saved: string[] = [];
  const coordinator = new RunCoordinator({
    repo, events: new EventBus(repo), pages: {} as never,
    model: () => null, defaultModel: () => "m", recoveryModel: () => undefined,
    recordModelCall: () => {}, saveCompletedReport: (_run, markdown) => saved.push(markdown),
  });
  const seed = (runId: string) => repo.saveRun({runId, goal:"Write a report", status:"running", pageIds:["p1"], config:{chatId:"chat-1"}, createdAt:Date.now()});
  seed("run-1");
  coordinator.finish("run-1", "completed", {report:"# Verified report"});
  expect(repo.getRun("run-1")?.status).toBe("completed");
  expect(saved).toEqual(["# Verified report"]);
  seed("run-2");
  coordinator.finish("run-2", "failed", {report:"# Unsupported report"});
  expect(saved).toEqual(["# Verified report"]);
});

describe("lying model cannot complete a run", () => {
  it("finishes failed when done claims are ungrounded", async () => {
    const repo = new Repo(openDb(":memory:"));
    const events = new EventBus(repo);
    const model: ModelClient = {
      generateStructured: async (o) => ({
        object: o.schema.parse({ status: "done", message: "Done", result: { answer: "totally-fabricated-secret-xyz" } }),
        durationMs: 1,
      }),
      streamStructured: async (o) => {
        const text = '{"status":"done","message":"Done","result":{"answer":"totally-fabricated-secret-xyz"}}';
        o.onText?.(text);
        return { object: o.schema.parse(JSON.parse(text)), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const coordinator = new RunCoordinator({
      repo,
      events,
      pages: {
        observe: vi.fn(async () => obs()),
        execute: vi.fn(async (_program: { steps: PlanStep[] }) => ({ status: "completed", steps: [] })),
        capture: vi.fn(),
        livePageIds: () => ["p1"],
        get: () => ({ viewStatus: "visible" }),
      } as never,
      model: () => model,
      defaultModel: () => "m",
      recoveryModel: () => undefined,
      recordModelCall: () => {},
    });
    const run = await coordinator.start({ goal: "find the secret", pageIds: ["p1"] });
    for (let i = 0; i < 200 && !["completed", "failed"].includes(repo.getRun(run.runId)!.status); i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(repo.getRun(run.runId)!.status).toBe("failed");
  });
});

it("verifies a comparison against both pages actually observed in the run", async () => {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  let plans = 0;
  const model: ModelClient = {
    generateStructured: async request => ({
      object: request.schema.parse(++plans === 1
        ? { status: "continue", pageId: "p2", message: "Read the second source", steps: [] }
        : { status: "done", message: "Compared", result: { first: "Alpha evidence", second: "Beta evidence" } }),
      durationMs: 1,
    }),
    generateText: async () => ({ text: "", durationMs: 0 }),
    listModels: async () => [],
  };
  const coordinator = new RunCoordinator({
    repo, events,
    pages: {
      observe: async (pageId: string) => ({ ...obs(pageId === "p1" ? "Alpha evidence" : "Beta evidence"), pageId }),
      execute: vi.fn(), capture: vi.fn(), livePageIds: () => ["p1", "p2"],
      get: () => ({ viewStatus: "visible" }),
    } as never,
    model: () => model, defaultModel: () => "m", recoveryModel: () => undefined, recordModelCall: () => {},
  });
  const run = await coordinator.start({ goal: "Compare both pages", pageIds: ["p1", "p2"] });
  for (let i = 0; i < 200 && !["completed", "failed"].includes(repo.getRun(run.runId)!.status); i++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  expect(repo.getRun(run.runId)).toMatchObject({ status: "completed", result: { first: "Alpha evidence", second: "Beta evidence" } });
});

describe("successful click repeats still dispatch", () => {
  it("clicks Increment three times when each plan is one click", async () => {
    const repo = new Repo(openDb(":memory:"));
    const events = new EventBus(repo);
    let count = 0;
    const clicks: string[] = [];
    const model: ModelClient = {
      generateStructured: async (o) => {
        if (count < 3) {
          return {
            object: o.schema.parse({
              status: "continue",
              message: `Count ${count}`,
              steps: [{ id: `c${count + 1}`, op: "click", target: "r1" }],
            }),
            durationMs: 1,
          };
        }
        return {
          object: o.schema.parse({
            status: "done",
            message: "Counter shows 3",
            result: { counter: "3" },
          }),
          durationMs: 1,
        };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const coordinator = new RunCoordinator({
      repo,
      events,
      pages: {
        observe: async () => {
          const o = obs(`Count: ${count}`);
          o.revision = count + 1;
          return o;
        },
        execute: async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: { stepId: string; op: string; status: string; startedAt: number; durationMs: number }, s: PlanStep) => void }) => {
          const steps = [];
          for (const s of program.steps) {
            if (s.op === "click") {
              count += 1;
              clicks.push(s.id);
            }
            const outcome = { stepId: s.id, op: s.op, status: "ok" as const, startedAt: Date.now(), durationMs: 1,
              receipt: { observed: `Count ${count}`, remoteConfirmed: false, uncertain: false, dispatchedBeforeTakeover: false } };
            ctx?.onStep?.(outcome, s);
            steps.push(outcome);
          }
          return { status: "completed" as const, steps };
        },
        capture: async () => ({ dataUrl: "data:image/png;base64,AA", width: 1, height: 1, scale: 1 }),
        livePageIds: () => ["p1"],
        get: () => ({ viewStatus: "visible", documentEpoch: 1, url: "http://x.test/" }),
      } as never,
      model: () => model,
      defaultModel: () => "m",
      recoveryModel: () => undefined,
      recordModelCall: () => {},
      grants: ["effect:read", "effect:write", "effect:egress"],
    });
    const run = await coordinator.start({ goal: "Increment the counter until it shows 3", pageIds: ["p1"] });
    for (let i = 0; i < 400 && !["completed", "failed"].includes(repo.getRun(run.runId)!.status); i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    const finished = repo.getRun(run.runId)!;
    expect({ clicks, count, status: finished.status, message: finished.statusMessage }).toEqual({
      clicks: ["c1", "c2", "c3"],
      count: 3,
      status: "completed",
      message: finished.statusMessage,
    });
  });
});
