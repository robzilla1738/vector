// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied4278570..427ab98 outer owner; real155 SafariDataImporter does all parsing
// and destination writes. This adapter adds no archive schema or CSV parser.
#include "chrome/browser/extensions/api/aux_browser_import/safari_import.h"

#include <array>
#include <utility>
#include <vector>

#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/affiliations/affiliation_service_factory.h"
#include "chrome/browser/autofill/personal_data_manager_factory.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/history/history_service_factory.h"
#include "chrome/browser/password_manager/factories/account_password_store_factory.h"
#include "chrome/browser/password_manager/factories/profile_password_store_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/reading_list/reading_list_model_factory.h"
#include "chrome/browser/sync/sync_service_factory.h"
#include "components/autofill/core/browser/data_manager/personal_data_manager.h"
#include "components/keyed_service/core/service_access_type.h"
#include "components/password_manager/core/browser/ui/saved_passwords_presenter.h"
#include "components/user_data_importer/utility/bookmark_parser.h"
#include "components/user_data_importer/utility/safari_data_import_client.h"
#include "components/user_data_importer/utility/safari_data_importer.h"

namespace aux_import {
namespace {
// Delete only our own staged archive, on a blocking sequence. Moving this owner
// through the weak reply also cleans it if the captured job/profile retires.
struct DeleteTempDir {
  void operator()(base::ScopedTempDir* dir) const {
    if (dir) base::ThreadPool::PostTask(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce([](std::unique_ptr<base::ScopedTempDir>) {},
                       std::unique_ptr<base::ScopedTempDir>(dir)));
  }
};
using TempDir = std::unique_ptr<base::ScopedTempDir, DeleteTempDir>;
TempDir StageArchive(std::string archive) {
  TempDir dir(new base::ScopedTempDir);
  if (!dir->CreateUniqueTempDir("scoped_dir") ||
      !base::WriteFile(dir->GetPath().AppendASCII("safari-export.zip"), archive))
    return {};
  return dir;
}
}  // namespace

class SafariImport::Impl final : public user_data_importer::SafariDataImportClient {
 public:
  Impl(Profile* profile, bool bookmarks_only, Update update)
      : profile_(profile->GetWeakPtr()), bookmarks_only_(bookmarks_only),
        update_(std::move(update)) {}
  ~Impl() override { ClearOwners(); }

