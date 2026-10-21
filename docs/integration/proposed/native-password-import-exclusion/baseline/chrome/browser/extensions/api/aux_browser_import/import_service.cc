// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_import_destination.h"

#include <algorithm>
#include <set>

#include "base/barrier_closure.h"
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/uuid.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/extensions/api/aux_browser_import/migrator.h"
#include "chrome/browser/extensions/api/aux_browser_import/extension_import.h"
#include "chrome/browser/extensions/api/aux_browser_import/encrypted_source_bytes.h"
#include "chrome/browser/extensions/api/aux_browser_import/safari_import.h"
#include "chrome/browser/extensions/api/aux_browser_import/firefox_import.h"
#include "chrome/browser/history/history_service_factory.h"
#include "chrome/browser/password_manager/factories/profile_password_store_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/common/bookmark_pref_names.h"
#include "components/history/core/browser/history_service.h"
#include "components/history/core/browser/history_types.h"
#include "components/history/core/common/pref_names.h"
#include "components/keyed_service/core/service_access_type.h"
#include "components/password_manager/core/browser/password_form_digest.h"
#include "components/password_manager/core/browser/password_store/password_store_consumer.h"
#include "components/password_manager/core/browser/password_store/stored_credential.h"
#include "components/password_manager/core/common/password_manager_pref_names.h"
#include "components/prefs/pref_service.h"
#include "components/prefs/scoped_user_pref_update.h"
#include "components/user_data_importer/mojom/bookmark_html_parser.mojom.h"
#include "content/public/browser/service_process_host.h"
#include "content/public/browser/storage_partition.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_event_histogram_value.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "net/cookies/canonical_cookie.h"
#include "net/cookies/cookie_access_result.h"
#include "net/cookies/cookie_options.h"
#include "net/cookies/cookie_util.h"
#include "services/network/public/mojom/cookie_manager.mojom.h"
#include "ui/base/page_transition_types.h"
namespace aux_import {
namespace {
constexpr char kService[] = "aux.browser.import.service";
base::DictValue PublicJob(const base::DictValue& job) {
  // Supplied4277dc8: four mandatory fields and two nonempty optionals.
  // Keep adapter bookkeeping private; supplied1852 consumes this exact object.
  base::DictValue result;
  result.Set("jobId", *job.FindString("jobId"));
  const auto& source = *job.FindString("sourceId");
  result.Set("sourceId", source == "atlas" ? "chatgpt-atlas" : source);
  result.Set("state", *job.FindString("status"));
  result.Set("progress", job.FindDouble("progress").value_or(0.0));
  if (const auto* kind = job.FindString("currentDataKind"); kind && !kind->empty())
    result.Set("currentDataKind", *kind);
  if (const auto* error = job.FindString("error"); error && !error->empty())
    result.Set("errorMessage", *error);
  return result;
}
const bookmarks::BookmarkNode* Root(bookmarks::BookmarkModel* model,
                                    std::string_view root) {
  return root == "bookmark_bar" ? model->bookmark_bar_node()
         : root == "synced"     ? model->mobile_node()
                                : model->other_node();
}
base::Time Timestamp(const base::DictValue& row,
                     std::string_view key,
                     bool unix_time) {
  int64_t number = 0;
  if (const auto* text = row.FindString(key)) {
    base::StringToInt64(*text, &number);
  }
  const auto micros = base::Microseconds(number);
  return unix_time ? base::Time::UnixEpoch() + micros
                   : base::Time::FromDeltaSinceWindowsEpoch(micros);
}
}  // namespace
namespace {
std::optional<password_manager::StoredCredential> PrepareChromiumPassword(
    const base::DictValue& row) {
  const auto secret = GetEncryptedSourceBytes(row, "secret");
  if (!secret) {
    return std::nullopt;
  }
  for (auto name : {"url", "action", "realm", "submitElement", "usernameElement",
                    "username", "passwordElement", "displayName", "iconUrl",
                    "federationUrl", "senderEmail", "senderName",
                    "senderProfileImageUrl"}) {
    if (!GetEncryptedSourceBytes(row, name)) {
      return std::nullopt;
    }
  }
  auto text = [&](std::string_view name) {
    return std::string(*GetEncryptedSourceBytes(row, name));
  };
  password_manager::StoredCredential form;
  form.url = GURL(text("url"));
  form.action = GURL(text("action"));
  form.signon_realm = text("realm");
  // Supplied425b820..425baf8 reconstructs the source form without an
  // HTTP-only URL/realm filter; the real store retains its own validation.
  const auto scheme = row.FindInt("scheme").value_or(0);
  form.scheme = static_cast<password_manager::PasswordForm::Scheme>(scheme);
  form.submit_element = base::UTF8ToUTF16(text("submitElement"));
  form.username_element =
      base::UTF8ToUTF16(text("usernameElement"));
  form.username_value = base::UTF8ToUTF16(text("username"));
  form.password_element =
      base::UTF8ToUTF16(text("passwordElement"));
  form.password_value =
      password_manager::PasswordString(base::UTF8ToUTF16(*secret));
  form.date_created = Timestamp(row, "created", false);
  form.date_last_used = Timestamp(row, "used", false);
  form.date_password_modified = Timestamp(row, "modified", false);
  form.times_used_in_html_form = row.FindInt("timesUsed").value_or(0);
  form.blocked_by_user = row.FindBool("blocked").value_or(false);
  form.type = static_cast<password_manager::PasswordForm::Type>(
      row.FindInt("passwordType").value_or(0));
  form.display_name = base::UTF8ToUTF16(text("displayName"));
  form.icon_url = GURL(text("iconUrl"));
  form.federation_origin = url::SchemeHostPort(GURL(text("federationUrl")));
  form.skip_zero_click = row.FindBool("skipZeroClick").value_or(false);
  form.generation_upload_status =
      static_cast<password_manager::PasswordForm::GenerationUploadStatus>(
          row.FindInt("generationUploadStatus").value_or(0));
  form.date_received = Timestamp(row, "received", false);
  form.date_last_filled = Timestamp(row, "filled", false);
  form.sender_email = base::UTF8ToUTF16(text("senderEmail"));
  form.sender_name = base::UTF8ToUTF16(text("senderName"));
  form.sharing_notification_displayed =
      row.FindBool("sharingNotificationDisplayed").value_or(false);
  form.sender_profile_image_url = GURL(text("senderProfileImageUrl"));
  form.actor_login_approved = row.FindBool("actorLoginApproved").value_or(false);
  if (const auto* note = row.FindString("note"); note && !note->empty()) {
    form.SetPasswordNote(base::UTF8ToUTF16(*note));
  }
  return std::move(form);
}
std::u16string ChromiumImportFolderName(std::string_view source) {
  // Original425fe90 source labels, not the public chooser's friendly labels.
  const char* name = source == "arc"       ? "Arc"
                     : source == "brave" ? "Brave"
                     : source == "chrome" ? "Chrome"
                     : source == "comet" ? "Comet"
                     : source == "dia" ? "Dia"
                     : source == "helium" ? "Helium"
                     : source == "atlas" ? "ChatGPT Atlas"
                     : source == "edge" ? "Microsoft Edge"
                                        : "Browser";
  return u"Imported from " + base::UTF8ToUTF16(name);
}
int AddCurrentProfileBookmarks(Profile* profile,
                                 bookmarks::BookmarkModel* model,
                                 const base::ListValue& entries,
                                 std::string_view source) {
  auto admitted = [](const base::Value& entry) {
    const auto& row = entry.GetDict();
    const auto* title = row.FindString("title");
    if (!title || !row.FindString("root")) {
      return false;
    }
    if (row.FindBool("folder").value_or(false)) {
      return !title->empty() || row.FindBool("arcSidebar").value_or(false);
    }
    const auto* text = row.FindString("url");
    const GURL url(text ? *text : std::string());
    return url.is_valid() && !url.SchemeIs("chrome") &&
           !url.SchemeIs("chrome-extension") && !url.SchemeIs("devtools");
  };
  // Source425c084 filters these before constructing the writer's vector.
  if (std::ranges::none_of(entries, admitted)) {
    return 0;
  }
  // Supplied41076f0 always imports to a new unique folder. Stock155's
  // ProfileWriter empty-bookmark-bar flattening is a different implementation.
  const auto* bar = model->account_bookmark_bar_node()
                        ? model->account_bookmark_bar_node()
                        : model->bookmark_bar_node();
  std::set<std::u16string> existing;
  for (const auto& child : bar->children()) {
    if (child->is_folder()) {
      existing.insert(child->GetTitle());
    }
  }
  const auto base_name = ChromiumImportFolderName(source);
  auto name = base_name;
  for (size_t suffix = 1; existing.contains(name); ++suffix) {
    name = base_name + u" (" + base::NumberToString16(suffix) + u")";
  }
  model->BeginExtensiveChanges();
  const auto* imported = model->AddFolder(bar, bar->children().size(), name);
  std::set<const bookmarks::BookmarkNode*> modified{imported};
  int count = 0;
  bool toolbar = false;
  for (const auto& entry : entries) {
    const auto& row = entry.GetDict();
    const auto* title = row.FindString("title");
    const auto* root = row.FindString("root");
    if (!admitted(entry)) {
      continue;
    }
    const bool folder = row.FindBool("folder").value_or(false);
    const auto* url_text = row.FindString("url");
    const GURL url(url_text ? *url_text : std::string());
    const bookmarks::BookmarkNode* parent = imported;
    auto descend = [&](std::u16string_view segment) {
      for (const auto& child : parent->children()) {
        if (child->is_folder() && child->GetTitle() == segment) {
          parent = child.get();
          return;
        }
      }
      parent = model->AddFolder(parent, parent->children().size(),
                                std::u16string(segment));
    };
    if (const auto* root_name = row.FindString("sourceRootName")) {
      descend(base::UTF8ToUTF16(*root_name));
    }
    if (const auto* path = row.FindList("path")) {
      for (const auto& value : *path) {
        // Original flattening keeps unnamed folders out of the path.
        if (!value.GetString().empty() || row.FindBool("arcSidebar").value_or(false)) {
          descend(base::UTF8ToUTF16(value.GetString()));
        }
      }
    }
    modified.insert(parent);
    toolbar |= *root == "bookmark_bar";
    if (folder) {
      model->AddFolder(parent, parent->children().size(), base::UTF8ToUTF16(*title));
    } else {
      auto created = Timestamp(row, "createdWindowsMicros", false);
      if (created.is_null() || created <= base::Time::FromDeltaSinceWindowsEpoch(
                                             base::Microseconds(0))) {
        created = base::Time::Now();
      }
      model->AddURL(parent, parent->children().size(),
                    base::UTF8ToUTF16(title->empty() ? url.spec() : *title),
                    url, nullptr, created);
      ++count;
    }
  }
  for (const auto* folder : modified) {
    model->ResetDateFolderModified(folder);
  }
  model->EndExtensiveChanges();
  if (toolbar) {
    profile->GetPrefs()->SetBoolean(bookmarks::prefs::kShowBookmarkBar, true);
  }
  return count;
}
std::unique_ptr<net::CanonicalCookie> PrepareChromiumCookie(
    const base::DictValue& row, GURL& source) {
  auto text = [&](std::string_view name) {
    return std::string(*GetEncryptedSourceBytes(row, name));
  };
  // Supplied425ab08..425ad80 skips partition parse errors and null canonical
  // cookies. These are row skips, not failures of the staged source batch.
  auto partition = net::CookiePartitionKey::FromStorage(
      text("partition"), row.FindBool("crossSite").value_or(false));
  if (!partition.has_value()) {
    return nullptr;
  }
  const int raw_same_site = row.FindInt("sameSite").value_or(-1);
  const int same_site = raw_same_site >= 0 && raw_same_site <= 2
                            ? raw_same_site : -1;
  const int raw_priority = row.FindInt("priority").value_or(1);
  const int priority = raw_priority == 0 ? 0 : raw_priority == 2 ? 2 : 1;
  const int raw_scheme = row.FindInt("sourceScheme").value_or(0);
  const int source_scheme = raw_scheme >= 0 && raw_scheme <= 2 ? raw_scheme : 0;
  const int raw_type = row.FindInt("sourceType").value_or(3);
  const int source_type = raw_type == 1 ? 1 : raw_type == 2 ? 2 : 3;
  auto expiry = Timestamp(row, "expires", false);
  if (*row.FindString("expires") == "0") {
    expiry = base::Time();
  }
  const bool secure = row.FindBool("secure").value_or(false);
  auto cookie = net::CanonicalCookie::FromStorage(
      text("name"), text("secret"),
      text("host"), text("path"),
      Timestamp(row, "created", false), expiry,
      Timestamp(row, "accessed", false), Timestamp(row, "updated", false),
      secure, row.FindBool("httpOnly").value_or(false),
      static_cast<net::CookieSameSite>(same_site),
      static_cast<net::CookiePriority>(priority), std::move(partition.value()),
      static_cast<net::CookieSourceScheme>(source_scheme),
      row.FindInt("sourcePort").value_or(-1),
      static_cast<net::CookieSourceType>(source_type),
      net::CanonicalCookieFromStorageCallSite::kSqlitePersistentCookieStore);
  if (!cookie) {
    return nullptr;
  }
  // Supplied425ad84..425aee4 uses the cookie path, then retries root when
  // invalid. Port normalization belongs to FromStorage; no synthetic URL port.
  const bool https = secure || source_scheme == 2;
  source = net::cookie_util::CookieDomainAndPathToURL(
      cookie->Domain(), cookie->Path(), https);
  if (!source.is_valid()) {
    source = net::cookie_util::CookieDomainAndPathToURL(
        cookie->Domain(), "/", https);
  }
  return source.is_valid() ? std::move(cookie) : nullptr;
}
}  // namespace
std::optional<password_manager::StoredCredential> BuildChromiumImportedPassword(
    const base::DictValue& row) {
  return PrepareChromiumPassword(row);
}
std::unique_ptr<net::CanonicalCookie> BuildChromiumImportedCookie(
    const base::DictValue& row, GURL& source) {
  return PrepareChromiumCookie(row, source);
}
class SecretLookup final : public password_manager::PasswordStoreConsumer {
 public:
  SecretLookup(scoped_refptr<password_manager::PasswordStoreInterface> store,
               password_manager::StoredCredential form,
               base::OnceCallback<void(bool, bool)> done)
      : store_(std::move(store)),
        form_(std::move(form)),
        done_(std::move(done)) {}
  void Start() {
    store_->GetLogins(password_manager::PasswordFormDigest(
                          form_.scheme, form_.signon_realm, form_.url),
                      weak_.GetWeakPtr());
  }
  void OnGetPasswordStoreResultsOrErrorFrom(
      password_manager::PasswordStoreInterface*,
      base::expected<std::vector<password_manager::StoredCredential>,
                     password_manager::PasswordStoreBackendError> result)
      override {
    if (!result.has_value()) {
      std::move(done_).Run(false, false);
      return;
    }
    for (const auto& current : result.value()) {
      if (password_manager::AreStoredCredentialUniqueKeysEqual(current,
                                                               form_)) {
        std::move(done_).Run(true, true);
        return;
      }
    }
    auto store = store_;
    store_->AddLogin(
        std::move(form_),
        base::BindOnce(
            [](scoped_refptr<password_manager::PasswordStoreInterface> store,
               base::OnceCallback<void(bool, bool)> done) {
              std::move(done).Run(
                  store->GetError() ==
                      password_manager::ActionableError::kNoError,
                  false);
            },
            std::move(store), std::move(done_)));
  }

