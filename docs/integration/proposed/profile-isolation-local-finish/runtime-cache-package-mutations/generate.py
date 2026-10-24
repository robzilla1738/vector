"""Derive exact removable pins from pinned supplied package metadata, offline."""
import csv,hashlib,json,pathlib,posixpath,difflib
HERE=pathlib.Path(__file__).resolve().parent
ASYNC=HERE.parent/'runtime-cache-async-integration'
ROOT=pathlib.Path('/Users/rcourson/Documents/Vibe/web')
RUNTIME=ROOT/'out/provided-candidate-final-local-completion-20261023/Aux.app/Contents/Resources/aux/agent-runtime'
PINS=RUNTIME.parent/'apps/daemon/Aux Daemon.app/Contents/Resources/native/runtime-source-pins.json'
sha=lambda b:hashlib.sha256(b).hexdigest()
original_inputs=json.loads((HERE.parent/'runtime-cache-validation/inputs.json').read_text())
assert sha(PINS.read_bytes())==original_inputs['inputs']['sourcePins']['sha256']
pins=json.loads(PINS.read_text());by={e['path']:e for e in pins['files']}
provenance=[]
def read(name):
 p=RUNTIME/name;data=p.read_bytes();entry=by[name]
 assert entry['type']=='file'
 # Authenticate even relocated text against original source bytes and counts.
 original=data
 if entry.get('anchors'):
  text=data.decode('utf8')
  for anchor in reversed(entry['anchors']):
   replacement=str(RUNTIME) if anchor.get('replacement')=='runtimeRoot' else anchor['replace']
   assert text.count(replacement)==anchor['count']
   text=text.replace(replacement,anchor['find'])
  original=text.encode('utf8')
 assert len(original)==entry['size'] and sha(original)==entry['sourceSha256']
 provenance.append({'path':str(p),'sha256':sha(data),'inventoryPath':name,'sourceSha256':entry.get('sourceSha256')})
 return data.decode('utf8')
env=read('env.sh');assert 'export VIRTUAL_ENV="$AUX_SKILL_RUNTIME/python/venv"' in env and 'export NPM_CONFIG_PREFIX="$AUX_SKILL_RUNTIME/node"' in env
assert 'exec "$runtime_dir/bin/python" -m pip "$@"' in read('bin/pip')
assert 'exec "$runtime_dir/node/bin/npm" "$@"' in read('bin/npm')
venv='python/venv';site=venv+'/lib/python3.13/site-packages';npm_root='node/lib/node_modules/npm'
assert "resolve(this.globalPrefix, 'lib', 'node_modules')" in read(npm_root+'/lib/npm.js')
assert "await arb.reify(opts)" in read(npm_root+'/lib/commands/uninstall.js')
assert "const npmInstall = args.find(arg => arg.startsWith('npm@') || arg === 'npm')" in read(npm_root+'/lib/commands/install.js')
assert 'requirement.uninstall(auto_confirm=True)' in read(site+'/pip/_internal/req/__init__.py')
assert 'uninstalled_pathset.remove(auto_confirm, verbose)' in read(site+'/pip/_internal/req/req_install.py')
uninstall=read(site+'/pip/_internal/req/req_uninstall.py');assert 'for path in uninstallation_paths(dist)' in uninstall and 'entries = dist.iter_declared_entries()' in uninstall
npm=json.loads(read(npm_root+'/package.json'));assert npm['name']=='npm' and npm['bin']=={'npm':'bin/npm-cli.js','npx':'bin/npx-cli.js'}
assert "require('../lib/cli.js')" in read(npm_root+'/bin/npm-cli.js')
assert 'pip._internal.cli.main' in read(site+'/pip/__main__.py')
# Actual fixed entrypoint targets, not a blanket exempt site-packages prefix.
fixed={name for name in by if name.startswith('bin/')}
fixed.update({'version.txt','env.sh','openssl.cnf','prepare-python.py','manifest.txt','node/bin/node','node/bin/npm','node/bin/npx',
 'python/venv/bin/python','python/venv/bin/python3','python/venv/bin/python3.13','python/venv/bin/pip','python/venv/bin/pip3','python/venv/bin/pip3.13',
 site+'/pip/__main__.py',site+'/pip/_internal/cli/main.py',npm_root+'/package.json',npm_root+'/lib/cli.js'})
fixed.update(npm_root+'/'+target for target in npm['bin'].values())
# Resolve all fixed symlink targets using authenticated inventory, not files.
for name in list(fixed):
 if name not in by:continue
 while by[name]['type']=='symlink':
  name=posixpath.normpath(posixpath.join(posixpath.dirname(name),by[name]['linkTarget']));assert name in by;fixed.add(name)
owned={}
records=[e['path'] for e in pins['files'] if e['type']=='file' and e['path'].startswith(site+'/') and e['path'].endswith('.dist-info/RECORD')]
for record in records:
 package=posixpath.basename(posixpath.dirname(record));location=posixpath.dirname(posixpath.dirname(record));assert location==site
 for row in csv.reader(read(record).splitlines()):
  assert row and row[0] and not row[0].startswith('/') and '\\' not in row[0]
  name=posixpath.normpath(posixpath.join(location,row[0]));assert name.startswith(venv+'/')
  if name in by and by[name]['type']!='directory':owned.setdefault(name,set()).add(package)
