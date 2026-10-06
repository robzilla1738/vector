import { expect, it, vi } from "vitest";
import { z } from "./schema-runtime";

it("keeps complete lazy schema parsing without a dynamic Function probe", () => {
  expect(z.config().jitless).toBe(true);
  const dynamicFunction = vi.spyOn(globalThis, "Function");
  try {
    const schema = z
      .object({ title: z.string().trim(), count: z.number().default(0) })
      .refine((value) => value.title.length > 0);
    expect(schema.parse({ title: "  Saved title  ", ignored: true })).toEqual({
      title: "Saved title",
      count: 0,
    });
    expect(schema.safeParse({ title: "   " }).success).toBe(false);
    expect(dynamicFunction).not.toHaveBeenCalled();
  } finally {
    dynamicFunction.mockRestore();
  }
});
