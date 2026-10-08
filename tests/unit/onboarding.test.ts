import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { openDb, Repo, OnboardingService } from "@aux/runtime";
import { MethodSchemas, ONBOARDING_STEPS } from "@aux/contracts";
import { RuntimeMethodPolicy } from "@aux/contracts/runtime-method-policy";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const action of cleanup.splice(0).reverse()) action();
});
function fixture(path = ":memory:") {
  const db = openDb(path);
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  return { repo, service: new OnboardingService(repo) };
}

it("finishes after four optional screens and persists skipped progress through restart and replay", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-onboarding-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "profile.sqlite");
  const f = fixture(path);
  expect(ONBOARDING_STEPS).toEqual(["welcome", "import", "model", "appearance"]);
  for (const step of ONBOARDING_STEPS) {
    expect(f.service.get().step).toBe(step);
    f.service.update({ revision: f.service.get().revision, action: "skip" });
  }
  expect(f.service.get()).toMatchObject({
    status: "complete",
    step: "appearance",
    skipped: [...ONBOARDING_STEPS],
  });
  const restart = fixture(path).service;
  expect(restart.get()).toEqual(f.service.get());
  expect(restart.update({ revision: restart.get().revision, action: "replay" })).toMatchObject({
    status: "active",
    step: "welcome",
    skipped: [...ONBOARDING_STEPS],
  });
  expect(fixture().service.get()).toMatchObject({ revision: 0, status: "new", skipped: [] });
});

it("rejects stale windows and resumes an unfinished step", () => {
  const { service } = fixture();
  service.update({ revision: 0, action: "visit", step: "model" });
  expect(() => service.update({ revision: 0, action: "later" })).toThrow(/changed in another window/);
  expect(service.update({ revision: 1, action: "later" })).toMatchObject({ status: "later", step: "model" });
  expect(service.update({ revision: 2, action: "finish" }).status).toBe("complete");
});

it("setup, restart and replay leave real chats unchanged and cannot start a chat", () => {
  const { repo, service } = fixture();
  const run = {
    runId: "saved-first-chat",
    goal: "First useful question",
    status: "queued" as const,
    pageIds: [],
    createdAt: 1,
  };
  repo.saveRun(run);
  service.update({ revision: 0, action: "finish" });
  const restart = new OnboardingService(repo);
  restart.update({ revision: restart.get().revision, action: "replay" });
  expect(repo.getRun(run.runId)).toEqual(run);
  expect(MethodSchemas).not.toHaveProperty("onboarding.start");
});

it("rejects malformed progress and removed review actions", () => {
  const { repo, service } = fixture();
  repo.setSetting("onboarding.state.v2", { version: 300 });
  expect(() => service.get()).toThrow(/could not be read/);
  for (const action of ["disclosure", "default-prompt"])
    expect(MethodSchemas["onboarding.update"].safeParse({ revision: 0, action }).success).toBe(false);
  for (const step of ["postcard", "default"])
    expect(MethodSchemas["onboarding.update"].safeParse({ revision: 0, action: "visit", step }).success).toBe(
      false,
    );
});

it("refuses external callers before reading Profile setup", async () => {
  const { onboardingMethods } = await import("../../apps/runtime/dist/api/methods/onboarding.js");
  for (const method of ["onboarding.get", "onboarding.update"] as const) {
    expect(RuntimeMethodPolicy[method].auth).toBe("aux-webui");
    await expect(
      onboardingMethods[method]!({ client: { external: true }, s: {}, params: {} } as never),
    ).rejects.toThrow(/own window/);
  }
});
