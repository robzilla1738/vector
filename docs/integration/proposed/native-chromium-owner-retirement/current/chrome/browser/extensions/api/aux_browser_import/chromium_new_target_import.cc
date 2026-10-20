#include "chrome/browser/extensions/api/aux_browser_import/chromium_new_target_import.h"

#include <utility>
#include <vector>
#include "base/barrier_closure.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_photo.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_import_destination.h"
#include "chrome/browser/extensions/api/aux_browser_import/encrypted_source_bytes.h"
#include "chrome/browser/extensions/api/aux_browser_import/extension_import.h"
#include "chrome/browser/password_manager/factories/profile_password_store_factory.h"
#include "chrome/browser/profiles/keep_alive/profile_keep_alive_types.h"
#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_init_params.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/webui/aux_importer/import_profile_metadata.h"
#include "components/keyed_service/core/service_access_type.h"
#include "components/password_manager/core/browser/password_store/password_store_interface.h"
#include "content/public/browser/storage_partition.h"
#include "net/cookies/canonical_cookie.h"
#include "net/cookies/cookie_access_result.h"
#include "net/cookies/cookie_options.h"
#include "services/network/public/mojom/cookie_manager.mojom.h"
#include "url/gurl.h"

namespace aux_import {
namespace {
const char* SourceName(ChromiumCloneSource source) {
  switch (source) {
    case ChromiumCloneSource::kArc: return "Arc";
    case ChromiumCloneSource::kBrave: return "Brave";
    case ChromiumCloneSource::kAtlas: return "ChatGPT Atlas";
    case ChromiumCloneSource::kChrome: return "Chrome";
    case ChromiumCloneSource::kComet: return "Comet";
    case ChromiumCloneSource::kDia: return "Dia";
    case ChromiumCloneSource::kEdge: return "Microsoft Edge";
    case ChromiumCloneSource::kHelium: return "Helium";
  }
}
}  // namespace

ChromiumNewTargetImport::ChromiumNewTargetImport(ProfileManager& manager)
    : manager_(&manager) {}
ChromiumNewTargetImport::~ChromiumNewTargetImport() = default;

bool ChromiumNewTargetImport::Start(ChromiumNewTargetSelection selection,
                                     Completion completed) {
  if (running_)
    return false;
  running_ = true;
  cookies_done_ = passwords_done_ = false;
  completed_ = std::move(completed);
  receipt_.reset();
  profile_.reset();
  keep_alive_.reset();
  // Original425957c provider reply enters42534e8 BEFORE reserve/AddProfile.
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
      base::BindOnce(&CaptureChromiumNewTargetSource, std::move(selection)),
      base::BindOnce(&ChromiumNewTargetImport::Captured, weak_.GetWeakPtr()));
  return true;
}

void ChromiumNewTargetImport::Captured(ChromiumCapturedNewTargetSource captured) {
  if (!running_)
    return;
  auto& selection = captured.selection;
  // Original4253750 reserves a NEW directory and attributes BEFORE copying.
  target_profile_ = manager_->GenerateNextProfileDirectoryPath();
  profile_name_ = base::UTF8ToUTF16(SourceName(selection.source)) + u" - " +
                  selection.selected_profile_name;
  auto& attributes = manager_->GetProfileAttributesStorage();
  ProfileAttributesInitParams params;
  params.profile_path = target_profile_;
  params.profile_name = profile_name_;
  params.icon_index = attributes.ChooseAvatarIconIndexForNewProfile();
  auto self = weak_.GetWeakPtr();
  ChromiumCloneRequest request{selection.source,
      std::move(selection.source_profile), target_profile_, profile_name_,
      std::move(captured.password)};
  attributes.AddProfile(std::move(params));
  if (!self)
    return;  // The real UI owner retired; do not dispatch stale work.
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
      base::BindOnce(&PrepareChromiumNewTarget, std::move(request)),
      base::BindOnce(&ChromiumNewTargetImport::Prepared, weak_.GetWeakPtr()));
}

void ChromiumNewTargetImport::Prepared(ChromiumCloneWorkerResult result) {
  if (!running_)
    return;
  if (!result.success) {
    Fail(std::move(result.error));
    return;
  }
  receipt_ = std::move(result);
  // Original425784c passes initialized callback and a NULL created callback.
  manager_->CreateProfileAsync(
      target_profile_,
      base::BindOnce(&ChromiumNewTargetImport::Initialized, weak_.GetWeakPtr()));
}

void ChromiumNewTargetImport::Initialized(Profile* profile) {
  if (!running_)
    return;
  if (!profile || !receipt_) {
    Fail("Chromium browser import failed");
    return;
  }
  profile_ = profile->GetWeakPtr();
  keep_alive_ = ScopedProfileKeepAlive::TryAcquire(
      profile, ProfileKeepAliveOrigin::kAuxBrowserImport);
  if (!keep_alive_) {
    Fail("Chromium browser import failed");
    return;
  }
  auto self = weak_.GetWeakPtr();
  auto actual_profile = profile_;
  auto photo = std::move(receipt_->photo);
  auto extensions = std::move(receipt_->extensions);
  aux_importer::SetInitializedImportProfileName(*profile, *manager_, profile_name_);
  if (!self || !actual_profile)
    return;
  aux_importer::RemoveImportedExtensionResetRecords(*profile);
  if (!self || !actual_profile)
    return;
  if (photo) {
    if (auto* entry = manager_->GetProfileAttributesStorage()
                          .GetProfileAttributesWithPath(profile->GetPath())) {
      ApplyChromiumClonePhoto(*profile, *entry, *photo);
    }
  }
  if (!self || !actual_profile)
    return;
  aux_importer::ResetInitializedImportProfileTheme(profile);
  if (!self || !actual_profile)
    return;
  // Source4258108 has its own real registry-observer lifetime. It deliberately
  // DOES NOT add an import-completion flag or wait for installation.
  InstallChromiumExtensions(profile, extensions);
  if (self && actual_profile)
    RestoreSecrets();
}

