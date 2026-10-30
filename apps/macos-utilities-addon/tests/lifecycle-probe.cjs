'use strict';
// Drives one addon through Environment attach, worker teardown and native closure, and prints
// what it saw as JSON. Run in its own process: closure is permanent for the loaded image.
//   node lifecycle-probe.cjs <addon.node>
const ffi = require('node:ffi');
const { Worker } = require('node:worker_threads');
const file = process.argv[2];
const attempt = (f) => { try { return f(); } catch (error) { return `${error.constructor.name}: ${error.message}`; } };
const abi = () => ffi.dlopen(file, {
  AuxMacUtilityPendingEnvironments: { parameters: [], return: 'uint64' },
  AuxMacUtilityCloseAdmissionAndDrain: { parameters: [], return: 'int32' },
}).functions;
const pending = () => String(abi().AuxMacUtilityPendingEnvironments());
const close = () => abi().AuxMacUtilityCloseAdmissionAndDrain();

// A worker that loads the addon, reports one run, and stays alive until terminated.
const worker = () => new Promise((resolve) => {
  const thread = new Worker(`
    const { parentPort, workerData } = require('node:worker_threads');
    let output;
    try { output = require(workerData).run('copy-file', '{}'); } catch (error) { output = 'throws ' + error.message; }
    parentPort.postMessage(output);
    setInterval(() => {}, 1000);`, { eval: true, workerData: file });
  thread.once('message', (output) => resolve({ output, thread }));
});

(async () => {
  const seen = { beforeLoad: pending() };
  const addon = require(file);
  seen.mainLoaded = pending();
  const first = await worker();
  seen.worker = { output: first.output, pending: pending() };
  await first.thread.terminate();
  seen.afterWorkerExit = pending();
  seen.close = { result: close(), pending: pending() };
  seen.runAfterClose = attempt(() => addon.run('copy-file', '{}'));
  const second = await worker();
  seen.workerAfterClose = second.output;
  await second.thread.terminate();
  seen.closeAgain = { result: close(), pending: pending() };
  process.stdout.write(JSON.stringify(seen));
})();
