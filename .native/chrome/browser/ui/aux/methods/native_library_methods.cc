// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/native_appearance_file_channel.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/method_registry.h"

#include "base/task/thread_pool.h"

#include <fcntl.h>
#include <poll.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <unistd.h>

#include <algorithm>
#include <array>
#include <cerrno>
#include <cmath>
#include <memory>
#include <limits>
#include <optional>
#include <utility>
#include <vector>

#include "base/base_paths.h"
#include "base/command_line.h"
#include "base/containers/span.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/path_service.h"
#include "base/process/launch.h"
#include "base/rand_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/strings/string_number_conversions.h"
#include "base/synchronization/waitable_event.h"
#include "base/time/time.h"
#include "base/task/bind_post_task.h"
#include "base/timer/timer.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/cdp_broker.h"
#include "chrome/browser/ui/aux/content_blocking_controller.h"
#include "chrome/browser/ui/aux/cosmetic_controller.h"
#include "chrome/browser/ui/aux/credential_fill.h"
#include "chrome/browser/ui/aux/cookie_import.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/profile_library.h"
#include "chrome/browser/ui/aux/profile_search_engine.h"
#include "chrome/browser/ui/aux/readable_capture.h"
#include "chrome/browser/ui/aux/secret_store_mac.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/aux/native_find.h"
#include "chrome/browser/ui/aux/zap_controller.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "components/sessions/core/session_id.h"
#include "components/find_in_page/find_result_observer.h"
#include "components/find_in_page/find_tab_helper.h"
#include "components/version_info/version_info.h"
#include "components/zoom/zoom_controller.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
#include "content/public/common/stop_find_action.h"
#include "ui/base/base_window.h"
#include "url/gurl.h"


namespace {
base::DictValue NativeFault(std::string code, std::string message) {
  base::DictValue error;
  error.Set("code", std::move(code));
  error.Set("message", std::move(message));
  base::DictValue reply;
  reply.Set("error", std::move(error));
  return reply;
}
base::DictValue NativeResult(base::Value value) {
  base::DictValue reply;
  reply.Set("result", std::move(value));
  return reply;
}
}  // namespace

void AuxRuntimeHost::HandleHistoryMutation(
    const std::string& method,
    const base::DictValue& params,
    base::OnceCallback<void(base::DictValue)> callback) {
  if (!profile_library_) {
    std::move(callback).Run(
        NativeFault("backend_unavailable", "Profile library is unavailable"));
    return;
  }
  if (method == "native.historyClear") {
    profile_library_->ClearHistory(params, std::move(callback));
  } else if (method == "native.historyImport") {
    profile_library_->ImportHistory(params, std::move(callback));
  } else {
    profile_library_->RemoveVisit(params, std::move(callback));
  }
}

base::DictValue AuxRuntimeHost::HandleNativeLibraryCall(
    const std::string& method, const base::DictValue& params,
    uint64_t /*connection_generation*/) {
  if (method == "native.liveFolderSources") {
    std::string error;
    const auto snapshot = aux::OrganizationStore::Snapshot(profile_, "main", &error);
    if (!snapshot)
      return NativeFault("backend_unavailable", "Profile organization is unavailable");
    base::ListValue sources;
    const base::DictValue* layout = snapshot->FindDict("layout");
    const base::DictValue* shared = layout ? layout->FindDict("shared") : nullptr;
    const base::ListValue* folders = shared ? shared->FindList("folders") : nullptr;
    if (folders) {
      for (const auto& value : *folders) {
        const base::DictValue* folder = value.GetIfDict();
        const std::string* id = folder ? folder->FindString("id") : nullptr;
        const base::DictValue* live = folder ? folder->FindDict("live") : nullptr;
        if (!id || !live)
          continue;
        base::DictValue source;
        source.Set("id", *id);
        source.Set("live", live->Clone());
        sources.Append(std::move(source));
      }
    }
    return NativeResult(base::Value(std::move(sources)));
  }
  if (method == "native.capabilities") {
    auto capabilities = aux::AuxMethodRegistry::Get().Capabilities();
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
    // Key/process admission only; this grants no window or document authority.
    // Every signed snapshot still comes from the guarded original WebUI getter.
    if (profile_) {
      const auto original_profile = profile_->GetWeakPtr();
      auto receipt = aux::NativeAppearanceFileChannelReceipt(profile_);
      if (receipt && original_profile && original_profile.get() == profile_)
        capabilities.Set("nativeAppearanceFileChannel", std::move(*receipt));
    }
#endif
    return NativeResult(base::Value(std::move(capabilities)));
  }
  if (method == "native.searchEngineGet") {
    const auto url_template = aux::ProfileSearchEngine::CurrentTemplate(profile_);
    return url_template ? NativeResult(base::Value(*url_template))
                        : NativeFault("backend_unavailable",
                                      "Profile search engine is unavailable");
  }
  if (method == "native.searchEngineSet") {
    const std::string* url_template = params.FindString("template");
    if (!url_template) {
      return NativeFault("invalid_argument", "Missing search URL template");
    }
    switch (aux::ProfileSearchEngine::Set(profile_, *url_template)) {
      case aux::ProfileSearchEngine::SetResult::kOk:
        return NativeResult(base::Value(true));
      case aux::ProfileSearchEngine::SetResult::kManaged:
        return NativeFault("permission_denied",
                           "The Profile search engine is managed");
      case aux::ProfileSearchEngine::SetResult::kInvalid:
        return NativeFault("invalid_argument", "Invalid search URL template");
      case aux::ProfileSearchEngine::SetResult::kUnavailable:
        return NativeFault("backend_unavailable",
                           "Profile search engines are still loading");
    }
  }
  if (method == "native.searchSuggestionsGet") {
    return NativeResult(base::Value(
        aux::ProfileSearchEngine::SuggestionsEnabled(profile_)));
  }
  if (method == "native.searchSuggestionsSet") {
    const std::optional<bool> enabled = params.FindBool("enabled");
    if (!enabled) {
      return NativeFault("invalid_argument", "Missing suggestion preference");
    }
    switch (aux::ProfileSearchEngine::SetSuggestions(profile_, *enabled)) {
      case aux::ProfileSearchEngine::SetResult::kOk:
        return NativeResult(base::Value(true));
      case aux::ProfileSearchEngine::SetResult::kManaged:
        return NativeFault("permission_denied",
                           "The Profile suggestion preference is managed");
      case aux::ProfileSearchEngine::SetResult::kInvalid:
        return NativeFault("invalid_argument", "Invalid suggestion preference");
      case aux::ProfileSearchEngine::SetResult::kUnavailable:
        return NativeFault("backend_unavailable",
                           "Profile suggestions are unavailable");
    }
  }
  if (method == "native.organizationSnapshot") {
    if (!params.empty()) return NativeFault("invalid_argument", "Organization snapshot takes no arguments");
    std::string error;
    auto snapshot = aux::OrganizationStore::ProfileSnapshot(profile_, &error);
    if (!snapshot) return NativeFault("permission_denied", error);
    return NativeResult(base::Value(std::move(*snapshot)));
  }
  if (method == "native.bookmarksInvoke") {
    const std::string* bookmark_method = params.FindString("method");
    const base::DictValue* bookmark_params = params.FindDict("params");
    if (!bookmark_method || !bookmark_params) {
      return NativeFault("invalid_argument", "Invalid bookmark request");
    }
    return profile_library_->BookmarkCall(*bookmark_method, *bookmark_params);
  }
  return NativeFault("backend_unavailable",
                     "Native method is unavailable in this build");
}