 private:
  scoped_refptr<password_manager::PasswordStoreInterface> store_;
  password_manager::StoredCredential form_;
  base::OnceCallback<void(bool, bool)> done_;
  base::WeakPtrFactory<SecretLookup> weak_{this};
};
struct ImportService::Job {
  base::DictValue state;
  std::string extension, source, archive;
  std::string source_profile;
  mojo::Remote<user_data_importer::mojom::BookmarkHtmlParser> parser;
  bool firefox = false, cancelled = false;
  bool native_webui = false;
  mutable base::OnceCallback<void(bool)> native_completed;
  bool safari_bookmarks_only = false;
  std::unique_ptr<SafariImport> safari_import;
  std::unique_ptr<FirefoxImport> firefox_import;
  base::FilePath path;
  std::vector<std::string> categories;
  size_t category = 0, row = 0;
  int imported = 0;
  base::ListValue rows;
  base::ListValue snapshots;
  bool chromium_staged = false;
  bool import_extensions = false;
  bool chromium_secrets_started = false;
  bool chromium_secrets_completed = false;
  bool chromium_passwords_done = false, chromium_cookies_done = false;
  std::unique_ptr<SecretLookup> secret_lookup;
};
ImportService* ImportService::Get(Profile* profile) {
  auto* service = static_cast<ImportService*>(profile->GetUserData(kService));
  if (service) {
    return service;
  }
  auto owned = std::make_unique<ImportService>(profile);
  auto* result = owned.get();
  profile->SetUserData(kService, std::move(owned));
  return result;
}
ImportService::ImportService(Profile* profile)
    : profile_(profile->GetWeakPtr()) {}
ImportService::~ImportService() = default;
base::ListValue ImportService::PublicSources() const {
  auto result = sources_.Clone();
  for (auto& source : result) {
    const auto* id = source.GetDict().FindString("id");
    const bool file_import = id && *id == "safari";
    if (id && *id == "atlas")
      source.GetDict().Set("id", "chatgpt-atlas");
    if (file_import)
      source.GetDict().Set("requiresFileImport", true);
    else
      source.GetDict().Remove("requiresFileImport");
    // Preserve the supplied descriptor, independently of this port's progress.
    // Original4275f60 declares Safari's four kinds;4276460 declares the five
    // Chromium/Firefox kinds. This array drives the actual supplied UI.
    base::ListValue supported;
    for (const char* kind : {"history", "bookmarks", "passwords"}) {
      supported.Append(kind);
    }
    if (file_import) {
      supported.Append("paymentCards");
    } else {
      supported.Append("cookies");
      supported.Append("autofill");
    }
    source.GetDict().Set("supportedDataKinds", std::move(supported));
    source.GetDict().Remove("nativeFirefox");
    source.GetDict().Remove("nativeFixture");
    if (auto* profiles = source.GetDict().FindList("profiles")) {
      for (auto& profile : *profiles) {
        profile.GetDict().Remove("nativePath");
      }
    }
  }
  return result;
}
void ImportService::DidDiscover(Reply reply, base::ListValue sources) {
  sources_ = std::move(sources);
  discovered_ = true;
  std::move(reply).Run(base::Value(PublicSources()), "");
}
std::string ImportService::StartChromiumWebUIImport(
    std::string source, const base::DictValue& selected,
    base::OnceCallback<void(bool)> completed) {
  const auto* path = selected.FindString("nativePath");
  if (!profile_ || !path) return {};
  auto job = std::make_unique<Job>();
  job->source = std::move(source);
  job->path = base::FilePath(*path);
  if (const auto* id = selected.FindString("id")) job->source_profile = *id;
  // The existing supplied current-profile full path excludes preferences.
  // Retain its actual snapshot/destination sequence and extension owner.
  job->categories = {"bookmarks", "history", "passwords", "cookies"};
  job->import_extensions = true;
  job->native_webui = true;
  job->native_completed = std::move(completed);
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  job->state.Set("jobId", id);
  job->state.Set("sourceId", job->source);
  job->state.Set("status", "queued");
  job->state.Set("completed", 0);
  job->state.Set("total", static_cast<int>(job->categories.size()));
  jobs_.emplace(id, std::move(job));
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&ImportService::Next, weak_.GetWeakPtr(), id));
  return id;
}
void ImportService::CancelChromiumWebUIImport(const std::string& id) {
  const auto found = jobs_.find(id);
  if (found == jobs_.end() || !found->second->native_webui) return;
  auto& job = *found->second;
  job.native_completed.Reset();
  job.cancelled = true;
  job.rows.clear();
  job.snapshots.clear();
  job.secret_lookup.reset();
  job.parser.reset();
}
void ImportService::Invoke(std::string method,
                           base::ListValue args,
                           std::string extension,
                           Reply reply) {
  auto error = [&](std::string reason) {
    std::move(reply).Run(std::nullopt, std::move(reason));
  };
  if (!profile_ || profile_->IsOffTheRecord()) {
    error("Import is unavailable in private browsing");
    return;
  }
  if (method == "getImportSources") {
    if (!args.empty()) {
      error("This method takes no arguments");
      return;
    }
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()}, base::BindOnce(&DiscoverSources),
        base::BindOnce(&ImportService::DidDiscover, weak_.GetWeakPtr(),
                       std::move(reply)));
    return;
  }
  if (method == "getImportProgress" || method == "cancelImport") {
    if (args.size() != 1 || !args[0].is_string() ||
        !jobs_.contains(args[0].GetString()) ||
        jobs_.at(args[0].GetString())->extension != extension) {
      error("Import job was not found for this caller");
      return;
    }
    auto& job = *jobs_.at(args[0].GetString());
    if (method == "cancelImport") {
      if (job.state.FindString("status") &&
          (*job.state.FindString("status") == "running" ||
           *job.state.FindString("status") == "queued")) {
        job.cancelled = true;
        if (job.safari_import) {
          job.safari_import->Cancel();
          std::move(reply).Run(base::Value(), "");
          return;
        }
        if (job.firefox_import) {
          job.firefox_import->Cancel();
          std::move(reply).Run(base::Value(), "");
          return;
        }
        job.rows.clear();
        job.snapshots.clear();
        job.secret_lookup.reset();
        job.parser.reset();
        job.archive.clear();
        job.state.Set("status", "cancelled");
        job.state.Set("importedRows", job.imported);
        Emit(job);
      }
      std::move(reply).Run(base::Value(), "");
    } else {
      std::move(reply).Run(base::Value(extension == "native-import-webui"
          ? job.state.Clone() : PublicJob(job.state)), "");
    }
    return;
  }
  if (method != "startImport" || args.size() != 1 || !args[0].is_dict() ||
      !discovered_) {
    error("Choose a discovered source before starting an import");
    return;
  }
  const auto& options = args[0].GetDict();
  const auto *source_id = options.FindString("sourceId"),
             *profile_id = options.FindString("sourceProfileId");
  std::string internal_source_id;
  if (source_id && *source_id == "chatgpt-atlas") {
    internal_source_id = "atlas";
    source_id = &internal_source_id;
  }
  // The supplied UI omits dataKinds for a full import and passes an explicit
  // list for a partial import. Keep the internal migrator categories unchanged.
  const bool has_kinds = options.Find("dataKinds") != nullptr;
  const bool has_categories = options.Find("categories") != nullptr;
  const auto* categories = has_kinds ? options.FindList("dataKinds")
                                   : options.FindList("categories");
  // Supplied4276970..6a98 admits omission (full import) or exactly one
  // explicit kind, bookmarks. Other explicit lists are not native capabilities.
  // The old categories alias belongs only to the actual internal recovery
  // WebUI caller; it is not part of the supplied extension API.
  const bool internal_categories = extension == "native-import-webui";
  if (!source_id || (has_kinds && has_categories) ||
      (has_categories && !internal_categories) ||
      (has_kinds && (!categories || categories->size() != 1 ||
                    !(*categories)[0].is_string() ||
                    (*categories)[0].GetString() != "bookmarks")) ||
      (has_categories &&
       (!categories || categories->empty() || categories->size() > 6))) {
    error(internal_categories
              ? "Choose a source and an unambiguous supported data-kind list"
              : "Invalid import options");
    return;
  }
  const base::DictValue *source = nullptr, *selected = nullptr;
  for (const auto& row : sources_) {
    if (row.GetDict().FindString("id") &&
        *row.GetDict().FindString("id") == *source_id) {
      source = &row.GetDict();
    }
  }
  if (!profile_id && source) {
    if (const auto* profiles = source->FindList("profiles");
        profiles && profiles->size() == 1) {
      profile_id = (*profiles)[0].GetDict().FindString("id");
    }
  }
  if (!profile_id && *source_id != "safari") {
    error("Choose a source profile before importing");
    return;
  }
  if (source && profile_id && source->FindBool("installed").value_or(false)) {
    if (const auto* profiles = source->FindList("profiles")) {
      for (const auto& row : *profiles) {
        if (row.GetDict().FindString("id") &&
            *row.GetDict().FindString("id") == *profile_id) {
          selected = &row.GetDict();
        }
      }
    }
  }
  if (!source || !source->FindBool("installed").value_or(false) ||
      (*source_id != "safari" &&
       (!selected || !selected->FindString("nativePath")))) {
    error("Selected source profile is unavailable");
    return;
  }
  if (!categories) categories = source->FindList("categories");
  if (!categories || categories->empty() || categories->size() > 6) {
    error("No supported data kinds are available for this source");
    return;
  }
  auto job = std::make_unique<Job>();
  if (*source_id == "safari") {
    const auto* archive = options.FindDict("safariArchive");
    // Supplied4276b34 reads only the nonempty binary data; fileName is optional.
    const auto* data = archive ? archive->Find("data") : nullptr;
    if (!data) {
      error("Safari import requires safariArchive.data");
      return;
    }
    if (data->is_blob() && !data->GetBlob().empty()) {
      job->archive.assign(reinterpret_cast<const char*>(data->GetBlob().data()),
                          data->GetBlob().size());
    } else if (internal_categories && data->is_list() &&
               !data->GetList().empty()) {
      job->archive.reserve(data->GetList().size());
      for (const auto& byte : data->GetList()) {
        if (!byte.is_int() || byte.GetInt() < 0 || byte.GetInt() > 255) {
          error("Safari ZIP contains invalid binary data");
          return;
        }
        job->archive.push_back(static_cast<char>(byte.GetInt()));
      }
    } else {
      error("Safari import requires safariArchive.data");
      return;
    }
  } else {
    if (options.Find("safariArchive")) {
      error("Archive data is only valid for Safari import");
      return;
    }
    job->path = base::FilePath(*selected->FindString("nativePath"));
  }
  if (job->path == profile_->GetPath()) {
    error("Source and destination profiles must differ");
    return;
  }
  job->safari_bookmarks_only = has_kinds ||
      (internal_categories && categories->size() == 1 &&
       (*categories)[0].is_string() && (*categories)[0].GetString() == "bookmarks");
  job->firefox = source->FindBool("nativeFirefox").value_or(false);
  job->extension = extension;
  job->import_extensions = !has_kinds && !internal_categories;
  job->source = *source_id;
  if (profile_id) job->source_profile = *profile_id;
  for (const auto& category : *categories) {
    if (!internal_categories && category.is_string() &&
        category.GetString() == "preferences") {
      continue;
    }
    if (!category.is_string() ||
        std::ranges::find(*source->FindList("categories"), category) ==
            source->FindList("categories")->end()) {
      error(
          "Selected category requires a native migrator unavailable in this "
          "build");
      return;
    }
    if (std::ranges::find(job->categories, category.GetString()) ==
        job->categories.end()) {
      job->categories.push_back(category.GetString());
    }
  }
  // The retired recovery WebUI alias must not expand a partial request into
  // the supplied full Safari flow. Original supports full or bookmarks only.
  if (job->source == "safari" && internal_categories &&
      !job->safari_bookmarks_only && job->categories.size() != 4) {
    error("Safari supports full import or bookmarks only");
    return;
  }
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  job->state.Set("jobId", id);
  job->state.Set("sourceId", *source_id);
  if (profile_id && !profile_id->empty())
    job->state.Set("sourceProfileId", *profile_id);
  job->state.Set("status", "queued");
  if (*source_id == "safari") job->state.Set("progress", 0.0);
  job->state.Set("completed", 0);
  job->state.Set("total", static_cast<int>(job->categories.size()));
  // Original42773f4..4277460 returns only the job identifier from startImport.
  auto result = internal_categories ? job->state.Clone()
      : base::DictValue().Set("jobId", id);
  jobs_.emplace(id, std::move(job));
  std::move(reply).Run(base::Value(std::move(result)), "");
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&ImportService::Next, weak_.GetWeakPtr(), id));
}
void ImportService::Emit(const Job& job) {
  if (job.native_webui) {
    const auto* state = job.state.FindString("status");
    if (job.native_completed && state &&
        (*state == "succeeded" || *state == "failed")) {
      const bool succeeded = *state == "succeeded";
      auto completed = std::move(job.native_completed);
      std::move(completed).Run(succeeded);
    }
    return;  // The real completion may retire this native owner/profile.
  }
  if (!profile_ || job.extension.empty() ||
      job.extension == "native-import-webui") {
    return;
  }
  base::ListValue args;
  args.Append(PublicJob(job.state));
  auto event = std::make_unique<extensions::Event>(
      extensions::events::AUXBROWSERIMPORT_PROGRESS,
      "auxBrowserImport.onImportProgress", std::move(args), profile_.get());
  extensions::EventRouter::Get(profile_.get())
      ->DispatchEventToExtension(job.extension, std::move(event));
}
void ImportService::Next(std::string id) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    return;
  }
  if (job.source == "safari") {
    if (!job.safari_import) {
      job.safari_import = std::make_unique<SafariImport>(
          profile_.get(), job.safari_bookmarks_only,
          base::BindRepeating(&ImportService::DidUpdateNativeImport,
                              weak_.GetWeakPtr(), id));
      job.safari_import->Start(std::move(job.archive));
    }
    return;
  }
  if (job.firefox && job.extension != "native-import-webui") {
    if (!job.firefox_import) {
      job.firefox_import = std::make_unique<FirefoxImport>(
          profile_.get(), std::optional<base::FilePath>(job.path),
          job.safari_bookmarks_only,
          base::BindRepeating(&ImportService::DidUpdateNativeImport,
                              weak_.GetWeakPtr(), id));
      job.firefox_import->Start();
    }
    return;
  }
  if (job.category == job.categories.size()) {
    job.archive.clear();
    job.snapshots.clear();
    if (profile_->GetPrefs()->FindPreference(
            "aux.browser.import.source_profiles")) {
      ScopedListPrefUpdate update(profile_->GetPrefs(),
                                  "aux.browser.import.source_profiles");
      bool present = false;
      for (const auto& previous : *update) {
        if (previous.is_dict() && previous.GetDict().FindString("sourceId") &&
            previous.GetDict().FindString("profileId") &&
            *previous.GetDict().FindString("sourceId") == job.source &&
            *previous.GetDict().FindString("profileId") == job.source_profile) {
          present = true;
        }
      }
      if (!present && update->size() < 128) {
        update->Append(base::DictValue()
                           .Set("sourceId", job.source)
                           .Set("profileId", job.source_profile));
      }
    }
    job.state.Set("status", "succeeded");
    job.state.Set("progress", 1.0);
    job.state.Remove("currentDataKind");
    job.state.Set("importedRows", job.imported);
    Emit(job);
    return;
  }
  job.state.Set("status", "running");
  job.state.Set("category", job.categories[job.category]);
  if (!job.firefox && !job.chromium_staged) {
    // Supplied427b60c starts at0.02;427b898 selects a real source profile
    // then dispatches its actual migrator at0.1. It exposes no row/category
    // percentages. Discovery is already complete at this adapter boundary.
    job.state.Set("progress", 0.02);
    Emit(job);
    job.state.Set("progress", 0.1);
  }
  Emit(job);
  if (!job.firefox && job.source != "safari") {
    if (!job.chromium_staged) {
      base::ThreadPool::PostTaskAndReplyWithResult(
          FROM_HERE, {base::MayBlock()},
          base::BindOnce(&ReadChromiumMigrationSnapshot, job.path, job.source,
                         job.categories, job.import_extensions),
          base::BindOnce(&ImportService::DidStageChromium, weak_.GetWeakPtr(), id));
    } else if (job.extension != "native-import-webui" &&
               (job.categories[job.category] == "passwords" ||
                job.categories[job.category] == "cookies")) {
      if (!job.chromium_secrets_started) {
        ApplyChromiumSecrets(id);
      }
    } else {
      auto data = std::move(job.snapshots[job.category].GetDict());
      DidRead(id, std::move(data));
    }
    return;
  }
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&ReadAuthorizedCategory, job.path, job.firefox, job.source,
                     job.categories[job.category]),
      base::BindOnce(&ImportService::DidRead, weak_.GetWeakPtr(), id));
}
void ImportService::DidUpdateNativeImport(std::string id, std::string state,
                                    std::string current_data_kind,
                                    double progress, std::string error) {
  if (!profile_ || !jobs_.contains(id)) return;
  auto& job = *jobs_.at(id);
  if (job.cancelled && state != "cancelled") return;
  job.state.Set("status", std::move(state));
  job.state.Set("progress", progress);
  if (current_data_kind.empty()) job.state.Remove("currentDataKind");
  else job.state.Set("currentDataKind", std::move(current_data_kind));
  if (error.empty()) job.state.Remove("error");
  else job.state.Set("error", std::move(error));
  Emit(job);
}
void ImportService::DidStageChromium(std::string id, base::DictValue data) {
  if (!profile_ || !jobs_.contains(id) || jobs_.at(id)->cancelled) {
    return;
  }
  if (const auto* error = data.FindString("error")) {
    FailJob(id, *error);
    return;
  }
  auto& job = *jobs_.at(id);
  auto* snapshots = data.FindList("snapshots");
  if (!snapshots || snapshots->size() != job.categories.size() ||
      !std::ranges::all_of(*snapshots, [](const base::Value& value) {
        return value.is_dict();
      })) {
    FailJob(id, "Source snapshot did not complete");
    return;
  }
  job.snapshots = std::move(*snapshots);
  if (job.import_extensions) {
    if (const auto* imports = data.FindList("extensions")) {
      InstallChromiumExtensions(profile_.get(), *imports);
    }
  }
  job.chromium_staged = true;
  Next(id);
}
void ImportService::DidRead(std::string id, base::DictValue data) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    return;
  }
  auto fail = [&](std::string error) { FailJob(id, std::move(error)); };
  if (const auto* error = data.FindString("error")) {
    fail(*error);
    return;
  }
  if (const auto* html = data.FindString("bookmarkHTML")) {
    job.parser = content::ServiceProcessHost::Launch<
        user_data_importer::mojom::BookmarkHtmlParser>(
        content::ServiceProcessHost::Options()
            .WithDisplayName(u"Aux bookmark import")
            .Pass());
    job.parser.set_disconnect_handler(
        base::BindOnce(&ImportService::FailJob, weak_.GetWeakPtr(), id,
                       "Bookmark parser process disconnected"));
    job.parser->Parse(*html, base::BindOnce(&ImportService::DidParseBookmarks,
                                            weak_.GetWeakPtr(), id));
    return;
  }
  if (auto* secrets = data.FindList(job.categories[job.category])) {
    if (job.categories[job.category] == "passwords" ||
        job.categories[job.category] == "cookies") {
      job.rows = std::move(*secrets);
      job.row = 0;
      ApplySecret(id);
      return;
    }
  }
  if (auto* visits = data.FindList("visits")) {
    job.rows = std::move(*visits);
    job.row = 0;
    ApplyHistory(id);
    return;
  }
  if (auto* prefs = data.FindDict("preferences")) {
    auto* target = profile_->GetPrefs();
    for (auto [key, value] : *prefs) {
      const auto* preference = target->FindPreference(key);
      if (preference && !preference->IsManaged() &&
          preference->GetType() == value.type()) {
        if (key == "homepage" &&
            (!value.is_string() ||
             !GURL(value.GetString()).SchemeIsHTTPOrHTTPS())) {
          continue;
        }
        target->Set(key, value);
        ++job.imported;
      }
    }
    CompleteCategory(id);
    return;
  }
  if (profile_->GetPrefs()->FindPreference(
          bookmarks::prefs::kEditBookmarksEnabled) &&
      !profile_->GetPrefs()->GetBoolean(
          bookmarks::prefs::kEditBookmarksEnabled)) {
    fail("Bookmark editing is disabled by policy");
    return;
  }
  auto* model = BookmarkModelFactory::GetForBrowserContext(profile_.get());
  if (!model || !model->loaded()) {
    fail(
        "Destination bookmark model is not ready; retry after the profile has "
        "loaded");
    return;
  }
  if (const auto* entries = data.FindList("bookmarks")) {
    if (job.chromium_staged && job.extension != "native-import-webui") {
      job.imported += AddCurrentProfileBookmarks(profile_.get(), model, *entries,
                                                  job.source);
      CompleteCategory(id);
      return;
    }
    for (const auto& entry : *entries) {
      const auto& row = entry.GetDict();
      const auto *root = row.FindString("root"),
                 *title = row.FindString("title");
      if (!root || !title) {
        continue;
      }
      const auto* parent = Root(model, *root);
      if (const auto* path = row.FindList("path")) {
        for (const auto& segment : *path) {
          const auto text = base::UTF8ToUTF16(segment.GetString());
          const bookmarks::BookmarkNode* found = nullptr;
          for (const auto& child : parent->children()) {
            if (child->is_folder() && child->GetTitle() == text) {
              found = child.get();
              break;
            }
          }
          parent =
              found ? found
                    : model->AddFolder(parent, parent->children().size(), text);
        }
      }
      const auto time = Timestamp(row, "createdWindowsMicros", false);
      if (row.FindBool("folder").value_or(false)) {
        model->AddFolder(parent, parent->children().size(),
                         base::UTF8ToUTF16(*title), nullptr, time);
      } else if (const auto* url = row.FindString("url");
                 url && GURL(*url).is_valid()) {
        model->AddURL(parent, parent->children().size(),
                      base::UTF8ToUTF16(*title), GURL(*url), nullptr, time);
        ++job.imported;
      }
    }
    CompleteCategory(id);
    return;
  }
  if (const auto* entries = data.FindList("firefoxBookmarks")) {
    std::map<int64_t, const bookmarks::BookmarkNode*> nodes;
    nodes[1] = model->other_node();
    nodes[2] = model->bookmark_bar_node();
    nodes[3] = model->other_node();
    nodes[4] = model->mobile_node();
    std::vector<const base::DictValue*> pending;
    for (const auto& entry : *entries) {
      pending.push_back(&entry.GetDict());
    }
    for (int pass = 0; pass < 64 && !pending.empty(); ++pass) {
      size_t progress = 0;
      std::erase_if(pending, [&](const base::DictValue* row) {
        const int64_t node = row->FindDouble("id").value_or(0),
                      parent = row->FindDouble("parent").value_or(0);
        if (nodes.contains(node)) {
          ++progress;
          return true;
        }
        if (!nodes.contains(parent)) {
          return false;
        }
        const auto *title = row->FindString("title"),
                   *url = row->FindString("url");
        const auto* folder = nodes.at(parent);
        const auto time = Timestamp(*row, "createdUnixMicros", true);
        if (row->FindInt("type") == 2) {
          nodes[node] = model->AddFolder(
              folder, folder->children().size(),
              base::UTF8ToUTF16(title ? *title : "Imported folder"), nullptr,
              time);
        } else if (row->FindInt("type") == 1 && url && GURL(*url).is_valid() &&
                   !GURL(*url).SchemeIs("javascript")) {
          model->AddURL(folder, folder->children().size(),
                        base::UTF8ToUTF16(title ? *title : *url), GURL(*url),
                        nullptr, time);
          ++job.imported;
        }
        ++progress;
        return true;
      });
      if (progress == 0) {
        break;
      }
    }
    if (!pending.empty()) {
      fail(
          "Firefox bookmarks contain orphaned or cyclic hierarchy; imported "
          "valid rows were retained");
      return;
    }
    CompleteCategory(id);
    return;
  }
  fail("Source category did not produce valid migration records");
}

