"""Pin real restore registry/callback authority and replay service integration."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
r=Path(__file__).resolve().parent;e=json.loads((r/'source-evidence.json').read_text());m=json.loads((r/'manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
arm=Path(e['arm64']['path']).read_bytes();assert sha(arm)==e['arm64']['sha256']
for row in e['functions']:
 a=int(row['rva'],16);assert sha(arm[a:a+row['bytes']])==row['sha256']
def target(a):
 w=struct.unpack_from('<I',arm,a)[0];assert w&0xfc000000==0x94000000
 d=w&0x3ffffff
 if d&0x2000000:d-=0x4000000
 return a+4*d
for a,b in [(0x32224a4,0x7adfeb8),(0x41d5fb4,0x41d64d0),(0x415b07c,0x415b254)]:assert target(a)==b
word=lambda a:struct.unpack_from('<I',arm,a)[0]
assert word(0x3417d0c)==0xf9000e74 # original profile_ at18
assert word(0x3417d28)==0x3900a279 # original synchronous_ at28
assert word(0x7adfde0)==0xf9400d4a # active restorer profile18
assert word(0x7adfe84)==0x3940a140 # same registry synchronous28
assert word(0x41d5f7c)==0xeb01011f # service callback actualprofile comparison
n=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in e['platformSources']:assert sha((n/row['path']).read_bytes())==row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-pin-restore-') as directory:
 replay=Path(directory);subprocess.run(['git','init','-q',directory],check=True)
 for row in m['files']:
  p=row['path'];before=(r/'baseline'/p).read_bytes();assert sha(before)==row['baselineSha256'];assert sha((r/'source'/p).read_bytes())==row['outputSha256'];d=replay/p;d.parent.mkdir(parents=True,exist_ok=True);d.write_bytes(before)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=replay,check=True);subprocess.run(['git','apply',str(r/'native.patch')],cwd=replay,check=True)
 for row in m['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
s=(r/'source/chrome/browser/ui/tabs/pinned_tab_service.cc').read_text()
assert s.count('!SessionRestore::IsRestoring(profile_)')==3
assert 'SessionRestore::RegisterOnSessionRestoredCallback' in s
callback=s[s.index('void PinnedTabService::OnSessionRestored('):s.index('void PinnedTabService::SchedulePinnedTabsReconciliation()')]
assert 'profile != profile_' in callback and 'profile_switch_pauses_.empty()' in callback
assert 'SessionRestore::IsRestoring' not in callback
assert 'restore_reconciliation_pending_ = true' in callback
assert 'restore_reconciliation_pending_ = false' in callback
resume=s[s.index('void PinnedTabService::ResumeAfterAuxProfileSwitch'): ]
assert 'if (restore_reconciliation_pending_)' in resume and 'ReconcileAfterSessionRestore();' in resume
assert 'ReconcilePinnedEntries(browser->GetTabStripModel())' in callback
assert s.index('RegisterOnSessionRestoredCallback')<s.index('ForEachCurrentBrowserWindowInterfaceOrderedByActivation(')
assert 'weak_factory_.GetWeakPtr()' in s
core=(n/'chrome/browser/sessions/session_restore.cc').read_text()
assert 'GetActiveSessionRestorers().erase(this)' in core
assert 'active_restorers.insert(this)' in core and 'restorer->profile_ == profile' in core
assert 'DeleteSoon(FROM_HERE,' in core and 'on_session_restored_callbacks()->Notify(' in core
print('Original SessionRestore producer/registry/callback proven; actual155 APIs pinned;2-file service replay PASS. No coordinator duplication, native build or runtime acceptance.')
