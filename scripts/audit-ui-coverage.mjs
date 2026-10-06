import { readFile, readdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Inventory integrity only. This cannot establish visual, behavioral or native correctness.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ledger = JSON.parse(
  await readFile(
    resolve(root, "docs/archive/2026-09-24-b0-reset/ui/component-transplant-ledger.json"),
    "utf8",
  ),
);
const errors = [];
const ids = new Set();
const files = new Set();
const counts = {};
for (const surface of ledger.surfaces) {
  if (ids.has(surface.id)) errors.push(`Duplicate surface: ${surface.id}`);
  ids.add(surface.id);
  counts[surface.status] = (counts[surface.status] ?? 0) + 1;
  for (const key of ["entryPoint", "treatment", "status", "nativeHostVerification"])
    if (!surface[key]) errors.push(`${surface.id}: missing ${key}`);
  for (const key of [
    "referenceDonors",
    "requiredStates",
    "visualEvidence",
    "functionalEvidence",
    "remaining",
  ])
    if (!Array.isArray(surface[key])) errors.push(`${surface.id}: missing ${key} inventory`);
  if (surface.component) {
    files.add(surface.component);
    try {
      await access(resolve(root, surface.component));
    } catch {
      errors.push(`${surface.id}: component path missing`);
    }
  }
  for (const evidence of surface.visualEvidence ?? []) {
    // Historical observations may be prose; validate entries explicitly recorded as local images.
    if (typeof evidence === "string" && /\.(png|jpe?g|webp)$/.test(evidence))
      try {
        await access(resolve(root, evidence));
      } catch {
        errors.push(`${surface.id}: image missing: ${evidence}`);
      }
  }
  if (
    surface.status === "qualified" &&
    (!surface.visualEvidence?.length ||
      !surface.functionalEvidence?.length ||
      surface.remaining?.length ||
      /pending|unproven|not run/i.test(surface.nativeHostVerification))
  )
    errors.push(`${surface.id}: qualification lacks evidence or retains open gates`);
}
const directory = "apps/shell/src/components";
for (const file of await readdir(resolve(root, directory))) {
  if (file.endsWith(".tsx") && !file.includes(".test.") && !files.has(`${directory}/${file}`))
    errors.push(`Untracked component: ${file}`);
}
const routes = new Set();
for (const route of ledger.referenceRoutes) {
  if (routes.has(route.route)) errors.push(`Duplicate reference route: ${route.route}`);
  routes.add(route.route);
  if (route.status === "mapped" && !ids.has(route.sharedImplementation))
    errors.push(`Unknown route implementation: ${route.route}`);
  if (route.status === "capability-gated" && !route.remaining)
    errors.push(`Unexplained capability exception: ${route.route}`);
}
console.log(
  JSON.stringify(
    {
      surfaces: ids.size,
      referenceRoutes: routes.size,
      statuses: counts,
      inventoryErrors: errors,
      qualification: "Incomplete until every supported requirement and applicable host journey is evidenced.",
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
