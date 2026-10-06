import { describe, it, expect } from "vitest";
import { executeProgram, writeOutcome } from "@aux/runtime";
import type { DriverPage } from "@aux/chromium-driver";
import { AuxError, type Condition, type Program } from "@aux/contracts";

/** Minimal fake DriverPage — records calls, configurable failures. */
function fakePage(failOn: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const page: DriverPage = {
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    url: () => "http://x.test/",
    title: async () => "Fake",
    isAttached: () => true,
    navigate: async (url) => {
      calls.push(`navigate:${url}`);
      if (failOn.navigate) throw failOn.navigate;
    },
    back: async () => {
      calls.push("back");
    },
    forward: async () => {
      calls.push("forward");
    },
    reload: async () => {
      calls.push("reload");
    },
    stop: async () => {
      calls.push("stop");
    },
    click: async (t) => {
      calls.push(`click:${t}`);
      if (failOn.click) throw failOn.click;
    },
    dblclick: async (t) => {
      calls.push(`dblclick:${t}`);
    },
    hover: async (t) => {
      calls.push(`hover:${t}`);
    },
    fill: async (t, v) => {
      calls.push(`fill:${t}=${v}`);
      if (failOn.fill) throw failOn.fill;
    },
    typeText: async (t, v) => {
      calls.push(`type:${t}=${v}`);
    },
    press: async (k) => {
      calls.push(`press:${k}`);
    },
    check: async (t) => {
      calls.push(`check:${t}`);
    },
    uncheck: async (t) => {
      calls.push(`uncheck:${t}`);
    },
    select: async (t, v) => {
      calls.push(`select:${t}=${v}`);
      if (failOn.select) throw failOn.select;
    },
    scroll: async (o) => {
      calls.push(`scroll:${o.direction}`);
    },
    dragTo: async (t, to) => {
      calls.push(`drag:${t}->${to}`);
    },
    clickPoint: async (x, y) => {
      calls.push(`clickPoint:${x},${y}`);
    },
    uploadFiles: async (t, f) => {
      calls.push(`upload:${t}:${f.length}`);
    },
    waitFor: async (c: Condition) => {
      calls.push(`waitFor:${c.kind}`);
      if (failOn.waitFor) return { ok: false, timedOut: true, detail: "never happened" };
      return { ok: true, timedOut: false };
    },
    waitForDownload: async () => ({ suggestedFilename: "f.txt", path: "/tmp/f.txt" }),
    collectScroll: async (o) => {
      calls.push(`collectScroll:${o.item}`);
      return { items: [{ text: "row-1" }, { text: "row-2" }], collected: 2 };
    },
    handleDialog: async (a) => {
      calls.push(`dialog:${a}`);
    },
    screenshot: async () => ({ buffer: Buffer.from("png"), width: 100, height: 50, scale: 1 }),
    observe: async () => ({}) as never,
    expandRef: async () => [],
    extract: async (fields) => {
      calls.push(`extract:${fields.length}`);
      if (failOn.extract) throw failOn.extract;
      return Object.fromEntries(fields.map((f) => [f.name, `v-${f.name}`]));
    },
    evaluate: async (e) => {
      calls.push(`eval:${e}`);
      return 42;
    },
    setEvents: () => {},
    dispose: async () => {},
  };
  return { page, calls };
}

