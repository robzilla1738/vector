#!/usr/bin/env python3
import hashlib,json,subprocess,tempfile
from pathlib import Path
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
 tree=Path(tmp)
 for item in manifest['files']:
  path=item['path']; baseline=item['baselineSha256']
  if baseline:
   data=(root/'baseline'/path).read_bytes()
   assert hashlib.sha256(data).hexdigest()==baseline
   current=data.decode()
   for anchor in item['anchors']:
    assert current.count(anchor['find'])==anchor['count']==1
    current=current.replace(anchor['find'],anchor['replace'])
   assert current.encode()==(root/'source'/path).read_bytes()
   target=tree/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 subprocess.run(['git','apply','--unsafe-paths',str(root/'native.patch')],cwd=tree,check=True)
 for item in manifest['files']:
  data=(tree/item['path']).read_bytes()
  assert hashlib.sha256(data).hexdigest()==item['outputSha256']
  assert data==(root/'source'/item['path']).read_bytes()
print('PASS: all counted anchors, input/output hashes and exact patch replay')

# LINT-coupled metric values must agree exactly, without touching old IDs.
import re
import xml.etree.ElementTree as ET
header=(root/'source/extensions/browser/extension_function_histogram_value.h').read_text()
xml=ET.parse(root/'source/tools/metrics/histograms/metadata/extensions/enums.xml')
entries=xml.find(".//enum[@name='ExtensionFunctions']")
assert entries is not None
names=['AUXBROWSERPREFERENCES_GETKEYBOARDSHORTCUTS',
       'AUXBROWSERPREFERENCES_SETKEYBOARDSHORTCUT',
       'AUXBROWSERPREFERENCES_RESETKEYBOARDSHORTCUT',
       'AUXBROWSERPREFERENCES_SETSHORTCUTHANDLINGSUSPENDED']
for value,name in enumerate(names,2089):
 assert len(re.findall(r'\b'+name+r' = '+str(value)+r',',header))==1
 assert len([entry for entry in entries if entry.get('value')==str(value) and entry.get('label')==name])==1
print('PASS: histogram declarations/XML2089–2092 agree exactly')
