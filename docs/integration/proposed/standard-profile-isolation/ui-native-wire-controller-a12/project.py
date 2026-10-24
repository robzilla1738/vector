from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent;PREVIOUS=HERE.parent/'native-document-token-join-a11';path='chrome/browser/aux/ui_storage_migration_controller.cc';source=PREVIOUS/'source'/path;original=source.read_text();text=original;anchors=[];sha=lambda b:hashlib.sha256(b).hexdigest()
def edit(find,replace,count=1):
 global text
 assert text.count(find)==count,(find[:90],text.count(find),count);text=text.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':count})
a=text.index('bool DraftData(');b=text.index('bool CanonicalUuid(',a);edit(text[a:b],(HERE/'wire-definitions.inc').read_text())
edit('''  double revision = 0;
  int frame_id''','''  double revision = 0;
  std::optional<WireStores> source_stores;
  int frame_id''')
edit('''  Invoke(index, "auxPrepareDraftMigrationCapture", base::ListValue().Append(frames_[index]->request_id),''','''  Invoke(index, "auxPrepareDraftMigrationCapture", base::ListValue().Append(frames_[index]->request_id).Append("utf16-v1"),''')
edit('''  const auto* capture = value.FindDict("capture");''','''  const auto* raw_capture = value.FindString("captureJson");
  const auto* units = value.FindDict("storeUnits");
  auto stores = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;''')
edit('''      !owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != false || !capture ||
      !DraftData(*capture, extension_->origin().Serialize())) return false;''','''      !owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != false ||
      !Text(value, "wireFormat", "utf16-v1") || !raw_capture || raw_capture->empty() ||
      raw_capture->size() > 32 * 1024 * 1024 || !stores) return false;''')
edit('''  frame.lease_id = *lease; frame.revision = *revision; frame.capture_json = frame.result_json; frame.prepared = true;''','''  // captureJson is retained opaque. Never reparse its raw strings as a lossy
  // substitute for the exact numeric units used in native semantic pairing.
  frame.lease_id = *lease; frame.revision = *revision; frame.capture_json = frame.result_json;
  frame.source_stores = std::move(stores); frame.prepared = true;''')
edit('''"auxReadDraftMigrationCapture", base::ListValue(),''','''"auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),''',2)
out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
plan={'format':'aux.ui-native-wire-controller.source.v1','files':[{'path':path,'input':str(source),'inputSha256':sha(original.encode()),'output':str(out),'outputSha256':sha(text.encode()),'anchors':anchors}],'priorProposal':'native-document-token-join-a11','priorManifestSha256':sha((PREVIOUS/'source-plan.json').read_bytes()),'countedAnchors':len(anchors),'nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'backendWriterClosure':False,'targetApisCalled':False,'runtimeAccepted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path)));print(json.dumps({'files':1,'countedAnchors':len(anchors),'nativeTreeUnchanged':True}))
