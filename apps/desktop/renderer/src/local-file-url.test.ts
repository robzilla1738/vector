import { describe, expect, it } from "vitest";
import { localFileUrl } from "./local-file-url";

describe("localFileUrl", () => {
  it("encodes filename delimiters and unicode without losing path separators", () => {
    expect(localFileUrl("/tmp/Aux #1 ? café %.html")).toBe(
      "file:///tmp/Aux%20%231%20%3F%20caf%C3%A9%20%25.html",
    );
  });

  it("normalizes portable drive paths", () => {
    expect(localFileUrl("C:\\Aux Files\\draft.html")).toBe("file:///C:/Aux%20Files/draft.html");
  });
});