void ChromiumNewTargetImport::RestoreSecrets() {
  if (!profile_ || !receipt_)
    return;
  const auto* cookie_rows = receipt_->cookies.FindList("cookies");
  const auto* password_rows = receipt_->passwords.FindList("passwords");
  if (!cookie_rows || !password_rows) {
    Fail("Chromium browser import failed");
    return;
  }
  using Cookie = std::pair<std::unique_ptr<net::CanonicalCookie>, GURL>;
  std::vector<Cookie> cookies;
  std::vector<password_manager::StoredCredential> passwords;
  for (const auto& value : *cookie_rows) {
    const auto& row = value.GetDict();
    for (const char* name : {"secret", "host", "name", "path", "partition"}) {
      if (!GetEncryptedSourceBytes(row, name)) {
        Fail("Chromium browser import failed");
        return;
      }
    }
    GURL source;
    auto cookie = BuildChromiumImportedCookie(row, source);
    if (cookie)
      cookies.emplace_back(std::move(cookie), std::move(source));
  }
  for (const auto& value : *password_rows) {
    auto form = BuildChromiumImportedPassword(value.GetDict());
    if (!form) {
      Fail("Chromium browser import failed");
      return;
    }
    passwords.push_back(std::move(*form));
  }
  // The private snapshot is no longer needed after typed native conversion.
  receipt_.reset();
  scoped_refptr<password_manager::PasswordStoreInterface> store;
  if (!passwords.empty()) {
    store = ProfilePasswordStoreFactory::GetForProfile(
        profile_.get(), ServiceAccessType::EXPLICIT_ACCESS);
  }
  auto* manager = cookies.empty() ? nullptr
      : profile_->GetDefaultStoragePartition()->GetCookieManagerForBrowserProcess();
  // Original4258618 missing-store/manager and empty-vector skips set the
  // corresponding real completion flag. Backend validation remains native.
  passwords_done_ = passwords.empty() || !store;
  cookies_done_ = cookies.empty() || !manager;
  auto self = weak_.GetWeakPtr();
  if (manager) {
    auto barrier = base::BarrierClosure(
        cookies.size(), base::BindOnce(&ChromiumNewTargetImport::CookiesCompleted,
                                      weak_.GetWeakPtr()));
    for (auto& [cookie, source] : cookies) {
      manager->SetCanonicalCookie(
          *cookie, source, net::CookieOptions::MakeAllInclusive(),
          base::BindOnce([](base::RepeatingClosure barrier,
                            net::CookieAccessResult /*result*/) {
            // Original425f838 counts completion regardless of Include result.
            barrier.Run();
          }, barrier));
      if (!self || !running_)
        return;
    }
  }
  if (store) {
    store->AddLogins(std::move(passwords), base::BindOnce(
        [](base::WeakPtr<ChromiumNewTargetImport> owner,
           scoped_refptr<password_manager::PasswordStoreInterface> /*store*/) {
          if (owner)
            owner->PasswordsCompleted();
        }, weak_.GetWeakPtr(), store));
    return;
  }
  MaybeComplete();
}
void ChromiumNewTargetImport::CookiesCompleted() {
  cookies_done_ = true;
  MaybeComplete();
}
void ChromiumNewTargetImport::PasswordsCompleted() {
  passwords_done_ = true;
  MaybeComplete();
}
void ChromiumNewTargetImport::MaybeComplete() {
  if (running_ && cookies_done_ && passwords_done_)
    Finish(true, {});
}
void ChromiumNewTargetImport::Fail(std::string error) {
  // Original4253b3c removes this mode0 reservation and posts target deletion.
  auto target = target_profile_;
  auto self = weak_.GetWeakPtr();
  manager_->GetProfileAttributesStorage().RemoveProfile(target);
  base::ThreadPool::PostTask(FROM_HERE, {base::MayBlock()},
      base::BindOnce(base::IgnoreResult(&base::DeletePathRecursively), target));
  if (self)
    Finish(false, std::move(error));
}
void ChromiumNewTargetImport::Finish(bool success, std::string error) {
  if (!running_)
    return;
  running_ = false;
  receipt_.reset();
  profile_.reset();
  auto alive_through_callback = std::move(keep_alive_);
  auto callback = std::move(completed_);
  ChromiumNewTargetCompletion result{success, target_profile_, profile_name_,
                                      std::move(error)};
  // Original4258c80 reports true BEFORE its optional UI/window-switch path.
  // The real WebUI owner consumes this completion with the actual L4 helpers.
  if (callback)
    std::move(callback).Run(std::move(result));
}
}  // namespace aux_import
