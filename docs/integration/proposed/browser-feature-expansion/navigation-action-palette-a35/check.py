from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent;plan=json.loads((here/'source-plan.json').read_text());root=Path(plan['nativeRoot']);sha=lambda b:hashlib.sha256(b).hexdigest();records=[]
for row in plan['files']:
 source=(root/row['path']).read_bytes();assert sha(source)==row['inputSha256'];text=source.decode()
 for edit in row['anchors']:
  assert text.count(edit['before'])==edit['expectedCount']==1
  text=text.replace(edit['before'],edit['after'])
 assert sha(text.encode())==row['outputSha256'];assert text==(here/'source'/row['path']).read_text()
 # Mirror the already-reviewed controller behavior through the actual actions.
 for mode in ['kNewTab','kNavigate','kCommands']:assert text.count('ShowAuxCommandBar(bwi, AuxCommandBarMode::'+mode+')')==1
 start=text.index('// The modern ActionItem is the real Cmd+T dispatch owner.');end=text.index('.SetActionId(kActionNewTab)',start);block=text[start:end]
 assert block.index('return;')<block.index('chrome::NewTab(')
 start=text.index('if (ShowAuxCommandBar(bwi, AuxCommandBarMode::kNavigate))');end=text.index('.SetActionId(kActionFocusLocation)',start);block=text[start:end]
 assert block.index('return;')<block.index('IsLocationBarVisible()')<block.index('chrome::FocusLocationBar(')
 # Only the reviewed source anchors change. No root or profile guard owner changes.
 records.append({'path':row['path'],'inputSha256':row['inputSha256'],'outputSha256':row['outputSha256'],'anchors':len(row['anchors']),'replayPassed':True})
proof={}
for name in ['chrome/browser/ui/actions/command_action_updater.cc','chrome/browser/ui/browser_command_controller.cc','chrome/browser/ui/actions/chrome_action_id.h','chrome/browser/ui/ui_features.cc','out/AuxFast/gen/chrome/browser/buildflags.h']:
 proof[name]=sha((root/name).read_bytes())
result={'format':'aux.native.action-palette.source-check.v1','files':records,'reviewInputs':proof,'nativeTreeChanged':False,'nativeCompiled':False,'appTested':False,'runtimeAccepted':False};(here/'source-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
