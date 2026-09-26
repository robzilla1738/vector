import { describe, expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";
import { METHODS } from "../../apps/runtime/src/api/methods/index.js";
import { RuntimeAuthorization } from "../../apps/runtime/src/api/authorization.generated.js";

describe("domain method registry", () => {
  it("has a domain handler for every MethodSchemas method", () => {
    expect(Object.keys(METHODS).sort()).toEqual(Object.keys(MethodSchemas).sort());
  });

  it("has an authorization policy for every registered method", () => {
    for (const method of Object.keys(METHODS)) {
      expect(RuntimeAuthorization[method as keyof typeof RuntimeAuthorization], method).toBeDefined();
    }
  });
});
