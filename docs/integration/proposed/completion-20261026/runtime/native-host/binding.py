#!/usr/bin/env python3
"""Freeze native Profile/account bindings and distinct durable host intents."""
from pathlib import Path
import difflib
import hashlib
import json
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
plan=json.loads((HERE/'changes.json').read_text())
def save(name,text):
    path=HERE/'source'/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
    row=next((x for x in plan['files'] if x['path']==name),None)
    if row is None:
        original=(NATIVE/name).read_text();p=HERE/'baseline'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(original)
        row={'path':name,'input':str(NATIVE/name),'before':hashlib.sha256(original.encode()).hexdigest(),'anchors':[]};plan['files'].append(row)
    row['after']=hashlib.sha256(text.encode()).hexdigest();row['bindingStage']='frozen owner + distinct native intent'
def source(name):return (HERE/'source'/name).read_text()

name='chrome/browser/aux/profile_identity.h'
text=(NATIVE/name).read_text().replace('std::string GetProfileCookieRestoreEpoch(Profile* profile);','''std::string GetProfileCookieRestoreEpoch(Profile* profile);
// Fires synchronously on UI for binding rotation, restore start and destruction.
base::CallbackListSubscription ObserveProfileCookieBindingChanged(
    Profile* profile, base::RepeatingClosure callback);''')
save(name,text)
name='chrome/browser/aux/profile_identity.cc';text=(NATIVE/name).read_text()
text=text.replace('    restore_epoch_ = base::Uuid::GenerateRandomV4().AsLowercaseString();\n    return true;','    restore_epoch_ = base::Uuid::GenerateRandomV4().AsLowercaseString();\n    changed_.Notify();\n    return true;')
text=text.replace('  void OnProfileWillBeDestroyed(Profile* profile) override {','''  base::CallbackListSubscription ObserveChanged(base::RepeatingClosure callback) {
    return changed_.Add(std::move(callback));
  }
  void OnProfileWillBeDestroyed(Profile* profile) override {''')
text=text.replace('    restore_epoch_.clear();','    restore_epoch_.clear();\n    changed_.Notify();')
text=text.replace('  void Rotate() { value_ = base::Uuid::GenerateRandomV4().AsLowercaseString(); }','  void Rotate() { value_ = base::Uuid::GenerateRandomV4().AsLowercaseString(); changed_.Notify(); }')
text=text.replace('  base::RepeatingClosureList restored_;','  base::RepeatingClosureList restored_;\n  base::RepeatingClosureList changed_;')
text=text.replace('base::CallbackListSubscription ObserveProfileCookieRestoreFinished(','''base::CallbackListSubscription ObserveProfileCookieBindingChanged(
    Profile* profile,base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if(GetProfileCookieBindingEpoch(profile).empty())return {};
  return static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey))->ObserveChanged(std::move(callback));
}
base::CallbackListSubscription ObserveProfileCookieRestoreFinished(''')
save(name,text)

name='chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h';text=source(name)
text=text.replace('#include <algorithm>','#include <algorithm>\n#include <atomic>\n#include "base/callback_list.h"')
text=text.replace('  const base::FilePath& profile_path() const { return profile_path_; }','''  const base::FilePath& profile_path() const { return profile_path_; }
  const std::string& binding() const { return binding_receipt_; }
  bool current() const { return valid_.load(std::memory_order_acquire); }''')
text=text.replace('std::unique_ptr<ScopedProfileKeepAlive> keep_alive);','std::unique_ptr<ScopedProfileKeepAlive> keep_alive,std::string binding);')
text=text.replace('  const base::FilePath profile_path_;','''  const base::FilePath profile_path_;
  const std::string profile_id_,binding_epoch_,restore_epoch_,binding_receipt_;
  std::atomic_bool valid_{true};
  base::CallbackListSubscription binding_observation_;''')
