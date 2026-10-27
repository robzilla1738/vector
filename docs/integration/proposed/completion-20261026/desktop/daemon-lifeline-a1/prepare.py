#!/usr/bin/env python3
"""Derive the daemon lifeline repair from the current signed candidate's daemon entry."""
import hashlib, json, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parents[6]
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
RECEIPT = APP.parent/'combined-split-multipane-a1/receipt.json'
OUT = ROOT/'out/live-inputs/completion-20261026/daemon-lifeline-a1'
sha = lambda data: hashlib.sha256(data).hexdigest()
# The supplied SIGTERM/SIGINT handler starts a graceful shutdown but never exits;
# after a browser abort a live handle keeps the daemon running. Bound that
# shutdown, and start it when the supervising browser (AUX_BROWSER_PID) is gone.
FIND = 'for(let Cn of[`SIGTERM`,`SIGINT`])process.on(Cn,()=>{logger.info(`[Main] Received ${Cn}; shutting down gracefully`),ii()});'
REPLACE = ('for(let Cn of[`SIGTERM`,`SIGINT`])process.on(Cn,()=>{logger.info(`[Main] Received ${Cn}; shutting down gracefully`),ii(),setTimeout(()=>process.exit(0),1e4).unref()});'
           '{let auxBrowserPid=Number(process.env.AUX_BROWSER_PID);if(auxBrowserPid>0&&process.ppid===auxBrowserPid){let auxLifeline=setInterval(()=>{process.ppid!==auxBrowserPid&&(clearInterval(auxLifeline),logger.info(`[Main] Browser exited; shutting down`),process.kill(process.pid,`SIGTERM`))},1e3);auxLifeline.unref()}}')
rows = {row['path']: row for row in json.loads(RECEIPT.read_text())['files']}
OUT.mkdir(parents=True, exist_ok=False)
result = {'format': 'aux.daemon-lifeline-repair.v1', 'signedReceipt': {'path': str(RECEIPT), 'sha256': sha(RECEIPT.read_bytes())}, 'outputs': {}}
for name in ('index.mjs', 'aux-native-entry.mjs'):
    data = (APP/DAEMON/name).read_bytes()
    if sha(data) != rows[DAEMON+name]['sha256']: raise SystemExit('Candidate preimage changed: '+name)
    if name == 'index.mjs':
        text = data.decode()
        if text.count(FIND) != 1 or 'AUX_BROWSER_PID' in text: raise SystemExit('Daemon shutdown anchor drift')
        data = text.replace(FIND, REPLACE).encode()
    (OUT/name).write_bytes(data)
    result['outputs'][name] = {'path': str(OUT/name), 'beforeSha256': rows[DAEMON+name]['sha256'], 'sha256': sha(data)}
result['edit'] = {'find': FIND, 'replace': REPLACE, 'count': 1}
(OUT/'preparation-receipt.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result['outputs'], indent=2))
