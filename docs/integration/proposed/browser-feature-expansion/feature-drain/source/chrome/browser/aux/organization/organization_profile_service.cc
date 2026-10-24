// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/organization/organization_profile_service.h"

#include <array>
#include <atomic>
#include <fcntl.h>
#include <limits.h>
#include <unistd.h>
#include <limits>
#include <utility>

#include "base/files/file.h"
#include "base/files/file_util.h"
#include "base/files/important_file_writer.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/task/thread_pool.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/organization/organization_codec.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/feature_store/feature_write_participant.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_selections.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"

namespace aux::organization {
namespace {
constexpr size_t kMaximumSnapshotBytes = 64 * 1024 * 1024;
struct NativeWriteLifetime {
  std::atomic_bool revoked{false};
  std::atomic_uint32_t pending{0};
  std::shared_ptr<const aux::peer::BrowserPrivateRoots> roots;
};
struct ReadResult {
  std::optional<base::DictValue> value;
  bool missing = false;
  std::string error;
};
bool PathUnderActualRoots(const base::FilePath& path,
                          const NativeWriteLifetime& lifetime) {
  if (!lifetime.roots || lifetime.revoked.load()) return false;
  const int root = lifetime.roots->DuplicateRevalidatedRoot(1);
  if (root < 0) return false;
  std::array<char, PATH_MAX> name{};
  const bool named = fcntl(root, F_GETPATH, name.data()) == 0;
  close(root);
  if (!named || name.back() != 0 || name.front() != '/') return false;
  const base::FilePath actual_root(name.data());
  return actual_root.IsParent(path.DirName()) &&
         base::MakeAbsoluteFilePath(path.DirName()) == path.DirName() &&
         lifetime.roots->Revalidate();
}
// The path is obtained from the native Profile. A caller cannot choose it.
// Namespace custody beyond these admitted roots remains part of the existing
// protected-startup implementation; these checks do not certify whole custody.
ReadResult ReadSnapshot(const base::FilePath& path,
                        const std::shared_ptr<NativeWriteLifetime>& lifetime,
                        const std::shared_ptr<aux::features::NativeFeatureIoTicket>& ticket) {
  if (ticket->IsCancelled() || lifetime->revoked.load() || !lifetime->roots ||
      !lifetime->roots->Revalidate() || !PathUnderActualRoots(path, *lifetime))
    return {.error = "Organization storage authority unavailable"};
  if (base::IsLink(path))
    return {.error = "Organization storage must not be a symbolic link"};
  base::File readable(path, base::File::FLAG_OPEN | base::File::FLAG_READ);
  if (!readable.IsValid()) {
    if (readable.error_details() != base::File::FILE_ERROR_NOT_FOUND ||
        !base::DirectoryExists(path.DirName()))
      return {.error = "Organization snapshot unavailable; original retained"};
    return {.missing = true};
  }
  std::string json;
  if (!base::ReadFileToStringWithMaxSize(path, &json, kMaximumSnapshotBytes))
    return {.error = "Organization snapshot could not be read"};
  auto value = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
  if (!value)
    return {.error = "Invalid organization snapshot retained unchanged"};
  return {.value = std::move(value)};
}
WriteOutcome WriteSnapshot(const base::FilePath& path,
                           const std::shared_ptr<NativeWriteLifetime>& lifetime,
                           const std::string& profile_id,
                           uint64_t expected_revision,
                           const std::string& serialized,
                           const std::shared_ptr<aux::features::NativeFeatureIoTicket>& ticket) {
  // The caller retains lifetime and the real root descriptors through this
  // actual blocking write, including after the UI receiver is destroyed.
  if (ticket->IsCancelled() || lifetime->revoked.load() || !lifetime->roots ||
      !lifetime->roots->Revalidate())
    return WriteOutcome::kRefused;
  auto previous = ReadSnapshot(path, lifetime, ticket);
  if (!previous.error.empty())
    return WriteOutcome::kRefused;
  if (previous.value) {
    auto decoded = DecodeSnapshot(*previous.value, profile_id);
    if (!decoded.snapshot || decoded.snapshot->revision != expected_revision)
      return WriteOutcome::kRefused;
  } else if (expected_revision != 0) {
    return WriteOutcome::kRefused;
  }
  if (ticket->IsCancelled() || lifetime->revoked.load() || !lifetime->roots->Revalidate())
    return WriteOutcome::kRefused;
  // This bool is the actual completed atomic write result, not a queued-pref
  // callback. A failure is uncertain because effects may have reached storage.
  const bool written = base::ImportantFileWriter::WriteFileAtomically(
      path, serialized);
  if (!written || lifetime->revoked.load() || !lifetime->roots->Revalidate())
    return WriteOutcome::kUncertain;
  return WriteOutcome::kCommitted;
}
}  // namespace

class OrganizationFileStorage final : public OrganizationStorage {
 public:
  using Loaded = base::OnceCallback<void(std::optional<base::DictValue>, bool,
                                         std::string)>;
  OrganizationFileStorage(Profile* profile, std::string profile_id,
                          std::string generation)
      : profile_(profile), profile_id_(std::move(profile_id)),
        generation_(std::move(generation)),
        path_(profile->GetPath().AppendASCII("Aux Organization.json")),
        lifetime_(std::make_shared<NativeWriteLifetime>()),
        runner_(base::ThreadPool::CreateSequencedTaskRunner(
            {base::MayBlock(), base::TaskPriority::USER_VISIBLE,
             base::TaskShutdownBehavior::BLOCK_SHUTDOWN})) {
    lifetime_->roots = aux::peer::CaptureActualChromiumBrowserRoots();
    const auto observation = aux::peer::InspectNativeBrowserShutdown();
    browser_generation_ = observation.admitted_generation;
  }
  ~OrganizationFileStorage() override { Revoke(); }
  bool IsCurrentOwner(std::string_view profile_id,
                      std::string_view generation) const override {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (aux::features::IsNativeFeatureIoAdmissionClosed() || !profile_ || lifetime_->revoked.load() || profile_id != profile_id_ ||
        generation != generation_ || !profile_->IsRegularProfile() ||
        profile_->IsOffTheRecord() || generation_.empty() ||
        aux::GetProfileId(profile_) != profile_id_ ||
        aux::GetProfileCookieBindingEpoch(profile_) != generation_ ||
        aux::IsProfileCookieRestorePending(profile_) ||
        !lifetime_->roots || !lifetime_->roots->Revalidate())
      return false;
    const auto observation = aux::peer::InspectNativeBrowserShutdown();
    return browser_generation_ != 0 && !observation.wrong_process &&
           !observation.admission_closed && !observation.sequence_uncertain &&
           observation.admitted_generation == browser_generation_;
  }
  bool pending() const { return lifetime_->pending.load() != 0; }
  void Revoke() {
    lifetime_->revoked.store(true);
    profile_ = nullptr;
  }
  void Load(Loaded callback) {
    if (!IsCurrentOwner(profile_id_, generation_)) {
      std::move(callback).Run(std::nullopt, false,
                             "Organization storage admission unavailable");
      return;
    }
    auto ticket = aux::features::BeginNativeFeatureIo(path_.DirName(), aux::features::NativeFeatureIoKind::kOrganization);
    if (!ticket) { std::move(callback).Run(std::nullopt, false, "Organization I/O admission closed"); return; }
    lifetime_->pending.fetch_add(1);
    auto completion = std::make_shared<Loaded>(std::move(callback));
    const bool posted = runner_->PostTaskAndReplyWithResult(
        FROM_HERE,
        base::BindOnce(
            [](base::FilePath path, std::shared_ptr<NativeWriteLifetime> lifetime,
               std::shared_ptr<aux::features::NativeFeatureIoTicket> ticket) {
              auto result = ReadSnapshot(path, lifetime, ticket);
              ticket->Settle(result.error.empty() ? aux::features::NativeFeatureIoOutcome::kCompleted
                                                 : aux::features::NativeFeatureIoOutcome::kRefused);
              lifetime->pending.fetch_sub(1);
              return result;
            }, path_, lifetime_, ticket),
        base::BindOnce(
            [](std::shared_ptr<Loaded> done, ReadResult result) {
              std::move(*done).Run(std::move(result.value), result.missing,
                                   std::move(result.error));
            }, completion));
    if (!posted) {
      ticket->Settle(aux::features::NativeFeatureIoOutcome::kRefused);
      lifetime_->pending.fetch_sub(1);
      std::move(*completion).Run(std::nullopt, false,
                                 "Organization read could not be queued");
    }
  }
  void Commit(base::DictValue snapshot, std::string profile_id,
              std::string owner_generation, uint64_t expected_revision,
              uint64_t new_revision,
              base::OnceCallback<void(WriteReceipt)> done) override {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    WriteReceipt receipt{WriteOutcome::kRefused, profile_id, owner_generation,
                         new_revision};
    auto decoded = DecodeSnapshot(snapshot, profile_id);
    std::string serialized;
    if (pending() || !IsCurrentOwner(profile_id, owner_generation) ||
        !decoded.snapshot || decoded.snapshot->revision != new_revision ||
        !base::JSONWriter::Write(snapshot, &serialized) ||
        serialized.size() > kMaximumSnapshotBytes) {
      std::move(done).Run(std::move(receipt));
      return;
    }
    auto ticket = aux::features::BeginNativeFeatureIo(path_.DirName(), aux::features::NativeFeatureIoKind::kOrganization);
    if (!ticket) { std::move(done).Run(std::move(receipt)); return; }
    lifetime_->pending.fetch_add(1);
    auto completion = std::make_shared<base::OnceCallback<void(WriteReceipt)>>(std::move(done));
    const auto refused = receipt;
    const bool posted = runner_->PostTaskAndReplyWithResult(
        FROM_HERE,
        base::BindOnce(
            [](base::FilePath path, std::shared_ptr<NativeWriteLifetime> lifetime,
               std::string profile_id, uint64_t expected_revision,
               std::string bytes, std::shared_ptr<aux::features::NativeFeatureIoTicket> ticket) {
              auto outcome = WriteSnapshot(path, lifetime, profile_id,
                                           expected_revision, bytes, ticket);
              ticket->Settle(outcome == WriteOutcome::kCommitted ? aux::features::NativeFeatureIoOutcome::kCompleted
                  : outcome == WriteOutcome::kRefused ? aux::features::NativeFeatureIoOutcome::kRefused
                                                     : aux::features::NativeFeatureIoOutcome::kUncertain);
              lifetime->pending.fetch_sub(1);
              return outcome;
            }, path_, lifetime_, profile_id, expected_revision,
            std::move(serialized), ticket),
        base::BindOnce(
            [](WriteReceipt receipt, std::shared_ptr<base::OnceCallback<void(WriteReceipt)>> reply,
               WriteOutcome outcome) {
              receipt.outcome = outcome;
              std::move(*reply).Run(std::move(receipt));
            }, std::move(receipt), completion));
    if (!posted) {
      ticket->Settle(aux::features::NativeFeatureIoOutcome::kRefused);
      lifetime_->pending.fetch_sub(1);
      std::move(*completion).Run(refused);
    }
  }
 private:
  raw_ptr<Profile> profile_;
  const std::string profile_id_;
  const std::string generation_;
  const base::FilePath path_;
  const std::shared_ptr<NativeWriteLifetime> lifetime_;
  const scoped_refptr<base::SequencedTaskRunner> runner_;
  uint64_t browser_generation_ = 0;
};

OrganizationProfileService::OrganizationProfileService(Profile* profile)
    : profile_(profile), profile_id_(aux::GetProfileId(profile)),
      generation_(aux::GetProfileCookieBindingEpoch(profile)) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  initial_storage_ = std::make_unique<OrganizationFileStorage>(
      profile, profile_id_, generation_);
  initial_storage_->Load(base::BindOnce(&OrganizationProfileService::Loaded,
                                       weak_.GetWeakPtr()));
}
OrganizationProfileService::~OrganizationProfileService() = default;
OrganizationService* OrganizationProfileService::model() const {
  return shutdown_ ? nullptr : model_.get();
}
base::CallbackListSubscription OrganizationProfileService::ObserveReady(
    base::RepeatingClosure callback) {
  return ready_.Add(std::move(callback));
}
bool OrganizationProfileService::HasPendingWrite() const {
  return (loading_ && initial_storage_) ||
         (initial_storage_ && initial_storage_->pending()) ||
         (model_ && model_->pending());
}
void OrganizationProfileService::Loaded(std::optional<base::DictValue> value,
                                       bool missing, std::string read_error) {
  if (shutdown_)
    return;
  if (!read_error.empty() ||
      !initial_storage_->IsCurrentOwner(profile_id_, generation_)) {
    Fail(read_error.empty() ? "Organization owner changed" : std::move(read_error));
    return;
  }
  if (value) {
    auto decoded = DecodeSnapshot(*value, profile_id_);
    if (!decoded.snapshot) {
      Fail(std::move(decoded.error));
      return;
    }
    Ready(std::move(*decoded.snapshot));
    return;
  }
  if (!missing) {
    Fail("Organization storage outcome unavailable");
    return;
  }
  auto migrated = ImportLegacyPins(
      profile_id_, profile_->GetPrefs()->GetList(aux::kPinnedTabEntriesPref),
      base::BindRepeating([] { return base::Uuid::GenerateRandomV4().AsLowercaseString(); }));
  if (!migrated.snapshot) {
    Fail(std::move(migrated.error));
    return;
  }
  initial_snapshot_ = std::move(*migrated.snapshot);
  // Read the existing presentation bit once; never write a second copy.
  constexpr char kLegacyBookmarksExpanded[] = "aux.vertical_tabs.bookmarks_section_expanded";
  if (profile_->GetPrefs()->FindPreference(kLegacyBookmarksExpanded))
    initial_snapshot_->bookmarks_collapsed =
        !profile_->GetPrefs()->GetBoolean(kLegacyBookmarksExpanded);
  initial_storage_->Commit(EncodeSnapshot(*initial_snapshot_), profile_id_,
                           generation_, 0, initial_snapshot_->revision,
                           base::BindOnce(&OrganizationProfileService::Migrated,
                                          weak_.GetWeakPtr()));
}
void OrganizationProfileService::Migrated(WriteReceipt receipt) {
  if (shutdown_)
    return;
  if (!initial_snapshot_ || receipt.outcome != WriteOutcome::kCommitted ||
      receipt.profile_id != profile_id_ || receipt.owner_generation != generation_ ||
      receipt.revision != initial_snapshot_->revision ||
      !initial_storage_->IsCurrentOwner(profile_id_, generation_)) {
    Fail("Organization migration was not committed; original pins retained");
    return;
  }
  Ready(std::move(*initial_snapshot_));
  initial_snapshot_.reset();
}
void OrganizationProfileService::Ready(Snapshot snapshot) {
  active_storage_ = initial_storage_.get();
  model_ = std::make_unique<OrganizationService>(
      std::move(snapshot), generation_, std::move(initial_storage_));
  model_settled_subscription_ = model_->ObserveSettled(base::BindRepeating(
      &OrganizationProfileService::ModelSettled, weak_.GetWeakPtr()));
  loading_ = false;
  auto self = weak_.GetWeakPtr();
  ready_.Notify();
  if (self) self->settled_.Notify();
}
base::CallbackListSubscription OrganizationProfileService::ObserveSettled(
    base::RepeatingClosure callback) {
  return settled_.Add(std::move(callback));
}
void OrganizationProfileService::ModelSettled() {
  auto self = weak_.GetWeakPtr();
  settled_.Notify();
  if (!self) return;
  // Account metadata may rotate the native epoch while a disk reply is queued.
  // Wait for actual settlement before reloading the same profile's records.
  if (!shutdown_ && !HasPendingWrite() &&
      aux::GetProfileCookieBindingEpoch(profile_) != generation_)
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(
            [](base::WeakPtr<OrganizationProfileService> self) {
              if (self) self->EnsureCurrentBinding();
            }, weak_.GetWeakPtr()));
}
bool OrganizationProfileService::EnsureCurrentBinding() {
  if (shutdown_ || !profile_) return false;
  const auto current = aux::GetProfileCookieBindingEpoch(profile_);
  if (current.empty() || aux::GetProfileId(profile_) != profile_id_) return false;
  if (current == generation_) return true;
  if (HasPendingWrite()) return false;
  model_settled_subscription_ = {};
  if (active_storage_) active_storage_->Revoke();
  active_storage_ = nullptr;
  if (model_) model_->Shutdown();
  model_.reset();
  initial_storage_.reset();
  initial_snapshot_.reset();
  generation_ = current;
  loading_ = true;
  error_.clear();
  initial_storage_ = std::make_unique<OrganizationFileStorage>(
      profile_, profile_id_, generation_);
  initial_storage_->Load(base::BindOnce(&OrganizationProfileService::Loaded,
                                       weak_.GetWeakPtr()));
  return true;
}
void OrganizationProfileService::Fail(std::string error) {
  error_ = std::move(error);
  loading_ = false;
  initial_storage_.reset();
  ready_.Notify();
}
void OrganizationProfileService::Shutdown() {
  shutdown_ = true;
  weak_.InvalidateWeakPtrs();
  model_settled_subscription_ = {};
  if (initial_storage_)
    initial_storage_->Revoke();
  if (active_storage_)
    active_storage_->Revoke();
  if (model_)
    model_->Shutdown();
  profile_ = nullptr;
}
OrganizationProfileServiceFactory* OrganizationProfileServiceFactory::GetInstance() {
  static base::NoDestructor<OrganizationProfileServiceFactory> instance;
  return instance.get();
}
OrganizationProfileService* OrganizationProfileServiceFactory::GetForProfile(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord())
    return nullptr;
  auto* service = static_cast<OrganizationProfileService*>(
      GetInstance()->GetServiceForBrowserContext(profile, true));
  if (service) service->EnsureCurrentBinding();
  return service;
}
OrganizationProfileService* OrganizationProfileServiceFactory::GetForProfileIfExists(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord())
    return nullptr;
  return static_cast<OrganizationProfileService*>(
      GetInstance()->GetServiceForBrowserContext(profile, false));
}
OrganizationProfileServiceFactory::OrganizationProfileServiceFactory()
    : ProfileKeyedServiceFactory("AuxOrganization",
          ProfileSelections::Builder().WithRegular(ProfileSelection::kOriginalOnly).Build()) {}
OrganizationProfileServiceFactory::~OrganizationProfileServiceFactory() = default;
std::unique_ptr<KeyedService>
OrganizationProfileServiceFactory::BuildServiceInstanceForBrowserContext(
    content::BrowserContext* context) const {
  return std::make_unique<OrganizationProfileService>(Profile::FromBrowserContext(context));
}
bool IsProfileOrganizationWritePending(Profile* profile) {
  auto* service = OrganizationProfileServiceFactory::GetForProfileIfExists(profile);
  return (profile && aux::features::IsNativeFeatureIoPendingForProfilePath(profile->GetPath())) ||
         (service && service->HasPendingWrite());
}
}  // namespace aux::organization
