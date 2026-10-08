import { runCloudFileWorker } from "./cloud-files-worker.js";
try {
  await runCloudFileWorker(process.argv[1] ?? "", process.argv[2] ?? "");
} catch (error) {
  process.stderr.write(error instanceof Error ? error.message : "Cloud file operation failed.");
  process.exitCode = 1;
}
