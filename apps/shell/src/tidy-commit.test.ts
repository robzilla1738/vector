import { expect, it } from "vitest";
import { commitTidyLayout } from "./tidy-commit";
import { emptyLayout } from "./workspace";

it("does not publish or leave a failed Tidy write queued for a later retry", async () => {
  const before = emptyLayout();
  const after = { ...before, activeSpaceId: "different" };
  let pending = before;
  let durable = before;
  let attempts = 0;
  let published = false;
  await expect(
    commitTidyLayout({
      before,
      after,
      current: () => before,
      persist: (layout) => {
        pending = layout;
      },
      flush: async () => {
        if (++attempts === 1) throw new Error("host unavailable");
        durable = pending;
      },
      publish: () => {
        published = true;
      },
    }),
  ).rejects.toThrow("host unavailable");
  expect(published).toBe(false);
  expect(pending).toBe(before);
  expect(durable).toBe(before);
});

it("restores the live layout if tabs change during the confirmed host write", async () => {
  const before = emptyLayout();
  const after = { ...before, activeSpaceId: "tidied" };
  const changed = { ...before, activeSpaceId: "user-choice" };
  let live = before;
  let pending = before;
  let durable = before;
  let published = false;
  await expect(
    commitTidyLayout({
      before,
      after,
      current: () => live,
      persist: (layout) => {
        pending = layout;
      },
      flush: async () => {
        durable = pending;
        live = changed;
      },
      publish: () => {
        published = true;
      },
    }),
  ).rejects.toThrow(/Tabs changed/);
  expect(durable).toBe(changed);
  expect(published).toBe(false);
});
