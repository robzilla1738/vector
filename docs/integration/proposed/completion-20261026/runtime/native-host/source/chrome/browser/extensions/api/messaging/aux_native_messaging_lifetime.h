// Copyright 2026 Aux contributors. Chromium integration retains upstream notices.
#pragma once
#include "base/process/kill.h"
#include "base/functional/callback.h"
#include "chrome/browser/aux/ordinary_startup_build.h"
#include "chrome/browser/extensions/api/messaging/aux_native_host_lease.h"
#include "base/files/file_path.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"
#include "base/process/mac/aux_browser_descendant_client.h"
#include <algorithm>
#include <atomic>
#include "base/callback_list.h"
#include <cstdint>
#include <memory>
#include <mutex>
#include <string>
#include <vector>
#include <utility>
#include <unistd.h>

class Profile;

namespace extensions {
// Captured on UI from the actual calling Profile, never from renderer input or
// the optional native-initiated reconnect directory. No Profile is dereferenced
// on IO/background/reaper threads; its keepalive is released on UI.
class AuxNativeMessagingProfileOwner final {
 public:
  static std::shared_ptr<const AuxNativeMessagingProfileOwner> Capture(Profile* profile);
  ~AuxNativeMessagingProfileOwner();
  const base::FilePath& profile_path() const { return profile_path_; }
  const std::string& binding() const { return binding_receipt_; }
  bool current() const { return valid_.load(std::memory_order_acquire); }

