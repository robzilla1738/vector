import { expect, it } from "vitest";
import { RefRegistry } from "@aux/chromium-driver";
import type { ElementRef } from "@aux/contracts";

const el = (ref: string) => ({ ref, role: "button", name: ref, tag: "button", selector: { css: `#${ref}` }, frame: "main" }) as unknown as ElementRef;

it("drops refs a later full observation did not return and never reuses a live ref for merged passes", () => {
  const refs = new RefRegistry();
  refs.register("p", [el("r1"), el("r50")], { replace: true });
  refs.register("p", [el("r1"), el("r2")], { replace: true });
  expect(refs.resolve("p", "r50")).toBeUndefined();
  expect(refs.nextRef("p")).toBe(3);
  refs.register("p", [el("r3")]);
  expect(refs.resolve("p", "r1")).toBeDefined();
  expect(refs.resolve("p", "r3")).toBeDefined();
});
