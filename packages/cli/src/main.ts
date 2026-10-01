#!/usr/bin/env node
/**
 * auxctl — CLI for the local Aux runtime.
 *
 *   auxctl open <url> [--chrome] [--background]
 *   auxctl tabs | pages
 *   auxctl observe <pageId>
 *   auxctl exec <pageId> <steps-json|'@file'>
 *   auxctl shot <pageId> [--artifact]
 *   auxctl run "<goal>" [--page <id>] [--set <id>]
 *   auxctl runs [--live] · auxctl run <runId> (status)
 *   auxctl set create <name> <url...> · auxctl set map <setId> --program <steps-json> | --goal "<goal>"
 *   auxctl results <setId>
 *   auxctl events [--since <n>]
 *   auxctl chrome attach [--port 9222] · auxctl chrome tabs
 *   auxctl programs · auxctl programs run <programId> <pageId> [--param k=v...]
 *   auxctl bench [--task records-extract] [--repeats n]
 *   auxctl doctor
 */
import { readFileSync } from "node:fs";
import { agentApiDocs, AgentApiManifest, supportedAgentApi } from "@aux/contracts";
import { rpc, events, readDescriptor } from "./client.js";

const out = (v: unknown) => process.stdout.write(JSON.stringify(v, null, 2) + "\n");
const fail = (msg: string, code = 1): never => {
  process.stderr.write(`auxctl: ${msg}\n`);
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
      process.stdout.write(`auxctl — control the local Aux browser runtime

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
  workspace list · workspace create <name>
  task list [--workspace id] [--archived] [--query text] · task get <taskId>
  task create <workspaceId> <definition-json|@file>
  task update <taskId> <revision> <patch-json|@file>
  task archive|restore <taskId> <revision> · task receipt <taskId> [revision]
  task start <taskId> <revision> [--pages id,id]
  task verify <taskId> <revision> <criterionId>
  task replace <taskId> <revision> [--pages id,id]
  task journal <taskId> [revision]
  vault status|list|grants|expired|history
  routines list [--workspace id] · routines get <id> · routines runs <id>
  routines alerts · routines compare <leftRunId> <rightRunId>
  backup list · backup retention
  get <method> [params-json]             raw method call
  api [path [params-json]]               manifest catalog / typed path call
  api-docs [--mode included|model|lookup] manifest-generated agent API docs
  guide                                  external-agent quick reference
  js <code|@file> [--session id]          run restricted QuickJS code mode
  js-reset [--session id]                 discard a code-mode session
  events | bench | doctor
`);
      return;

    case "doctor": {
      try {
        const d = await readDescriptor();
        const health = await rpc("workspace.get");
        out({ ok: true, runtime: { port: d.port, pid: d.pid, token: "***" }, workspace: health });
      } catch (e) {
        fail((e as Error).message);
      }
      return;
    }

    case "open": {
      const url = args[0];
      if (!url) fail("usage: auxctl open <url> [--chrome] [--background]");
      out(
        await rpc("pages.open", {
          url,
          backend: flags.chrome ? "chrome" : "aux",
          background: !!flags.background,
          activate: flags.activate !== "false" && !flags.background,
        }),
      );
      return;
    }
    case "pages":
    case "tabs":
      out(await rpc("pages.list", { includeDetached: !!flags.all }));
      return;
    case "observe": {
      const pageId = args[0];
      if (!pageId) fail("usage: auxctl observe <pageId>");
      out(await rpc("pages.observe", { pageId }));
      return;
    }
    case "exec": {
      const [pageId, stepsJson] = args;
      if (!pageId || !stepsJson) fail("usage: auxctl exec <pageId> <steps-json|@file>");
      const steps = readJson(stepsJson!);
      out(await rpc("pages.execute", { program: { pageId, steps } }));
      return;
    }
    case "nav": {
      const [pageId, url] = args;
      if (!pageId || !url) fail("usage: auxctl nav <pageId> <url>");
      out(await rpc("pages.navigate", { pageId, url }));
      return;
    }
    case "shot": {
      const pageId = args[0];
      if (!pageId) fail("usage: auxctl shot <pageId> [--artifact]");
      const r = await rpc<{ dataUrl?: string; artifactId?: string; width: number; height: number }>(
        "pages.capture",
        {
          pageId,
          format: flags.artifact ? "artifact" : "dataUrl",
        },
      );
      if (r.dataUrl) out({ ...r, dataUrl: r.dataUrl.slice(0, 120) + "…" });
      else out(r);
      return;
    }
    case "close":
      if (!args[0]) fail("usage: auxctl close <pageId>");
      out(await rpc("pages.close", { pageId: args[0] }));
      return;
    case "back":
    case "forward":
    case "reload":
    case "stop": {
      if (!args[0]) fail(`usage: auxctl ${cmd} <pageId>`);
      out(await rpc(`pages.${cmd}`, { pageId: args[0] }));
      return;
    }

    case "run": {
      const goal = args.join(" ");
      if (!goal) fail('usage: auxctl run "<goal>" [--page id] [--set id]');
      out(
        await rpc("runs.start", {
          goal,
          pageId: flags.page as string | undefined,
          setId: flags.set as string | undefined,
        }),
      );
      return;
    }
    case "run-status": {
      if (!args[0]) fail("usage: auxctl run-status <runId>");
      out(await rpc("runs.get", { runId: args[0] }));
      return;
    }
    case "pause":
    case "resume":
    case "cancel": {
      if (!args[0]) fail(`usage: auxctl ${cmd} <runId>`);
      out(await rpc(`runs.${cmd}`, { runId: args[0] }));
      return;
    }
    case "answer": {
      const [runId, ...restA] = args;
      if (!runId || !restA.length) fail('usage: auxctl answer <runId> "<answer>"');
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
        if (!name) fail("usage: auxctl set create <name> <url...>");
        out(
          await rpc("sets.create", {
            name,
            source: urls.length ? "urls" : "manual",
            urls: urls.length ? urls : undefined,
          }),
        );
      } else if (sub === "list") {
        out(await rpc("sets.list"));
      } else if (sub === "map") {
        const setId = args[1];
        if (!setId) fail("usage: auxctl set map <setId> --program <json|@file> | --goal <text>");
        const program = flags.program
          ? (readJson(flags.program as string) as { steps: unknown[] })
          : undefined;
        out(
          await rpc("sets.map", {
            setId,
            program,
            goal: flags.goal as string | undefined,
            concurrency: flags.concurrency ? Number(flags.concurrency) : undefined,
          }),
        );
      } else fail("usage: auxctl set create|list|map …");
      return;
    }
    case "results": {
      const setId = args[0];
      if (!setId) fail("usage: auxctl results <setId>");
      out(
        await rpc("sets.results", { setId, status: flags.status as "ok" | "partial" | "error" | undefined }),
      );
      return;
    }

    case "events": {
      if (flags.follow === undefined && !flags.since) {
        out(
          await rpc("events.since", {
            sinceSeq: Number(flags.since ?? 0),
            limit: Number(flags.limit ?? 200),
          }),
        );
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
      if (!args[0]) fail("usage: auxctl artifact <artifactId>");
      const r = await rpc<{
        artifact: { path: string; mediaType: string; size: number };
        dataBase64: string;
      }>("artifacts.read", { artifactId: args[0] });
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
      else if (sub === "import-cookies")
        out(await rpc("chrome.importCookies", { source: flags.source ?? "auto" }));
      else
        fail(
          "usage: auxctl chrome attach|tabs|open-live|detach|import-cookies [--source auto|attached|profile]",
        );
      return;
    }

    case "programs":
      out(await rpc("programs.list"));
      return;
    case "program-run": {
      const [programId, pageId] = args;
      if (!programId || !pageId) fail("usage: auxctl program-run <programId> <pageId> [--param k=v]");
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

    case "workspace": {
      const sub = args[0];
      if (sub === "list") out(await rpc("workspaces.list"));
      else if (sub === "create") {
        const name = args.slice(1).join(" ").trim();
        if (!name) fail("usage: auxctl workspace create <name>");
        out(await rpc("workspaces.create", { name }));
      } else fail("usage: auxctl workspace list | workspace create <name>");
      return;
    }

    case "task": {
      const sub = args[0];
      if (sub === "list")
        out(
          await rpc("tasks.list", {
            workspaceId: flags.workspace,
            includeArchived: !!flags.archived,
            query: typeof flags.query === "string" ? flags.query : undefined,
            limit: flags.limit ? Number(flags.limit) : 100,
          }),
        );
      else if (sub === "get") {
        if (!args[1]) fail("usage: auxctl task get <taskId>");
        out(await rpc("tasks.get", { taskId: args[1] }));
      } else if (sub === "create") {
        if (!args[1] || !args[2]) fail("usage: auxctl task create <workspaceId> <definition-json|@file>");
        const definition = readJson(args[2]!) as Record<string, unknown>;
        out(await rpc("tasks.create", { ...definition, workspaceId: args[1] }));
      } else if (sub === "update") {
        if (!args[1] || !args[2] || !args[3])
          fail("usage: auxctl task update <taskId> <revision> <patch-json|@file>");
        out(
          await rpc("tasks.update", {
            ...(readJson(args[3]!) as Record<string, unknown>),
            taskId: args[1],
            expectedRevision: Number(args[2]),
          }),
        );
      } else if (sub === "archive" || sub === "restore") {
        if (!args[1] || !args[2]) fail(`usage: auxctl task ${sub} <taskId> <revision>`);
        out(
          await rpc("tasks.archive", {
            taskId: args[1],
            expectedRevision: Number(args[2]),
            archived: sub === "archive",
          }),
        );
      } else if (sub === "receipt") {
        if (!args[1]) fail("usage: auxctl task receipt <taskId> [revision]");
        out(
          await rpc("tasks.receipt", { taskId: args[1], ...(args[2] ? { revision: Number(args[2]) } : {}) }),
        );
      } else if (sub === "start") {
        if (!args[1] || !args[2]) fail("usage: auxctl task start <taskId> <revision> [--pages id,id]");
        const pageIds =
          typeof flags.pages === "string"
            ? flags.pages
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : [];
        out(await rpc("tasks.start", { taskId: args[1], expectedRevision: Number(args[2]), pageIds }));
      } else if (sub === "verify") {
        if (!args[1] || !args[2] || !args[3])
          fail("usage: auxctl task verify <taskId> <revision> <criterionId>");
        out(
          await rpc("tasks.verifyCriterion", {
            taskId: args[1],
            expectedRevision: Number(args[2]),
            criterionId: args[3],
          }),
        );
      } else if (sub === "replace") {
        if (!args[1] || !args[2]) fail("usage: auxctl task replace <taskId> <revision> [--pages id,id]");
        const pageIds =
          typeof flags.pages === "string"
            ? flags.pages
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : [];
        out(await rpc("tasks.replaceAgent", { taskId: args[1], expectedRevision: Number(args[2]), pageIds }));
      } else if (sub === "journal") {
        if (!args[1]) fail("usage: auxctl task journal <taskId> [revision]");
        const receipt = await rpc<{
          unresolvedActions: unknown[];
          unresolvedOperations: unknown[];
          verifications: unknown[];
        }>("tasks.receipt", { taskId: args[1], ...(args[2] ? { revision: Number(args[2]) } : {}) });
        out({
          unresolvedActions: receipt.unresolvedActions,
          unresolvedOperations: receipt.unresolvedOperations,
          verifications: receipt.verifications,
        });
      } else
        fail(
          "usage: auxctl task list|get|create|update|archive|restore|receipt|start|verify|replace|journal …",
        );
      return;
    }

    // ---- runtime-vnext ----
    case "ops":
      out(await rpc("operations.list", { siteKey: args[0] }));
      return;
    case "op-invoke": {
      const [siteKey, name, pageId] = args;
      if (!siteKey || !name)
        fail("usage: auxctl op-invoke <siteKey> <name> [pageId] [--inputs <json|@file>]");
      const inputs =
        typeof flags.inputs === "string" ? (readJson(flags.inputs) as Record<string, unknown>) : undefined;
      out(await rpc("operations.invoke", { siteKey, name, pageId, inputs }));
      return;
    }
    case "op-explain": {
      const [siteKey, name, pageId] = args;
      if (!siteKey || !name) fail("usage: auxctl op-explain <siteKey> <name> [pageId]");
      out(await rpc("operations.explain", { siteKey, name, pageId }));
      return;
    }
    case "op-compile": {
      const [runId, name] = args;
      if (!runId) fail("usage: auxctl op-compile <runId> [name] [--site siteKey]");
      out(await rpc("operations.compile", { runId, name, siteKey: flags.site }));
      return;
    }
    case "state": {
      const [entity, whereJson] = args;
      if (!entity) fail("usage: auxctl state <entity> [where-json|@file] [--page pageId] [--run runId]");
      const where = whereJson ? (readJson(whereJson) as unknown[]) : undefined;
      out(
        await rpc("state.query", {
          entity,
          scope: { pageIds: flags.page ? [flags.page] : undefined, runId: flags.run },
          where,
        }),
      );
      return;
    }
    case "responses":
      out(
        await rpc("responses.list", {
          pageId: args[0],
          urlIncludes: flags.url,
          limit: flags.limit ? Number(flags.limit) : undefined,
        }),
      );
      return;
    case "traces":
      out(
        await rpc("traces.list", {
          runId: args[0] ?? flags.run,
          since: flags.since ? Number(flags.since) : undefined,
        }),
      );
      return;
    case "datasets":
      out(await rpc("state.datasets", { runId: flags.run, pageId: flags.page }));
      return;
    case "validate": {
      const progJson = args[0];
      if (!progJson) fail("usage: auxctl validate <program-json|@file>");
      out(await rpc("programs.validate", { program: readJson(progJson!) }));
      return;
    }
    case "describe":
      out(await rpc("runtime.describe"));
      return;

    case "vault": {
      const sub = args[0];
      if (sub === "status") out(await rpc("vault.status", {}));
      else if (sub === "list") out(await rpc("vault.list", { includeRevoked: !!flags.revoked }));
      else if (sub === "grants") out(await rpc("vault.grants", {}));
      else if (sub === "expired") out(await rpc("vault.expiredGrants", {}));
      else if (sub === "history")
        out(await rpc("vault.history", { limit: flags.limit ? Number(flags.limit) : 50 }));
      else fail("usage: auxctl vault status|list|grants|expired|history");
      return;
    }

    case "routines": {
      const sub = args[0];
      if (sub === "list")
        out(await rpc("routines.list", { workspaceId: flags.workspace, includeArchived: !!flags.archived }));
      else if (sub === "get") {
        if (!args[1]) fail("usage: auxctl routines get <routineId>");
        out(await rpc("routines.get", { routineId: args[1] }));
      } else if (sub === "runs") {
        if (!args[1]) fail("usage: auxctl routines runs <routineId>");
        out(
          await rpc("routines.runs", { routineId: args[1], limit: flags.limit ? Number(flags.limit) : 30 }),
        );
      } else if (sub === "alerts")
        out(await rpc("routines.alerts", { limit: flags.limit ? Number(flags.limit) : 30 }));
      else if (sub === "compare") {
        if (!args[1] || !args[2]) fail("usage: auxctl routines compare <leftRunId> <rightRunId>");
        out(await rpc("routines.compare", { leftRunId: args[1], rightRunId: args[2] }));
      } else fail("usage: auxctl routines list|get|runs|alerts|compare …");
      return;
    }

    case "backup": {
      const sub = args[0];
      if (sub === "list") out(await rpc("installation.listBackups", {}));
      else if (sub === "retention") out(await rpc("installation.backupRetention", {}));
      else fail("usage: auxctl backup list | backup retention");
      return;
    }

    case "get": {
      const [method, paramsJson] = args;
      if (!method) fail("usage: auxctl get <method> [params-json]");
      out(await rpc(method!, paramsJson ? readJson(paramsJson) : {}));
      return;
    }

    case "js": {
      const source = args[0];
      if (!source) fail("usage: auxctl js <code|@file> [--session id]");
      const code = source!.startsWith("@") ? readFileSync(source!.slice(1), "utf8") : source!;
      const method = AgentApiManifest.find((item) => item.path === "js.run")!.method;
      out(await rpc(method, { code, sessionId: flags.session || "default" }));
      return;
    }
    case "js-reset": {
      const method = AgentApiManifest.find((item) => item.path === "js.reset")!.method;
      out(await rpc(method, { sessionId: flags.session || "default" }));
      return;
    }
    case "api-docs": {
      const mode = flags.mode === "lookup" || flags.mode === "included" ? flags.mode : "model";
      process.stdout.write(agentApiDocs({ surface: "cli" }, mode) + "\n");
      return;
    }

    case "api": {
      const catalog = supportedAgentApi({ surface: "cli" });
      const [path, paramsJson] = args;
      if (!path) {
        out(catalog.map((item) => ({ path: item.path, method: item.method, summary: item.summary })));
        return;
      }
      const item = catalog.find((entry) => entry.path === path);
      if (!item) fail(`unknown api path ${path} — run \`auxctl api\` for the catalog`);
      out(await rpc(item!.method, paramsJson ? readJson(paramsJson) : {}));
      return;
    }

    case "guide": {
      process.stdout.write(`aux guide — driving Aux from an external agent

Aux is a running browser, not a library. Its local runtime owns pages, tasks
and the durable event stream; agents talk to it over the loopback RPC API
(documented in docs/AUX-EXTERNAL-AGENTS.md).

== Connect ==

  auxctl doctor                 confirm the runtime is up (port + token live in
                                <dataDir>/runtime.json; every call needs that
                                bearer token or a scoped connection token)
  auxctl api                    the generated agent surface — manifest paths,
                                RPC method, one-line summary
  auxctl api <path> [json]      call one path with typed params
  auxctl api-docs               model-facing doc lines, same manifest
  auxctl api describe is auxctl api <path>: the input schema is MethodSchemas
                                for the printed method (see docs/AGENT-API.md)

  MCP clients (Codex, Claude Code) get the same surface as aux_* tools —
  create a scoped connection in Settings → External agents and merge the
  shown config; scoped authority follows the attached task/workspace.

== The loop ==

  1. auxctl pages                        open tabs and their stable pageIds
  2. auxctl observe <pageId>             compact observation; refs r1..rN valid
                                        until documentEpoch changes
  3. auxctl exec <pageId> <steps-json>   typed program: click/fill/navigate/
                                        extract/waitFor … (no fixed sleeps —
                                        waitFor + expect conditions)
  4. auxctl task receipt <taskId>        evidence, human review, unresolved
                                        actions and model costs for a saved task

== Rules that bite ==

  - Scoped connections only see pages attached to their task (plus run and
    preview-grant pages). Attach tabs in Aux or via a task-bound turn tab
    (aux.agent.turn.open) instead of trying to widen scope.
  - mutations go through pages.execute programs; a step's expect[] verifies
    before the next step — don't chain blind clicks.
  - event stream: /ws?token=…&afterSeq=N&streamId=S resumes after a durable
    cursor; a 'resync' frame means the cursor fell behind the retained
    floor or the store was recreated — refetch a snapshot, then continue
    from the frame's lastSeq. The SDK (AuxClient.events) and
    'auxctl events --follow' already speak this.
  - receipts are the authority boundary: agents record evidence; humans
    accept criteria in Aux. A verified criterion is not an accepted one.

Full protocol doc: docs/AUX-EXTERNAL-AGENTS.md
`);
      return;
    }

    case "bench":
      out(
        await rpc("bench.run", { task: args[0], repeats: flags.repeats ? Number(flags.repeats) : undefined }),
      );
      return;

    default:
      fail(`unknown command ${cmd} — try \`auxctl help\``);
  }
}

main().catch((e) => fail((e as Error).message));
