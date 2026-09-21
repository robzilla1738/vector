import {parentPort,workerData} from "node:worker_threads";
import {exportWorkbook} from "./workbook-export.js";
void exportWorkbook(workerData.content,workerData.format).then(bytes=>parentPort?.postMessage({bytes})).catch(error=>parentPort?.postMessage({error:error instanceof Error?error.message:"Could not export the workbook."}));
