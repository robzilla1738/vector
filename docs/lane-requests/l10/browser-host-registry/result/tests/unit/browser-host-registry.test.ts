import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BrowserHostMethods, HostEvents as BrowserHostEvents } from "@aux/contracts/browser-host-methods";
import { RuntimeHostMethods } from "@aux/contracts/runtime-host-methods";
import { HostMethods, HostEvents } from "@aux/contracts/host-methods";

const jsonSchema = (schema: z.ZodType) => z.toJSONSchema(schema, { unrepresentable: "any" });

describe("separate browser host registry", () => {
  it("retains all original method and event schemas, metadata, and key order", () => {
    const record = {
      methods: Object.entries(HostMethods).map(([id, spec]) => ({
        id, owner: spec.owner, feature: spec.feature, profileScoped: spec.profileScoped,
        trusted: spec.trusted, args: jsonSchema(spec.args), result: jsonSchema(spec.result),
        ...("wireArgs" in spec ? { wireArgs: jsonSchema(spec.wireArgs) } : {}),
      })),
      events: Object.entries(HostEvents).map(([id, spec]) => ({
        id, owner: spec.owner, feature: spec.feature, profileScoped: spec.profileScoped,
        trusted: spec.trusted, payload: jsonSchema(spec.payload),
      })),
    };
    // Captured from the original complete registry before its source was moved.
    expect(createHash("sha256").update(JSON.stringify(record)).digest("hex"))
      .toBe("fa75c457314c47a4b44e29bb7bd73ab1fe4f45a064c75d8e2eda04554b464c3d");
  });

  it("combines the exact browser and runtime entries without aliases or replacements", () => {
    expect(Object.keys(BrowserHostMethods)).toHaveLength(154);
    expect(Object.keys(RuntimeHostMethods)).toHaveLength(70);
    expect(Object.keys(HostMethods)).toEqual([...Object.keys(BrowserHostMethods), ...Object.keys(RuntimeHostMethods)]);
    for (const [id, spec] of Object.entries(BrowserHostMethods)) {
      expect(spec.owner).toBe("browser");
      expect(spec.trusted).toBe("aux-webui");
      expect(HostMethods[id as keyof typeof HostMethods]).toBe(spec);
    }
    for (const [id, spec] of Object.entries(RuntimeHostMethods)) {
      expect(spec.owner).toBe("runtime");
      expect(spec.trusted).toBe("authenticated-runtime");
      expect(HostMethods[id as keyof typeof HostMethods]).toBe(spec);
    }
    expect(HostEvents).toBe(BrowserHostEvents);
  });

  it("keeps runtime methods out of the generated production browser client dependency", () => {
    const source = readFileSync(resolve("apps/shell/src/host/client.generated.ts"), "utf8");
    expect(source).toContain('from "@aux/contracts/browser-host-methods"');
    expect(source).not.toContain('from "@aux/contracts/host-methods"');
    expect(source).not.toContain("runtime-host-methods");
    expect(Object.keys(BrowserHostMethods).some(id => id.startsWith("native."))).toBe(false);
  });
});
