// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Durable generations/update jobs: native/adblock-import F1-F3.
#include "chrome/browser/extensions/api/aux_adblock/filter_service.h"

#include <algorithm>

#include "base/files/file_enumerator.h"
#include "base/files/file_util.h"
#include "base/files/important_file_writer.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/task/thread_pool.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/storage_partition.h"
#include "crypto/hash.h"
#include "net/base/net_errors.h"
#include "net/base/network_change_notifier.h"
#include "net/http/http_status_code.h"
#include "net/http/http_util.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "net/url_request/redirect_info.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/mojom/client_security_state.mojom.h"
#include "services/network/public/mojom/fetch_api.mojom.h"
#include "services/network/public/mojom/url_response_head.mojom.h"
namespace aux_adblock {
namespace {
constexpr char kServiceKey[] = "aux.adblock.service";
double Now() {
  return base::Time::Now().InMillisecondsFSinceUnixEpoch();
}
base::DictValue Read(const base::FilePath& directory) {
  std::string text;
  if (base::IsLink(directory.AppendASCII("state.json")) ||
      !base::ReadFileToStringWithMaxSize(directory.AppendASCII("state.json"),
                                         &text, 256 * 1024 * 1024)) {
    return {};
  }
  return base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC)
      .value_or(base::DictValue());
}
void Write(const base::FilePath& directory, std::string text) {
  if (base::CreateDirectory(directory) &&
      base::SetPosixFilePermissions(directory, 0700)) {
    auto path = directory.AppendASCII("state.json");
    if (base::ImportantFileWriter::WriteFileAtomically(path, text)) {
      base::SetPosixFilePermissions(path, 0600);
    }
  }
}
std::vector<Source> ReadManual(const base::FilePath& directory) {
  std::vector<Source> sources;
  base::FileEnumerator files(directory, false, base::FileEnumerator::FILES,
                             FILE_PATH_LITERAL("*.txt"));
  for (auto path = files.Next(); !path.empty() && sources.size() < 64;
       path = files.Next()) {
    std::string text;
    if (!base::IsLink(path) &&
        base::ReadFileToStringWithMaxSize(path, &text, 4 * 1024 * 1024) &&
        base::IsStringUTF8(text) && text.find('\0') == text.npos) {
      sources.push_back({"manual:" + path.BaseName().value(), std::move(text)});
    }
  }
  return sources;
}
constexpr auto kFetch = net::DefineNetworkTrafficAnnotation(
    "aux_filter_subscription",
    R"(semantics {sender:"Aux native content filtering" description:"Fetch a user-selected HTTPS filter subscription with conditional cache headers." trigger:"Explicit subscription addition or update." data:"Subscription URL and ETag/Last-Modified; no credentials or cookies." destination:WEBSITE} policy {cookies_allowed:NO setting:"User selected filter subscriptions." policy_exception_justification:"Only explicit user configuration."})");
}  // namespace
FilterService* FilterService::Get(Profile* profile) {
  auto* existing =
      static_cast<FilterService*>(profile->GetUserData(kServiceKey));
  if (existing) {
    return existing;
  }
  auto service = std::make_unique<FilterService>(profile);
  auto* result = service.get();
  profile->SetUserData(kServiceKey, std::move(service));
  return result;
}
FilterService::FilterService(Profile* profile)
    : profile_(profile->GetWeakPtr()),
      directory_(profile->GetPath().AppendASCII("AuxFiltering")),
      files_(base::ThreadPool::CreateSequencedTaskRunner(
          {base::MayBlock(), base::TaskPriority::USER_VISIBLE})) {
  files_->PostTaskAndReplyWithResult(
      FROM_HERE, base::BindOnce(&Read, directory_),
      base::BindOnce(&FilterService::DidLoad, weak_.GetWeakPtr()));
}
FilterService::~FilterService() = default;
void FilterService::WhenReady(base::OnceClosure callback) {
  if (ready()) {
    std::move(callback).Run();
  } else {
    ready_callbacks_.push_back(std::move(callback));
  }
}

