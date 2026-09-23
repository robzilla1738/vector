import { describe, expect, it } from "vitest";
import { faviconCandidates, hostLetter } from "./favicon";

describe("faviconCandidates", () => {
  it("uses only the page-provided icon — never a third-party lookup", () => {
    expect(faviconCandidates("https://mail.google.com/mail", "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico")).toEqual([
      "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
    ]);
    expect(faviconCandidates("https://www.github.com/")).toEqual([]);
  });

  it("drops empty and atom: provided icons", () => {
    expect(faviconCandidates("https://x.com/", "atom://favicon")).toEqual([]);
    expect(faviconCandidates("https://x.com/", "  ")).toEqual([]);
  });
});

describe("hostLetter", () => {
  it("uses the first hostname character", () => {
    expect(hostLetter("https://www.gmail.com/")).toBe("G");
    expect(hostLetter("about:blank")).toBe(null);
  });
});
