import { workerData } from "node:worker_threads";

// Document import and workbook export share one worker bundle so exceljs ships once.
// Each task module runs on load; only the requested one is evaluated.
if (workerData.task === "export") void import("./workbook-export-worker.js");
else void import("./document-extract.js");