void FilterService::DidLoad(base::DictValue stored) {
  enabled_ = stored.FindBool("enabled").value_or(true);
  if (const auto* rules = stored.FindString("rules");
      rules && rules->size() <= 4 * 1024 * 1024 && base::IsStringUTF8(*rules) &&
      rules->find('\0') == rules->npos) {
    rules_ = *rules;
  }
  if (auto* list = stored.FindList("subscriptions")) {
    for (auto& item : *list) {
      if (subscriptions_.size() >= 64 || !item.is_dict()) {
        break;
      }
      auto& row = item.GetDict();
      const auto *id = row.FindString("id"), *url = row.FindString("url");
      if (!id || !url || !ValidSubscriptionURL(GURL(*url))) {
        continue;
      }
      row.Set("status", "idle");
      subscriptions_.Append(row.Clone());
      if (const auto* cache = stored.FindDict("sources"); cache) {
        if (const auto* text = cache->FindString(*id);
            text && text->size() <= 4 * 1024 * 1024 &&
            base::IsStringUTF8(*text) && text->find('\0') == text->npos) {
          texts_[*id] = *text;
        }
      }
    }
  }
  Compile();
  files_->PostTaskAndReplyWithResult(
      FROM_HERE, base::BindOnce(&ReadManual, directory_.AppendASCII("manual")),
      base::BindOnce(
          [](base::WeakPtr<FilterService> self, std::vector<Source> manual) {
            if (self) {
              self->manual_ = std::move(manual);
              self->Compile();
            }
          },
          weak_.GetWeakPtr()));
}
Decision FilterService::Evaluate(const Request& request) const {
  return enabled_ && engine_ ? engine_->Evaluate(request) : Decision();
}
base::CallbackListSubscription FilterService::ObserveCosmetics(
    base::RepeatingClosure changed) {
  return cosmetic_observers_.Add(std::move(changed));
}
base::DictValue FilterService::Cosmetics(const GURL& url) const {
  return enabled_ && engine_ ? engine_->Cosmetics(url) : base::DictValue();
}
base::DictValue FilterService::State() const {
  base::DictValue state;
  state.Set("available", true);
  state.Set("enabled", enabled_);
  state.Set("stateLoaded", loaded_);
  state.Set("compiling", compiling_);
  state.Set("networkAvailable",
            profile_ && !net::NetworkChangeNotifier::IsOffline());
  state.Set("manualFiltersAvailable", !manual_.empty());
  state.Set("requestedGeneration", static_cast<double>(requested_));
  state.Set("activeGeneration", static_cast<double>(active_));
  state.Set("lastCompileError", compile_error_);
  base::ListValue jobs;
  for (const auto& [id, job] : jobs_) {
    if (job.FindString("status") && *job.FindString("status") == "running") {
      jobs.Append(id);
    }
  }
  state.Set("activeUpdateJobIds", std::move(jobs));
  return state;
}
base::DictValue FilterService::CustomRules() const {
  base::DictValue result;
  result.Set("rules", rules_);
  result.Set("contentSize", static_cast<double>(rules_.size()));
  if (pending_rules_) {
    result.Set("pendingRules", *pending_rules_);
  }
  if (engine_) {
    for (const auto& source : engine_->diagnostics()) {
      if (source.GetDict().FindString("id") &&
          *source.GetDict().FindString("id") == "custom") {
        result.Merge(source.GetDict().Clone());
      }
    }
  }
  return result;
}
base::DictValue FilterService::Diagnostics() const {
  auto result = State();
  result.Set("lastCompileDurationMs", compile_ms_);
  result.Set("lastEngineInstallTime", installed_ms_);
  result.Set("dataDirectory", directory_.value());
  result.Set("cacheDirectory", directory_.value());
  result.Set("manualFilterDirectory", directory_.AppendASCII("manual").value());
  result.Set("manualFilterError", manual_error_);
  result.Set("subscriptions", subscriptions_.Clone());
  result.Set("customRules", CustomRules());
  base::ListValue engines;
  if (engine_) {
    base::DictValue engine;
    engine.Set("kind", "default");
    engine.Set("cacheHit", false);
    engine.Set("flatbufferSize", 0);
    engine.Set("regexesTruncated", engine_->rule_count() > 256);
    engine.Set("compiledRegexCount", static_cast<int>(engine_->rule_count()));
    engine.Set("sources", engine_->diagnostics().Clone());
    engine.Set("regexes", engine_->RegexDiagnostics());
    engines.Append(std::move(engine));
  }
  result.Set("engines", std::move(engines));
  return result;
}
void FilterService::Compile() {
  ++requested_;
  compiling_ = true;
  if (!compile_inflight_) {
    StartCompile();
  }
}
void FilterService::StartCompile() {
  compile_inflight_ = true;
  const auto generation = requested_;
  std::vector<Source> sources = manual_;
  sources.push_back({"custom", pending_rules_.value_or(rules_)});
  for (const auto& value : subscriptions_) {
    const auto& row = value.GetDict();
    const auto* id = row.FindString("id");
    if (id && row.FindBool("enabled").value_or(true) && texts_.contains(*id)) {
      sources.push_back({*id, texts_.at(*id)});
    }
  }
  auto began = base::TimeTicks::Now();
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&Engine::Compile, std::move(sources)),
      base::BindOnce(&FilterService::DidCompile, weak_.GetWeakPtr(), generation,
                     began));
}
void FilterService::DidCompile(uint64_t generation,
                               base::TimeTicks began,
                               std::shared_ptr<const Engine> engine) {
  compile_inflight_ = false;
  if (generation != requested_) {
    StartCompile();
    return;
  }
  compiling_ = false;
  if (!engine) {
    compile_error_ = "Filter compilation failed; prior engine retained";
    return;
  }
  bool retry = false;
  for (const auto& diagnostic : engine->diagnostics()) {
    const auto& source = diagnostic.GetDict();
    const auto* id = source.FindString("id");
    if (!id || source.FindInt("parseErrorCount").value_or(0) == 0 ||
        source.FindInt("networkRuleCount").value_or(0) +
                source.FindInt("cosmeticRuleCount").value_or(0) >
            0) {
      continue;
    }
    if (*id == "custom") {
      compile_error_ =
          "Custom rules contain no usable rules; prior engine retained";
      return;
    }
    if (auto previous = previous_texts_.find(*id);
        previous != previous_texts_.end()) {
      if (previous->second) {
        texts_[*id] = *previous->second;
      } else {
        texts_.erase(*id);
      }
      previous_texts_.erase(previous);
      if (auto* row = Subscription(*id)) {
        row->Merge(source.Clone());
      }
      std::vector<std::string> failed;
      for (const auto& [job_id, job] : jobs_) {
        if (const auto* items = job.FindList("items")) {
          for (const auto& item : *items) {
            if (item.GetDict().FindString("subscriptionId") &&
                *item.GetDict().FindString("subscriptionId") == *id &&
                item.GetDict().FindString("status") &&
                *item.GetDict().FindString("status") == "compiling") {
              failed.push_back(job_id);
            }
          }
        }
      }
      for (const auto& job : failed) {
        FinishItem(job, *id, "failed",
                   "Downloaded source contains no usable rules; prior source "
                   "retained");
      }
      retry = true;
    }
  }
  if (retry) {
    Compile();
    return;
  }
  previous_texts_.clear();
  engine_ = std::move(engine);
  cosmetic_observers_.Notify();
  active_ = generation;
  loaded_ = true;
  auto callbacks = std::move(ready_callbacks_);
  for (auto& callback : callbacks) {
    std::move(callback).Run();
  }
  compile_ms_ = (base::TimeTicks::Now() - began).InMillisecondsF();
  installed_ms_ = Now();
  compile_error_.clear();
  if (pending_rules_) {
    rules_ = std::move(*pending_rules_);
    pending_rules_.reset();
  }
  for (const auto& source : engine_->diagnostics()) {
    const auto* source_id = source.GetDict().FindString("id");
    auto* row = source_id ? Subscription(*source_id) : nullptr;
    if (!row) {
      continue;
    }
    row->Merge(source.GetDict().Clone());
    row->Set("lastEngineActivationMs", installed_ms_);
  }
  std::vector<std::pair<std::string, std::string>> complete;
  for (const auto& [job_id, job] : jobs_) {
    if (const auto* items = job.FindList("items")) {
      for (const auto& item : *items) {
        const auto& v = item.GetDict();
        if (v.FindString("status") && *v.FindString("status") == "compiling" &&
            v.FindDouble("generation").value_or(0) <= generation) {
          complete.emplace_back(job_id, *v.FindString("subscriptionId"));
        }
      }
    }
  }
  for (const auto& [job, id] : complete) {
    FinishItem(job, id, "updated", "");
  }
  Persist();
}
void FilterService::Persist() {
  base::DictValue state;
  state.Set("version", 1);
  state.Set("enabled", enabled_);
  state.Set("rules", rules_);
  state.Set("subscriptions", subscriptions_.Clone());
  base::DictValue sources;
  for (const auto& [id, text] : texts_) {
    sources.Set(id, text);
  }
  state.Set("sources", std::move(sources));
  files_->PostTask(FROM_HERE,
                   base::BindOnce(&Write, directory_,
                                  base::WriteJson(state).value_or("{}")));
}
base::DictValue* FilterService::Subscription(std::string_view id) {
  for (auto& value : subscriptions_) {
    if (value.GetDict().FindString("id") &&
        *value.GetDict().FindString("id") == id) {
      return &value.GetDict();
    }
  }
  return nullptr;
}
std::string FilterService::StartUpdate(const std::vector<std::string>& ids) {
  while (jobs_.size() >= 32) {
    auto finished =
        std::find_if(jobs_.begin(), jobs_.end(), [](const auto& item) {
          const auto* status = item.second.FindString("status");
          return status && *status != "running";
        });
    if (finished == jobs_.end()) {
      return {};
    }
    jobs_.erase(finished);
  }
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  base::DictValue job;
  job.Set("jobId", id);
  job.Set("status", ids.empty() ? "succeeded" : "running");
  job.Set("createdAtMs", Now());
  job.Set("completedAtMs", ids.empty() ? Now() : 0);
  job.Set("total", static_cast<int>(ids.size()));
  job.Set("completed", 0);
  base::ListValue items;
  for (const auto& source : ids) {
    items.Append(base::DictValue()
                     .Set("subscriptionId", source)
                     .Set("status", "queued")
                     .Set("error", ""));
    queue_.emplace_back(id, source);
    if (auto* row = Subscription(source)) {
      row->Set("status", "queued");
    }
  }
  job.Set("items", std::move(items));
  jobs_.emplace(id, std::move(job));
  DownloadNext();
  return id;
}
void FilterService::DownloadNext() {
  if (loader_ || queue_.empty() || !profile_) {
    return;
  }
  const auto [job, id] = queue_.front();
  queue_.pop_front();
  auto* row = Subscription(id);
  if (!row) {
    FinishItem(job, id, "failed", "Subscription was removed");
    return;
  }
  const auto* url = row->FindString("url");
  if (!url || !ValidSubscriptionURL(GURL(*url))) {
    FinishItem(job, id, "failed", "Subscription URL is not permitted");
    return;
  }
  row->Set("status", "downloading");
  row->Set("lastAttemptMs", Now());
  if (auto* items = jobs_.at(job).FindList("items")) {
    for (auto& item : *items) {
      if (*item.GetDict().FindString("subscriptionId") == id) {
        item.GetDict().Set("status", "downloading");
      }
    }
  }
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = GURL(*url);
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->required_ip_address_space = network::mojom::IPAddressSpace::kPublic;
  request->trusted_params = network::ResourceRequest::TrustedParams();
  request->trusted_params->client_security_state =
      network::mojom::ClientSecurityState::New();
  request->trusted_params->client_security_state->ip_address_space =
      network::mojom::IPAddressSpace::kPublic;
  request->trusted_params->client_security_state->is_web_secure_context = true;
  request->trusted_params->client_security_state
      ->local_network_access_request_policy =
      network::mojom::LocalNetworkAccessRequestPolicy::kBlock;
  request->redirect_mode = network::mojom::RedirectMode::kFollow;
  if (auto* etag = row->FindString("etag");
      etag && !etag->empty() && net::HttpUtil::IsValidHeaderValue(*etag)) {
    request->headers.SetHeader("If-None-Match", *etag);
  }
  if (auto* modified = row->FindString("lastModifiedHeader");
      modified && !modified->empty() &&
      net::HttpUtil::IsValidHeaderValue(*modified)) {
    request->headers.SetHeader("If-Modified-Since", *modified);
  }
  loader_ = network::SimpleURLLoader::Create(std::move(request), kFetch);
  loader_->SetTimeoutDuration(base::Seconds(30));
  loader_->SetAllowHttpErrorResults(true);
  loader_->SetOnRedirectCallback(base::BindRepeating(
      [](base::WeakPtr<FilterService> self, std::string job, std::string id,
         const GURL&, const net::RedirectInfo& redirect,
         const network::mojom::URLResponseHead&, std::vector<std::string>*) {
        if (self && !ValidSubscriptionURL(redirect.new_url)) {
          self->loader_.reset();
          self->FinishItem(job, id, "failed",
                           "Subscription redirect is not permitted");
        }
      },
      weak_.GetWeakPtr(), job, id));
  loader_->DownloadToString(
      profile_->GetDefaultStoragePartition()
          ->GetURLLoaderFactoryForBrowserProcess()
          .get(),
      base::BindOnce(&FilterService::DidDownload, weak_.GetWeakPtr(), job, id),
      4 * 1024 * 1024);
}
void FilterService::DidDownload(std::string job,
                                std::string id,
                                std::optional<std::string> body) {
  auto* row = Subscription(id);
  const auto* head = loader_ ? loader_->ResponseInfo() : nullptr;
  const int status = head && head->headers ? head->headers->response_code() : 0;
  const int error = loader_ ? loader_->NetError() : net::ERR_FAILED;
  if (!row) {
    loader_.reset();
    FinishItem(job, id, "failed", "Subscription was removed");
    return;
  }
  if (status == 304 && texts_.contains(id)) {
    loader_.reset();
    row->Set("lastSuccessfulCheckMs", Now());
    row->Set("consecutiveFailures", 0);
    FinishItem(job, id, "unchanged", "");
    Persist();
    return;
  }
  if (error != net::OK || status != 200 || !body ||
      !base::IsStringUTF8(*body) || body->find('\0') != body->npos) {
    loader_.reset();
    FinishItem(
        job, id, "failed",
        "Subscription download failed or returned invalid UTF-8 filter data");
    return;
  }
  row->Set("etag", head->headers->GetNormalizedHeader("etag").value_or(""));
  row->Set("lastModifiedHeader",
           head->headers->GetNormalizedHeader("last-modified").value_or(""));
  if (texts_.contains(id) && texts_.at(id) == *body) {
    loader_.reset();
    row->Set("lastSuccessfulCheckMs", Now());
    row->Set("consecutiveFailures", 0);
    FinishItem(job, id, "unchanged", "");
    return;
  }
  row->Set("contentSize", static_cast<double>(body->size()));
  row->Set("digest", base::HexEncode(crypto::hash::Sha256(*body)));
  row->Set("lastSuccessfulCheckMs", Now());
  row->Set("lastContentChangeMs", Now());
  row->Set("consecutiveFailures", 0);
  if (!previous_texts_.contains(id)) {
    previous_texts_[id] =
        texts_.contains(id) ? std::make_optional(texts_.at(id)) : std::nullopt;
  }
  texts_[id] = std::move(*body);
  loader_.reset();
  row->Set("status", "compiling");
  for (auto& item : *jobs_.at(job).FindList("items")) {
    if (*item.GetDict().FindString("subscriptionId") == id) {
      item.GetDict().Set("status", "compiling");
      item.GetDict().Set("generation", static_cast<double>(requested_ + 1));
    }
  }
  Compile();
  DownloadNext();
}
void FilterService::FinishItem(std::string job,
                               std::string id,
                               std::string status,
                               std::string error) {
  if (auto* row = Subscription(id)) {
    row->Set("status", status == "failed" ? "error" : "idle");
    row->Set("lastError", error);
    if (status == "failed") {
      row->Set("consecutiveFailures",
               row->FindInt("consecutiveFailures").value_or(0) + 1);
    }
    row->Set("nextUpdateMs", Now() + 24 * 60 * 60 * 1000.0);
  }
  auto found = jobs_.find(job);
  if (found == jobs_.end()) {
    return;
  }
  auto& state = found->second;
  int completed = 0, failed = 0;
  for (auto& item : *state.FindList("items")) {
    auto& value = item.GetDict();
    if (*value.FindString("subscriptionId") == id) {
      value.Set("status", status);
      value.Set("error", error);
    }
    const auto* value_status = value.FindString("status");
    if (*value_status == "updated" || *value_status == "unchanged" ||
        *value_status == "failed") {
      ++completed;
      if (*value_status == "failed") {
        ++failed;
      }
    }
  }
  state.Set("completed", completed);
  if (completed == state.FindInt("total").value_or(0)) {
    state.Set("status", failed == completed ? "failed"
                        : failed            ? "partiallyFailed"
                                            : "succeeded");
    state.Set("completedAtMs", Now());
  }
  Persist();
  DownloadNext();
}
void FilterService::Invoke(std::string method,
                           base::ListValue args,
                           Reply reply) {
  auto done = [&](base::Value value = base::Value()) {
    std::move(reply).Run(std::move(value), "");
  };
  auto fail = [&](std::string error) {
    std::move(reply).Run(std::nullopt, std::move(error));
  };
  if (method == "getState") {
    done(base::Value(State()));
    return;
  }
  if (!loaded_) {
    fail("Filter state is still loading");
    return;
  }
  if (method == "getSubscriptions") {
    done(base::Value(subscriptions_.Clone()));
    return;
  }
  if (method == "getDiagnostics") {
    done(base::Value(Diagnostics()));
    return;
  }
  if (method == "getCustomRules") {
    done(base::Value(CustomRules()));
    return;
  }
  if (method == "setEnabled") {
    if (args.size() != 1 || !args[0].is_bool()) {
      fail("Enabled flag required");
      return;
    }
    enabled_ = args[0].GetBool();
    cosmetic_observers_.Notify();
    Persist();
    done(base::Value(State()));
    return;
  }
  if (method == "saveCustomRules") {
    const auto* text = args.size() == 1 && args[0].is_dict()
                           ? args[0].GetDict().FindString("rules")
                           : nullptr;
    if (!text || text->size() > 4 * 1024 * 1024 || !base::IsStringUTF8(*text) ||
        text->find('\0') != text->npos) {
      fail("Rules must be valid UTF-8 without NUL and at most 4 MiB");
      return;
    }
    pending_rules_ = *text;
    Compile();
    done(base::Value(CustomRules()));
    return;
  }
  if (method == "addSubscription") {
    const auto* options =
        args.size() == 1 && args[0].is_dict() ? &args[0].GetDict() : nullptr;
    const auto* url = options ? options->FindString("url") : nullptr;
    if (!url || !ValidSubscriptionURL(GURL(*url)) ||
        subscriptions_.size() >= 64) {
      fail(
          "Subscription requires a public HTTPS URL; at most 64 sources are "
          "permitted");
      return;
    }
    for (const auto& item : subscriptions_) {
      if (item.GetDict().FindString("url") &&
          *item.GetDict().FindString("url") == GURL(*url).spec()) {
        fail("Subscription already exists");
        return;
      }
    }
    const auto* name = options->FindString("name");
    if (name && name->size() > 256) {
      fail("Subscription name is too long");
      return;
    }
    const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    base::DictValue row;
    row.Set("id", id);
    row.Set("name", name ? *name : GURL(*url).host());
    row.Set("url", GURL(*url).spec());
    row.Set("enabled", true);
    row.Set("status", "queued");
    for (const auto* key :
         {"etag", "lastModifiedHeader", "digest", "lastError"}) {
      row.Set(key, "");
    }
    for (const auto* key : {"networkRuleCount", "cosmeticRuleCount",
                            "parseErrorCount", "consecutiveFailures"}) {
      row.Set(key, 0);
    }
    for (const auto* key :
         {"contentSize", "lastAttemptMs", "lastSuccessfulCheckMs",
          "lastContentChangeMs", "lastEngineActivationMs", "nextUpdateMs"}) {
      row.Set(key, 0.0);
    }
    row.Set("invalidLines", base::ListValue());
    subscriptions_.Append(std::move(row));
    auto job = StartUpdate({id});
    if (job.empty()) {
      subscriptions_.EraseIf([&](const base::Value& value) {
        return *value.GetDict().FindString("id") == id;
      });
      fail("Too many active update jobs");
      return;
    }
    base::DictValue result;
    result.Set("subscription", Subscription(id)->Clone());
    result.Set("updateJobId", job);
    Persist();
    done(base::Value(std::move(result)));
    return;
  }
  if (method == "setSubscriptionEnabled" || method == "removeSubscription") {
    if (args.empty() || !args[0].is_string()) {
      fail("Subscription identity required");
      return;
    }
    const auto id = args[0].GetString();
    auto* row = Subscription(id);
    if (!row) {
      fail("Subscription was not found");
      return;
    }
    if (method == "setSubscriptionEnabled") {
      if (args.size() != 2 || !args[1].is_bool()) {
        fail("Enabled flag required");
        return;
      }
      row->Set("enabled", args[1].GetBool());
      Compile();
      Persist();
      done(base::Value(row->Clone()));
    } else {
      subscriptions_.EraseIf([&](const base::Value& value) {
        return value.GetDict().FindString("id") &&
               *value.GetDict().FindString("id") == id;
      });
      texts_.erase(id);
      Compile();
      Persist();
      done();
    }
    return;
  }
  if (method == "startSubscriptionUpdate") {
    // The extension bindings preserve omitted optional positions as NONE.
    const auto* options = args.empty() ? nullptr : args[0].GetIfDict();
    if (args.size() > 1 || (!args.empty() && !args[0].is_none() && !options)) {
      fail("Update options are invalid");
      return;
    }
    if (std::ranges::count_if(jobs_, [](const auto& item) {
          const auto* status = item.second.FindString("status");
          return status && *status == "running";
        }) >= 32) {
      fail("Too many retained update jobs; reload this profile");
      return;
    }
    std::vector<std::string> ids;
    const auto* requested = options ? options->FindList("ids") : nullptr;
    if (requested) {
      for (const auto& item : *requested) {
        if (!item.is_string() || !Subscription(item.GetString())) {
          fail("Update includes an unknown subscription");
          return;
        }
        if (std::ranges::find(ids, item.GetString()) == ids.end()) {
          ids.push_back(item.GetString());
        }
      }
    } else {
      for (const auto& item : subscriptions_) {
        ids.push_back(*item.GetDict().FindString("id"));
      }
    }
    const auto id = StartUpdate(ids);
    if (id.empty()) {
      fail("Too many active update jobs");
      return;
    }
    done(base::Value(jobs_.at(id).Clone()));
    return;
  }
  if (method == "getSubscriptionUpdateProgress") {
    if (args.size() != 1 || !args[0].is_string() ||
        !jobs_.contains(args[0].GetString())) {
      fail("Update job was not found");
      return;
    }
    done(base::Value(jobs_.at(args[0].GetString()).Clone()));
    return;
  }
  if (method == "reloadManualFilters") {
    files_->PostTaskAndReplyWithResult(
        FROM_HERE,
        base::BindOnce(&ReadManual, directory_.AppendASCII("manual")),
        base::BindOnce(
            [](base::WeakPtr<FilterService> self, Reply reply,
               std::vector<Source> manual) {
              if (!self) {
                std::move(reply).Run(std::nullopt, "Profile was closed");
                return;
              }
              self->manual_ = std::move(manual);
              self->Compile();
              std::move(reply).Run(base::Value(self->Diagnostics()), "");
            },
            weak_.GetWeakPtr(), std::move(reply)));
    return;
  }
  if (method == "clearEngineCache") {
    Compile();
    done();
    return;
  }
  if (method == "testRequest") {
    const auto* value =
        args.size() == 1 && args[0].is_dict() ? &args[0].GetDict() : nullptr;
    const auto *url = value ? value->FindString("url") : nullptr,
               *initiator = value ? value->FindString("initiator") : nullptr,
               *type = value ? value->FindString("requestType") : nullptr;
    auto third = value ? value->FindBool("thirdParty") : std::nullopt;
    if (!url || !initiator || !type || !third || !GURL(*url).is_valid() ||
        !GURL(*initiator).is_valid()) {
      fail("Request URL, initiator, type and third-party state are required");
      return;
    }
    const auto* method_value = value->FindString("method");
    const auto verb = method_value ? base::ToUpperASCII(*method_value) : "GET";
    if (verb != "GET" && verb != "POST" && verb != "PUT" && verb != "PATCH" &&
        verb != "DELETE" && verb != "OPTIONS" && verb != "HEAD" &&
        verb != "CONNECT" && verb != "TRACE") {
      fail("Unsupported HTTP method");
      return;
    }
    done(base::Value(
        Evaluate({GURL(*url), GURL(*initiator), *type, verb, *third})
            .ToValue()));
    return;
  }
  fail("Unknown filtering operation");
}
}  // namespace aux_adblock