void ImportService::FailJob(std::string id, std::string error) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    return;
  }
  job.archive.clear();
  job.rows.clear();
  job.snapshots.clear();
  job.parser.reset();
  job.state.Set("status", "failed");
  job.state.Set("error", std::move(error));
  job.state.Set("importedRows", job.imported);
  Emit(job);
}
void ImportService::DidParseBookmarks(
    std::string id,
    user_data_importer::BookmarkParser::ParsedBookmarks parsed) {
  if (!profile_ || !jobs_.contains(id) || jobs_.at(id)->cancelled) {
    return;
  }
  jobs_.at(id)->parser.reset();
  if (parsed.bookmarks.size() + parsed.reading_list.size() > 20000) {
    FailJob(id, "Safari bookmark row limit exceeded");
    return;
  }
  base::ListValue rows;
  bool invalid = false;
  size_t decoded = 0;
  auto convert = [&](const user_data_importer::ImportedBookmarkEntry& bookmark,
                     bool reading_list) {
    if (bookmark.path.size() > 64 || bookmark.title.size() > 1024 ||
        bookmark.url.spec().size() > 8192) {
      invalid = true;
      return;
    }
    decoded += bookmark.title.size() * 3 + bookmark.url.spec().size() + 256;
    for (const auto& segment : bookmark.path) {
      if (segment.size() > 1024) {
        invalid = true;
        return;
      }
      decoded += segment.size() * 3;
    }
    if (decoded > 64 * 1024 * 1024) {
      invalid = true;
      return;
    }
    base::ListValue path;
    if (reading_list) {
      path.Append("Imported reading list");
    }
    for (const auto& segment : bookmark.path) {
      path.Append(base::UTF16ToUTF8(segment));
    }
    base::DictValue row;
    row.Set("root",
            bookmark.in_toolbar && !reading_list ? "bookmark_bar" : "other");
    row.Set("path", std::move(path));
    row.Set("folder", bookmark.is_folder);
    row.Set("title", base::UTF16ToUTF8(bookmark.title));
    row.Set("url", bookmark.url.spec());
    row.Set(
        "createdWindowsMicros",
        base::NumberToString(bookmark.creation_time.ToDeltaSinceWindowsEpoch()
                                 .InMicroseconds()));
    rows.Append(std::move(row));
  };
  for (const auto& row : parsed.bookmarks) {
    convert(row, false);
  }
  for (const auto& row : parsed.reading_list) {
    convert(row, true);
  }
  if (invalid) {
    FailJob(
        id,
        "Safari bookmark hierarchy or decoded size exceeds supported limits");
    return;
  }
  DidRead(id, base::DictValue().Set("bookmarks", std::move(rows)));
}
void ImportService::ApplyChromiumSecrets(std::string id) {
  if (!profile_ || !jobs_.contains(id) || jobs_.at(id)->cancelled) {
    return;
  }
  auto& job = *jobs_.at(id);
  std::vector<password_manager::StoredCredential> passwords;
  using PreparedCookie = std::pair<std::unique_ptr<net::CanonicalCookie>, GURL>;
  std::vector<PreparedCookie> cookies;
  for (size_t index = job.category; index < job.categories.size(); ++index) {
    const auto& kind = job.categories[index];
    if (kind != "passwords" && kind != "cookies") {
      FailJob(id, "Source destination order changed");
      return;
    }
    auto& snapshot = job.snapshots[index].GetDict();
    auto* rows = snapshot.FindList(kind);
    if (!rows) {
      FailJob(id, "Source encrypted snapshot is incomplete");
      return;
    }
    for (auto& value : *rows) {
      auto& row = value.GetDict();
      if (kind == "passwords") {
        auto form = PrepareChromiumPassword(row);
        if (!form) {
          FailJob(id, "Source password could not enter the destination store");
          return;
        }
        passwords.push_back(std::move(*form));
      } else {
        GURL source;
        for (auto name : {"secret", "host", "name", "path", "partition"}) {
          if (!GetEncryptedSourceBytes(row, name)) {
            FailJob(id, "Source encrypted snapshot is incomplete");
            return;
          }
        }
        auto cookie = PrepareChromiumCookie(row, source);
        if (!cookie) {
          row.Remove("secret");
          continue;
        }
        cookies.emplace_back(std::move(cookie), std::move(source));
      }
      row.Remove("secret");
    }
  }
  scoped_refptr<password_manager::PasswordStoreInterface> store;
  if (!passwords.empty()) {
    store = ProfilePasswordStoreFactory::GetForProfile(
        profile_.get(), ServiceAccessType::EXPLICIT_ACCESS);
    // Supplied42589ac..42589d4 skips a missing real store. It does not add
    // separate preference/error-state admission checks before AddLogins.
  }
  auto* manager = cookies.empty() ? nullptr
      : profile_->GetDefaultStoragePartition()->GetCookieManagerForBrowserProcess();
  job.chromium_secrets_started = true;
  job.chromium_passwords_done = passwords.empty() || !store;
  job.chromium_cookies_done = cookies.empty() || !manager;
  if (manager) {
    auto barrier = base::BarrierClosure(
        cookies.size(),
        base::BindOnce(&ImportService::DidCompleteChromiumSecrets,
                       weak_.GetWeakPtr(), id, false));
    for (auto& [cookie, source] : cookies) {
      manager->SetCanonicalCookie(
          *cookie, source, net::CookieOptions::MakeAllInclusive(),
          base::BindOnce(
              [](base::WeakPtr<ImportService> self, std::string id,
                 base::RepeatingClosure barrier, net::CookieAccessResult result) {
                if (self && self->profile_ && self->jobs_.contains(id) &&
                    !self->jobs_.at(id)->cancelled && result.status.IsInclude()) {
                  ++self->jobs_.at(id)->imported;
                }
                // Supplied425f838 completes its barrier regardless of result.
                barrier.Run();
              }, weak_.GetWeakPtr(), id, barrier));
    }
  }
  if (store) {
    // Exact supplied destination batch; no independent per-login lookup/skip.
    store->AddLogins(
        std::move(passwords),
        base::BindOnce(
            [](base::WeakPtr<ImportService> self, std::string id,
               scoped_refptr<password_manager::PasswordStoreInterface> /*store*/) {
              if (self) {
                self->DidCompleteChromiumSecrets(id, true);
              }
            }, weak_.GetWeakPtr(), id, store));
    return;
  }
  MaybeCompleteChromiumSecrets(id);
}
void ImportService::DidCompleteChromiumSecrets(std::string id, bool passwords) {
  if (!profile_ || !jobs_.contains(id) || jobs_.at(id)->cancelled) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (passwords) {
    job.chromium_passwords_done = true;
  } else {
    job.chromium_cookies_done = true;
  }
  MaybeCompleteChromiumSecrets(id);
}
void ImportService::MaybeCompleteChromiumSecrets(std::string id) {
  if (!profile_ || !jobs_.contains(id) || jobs_.at(id)->cancelled) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.chromium_secrets_completed || !job.chromium_passwords_done ||
      !job.chromium_cookies_done) {
    return;
  }
  job.chromium_secrets_completed = true;
  job.category = job.categories.size();
  job.snapshots.clear();
  job.state.Set("completed", static_cast<int>(job.category));
  Next(id);
}
void ImportService::ApplySecret(std::string id) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    job.rows.clear();
    return;
  }
  if (job.row >= job.rows.size()) {
    job.rows.clear();
    CompleteCategory(id);
    return;
  }
  auto& row = job.rows[job.row].GetDict();
  auto* secret = row.FindString("secret");
  if (!secret) {
    DidWriteSecret(id, false);
    return;
  }
  if (job.categories[job.category] == "passwords") {
    auto* prefs = profile_->GetPrefs();
    auto store = ProfilePasswordStoreFactory::GetForProfile(
        profile_.get(), ServiceAccessType::EXPLICIT_ACCESS);
    if (!store ||
        !prefs->GetBoolean(
            password_manager::prefs::kCredentialsEnableService) ||
        store->GetError() != password_manager::ActionableError::kNoError) {
      DidWriteSecret(id, false);
      return;
    }
    password_manager::StoredCredential form;
    form.url = GURL(*row.FindString("url"));
    form.action = GURL(*row.FindString("action"));
    form.signon_realm = *row.FindString("realm");
    if (!form.url.SchemeIsHTTPOrHTTPS() ||
        !GURL(form.signon_realm).SchemeIsHTTPOrHTTPS()) {
      DidWriteSecret(id, false);
      return;
    }
    const auto scheme = row.FindInt("scheme").value_or(-1);
    if (scheme < 0 || scheme > 4) {
      DidWriteSecret(id, false);
      return;
    }
    form.scheme = static_cast<password_manager::PasswordForm::Scheme>(scheme);
    form.username_element =
        base::UTF8ToUTF16(*row.FindString("usernameElement"));
    form.username_value = base::UTF8ToUTF16(*row.FindString("username"));
    form.password_element =
        base::UTF8ToUTF16(*row.FindString("passwordElement"));
    form.password_value =
        password_manager::PasswordString(base::UTF8ToUTF16(*secret));
    form.date_created = Timestamp(row, "created", false);
    form.date_last_used = Timestamp(row, "used", false);
    form.date_password_modified = Timestamp(row, "modified", false);
    form.times_used_in_html_form = row.FindInt("timesUsed").value_or(0);
    form.blocked_by_user = row.FindBool("blocked").value_or(false);
    if (const auto* note = row.FindString("note"); note && !note->empty()) {
      form.SetPasswordNote(base::UTF8ToUTF16(*note));
    }
    row.Remove("secret");
    job.secret_lookup = std::make_unique<SecretLookup>(
        std::move(store), std::move(form),
        base::BindOnce(&ImportService::DidWriteSecret, weak_.GetWeakPtr(), id));
    job.secret_lookup->Start();
    return;
  }
  std::string host = *row.FindString("host");
  if (host.starts_with('.')) {
    host.erase(0, 1);
  }
  const bool secure = row.FindBool("secure").value_or(false);
  GURL source(std::string(secure ? "https://" : "http://") + host + "/");
  auto partition = net::CookiePartitionKey::FromStorage(
      *row.FindString("partition"), row.FindBool("crossSite").value_or(false));
  const int same_site = row.FindInt("sameSite").value_or(-2),
            priority = row.FindInt("priority").value_or(-1);
  if (!source.is_valid() || !partition.has_value() || same_site < -1 ||
      same_site > 2 || priority < 0 || priority > 2) {
    DidWriteSecret(id, false);
    return;
  }
  auto expiry = Timestamp(row, "expires", false);
  if (*row.FindString("expires") == "0") {
    expiry = base::Time();
  }
  if (!expiry.is_null() && expiry <= base::Time::Now()) {
    row.Remove("secret");
    DidWriteSecret(id, true, true);
    return;
  }
  const int source_scheme = row.FindInt("sourceScheme").value_or(-1),
            source_port = row.FindInt("sourcePort").value_or(-2),
            source_type = row.FindInt("sourceType").value_or(0);
  if (source_scheme < 0 || source_scheme > 2 || source_port < -1 ||
      source_port > 65535 || source_type < 1 || source_type > 3 ||
      row.FindString("name")->size() + secret->size() > 4096 ||
      host.size() > 253 || row.FindString("path")->size() > 1024) {
    DidWriteSecret(id, false);
    return;
  }
  source = GURL(std::string(source_scheme == 2 || (source_scheme == 0 && secure)
                                ? "https://"
                                : "http://") +
                host +
                (source_port >= 0 ? ":" + base::NumberToString(source_port)
                                  : std::string()) +
                "/");
  if (!source.is_valid()) {
    DidWriteSecret(id, false);
    return;
  }
  auto cookie = net::CanonicalCookie::FromStorage(
      *row.FindString("name"), *secret, *row.FindString("host"),
      *row.FindString("path"), Timestamp(row, "created", false), expiry,
      Timestamp(row, "accessed", false), Timestamp(row, "updated", false),
      secure, row.FindBool("httpOnly").value_or(false),
      static_cast<net::CookieSameSite>(same_site),
      static_cast<net::CookiePriority>(priority), std::move(partition.value()),
      static_cast<net::CookieSourceScheme>(source_scheme), source_port,
      static_cast<net::CookieSourceType>(source_type),
      net::CanonicalCookieFromStorageCallSite::kSqlitePersistentCookieStore);
  row.Remove("secret");
  if (!cookie) {
    DidWriteSecret(id, false);
    return;
  }
  profile_->GetDefaultStoragePartition()
      ->GetCookieManagerForBrowserProcess()
      ->SetCanonicalCookie(
          *cookie, source, net::CookieOptions::MakeAllInclusive(),
          base::BindOnce(
              [](base::WeakPtr<ImportService> self, std::string id,
                 net::CookieAccessResult result) {
                if (self) {
                  self->DidWriteSecret(id, result.status.IsInclude());
                }
              },
              weak_.GetWeakPtr(), id));
}
void ImportService::DidWriteSecret(std::string id,
                                   bool accepted,
                                   bool skipped) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    job.rows.clear();
    return;
  }
  if (!accepted) {
    FailJob(id,
            "Destination rejected a credential or cookie; previously accepted "
            "rows were retained");
    return;
  }

  ++job.row;
  if (!skipped) {
    ++job.imported;
  } else {
    job.state.Set("skippedRows",
                  job.state.FindInt("skippedRows").value_or(0) + 1);
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE,
      base::BindOnce(&ImportService::ApplySecret, weak_.GetWeakPtr(), id));
}
void ImportService::ApplyHistory(std::string id) {
  if (!profile_ || !jobs_.contains(id)) {
    return;
  }
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    return;
  }
  if (profile_->GetPrefs()->FindPreference(
          prefs::kSavingBrowserHistoryDisabled) &&
      profile_->GetPrefs()->GetBoolean(prefs::kSavingBrowserHistoryDisabled)) {
    job.state.Set("status", "failed");
    job.state.Set("error", "History saving is disabled by policy");
    Emit(job);
    return;
  }
  auto* history = HistoryServiceFactory::GetForProfile(
      profile_.get(), ServiceAccessType::EXPLICIT_ACCESS);
  if (!history) {
    job.state.Set("status", "failed");
    job.state.Set("error", "Destination history service is unavailable");
    Emit(job);
    return;
  }
  const bool chromium_summary = !job.rows.empty() &&
      job.rows.front().GetDict().FindBool("chromiumSummary").value_or(false);
  // Original ProfileWriter::AddHistoryPage submits its URLRows as one batch.
  const size_t end = chromium_summary
                         ? job.rows.size()
                         : std::min(job.row + 200, job.rows.size());
  history::URLRows pages;
  for (; job.row < end; ++job.row) {
    const auto& row = job.rows[job.row].GetDict();
    const auto* url = row.FindString("url");
    const GURL source_url(url ? *url : std::string());
    if (!source_url.is_valid() ||
        (chromium_summary
             ? (source_url.SchemeIs("chrome") ||
                source_url.SchemeIs("chrome-extension") ||
                source_url.SchemeIs("devtools"))
             : !source_url.SchemeIsHTTPOrHTTPS())) {
      continue;
    }
    const bool unix_time = row.FindBool("unixTime").value_or(false);
    const auto time = Timestamp(row, "timeMicros", unix_time);
    if (chromium_summary) {
      history::URLRow page(source_url);
      const auto* title = row.FindString("title");
      page.set_title(base::UTF8ToUTF16(title ? *title : std::string()));
      page.set_visit_count(row.FindInt("visitCount").value_or(0));
      page.set_typed_count(row.FindInt("typedCount").value_or(0));
      page.set_last_visit(time);
      page.set_hidden(row.FindBool("hidden").value_or(false));
      pages.push_back(std::move(page));
      ++job.imported;
      continue;
    }
    if (row.FindBool("summaryOnly").value_or(false)) {
      const auto* title = row.FindString("title");
      history->AddPageWithDetails(
          GURL(*url), base::UTF8ToUTF16(title ? *title : std::string()),
          row.FindInt("visitCount").value_or(1),
          row.FindInt("typedCount").value_or(0), time, false,
          history::SOURCE_SAFARI_IMPORTED);
      ++job.imported;
      continue;
    }
    const int transition = row.FindInt("transition").value_or(0);
    const auto page_transition =
        unix_time ? (transition == 2 ? ui::PAGE_TRANSITION_TYPED
                                     : ui::PAGE_TRANSITION_LINK)
                  : ui::PageTransitionFromInt(transition);
    history->AddPage(GURL(*url), time, 0, 0, GURL(), {}, page_transition,
                     job.firefox ? history::SOURCE_FIREFOX_IMPORTED
                                 : history::SOURCE_OS_MIGRATION_IMPORTED,
                     history::VisitResponseCodeCategory::kNot404, false);
    if (const auto* title = row.FindString("title")) {
      history->SetPageTitle(GURL(*url), base::UTF8ToUTF16(*title));
    }
    ++job.imported;
  }
  if (!pages.empty()) {
    // Exact native destination primitive used by supplied ProfileWriter.
    history->AddPagesWithDetails(pages, history::SOURCE_BROWSED);
  }
  if (job.row < job.rows.size()) {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&ImportService::ApplyHistory, weak_.GetWeakPtr(), id));
  } else {
    job.rows.clear();
    CompleteCategory(id);
  }
}
void ImportService::CompleteCategory(std::string id) {
  auto& job = *jobs_.at(id);
  if (job.cancelled) {
    return;
  }
  ++job.category;
  job.state.Set("completed", static_cast<int>(job.category));
  job.state.Set("importedRows", job.imported);
  Emit(job);
  Next(id);
}
}  // namespace aux_import
