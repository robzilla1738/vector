"""Actual existing-control observation; never binds or mutates native state."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda data:hashlib.sha256(data).hexdigest()
files=[];patch=[]
def project(path,edits):
 original=(ROOT/path).read_bytes();text=original.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before,text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 files.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
project('content/public/browser/dom_storage_context.h',[
 ('#include <string>','#include <cstdint>\n#include <optional>\n#include <string>'),
 ('namespace content {','namespace storage::mojom {\nclass LocalStorageControl;\nclass SessionStorageControl;\n}\n\nnamespace content {'),
 (' protected:\n  virtual ~DOMStorageContext() {}', '''  // Native observation of this actual context's already-bound controls.
  // Reacquire after every async boundary; pointer/generation observations do
  // not authorize writes, prove closure or cause lazy service construction.
  struct AuxUiMigrationControls {
    storage::mojom::LocalStorageControl* local;
    storage::mojom::SessionStorageControl* session;
    uint64_t generation;
  };
  CONTENT_EXPORT virtual std::optional<AuxUiMigrationControls>
  GetExistingAuxUiMigrationControls();

 protected:
  virtual ~DOMStorageContext() {}'''),
])
project('content/browser/dom_storage/dom_storage_context_wrapper.h',[
 ('  bool scavenging_started_for_testing() const {', '''  std::optional<AuxUiMigrationControls> GetExistingAuxUiMigrationControls() override;
  bool scavenging_started_for_testing() const {'''),
])
project('content/browser/dom_storage/dom_storage_context_wrapper.cc',[
 ('namespace {\n\nvoid AdaptSessionStorageUsageInfo(', '''std::optional<DOMStorageContext::AuxUiMigrationControls>
DOMStorageContext::GetExistingAuxUiMigrationControls() { return std::nullopt; }

std::optional<DOMStorageContext::AuxUiMigrationControls>
DOMStorageContextWrapper::GetExistingAuxUiMigrationControls() {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!partition_ || !local_storage_control_ || !session_storage_control_ ||
      !local_storage_control_.is_connected() || !session_storage_control_.is_connected())
    return std::nullopt;
  return AuxUiMigrationControls{local_storage_control_.get(),
      session_storage_control_.get(), aux_control_generation_};
}

namespace {

void AdaptSessionStorageUsageInfo('''),
])
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-dom-existing-controls.source.v1','nativeRoot':str(ROOT),'files':files,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':sum(len(row['anchors']) for row in files)}))
