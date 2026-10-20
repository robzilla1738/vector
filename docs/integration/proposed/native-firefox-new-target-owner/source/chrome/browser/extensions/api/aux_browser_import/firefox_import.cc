// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied427acfc /42631c0 /4263a68 /42648b0 /42648ec orchestration.
#include "chrome/browser/extensions/api/aux_browser_import/firefox_import.h"

#include <utility>

#include "base/check.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/location.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/importer/external_process_importer_host.h"
#include "chrome/browser/importer/importer_list.h"
#include "chrome/browser/importer/importer_progress_observer.h"
#include "chrome/browser/importer/profile_writer.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_init_params.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/webui/aux_importer/import_completion_choice.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "components/user_data_importer/common/importer_data_types.h"
// Concrete L2 producer: real cookies worker and acknowledged destination.
#include "chrome/browser/extensions/api/aux_browser_import/firefox_cookie_import.h"

namespace aux_import {
class FirefoxImport::Impl final : public importer::ImporterProgressObserver {
 public:
  Impl(Profile* profile, std::optional<base::FilePath> selected_source_path,
       bool bookmarks_only, Update update)
      : profile_(profile->GetWeakPtr()),
        selected_source_path_(std::move(selected_source_path)),
        bookmarks_only_(bookmarks_only), update_(std::move(update)),
        cookies_complete_(bookmarks_only), cookies_succeeded_(bookmarks_only) {}
  ~Impl() override {
    const bool was_running = started_ && !stopped_;
    stopped_ = true;
    DetachAndCancelHost();
    if (was_running) CleanupNewTarget();
  }

  void Start(TargetMode mode = TargetMode::kCurrentProfile,
             bool show_completion = false, WebUILifecycle lifecycle = {}) {
    if (started_ || stopped_) return;
    CHECK(!show_completion || (lifecycle.set_controls_enabled && lifecycle.retire_owner));
    CHECK(!show_completion || mode != TargetMode::kNewProfile || lifecycle.open_profile);
    mode_ = mode;
    show_completion_ = show_completion;
    open_profile_ = std::move(lifecycle.open_profile);
    controls_ = std::move(lifecycle.set_controls_enabled);
    retire_owner_ = std::move(lifecycle.retire_owner);
    started_ = true;
    // Original427acfc publishes0.1, with no per-item public progress.
    auto self = weak_.GetWeakPtr();
    Publish("running");
    if (!self) return;
    if (!profile_) {
      Finish(false);
      return;
    }
    importer_list_ = std::make_unique<ImporterList>();
    importer_list_->DetectSourceProfiles(
        g_browser_process->GetApplicationLocale(), false,
        base::BindOnce(&Impl::SourcesReady, weak_.GetWeakPtr()));
    if (self && !stopped_ && show_completion_) controls_.Run(false);
  }

  void Cancel() {
    if (stopped_) return;
    cancelled_ = true;
    // Original42637bc detaches its observer before host Cancel self-deletes.
    DetachAndCancelHost();
    Finish(false);
  }

 private:
  void SourcesReady() {
    if (stopped_) return;
    if (!profile_) {
      Finish(false);
      return;
    }
    const user_data_importer::SourceProfile* selected = nullptr;
    for (size_t i = 0; i < importer_list_->count(); ++i) {
      const auto& source = importer_list_->GetSourceProfileAt(i);
      if (source.importer_type != user_data_importer::TYPE_FIREFOX) continue;
      if (selected_source_path_ && source.source_path != *selected_source_path_)
        continue;
      selected = &source;
      break;
    }
    if (!selected) {
      Finish(false);
      return;
    }
    const uint16_t items = bookmarks_only_
        ? selected->services_supported & user_data_importer::FAVORITES
        : selected->services_supported;
    if (!items) {
      Finish(false);
      return;
    }
    password_requested_ = (items & user_data_importer::PASSWORDS) != 0;
    // Original4263440..3450 considers an unrequested password item settled.
    password_complete_ = !password_requested_;
    password_succeeded_ = !password_requested_;
    selected_source_ = *selected;
    if (mode_ == TargetMode::kNewProfile) {
      CreateNewTarget(items);
      return;
    }
    LaunchHost(items);
  }