text=text.replace('if(!profile_owner||extension_origin.empty()||native_host_name.empty())','if(!profile_owner||!profile_owner->current()||extension_origin.empty()||native_host_name.empty())')
text=text.replace('AuxNativeHostLease::Prepare(entry->profile_owner_->profile_path(),','AuxNativeHostLease::Prepare(entry->profile_owner_,')
text=text.replace('  void RequestStop() {','''  bool IsOwnerCurrent() const { return profile_owner_->current(); }
  static void CancelProfileOwner(const AuxNativeMessagingProfileOwner* owner) {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {std::lock_guard<std::mutex> lock(RegistryMutex());entries=Registry();}
    for(const auto& entry:entries)if(entry->profile_owner_.get()==owner)entry->RequestStop();
  }
  void RequestStop() {''')
save(name,text)
name='chrome/browser/extensions/api/messaging/native_message_process_host.cc';text=source(name)
text=text.replace('#include "chrome/browser/profiles/profile.h"','#include "chrome/browser/profiles/profile.h"\n#include "chrome/browser/aux/profile_identity.h"\n#include "components/prefs/pref_service.h"')
start=text.index('std::shared_ptr<const AuxNativeMessagingProfileOwner>\nAuxNativeMessagingProfileOwner::Capture')
end=text.index('AuxNativeMessagingProfileOwner::~AuxNativeMessagingProfileOwner()',start)
text=text[:start]+'''std::shared_ptr<const AuxNativeMessagingProfileOwner>
AuxNativeMessagingProfileOwner::Capture(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if(!profile||!profile->IsRegularProfile()||aux::IsProfileCookieRestorePending(profile))return nullptr;
  auto* prefs=profile->GetPrefs();
  if(!prefs->FindPreference("aux.account_id")||prefs->GetInteger("aux.account_id")<0)return nullptr;
  const auto id=aux::GetProfileId(profile),epoch=aux::GetProfileCookieBindingEpoch(profile),
      restore=aux::GetProfileCookieRestoreEpoch(profile);
  if(id.empty()||epoch.empty()||restore.empty())return nullptr;
  auto keep_alive=ScopedProfileKeepAlive::TryAcquire(profile,ProfileKeepAliveOrigin::kBackgroundMode);
  if(!keep_alive)return nullptr;
  auto binding=AuxNativeHostLease::CaptureProfileBinding(profile->GetPath(),id,prefs->GetInteger("aux.account_id"));
  if(!binding||aux::GetProfileId(profile)!=id||aux::GetProfileCookieBindingEpoch(profile)!=epoch||
      aux::GetProfileCookieRestoreEpoch(profile)!=restore||aux::IsProfileCookieRestorePending(profile))return nullptr;
  auto owner=std::shared_ptr<AuxNativeMessagingProfileOwner>(
      new AuxNativeMessagingProfileOwner(profile,std::move(keep_alive),std::move(*binding)),
      base::OnTaskRunnerDeleter(content::GetUIThreadTaskRunner({})));
  std::weak_ptr<AuxNativeMessagingProfileOwner> weak=owner;
  owner->binding_observation_=aux::ObserveProfileCookieBindingChanged(profile,base::BindRepeating(
      [](std::weak_ptr<AuxNativeMessagingProfileOwner> weak) {
        if(auto owner=weak.lock()) {
          owner->valid_.store(false,std::memory_order_release);
          AuxNativeMessagingLifetime::CancelProfileOwner(owner.get());
        }
      },std::move(weak)));
  return owner;
}
AuxNativeMessagingProfileOwner::AuxNativeMessagingProfileOwner(
    Profile* profile,std::unique_ptr<ScopedProfileKeepAlive> keep_alive,std::string binding)
    :profile_path_(profile->GetPath()),profile_id_(aux::GetProfileId(profile)),
     binding_epoch_(aux::GetProfileCookieBindingEpoch(profile)),
     restore_epoch_(aux::GetProfileCookieRestoreEpoch(profile)),binding_receipt_(std::move(binding)),
     keep_alive_(keep_alive.release(),base::OnTaskRunnerDeleter(content::GetUIThreadTaskRunner({}))) {}

'''+text[end:]
text=text.replace('  if (closed_) {\n    return;\n  }\n\n  // Set the max value', '''  if (closed_) {
    return;
  }
#if BUILDFLAG(IS_MAC)
  if(aux_child_lifetime_&&!aux_child_lifetime_->IsOwnerCurrent()) {
    Close("Native host profile binding changed");return;
  }
#endif

  // Set the max value''')