describe("executeProgram", () => {
  it("uses only the explicitly readmitted real driver after native navigation", async () => {
    const old = fakePage(),
      next = fakePage();
    const result = await executeProgram(
      old.page,
      {
        pageId: "p1",
        steps: [
          { id: "nav", op: "navigate", url: "https://next.test/" },
          { id: "click", op: "click", target: "r1" },
        ],
      },
      {
        navigateAndReadmit: async () => {
          old.page.isAttached = () => false;
          return next.page;
        },
      },
    );
    expect(result.status).toBe("completed");
    expect(old.calls).toEqual([]);
    expect(next.calls).toEqual(["click:r1"]);
  });

  it.each(["same", "foreign", "detached"])(
    "refuses %s navigation readmission without retrying a dispatched command",
    async (kind) => {
      const old = fakePage(),
        next = fakePage();
      if (kind === "foreign") next.page.identity.pageId = "foreign";
      if (kind === "detached") next.page.isAttached = () => false;
      let starts = 0;
      const result = await executeProgram(
        old.page,
        {
          pageId: "p1",
          steps: [
            { id: "nav", op: "navigate", url: "https://next.test/" },
            { id: "click", op: "click", target: "r1" },
          ],
        },
        {
          navigateAndReadmit: async () => {
            starts++;
            return kind === "same" ? old.page : next.page;
          },
        },
      );
      expect(result.status).toBe("failed");
      expect(result.steps[0]?.error?.code).toBe("ref_stale");
      expect(starts).toBe(1);
      expect(old.calls).toEqual([]);
      expect(next.calls).toEqual([]);
    },
  );

  it.each(["fill", "type"] as const)("rejects %s on a select before input dispatch", async (op) => {
    const { page, calls } = fakePage();
    page.fieldState = async () => ({ selected: "archived" });
    const result = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "status", op, target: "r9", value: "approved" }],
    });
    expect(result.status).toBe("failed");
    expect(result.steps[0]).toMatchObject({
      error: { code: "invalid_params", message: "step status: use select for a select control" },
    });
    expect(result.steps[0]?.receipt).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it("records setter before/after state when a driver exposes a numeric document epoch", async () => {
    const { page, calls } = fakePage();
    let reads = 0;
    Object.assign(page, {
      documentEpoch: 7,
      fieldState: async () => ({ value: ++reads === 1 ? "All statuses" : "approved" }),
    });
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "s1", op: "select", target: "r4", value: "approved" }],
    });
    expect(res.status).toBe("completed");
    expect(calls).toContain("select:r4=approved");
    expect(res.steps[0]).toMatchObject({
      before: { value: "All statuses" },
      after: { value: "approved" },
      effect: "observed",
      receipt: {
        uncertain: false,
        observed: "control value changed after action",
        identity: { documentEpoch: 7 },
      },
    });
  });

  it("confirms a click from synchronous navigation without claiming remote state", async () => {
    const { page } = fakePage();
    let url = "http://x.test/records";
    page.url = () => url;
    page.click = async () => {
      url = "http://x.test/records?status=approved";
    };
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "apply", op: "click", target: "r5" }],
    });
    expect(res.status).toBe("completed");
    expect(res.steps[0]).toMatchObject({
      effect: "observed",
      receipt: { uncertain: false, observed: "page URL changed after action", remoteConfirmed: false },
    });
    expect(writeOutcome(res).outcome).toBe("confirmed");
  });

  it("preserves navigation proof when a post-save visibility condition fails", async () => {
    const { page } = fakePage({ waitFor: true });
    let url = "http://x.test/records/rec-04";
    page.url = () => url;
    page.click = async () => {
      url += "?saved=1";
    };
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "save", op: "click", target: "r11", expect: [{ kind: "textVisible", text: "Save record" }] },
      ],
    });
    expect(res.status).toBe("failed");
    expect(res.steps[0]).toMatchObject({
      status: "failed",
      error: { code: "condition_timeout" },
      effect: "observed",
      receipt: { observed: "page URL changed after action", uncertain: false, remoteConfirmed: false },
    });
    expect(writeOutcome(res).outcome).toBe("confirmed");
  });

  it("denies uploads outside session, attachment, and workspace roots", async () => {
    const { page, calls } = fakePage();
    const upload = (files: string[], uploadRoots?: string[]) =>
      executeProgram(
        page,
        { pageId: "p1", steps: [{ id: "u1", op: "upload", target: "r1", files }] },
        { uploadRoots },
      );
    for (const [files, roots] of [
      [["/etc/passwd"], ["/tmp/aux-session"]],
      [["/tmp/aux-session/../secrets.txt"], ["/tmp/aux-session"]],
      [["/tmp/aux-session/note.txt"], undefined],
    ] as [string[], string[] | undefined][]) {
      const res = await upload(files, roots);
      expect(res.status).toBe("failed");
      expect(res.steps[0]?.error?.code).toBe("permission_denied");
    }
    expect(calls).toHaveLength(0);
    const res = await upload(
      ["/tmp/aux-session/note.txt", "/tmp/aux-session/deep/file.pdf"],
      ["/tmp/aux-session"],
    );
    expect(res.status).toBe("completed");
    expect(calls).toEqual(["upload:r1:2"]);
  });

  it("runs steps in order and reports outcomes", async () => {
    const { page, calls } = fakePage();
    const program: Program = {
      pageId: "p1",
      steps: [
        { id: "s1", op: "navigate", url: "http://x.test/a" },
        { id: "s2", op: "click", target: "r1" },
        { id: "s3", op: "extract", fields: [{ name: "title" }], as: "data" },
      ],
    };
    const res = await executeProgram(page, program);
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["ok", "ok", "ok"]);
    expect(res.extracted?.data).toEqual({ title: "v-title" });
    expect(calls).toEqual(["navigate:http://x.test/a", "click:r1", "extract:1"]);
    expect(res.steps[1]?.receipt?.uncertain).toBe(true);
    expect(res.steps[1]?.receipt?.remoteConfirmed).toBe(false);
    expect(res.steps[0]?.receipt?.uncertain).toBe(true);
  });

  it("stops on failure unless step is optional", async () => {
    const { page } = fakePage({ click: new AuxError("step_failed", "nope") });
    const program: Program = {
      pageId: "p1",
      steps: [
        { id: "s1", op: "click", target: "r1" },
        { id: "s2", op: "reload" },
      ],
    };
    const res = await executeProgram(page, program);
    expect(res.status).toBe("failed");
    expect(res.steps).toHaveLength(1); // s2 never ran
    expect(res.steps[0]?.error?.code).toBe("step_failed");
  });

  it("continues past optional failures", async () => {
    const { page } = fakePage({ click: new Error("flaky") });
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "s1", op: "click", target: "r1", optional: true },
        { id: "s2", op: "reload" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["failed", "ok"]);
  });

  it("verifies expect conditions after the step", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        {
          id: "s1",
          op: "click",
          target: "r1",
          expect: [{ kind: "selector", selector: "#ok", state: "visible" }],
        },
      ],
    });
    expect(res.status).toBe("completed");
    expect(calls).toEqual(["click:r1", "waitFor:selector"]);
  });

  it("fails the step when an expect condition times out", async () => {
    const { page } = fakePage({ waitFor: true });
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "s1", op: "click", target: "r1", expect: [{ kind: "textVisible", text: "Saved" }] }],
    });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.error?.code).toBe("condition_timeout");
  });

  it("rejects mismatched pageId and duplicate step ids", async () => {
    const { page } = fakePage();
    await expect(
      executeProgram(page, { pageId: "other", steps: [{ id: "a", op: "reload" }] }),
    ).rejects.toMatchObject({ code: "invalid_params" });
    await expect(
      executeProgram(page, {
        pageId: "p1",
        steps: [
          { id: "a", op: "reload" },
          { id: "a", op: "stop" },
        ],
      }),
    ).rejects.toMatchObject({ code: "invalid_params" });
  });

  it("expectDownload arms the waiter across the trigger step", async () => {
    const { page, calls } = fakePage();
    const order: string[] = [];
    // download resolves only AFTER the click runs — prove the waiter was armed first
    page.waitForDownload = async () => {
      order.push("wait-armed");
      await new Promise((r) => setTimeout(r, 5));
      if (!order.includes("click")) throw new AuxError("condition_timeout", "waiter armed before trigger");
      order.push("download-resolved");
      return { suggestedFilename: "f.txt", path: "/tmp/f.txt" };
    };
    const origClick = page.click;
    page.click = async (t, b, to) => {
      order.push("click");
      return origClick(t, b, to);
    };
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "d0", op: "expectDownload", timeoutMs: 2000 },
        { id: "c1", op: "click", target: "r8" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(order).toEqual(["wait-armed", "click", "download-resolved"]);
    const dl = res.steps.find((s) => s.op === "expectDownload");
    expect(dl?.status).toBe("ok");
    expect(dl?.extracted?.downloaded).toBe("f.txt");
    const click = res.steps.find((s) => s.op === "click");
    expect(click?.receipt).toMatchObject({
      uncertain: false,
      observed: "downloaded f.txt",
      remoteConfirmed: false,
    });
    expect(click?.effect).toBe("observed");
    expect(writeOutcome(res).outcome).toBe("confirmed");
    expect(calls).toContain("click:r8");
  });

  it("keeps a trigger uncertain when its paired download waiter fails", async () => {
    const { page } = fakePage();
    page.waitForDownload = async () => {
      throw new AuxError("condition_timeout", "no download");
    };
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "d0", op: "expectDownload", timeoutMs: 10 },
        { id: "c1", op: "click", target: "r8" },
      ],
    });
    expect(res.status).toBe("failed");
    expect(res.steps.find((s) => s.op === "click")?.receipt?.uncertain).toBe(true);
    expect(writeOutcome(res).outcome).toBe("uncertain");
  });

  it("cancels the download waiter when the trigger is denied", async () => {
    const { page } = fakePage({
      click: new AuxError("permission_denied", "permission denied for click (effect:write)"),
    });
    let cancelled = false;
    page.waitForDownload = (_timeout, signal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener(
          "abort",
          () => {
            cancelled = true;
            reject(new AuxError("conflict", "Download wait was cancelled"));
          },
          { once: true },
        );
      });
    const result = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "download", op: "expectDownload" },
        { id: "denied-trigger", op: "click", target: "r8" },
      ],
    });
    expect(result.status).toBe("failed");
    expect(result.steps.map((step) => step.op)).toEqual(["click"]);
    expect(cancelled).toBe(true);
  });

  it("expectDownload as the last step fails with a clear error", async () => {
    const { page } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "d0", op: "expectDownload", timeoutMs: 100 }],
    });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.error?.code).toBe("invalid_params");
  });

  it("collectScroll returns deduped items as extracted values", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "c1", op: "collectScroll", item: ".row", key: "data-id", limit: 50, as: "rows" }],
    });
    expect(res.status).toBe("completed");
    expect(calls).toContain("collectScroll:.row");
    const detail = res.steps[0]?.extracted as { items: { text: string }[]; count: number };
    expect(detail.items).toHaveLength(2);
    expect(detail.count).toBe(2);
    const all = res.extracted?.rows as { items: { text: string }[]; count: number };
    expect(all.items).toHaveLength(2);
  });

  it("marks remaining steps skipped after abort", async () => {
    const { page } = fakePage();
    const ctl = new AbortController();
    ctl.abort();
    const res = await executeProgram(
      page,
      {
        pageId: "p1",
        steps: [
          { id: "a", op: "reload" },
          { id: "b", op: "stop" },
        ],
      },
      { signal: ctl.signal },
    );
    expect(res.status).toBe("cancelled");
    expect(res.steps.every((s) => s.status === "skipped")).toBe(true);
  });
});
