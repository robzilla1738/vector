#!/usr/bin/env node
/**
 * vector — CLI for the local Vector runtime.
 *
 *   vector open <url> [--chrome] [--background]
 *   vector tabs | pages
 *   vector observe <pageId>
 *   vector exec <pageId> <steps-json|'@file'>
 *   vector shot <pageId> [--artifact]
 *   vector run "<goal>" [--page <id>] [--set <id>]
 *   vector runs [--live] · vector run <runId> (status)
 *   vector set create <name> <url...> · vector set map <setId> --program <steps-json> | --goal "<goal>"
 *   vector results <setId>
 *   vector events [--since <n>]
 *   vector chrome attach [--port 9222] · vector chrome tabs
 *   vector programs · vector programs run <programId> <pageId> [--param k=v...]
 *   vector bench [--task records-extract] [--repeats n]
 *   vector doctor
 */
import { readFileSync } from "node:fs";
import { rpc, events, readDescriptor } from "./client.js";

const out = (v: unknown) => process.stdout.write(JSON.stringify(v, null, 2) + "\n");
const fail = (msg: string, code = 1): never => {
  process.stderr.write(`vector: ${msg}\n`);
  process.exit(code);
};

function parseFlags(argv: string[]): { args: string[]; flags: Record<string, string | true> } {
  const args: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=", 2);
      if (v !== undefined) flags[k!] = v;
      else if (i + 1 < argv.length && !argv[i + 1]!.startsWith("--")) flags[k!] = argv[++i]!;
      else flags[k!] = true;
    } else args.push(a);
  }
  return { args, flags };
}

