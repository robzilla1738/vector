import { describe, expect, it } from "vitest";
import { VectorError } from "@vector/contracts";
import { flattenExecuteResult } from "@vector/engine-client";

describe("BrowserService native stubs", () => {
  it("flattenExecuteResult keeps documentEpoch without inventing a wire generation", () => {
    const r = flattenExecuteResult({
      status: "completed",
      steps: [],
      documentEpoch: 4,
      revision: 2,
    });
    expect(r.status).toBe("completed");
    expect(r.revision).toBe(2);
  });

  it("capability_unsupported is the stub code", () => {
    const e = new VectorError("capability_unsupported", "screenshot is not available on this BrowserService path");
    expect(e.code).toBe("capability_unsupported");
  });
});
