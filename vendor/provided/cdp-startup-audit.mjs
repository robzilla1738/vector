/** Static pinned-code contract audit; never imports or runs supplied code. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DAEMON_CODE_SHA256, adaptDaemonCode } from './daemon-adapter.mjs';
export function auditCdpStartup(original) {
  if (createHash('sha256').update(original).digest('hex') !== DAEMON_CODE_SHA256) throw new Error('Unrecognized supplied daemon');
  const checks = [
    ['no mandatory startup API wait', 'function getStartupWaitUrl(){return null}', 1],
    ['CDP host override and original default', 'ASIDE_BROWSER_CDP_HOST=process.env.ASIDE_BROWSER_CDP_HOST??`localhost:45103`', 1],
    ['HTTP host and port environment', 'configuredHost=process.env.ASIDE_HOST||`127.0.0.1`,HOST=LOOPBACK_HOSTS$1.has(configuredHost)?configuredHost:`127.0.0.1`,PORT=Number(process.env.ASIDE_PORT)||21420', 1],
    ['installation initialized first in bootstrap', 'async function bootstrap(){await ensureInstallationKey()', 1],
    ['ready set only after bootstrap resolves', 'await bootstrap(),clearTimeout(si),ri=!0', 1],
    ['CDP receives raw native-sign bytes', 'let ti=await signCdpChallenge(new Uint8Array(ei))', 1],
    ['CDP challenge route', 'this.#e(`/json/challenge`', 1],
    ['CDP session route', 'this.#e(`/json/auth/session`', 1],
    ['CDP session schema preserves original scheme', 'token_type:literal(`AsideSessionToken`)', 1],
    ['extension commands bypass CDP websocket', 'if(Cn.startsWith(`Aside.`)){let ti=await sendCommandToExtension', 1],
    ['startup session reconciliation waits for extension connect', 'globalExtensionBridge.onConnect(({accountId:Cn,profileId:ei,browserMode:ti})', 1],
    ['independent browser PID override is unused', 'process.env.ASIDE_BROWSER_PID', 0],
    ['independent parent watcher is absent', 'process.ppid', 0],
  ].map(([name, anchor, count]) => {
    const actual = original.split(anchor).length - 1;
    if (actual !== count) throw new Error(`${name}: expected ${count}, found ${actual}`);
    return { name, anchor, count };
  });
  return { sourceSha256: DAEMON_CODE_SHA256, adaptedCodeSha256: adaptDaemonCode(original).sha256,
    verification: 'static anchors only; not daemon/CDP/native execution or whole-program deadlock proof', checks };
}
if (process.argv[2]) console.log(JSON.stringify(auditCdpStartup(readFileSync(process.argv[2], 'utf8')), null, 2));
