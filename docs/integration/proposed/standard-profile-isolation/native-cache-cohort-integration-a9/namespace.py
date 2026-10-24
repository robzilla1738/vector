from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
path='components/services/storage/dom_storage/session_storage_namespace_impl.h'
s=(ROOT/path).read_text()
EDITS=[]
def edit(before,after):
 global s
 assert s.count(before)==1,(before,s.count(before))
 s=s.replace(before,after)
 EDITS.append((before,after))
edit('#include <memory>','#include <memory>\n#include <optional>')
edit('#include "base/functional/callback.h"','#include "base/functional/callback.h"\n#include "base/unguessable_token.h"')
edit('  StorageAreaImpl* GetStorageAreaForTesting(','''  bool CanFreezeAuxUiMigrationNamespace() const;
  bool FreezeAuxUiMigrationNamespace(const base::UnguessableToken& request);
  bool CanResumeAuxUiMigrationNamespace(const base::UnguessableToken& request) const;
  bool ResumeAuxUiMigrationNamespace(const base::UnguessableToken& request);
  bool ReholdAuxUiMigrationNamespaceAfterFailedResume(const base::UnguessableToken& request);

  StorageAreaImpl* GetStorageAreaForTesting(''')
edit('  mojo::ReceiverSet<blink::mojom::SessionStorageNamespace> receivers_;','''  mojo::ReceiverSet<blink::mojom::SessionStorageNamespace> receivers_;
  std::optional<base::UnguessableToken> aux_ui_namespace_request_;
  std::optional<base::UnguessableToken> aux_ui_namespace_last_resumed_;
  std::vector<mojo::PendingReceiver<blink::mojom::SessionStorageNamespace>> aux_ui_namespace_receivers_;''')
p=HERE/'source'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
ROWS=[(path,EDITS)]
path='components/services/storage/dom_storage/session_storage_namespace_impl.cc'
s=(ROOT/path).read_text();before='void SessionStorageNamespaceImpl::SetPendingPopulationFromParentNamespace('
assert s.count(before)==1
after=(HERE/'namespace-methods.inc').read_text().rstrip()+'\n\n'+before
s=s.replace(before,after)
ROWS.append((path,[(before,after)]))
p=HERE/'source'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
print(p)