# npm's own global update replaces its exact package tree, including bundled
# dependencies. The actual global location/name come from the pinned code and
# package.json above. Emit individual existing pins, never a runtime prefix rule.
for name,e in by.items():
 if name.startswith(npm_root+'/') and e['type']!='directory':owned.setdefault(name,set()).add('npm@'+npm['version'])
# Include only pinned bytecode siblings which pip's actual uninstall path code
# explicitly derives from recorded .py files; never arbitrary directory contents.
for name,owners in list(owned.items()):
 if not name.endswith('.py'):continue
 parent,base=posixpath.dirname(name),posixpath.basename(name)[:-3]
 for candidate in [parent+'/'+base+'.pyc',parent+'/'+base+'.pyo']:
  if candidate in by:owned.setdefault(candidate,set()).update(owners)
 for candidate,e in by.items():
  if e['type']=='file' and posixpath.dirname(candidate)==parent+'/__pycache__' and posixpath.basename(candidate).startswith(base+'.cpython-313') and candidate.endswith('.pyc'):
   owned.setdefault(candidate,set()).update(owners)
mutable=set(owned)-fixed
# A package directory can vanish only when every pinned non-directory descendant
# belongs to the removable set. Shared/fixed containers remain non-removable.
containers={'bin','node','node/bin','node/lib','node/lib/node_modules','python','python/venv','python/venv/bin','python/venv/lib','python/venv/lib/python3.13',site,npm_root}
for name,e in by.items():
 if e['type']!='directory' or name in containers:continue
 descendants=[p for p,n in by.items() if p.startswith(name+'/') and n['type']!='directory']
 if descendants and all(p in mutable for p in descendants):mutable.add(name)
assert not mutable&fixed and not mutable&containers
assert site+'/openpyxl/__init__.py' in mutable
assert 'python/runtime/bin/python3.13' not in mutable and 'node/bin/node' not in mutable
allow=sorted(mutable)
lines=['// Generated exact removal allowlist. ENOENT only; never a prefix exemption.','constexpr const char* kAuxMutableRuntimePins[]={']+[json.dumps(name)+',' for name in allow]+['};','bool MissingMayBePackageMutation(const char* name){','  const auto begin=std::begin(kAuxMutableRuntimePins),end=std::end(kAuxMutableRuntimePins);','  const auto found=std::lower_bound(begin,end,name,[](const char* a,const char* b){return std::strcmp(a,b)<0;});','  return found!=end&&std::strcmp(*found,name)==0;','}']
(HERE/'source/AuxRuntimeMutablePins.inc').write_text('\n'.join(lines)+'\n')
base=(ASYNC/'source/AuxRuntimeCacheInspection.inc').read_text();expected=next(e['sha256'] for e in json.loads((ASYNC/'manifest.json').read_text())['files'] if e['path']=='source/AuxRuntimeCacheInspection.inc');assert sha(base.encode())==expected
text=base;changes=[('namespace aux_runtime_cache {','namespace aux_runtime_cache {\n#include "AuxRuntimeMutablePins.inc"'),('auto fail=[&](){if(errno==ENOENT)++result.missing;else ++result.unsafe;};','auto fail=[&](const Pin& pin){if(errno==ENOENT){if(MissingMayBePackageMutation(pin.path))++result.modified;else ++result.missing;}else ++result.unsafe;};'),('fail();','fail(pin);')]
counts=[1,1,4]
for (old,new),count in zip(changes,counts):assert text.count(old)==count,(old,text.count(old));text=text.replace(old,new)
(HERE/'source/AuxRuntimeCacheInspection.inc').write_text(text)
(HERE/'inspection.patch').write_text(''.join(difflib.unified_diff(base.splitlines(True),text.splitlines(True),fromfile='a/AuxRuntimeCacheInspection.inc',tofile='b/AuxRuntimeCacheInspection.inc')))
summary={'format':'aux.runtime-package-mutation-pins.v1','sourceInventorySha256':sha(PINS.read_bytes()),'recordCount':len(records),'npm':{'name':npm['name'],'version':npm['version'],'location':npm_root},'mutablePins':len(allow),'mutableFiles':sum(by[x]['type']=='file' for x in allow),'mutableLinks':sum(by[x]['type']=='symlink' for x in allow),'mutableDirectories':sum(by[x]['type']=='directory' for x in allow),'fixedPins':sorted(fixed&set(by)),'fixedContainers':sorted(containers),'provenance':provenance,'allowlist':allow}
(HERE/'provenance.json').write_text(json.dumps(summary,indent=2)+'\n')
manifest={'format':'aux.runtime-package-mutation-overlay.v1','active':False,'inputInspectionSha256':sha(base.encode()),'outputInspectionSha256':sha(text.encode()),'changes':[{'old':a,'new':b,'count':c} for (a,b),c in zip(changes,counts)],'addedInclude':'AuxRuntimeMutablePins.inc','addedIncludeSha256':sha((HERE/'source/AuxRuntimeMutablePins.inc').read_bytes()),'mutablePins':len(allow),'fixedPins':len(fixed&set(by))}
(HERE/'overlay.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({k:summary[k] for k in ['recordCount','mutablePins','mutableFiles','mutableLinks','mutableDirectories']}))
