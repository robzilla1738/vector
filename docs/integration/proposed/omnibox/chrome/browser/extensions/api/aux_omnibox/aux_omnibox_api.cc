// Copyright 2026 Aux Authors. All rights reserved.
// Independent owned AutocompleteController sessions: native/omnibox O1-O4.
#include "chrome/browser/extensions/api/aux_omnibox/aux_omnibox_api.h"

#include <algorithm>
#include <map>
#include <optional>

#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/scoped_multi_source_observation.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/uuid.h"
#include "chrome/browser/autocomplete/chrome_autocomplete_provider_client.h"
#include "chrome/browser/autocomplete/chrome_autocomplete_scheme_classifier.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/preloading/prefetch/search_prefetch/search_prefetch_service.h"
#include "chrome/browser/preloading/prefetch/search_prefetch/search_prefetch_service_factory.h"
#include "chrome/browser/preloading/search_preload/search_preload_service.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/search_engines/template_url_service_factory.h"
#include "chrome/browser/tab_list/tab_list_interface.h"
#include "chrome/browser/tab_list/tab_list_interface_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_collection_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "components/omnibox/browser/actions/omnibox_action.h"
#include "components/omnibox/browser/autocomplete_classifier.h"
#include "components/omnibox/browser/autocomplete_controller.h"
#include "components/omnibox/browser/autocomplete_match_type.h"
#include "components/search_engines/template_url.h"
#include "components/search_engines/template_url_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_event_histogram_value.h"
#include "ui/base/base_window.h"
namespace extensions {
namespace {
struct VisibleTab {
  int id;
  raw_ptr<BrowserWindowInterface> browser;
  raw_ptr<tabs::TabInterface> tab;
};
std::vector<VisibleTab> VisibleTabs(Profile* profile) {
  std::vector<VisibleTab> tabs;
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    if (browser->GetProfile() != profile) {
      continue;
    }
    auto* list = TabListInterface::From(browser);
    if (!list) {
      continue;
    }
    for (int i = 0; i < list->GetTabCount(); ++i) {
      auto* tab = list->GetTab(i);
      if (tab && tab->GetContents()) {
        tabs.push_back(
            {ExtensionTabUtil::GetTabId(tab->GetContents()), browser, tab});
      }
    }
  }
  std::ranges::sort(tabs, {}, &VisibleTab::id);
  return tabs;
}
WindowOpenDisposition Disposition(const base::DictValue& request) {
  const auto* value = request.FindString("disposition");
  if (!value || *value == "currentTab") {
    return WindowOpenDisposition::CURRENT_TAB;
  }
  if (*value == "newForegroundTab") {
    return WindowOpenDisposition::NEW_FOREGROUND_TAB;
  }
  if (*value == "newBackgroundTab") {
    return WindowOpenDisposition::NEW_BACKGROUND_TAB;
  }
  if (*value == "newWindow") {
    return WindowOpenDisposition::NEW_WINDOW;
  }
  return WindowOpenDisposition::UNKNOWN;
}
base::DictValue TabSummary(const VisibleTab& tab) {
  auto* contents = tab.tab->GetContents();
  base::DictValue value;
  value.Set("tabId", tab.id);
  value.Set("title", base::UTF16ToUTF8(contents->GetTitle()));
  value.Set("url", contents->GetLastCommittedURL().spec());
  value.Set("windowId", ExtensionTabUtil::GetWindowIdOfTab(contents));
  return value;
}
class OmniboxSession : public AutocompleteController::Observer,
                       public TabListInterfaceObserver,
                       public BrowserCollectionObserver {
 public:
  OmniboxSession(content::WebContents* owner, std::string extension_id)
      : id_(base::Uuid::GenerateRandomV4().AsLowercaseString()),
        owner_(owner),
        extension_id_(std::move(extension_id)),
        frame_id_(owner->GetPrimaryMainFrame()->GetGlobalId()) {
    AutocompleteControllerConfig config;
    config.provider_types =
        AutocompleteClassifier::DefaultOmniboxProviders(false);
    config.unscoped_open_tab_suggestions = true;
    controller_ = std::make_unique<AutocompleteController>(
        std::make_unique<ChromeAutocompleteProviderClient>(
            profile(), base::BindRepeating(
                           [](base::WeakPtr<content::WebContents> contents) {
                             return contents.get();
                           },
                           owner->GetWeakPtr())),
        config);
    controller_->AddObserver(this);
    browsers_.Observe(GlobalBrowserCollection::GetInstance());
    for (auto* browser : GetAllBrowserWindowInterfaces()) {
      ObserveBrowser(browser);
    }
  }
  ~OmniboxSession() override {
    controller_->RemoveObserver(this);
    controller_->Stop(AutocompleteStopReason::kClobbered);
  }
  bool Owns(content::WebContents* owner, std::string_view extension_id) const {
    return owner_ == owner && extension_id_ == extension_id &&
           owner->GetPrimaryMainFrame()->GetGlobalId() == frame_id_;
  }
  Profile* profile() const {
    return Profile::FromBrowserContext(owner_->GetBrowserContext());
  }
  const std::string& id() const { return id_; }
  void Emit(std::string event_name,
            base::DictValue payload = {},
            bool has_payload = true) {
    if (!owner_->GetPrimaryMainFrame() ||
        owner_->GetPrimaryMainFrame()->GetGlobalId() != frame_id_) {
      return;
    }
    base::ListValue args;
    args.Append(id_);
    if (has_payload) {
      args.Append(std::move(payload));
    }
    auto event = std::make_unique<Event>(events::AUXOMNIBOX_EVENT,
                                         "auxOmnibox." + event_name,
                                         std::move(args), profile());
    event->restrict_to_dispatch_target = Event::DispatchTarget{
        owner_->GetPrimaryMainFrame()->GetProcess()->GetID()};
    event->will_dispatch_callback = base::BindRepeating(
        [](content::BrowserContext* expected, content::BrowserContext* actual,
           mojom::ContextType, const Extension*, const base::DictValue*,
           std::optional<base::ListValue>&, mojom::EventFilteringInfoPtr&,
           bool*) { return expected == actual; },
        base::Unretained(owner_->GetBrowserContext()));
    EventRouter::Get(profile())->DispatchEventToExtension(extension_id_,
                                                          std::move(event));
  }
  base::DictValue InputState() const {
    base::DictValue result;
    result.Set("text", text_);
    result.Set("focused", focused_);
    result.Set("selectionStart",
               static_cast<int>(base::UTF8ToUTF16(text_).size()));
    result.Set("selectionEnd",
               static_cast<int>(base::UTF8ToUTF16(text_).size()));
    result.Set("activeToolMode", tool_mode_);
    result.Set("activeModelMode", model_mode_);
    if (!keyword_.empty()) {
      result.Set("keyword", keyword_);
    }
    base::ListValue contexts;
    for (const auto& [id, context] : contexts_) {
      contexts.Append(context.summary.Clone());
    }
    result.Set("contexts", std::move(contexts));
    return result;
  }
  void InputChanged() { Emit("onInputStateChanged", InputState()); }
  void Query(std::string text,
             bool prevent_inline = false,
             bool zero_prefix = false) {
    controller_->Stop(AutocompleteStopReason::kClobbered);
    text_ = std::move(text);
    ++revision_;
    selected_ = -1;
    AutocompleteInput input(base::UTF8ToUTF16(text_),
                            metrics::OmniboxEventProto::NTP_REALBOX,
                            ChromeAutocompleteSchemeClassifier(profile()));
    input.set_current_url(owner_->GetLastCommittedURL());
    input.set_prevent_inline_autocomplete(prevent_inline);
    if (zero_prefix) {
      input.set_focus_type(metrics::OmniboxFocusType::INTERACTION_FOCUS);
    }
    input.set_in_keyword_mode(!keyword_.empty());
    controller_->Start(input);
    InputChanged();
  }
  void Stop(bool clear) {
    controller_->Stop(clear ? AutocompleteStopReason::kClobbered
                            : AutocompleteStopReason::kInteraction);
    if (clear) {
      matches_.clear();
      tab_ids_.clear();
      ++revision_;
      selected_ = -1;
      PublishResults();
    }
  }
  void OnResultChanged(AutocompleteController* controller,
                       bool default_changed) override {
    matches_.clear();
    tab_ids_.clear();
    ++revision_;
    selected_ = -1;
    const auto tabs = VisibleTabs(profile());
    for (const auto& match : controller_->result()) {
      if (matches_.size() >= 128) {
        break;
      }
      matches_.push_back(match);
      std::optional<int> tab_id;
      if (match.has_tab_match.value_or(false)) {
        for (const auto& tab : tabs) {
          if (tab.tab->GetContents()->GetLastCommittedURL() ==
              match.destination_url) {
            tab_id = tab.id;
            break;
          }
        }
      }
      tab_ids_.push_back(tab_id);
    }
    PublishResults();
  }
  void PublishResults() {
    base::DictValue result;
    result.Set("revision", revision_);
    result.Set("input", text_);
    result.Set("done", controller_->done());
    base::ListValue rows;
    for (size_t i = 0; i < matches_.size(); ++i) {
      const auto& match = matches_[i];
      base::DictValue row;
      row.Set("id", base::NumberToString(static_cast<int>(match.type)) + ":" +
                        match.destination_url.spec() + ":" +
                        base::UTF16ToUTF8(match.fill_into_edit));
      row.Set("index", static_cast<int>(i));
      row.Set("title", base::UTF16ToUTF8(match.contents));
      row.Set("contents", base::UTF16ToUTF8(match.contents));
      row.Set("description", base::UTF16ToUTF8(match.description));
      row.Set("destinationUrl", match.destination_url.spec());
      row.Set("fillIntoEdit", base::UTF16ToUTF8(match.fill_into_edit));
      row.Set("type", AutocompleteMatchType::ToString(match.type));
      row.Set("isSearch", AutocompleteMatch::IsSearchType(match.type));
      row.Set("isSearchType", AutocompleteMatch::IsSearchType(match.type));
      row.Set("deletable", match.SupportsDeletion());
      row.Set("supportsDeletion", match.SupportsDeletion());
      if (tab_ids_[i]) {
        row.Set("tabId", *tab_ids_[i]);
      }
      rows.Append(std::move(row));
    }
    result.Set("matches", std::move(rows));
    Emit("onAutocompleteResultChanged", std::move(result));
  }
  std::optional<size_t> Selection(const base::DictValue& request,
                                  bool use_selected = false) const {
    // The supplied UI uses line and optional nested popup selection; older
    // internal callers use revision/index. Neither may escape this owned session.
    const auto* nested = request.FindDict("selection");
    const auto& selection = nested ? *nested : request;
    const auto revision = request.FindInt("revision");
    if (request.Find("revision") && (!revision || *revision != revision_))
      return std::nullopt;
    const auto index = selection.FindInt("index");
    const auto line = selection.FindInt("line");
    if ((selection.Find("index") && !index) ||
        (selection.Find("line") && !line) ||
        (index && line && *index != *line)) return std::nullopt;
    const int selected = line.value_or(index.value_or(use_selected ? selected_ : -1));
    if (selected < 0 || static_cast<size_t>(selected) >= matches_.size())
      return std::nullopt;
    if (const auto* expected = request.FindString("url"); expected &&
        GURL(*expected) != matches_[selected].destination_url)
      return std::nullopt;
    if (request.Find("url") && !request.FindString("url")) return std::nullopt;
    return selected;
  }
  std::optional<std::string> Open(const base::DictValue& request,
                                  bool use_selected = false) {
    const auto index = Selection(request, use_selected);
    if (!index) {
      return "Selection is stale or unavailable";
    }
    const auto disposition = Disposition(request);
    if (disposition == WindowOpenDisposition::UNKNOWN) {
      return "Unknown navigation disposition";
    }
    if (tab_ids_[*index] && disposition == WindowOpenDisposition::CURRENT_TAB) {
      for (const auto& tab : VisibleTabs(profile())) {
        if (tab.id == *tab_ids_[*index]) {
          TabListInterface::From(tab.browser)
              ->ActivateTab(tab.tab->GetHandle());
          tab.browser->GetWindow()->Activate();
          return std::nullopt;
        }
      }
      return "Selected tab was closed";
    }
    return NavigateTo(matches_[*index].destination_url, disposition);
  }
  std::optional<std::string> NavigateTo(const GURL& url,
                                        WindowOpenDisposition disposition) {
    if (disposition == WindowOpenDisposition::UNKNOWN || !url.is_valid() ||
        url.SchemeIs("javascript") || url.SchemeIs("data")) {
      return "Navigation target is not allowed";
    }
    auto* browser =
        GlobalBrowserCollection::GetInstance()->FindBrowserWithTab(owner_);
    if (disposition == WindowOpenDisposition::CURRENT_TAB && browser) {
      auto navigation = owner_->GetController().LoadURL(
          url, content::Referrer(), ui::PAGE_TRANSITION_TYPED, std::string());
      return navigation
                 ? std::nullopt
                 : std::make_optional<std::string>("Navigation was rejected");
    }
    if (!browser) {
      browser = GlobalBrowserCollection::GetInstance()->FindBrowserWithWindow(
          owner_->GetTopLevelNativeWindow());
    }
    if (!browser || browser->GetProfile() != profile()) {
      return "Owning browser window is unavailable";
    }
    NavigateParams params(browser, url, ui::PAGE_TRANSITION_TYPED);
    params.disposition = disposition;
    params.source_contents = owner_;
    Navigate(&params);
    return params.navigated_or_inserted_contents
               ? std::nullopt
               : std::optional<std::string>("Navigation could not be opened");
  }
  void ObserveBrowser(BrowserWindowInterface* browser) {
    if (browser->GetProfile() != profile()) {
      return;
    }
    auto* list = TabListInterface::From(browser);
    if (list && !tabs_.IsObservingSource(list)) {
      tabs_.AddObservation(list);
    }
  }
  void OnBrowserCreated(BrowserWindowInterface* browser) override {
    ObserveBrowser(browser);
    Emit("onTabStripChanged", {}, false);
  }
  void OnBrowserClosed(BrowserWindowInterface* browser) override {
    Emit("onTabStripChanged", {}, false);
  }
  void OnTabAdded(TabListInterface&, tabs::TabInterface*, int) override {
    Emit("onTabStripChanged", {}, false);
  }
  void OnActiveTabChanged(TabListInterface&, tabs::TabInterface*) override {
    Emit("onTabStripChanged", {}, false);
  }
  void OnTabRemoved(TabListInterface&,
                    tabs::TabInterface*,
                    TabRemovedReason) override {
    Emit("onTabStripChanged", {}, false);
  }
  void OnTabMoved(TabListInterface&, tabs::TabInterface*, int, int) override {
    Emit("onTabStripChanged", {}, false);
  }
  void OnTabListDestroyed(TabListInterface& list) override {
    tabs_.RemoveObservation(&list);
  }
  struct Context {
    base::DictValue summary;
    std::string bytes;
  };
  std::string id_;
  raw_ptr<content::WebContents> owner_;
  std::string extension_id_;
  content::GlobalRenderFrameHostId frame_id_;
  std::unique_ptr<AutocompleteController> controller_;
  std::string text_, keyword_, tool_mode_, model_mode_, thumbnail_,
      metrics_funnel_;
  base::TimeTicks interaction_started_;
  bool focused_ = false, block_auto_tabs_ = false;
  int revision_ = 0, selected_ = -1;
  std::vector<AutocompleteMatch> matches_;
  std::vector<std::optional<int>> tab_ids_;
  std::map<std::string, Context> contexts_;
  size_t context_bytes_ = 0;
  base::ScopedObservation<GlobalBrowserCollection, BrowserCollectionObserver>
      browsers_{this};
  base::ScopedMultiSourceObservation<TabListInterface, TabListInterfaceObserver>
      tabs_{this};
};
class OmniboxOwnerState
    : public content::WebContentsUserData<OmniboxOwnerState>,
      public content::WebContentsObserver {
 public:
  ~OmniboxOwnerState() override = default;
  std::map<std::string, std::unique_ptr<OmniboxSession>> sessions;
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    if (navigation->HasCommitted() && navigation->IsInPrimaryMainFrame() &&
        !navigation->IsSameDocument()) {
      sessions.clear();
    }
  }

