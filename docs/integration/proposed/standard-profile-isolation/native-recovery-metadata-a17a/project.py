"""Export factual original metadata without redefining any existing digest."""
import difflib, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-local-allocation-action-a16'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':[(
  '    bool allocation_observed = false;\n  };',
  '''    bool allocation_observed = false;
    std::optional<base::Time> source_last_accessed;
    std::optional<base::Time> source_last_modified;
    std::optional<base::ByteSize> source_total_size;
  };''')],
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '''    output.allocation_observed = original.allocated_map_id.has_value();
    for (const auto& selected''',
  '''    output.allocation_observed = original.allocated_map_id.has_value();
    output.source_last_accessed = original.last_accessed;
    output.source_last_modified = original.last_modified;
    output.source_total_size = original.total_size;
    for (const auto& selected''')],
}
rows=[];patch=[]
for path,edits in changes.items():
 data=(BASE/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(BASE),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-recovery-metadata.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':2}))