text=text.replace('    client_->PostMessageFromNativeHost(','''#if BUILDFLAG(IS_MAC)
    if(aux_child_lifetime_&&!aux_child_lifetime_->IsOwnerCurrent()) {
      Close("Native host profile binding changed");return;
    }
#endif
    client_->PostMessageFromNativeHost(''')
save(name,text)

name='chrome/browser/extensions/api/messaging/aux_native_host_lease.h';text=source(name)
text=text.replace('#include <mutex>','#include <mutex>\n#include <optional>')
text=text.replace('namespace extensions {','namespace extensions {\nclass AuxNativeMessagingProfileOwner;')
text=text.replace('  static std::shared_ptr<AuxNativeHostLease> Prepare(','  static std::optional<std::string> CaptureProfileBinding(\n      const base::FilePath& profile_path,const std::string& profile_id,int account_id);\n  static std::shared_ptr<AuxNativeHostLease> Prepare(')
text=text.replace('const base::FilePath& profile_path, const std::string& extension_origin,','std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner, const std::string& extension_origin,')
text=text.replace('  base::FilePath image_;','  std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner_;\n  base::FilePath image_;')
save(name,text)
name='chrome/browser/extensions/api/messaging/aux_native_host_lease.cc';text=source(name)
text=text.replace('#include "base/environment.h"','#include "base/environment.h"\n#include "base/uuid.h"\n#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"')
text=text.replace('std::shared_ptr<AuxNativeHostLease> AuxNativeHostLease::Prepare(','''std::optional<std::string> AuxNativeHostLease::CaptureProfileBinding(
    const base::FilePath& path,const std::string& profile_id,int account_id) {
  base::DictValue request;request.Set("phase","capture");request.Set("profilePath",path.value());
  request.Set("profileId",profile_id);request.Set("accountId",base::NumberToString(account_id));
  request.Set("captureNonce",base::Uuid::GenerateRandomV4().AsLowercaseString());
  auto reply=Request(request);if(!reply||reply->size()!=5)return std::nullopt;
  return base::WriteJson(*reply);
}
std::shared_ptr<AuxNativeHostLease> AuxNativeHostLease::Prepare(''')
text=text.replace('const base::FilePath& profile_path,const std::string& extension_origin,','std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,const std::string& extension_origin,')
text=text.replace('  if(!profile_path.IsAbsolute()||!image.IsAbsolute())return {};','  if(!profile_owner||!profile_owner->current()||!profile_owner->profile_path().IsAbsolute()||!image.IsAbsolute())return {};')
text=text.replace('  lease->image_=image;','  lease->image_=image;lease->profile_owner_=std::move(profile_owner);')
text=text.replace('request.Set("phase","prepare");request.Set("profilePath",profile_path.value());','''request.Set("phase","prepare");request.Set("profilePath",lease->profile_owner_->profile_path().value());
  auto binding=base::JSONReader::ReadDict(lease->profile_owner_->binding(),base::JSON_PARSE_RFC);
  if(!binding||!lease->profile_owner_->current())return {};
  request.Set("binding",std::move(*binding));
  request.Set("intentId",base::Uuid::GenerateRandomV4().AsLowercaseString());''')
text=text.replace('!ImageCurrent())error=ECANCELED;', '!ImageCurrent()||!profile_owner_->current())error=ECANCELED;')
text=text.replace('if(!cancelled_&&kill(pid,SIGCONT)==0)', 'if(!cancelled_&&profile_owner_->current()&&kill(pid,SIGCONT)==0)')
save(name,text)