  void Start(std::string archive) {
    if (started_ || stopped_) return;
    started_ = true;
    progress_ = 0.02;  // Original42785bc..42785cc.
    Publish("running");
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&StageArchive, std::move(archive)),
        base::BindOnce(&Impl::DidStage, weak_.GetWeakPtr()));
  }

  void Cancel() {
    if (stopped_) return;
    stopped_ = true;
    if (importer_) importer_->CancelImport();
    current_kind_.clear();
    Publish("cancelled");
    ClearOwners();
  }

 private:
  void DidStage(TempDir dir) {
    if (stopped_) return;
    if (!dir) {
      Finish("failed", "Failed to stage Safari archive");
      return;
    }
    directory_ = std::move(dir);
    auto* profile = profile_.get();
    if (!profile) return;
    auto* affiliation = AffiliationServiceFactory::GetForProfile(profile);
    auto* personal = autofill::PersonalDataManagerFactory::GetForBrowserContext(profile);
    auto* history = HistoryServiceFactory::GetForProfile(
        profile, ServiceAccessType::EXPLICIT_ACCESS);
    auto* bookmarks = BookmarkModelFactory::GetForBrowserContext(profile);
    auto* reading_list = ReadingListModelFactory::GetForBrowserContext(profile);
    auto* sync = SyncServiceFactory::GetForProfile(profile);
    auto profile_store = ProfilePasswordStoreFactory::GetForProfile(
        profile, ServiceAccessType::EXPLICIT_ACCESS);
    auto account_store = AccountPasswordStoreFactory::GetForProfile(
        profile, ServiceAccessType::EXPLICIT_ACCESS);
    // Supplied4279f9c..427a030 checks these actual owners, including both stores.
    if (!affiliation || !personal || !history || !bookmarks || !reading_list ||
        !profile_store || !account_store) {
      Finish("failed", "Safari importer unavailable");
      return;
    }
    presenter_ = std::make_unique<password_manager::SavedPasswordsPresenter>(
        affiliation, std::move(profile_store), std::move(account_store));
    importer_ = std::make_unique<user_data_importer::SafariDataImporter>(
        this, presenter_.get(), &personal->payments_data_manager(), history,
        bookmarks, reading_list, sync, profile->GetPrefs(),
        user_data_importer::MakeBookmarkParser(), g_browser_process->GetApplicationLocale());
    progress_ = 0.08;  // Original427a458..427a4b4.
    Publish("running");
    importer_->PrepareImport(directory_->GetPath().AppendASCII("safari-export.zip"),
                             bookmarks_only_);
  }

  void Publish(std::string state, std::string error = {}) {
    update_.Run(std::move(state), current_kind_, progress_, std::move(error));
  }
  void ClearOwners() {
    importer_.reset();  // Importer retains the presenter and model pointers.
    presenter_.reset();
    selected_password_ids_.clear();
    directory_.reset();
  }
  void Finish(std::string state, std::string error = {}) {
    if (stopped_) return;
    stopped_ = true;
    ClearOwners();
    current_kind_.clear();
    if (state == "succeeded") progress_ = 1;
    Publish(std::move(state), std::move(error));
  }
  void Ready(size_t kind) {
    if (stopped_) return;
    ready_[kind] = true;
    current_kind_ = kKinds[kind];
    Publish("running");
    if (committing_ || !importer_ || !ready_[0] ||
        (!bookmarks_only_ && (!ready_[1] || !ready_[2] || !ready_[3]))) return;
    committing_ = true;
    progress_ = 0.5;
    Publish("running");
    importer_->CompleteImport(selected_password_ids_);
  }
  void Imported(size_t kind) {
    if (stopped_) return;
    imported_[kind] = true;
    current_kind_ = kKinds[kind];
    Publish("running");
    if (committing_ && imported_[0] &&
        (bookmarks_only_ || (imported_[1] && imported_[2] && imported_[3])))
      Finish("succeeded");
  }

  void OnTotalFailure() override { Finish("failed", "Safari import failed"); }
  void OnBookmarksReady(user_data_importer::CountOrError) override { Ready(0); }
  void OnHistoryReady(user_data_importer::CountOrError) override { Ready(1); }
  void OnPaymentCardsReady(user_data_importer::CountOrError) override { Ready(3); }
  void OnPasswordsReady(
      base::expected<password_manager::ImportResults,
                     user_data_importer::ImportPreparationError> results) override {
    if (stopped_) return;
    selected_password_ids_.clear();
    if (results.has_value()) {
      for (const auto& entry : results->displayed_entries)
        selected_password_ids_.push_back(entry.id);
    }
    Ready(2);
  }
  void OnBookmarksImported(size_t) override { Imported(0); }
  void OnHistoryImported(size_t) override { Imported(1); }
  void OnPasswordsImported(const password_manager::ImportResults&) override { Imported(2); }
  void OnPaymentCardsImported(size_t) override { Imported(3); }
  base::WeakPtr<user_data_importer::SafariDataImportClient> AsWeakPtr() override {
    return weak_.GetWeakPtr();
  }

  static constexpr std::array<const char*, 4> kKinds{
      "bookmarks", "history", "passwords", "paymentCards"};
  base::WeakPtr<Profile> profile_;
  const bool bookmarks_only_;
  Update update_;
  bool started_ = false, stopped_ = false, committing_ = false;
  double progress_ = 0;
  std::string current_kind_;
  std::array<bool, 4> ready_{};
  std::array<bool, 4> imported_{};
  TempDir directory_;
  std::vector<int> selected_password_ids_;
  std::unique_ptr<password_manager::SavedPasswordsPresenter> presenter_;
  std::unique_ptr<user_data_importer::SafariDataImporter> importer_;
  base::WeakPtrFactory<Impl> weak_{this};
};

SafariImport::SafariImport(Profile* profile, bool bookmarks_only, Update update)
    : impl_(std::make_unique<Impl>(profile, bookmarks_only, std::move(update))) {}
SafariImport::~SafariImport() = default;
void SafariImport::Start(std::string archive) { impl_->Start(std::move(archive)); }
void SafariImport::Cancel() { impl_->Cancel(); }
}  // namespace aux_import
