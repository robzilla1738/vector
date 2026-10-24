"""Inert exact replay/ownership check; no Mach calls or product execution."""
from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent;m=json.loads((P/'manifest.json').read_text());rows=json.loads((P/'replacements.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for f in m['files']:
 p=P/'baseline'/f['path'];assert sha(p)==f['beforeSha256'];s=p.read_text()
 for r in rows:
  if r['path']!=f['path']:continue
  assert s.count(r['old'])==r['count']==1;s=s.replace(r['old'],r['new'])
 assert s==(P/'source'/f['path']).read_text() and sha(P/'source'/f['path'])==f['afterSha256']
for f in m['newFiles']:assert sha(P/'source'/f['path'])==f['sha256']
main=(P/'source/AuxNativeDaemonMain.cc').read_text()
assert main.index('const int crash_registration =')<main.index('InitializeAtFreshDaemonEntry()')<main.index('AuxTakeNativeParentEndpointForBootstrap()')
swift=(P/'source/AuxDevelopmentOwnerDrain.swift').read_text()
assert swift.index('guard status==0')<swift.index('let crashStatus=')<swift.index('try owner.completeBrowserCleanShutdown()')
helper=(P/'source/AuxInheritedCrashRegistration.cc').read_text()
assert helper.index('!s.inherited.Same(s.current)')<helper.index('task_set_exception_ports')<helper.index('s.inherited.Release()')<helper.index('s.closed = true;')
result=dict(passed=True,kind='literal replay and exact native ownership-order checks',files=len(m['files']),anchors=len(rows),nativeCompiled=False,taskPortsAccessed=False,runtimeAccepted=False)
(P/'source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
