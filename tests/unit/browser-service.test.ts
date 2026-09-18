import { describe, it, expect } from "vitest";
import { browserServiceAddr } from "../../packages/browser-driver/src/browser-service.ts";

describe("Finding 1 browser service client", () => {
  it("reads VECTOR_BROWSER_SERVICE and ignores empty", () => {
    expect(browserServiceAddr({} as NodeJS.ProcessEnv)).toBeUndefined();
    expect(browserServiceAddr({ VECTOR_BROWSER_SERVICE: "  " } as NodeJS.ProcessEnv)).toBeUndefined();
    expect(browserServiceAddr({ VECTOR_BROWSER_SERVICE: "127.0.0.1:9876" } as NodeJS.ProcessEnv)).toBe(
      "127.0.0.1:9876",
    );
  });
});
