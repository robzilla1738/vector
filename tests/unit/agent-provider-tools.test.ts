import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AgentWebTools, permittedWebUrl } from "../../apps/runtime/src/agent/web-tools.js";
import { AgentImageTools, AGENT_IMAGE_MODEL } from "../../apps/runtime/src/agent/image-tools.js";
import { SpendLedger } from "../../apps/runtime/src/store/spend-ledger.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { EventBus, openDb, Repo } from "@aux/runtime";
import { PNG } from "pngjs";
import { DEFAULT_AGENT_MODEL_ROUTES } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((fn) => fn()));

it("keeps Imagen exclusively in the image tool and all default agent roles on Contributor", () => {
  expect(Object.values(DEFAULT_AGENT_MODEL_ROUTES).map((route) => route.modelId)).toEqual([
    "meta/muse-spark-1.3-contributor",
    "meta/muse-spark-1.3-contributor",
    "meta/muse-spark-1.3-contributor",
    "meta/muse-spark-1.3-contributor",
  ]);
  expect(AGENT_IMAGE_MODEL).toBe("google/imagen-4.0-fast-generate-001");
});

it("blocks private hosts and validates every search redirect against explicit egress policy", async () => {
  expect(() => permittedWebUrl("http://127.0.0.1/admin")).toThrow(/private or local/);
  expect(() => permittedWebUrl("http://localhost/admin")).toThrow(/private or local/);
  expect(() => permittedWebUrl("https://user:password@example.com/")).toThrow(/credentials/);
  const visited: string[] = [];
  const web = new AgentWebTools(
    (url) => url.origin === "https://search.example.com",
    async (url) => {
      visited.push(url.href);
      return {
        status: 302,
        location: "https://elsewhere.example.net/secret",
        contentType: "text/html",
        body: "",
      };
    },
  );
  await expect(web.search("cats & dogs", "https://search.example.com/?q=%s")).rejects.toThrow(
    /egress is not granted/,
  );
  expect(visited).toEqual(["https://search.example.com/?q=cats%20%26%20dogs"]);
});

it("extracts bounded page text and links from a policy-granted HTML response", async () => {
  const web = new AgentWebTools(
    (url) => url.origin === "https://example.com",
    async () => ({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: '<html><head><title>Source page</title><script>ignore me</script></head><body><h1>Useful facts</h1><p>Result body</p><a href="/next">Next page</a></body></html>',
    }),
  );
  const page = await web.fetch("https://example.com/start#private-fragment");
  expect(page).toMatchObject({
    url: "https://example.com/start",
    title: "Source page",
    text: "Useful facts\nResult body",
    links: [{ title: "Next page", url: "https://example.com/next" }],
  });
  expect(page.text).not.toContain("ignore me");
});

it("reserves global image spend before provider dispatch and saves only validated output", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-image-provider-"));
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const ledger = new SpendLedger(join(dir, "ledger.sqlite"), { AUX_PROGRAM_SPEND_CAP_USD: "50" });
  cleanup.push(() => {
    ledger.close();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const artifacts = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
  let calls = 0;
  const images = new AgentImageTools(artifacts, ledger, async () => {
    calls++;
    return { data: PNG.sync.write(new PNG({ width: 1, height: 1 })), mediaType: "image/png", costUsd: 0.02 };
  });
  const result = await images.generate("A red glass sphere", "task-one");
  expect(result).toMatchObject({ modelId: AGENT_IMAGE_MODEL, mediaType: "image/png" });
  expect(PNG.sync.read(Buffer.from(artifacts.read(result.artifactId).dataBase64, "base64"))).toMatchObject({
    width: 1,
    height: 1,
  });
  expect(ledger.summary().committedUsd).toBeCloseTo(0.02);
  const hold = ledger.reserve("fixture", "other", 49);
  await expect(images.generate("Another sphere")).rejects.toThrow(/program cap reached/);
  expect(calls).toBe(1);
  ledger.settle(hold, 49);
});