 private:
  friend class content::WebContentsUserData<OmniboxOwnerState>;
  explicit OmniboxOwnerState(content::WebContents* owner)
      : content::WebContentsUserData<OmniboxOwnerState>(*owner),
        content::WebContentsObserver(owner) {}
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(OmniboxOwnerState);
base::DictValue SearchEngines(Profile* profile) {
  auto* service = TemplateURLServiceFactory::GetForProfile(profile);
  service->Load();
  base::DictValue result;
  base::ListValue engines;
  const auto* current = service->GetDefaultSearchProvider();
  for (const auto& engine : service->GetTemplateURLs()) {
    if (!engine->SupportsReplacement(service->search_terms_data())) {
      continue;
    }
    base::DictValue row;
    row.Set("id", base::NumberToString(engine->id()));
    row.Set("name", base::UTF16ToUTF8(engine->short_name()));
    row.Set("keyword", base::UTF16ToUTF8(engine->keyword()));
    row.Set("isDefault", engine == current);
    engines.Append(std::move(row));
  }
  result.Set("engines", std::move(engines));
  if (current) {
    result.Set("defaultEngineId", base::NumberToString(current->id()));
  }
  return result;
}
}  // namespace
ExtensionFunction::ResponseAction AuxOmniboxFunction::RunAux() {
  const std::string_view method = std::string_view(name()).substr(11);
  if (method == "getSearchEngines") {
    if (!args().empty()) {
      return RespondNow(Error("No arguments expected"));
    }
    return RespondNow(WithArguments(SearchEngines(profile())));
  }
  auto* owner = GetSenderWebContents();
  if (!owner || owner->GetBrowserContext() != profile() ||
      !owner->GetPrimaryMainFrame()) {
    return RespondNow(Error("An active extension page is required"));
  }
  OmniboxOwnerState::CreateForWebContents(owner);
  auto* state = OmniboxOwnerState::FromWebContents(owner);
  if (method == "createSession") {
    if (args().size() > 1 || (!args().empty() && !args()[0].is_dict())) {
      return RespondNow(Error("Invalid session options"));
    }
    std::string initial;
    if (!args().empty()) {
      const auto& options = args()[0].GetDict();
      for (const auto [key, value] : options) {
        if (key != "surface" && key != "initialText") {
          return RespondNow(Error("Unknown session option"));
        }
      }
      const auto* surface = options.FindString("surface");
      if (surface && *surface != "newtab" && *surface != "sidepanel") {
        return RespondNow(Error("Unknown search surface"));
      }
      const auto* text = options.FindString("initialText");
      if (text) {
        initial = *text;
      }
      if (initial.size() > 8192) {
        return RespondNow(Error("Input is too long"));
      }
    }
    if (state->sessions.size() >= 16) {
      return RespondNow(Error("Too many active search sessions"));
    }
    auto session = std::make_unique<OmniboxSession>(owner, extension_id());
    session->text_ = initial;
    const std::string id = session->id();
    state->sessions.emplace(id, std::move(session));
    base::DictValue result;
    result.Set("sessionId", id);
    return RespondNow(WithArguments(std::move(result)));
  }
  if (args().empty() || !args()[0].is_string()) {
    return RespondNow(Error("Session identity is required"));
  }
  const auto found = state->sessions.find(args()[0].GetString());
  if (found == state->sessions.end() ||
      !found->second->Owns(owner, extension_id())) {
    return RespondNow(Error("auxOmnibox session not found or not owned by this extension"));
  }
  auto& session = *found->second;
  auto request = [&]() -> const base::DictValue* {
    return args().size() > 1 && args()[1].is_dict() ? &args()[1].GetDict()
                                                    : nullptr;
  };
  if (method == "destroySession") {
    state->sessions.erase(found);
    return RespondNow(NoArguments());
  }
  if (method == "getInputState") {
    return RespondNow(WithArguments(session.InputState()));
  }
  if (method == "onFocusChanged") {
    if (args().size() != 2 || !args()[1].is_bool()) {
      return RespondNow(Error("Focus state required"));
    }
    session.focused_ = args()[1].GetBool();
    if (!session.focused_) {
      session.Stop(false);
    }
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "queryAutocomplete") {
    if (args().size() < 2 || args().size() > 3 || !args()[1].is_string() ||
        args()[1].GetString().size() > 8192 ||
        (args().size() == 3 && !args()[2].is_dict())) {
      return RespondNow(Error("Invalid autocomplete query"));
    }
    bool prevent = false;
    if (args().size() == 3) {
      prevent = args()[2]
                    .GetDict()
                    .FindBool("preventInlineAutocomplete")
                    .value_or(false);
    }
    const bool zero_prefix =
        args().size() == 3 &&
        args()[2].GetDict().FindBool("zeroPrefix").value_or(false);
    session.Query(args()[1].GetString(), prevent, zero_prefix);
    return RespondNow(NoArguments());
  }
  if (method == "stopAutocomplete") {
    if (args().size() != 2 || !args()[1].is_bool()) {
      return RespondNow(Error("Clear-result flag required"));
    }
    session.Stop(args()[1].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "openAutocompleteMatch" || method == "openPopupSelection") {
    const auto* value = request();
    if (!value) {
      return RespondNow(Error("Selection required"));
    }
    auto error = session.Open(*value, method == "openPopupSelection");
    return RespondNow(error ? Error(*error) : NoArguments());
  }
  if (method == "setPopupSelection") {
    const auto* value = request();
    const auto index = value ? session.Selection(*value) : std::nullopt;
    if (!index) {
      return RespondNow(Error("Selection is stale"));
    }
    session.selected_ = *index;
    session.Emit("onSelectionUpdated", value->Clone());
    return RespondNow(NoArguments());
  }
  if (method == "deleteAutocompleteMatch") {
    const auto* value = request();
    const auto index = value ? session.Selection(*value) : std::nullopt;
    if (!index || !session.matches_[*index].SupportsDeletion()) {
      return RespondNow(Error("Result cannot be deleted"));
    }
    session.controller_->DeleteMatch(session.matches_[*index]);
    return RespondNow(NoArguments());
  }
  if (method == "activateKeyword") {
    const auto* value = request();
    const auto index = value ? session.Selection(*value) : std::nullopt;
    if (!index) {
      return RespondNow(Error("Selection is stale"));
    }
    const auto& match = session.matches_[*index];
    const auto& keyword = match.associated_keyword.empty()
                              ? match.keyword
                              : match.associated_keyword;
    if (keyword.empty()) {
      return RespondNow(Error("Result has no keyword scope"));
    }
    session.keyword_ = base::UTF16ToUTF8(keyword);
    base::DictValue changed;
    changed.Set("keyword", session.keyword_);
    session.Emit("onKeywordSelectedChanged", std::move(changed));
    session.Query(session.keyword_ + " ");
    return RespondNow(NoArguments());
  }
  if (method == "onNavigationLikely") {
    const auto* value = request();
    const auto index = value ? session.Selection(*value) : std::nullopt;
    if (!index) {
      return RespondNow(Error("Selection is stale"));
    }
    const auto& match = session.matches_[*index];
    if (auto* service =
            SearchPrefetchServiceFactory::GetForProfile(profile())) {
      service->OnNavigationLikely(
          *index, match, omnibox::mojom::NavigationPredictor::kMouseDown,
          owner);
    }
    if (auto* service = SearchPreloadService::GetForProfile(profile())) {
      service->OnNavigationLikely(
          *index, match, omnibox::mojom::NavigationPredictor::kMouseDown,
          owner);
    }
    return RespondNow(NoArguments());
  }
  if (method == "executeAction") {
    const auto* value = request();
    const auto index = value ? session.Selection(*value) : std::nullopt;
    const auto action = value ? value->FindInt("actionIndex") : std::nullopt;
    if (!index || !action || *action < 0 ||
        static_cast<size_t>(*action) >=
            session.matches_[*index].actions.size()) {
      return RespondNow(Error("Action is stale or unavailable"));
    }
    const auto& url = session.matches_[*index].actions[*action]->getUrl();
    if (url.is_empty()) {
      return RespondNow(
          Error("This native action is not available on this surface"));
    }
    auto error = session.NavigateTo(url, Disposition(*value));
    return RespondNow(error ? Error(*error) : NoArguments());
  }
  if (method == "getPlaceholderConfig") {
    auto* engine = TemplateURLServiceFactory::GetForProfile(profile())
                       ->GetDefaultSearchProvider();
    base::DictValue result;
    result.Set("placeholder", "Search the web or enter an address");
    if (engine) {
      result.Set("providerName", base::UTF16ToUTF8(engine->short_name()));
    }
    return RespondNow(WithArguments(std::move(result)));
  }
  if (method == "getRecentTabs") {
    auto tabs = VisibleTabs(profile());
    std::ranges::sort(tabs, [](const VisibleTab& a, const VisibleTab& b) {
      return a.tab->GetContents()->GetLastActiveTimeTicks() >
             b.tab->GetContents()->GetLastActiveTimeTicks();
    });
    base::ListValue rows;
    for (const auto& tab : tabs) {
      rows.Append(TabSummary(tab));
    }
    base::DictValue result;
    result.Set("tabs", std::move(rows));
    return RespondNow(WithArguments(std::move(result)));
  }
  if (method == "getTabPreview" || method == "addTabContext") {
    if (args().size() < 2 || !args()[1].is_int()) {
      return RespondNow(Error("Tab identity required"));
    }
    for (const auto& tab : VisibleTabs(profile())) {
      if (tab.id == args()[1].GetInt()) {
        auto summary = TabSummary(tab);
        if (method == "addTabContext") {
          if (session.contexts_.size() >= 32) {
            return RespondNow(Error("Too many attachments"));
          }
          const auto token = base::Uuid::GenerateRandomV4().AsLowercaseString();
          summary.Set("contextToken", token);
          summary.Set("kind", "tab");
          summary.Set("name", summary.FindString("title")
                                  ? *summary.FindString("title")
                                  : "Browser tab");
          summary.Set("state", "ready");
          session.contexts_.emplace(
              token, OmniboxSession::Context{summary.Clone(), {}});
          session.InputChanged();
        }
        return RespondNow(WithArguments(std::move(summary)));
      }
    }
    return RespondNow(Error("Tab is unavailable in this profile"));
  }
  if (method == "addFileContext") {
    const auto* value = request();
    if (!value || session.contexts_.size() >= 32) {
      return RespondNow(Error("File context is unavailable"));
    }
    const auto* name = value->FindString("fileName");
    if (!name) name = value->FindString("name");
    const auto* type = value->FindString("mimeType");
    if (!type) type = value->FindString("type");
    const auto* data = value->FindString("bytesBase64");
    if (!data) data = value->FindString("dataBase64");
    const auto size = value->FindInt("size");
    if (!name || name->empty() || name->size() > 255 ||
        name->find('/') != std::string::npos ||
        name->find('\\') != std::string::npos || !type || type->size() > 255 ||
        (value->Find("size") && (!size || *size < 0 || *size > 32 * 1024 * 1024)) ||
        !data || data->size() > 45 * 1024 * 1024) {
      return RespondNow(Error("Invalid file context"));
    }
    std::string bytes;
    if (!base::Base64Decode(*data, &bytes) || bytes.size() > 32 * 1024 * 1024 ||
        (size && bytes.size() != static_cast<size_t>(*size)) ||
        session.context_bytes_ + bytes.size() > 64 * 1024 * 1024) {
      return RespondNow(Error("File content is invalid or too large"));
    }
    const auto token = base::Uuid::GenerateRandomV4().AsLowercaseString();
    base::DictValue summary;
    summary.Set("contextToken", token);
    summary.Set("kind", "file");
    summary.Set("name", *name);
    summary.Set("type", *type);
    summary.Set("size", static_cast<int>(bytes.size()));
    summary.Set("ok", true);
    summary.Set("state", "ready");
    session.context_bytes_ += bytes.size();
    session.contexts_.emplace(
        token, OmniboxSession::Context{summary.Clone(), std::move(bytes)});
    if (base::StartsWith(*type, "image/")) {
      session.thumbnail_ = token;
    }
    session.Emit("onFileContextAdded", summary.Clone());
    session.InputChanged();
    return RespondNow(WithArguments(std::move(summary)));
  }
  if (method == "deleteContext") {
    if (args().size() < 2 || !args()[1].is_string()) {
      return RespondNow(Error("Context token required"));
    }
    const auto context = session.contexts_.find(args()[1].GetString());
    if (context == session.contexts_.end()) {
      return RespondNow(Error("Attachment no longer exists"));
    }
    session.context_bytes_ -= context->second.bytes.size();
    session.contexts_.erase(context);
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "clearFiles") {
    if (args().size() != 2 || !args()[1].is_bool()) {
      return RespondNow(Error("Automatic-context flag required"));
    }
    std::erase_if(session.contexts_, [](const auto& context) {
      const auto* kind = context.second.summary.FindString("kind");
      return kind && *kind == "file";
    });
    session.context_bytes_ = 0;
    session.thumbnail_.clear();
    session.block_auto_tabs_ = args()[1].GetBool();
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "onThumbnailRemoved") {
    if (!session.thumbnail_.empty()) {
      const auto thumbnail = session.contexts_.find(session.thumbnail_);
      if (thumbnail != session.contexts_.end()) {
        session.context_bytes_ -= thumbnail->second.bytes.size();
        session.contexts_.erase(thumbnail);
      }
      session.thumbnail_.clear();
    }
    session.Emit("onThumbnailChanged");
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "setActiveToolMode" || method == "setActiveModelMode") {
    if (args().size() != 2 || !args()[1].is_string() ||
        args()[1].GetString().size() > 256) {
      return RespondNow(Error("Invalid mode"));
    }
    const auto& mode = args()[1].GetString();
    if (method == "setActiveToolMode") {
      if (!mode.empty() && mode != "image" && mode != "file" && mode != "tab") {
        return RespondNow(Error("Unknown tool mode"));
      }
      session.tool_mode_ = mode;
    } else {
      session.model_mode_ = mode;
    }
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "submitQuery") {
    const auto* value = request();
    const auto* text = value ? value->FindString("text") : nullptr;
    if (!text || text->empty() || text->size() > 8192) {
      return RespondNow(Error("Query text required"));
    }
    if (!session.model_mode_.empty()) {
      return RespondNow(
          Error("Agent input must be submitted through the authenticated "
                "session API"));
    }
    session.Query(*text);
    if (session.matches_.empty()) {
      return RespondNow(Error("No search target is available"));
    }
    base::DictValue selection;
    selection.Set("revision", session.revision_);
    selection.Set("index", 0);
    if (const auto* disposition = value->FindString("disposition")) {
      selection.Set("disposition", *disposition);
    }
    auto error = session.Open(selection);
    return RespondNow(error ? Error(*error) : NoArguments());
  }
  if (method == "notifySessionAbandoned") {
    session.Stop(true);
    return RespondNow(NoArguments());
  }
  if (method == "notifySessionStarted") {
    session.interaction_started_ = base::TimeTicks::Now();
    session.focused_ = true;
    session.InputChanged();
    return RespondNow(NoArguments());
  }
  if (method == "activateMetricsFunnel") {
    if (args().size() != 2 || !args()[1].is_string() ||
        args()[1].GetString().empty() || args()[1].GetString().size() > 128) {
      return RespondNow(Error("Invalid local interaction label"));
    }
    session.metrics_funnel_ = args()[1].GetString();
    return RespondNow(NoArguments());
  }
  if (method == "openLensSearch") {
    return RespondNow(Error("Visual search is unavailable in local mode"));
  }
  return RespondNow(Error("Unsupported Aux omnibox method"));
}
}  // namespace extensions
