import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildMethodDeps, type Services } from "../../apps/runtime/src/api/methods/context.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { SettingsService } from "../../apps/runtime/src/services/settings.js";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

it("uses the actual RPC producer to permit cookieless reads and refuse consequential tools", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-egress-confirmation-"));
  const db = openDb(":memory:"),
    repo = new Repo(db);
  repo.setSetting("safetyCeilings", { egress: "always" });
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  const services = { repo, settings, events: new EventBus(repo), featureProfileId: "fixture" } as Services;
  const deps = buildMethodDeps(services, async () => {
    throw new Error("Unexpected invocation");
  });
  cleanups.push(() => {
    deps.turnTabs.dispose();
    db.close();
    rmSync(directory, { recursive: true, force: true });
  });
  for (const action of ["agent.web.fetch", "agent.web.search"])
    await expect(
      deps.decideEgress({ url: new URL("https://example.test/page"), action }),
    ).resolves.toMatchObject({ status: "allow" });
  await expect(
    deps.decideEgress({ url: new URL("https://example.test/page"), action: "agent.turn.open" }),
  ).resolves.toMatchObject({ status: "allow" });
  await expect(
    deps.decideEgress({ url: new URL("https://example.test/send"), action: "agent.messages.send" }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  repo.setSetting("originPolicies", [{ origin: "https://example.test/", access: "deny" }]);
  await expect(
    deps.decideEgress({ url: new URL("https://example.test/page"), action: "agent.web.fetch" }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  const requests = db.prepare("SELECT category, status FROM safety_decisions ORDER BY rowid").all();
  expect(requests).toEqual([
    { category: "read", status: "allow" },
    { category: "read", status: "allow" },
    { category: "navigate", status: "allow" },
    { category: "external_tool", status: "ask" },
    { category: "external_tool", status: "deny" },
    { category: "read", status: "deny" },
  ]);
});
