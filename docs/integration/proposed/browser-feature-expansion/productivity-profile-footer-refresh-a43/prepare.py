#!/usr/bin/env python3
"""Pinned, two-leaf source preparation. Never mutate the native checkout."""
from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PREFIX=Path('chrome/browser/ui/views/frame')
PINS={'aux_profile_page_indicator.h':'d2c7273a81b8afae6543eea8fe971a579ba88986897bc7300ab54108f1950083','aux_profile_page_indicator.cc':'56b1fb93ee768ac3b3bfa9fcccbf249b5a07297cf59425c9602796d414088848'}
def sha(data):return hashlib.sha256(data).hexdigest()
rows=[];patch=[]
for name,pin in PINS.items():
 src=NATIVE/PREFIX/name;before=src.read_text()
 if sha(src.read_bytes())!=pin:raise SystemExit(f'Input changed: {src}')
 text=before;anchors=[]
 def change(a,b):
  global text
  assert text.count(a)==1,(name,a[:80],text.count(a));text=text.replace(a,b);anchors.append({'before':a,'after':b,'count':1})
 if name.endswith('.h'):
  change('#include "chrome/browser/aux/profile_account_metadata.h"','#include "chrome/browser/aux/profile_account_metadata.h"\n#include "chrome/browser/profiles/profile_attributes_storage_observer.h"')
  change('class BrowserView;','class BrowserView;\nclass ProfileAttributesStorage;')
  change('public extensions::ExtensionRegistryObserver {','public extensions::ExtensionRegistryObserver,\n                             public ProfileAttributesStorageObserver {')
  change('  void BindRegistry();','''  void BindRegistry();
  void BindProfileAttributes();
  void ScheduleProfileRefresh();
  void RunProfileRefresh();
  void OnProfileAdded(const base::FilePath& path) override;
  void OnProfileWasRemoved(const base::FilePath& path,
                           const std::u16string& name) override;
  void OnProfileNameChanged(const base::FilePath& path,
                            const std::u16string& old_name) override;
  void OnProfileAuthInfoChanged(const base::FilePath& path) override;
  void OnProfileAvatarChanged(const base::FilePath& path) override;
  void OnProfileHighResAvatarLoaded(const base::FilePath& path) override;
  void OnProfileIsOmittedChanged(const base::FilePath& path) override;''')
  change('  bool presentation_collapsed_ = false;','''  base::ScopedObservation<ProfileAttributesStorage,
                          ProfileAttributesStorageObserver>
      attributes_observation_{this};
  bool profile_refresh_pending_ = false;
  bool presentation_collapsed_ = false;''')
 else:
  change('#include "base/task/thread_pool.h"','#include "base/task/thread_pool.h"\n#include "base/task/single_thread_task_runner.h"')
  change('  layer()->SetFillsBoundsOpaquely(false);\n  RefreshAccountMetadata();','  layer()->SetFillsBoundsOpaquely(false);\n  BindProfileAttributes();\n  RefreshAccountMetadata();')
  change('void ProfilePageIndicator::Refresh() {\n  if (drag_.DeferUpdate()) {','void ProfilePageIndicator::Refresh() {\n  BindProfileAttributes();\n  if (drag_.DeferUpdate()) {')
  change('void ProfilePageIndicator::BindRegistry() {','''void ProfilePageIndicator::BindProfileAttributes() {
  auto* manager =
      g_browser_process ? g_browser_process->profile_manager() : nullptr;
  auto* storage = manager ? &manager->GetProfileAttributesStorage() : nullptr;
  if (attributes_observation_.IsObservingSource(storage))
    return;
  attributes_observation_.Reset();
  if (storage)
    attributes_observation_.Observe(storage);
}

void ProfilePageIndicator::ScheduleProfileRefresh() {
  if (profile_refresh_pending_)
    return;
  profile_refresh_pending_ = true;
  // Storage notifications can be emitted in a group while its entries change.
  // Refresh only after that mutation returns, using this Browser's real roster.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce(&ProfilePageIndicator::RunProfileRefresh,
                     weak_factory_.GetWeakPtr()));
}

void ProfilePageIndicator::RunProfileRefresh() {
  profile_refresh_pending_ = false;
  if (attributes_observation_.IsObserving())
    Refresh(); // Existing preview-roster and drag deferral remain authoritative.
}

void ProfilePageIndicator::OnProfileAdded(const base::FilePath&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileWasRemoved(const base::FilePath&,
                                               const std::u16string&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileNameChanged(const base::FilePath&,
                                                const std::u16string&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileAuthInfoChanged(const base::FilePath&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileAvatarChanged(const base::FilePath&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileHighResAvatarLoaded(const base::FilePath&) {
  ScheduleProfileRefresh();
}
void ProfilePageIndicator::OnProfileIsOmittedChanged(const base::FilePath&) {
  ScheduleProfileRefresh();
}

void ProfilePageIndicator::BindRegistry() {''')
  change('void ProfilePageIndicator::Retire() {\n  registry_observation_.Reset();','''void ProfilePageIndicator::Retire() {
  attributes_observation_.Reset();
  profile_refresh_pending_ = false;
  registry_observation_.Reset();''')
 output=HERE/'source'/PREFIX/name;output.write_text(text)
 replay=before
 for a in anchors:
  assert replay.count(a['before'])==a['count'];replay=replay.replace(a['before'],a['after'])
 assert replay==text
 rows.append({'path':str(PREFIX/name),'input':str(src),'inputSha256':pin,'output':str(output),'outputSha256':sha(output.read_bytes()),'anchors':anchors})
 patch.extend(difflib.unified_diff(before.splitlines(keepends=True),text.splitlines(keepends=True),fromfile=str(PREFIX/name),tofile=str(PREFIX/name)))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.profile-footer-observer.v1','files':rows,'actualNativeMutation':False,'nativeCompiled':False,'productExecuted':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(f'Passed exact replay: {len(rows)} leaves, {sum(len(r["anchors"]) for r in rows)} one-count anchors')
