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

import re
header=(root/'source/chrome/browser/ui/actions/chrome_action_id.h').read_text()
actions=(root/'source/chrome/browser/ui/browser_actions.cc').read_text()
pairs=[('kActionToggleCollapseVertical','IDC_TOGGLE_VERTICAL_TABS_COLLAPSE'),
       ('kActionTabSearch','IDC_TAB_SEARCH'),('kActionAuxAsk','IDC_AUX_ASK'),
       ('kActionAuxOpenNewChat','IDC_AUX_OPEN_NEW_CHAT'),
       ('kActionCopyUrl','IDC_COPY_URL'),('kActionSplitTab','IDC_NEW_SPLIT_TAB'),
       ('kActionAuxSplitStacked','IDC_AUX_SPLIT_STACKED')]
for action,command in pairs:
 assert re.search(r'E\('+action+r',\s*'+command+r'\)',header),(action,command)
 assert action in actions,action
print('PASS: all seven supplied browser IDs have standard mappings and actual registrations')