  void CreateNewTarget(uint16_t items) {
    ProfileManager* manager = g_browser_process->profile_manager();
    if (!manager) {
      Finish(false);
      return;
    }
    new_target_path_ = manager->GenerateNextProfileDirectoryPath();
    new_target_name_ = u"Firefox";
    if (!selected_source_->profile.empty())
      new_target_name_ += u" - " + selected_source_->profile;
    auto& storage = manager->GetProfileAttributesStorage();
    ProfileAttributesInitParams attributes;
    attributes.profile_path = new_target_path_;
    attributes.profile_name = new_target_name_;
    attributes.icon_index = storage.ChooseAvatarIconIndexForNewProfile();
    auto self = weak_.GetWeakPtr();
    storage.AddProfile(std::move(attributes));
    if (!self) return;
    manager->CreateProfileAsync(new_target_path_, base::BindOnce(
        &Impl::TargetInitialized, weak_.GetWeakPtr(), items), {});
  }

  void TargetInitialized(uint16_t items, Profile* initialized) {
    if (stopped_) return;
    if (!initialized) {
      Finish(false);
      return;
    }
    // Original4263ddc does not copy Chromium's optional photo/theme branch.
    auto self = weak_.GetWeakPtr();
    initialized->GetPrefs()->SetString(prefs::kProfileName,
                                      base::UTF16ToUTF8(new_target_name_));
    if (!self) return;
    if (auto* manager = g_browser_process->profile_manager()) {
      if (auto* entry = manager->GetProfileAttributesStorage()
                            .GetProfileAttributesWithPath(initialized->GetPath()))
        entry->SetLocalProfileName(new_target_name_, false);
    }
    if (!self) return;
    profile_ = initialized->GetWeakPtr();
    LaunchHost(items);
  }

  void LaunchHost(uint16_t items) {
    if (!profile_ || !selected_source_) {
      Finish(false);
      return;
    }
    auto writer = base::MakeRefCounted<ProfileWriter>(profile_.get());
    auto* host = new ExternalProcessImporterHost;
    host_ = host;
    host->set_observer(this);
    if (!bookmarks_only_) {
      host->SetAuxPreparationCallback(base::BindOnce(
          &Impl::PrepareCookies, weak_.GetWeakPtr()));
    }
    // Start may synchronously notify, cancel and delete the host. Only the
    // host owns its lifetime; no member access follows this call.
    host->StartImportSettings(*selected_source_, profile_.get(), items, writer.get());
  }

  void PrepareCookies(base::OnceCallback<void(bool)> prepared) {
    if (stopped_ || !profile_ || !selected_source_) {
      std::move(prepared).Run(false);
      return;
    }
    cookies_started_ = true;
    // prepared acknowledges the prelaunch gate. It does not assert that
    // destination cookies have settled; the separate callback below does.
    aux::PrepareFirefoxCookies(
        profile_, selected_source_->source_path,
        base::BindRepeating(
            [](base::WeakPtr<Impl> self) {
              return self && self->started_ && !self->stopped_;
            }, weak_.GetWeakPtr()),
        std::move(prepared),
        base::BindOnce(&Impl::CookiesSettled, weak_.GetWeakPtr()));
  }
  void CookiesSettled(bool succeeded) {
    if (stopped_) return;
    cookies_complete_ = true;
    cookies_succeeded_ = succeeded;
    MaybeFinish();
  }

  void ImportStarted() override {}  // Original observer slots are no-ops.
  void ImportItemStarted(user_data_importer::ImportItem) override {}
  void ImportItemEnded(user_data_importer::ImportItem item) override {
    if (stopped_) return;
    any_item_ended_ = true;
    if (item == user_data_importer::PASSWORDS) {
      password_complete_ = true;
      // Concrete L4 result producer must publish before PASSWORDS ItemEnded.
      // Missing metadata is failure, never invented successful completion.
      password_succeeded_ = false;
      if (host_) {
        const auto& result = host_->aux_password_import_result();
        password_succeeded_ = result.has_value() && result->succeeded;
      }
    }
  }
  void ImportEnded() override {
    if (stopped_) return;
    // Host notifies before deleting itself. Detach and clear the raw pointer
    // inside this callback; nothing may use it after returning to the host.
    if (host_) host_->set_observer(nullptr);
    host_ = nullptr;
    host_complete_ = true;
    if (password_requested_ && !password_complete_) {
      password_complete_ = true;
      password_succeeded_ = false;
    }
    // Original426495c: if preparation never started, there is no later cookie
    // reply to wait for. This is a failed prerequisite, not an empty success.
    if (!cookies_complete_ && !cookies_started_) {
      cookies_complete_ = true;
      cookies_succeeded_ = false;
    }
    MaybeFinish();
  }
  void MaybeFinish() {
    if (stopped_ || !host_complete_ || !cookies_complete_ || !password_complete_)
      return;
    // Original4264994..49e0: actual host/item/cookie/password outcomes.
    Finish(any_item_ended_ && cookies_succeeded_ && password_succeeded_);
  }
  void DetachAndCancelHost() {
    if (!host_) return;
    auto* host = host_.get();
    host_ = nullptr;
    host->set_observer(nullptr);
    host->Cancel();  // NotifyImportEnded then delete this.
  }
  void CleanupNewTarget() {
    if (new_target_path_.empty()) return;
    const auto path = std::exchange(new_target_path_, base::FilePath());
    if (auto* manager = g_browser_process->profile_manager())
      manager->GetProfileAttributesStorage().RemoveProfile(path);
    base::ThreadPool::PostTask(FROM_HERE, {base::MayBlock()}, base::BindOnce(
        [](base::FilePath path) { base::DeletePathRecursively(path); }, path));
  }

