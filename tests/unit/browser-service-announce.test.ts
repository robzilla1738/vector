import { describe, expect, it } from "vitest";
import {
  consumeBrowserServiceStdout,
  parseBrowserServiceAnnouncement,
} from "../../scripts/browser-service-announce.mjs";

describe("ve-shell BrowserService announcement — Gate B", () => {
  it("reads VECTOR_BROWSER_SERVICE from a gui+service JSON line", () => {
    expect(
      parseBrowserServiceAnnouncement(
        '{"VECTOR_BROWSER_SERVICE":"127.0.0.1:44551","backend":"vector-engine","chromium":false,"gui":true}',
      ),
    ).toBe("127.0.0.1:44551");
  });

  it("ignores cargo noise and empty lines", () => {
    expect(parseBrowserServiceAnnouncement("   Compiling ve-shell v0.1.0")).toBeUndefined();
    expect(parseBrowserServiceAnnouncement("")).toBeUndefined();
    expect(parseBrowserServiceAnnouncement("{not json")).toBeUndefined();
  });

  it("finds the addr across chunked stdout", () => {
    const first = consumeBrowserServiceStdout("", '{"VECTOR_BROWSER_SERVICE":"127.0.0.1:');
    expect(first.addr).toBeUndefined();
    const second = consumeBrowserServiceStdout(first.rest, '9","gui":true}\nCompiling\n');
    expect(second.addr).toBe("127.0.0.1:9");
  });
});
