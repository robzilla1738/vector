#!/usr/bin/env python3
"""Collect one receipt-pinned final artifact identity review; no product mutation."""
import argparse
import hashlib
import json
from pathlib import Path
import plistlib
import re
import xml.etree.ElementTree as ET

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--receipt',type=Path,required=True)
parser.add_argument('--receipt-sha256',required=True)
parser.add_argument('--repository',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
a=parser.parse_args()
sha=lambda data:hashlib.sha256(data).hexdigest()
raw=a.receipt.read_bytes()
if sha(raw)!=a.receipt_sha256:raise ValueError('Whole unsigned receipt changed')
receipt=json.loads(raw);app=Path(receipt['app'])
expected=a.repository/'out/provided-candidate-completion-20261026-a1/Aux.app'
if app!=expected or receipt.get('passed') is not True or receipt.get('productSigned') is not False or receipt.get('productExecuted') is not False:raise ValueError('Exact successful unsigned/unexecuted successor receipt required')
rows={row['path']:row for row in receipt['files']}
if len(rows)!=len(receipt['files']):raise ValueError('Duplicate full inventory leaf')
reads=[]
def read(relative):
 row=rows[relative];path=app/relative
 if row['type']!='file' or path.is_symlink():raise ValueError('Pinned regular artifact required: '+relative)
 data=path.read_bytes()
 if sha(data)!=row['sha256'] or path.lstat().st_mode&0o777!=row['mode']:raise ValueError('Artifact differs: '+relative)
 reads.append({'path':relative,'sha256':row['sha256'],'bytes':len(data)})
 return data
prefix='Contents/Resources/aux/'
bundle=json.loads(read(prefix+'bundle.json'));current=bundle['currentCompletionIntegration']
changed=[item['relative'] for item in current['replacements']]
selected=[path for path in changed if Path(path).suffix in {'.js','.mjs','.cjs','.json'}]
patterns={
 'oldProductEndpoint':re.compile(r'(?i)(?:https?|wss?)://[^\s\"\x27`<>\\]*(?:asidehq\.com|aside\.com|aside\.dev)[^\s\"\x27`<>\\]*'),
 'oldPrivateGlobal':re.compile(r'\b__aside[A-Za-z0-9_$]*\b'),
 'oldNamedIdentity':re.compile(r'(?<![A-Za-z0-9_])(?:Aside[A-Za-z0-9_$.:/-]*|aside[A-Za-z0-9_$.:/-]*)(?![A-Za-z0-9_])'),
 'vaultProduct':re.compile(r'(?i)(?:\bAux Vault\b|\bAside Vault\b|(?:apps|skills|routes)/vault\b|vault\.setup|vault\.unlock|AsidePasswordImporterProvider|aside-credential-exchange|aside-password-importer)')}
findings=[]
for relative in selected:
 text=read(relative).decode('utf8');groups={}
 for kind,pattern in patterns.items():
  for match in pattern.finditer(text):
   key=(kind,match.group());item=groups.setdefault(key,{'kind':kind,'token':match.group(),'count':0,'contexts':[]});item['count']+=1
   if len(item['contexts'])<6:item['contexts'].append({'byteOffset':len(text[:match.start()].encode()),'line':text.count('\n',0,match.start())+1,'context':text[max(0,match.start()-140):match.end()+160]})
 findings.append({'path':relative,'sha256':rows[relative]['sha256'],'findings':list(groups.values())})
manifest_paths=[prefix+'apps/extension/dist/manifest.json',prefix+'apps/extension/dist/main.html']
extra=[]
for relative in manifest_paths:
 if relative in rows:
  text=read(relative).decode('utf8');extra.append({'path':relative,'oldEndpoints':patterns['oldProductEndpoint'].findall(text),'vaultProduct':patterns['vaultProduct'].findall(text),'text':text if relative.endswith('manifest.json') else None})
name_hits=[row for row in receipt['files'] if re.search(r'(?i)aside|(?:^|[/_.-])vault(?:[/_.-]|$)',row['path'])]
canonical=(a.repository/'assets/brand/arch-mark.svg').read_bytes()
geometry=lambda data:{'viewBox':ET.fromstring(data).get('viewBox'),'paths':[path.get('d') for path in ET.fromstring(data).iter('{http://www.w3.org/2000/svg}path')]}
logo={'canonical':{'path':'assets/brand/arch-mark.svg','sha256':sha(canonical),'geometry':geometry(canonical)},'brandInputs':bundle.get('brandInputs'),'vectors':[],'appIcon':None}
for row in receipt['files']:
 relative=row['path'];name=Path(relative).name.lower()
 if row['type']=='file' and name.endswith('.svg') and ('aux' in name or 'arch-mark' in name):
  data=read(relative)
  try:shape=geometry(data)
  except ET.ParseError:continue
  logo['vectors'].append({'path':relative,'sha256':sha(data),'geometry':shape,'canonicalPathsExact':shape['paths']==logo['canonical']['geometry']['paths']})
info=plistlib.loads(read('Contents/Info.plist'))
icon=info.get('CFBundleIconFile')
if icon:
 relative='Contents/Resources/'+icon+('' if icon.endswith('.icns') else '.icns')
 if relative in rows:
  data=read(relative);canonical_icon=(a.repository/'assets/brand/Aux.icns').read_bytes()
  logo['appIcon']={'path':relative,'sha256':sha(data),'canonicalDerivedIconSha256':sha(canonical_icon),'canonicalDerivedBytesExact':data==canonical_icon}
if sha(a.receipt.read_bytes())!=a.receipt_sha256:raise ValueError('Receipt changed during audit')
result={'format':'aux.final-artifact.identity-evidence.v1','receipt':{'path':str(a.receipt),'sha256':a.receipt_sha256},'app':str(app),'inventorySha256':receipt['inventorySha256'],'inventoryLeaves':len(rows),'selectedChangedTextFiles':selected,'reads':reads,'findings':findings,'filenameHits':name_hits,'carriedManifestReview':extra,'logo':logo,'bundleIdentity':{'excludedProducts':bundle.get('excludedProducts'),'excludedFiles':bundle.get('excludedFiles'),'passwordManager':bundle.get('passwordManager')},'nativeInfo':{key:value for key,value in info.items() if key.startswith('CFBundle') or key.startswith('NSHumanReadable')},'wholeIdentityComplete':False,'runtimeVerified':False,'thirdPartyTreesRescanned':False,'productEdited':False,'signed':False,'executed':False}
a.output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'output':str(a.output),'changedTexts':len(selected),'readLeaves':len(reads),'filenameHits':len(name_hits),'wholeIdentityComplete':False}))
