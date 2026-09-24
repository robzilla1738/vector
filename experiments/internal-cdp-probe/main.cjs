const { app, BrowserWindow, session } = require('electron');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const userData = mkdtempSync(join(tmpdir(), 'aux-internal-cdp-probe-'));
app.setPath('userData', userData);
process.on('exit', () => { try { rmSync(userData, { recursive: true, force: true }); } catch { /* temporary probe files only */ } });

const report = { electron: process.versions.electron, rawDebuggingPort: app.commandLine.hasSwitch('remote-debugging-port'), commands: {} };
const timeout = (work, label) => Promise.race([
  work,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), 5000)),
]);
const check = async (debuggerApi, method, params, label = method, sessionId) => {
  try {
    const result = await timeout(debuggerApi.sendCommand(method, params, sessionId), label);
    report.commands[label] = { ok: true, result };
    return result;
  } catch (error) {
    report.commands[label] = { ok: false, error: String(error) };
    return undefined;
  }
};

app.whenReady().then(async () => {
  const regular = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const otherProfile = session.fromPartition('aux-cdp-probe-other');
  const isolated = new BrowserWindow({ show: false, webPreferences: { session: otherProfile, nodeIntegration: false, contextIsolation: true } });
  await Promise.all([
    regular.loadURL('data:text/html,<title>Aux regular target</title><main>regular</main>'),
    isolated.loadURL('data:text/html,<title>Aux isolated target</title><main>isolated</main>'),
  ]);
  const debuggerApi = regular.webContents.debugger;
  debuggerApi.attach('1.3');
  await check(debuggerApi, 'Runtime.evaluate', { expression: 'document.title', returnByValue: true });
  await check(debuggerApi, 'Page.getFrameTree');
  await check(debuggerApi, 'Browser.getVersion');
  const targets = await check(debuggerApi, 'Target.getTargets');
  const isolatedTarget = targets?.targetInfos?.find(target => target.title === 'Aux isolated target');
  if (isolatedTarget) {
    const attached = await check(debuggerApi, 'Target.attachToTarget', { targetId: isolatedTarget.targetId, flatten: true }, 'Target.attachToTarget[isolated]');
    if (attached?.sessionId) {
      await check(debuggerApi, 'Runtime.evaluate', { expression: 'document.title', returnByValue: true }, 'Runtime.evaluate[isolated]', attached.sessionId);
      await check(debuggerApi, 'Target.detachFromTarget', { sessionId: attached.sessionId }, 'Target.detachFromTarget[isolated]');
    }
  }
  await check(debuggerApi, 'Target.setDiscoverTargets', { discover: true });
  debuggerApi.detach();
  report.regularWebContentsId = regular.webContents.id;
  report.isolatedWebContentsId = isolated.webContents.id;
  console.log(`AUX_INTERNAL_CDP_PROBE ${JSON.stringify(report)}`);
  const passed = !report.rawDebuggingPort && report.commands['Runtime.evaluate']?.ok
    && report.commands['Page.getFrameTree']?.ok && report.commands['Browser.getVersion']?.ok
    && report.commands['Target.getTargets']?.ok && report.commands['Target.attachToTarget[isolated]']?.ok
    && report.commands['Runtime.evaluate[isolated]']?.result?.result?.value === 'Aux isolated target';
  regular.destroy();
  isolated.destroy();
  app.exit(passed ? 0 : 1);
}).catch(error => {
  console.error(`AUX_INTERNAL_CDP_PROBE_ERROR ${String(error)}`);
  app.exit(1);
});