 private:
  AuxNativeMessagingProfileOwner(Profile* profile,
                                std::unique_ptr<ScopedProfileKeepAlive> keep_alive,std::string binding);
  const base::FilePath profile_path_;
  const std::string profile_id_,binding_epoch_,restore_epoch_,binding_receipt_;
  std::atomic_bool valid_{true};
  base::CallbackListSubscription binding_observation_;
  const std::unique_ptr<ScopedProfileKeepAlive, base::OnTaskRunnerDeleter> keep_alive_;
};

// Retained evidence for mac native messaging launches only. This is
// not a process-tree census, filesystem authority, or whole-writer certificate.
struct AuxNativeMessagingLifetime final {
  ~AuxNativeMessagingLifetime();
  struct Snapshot {
    size_t unresolved = 0;
    bool all_writer_coverage = false;  // This participant is never a census.
    bool admission_closed = false;
    bool wrong_process = false;
    bool accounting_unknown = false;
    size_t unbound = 0;
    size_t uncertain = 0;
    uint64_t settled = 0;
    uint64_t unobserved_descendant_cohorts = 0;
  };
  static std::shared_ptr<AuxNativeMessagingLifetime> Reserve(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      std::string extension_origin, std::string native_host_name,
      const base::FilePath& image) {
    if(!profile_owner||!profile_owner->current()||extension_origin.empty()||native_host_name.empty())return nullptr;
    auto entry=std::shared_ptr<AuxNativeMessagingLifetime>(
        new AuxNativeMessagingLifetime(std::move(profile_owner),
            std::move(extension_origin),std::move(native_host_name)));
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      if(getpid()!=RegistryOwner()||Closed()||Registry().size()>=4096) {
        if(getpid()!=RegistryOwner()||Registry().size()>=4096)AccountingUnknown()=true;
        return nullptr;
      }
#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
      entry->cohort=aux::browser_custody::Reserve(aux::browser_custody::Family::kNativeMessaging);
      if(!entry->cohort)return nullptr;
      if(!aux::browser_custody::MaySpawn(entry->cohort)) {
        aux::browser_custody::DidFailBeforeChild(entry->cohort);return nullptr;
      }
#endif
      Registry().push_back(entry); // Retain before any durable preparation.
    }
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
    // No registry/entry lock crosses authenticated native callbacks.
    bool durable_attempted=false;
    auto lease=AuxNativeHostLease::Prepare(entry->profile_owner_,
        entry->extension_origin_,entry->native_host_name_,image,durable_attempted);
    {
      std::lock_guard<std::mutex> lock(entry->mutex);
      entry->ordinary_lease_=lease;
      if(!lease){
        if(durable_attempted)entry->uncertain=true;
        else{entry->bound=true;entry->ReleaseLocked();}
        return nullptr;
      }
      if(entry->cancel_requested_)lease->Cancel();
    }
#endif
    return entry;
  }
  base::Process LaunchOrdinary(const base::CommandLine& command,
                               const base::LaunchOptions& options) {
    return ordinary_lease_?ordinary_lease_->Launch(command,options):base::Process();
  }
  void ObservePipeClosed(uint32_t mask) {
    if(ordinary_lease_)ordinary_lease_->ObservePipeClosed(mask);
  }
  bool ReapOrdinary(base::Process& process) {
    if(!ordinary_lease_)return false;
    ordinary_lease_->Reap(std::move(process));return true;
  }
  void InstallCancellation(base::OnceClosure callback) {
    base::OnceClosure dispatch;
    {
      std::lock_guard<std::mutex> lock(mutex);
      if(cancel_requested_)dispatch=std::move(callback);
      else cancellation_=std::move(callback);
    }
    if(dispatch)std::move(dispatch).Run();
  }
  bool IsOwnerCurrent() const { return profile_owner_->current(); }
  static void CancelProfileOwner(const AuxNativeMessagingProfileOwner* owner) {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {std::lock_guard<std::mutex> lock(RegistryMutex());entries=Registry();}
    for(const auto& entry:entries)if(entry->profile_owner_.get()==owner)entry->RequestStop();
  }
  static void StopLease(std::span<const uint8_t,16> lease) {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {std::lock_guard<std::mutex> lock(RegistryMutex());entries=Registry();}
    for(const auto& entry:entries) {
      bool matches=false;
      {std::lock_guard<std::mutex> lock(entry->mutex);matches=entry->ordinary_lease_&&entry->ordinary_lease_->MatchesLeaseBytes(lease);}
      if(matches)entry->RequestStop();
    }
  }
  void RequestStop() {
    base::OnceClosure dispatch;std::shared_ptr<AuxNativeHostLease> lease;
    {
      std::lock_guard<std::mutex> lock(mutex);
      cancel_requested_=true;lease=ordinary_lease_;dispatch=std::move(cancellation_);
    }
    if(lease)lease->Cancel();
    if(dispatch)std::move(dispatch).Run();
  }
  void BindLaunch(pid_t pid, base::Time creation) {
    std::lock_guard<std::mutex> lock(mutex);
    if (getpid() != owner || bound) { uncertain = true; return; }
    bound = true;
    child = pid;
    birth = creation;
    if(ordinary_lease_)return;
    if (pid > 0) {
      aux::browser_custody::DidCreate(cohort,pid);
      if (birth.is_null()) uncertain = true;
    }
    if (pid <= 0) aux::browser_custody::DidFailBeforeChild(cohort);
    // Receiver loss/direct exit cannot clear the actual descendant ticket.
  }
  void ValidateBeforeWaitLocked(pid_t pid, base::Time creation) {
    if (getpid() != owner || !bound || pid != child || birth.is_null() ||
        creation.is_null() || creation != birth) uncertain = true;
  }
  // Caller holds mutex across the existing native wait; no second reaper.
  void ObserveLocked(pid_t pid, base::AuxChildReapEvidence evidence) {
    if (getpid() != owner || !bound || pid <= 0 || pid != child) {
      uncertain = true;
      return;
    }
    if (evidence == base::AuxChildReapEvidence::unknown) uncertain = true;
    if (evidence == base::AuxChildReapEvidence::reaped && !direct_reaped) {
      direct_reaped = true;
      aux::browser_custody::DidObserveOriginalReap(cohort,!uncertain);
    }
    if (evidence == base::AuxChildReapEvidence::unknown)
      aux::browser_custody::DidObserveOriginalReap(cohort,false);
  }
  static void CloseAdmission() {
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      Closed()=true;
      if(getpid()!=RegistryOwner())AccountingUnknown()=true;
      entries=Registry();
    }
    for(const auto& entry:entries)entry->RequestStop();
  }
  static Snapshot Inspect() {
    Snapshot result;
    std::vector<std::shared_ptr<AuxNativeMessagingLifetime>> entries;
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      result.admission_closed = Closed();
      result.wrong_process = getpid() != RegistryOwner();
      result.accounting_unknown = AccountingUnknown();
      result.settled = Settled();
      result.unobserved_descendant_cohorts = UnobservedDescendantCohorts();
      entries = Registry();
    }
    // Never hold the registry mutex while acquiring an entry mutex: the sole
    // original reaper releases an entry in the opposite order.
    for (const auto& entry : entries) {
      std::lock_guard<std::mutex> lock(entry->mutex);
      const auto descendants = entry->ordinary_lease_?entry->ordinary_lease_->Inspect():
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
          aux::browser_custody::Result::kPending;
#else
          aux::browser_custody::Inspect(entry->cohort);
#endif
      if (descendants == aux::browser_custody::Result::kSettled) entry->ReleaseLocked();
      else if (descendants == aux::browser_custody::Result::kUnknown ||
               descendants == aux::browser_custody::Result::kRefused) entry->uncertain = true;
      if (entry->released) continue;
      ++result.unresolved;
      if (!entry->bound) ++result.unbound;
      if (entry->uncertain) ++result.uncertain;
    }
    {
      // A copied unbound entry may bind and be reaped before its entry scan.
      // Read the sticky cohort evidence AFTER scanning so that release cannot
      // hide that launch. Keep admission_closed from the original copy: an
      // open-to-closed transition cannot make an incomplete copy authoritative.
      std::lock_guard<std::mutex> lock(RegistryMutex());
      result.accounting_unknown |= AccountingUnknown();
      result.unobserved_descendant_cohorts = UnobservedDescendantCohorts();
    }
    return result;
  }
  std::mutex mutex;
 private:
  AuxNativeMessagingLifetime(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      std::string extension_origin, std::string native_host_name);
  const std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner_;
  const std::string extension_origin_;
  const std::string native_host_name_;
  std::shared_ptr<AuxNativeHostLease> ordinary_lease_;
  base::OnceClosure cancellation_;
  bool cancel_requested_=false;
  static pid_t RegistryOwner() { static const pid_t owner = getpid(); return owner; }
  static bool& Closed() { static bool closed = false; return closed; }
  static bool& AccountingUnknown() { static bool unknown = false; return unknown; }
  static uint64_t& Settled() { static uint64_t settled = 0; return settled; }
  static uint64_t& UnobservedDescendantCohorts() { static uint64_t count = 0; return count; }
  static std::mutex& RegistryMutex() { static auto* m = new std::mutex; return *m; }
  static std::vector<std::shared_ptr<AuxNativeMessagingLifetime>>& Registry() {
    static auto* r = new std::vector<std::shared_ptr<AuxNativeMessagingLifetime>>;
    return *r;
  }
  void ReleaseLocked() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    if (released || uncertain) return;
    released = true;
    if (Settled() == UINT64_MAX) AccountingUnknown() = true;
    else ++Settled();
    std::erase_if(Registry(), [this](const auto& entry) { return entry.get() == this; });
  }
  const pid_t owner = getpid();
  pid_t child = -1;
  base::Time birth;
  aux::browser_custody::Ticket cohort = 0;
  bool direct_reaped = false;
  bool bound = false;
  bool uncertain = false;
  bool released = false;
};
// UI-only finite ordinary shutdown observation, while the authenticated
// journal owner remains alive. False remains an unresolved failure.
bool CloseAuxNativeMessagingAndWaitForSettlement();
// Invoked by the existing blocking-pool termination task, not a new reaper.
inline void ReapAuxNativeMessagingProcess(
    base::Process process, std::shared_ptr<AuxNativeMessagingLifetime> custody) {
  if(custody&&custody->ReapOrdinary(process))return;
  std::unique_lock<std::mutex> lock;
  if (custody) {
    lock = std::unique_lock<std::mutex>(custody->mutex);
    custody->ValidateBeforeWaitLocked(process.Pid(), process.CreationTime());
  }
  const auto pid = process.Pid();
  auto evidence = base::EnsureProcessTerminatedWithAuxReapEvidence(std::move(process));
  if (custody) custody->ObserveLocked(pid, evidence);
}
}
