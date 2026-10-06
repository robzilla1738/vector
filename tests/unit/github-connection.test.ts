import { afterEach, expect, it } from "vitest";
import { openDb, Repo, NullNativeBridge } from "@aux/runtime";
import { GithubConnectionService } from "../../apps/runtime/dist/services/github-connection.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
class FixtureSecrets extends NullNativeBridge {
  readonly values = new Map<string, string>();
  override available() {
    return true;
  }
  override async storeSecret(name = "", value = "") {
    this.values.set(name, value);
    return { ok: true as const };
  }
  override async readSecret(name = "") {
    return { value: this.values.get(name) };
  }
}
function service(http: typeof fetch) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const native = new FixtureSecrets();
  return {
    repo,
    native,
    github: new GithubConnectionService({ repo, native, endpoint: "http://127.0.0.1:1234", fetch: http }),
  };
}
it("stores only native synthetic secrets and requests all four bounded GitHub source queries", async () => {
  const queries: string[] = [];
  const { github, native } = service(async (input, init) => {
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer synthetic-fixture-token");
    const url = new URL(String(input));
    if (url.pathname === "/user") return Response.json({ login: "fixture-person" });
    expect(url.searchParams.get("per_page")).toBe("25");
    queries.push(url.searchParams.get("q")!);
    return Response.json({
      items: [
        {
          id: 1,
          title: "Review this",
          html_url: "https://github.test/aux/browser/pull/1",
          number: 1,
          updated_at: "2026-01-01",
        },
      ],
    });
  });
  const account = await github.connect("Fixture", "synthetic-fixture-token");
  expect(JSON.stringify(github.list())).not.toContain("synthetic-fixture-token");
  expect(JSON.stringify(github.list())).not.toContain("secretName");
  for (const source of ["awaiting-review", "open-prs", "assigned-issues", "query"] as const) {
    const items = await github.items({
      kind: "github",
      config: {
        connectionId: account.id,
        source,
        ...(source === "query" ? { query: "repo:aux/browser is:open" } : {}),
      },
      refreshMinutes: 15,
    });
    expect(items[0]?.subtitle).toBe("aux/browser #1");
  }
  expect(queries).toEqual([
    "is:pr is:open review-requested:fixture-person",
    "is:pr is:open author:fixture-person",
    "is:issue is:open assignee:fixture-person",
    "repo:aux/browser is:open",
  ]);
  await github.revoke(account.id);
  expect(github.list()).toEqual([]);
  expect([...native.values.values()]).toEqual([""]);
});
it("does not publish a search that completes after account revocation", async () => {
  let started!: () => void;
  let release!: () => void;
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { github } = service(async (input) => {
    if (new URL(String(input)).pathname === "/user") return Response.json({ login: "fixture-person" });
    started();
    await pending;
    return Response.json({ items: [] });
  });
  const account = await github.connect("Fixture", "synthetic-fixture-token");
  const items = github.items({
    kind: "github",
    config: { connectionId: account.id, source: "open-prs" },
    refreshMinutes: 15,
  });
  await requested;
  await github.revoke(account.id);
  release();
  await expect(items).rejects.toThrow(/disconnected during refresh/);
});

it("refuses dispatch when native secret retrieval completes after revocation", async () => {
  const paths: string[] = [];
  const { github, native } = service(async (input) => {
    paths.push(new URL(String(input)).pathname);
    return Response.json({ login: "fixture-person" });
  });
  const account = await github.connect("Fixture", "synthetic-fixture-token");
  let entered!: () => void;
  let release!: () => void;
  const reading = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  native.readSecret = async () => {
    entered();
    await pending;
    return { value: "synthetic-fixture-token" };
  };
  const items = github.items({
    kind: "github",
    config: { connectionId: account.id, source: "open-prs" },
    refreshMinutes: 15,
  });
  await reading;
  await github.revoke(account.id);
  release();
  await expect(items).rejects.toThrow(/disconnected during refresh/);
  expect(paths).toEqual(["/user"]);
});
