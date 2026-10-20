// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/importer/external_process_importer_client.h"

#include <utility>

#include "base/functional/bind.h"
#include "base/logging.h"
#include "base/numerics/safe_conversions.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/importer/external_process_importer_host.h"
#include "chrome/browser/importer/in_process_importer_bridge.h"
#include "chrome/common/importer/firefox_importer_utils.h"
#include "chrome/common/importer/profile_import.mojom.h"
#include "chrome/grit/generated_resources.h"
#include "components/strings/grit/components_strings.h"
#include "components/user_data_importer/common/imported_bookmark_entry.h"
#include "components/user_data_importer/mojom/bookmark_html_parser.mojom.h"
#include "content/public/browser/service_process_host.h"
#include "ui/base/l10n/l10n_util.h"

ExternalProcessImporterClient::ExternalProcessImporterClient(
    base::WeakPtr<ExternalProcessImporterHost> importer_host,
    const user_data_importer::SourceProfile& source_profile,
    uint16_t items,
    InProcessImporterBridge* bridge)
    : total_bookmarks_count_(0),
      total_history_rows_count_(0),
      total_favicons_count_(0),
      process_importer_host_(importer_host),
      source_profile_(source_profile),
      items_(items),
      bridge_(bridge),
      cancelled_(false) {
  process_importer_host_->NotifyImportStarted();
}

void ExternalProcessImporterClient::Start() {
  AddRef();  // balanced in Cleanup.

  content::ServiceProcessHost::Launch(
      profile_import_.BindNewPipeAndPassReceiver(),
      content::ServiceProcessHost::Options()
          .WithDisplayName(IDS_UTILITY_PROCESS_PROFILE_IMPORTER_NAME)
          .Pass());
  profile_import_.set_disconnect_handler(
      base::BindOnce(&ExternalProcessImporterClient::OnProcessCrashed, this));

  // Dictionary of all localized strings that could be needed by the importer
  // in the external process.
  base::flat_map<uint32_t, std::string> localized_strings;
  localized_strings.try_emplace(IDS_BOOKMARK_GROUP,
                                l10n_util::GetStringUTF8(IDS_BOOKMARK_GROUP));
  localized_strings.try_emplace(
      IDS_BOOKMARK_GROUP_FROM_FIREFOX,
      l10n_util::GetStringUTF8(IDS_BOOKMARK_GROUP_FROM_FIREFOX));
  localized_strings.try_emplace(
      IDS_BOOKMARK_GROUP_FROM_SAFARI,
      l10n_util::GetStringUTF8(IDS_BOOKMARK_GROUP_FROM_SAFARI));
  localized_strings.try_emplace(
      IDS_IMPORT_FROM_FIREFOX,
      l10n_util::GetStringUTF8(IDS_IMPORT_FROM_FIREFOX));
  localized_strings.try_emplace(
      IDS_IMPORT_FROM_ICEWEASEL,
      l10n_util::GetStringUTF8(IDS_IMPORT_FROM_ICEWEASEL));
  localized_strings.try_emplace(
      IDS_IMPORT_FROM_SAFARI, l10n_util::GetStringUTF8(IDS_IMPORT_FROM_SAFARI));
  localized_strings.try_emplace(
      IDS_BOOKMARK_BAR_FOLDER_NAME,
      l10n_util::GetStringUTF8(IDS_BOOKMARK_BAR_FOLDER_NAME));

  mojo::PendingRemote<user_data_importer::mojom::BookmarkHtmlParser>
      bookmark_html_parser;
  // Note: `FAVORITES` corresponds to bookmarks.
  if (items_ & user_data_importer::FAVORITES) {
    content::ServiceProcessHost::Launch(
        bookmark_html_parser.InitWithNewPipeAndPassReceiver(),
        content::ServiceProcessHost::Options()
            .WithDisplayName(IDS_CONTENT_BOOKMARK_PARSER_SERVICE_DISPLAY_NAME)
            .Pass());
  }

  // If the utility process hasn't started yet the message will queue until it
  // does.
  profile_import_->StartImport(source_profile_, items_, localized_strings,
                               receiver_.BindNewPipeAndPassRemote(),
                               std::move(bookmark_html_parser));
}

