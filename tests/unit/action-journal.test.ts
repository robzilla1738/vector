import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  DurableWriteLedger,
  openDb,
  beginConsequentialWrite,
  stepSignature,
  Repo,
  RunCoordinator,
  EventBus,
} from "@aux/runtime";
import type { Step } from "@aux/contracts";

const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const fn of cleanup.splice(0).reverse()) await fn();
});
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-journal-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, "state.sqlite");
  const db = openDb(path);
  cleanup.push(() => db.close());
  return { directory, path, db, ledger: new DurableWriteLedger(db) };
}
function seedParents(db: ReturnType<typeof openDb>, ...ids: { runId: string; pageId: string }[]) {
  for (const { runId, pageId } of ids) {
    db.prepare("INSERT OR IGNORE INTO runs(run_id,goal,status,created_at) VALUES(?,?,?,?)").run(
      runId,
      "goal",
      "running",
      1,
    );
    db.prepare(
      "INSERT OR IGNORE INTO pages(page_id,backend,target_id,url,created_at,active_at) VALUES(?,?,?,?,?,?)",
    ).run(pageId, "aux", `target-${pageId}`, "https://example.test", 1, 1);
  }
}
const action = { runId: "run", pageId: "page", documentEpoch: 1, signature: "send", revision: 1 };

it("blocks uncertain effects across changed observations, refs, epochs and repair plans", () => {
  const f = fixture();
  seedParents(f.db, action);
  const first = f.ledger.begin(action);
  f.ledger.fail(first.intent.id);
  const secondDb = openDb(f.path);
  cleanup.push(() => secondDb.close());
  const restarted = new DurableWriteLedger(secondDb);
  expect(
    restarted.begin({ ...action, documentEpoch: 20, revision: 30, signature: "different-ref" }),
  ).toMatchObject({ duplicate: true, intent: { id: first.intent.id, status: "uncertain" } });
  expect(() => restarted.reconcile(first.intent.id, "not_applied", "")).toThrow("evidence");
  restarted.reconcile(first.intent.id, "not_applied", "provider lookup: no matching transaction");
  expect(restarted.begin({ ...action, logicalActionId: "explicit-new-attempt" }).duplicate).toBe(false);
  const history = f.db
    .prepare("SELECT status,evidence FROM action_transitions WHERE intent_id=? ORDER BY seq")
    .all(first.intent.id);
  expect(history.map((row) => row.status)).toEqual(["pending", "uncertain", "not_applied"]);
  expect(history[2]?.evidence).toContain("provider lookup");
});

it("keeps task-level logical writes stable across new runs and aborts undispatched intents", () => {
  const f = fixture();
  seedParents(
    f.db,
    { runId: "run-1", pageId: "page" },
    { runId: "run-2", pageId: "other-page" },
    { runId: "run-3", pageId: "page" },
  );
  const first = beginConsequentialWrite(f.ledger, {
    runId: "run-1",
    pageId: "page",
    documentEpoch: 1,
    steps: [{ op: "fill", target: "a", value: "1" }],
    taskId: "task-1",
    taskRevision: 1,
  });
  expect(first.skip).toBe(false);
  f.ledger.confirm(first.intentId!);
  const retry = beginConsequentialWrite(f.ledger, {
    runId: "run-2",
    pageId: "other-page",
    documentEpoch: 40,
    revision: 9,
    steps: [{ op: "fill", target: "a", value: "1" }],
    taskId: "task-1",
    taskRevision: 1,
  });
  expect(retry.skip).toBe(true);
  const pending = f.ledger.begin({ ...action, runId: "run-3", logicalActionId: "never-dispatched" });
  f.ledger.abortUndispatched(pending.intent.id, "Pre-dispatch failed before the browser ran the write.");
  expect(f.ledger.unresolved("run-3")).toEqual([]);
  expect(f.db.prepare("SELECT status FROM action_intents WHERE id=?").get(pending.intent.id)?.status).toBe(
    "not_applied",
  );
});

it("keeps explicit logical action identity stable and includes all parameters in signatures", () => {
  const f = fixture();
  seedParents(f.db, action, { runId: "another", pageId: "new-page" }, { runId: "another", pageId: "page" });
  const first = f.ledger.begin({ ...action, logicalActionId: "invoice-123" });
  f.ledger.confirm(first.intent.id);
  expect(
    f.ledger.begin({
      ...action,
      pageId: "new-page",
      documentEpoch: 4,
      revision: 99,
      logicalActionId: "invoice-123",
    }).duplicate,
  ).toBe(true);
  expect(stepSignature([{ op: "navigate", url: "https://one.test" } as Step])).not.toBe(
    stepSignature([{ op: "navigate", url: "https://two.test" } as Step]),
  );
  expect(stepSignature([{ op: "fill", target: { name: "a", role: "textbox" } }])).toBe(
    stepSignature([{ target: { role: "textbox", name: "a" }, op: "fill" }]),
  );
  const destructive = beginConsequentialWrite(f.ledger, {
    ...action,
    runId: "another",
    steps: [{ op: "evaluate", expression: "mutate()" } as Step],
  });
  expect(destructive.intentId).toBeTruthy();
});