name='daemon/AuxNativeHostJournal.swift';text=source(name)
text=text.replace('hostName:String,imageSha256:String)throws {','hostName:String,imageSha256:String,intentId:String)throws {')
text=text.replace('imageSha256.count==64,', 'UUID(uuidString:intentId)?.uuidString.lowercased()==intentId,\n              imageSha256.count==64,')
text=text.replace('"hostImageSha256":imageSha256,','"hostImageSha256":imageSha256,"intentId":intentId,')
save(name,text)
name='daemon/AuxOwnedCommandDispatcher.swift';text=source(name)
needle='''            let lease:NativeHostLease
            switch phase {'''
replace='''            func binding(_ identity:AuxMemoryAccountIdentity)->[String:String] {
                func hex(_ bytes:Data)->String {bytes.map{String(format:"%02x",$0)}.joined()}
                return ["accountId":String(identity.accountId),"accountIncarnation":identity.incarnation.uuidString,
                    "profileId":identity.profileId.uuidString,"profilePathSha256":hex(identity.profilePathSha256),
                    "recordSha256":hex(identity.recordSha256)]
            }
            if phase=="capture" {
                guard Set(request.keys)==["phase","profilePath","profileId","accountId","captureNonce"],
                      let nonce=UUID(uuidString:try text("captureNonce")),nonce.uuidString.lowercased()==(try text("captureNonce"))
                else{throw AuxDispatcherLifetimeError.invalidInput}
                let identity=try secure.registeredNativeHostProfile(text("profilePath"))
                guard identity.accountId==(try integer("accountId",0,9_007_199_254_740_991)),
                      identity.profileId==UUID(uuidString:try text("profileId")) else{throw AuxMemoryAccountError.changed}
                try requireOrdinaryStorageGuard(entry,moment:.afterAction)
                return try JSONSerialization.data(withJSONObject:binding(identity),options:[.sortedKeys,.withoutEscapingSlashes])
            }
            let lease:NativeHostLease
            switch phase {'''
assert needle in text;text=text.replace(needle,replace)
text=text.replace('["phase","profilePath","extensionOrigin","hostName","imageSha256"]','["phase","profilePath","extensionOrigin","hostName","imageSha256","binding","intentId"]')
text=text.replace('''                let identity=try secure.registeredNativeHostProfile(path)
                let roots=''', '''                let identity=try secure.registeredNativeHostProfile(path)
                guard let captured=request["binding"] as? [String:String],captured==binding(identity) else{throw AuxMemoryAccountError.changed}
                let roots=''')
text=text.replace('context:context,extensionOrigin:origin,hostName:host,imageSha256:image)', 'context:context,extensionOrigin:origin,hostName:host,imageSha256:image,intentId:text("intentId"))')
save(name,text)
name='daemon/AuxNativeTaskLayout.swift';text=source(name)
start=text.index('    private static func decodeNativeHostProcesses(');end=text.index('    private static func nativeHostRecordNames(',start)
part=text[start:end].replace('_=try canonicalUuid(record,"profileId")','_=try canonicalUuid(record,"profileId");_=try canonicalUuid(record,"intentId",lowercase:true)')
part=part.replace('"hostImageSha256"]','"hostImageSha256","intentId"]')
# The intent is a UUID, not a SHA256 value.
part=part.replace('"nativeHostNameSha256","hostImageSha256","intentId"] {try hash(key)}','"nativeHostNameSha256","hostImageSha256"] {try hash(key)}')
text=text[:start]+part+text[end:];save(name,text)
patch=[]
for row in plan['files']:
    name=row['path'];patch.extend(difflib.unified_diff((HERE/'baseline'/name).read_text().splitlines(True),
        source(name).splitlines(True),fromfile='a/'+name,tofile='b/'+name))
(HERE/'changes.json').write_text(json.dumps(plan,indent=2)+'\n')
(HERE/'native-host.patch').write_text(''.join(patch))
print(json.dumps({'pairedFiles':len(plan['files'])}))