void ExternalProcessImporterClient::Cancel() {
  if (cancelled_)
    return;

  cancelled_ = true;
  profile_import_->CancelImport();
  CloseMojoHandles();
  Release();
}

void ExternalProcessImporterClient::OnProcessCrashed() {
  DLOG(ERROR) << __func__;
  if (cancelled_)
    return;

  // If the host is still around, cancel the import; otherwise it means the
  // import was already cancelled or completed and this message can be dropped.
  if (process_importer_host_.get())
    process_importer_host_->Cancel();
}

void ExternalProcessImporterClient::OnImportStart() {
  if (cancelled_)
    return;

  bridge_->NotifyStarted();
}

void ExternalProcessImporterClient::OnImportFinished(
    bool succeeded, const std::string& error_msg) {
  if (cancelled_)
    return;

  if (!succeeded)
    LOG(WARNING) << "Import failed.  Error: " << error_msg;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  import_finished_received_ = true;
  if (firefox_password_batch_pending_)
    return;
#endif
  Cleanup();
}

void ExternalProcessImporterClient::OnImportItemStart(
    user_data_importer::ImportItem import_item) {
  if (cancelled_)
    return;

  bridge_->NotifyItemStarted(import_item);
}

void ExternalProcessImporterClient::OnImportItemFinished(
    user_data_importer::ImportItem import_item) {
  if (cancelled_)
    return;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  scoped_refptr<ExternalProcessImporterClient> keep_alive(this);
  if (import_item == user_data_importer::PASSWORDS &&
      source_profile_.importer_type == user_data_importer::TYPE_FIREFOX) {
    if (!firefox_password_result_received_ ||
        !firefox_password_result_succeeded_ ||
        firefox_password_forms_.size() != firefox_password_count_) {
      PublishFirefoxPasswordResult(false,
          base::checked_cast<uint32_t>(firefox_password_forms_.size()));
    } else if (firefox_password_count_ == 0) {
      PublishFirefoxPasswordResult(true, 0);
    } else {
      firefox_password_batch_pending_ = true;
      auto forms = std::move(firefox_password_forms_);
      bridge_->SetFirefoxPasswordForms(forms, base::BindOnce(
          &ExternalProcessImporterClient::OnFirefoxPasswordBatchComplete,
          base::RetainedRef(this)));
      return;
    }
  }
#endif
  bridge_->NotifyItemEnded(import_item);
  if (!cancelled_ && profile_import_)
    profile_import_->ReportImportItemFinished(import_item);
}

void ExternalProcessImporterClient::OnHistoryImportStart(
    uint32_t total_history_rows_count) {
  if (cancelled_)
    return;

  total_history_rows_count_ = total_history_rows_count;
  history_rows_.reserve(total_history_rows_count);
}

void ExternalProcessImporterClient::OnHistoryImportGroup(
    const std::vector<user_data_importer::ImporterURLRow>& history_rows_group,
    int visit_source) {
  if (cancelled_)
    return;

  history_rows_.insert(history_rows_.end(), history_rows_group.begin(),
                       history_rows_group.end());
  if (history_rows_.size() >= total_history_rows_count_)
    bridge_->SetHistoryItems(
        history_rows_,
        static_cast<user_data_importer::VisitSource>(visit_source));
}

void ExternalProcessImporterClient::OnHomePageImportReady(
    const GURL& home_page) {
  if (cancelled_)
    return;

  bridge_->AddHomePage(home_page);
}

void ExternalProcessImporterClient::OnBookmarksImportStart(
    const std::u16string& first_folder_name,
    uint32_t total_bookmarks_count) {
  if (cancelled_)
    return;

  bookmarks_first_folder_name_ = first_folder_name;
  total_bookmarks_count_ = total_bookmarks_count;
  bookmarks_.reserve(total_bookmarks_count);
}

