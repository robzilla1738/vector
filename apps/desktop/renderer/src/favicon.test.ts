import { describe, expect, it } from "vitest";
import { faviconCandidates, hostLetter } from "./favicon";

describe("faviconCandidates", () => {
  it("tries the page icon first, then DDG, then Google", () => {
    expect(faviconCandidates("https://mail.google.com/mail", "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico")).toEqual([
      "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
      "https://icons.duckduckgo.com/ip3/mail.google.com.ico",
      "https://www.google.com/s2/favicons?sz=64&domain=mail.google.com",
    ]);
  });

  it("skips origin /favicon.ico and strips www", () => {
    expect(faviconCandidates("https://www.github.com/")).toEqual([
      "https://icons.duckduckgo.com/ip3/github.com.ico",
      "https://www.google.com/s2/favicons?sz=64&domain=github.com",
    ]);
  });

  it("does not invent icons for blank or local urls", () => {
    expect(faviconCandidates("about:blank")).toEqual([]);
    expect(faviconCandidates("chrome://settings")).toEqual([]);
    expect(faviconCandidates("not a url", "  ")).toEqual([]);
  });

  it("drops empty and atom: provided icons", () => {
    expect(faviconCandidates("https://x.com/", "atom://favicon")).toEqual([
      "https://icons.duckduckgo.com/ip3/x.com.ico",
      "https://www.google.com/s2/favicons?sz=64&domain=x.com",
    ]);
  });
});

describe("hostLetter", () => {
  it("uses the first hostname character", () => {
    expect(hostLetter("https://www.gmail.com/")).toBe("G");
    expect(hostLetter("about:blank")).toBe(null);
  });
});
