#!/usr/bin/env node
/**
 * Smoke test: load the addon, open a data: URL, observe it, run a program.
 * Prints the parsed results and exits non-zero on any failure. Does not
 * need the fixture servers or the network.
 */
import { Engine, describe, binaryPath } from "../index.js";

const parse = (s) => JSON.parse(s);
const must = (v, what) => {
  if (!v.ok) throw new Error(`${what} failed: ${JSON.stringify(v.error)}`);
  return v;
};

console.log("binary:", binaryPath);
console.log("describe:", describe());
const engine = new Engine(JSON.stringify({ offline: true }));
const opened = must(parse(await engine.open(1, "data:text/html,<title>Smoke</title><h1>Hello</h1><label for=n>Name</label><input id=n><button id=b>Send</button>")), "open");
console.log("open:", JSON.stringify(opened));
const observed = must(parse(await engine.observe(opened.page, JSON.stringify({ scope: "full" }))), "observe");
const c = observed.content;
const keys = ["url", "title", "viewport", "scroll", "frames", "text", "headings", "elements", "formFields", "tables", "links", "dialogs", "truncated", "stats"];
for (const k of keys) if (!(k in c)) throw new Error(`ObservationContent missing ${k}`);
console.log("observe:", JSON.stringify({ title: c.title, headings: c.headings, elements: c.elements.map((e) => `${e.ref}:${e.role}:${e.name ?? ""}`), stats: c.stats, revision: observed.revision, generation: observed.generation }));
const input = c.elements.find((e) => e.tag === "input");
const run = must(
  parse(
    await engine.execute(
      opened.page,
      JSON.stringify([
        { id: "f", op: "fill", target: input.ref, value: "Ada" },
        { id: "x", op: "extract", fields: [{ name: "v", selector: "#n", attribute: "value" }], as: "out" },
      ]),
      JSON.stringify({ returnObservation: { scope: "forms" } }),
    ),
  ),
  "execute",
);
console.log("execute:", JSON.stringify({ status: run.status, steps: run.steps.map((s) => `${s.stepId}:${s.status}`), extracted: run.extracted, formFields: run.observation.content.formFields }));
if (run.status !== "completed" || run.extracted.out.v !== "Ada") throw new Error("program did not fill the field");
const closed = parse(await engine.close(opened.page));
console.log("close:", JSON.stringify(closed));
engine.shutdown();
console.log("smoke ok");
