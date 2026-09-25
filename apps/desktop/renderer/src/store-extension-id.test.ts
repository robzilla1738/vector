import { describe, expect, it } from "vitest";
import { storeExtensionId } from "./store-extension-id";

const id = "abcdefghijklmnopabcdefghijklmnop";

describe("Chrome Store extension identity", () => {
  it("accepts a Store ID or official HTTPS detail URL", () => {
    expect(storeExtensionId(id)).toBe(id);
    expect(storeExtensionId(`https://chromewebstore.google.com/detail/example/${id}`)).toBe(id);
    expect(storeExtensionId(`https://chrome.google.com/webstore/detail/example/${id}`)).toBe(id);
  });

  it("rejects lookalike origins, credentials, other schemes and invalid IDs", () => {
    for (const value of [
      `https://chromewebstore.google.com.evil.test/detail/${id}`,
      `http://chromewebstore.google.com/detail/${id}`,
      `https://user@chromewebstore.google.com/detail/${id}`,
      `https://chrome.google.com/not-webstore/${id}`,
      `https://chromewebstore.google.com/not-detail/${id}`,
      "q".repeat(32),
    ])
      expect(storeExtensionId(value)).toBeNull();
  });
});
