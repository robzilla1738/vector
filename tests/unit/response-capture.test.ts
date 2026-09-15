import { describe, it, expect } from "vitest";
import { bodyCapturePolicy, defaultResponseCaptureOptions, DEFAULT_BODY_CAP } from "@vector/browser-driver";

const opts = defaultResponseCaptureOptions({});

describe("bodyCapturePolicy", () => {
  it("captures xhr/fetch bodies with JSON or text content types", () => {
    expect(bodyCapturePolicy({ resourceType: "xhr", contentType: "application/json; charset=utf-8" }, opts)).toBe("capture");
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "text/plain" }, opts)).toBe("capture");
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "text/csv", contentLength: 1200 }, opts)).toBe("capture");
    expect(bodyCapturePolicy({ resourceType: "XHR", contentType: "application/xml" }, opts)).toBe("capture");
  });

  it("never fetches script, stylesheet, document, image or font bodies by default", () => {
    expect(bodyCapturePolicy({ resourceType: "script", contentType: "application/javascript" }, opts)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "stylesheet", contentType: "text/css" }, opts)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "document", contentType: "text/html" }, opts)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "image", contentType: "image/png" }, opts)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "font", contentType: "font/woff2" }, opts)).toBe("skip");
  });

  it("skips binary xhr/fetch payloads", () => {
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "application/octet-stream" }, opts)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "xhr", contentType: undefined }, opts)).toBe("skip");
  });

  it("does not read bodies whose declared length exceeds the cap", () => {
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "application/json", contentLength: DEFAULT_BODY_CAP + 1 }, opts)).toBe("too-large");
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "application/json", contentLength: DEFAULT_BODY_CAP }, opts)).toBe("capture");
  });

  it("a driver option (env) can opt documents/scripts in", () => {
    const wide = defaultResponseCaptureOptions({ VECTOR_CAPTURE_BODY_TYPES: "xhr, fetch, document" });
    expect(bodyCapturePolicy({ resourceType: "document", contentType: "text/html" }, wide)).toBe("capture");
    expect(bodyCapturePolicy({ resourceType: "script", contentType: "text/javascript" }, wide)).toBe("skip");
    expect(bodyCapturePolicy({ resourceType: "fetch", contentType: "application/json" }, wide)).toBe("capture");
  });
});
