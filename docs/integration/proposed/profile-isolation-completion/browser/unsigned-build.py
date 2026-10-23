#!/usr/bin/env python3
"""Run the genuine isolated Ninja graph after unsigned-link and action review."""
import argparse,pathlib,hashlib,json,subprocess,time,re
H=pathlib.Path(__file__).resolve().parent;N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);p.add_argument('--build',action='store_true');a=p.parse_args();O=pathlib.Path(a.snapshot).resolve();S=O/'src';B=S/'out/AuxFast';R=O/'unsigned-build'
prior=json.loads((O/'build-preparation.json').read_text())
if not prior['passed']:raise SystemExit('initial preparation must pass')
if R.exists():raise SystemExit('fresh build receipt directory required')
R.mkdir();cfg=S/'build/config/mac/BUILD.gn';baseline=sha(N/'build/config/mac/BUILD.gn')
if sha(cfg)!=baseline:raise SystemExit('link config not matching shared snapshot baseline')
s=cfg.read_text();needle='  ldflags = common_mac_flags\n';assert s.count(needle)==1
cfg.write_text(s.replace(needle,needle+'  # This isolated local candidate must not be implicitly ad-hoc signed.\n  ldflags += [ "-Wl,-no_adhoc_codesign" ]\n'))
r={'format':'aux.chromium.unsigned-full-build.v1','passed':False,'prepared':False,'source':str(S),'sharedLinkConfigSha256':baseline,'isolatedLinkConfigSha256':sha(cfg),'coldFeatureEnabled':False,'appExecuted':False,'signed':False,'runs':[]}
try:
 for name,cmd in [('gn',[str(S/'buildtools/mac/gn'),'gen',str(B)]),('dryrun',[str(S/'third_party/ninja/ninja'),'-C',str(B),'-n','chrome']),('commands',[str(S/'third_party/ninja/ninja'),'-C',str(B),'-t','commands','chrome'])]:
  t=time.monotonic();run=subprocess.run(cmd,cwd=S,capture_output=True,text=True);(R/(name+'.log')).write_text(run.stdout+run.stderr);r['runs'].append({'name':name,'command':cmd,'exitCode':run.returncode,'seconds':time.monotonic()-t})
  if run.returncode:raise RuntimeError(name+' failed')
 commands=(R/'commands.log').read_text().splitlines()
 forbidden=[x[:800] for x in commands if re.search(r'(^|[ /])codesign(?:\s|$)|(^|[ /])productsign(?:\s|$)|notarytool',x)]
 if forbidden:raise RuntimeError('signing action exists: '+str(forbidden[:3]))
 links=[x for x in commands if 'linker_driver.py' in x]
 if not links or any('-no_adhoc_codesign' not in x for x in links):raise RuntimeError('unsigned flag missing in actual link command')
 r['reviewedCommandCount']=len(commands);r['reviewedLinkCount']=len(links);r['dryRunActionCount']=sum(bool(re.match(r'^\[\d+/\d+\]',x)) for x in (R/'dryrun.log').read_text().splitlines());r['prepared']=True
 (R/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
 if a.build:
  cmd=[str(S/'third_party/ninja/ninja'),'-C',str(B),'-j4','chrome'];t=time.monotonic()
  with (R/'build.log').open('w') as log:run=subprocess.run(cmd,cwd=S,stdout=log,stderr=subprocess.STDOUT)
  r['runs'].append({'name':'full-build','command':cmd,'exitCode':run.returncode,'seconds':time.monotonic()-t});r['passed']=run.returncode==0
finally:
 r['sharedLinkConfigUnchanged']=sha(N/'build/config/mac/BUILD.gn')==baseline;(R/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'prepared':r['prepared'],'passed':r['passed'],'receipt':str(R/'receipt.json')}))
