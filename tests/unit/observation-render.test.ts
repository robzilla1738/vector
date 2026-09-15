import { describe, it, expect } from "vitest";
import { compactObservation, renderObservation } from "@vector/runtime";
import { CompactObservationSchema, type Observation } from "@vector/contracts";

function sampleObservation(n = 40): Observation {
  const elements = Array.from({ length: n }, (_, i) => ({
    ref: `r${i + 1}`,
    frame: "main",
    tag: i % 3 === 0 ? "button" : "a",
    role: i % 3 === 0 ? "button" : "link",
    name: i % 3 === 0 ? `Save ${i}` : `Record ${i}`,
    href: i % 3 === 0 ? undefined : `/records/rec-${i}`,
    rect: { x: 10 * i, y: 20 * i, w: 120, h: 32 },
    selector: {
      role: { role: i % 3 === 0 ? "button" : "link", name: `x${i}` },
      css: `body > main > div:nth-of-type(${i + 1}) > ${i % 3 === 0 ? "button" : "a"}`,
      xpath: `/html/body/main/div[${i + 1}]/${i % 3 === 0 ? "button" : "a"}`,
    },
  }));
  return {
    observationId: "obs_1",
    pageId: "p_1",
    documentEpoch: 2,
    revision: 7,
    observedAt: 0,
    scope: "full",
    content: {
      url: "http://127.0.0.1:4810/records",
      title: "Records",
      viewport: { width: 1280, height: 720, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 900 },
      frames: [{ frame: "main", url: "http://127.0.0.1:4810/records", sameOrigin: true }],
      text: Array.from({ length: 30 }, (_, i) => `rec-${i} · Record ${i} · approved`).join("\n"),
      headings: ["Records"],
      elements,
      formFields: [{ ref: "r1", type: "select", label: "Status", value: "approved" }],
      tables: [{ ref: "t1", columns: ["id", "title"], rows: [["rec-1", "Record 1"]], totalRows: 30, truncated: true }],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: n, elementsShown: n, textChars: 600, approxTokens: 700 },
    },
    changesSince: ["+ Saved"],
  };
}

describe("compactObservation", () => {
  it("keeps identity/revision, renders text, lists refs without selectors or rects", () => {
    const obs = sampleObservation();
    const c = compactObservation(obs);
    expect(CompactObservationSchema.safeParse(c).success).toBe(true);
    expect(c).toMatchObject({ pageId: "p_1", url: obs.content.url, title: "Records", revision: 7, documentEpoch: 2 });
    expect(c.refs).toHaveLength(40);
    expect(c.refs[0]).toEqual({ ref: "r1", role: "button", name: "Save 0" });
    for (const r of c.refs) {
      expect(r).not.toHaveProperty("selector");
      expect(r).not.toHaveProperty("rect");
    }
    expect(c.text).toBe(renderObservation(obs));
    expect(c.text).toContain('r1 button "Save 0"');
    expect(c.text).toContain("changes since previous revision");
    expect(c.text).not.toContain("nth-of-type"); // no css paths leak into the model view
  });

  it("is far smaller than the full observation JSON", () => {
    const obs = sampleObservation(120);
    const full = JSON.stringify(obs).length;
    const c = compactObservation(obs);
    // the text (what the MCP tool emits) is the 5-10x win; the refs array is
    // a duplicate of the element lines and roughly a quarter of the object
    expect(c.text.length).toBeLessThan(full * 0.25);
    expect(JSON.stringify(c).length).toBeLessThan(full * 0.4);
  });

  it("collapses repetitive text lines in the rendered view", () => {
    const c = compactObservation(sampleObservation());
    expect(c.text).toMatch(/… \d+ more lines like this/);
  });
});