it("rolls back intent creation if its transition record cannot be committed", () => {
  const f = fixture();
  seedParents(f.db, action);
  f.db.exec(
    "CREATE TRIGGER reject_transition BEFORE INSERT ON action_transitions BEGIN SELECT RAISE(ABORT, 'injected storage failure'); END",
  );
  expect(() => f.ledger.begin(action)).toThrow("storage failure");
  expect(f.db.prepare("SELECT count(*) AS n FROM action_intents").get()?.n).toBe(0);
  f.db.exec("DROP TRIGGER reject_transition");
  expect(f.ledger.begin(action).duplicate).toBe(false);
});

it("cannot report completion while the persistent journal contains an unresolved effect", async () => {
  const f = fixture();
  seedParents(f.db, action);
  const repo = new Repo(f.db);
  repo.saveRun({ runId: "run", goal: "submit", status: "running", pageIds: ["page"], createdAt: Date.now() });
  f.ledger.begin(action);
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      repo.getPage(pageId),
    ),
    repo,
    events: new EventBus(repo),
    pages: {} as never,
    model: () => null,
    defaultModel: () => "test",

    recordModelCall: () => {},
  });
  await coordinator.finish("run", "completed", { sent: true });
  const run = repo.getRun("run")!;
  expect(run.status).toBe("interrupted");
  expect(run.result).toBeUndefined();
  expect(run.error).toContain("Uncertain action outcome");
  expect(
    (run.config?.checkpoint as { unresolvedEffects: string[] } | undefined)?.unresolvedEffects,
  ).toHaveLength(1);
});

it("retains a committed intent after actual SIGKILL following a remote write", async () => {
  const f = fixture();
  let writes = 0;
  // Count only the write: local tools may probe a new loopback port with a GET.
  const server = createServer((req, res) => {
    if (req.method === "POST") writes++;
    res.end("accepted");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  let serverClosed: Promise<void> | undefined;
  const closeServer = () =>
    (serverClosed ??= new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    }));
  cleanup.push(closeServer);
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  // The crash probe needs the actual store and journal, not every runtime
  // service/provider eagerly re-exported by the public index.
  const dbModule = pathToFileURL(join(process.cwd(), "apps/runtime/dist/store/db.js")).href;
  const ledgerModule = pathToFileURL(join(process.cwd(), "apps/runtime/dist/agent/durable.js")).href;
  const source = `import {once} from 'node:events';
    import {openDb} from ${JSON.stringify(dbModule)};
    import {DurableWriteLedger} from ${JSON.stringify(ledgerModule)};
    const db=openDb(process.argv[1]);
    db.prepare("INSERT INTO runs(run_id,goal,status,created_at) VALUES('run','goal','running',1)").run();
    db.prepare("INSERT INTO pages(page_id,backend,target_id,url,created_at,active_at) VALUES('page','aux','target','https://example.test',1,1)").run();
    const ledger=new DurableWriteLedger(db);
    ledger.begin(${JSON.stringify(action)});
    const dispatch=once(process,'message');
    process.send('intent-committed');
    if ((await dispatch)[0] !== 'dispatch') throw new Error('Expected original dispatch');
    const response=await fetch(process.argv[2], {method:'POST'});
    if (!response.ok || await response.text() !== 'accepted') throw new Error('Remote write not accepted');
    const crash=once(process,'message');
    process.send('remote-written');
    if ((await crash)[0] !== 'crash') throw new Error('Expected crash after remote write');
    process.kill(process.pid,'SIGKILL');`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", source, f.path, origin], {
    env: { PATH: process.env.PATH },
    stdio: ["ignore", "ignore", "ignore", "ipc"],
  });
  const messages = new AbortController();
  const ready = once(child, "message", { signal: messages.signal });
  const exited = once(child, "exit") as Promise<[number | null, NodeJS.Signals | null]>;
  const earlyExit = exited.then(([code, signal]) => {
    throw new Error(`Writer exited before its crash acknowledgement (${code ?? signal}).`);
  });
  let childClosed: Promise<void> | undefined;
  const closeChild = () =>
    (childClosed ??= (async () => {
      messages.abort();
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      await exited;
    })());
  cleanup.push(closeChild);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let dispatchExpired = false;
  const send = (message: string) =>
    new Promise<void>((resolve, reject) => {
      child.send(message, (error) => (error ? reject(error) : resolve()));
    });
  try {
    expect((await Promise.race([ready, earlyExit]))[0]).toBe("intent-committed");
    // The child's acknowledged committed transaction is visible in the parent
    // before any remote effect. Slow process startup cannot pose as this crash.
    expect(f.db.prepare("SELECT status FROM action_intents").get()?.status).toBe("pending");
    const written = once(child, "message", { signal: messages.signal });
    timeout = setTimeout(() => {
      dispatchExpired = true;
      child.kill("SIGKILL");
    }, 10_000);
    const [, acknowledgement] = await Promise.all([send("dispatch"), Promise.race([written, earlyExit])]);
    expect(acknowledgement[0]).toBe("remote-written");
    expect(writes).toBe(1);
    await send("crash");
    const [, signal] = await exited;
    expect(dispatchExpired).toBe(false);
    expect(signal).toBe("SIGKILL");
    const replay = f.ledger.begin({ ...action, revision: 8, documentEpoch: 9 });
    expect(replay).toMatchObject({ duplicate: true, intent: { status: "pending" } });
    if (!replay.duplicate) await fetch(origin, { method: "POST" });
    expect(writes).toBe(1);
  } finally {
    clearTimeout(timeout);
    await closeChild();
    await closeServer();
  }
});
