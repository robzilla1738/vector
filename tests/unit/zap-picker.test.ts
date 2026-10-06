// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { pickZapInPage } from "../../apps/runtime/src/execution/zap-picker.js";
import { ZapPickResultSchema } from "@aux/contracts";

afterEach(() => {
  document.body.replaceChildren();
});

it("offers bounded exact and related-element selectors, then cleans up", async () => {
  document.body.innerHTML = `<main><aside data-testid="promotion" class="promo"><button aria-label="Dismiss">Offer</button></aside><aside data-testid="promotion" class="promo"><button>Another</button></aside></main>`;
  const target = document.querySelector("button")!;
  const pending = pickZapInPage(30_000);
  target.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  const result = ZapPickResultSchema.parse({
    ...((await pending) as object),
    pageId: "page",
    documentEpoch: 1,
    origin: "https://example.com",
  });
  expect(result.picked).toBe(true);
  if (!result.picked) return;
  expect(result.candidates.length).toBeLessThanOrEqual(15);
  expect(
    result.candidates.some(
      (candidate) =>
        candidate.selector === 'aside[data-testid="promotion"]' &&
        candidate.matchCount === 2 &&
        candidate.related,
    ),
  ).toBe(true);
  expect(result.candidates.every((candidate) => candidate.matchCount <= 100)).toBe(true);
  expect(document.querySelector("[data-aux-zap-picker]")).toBeNull();
});

it("cancels on Escape without leaving page listeners or UI behind", async () => {
  document.body.innerHTML = "<button>Keep me</button>";
  const pending = pickZapInPage(30_000);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  expect(await pending).toEqual({ picked: false });
  expect(document.querySelector("[data-aux-zap-picker]")).toBeNull();
});
