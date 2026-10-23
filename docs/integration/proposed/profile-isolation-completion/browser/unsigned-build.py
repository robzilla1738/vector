#!/usr/bin/env python3
"""Run the genuine isolated Ninja graph after unsigned-link and action review."""
import argparse,pathlib,hashlib,json,subprocess,time,re,os,stat,struct
H=pathlib.Path(__file__).resolve().parent;N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);p.add_argument('--build',action='store_true');p.add_argument('--resume-custody',action='store_true');p.add_argument('--receipt-name',default='');p.add_argument('--resume-reviewed',default='');a=p.parse_args();O=pathlib.Path(a.snapshot).resolve();S=O/'src';B=S/'out/AuxFast';R=O/(a.receipt_name or ('unsigned-custody-build' if a.resume_custody else 'unsigned-direct-build'))
if R.parent!=O or not R.name.startswith('unsigned-'):raise SystemExit('receipt name must be a direct unsigned- child')
prior=json.loads((O/'build-preparation.json').read_text())
if not prior['passed']:raise SystemExit('initial preparation must pass')
if R.exists():raise SystemExit('fresh build receipt directory required')
R.mkdir();cfg=S/'build/config/mac/BUILD.gn';baseline=sha(N/'build/config/mac/BUILD.gn')
s=(N/'build/config/mac/BUILD.gn').read_text();needle='  ldflags = common_mac_flags\n';assert s.count(needle)==1
unsigned=s.replace(needle,needle+'  # This isolated local candidate must not be implicitly ad-hoc signed.\n  ldflags += [ "-Wl,-no_adhoc_codesign" ]\n')
if cfg.read_text() not in [s,unsigned]:raise SystemExit('link config not matching exact unsigned successor')
if cfg.read_text()!=unsigned:cfg.write_text(unsigned)
r={'format':'aux.chromium.unsigned-full-build.v1','passed':False,'prepared':False,'source':str(S),'sharedLinkConfigSha256':baseline,'isolatedLinkConfigSha256':sha(cfg),'coldFeatureEnabled':False,'appExecuted':False,'signed':False,'runs':[]}
try:
 activation=O/'approved-host-tool-filter-activation.json'
 if activation.exists():
  authorized=json.loads(activation.read_text())
  if sha(S/'build/toolchain/apple/linker_driver.py')!=authorized['linkerDriverSHA256'] or sha(S/'build/toolchain/apple/aux_host_link_filter.py')!=authorized['filterSHA256']:raise RuntimeError('authorized host filter changed')
  r['approvedBuildToolOnlyAdHoc']=authorized;r['productSigned']=False
 reuse=None
 if a.resume_custody:
  reuse=O/(a.resume_reviewed or 'unsigned-direct-build')
  if reuse.parent!=O:raise RuntimeError('invalid review path')
  old=json.loads((reuse/'receipt.json').read_text())
  if old['isolatedLinkConfigSha256']!=sha(cfg) or any(not any(x['name']==name and x['exitCode']==0 for x in old['runs']) for name in ['gn','dryrun']):raise RuntimeError('prior graph did not pass')
  custody=json.loads((O/'custody-source-receipt.json').read_text())
  for name,x in custody.items():
   if sha(S/'chrome/browser/aux'/name)!=x['afterSHA256']:raise RuntimeError('custody source mismatch')
  r['custodySources']=custody;r['reusedGraphReceiptSha256']=sha(reuse/'receipt.json')
 for name,cmd in [('gn',[str(S/'buildtools/mac/gn'),'gen',str(B)]),('dryrun',[str(S/'third_party/ninja/ninja'),'-C',str(B),'-n','chrome']),('commands',[str(S/'third_party/ninja/ninja'),'-C',str(B),'-t','commands','chrome'])]:
  if reuse and (name in ['gn','dryrun'] or (name=='commands' and a.resume_reviewed and old.get('prepared'))):
   (R/(name+'.log')).write_bytes((reuse/(name+'.log')).read_bytes());r['runs'].append(dict(next(x for x in old['runs'] if x['name']==name),reused=True));continue
  t=time.monotonic()
  with (R/(name+'.log')).open('wb') as log:run=subprocess.run(cmd,cwd=S,stdout=log,stderr=subprocess.STDOUT)
  r['runs'].append({'name':name,'command':cmd,'exitCode':run.returncode,'seconds':time.monotonic()-t})
  if run.returncode:raise RuntimeError(name+' failed')
 commands=(R/'commands.log').read_text(errors='replace').splitlines()
 forbidden=[x[:800] for x in commands if re.search(r'(^|[ /])codesign(?:\s|$)|(^|[ /])productsign(?:\s|$)|notarytool',x)]
 if forbidden:raise RuntimeError('signing action exists: '+str(forbidden[:3]))
 links=[x for x in commands if 'linker_driver.py' in x]
 if not links or any('-no_adhoc_codesign' not in x for x in links):raise RuntimeError('unsigned flag missing in actual link command')
 r['commandInventorySha256']=sha(R/'commands.log');r['currentBuildGraphSha256']=sha(B/'build.ninja')
 r['reviewedCommandCount']=len(commands);r['reviewedLinkCount']=len(links);r['dryRunActionCount']=sum(bool(re.match(r'^\[\d+/\d+\]',x)) for x in (R/'dryrun.log').read_text().splitlines());r['prepared']=True
 (R/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
 if a.build:
  cmd=[str(S/'third_party/ninja/ninja'),'-C',str(B),'-j4','chrome'];t=time.monotonic()
  with (R/'build.log').open('w') as log:run=subprocess.run(cmd,cwd=S,stdout=log,stderr=subprocess.STDOUT)
  r['runs'].append({'name':'full-build','command':cmd,'exitCode':run.returncode,'seconds':time.monotonic()-t});r['passed']=run.returncode==0
  if r['passed']:
   app=B/'Aux.app'
   if not app.is_dir():raise RuntimeError('expected Aux.app missing')
   leaves=[];macho=[]
   for path in sorted(app.rglob('*')):
    info=path.lstat();name=str(path.relative_to(app))
    if stat.S_ISLNK(info.st_mode):
     target=os.readlink(path)
     if not path.resolve().is_relative_to(app.resolve()):raise RuntimeError('outside app link: '+name)
     leaves.append({'path':name,'type':'symlink','target':target,'mode':stat.S_IMODE(info.st_mode)})
    elif stat.S_ISREG(info.st_mode):
     leaves.append({'path':name,'type':'file','sha256':sha(path),'bytes':info.st_size,'mode':stat.S_IMODE(info.st_mode)})
     with path.open('rb') as f: header=f.read(32)
     if header[:4] in [b'\xca\xfe\xba\xbe',b'\xbe\xba\xfe\xca',b'\xca\xfe\xba\xbf',b'\xbf\xba\xfe\xca',b'\xce\xfa\xed\xfe',b'\xfe\xed\xfa\xce',b'\xfe\xed\xfa\xcf']:
      probe=subprocess.run(['/usr/bin/otool','-l',str(path)],capture_output=True,text=True)
      if probe.returncode:raise RuntimeError('Mach-O inspection refused: '+name)
      macho.append({'path':name,'hasCodeSignatureLoadCommand':'LC_CODE_SIGNATURE' in probe.stdout,'inspection':'otool-all-architectures'})
     if len(header)>=32 and header[:4]==b'\xcf\xfa\xed\xfe':
      count,size=struct.unpack_from('<II',header,16)
      with path.open('rb') as f:f.seek(32);data=f.read(size)
      offset=0;signed=False
      for _ in range(count):
       if offset+8>len(data):raise RuntimeError('invalid Mach-O commands: '+name)
       command,length=struct.unpack_from('<II',data,offset)
       if length<8 or offset+length>len(data):raise RuntimeError('invalid Mach-O command length')
       signed |= command==0x1d;offset+=length
      macho.append({'path':name,'hasCodeSignatureLoadCommand':signed})
   # Re-read every regular file to detect an output mutation during inventory.
   if not all(sha(app/x['path'])==x['sha256'] for x in leaves if x['type']=='file'):raise RuntimeError('app changed during inventory')
   payload=json.dumps(leaves,sort_keys=True,separators=(',',':')).encode()
   (R/'app-inventory.json').write_text(json.dumps(leaves,indent=2)+'\n')
   (R/'macho-inventory.json').write_text(json.dumps(macho,indent=2)+'\n')
   r.update(appPath=str(app),appLeafCount=len(leaves),appInventorySha256=hashlib.sha256(payload).hexdigest(),appInventoryFileSha256=sha(R/'app-inventory.json'),appStableDuringInventory=True,machoCount=len(macho),allInspectedMachoUnsigned=all(not x['hasCodeSignatureLoadCommand'] for x in macho))
   if not macho or not r['allInspectedMachoUnsigned']:raise RuntimeError('native app contains signed Mach-O or none inspected')

except Exception as e:
 r['passed']=False;r['error']=str(e)
finally:
 r['sharedLinkConfigUnchanged']=sha(N/'build/config/mac/BUILD.gn')==baseline;(R/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'prepared':r['prepared'],'passed':r['passed'],'receipt':str(R/'receipt.json')}))
if not r['prepared'] or (a.build and not r['passed']):raise SystemExit(1)
