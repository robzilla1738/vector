import { cloudListeners, superviseCloudProcess } from "./cloud-process-worker.js";
try {
  const input = JSON.parse(process.argv[1] ?? "{}");
  if (input.kind === "start") await superviseCloudProcess(input);
  else if (input.kind === "listeners")
    process.stdout.write(JSON.stringify(await cloudListeners(input.supervisor, input.port)));
  else throw new Error("Unknown cloud process operation.");
} catch (error) {
  process.stderr.write(error instanceof Error ? error.message : "Cloud process operation failed.");
  process.exitCode = 125;
}
