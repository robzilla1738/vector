import { describe, expect, it } from "vitest";
import { matchingRoute } from "../../apps/runtime/src/agent/loop/route.js";

describe("observed record route matching", () => {
  const base = "http://x.test/records";
  const links = ["/records/rec-01", "/records/rec-02", "/records/rec-03"];

  it("infers a unique same-origin sibling route", () => {
    expect(matchingRoute(base, links, "rec-14")).toBe("http://x.test/records/rec-14");
    expect(matchingRoute(base, links, "rec-02")).toBe("http://x.test/records/rec-02");
  });

  it("fails closed on weak, conflicting, or foreign evidence", () => {
    expect(matchingRoute(base, [links[0]!], "rec-14")).toBeUndefined();
    expect(matchingRoute(base, [...links, "/archive/rec-01", "/archive/rec-02"], "rec-14")).toBeUndefined();
    expect(matchingRoute(base, ["https://evil.test/records/rec-01", "https://evil.test/records/rec-02"], "rec-14")).toBeUndefined();
    expect(matchingRoute(base, links, "../secrets")).toBeUndefined();
  });
});
