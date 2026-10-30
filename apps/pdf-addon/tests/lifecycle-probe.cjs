'use strict';
// Drives one aux-pdf.node through reentrancy, the admission count and native closure, and prints
// what it saw as JSON. Run in its own process: closure is permanent for the loaded image.
//   node lifecycle-probe.cjs <aux-pdf.node> <some.pdf>
const ffi = require('node:ffi');
const { Worker } = require('node:worker_threads');
const [file, pdfFile] = process.argv.slice(2);
const attempt = (f) => { try { return f(); } catch (error) { return `${error.constructor.name}: ${error.message}`; } };
const abi = () => ffi.dlopen(file, {
  AuxPdfPendingOperations: { parameters: [], return: 'uint64' },
  AuxPdfCloseAdmissionAndDrain: { parameters: [], return: 'int32' },
}).functions;
const pending = () => String(abi().AuxPdfPendingOperations());
const close = () => abi().AuxPdfCloseAdmissionAndDrain();
const pageCount = (result) => (typeof result === 'string' ? result : result.pageCount);
const inWorker = () => new Promise((resolve) => {
  const worker = new Worker(`
    const { parentPort, workerData } = require('node:worker_threads');
    let output;
    try { output = require(workerData.file).pdf.extractText({ filePath: workerData.pdfFile }).pageCount; } catch (error) { output = 'throws ' + error.message; }
    parentPort.postMessage(output);`, { eval: true, workerData: { file, pdfFile } });
  worker.once('message', (output) => { worker.terminate(); resolve(output); });
});

(async () => {
  const seen = { beforeLoad: pending() };
  const { pdf } = require(file);
  seen.loaded = pending();
  // A getter runs JS while the call is admitted and holds the engine lock.
  seen.duringCall = {};
  seen.duringCall.result = pageCount(attempt(() => pdf.extractText({ get filePath() {
    seen.duringCall.pending = pending();
    seen.duringCall.recursive = attempt(() => pdf.getFormFields({ filePath: pdfFile }));
    return pdfFile;
  } })));
  seen.afterCall = pending();
  seen.worker = await inWorker();
  seen.closeDuringCall = {};
  seen.closeDuringCall.output = pageCount(attempt(() => pdf.extractText({ get filePath() {
    seen.closeDuringCall.result = close();
    seen.closeDuringCall.pending = pending();
    return pdfFile;
  } })));
  seen.afterClose = pending();
  seen.methodsAfterClose = Object.keys(pdf).sort().map((name) => attempt(() => pdf[name]({ filePath: pdfFile })));
  seen.noInputAfterClose = attempt(() => pdf.extractText());
  seen.workerAfterClose = await inWorker();
  seen.closeAgain = { result: close(), pending: pending() };
  process.stdout.write(JSON.stringify(seen));
})();
