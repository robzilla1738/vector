import { expect, it, vi } from "vitest";
import * as z from "./schema-mini-runtime";
it("parses the synchronous mini contract under CSP without a Function probe", () => {
  expect(z.core.config().jitless).toBe(true);
  const probe = vi.spyOn(globalThis, "Function");
  try {
    const schema = z.strictObject({
      title: z.string().check(z.minLength(1)),
      epoch: z.int().check(z.nonnegative()),
    });
    expect(schema.parse({ title: "Capture", epoch: 0 })).toEqual({
      title: "Capture",
      epoch: 0,
    });
    expect(schema.safeParse({ title: "Capture", epoch: 0, unexpected: 1 }).success).toBe(false);
    expect(probe).not.toHaveBeenCalled();
  } finally {
    probe.mockRestore();
  }
});