void ExternalProcessImporterClient::OnBookmarksImportGroup(
    const std::vector<user_data_importer::ImportedBookmarkEntry>&
        bookmarks_group) {
  if (cancelled_)
    return;

  // Collect sets of bookmarks from importer process until we have reached
  // total_bookmarks_count_:
  bookmarks_.insert(bookmarks_.end(), bookmarks_group.begin(),
                    bookmarks_group.end());
  if (bookmarks_.size() >= total_bookmarks_count_)
    bridge_->AddBookmarks(bookmarks_, bookmarks_first_folder_name_);
}

void ExternalProcessImporterClient::OnFaviconsImportStart(
    uint32_t total_favicons_count) {
  if (cancelled_)
    return;

  total_favicons_count_ = total_favicons_count;
  favicons_.reserve(total_favicons_count);
}

void ExternalProcessImporterClient::OnFaviconsImportGroup(
    const favicon_base::FaviconUsageDataList& favicons_group) {
  if (cancelled_)
    return;

  favicons_.insert(favicons_.end(), favicons_group.begin(),
                    favicons_group.end());
  if (favicons_.size() >= total_favicons_count_)
    bridge_->SetFavicons(favicons_);
}

void ExternalProcessImporterClient::OnPasswordFormImportReady(
    const user_data_importer::ImportedPasswordForm& form) {
  if (cancelled_)
    return;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (source_profile_.importer_type == user_data_importer::TYPE_FIREFOX) {
    firefox_password_forms_.push_back(form);
    return;
  }
#endif
  bridge_->SetPasswordForm(form);
}

void ExternalProcessImporterClient::OnFirefoxPasswordImportResult(
    bool succeeded, uint32_t count) {
  if (cancelled_)
    return;
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  firefox_password_result_received_ = true;
  firefox_password_result_succeeded_ = succeeded;
  firefox_password_count_ = count;
#endif
}

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
void ExternalProcessImporterClient::PublishFirefoxPasswordResult(
    bool succeeded, uint32_t count) {
  if (process_importer_host_)
    process_importer_host_->SetAuxPasswordImportResult(succeeded, count);
}

void ExternalProcessImporterClient::OnFirefoxPasswordBatchComplete(
    bool succeeded) {
  if (cancelled_)
    return;
  firefox_password_batch_pending_ = false;
  PublishFirefoxPasswordResult(succeeded, firefox_password_count_);
  if (process_importer_host_)
    bridge_->NotifyItemEnded(user_data_importer::PASSWORDS);
  if (cancelled_)
    return;
  if (profile_import_)
    profile_import_->ReportImportItemFinished(user_data_importer::PASSWORDS);
  if (import_finished_received_)
    Cleanup();
}
#endif

void ExternalProcessImporterClient::OnKeywordsImportReady(
    const std::vector<user_data_importer::SearchEngineInfo>& search_engines,
    bool unique_on_host_and_path) {
  if (cancelled_)
    return;
  bridge_->SetKeywords(search_engines, unique_on_host_and_path);
}

void ExternalProcessImporterClient::OnAutofillFormDataImportStart(
    uint32_t total_autofill_form_data_entry_count) {
  if (cancelled_)
    return;

  total_autofill_form_data_entry_count_ = total_autofill_form_data_entry_count;
  autofill_form_data_.reserve(total_autofill_form_data_entry_count);
}

void ExternalProcessImporterClient::OnAutofillFormDataImportGroup(
    const std::vector<ImporterAutofillFormDataEntry>&
        autofill_form_data_entry_group) {
  if (cancelled_)
    return;

  autofill_form_data_.insert(autofill_form_data_.end(),
                             autofill_form_data_entry_group.begin(),
                             autofill_form_data_entry_group.end());
  if (autofill_form_data_.size() >= total_autofill_form_data_entry_count_)
    bridge_->SetAutofillFormData(autofill_form_data_);
}

ExternalProcessImporterClient::~ExternalProcessImporterClient() = default;

void ExternalProcessImporterClient::Cleanup() {
  if (cancelled_)
    return;

  if (process_importer_host_.get())
    process_importer_host_->NotifyImportEnded();
  CloseMojoHandles();
  Release();
}

void ExternalProcessImporterClient::CloseMojoHandles() {
  profile_import_.reset();
  receiver_.reset();
}