function readJson(v: string): unknown {
  if (v.startsWith("@")) {
    return JSON.parse(readFileSync(v.slice(1), "utf8"));
  }
  return JSON.parse(v);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { args, flags } = parseFlags(rest);

  switch (cmd) {
    case undefined:
    case "help":
    case "--help":
      process.stdout.write(`vector — control the local Vector browser runtime

  open <url> [--chrome] [--background]   open a page
  pages                                  list pages
  observe <pageId> [--refs]              structured observation
  exec <pageId> <steps-json|@file>       run a typed program
  shot <pageId> [--artifact]             screenshot
  nav <pageId> <url>                     navigate
  close <pageId>
  run "<goal>" [--page id] [--set id]    start an agent run
  run-status <runId>                     run + steps
  pause|resume|cancel <runId>
  answer <runId> "<answer>"              reply to a needs_input run
  runs                                   recent runs
  set create <name> <url...>             create a page set
  set list
  set map <setId> --program <json|@file> | --goal "<text>" [--concurrency n]
  results <setId> [--status ok|error]
  events [--since n] [--follow]
  artifacts [runId] · artifact <id>      list / read (base64)
  chrome attach [--port 9222]
  chrome tabs · chrome open-live <pageId> · chrome detach
  chrome import-cookies [--source auto|attached|profile]
  programs · program-run <id> <pageId> [--param k=v] · validate <program-json|@file>
  ops [siteKey] · op-invoke <siteKey> <name> [pageId] [--inputs <json|@file>]
  op-explain <siteKey> <name> [pageId] · op-compile <runId> [name] [--site siteKey]
  state <entity> [where-json|@file] [--page p] [--run r]
  responses <pageId> [--url sub] [--limit n] · datasets [--run r] [--page p]
  traces [runId] [--since n] · describe
  models · probe [modelId]
  get <method> [params-json]             raw method call
  events | bench | doctor
`);
      return;

    case "doctor": {
      try {
        const d = readDescriptor();
        const health = await rpc("workspace.get");
        out({ ok: true, runtime: { port: d.port, pid: d.pid, token: "***" }, workspace: health });
      } catch (e) {
        fail((e as Error).message);
      }
      return;
    }

    case "open": {
      const url = args[0];
      if (!url) fail("usage: vector open <url> [--chrome|--engine] [--background]");
      out(await rpc("pages.open", { url, backend: flags.chrome ? "chrome" : flags.engine ? "vector-engine" : "vector", background: !!flags.background, activate: flags.activate !== "false" && !flags.background }));
      return;
    }
    case "pages":
    case "tabs":
      out(await rpc("pages.list", { includeDetached: !!flags.all }));
      return;
    case "observe": {
      const pageId = args[0];
      if (!pageId) fail("usage: vector observe <pageId>");
      out(await rpc("pages.observe", { pageId }));
      return;
    }
    case "exec": {
      const [pageId, stepsJson] = args;
      if (!pageId || !stepsJson) fail("usage: vector exec <pageId> <steps-json|@file>");
      const steps = readJson(stepsJson!);
      out(await rpc("pages.execute", { program: { pageId, steps } }));
      return;
    }
    case "nav": {
      const [pageId, url] = args;
      if (!pageId || !url) fail("usage: vector nav <pageId> <url>");
      out(await rpc("pages.navigate", { pageId, url }));
      return;
    }
    case "shot": {
      const pageId = args[0];
      if (!pageId) fail("usage: vector shot <pageId> [--artifact]");
      const r = await rpc<{ dataUrl?: string; artifactId?: string; width: number; height: number }>("pages.capture", {
        pageId,
        format: flags.artifact ? "artifact" : "dataUrl",
      });
      if (r.dataUrl) out({ ...r, dataUrl: r.dataUrl.slice(0, 120) + "…" });
      else out(r);
      return;
    }
    case "close":
      if (!args[0]) fail("usage: vector close <pageId>");
      out(await rpc("pages.close", { pageId: args[0] }));
      return;
    case "back":
    case "forward":
    case "reload":
    case "stop": {
      if (!args[0]) fail(`usage: vector ${cmd} <pageId>`);
      out(await rpc(`pages.${cmd}`, { pageId: args[0] }));
      return;
    }

    case "run": {
      const goal = args.join(" ");
      if (!goal) fail('usage: vector run "<goal>" [--page id] [--set id]');
      out(await rpc("runs.start", { goal, pageId: flags.page as string | undefined, setId: flags.set as string | undefined }));
      return;
    }
    case "run-status": {
      if (!args[0]) fail("usage: vector run-status <runId>");
      out(await rpc("runs.get", { runId: args[0] }));
      return;
    }
    case "pause":
    case "resume":
    case "cancel": {
      if (!args[0]) fail(`usage: vector ${cmd} <runId>`);
      out(await rpc(`runs.${cmd}`, { runId: args[0] }));
      return;
    }
    case "answer": {
      const [runId, ...restA] = args;
      if (!runId || !restA.length) fail('usage: vector answer <runId> "<answer>"');
      out(await rpc("runs.answer", { runId, answer: restA.join(" ") }));
      return;
    }
    case "runs":
      out(await rpc("runs.list", { limit: flags.limit ? Number(flags.limit) : 50 }));
      return;

    case "set": {
      const sub = args[0];
      if (sub === "create") {
        const [name, ...urls] = args.slice(1);
        if (!name) fail("usage: vector set create <name> <url...>");
        out(await rpc("sets.create", { name, source: urls.length ? "urls" : "manual", urls: urls.length ? urls : undefined }));
      } else if (sub === "list") {
        out(await rpc("sets.list"));
      } else if (sub === "map") {
        const setId = args[1];
        if (!setId) fail("usage: vector set map <setId> --program <json|@file> | --goal <text>");
        const program = flags.program ? (readJson(flags.program as string) as { steps: unknown[] }) : undefined;
        out(await rpc("sets.map", { setId, program, goal: flags.goal as string | undefined, concurrency: flags.concurrency ? Number(flags.concurrency) : undefined }));
      } else fail("usage: vector set create|list|map …");
      return;
    }
    case "results": {
      const setId = args[0];
      if (!setId) fail("usage: vector results <setId>");
      out(await rpc("sets.results", { setId, status: flags.status as "ok" | "partial" | "error" | undefined }));
      return;
    }

    case "events": {
      if (flags.follow === undefined && !flags.since) {
        out(await rpc("events.since", { sinceSeq: Number(flags.since ?? 0), limit: Number(flags.limit ?? 200) }));
        return;
      }
      let since = Number(flags.since ?? 0);
      const stream = events(since);
      for await (const e of stream) {
        process.stdout.write(JSON.stringify(e) + "\n");
        if (!flags.follow) break;
      }
      return;
    }

    case "artifacts":
      out(await rpc("artifacts.list", { runId: args[0] }));
      return;
    case "artifact": {
      if (!args[0]) fail("usage: vector artifact <artifactId>");
      const r = await rpc<{ artifact: { path: string; mediaType: string; size: number }; dataBase64: string }>("artifacts.read", { artifactId: args[0] });
      if (flags.raw) process.stdout.write(Buffer.from(r.dataBase64, "base64"));
      else out(r.artifact);
      return;
    }

    case "chrome": {
      const sub = args[0];
      if (sub === "attach") out(await rpc("chrome.attach", { port: flags.port ? Number(flags.port) : 9222 }));
      else if (sub === "tabs") out(await rpc("chrome.tabs"));
      else if (sub === "open-live") out(await rpc("chrome.openLive", { pageId: args[1] }));
      else if (sub === "detach") out(await rpc("chrome.detach"));
      else if (sub === "import-cookies") out(await rpc("chrome.importCookies", { source: flags.source ?? "auto" }));
      else fail("usage: vector chrome attach|tabs|open-live|detach|import-cookies [--source auto|attached|profile]");
      return;
    }

    case "programs":
      out(await rpc("programs.list"));
      return;
    case "program-run": {
      const [programId, pageId] = args;
      if (!programId || !pageId) fail("usage: vector program-run <programId> <pageId> [--param k=v]");
      const parameters: Record<string, string> = {};
      for (const p of args.slice(2)) {
        const [k, v] = p.split("=", 2);
        if (k && v !== undefined) parameters[k] = v;
      }
      out(await rpc("programs.run", { programId, pageId, parameters }));
      return;
    }

    case "models":
      out(await rpc("models.list"));
      return;
    case "probe":
      out(await rpc("models.probe", { modelId: args[0] }));
      return;

    // ---- runtime-vnext ----
    case "ops":
      out(await rpc("operations.list", { siteKey: args[0] }));
      return;
    case "op-invoke": {
      const [siteKey, name, pageId] = args;
      if (!siteKey || !name) fail("usage: vector op-invoke <siteKey> <name> [pageId] [--inputs <json|@file>]");
      const inputs = typeof flags.inputs === "string" ? (readJson(flags.inputs) as Record<string, unknown>) : undefined;
      out(await rpc("operations.invoke", { siteKey, name, pageId, inputs }));
      return;
    }
    case "op-explain": {
      const [siteKey, name, pageId] = args;
      if (!siteKey || !name) fail("usage: vector op-explain <siteKey> <name> [pageId]");
      out(await rpc("operations.explain", { siteKey, name, pageId }));
      return;
    }
    case "op-compile": {
      const [runId, name] = args;
      if (!runId) fail("usage: vector op-compile <runId> [name] [--site siteKey]");
      out(await rpc("operations.compile", { runId, name, siteKey: flags.site }));
      return;
    }
    case "state": {
      const [entity, whereJson] = args;
      if (!entity) fail("usage: vector state <entity> [where-json|@file] [--page pageId] [--run runId]");
      const where = whereJson ? (readJson(whereJson) as unknown[]) : undefined;
      out(await rpc("state.query", { entity, scope: { pageIds: flags.page ? [flags.page] : undefined, runId: flags.run }, where }));
      return;
    }
    case "responses":
      out(await rpc("responses.list", { pageId: args[0], urlIncludes: flags.url, limit: flags.limit ? Number(flags.limit) : undefined }));
      return;
    case "traces":
      out(await rpc("traces.list", { runId: args[0] ?? flags.run, since: flags.since ? Number(flags.since) : undefined }));
      return;
    case "datasets":
      out(await rpc("state.datasets", { runId: flags.run, pageId: flags.page }));
      return;
    case "validate": {
      const progJson = args[0];
      if (!progJson) fail("usage: vector validate <program-json|@file>");
      out(await rpc("programs.validate", { program: readJson(progJson!) }));
      return;
    }
    case "describe":
      out(await rpc("runtime.describe"));
      return;

    case "get": {
      const [method, paramsJson] = args;
      if (!method) fail("usage: vector get <method> [params-json]");
      out(await rpc(method!, paramsJson ? readJson(paramsJson) : {}));
      return;
    }

    case "bench":
      out(await rpc("bench.run", { task: args[0], repeats: flags.repeats ? Number(flags.repeats) : undefined }));
      return;

    default:
      fail(`unknown command ${cmd} — try \`vector help\``);
  }
}

main().catch((e) => fail((e as Error).message));
