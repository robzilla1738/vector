import argparse
import hashlib
import json
import tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'source-plan.json').read_text())
parser=argparse.ArgumentParser()
parser.add_argument('--input-root',type=Path,default=Path(plan['root']))
args=parser.parse_args()
sha=lambda data:hashlib.sha256(data).hexdigest()
output=Path(tempfile.mkdtemp(prefix='aux-split-accessibility-'))
files=[]
for row in plan['files']:
    baseline=(Path(plan['root'])/row['path']).read_bytes()
    if sha(baseline)!=row['inputSha256']:
        raise ValueError('Pinned split baseline changed: '+row['path'])
    source=(args.input_root/row['path']).read_text()
    text=source
    for rule in row['rules']:
        if text.count(rule['find'])!=rule['count']:
            raise ValueError('Split source anchor drift: '+row['path'])
        text=text.replace(rule['find'],rule['replace'])
    replay=text
    for rule in reversed(row['rules']):
        if replay.count(rule['replace'])!=rule['count']:
            raise ValueError('Split reverse anchor drift: '+row['path'])
        replay=replay.replace(rule['replace'],rule['find'])
    if replay!=source:
        raise ValueError('Split reverse replay failed: '+row['path'])
    if args.input_root==Path(plan['root']) and sha(text.encode())!=row['outputSha256']:
        raise ValueError('Split output pin changed: '+row['path'])
    target=output/row['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
    files.append({'path':row['path'],'inputSha256':sha(source.encode()),'outputSha256':sha(text.encode()),'anchors':len(row['rules'])})

# The existing guarded close owner and close flags must remain byte-for-byte.
path='chrome/browser/ui/tabs/split_tab_menu_model.cc'
original=(args.input_root/path).read_text();changed=(output/path).read_text()
start='void SplitTabMenuModel::CloseWebContents('
end='void SplitTabMenuModel::SendFeedback('
body=lambda text:text[text.index(start):text.index(end)]
if body(original)!=body(changed):
    raise ValueError('Protected split close owner changed')
if 'CHECK_EQ(tabs_in_split.size(), 2U)' in changed[changed.index('void SplitTabMenuModel::ExecuteCommand'):changed.index('split_tabs::SplitTabId SplitTabMenuModel::GetSplitTabId')]:
    raise ValueError('Binary-only menu execution remained')
print(json.dumps({'format':'aux.split-accessibility.prepared.v1','output':str(output),'files':files,
                 'exactReverseReplay':True,'protectedCloseOwnerPreserved':True,
                 'nativeCompiled':False,'fixtureRun':False,'projected':False,'appOperated':False},indent=2))
