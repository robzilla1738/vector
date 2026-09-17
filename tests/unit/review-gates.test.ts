import { describe, it, expect, vi } from "vitest";
import {
  authorizeProgram,
  attributeTodoMvc,
  compileAction,
  compileSkill,
  DurableWriteLedger,
  queryPage,
  rebindSteps,
  stepSignature,
  tryReuseSkill,
} from "@vector/runtime";
import type { ObservationContent, Step } from "@vector/contracts";

const obs = (opts?: { ref?: string; name?: string; url?: string }): ObservationContent =>
  ({
    title: "t",
    url: opts?.url ?? "https://app.test/form",
    headings: [],
    elements: [
      { ref: opts?.ref ?? "r9", role: "button", name: opts?.name ?? "Save", tag: "button" },
    ],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    text: "form",
    viewport: { width: 800, height: 600, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 },
    frames: [],
    truncated: false,
    stats: { elementsTotal: 1, elementsShown: 1, textChars: 4, approxTokens: 1 },
  }) as unknown as ObservationContent;

describe("Gate F page query and action compiler", () => {
  it("rebinds a recorded ref across a layout change", () => {
    const steps = [{ id: "c", op: "click", target: "r1" }] as Step[];
    const rebound = rebindSteps(steps, obs({ ref: "r9", name: "Save" }), [
      { role: "button", nameIncludes: "Save" },
    ]);
    expect(rebound[0]).toMatchObject({ op: "click", target: "r9" });
  });

  it("rejects a compiled write when the origin does not match", () => {
    const result = compileAction({
      pageId: "p1",
      documentEpoch: 2,
      steps: [{ id: "c", op: "click", target: "r1" }],
      observation: obs(),
      url: "https://other.test/",
      guards: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
    });
    expect("rejected" in result).toBe(true);
  });

  it("queryPage matches role and name on the live observation", () => {
    const hit = queryPage(obs({ name: "Checkout" }), { role: "button", nameIncludes: "Check" });
    expect(hit?.ref).toBe("r9");
  });
});

describe("Gate D permissions and durable writes", () => {
  it("denies a write when effect:write is not granted", () => {
    const auth = authorizeProgram([{ id: "c", op: "click", target: "r1" }], ["effect:read"]);
    expect(auth.ok).toBe(false);
    if (!auth.ok) expect(auth.effect).toBe("write");
  });

  it("does not dispatch a second write with the same idempotency key", () => {
    const ledger = new DurableWriteLedger();
    const signature = stepSignature([{ op: "click", target: "r1" }]);
    const first = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 3, signature });
    expect(first.duplicate).toBe(false);
    ledger.confirm(first.intent.id);
    const second = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 3, signature });
    expect(second.duplicate).toBe(true);
    expect(second.intent.status).toBe("confirmed");
  });

  it("does not reuse a skill on a different origin", () => {
    const skill = compileSkill({
      id: "save",
      goalPattern: "save",
      pageId: "p1",
      steps: [{ id: "c", op: "click", target: "r1" }],
      preconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
      postconditions: [{ exactOrigin: "https://app.test" }],
      evidence: "exact origin",
    });
    const skip = tryReuseSkill([skill], "save the form", obs({ url: "https://evil.test/" }), "https://evil.test/");
    expect("skipped" in skip).toBe(true);
  });
});

describe("Gate D fixture write counter", () => {
  it("lost response does not increment a fixture write counter twice", async () => {
    const http = await import("node:http");
    let writes = 0;
    const server = http.createServer((req, res) => {
      if (req.url === "/write" && req.method === "POST") {
        writes += 1;
        res.end("ok");
        return;
      }
      res.end(String(writes));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const origin = `http://127.0.0.1:${port}`;
    const ledger = new DurableWriteLedger();
    const signature = stepSignature([{ op: "click", target: "pay" }]);
    const first = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
    expect(first.duplicate).toBe(false);
    await fetch(`${origin}/write`, { method: "POST" });
    ledger.confirm(first.intent.id);
    const lost = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
    expect(lost.duplicate).toBe(true);
    if (!lost.duplicate) {
      await fetch(`${origin}/write`, { method: "POST" });
    }
    const counted = await (await fetch(`${origin}/count`)).text();
    server.close();
    expect(writes).toBe(1);
    expect(counted).toBe("1");
  });
});

describe("Gate E attribution", () => {
  it("splits a TodoMVC sample into named phases", () => {
    const sample = attributeTodoMvc({
      openMs: 12000,
      jsMs: 40000,
      settleMs: 8000,
      observeMs: 2000,
      totalMs: 64000,
    });
    expect(sample.label).toBe("speedometer.3.0.TodoMVC-JavaScript-ES5");
    expect(sample.accountedMs).toBe(62000);
    expect(sample.unaccountedMs).toBe(2000);
    expect(sample.phases.jsMs).toBe(40000);
    expect(sample.phases.parseMs + sample.phases.styleMs + sample.phases.layoutMs).toBe(12000);
  });
});

describe("skill compile does not freeze a document epoch", () => {
  it("reuses a read skill after the document epoch advances", () => {
    const skill = compileSkill({
      id: "read",
      goalPattern: "list",
      pageId: "p1",
      steps: [{ id: "e", op: "extract", fields: [{ name: "t", selector: "h1" }] }],
      preconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
      postconditions: [{ exactOrigin: "https://app.test" }],
      evidence: "epoch is checked at dispatch, not stored on the skill",
    });
    const later = tryReuseSkill([skill], "list rows", obs(), "https://app.test/form", 99);
    expect("skill" in later).toBe(true);
  });
});

describe("vitest import surface", () => {
  it("keeps vi available for coordinator tests", () => {
    expect(typeof vi.fn).toBe("function");
  });
});
