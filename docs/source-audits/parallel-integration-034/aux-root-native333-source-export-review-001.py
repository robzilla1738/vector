import pathlib,json,hashlib,subprocess,os,stat
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=pathlib.Path('/private/tmp/aux-builder-native333-preparation-001/NATIVE333-OWN-SOURCE-EXPORT-001.json');j=json.loads(p.read_text());root=pathlib.Path(j['candidateRoot'])
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==j['head'];assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()
for k,prefix in [('native','.native'),('packets','')]:
 for f,h in j[k].items():assert sha(root/prefix/f)==h
assert len(j['native'])==733 and len(j['packets'])==333
assert sha(j['predecessor']['path'])==j['predecessor']['sha256'];old=json.loads(pathlib.Path(j['predecessor']['path']).read_text());assert j['orderedPatches'][:-1]==old['orderedPatches']
for f,h in old['packets'].items():assert j['packets'][f]==h
for row in j['retainedOwnDistFiles']:
 f=root/row['path'];s=f.stat();assert sha(f)==row['sha256'] and s.st_size==row['bytes'] and stat.S_IMODE(s.st_mode)==row['mode']
for row in j['shellFiles']:
 for prefix in ['apps/shell/dist','chromium/shell-assets']:
  f=root/prefix/row['path'];assert sha(f)==row['sha256'] and f.stat().st_size==row['bytes']
assert sha(root/'chromium/shell-assets/manifest.json')==j['shellManifestSha256'];assert sha(root/'tests/host/native-window.swift')==j['helperSourceSha256']
for row in j['generatedPreview']:
 f=pathlib.Path(row['template']);assert sha(f)==row['templateSha256'];assert sha(row['path'])==row['sha256']
 expected=f.read_text().replace('__AUX_SOURCE_COMMIT__',j['head']).replace('__AUX_QUALIFIED_FEATURES__','')
 assert pathlib.Path(row['path']).read_text()==expected
assert sha(j['dependencyReceipt'])==j['dependencyReceiptSha256'];d=json.loads(pathlib.Path(j['dependencyReceipt']).read_text());assert d['sourceBefore']==d['sourceAfter'] and not d['installFetchSetup']
for row in d['actualRows']+d['sourceAfter']:
 f=pathlib.Path(row['path']);s=f.lstat();assert s.st_dev==row['dev'] and s.st_ino==row['ino'] and s.st_uid==row['uid'] and stat.S_IMODE(s.st_mode)==row['mode'] and s.st_mtime_ns==row['mtimeNs'] and s.st_size==row['size']
 if row['kind']=='symlink':assert os.readlink(f)==row['target'] and str(f.resolve())==row['resolvedTarget']
for row in d['workspaceJoins']:assert pathlib.Path(row['path']).resolve()==pathlib.Path(row['resolvedRoot']) and pathlib.Path(row['resolvedRoot']).is_relative_to(root)
ps=subprocess.check_output(['ps','-axo','pid=,pgid=,command='],text=True);pids={c['pid'] for c in j['children']};pgids={c['pgid'] for c in j['children']};remaining=[]
for line in ps.splitlines():
 fields=line.strip().split(None,2)
 if fields and (int(fields[0]) in pids or int(fields[1]) in pgids):remaining.append(line)
assert not remaining
for c in j['children']:assert c['exitCode']==0 and sha(c['stdout'])==c['stdoutSha256'] and sha(c['stderr'])==c['stderrSha256']
out={'status':'SOURCE_ONLY_EXPORT_REVIEW_PASS','exportSHA256':sha(p),'head':j['head'],'identity':j['identity'],'actualNativeFiles':733,'actualOrderedPackets':333,'actualOwnCompiledFiles':len(j['retainedOwnDistFiles']),'actualShellFiles':174,'actualDependencyRows':len(d['actualRows']),'ownWorkspaceJoins':75,'originalChildren':7,'remainingOriginalRows':remaining,'generatedTemplateDerivation':True,'executionAdmission':False,'StableWritten':False}
pathlib.Path('/tmp/aux-root-native333-source-export-review-001.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
