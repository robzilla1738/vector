"""One inert replay check. Never opens ports, spawns, joins, or calls Crashpad."""
from pathlib import Path
import hashlib,json
P=Path(__file__).resolve().parent
m=json.loads((P/'manifest.json').read_text());rows=json.loads((P/'replacements.json').read_text())
sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
for f in m['files']:
 s=(P/'baseline'/f['path']).read_text();assert sha(s)==f['beforeSha256']
 for r in rows:
  if r['path']!=f['path']:continue
  assert s.count(r['old'])==r['count']==1
  s=s.replace(r['old'],r['new'])
 assert s==(P/'source'/f['path']).read_text() and sha(s)==f['afterSha256']
# Guard the precise changed boundary, not a claim about Mach/ES execution.
s=(P/'source/third_party/crashpad/crashpad/client/crashpad_client_mac.cc').read_text()
close=s[s.index('int CrashpadClient::CloseAuxBrowserRegistration()'):s.index('bool CrashpadClient::SetHandlerMachService')]
assert close.index('pthread_join')<close.index('SetCrashExceptionPorts(system.get())')<close.index('exception_port_.reset()')
assert 'handler.port != exception_port_.get()' in close
assert 'state.finished.load()' in close and 'return state.unknown ? 2 : 0' in close
assert s.index('delete self;\n    if (close_state) close_state->finished.store(true);')>0
result={'passed':True,'kind':'literal source replay and changed-boundary assertions only','files':len(m['files']),'anchors':len(rows),'nativeCompiled':False,'productExecuted':False,'crashHandlerStopped':False,'runtimeAccepted':False}
(P/'source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