  void ScheduleCompletionChoice() {
    if (!show_completion_) return;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(
            [](TargetMode mode, base::FilePath path, OpenProfile open_profile,
               base::OnceClosure retire_owner) {
              std::move(retire_owner).Run();
              if (mode == TargetMode::kCurrentProfile) {
                aux_importer::ShowCurrentProfileImportCompleted(u"Firefox");
              } else {
                aux_importer::ShowNewProfileImportCompleted(u"Firefox",
                    base::BindOnce(std::move(open_profile), std::move(path)));
              }
            }, mode_, new_target_path_, std::move(open_profile_), std::move(retire_owner_)));
  }

  void Finish(bool succeeded) {
    if (stopped_) return;
    stopped_ = true;
    weak_.InvalidateWeakPtrs();
    DetachAndCancelHost();
    const bool cancelled = cancelled_;
    const bool show_completion = show_completion_;
    auto controls = controls_;
    auto update = update_;
    if (succeeded) ScheduleCompletionChoice();
    else {
      CleanupNewTarget();
      if (show_completion) controls.Run(true);
    }
    // Metadata observers/window callbacks may retire this owner synchronously.
    if (cancelled) update.Run("cancelled", {}, 0.1, {});
    else if (succeeded) update.Run("succeeded", {}, 1.0, {});
    else update.Run("failed", {}, 0.1, "Firefox import failed");
  }
  void Publish(std::string state, std::string error = {}, double progress = 0.1) {
    update_.Run(std::move(state), {}, progress, std::move(error));
  }

  TargetMode mode_ = TargetMode::kCurrentProfile;
  bool show_completion_ = false;
  OpenProfile open_profile_;
  base::RepeatingCallback<void(bool)> controls_;
  base::OnceClosure retire_owner_;
  base::FilePath new_target_path_;
  std::u16string new_target_name_;
  base::WeakPtr<Profile> profile_;
  const std::optional<base::FilePath> selected_source_path_;
  const bool bookmarks_only_;
  Update update_;
  std::unique_ptr<ImporterList> importer_list_;
  std::optional<user_data_importer::SourceProfile> selected_source_;
  raw_ptr<ExternalProcessImporterHost> host_ = nullptr;
  bool started_ = false, stopped_ = false, cancelled_ = false;
  bool any_item_ended_ = false, host_complete_ = false;
  bool cookies_started_ = false, cookies_complete_ = false, cookies_succeeded_ = false;
  bool password_requested_ = false, password_complete_ = false, password_succeeded_ = false;
  base::WeakPtrFactory<Impl> weak_{this};
};

FirefoxImport::FirefoxImport(Profile* profile,
                             std::optional<base::FilePath> selected_source_path,
                             bool bookmarks_only, Update update)
    : impl_(std::make_unique<Impl>(profile, std::move(selected_source_path),
                                    bookmarks_only, std::move(update))) {}
FirefoxImport::~FirefoxImport() = default;
void FirefoxImport::Start() { impl_->Start(); }
void FirefoxImport::Start(TargetMode mode, WebUILifecycle lifecycle) {
  impl_->Start(mode, true, std::move(lifecycle));
}
void FirefoxImport::Cancel() { impl_->Cancel(); }
}  // namespace aux_import
