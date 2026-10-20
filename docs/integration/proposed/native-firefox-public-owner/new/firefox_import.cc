// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied427acfc /42631c0 /4263a68 /42648b0 /42648ec orchestration.
#include "chrome/browser/extensions/api/aux_browser_import/firefox_import.h"

#include <utility>

#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/importer/external_process_importer_host.h"
#include "chrome/browser/importer/importer_list.h"
#include "chrome/browser/importer/importer_progress_observer.h"
#include "chrome/browser/importer/profile_writer.h"
#include "chrome/browser/profiles/profile.h"
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
    stopped_ = true;
    DetachAndCancelHost();
  }

  void Start() {
    if (started_ || stopped_) return;
    started_ = true;
    // Original427acfc publishes0.1, with no per-item public progress.
    Publish("running");
    if (!profile_) {
      Finish(false);
      return;
    }
    importer_list_ = std::make_unique<ImporterList>();
    importer_list_->DetectSourceProfiles(
        g_browser_process->GetApplicationLocale(), false,
        base::BindOnce(&Impl::SourcesReady, weak_.GetWeakPtr()));
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
    // Original Mac discovery produces0x4b. Do not silently mount a reduced
    // stock-Mac full import while its real password prerequisite is absent.
    if (!bookmarks_only_ && !(items & user_data_importer::PASSWORDS)) {
      Finish(false);
      return;
    }
    password_requested_ = (items & user_data_importer::PASSWORDS) != 0;
    // Original4263440..3450 considers an unrequested password item settled.
    password_complete_ = !password_requested_;
    password_succeeded_ = !password_requested_;
    selected_source_ = *selected;
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
  void Finish(bool succeeded) {
    if (stopped_) return;
    stopped_ = true;
    weak_.InvalidateWeakPtrs();
    DetachAndCancelHost();
    if (cancelled_) Publish("cancelled");
    else if (succeeded) Publish("succeeded", {}, 1.0);
    else Publish("failed", "Firefox import failed");
  }
  void Publish(std::string state, std::string error = {}, double progress = 0.1) {
    update_.Run(std::move(state), {}, progress, std::move(error));
  }

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
void FirefoxImport::Cancel() { impl_->Cancel(); }
}  // namespace aux_import
