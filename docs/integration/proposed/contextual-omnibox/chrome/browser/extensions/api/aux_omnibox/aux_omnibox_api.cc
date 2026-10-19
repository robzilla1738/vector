// Copyright 2026 Aux Authors. All rights reserved.
// Supplied extension boundary over Chromium's owned contextual search handler.
#include "chrome/browser/extensions/api/aux_omnibox/aux_omnibox_api.h"

#include <map>
#include <optional>
#include "base/base64.h"
#include "base/containers/span.h"
#include "base/memory/scoped_refptr.h"
#include "base/strings/string_util.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/bind_post_task.h"
#include "base/uuid.h"
#include "chrome/browser/extensions/api/aux_omnibox/owned_contextual_session.h"
#include "chrome/browser/extensions/api/aux_omnibox/provided_searchbox_page.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/tab_list/tab_list_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "components/tabs/public/tab_interface.h"
#include "chrome/browser/search_engines/template_url_service_factory.h"
#include "components/omnibox/common/input_state.h"
#include "components/search_engines/template_url.h"
#include "components/search_engines/template_url_service.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_event_histogram_value.h"
#include "mojo/public/cpp/bindings/remote.h"

namespace extensions {
namespace {
namespace native = searchbox::mojom;
constexpr char kExpired[] = "auxOmnibox session not found or not owned by this extension";
WindowOpenDisposition Disposition(const base::DictValue& request) {
  const auto* value = request.FindString("disposition");
  if (!value || *value == "currentTab") return WindowOpenDisposition::CURRENT_TAB;
  if (*value == "newForegroundTab") return WindowOpenDisposition::NEW_FOREGROUND_TAB;
  if (*value == "newBackgroundTab") return WindowOpenDisposition::NEW_BACKGROUND_TAB;
  if (*value == "newWindow") return WindowOpenDisposition::NEW_WINDOW;
  if (*value == "switchToTab") return WindowOpenDisposition::SWITCH_TO_TAB;
  if (*value == "saveToDisk") return WindowOpenDisposition::SAVE_TO_DISK;
  return WindowOpenDisposition::UNKNOWN;
}
std::optional<native::SelectionLineState> SelectionState(const std::string& value) {
  if (value == "normal") return native::SelectionLineState::kNormal;
  if (value == "keywordMode") return native::SelectionLineState::kKeywordMode;
  if (value == "focusedButtonAction") return native::SelectionLineState::kFocusedButtonAction;
  if (value == "focusedButtonRemoveSuggestion") return native::SelectionLineState::kFocusedButtonRemoveSuggestion;
  if (value == "focusedButtonAim") return native::SelectionLineState::kFocusedButtonAim;
  if (value == "ctrlEnter") return native::SelectionLineState::kCtrlEnter;
  // The supplied IDL does not issue the newer native voice/Lens selection states.
  return std::nullopt;
}
native::ActionModifiersPtr Modifiers(const base::DictValue& request) {
  auto value = native::ActionModifiers::New();
  const auto* nested = request.FindDict("modifiers");
  const auto& source = nested ? *nested : request;
  value->alt_key = source.FindBool("altKey").value_or(false);
  value->ctrl_key = source.FindBool("ctrlKey").value_or(false);
  value->meta_key = source.FindBool("metaKey").value_or(false);
  value->shift_key = source.FindBool("shiftKey").value_or(false);
  return value;
}
std::optional<int32_t> NativeTabHandle(Profile* profile, int extension_tab_id) {
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    if (browser->GetProfile() != profile) continue;
    auto* tabs = TabListInterface::From(browser);
    if (!tabs) continue;
    for (auto* tab : tabs->GetAllTabs()) {
      auto* contents = tab->GetContents();
      if (contents && contents->GetBrowserContext() == profile &&
          ExtensionTabUtil::GetTabId(contents) == extension_tab_id)
        return tab->GetHandle().raw_value();
    }
  }
  return std::nullopt;
}
class OmniboxSession {
 public:
  OmniboxSession(content::WebContents* owner, std::string extension)
      : id_(base::Uuid::GenerateRandomV4().AsLowercaseString()),
        owner_(owner->GetWeakPtr()), extension_(std::move(extension)),
        frame_(owner->GetPrimaryMainFrame()->GetGlobalId()),
        page_(Profile::FromBrowserContext(owner->GetBrowserContext()),
              base::BindRepeating(&OmniboxSession::Emit, base::Unretained(this))) {
    backend_ = OwnedContextualSession::Create(owner,
        commands_.BindNewPipeAndPassReceiver(), page_.Bind(),
        base::BindOnce(&OmniboxSession::Invalidated, base::Unretained(this)),
        base::BindRepeating(&OmniboxSession::KeywordChanged, base::Unretained(this)));
  }
  ~OmniboxSession() {
    // No extension events or pending callbacks may escape document teardown.
    destroying_ = true;
    page_.Close();
    backend_.reset();
    commands_.reset();
  }
  bool Owns(content::WebContents* owner, std::string_view extension) const {
    return owner_ && owner_.get() == owner && extension_ == extension &&
        owner->GetPrimaryMainFrame() &&
        owner->GetPrimaryMainFrame()->GetGlobalId() == frame_ &&
        backend_ && backend_->IsCurrentDocument();
  }
  void Emit(std::string name, base::DictValue payload = {}, bool has_payload = true) {
    if (!owner_ || !owner_->GetPrimaryMainFrame() ||
        owner_->GetPrimaryMainFrame()->GetGlobalId() != frame_) return;
    auto* profile = Profile::FromBrowserContext(owner_->GetBrowserContext());
    base::ListValue args; args.Append(id_);
    if (has_payload) args.Append(std::move(payload));
    auto event = std::make_unique<Event>(events::AUXOMNIBOX_EVENT,
        "auxOmnibox." + name, std::move(args), profile);
    event->restrict_to_dispatch_target = Event::DispatchTarget{
        owner_->GetPrimaryMainFrame()->GetProcess()->GetID()};
    event->will_dispatch_callback = base::BindRepeating(
        [](content::BrowserContext* expected, content::BrowserContext* actual,
           mojom::ContextType, const Extension*, const base::DictValue*,
           std::optional<base::ListValue>&, mojom::EventFilteringInfoPtr&, bool*) {
          return expected == actual;
        }, base::Unretained(owner_->GetBrowserContext()));
    EventRouter::Get(profile)->DispatchEventToExtension(extension_, std::move(event));
  }
  void KeywordChanged(bool selected, const std::u16string& keyword,
                      const std::u16string& placeholder) {
    if (destroying_ || !backend_ || !backend_->IsCurrentDocument()) return;
    Emit("onKeywordSelectedChanged", base::DictValue()
        .Set("isKeywordSelected", selected).Set("keyword", base::UTF16ToUTF8(keyword))
        .Set("keywordPlaceholder", base::UTF16ToUTF8(placeholder)));
  }
  void Invalidated() {
    if (!destroying_)
      Emit("onSessionInvalidated", base::DictValue().Set("reason", "tabDestroyed"));
    page_.Close();
    commands_.reset();
  }
  native::OmniboxPopupSelectionPtr Selection(const base::DictValue& request) const {
    const auto* nested = request.FindDict("selection");
    const auto& source = nested ? *nested : request;
    const auto line = source.FindInt("line");
    const auto index = source.FindInt("index");
    if ((line && index && *line != *index) ||
        (source.Find("line") && !line) || (source.Find("index") && !index)) return nullptr;
    const int row = line.value_or(index.value_or(-1));
    const auto* matches = page_.result().FindList("matches");
    if (!matches || row < 0 || row > 255 || static_cast<size_t>(row) >= matches->size()) return nullptr;
    if (const auto* url = request.FindString("url"); url &&
        GURL(*url) != GURL(*(*matches)[row].GetDict().FindString("destinationUrl"))) return nullptr;
    if (request.Find("url") && !request.FindString("url")) return nullptr;
    const auto* state = source.FindString("state");
    if ((source.Find("state") && !state) ||
        (source.Find("actionIndex") && !source.FindInt("actionIndex"))) return nullptr;
    const auto parsed = state ? SelectionState(*state) : native::SelectionLineState::kNormal;
    const auto action = source.FindInt("actionIndex").value_or(0);
    if (!parsed || action < 0 || action > 255) return nullptr;
    auto selection = native::OmniboxPopupSelection::New();
    selection->line = row; selection->state = *parsed; selection->action_index = action;
    if (selection->state == native::SelectionLineState::kFocusedButtonAction) {
      const auto* actions = (*matches)[row].GetDict().FindList("actions");
      if (!actions || static_cast<size_t>(action) >= actions->size()) return nullptr;
    }
    return selection;
  }
  GURL Url(uint8_t line) const {
    const auto* matches = page_.result().FindList("matches");
    return matches && line < matches->size()
        ? GURL(*(*matches)[line].GetDict().FindString("destinationUrl")) : GURL();
  }
  std::string id_, initial_text_;
  base::WeakPtr<content::WebContents> owner_;
  std::string extension_;
  content::GlobalRenderFrameHostId frame_;
  native::ProvidedSearchboxPage page_;
  mojo::Remote<native::PageHandler> commands_;
  std::unique_ptr<OwnedContextualSession> backend_;
  bool destroying_ = false;
};
class OmniboxOwnerState : public content::WebContentsUserData<OmniboxOwnerState>,
                          public content::WebContentsObserver {
 public:
  ~OmniboxOwnerState() override = default;
  std::map<std::string, std::unique_ptr<OmniboxSession>> sessions;
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    if (navigation->HasCommitted() && navigation->IsInPrimaryMainFrame() &&
        !navigation->IsSameDocument()) sessions.clear();
  }
 private:
  friend class content::WebContentsUserData<OmniboxOwnerState>;
  explicit OmniboxOwnerState(content::WebContents* owner)
      : content::WebContentsUserData<OmniboxOwnerState>(*owner),
        content::WebContentsObserver(owner) {}
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(OmniboxOwnerState);
bool Owns(base::WeakPtr<content::WebContents> owner, const std::string& id,
          const std::string& extension) {
  if (!owner) return false;
  auto* state = OmniboxOwnerState::FromWebContents(owner.get());
  if (!state) return false;
  auto found = state->sessions.find(id);
  return found != state->sessions.end() && found->second->Owns(owner.get(), extension);
}
base::DictValue SearchEngines(Profile* profile) {
  auto* service = TemplateURLServiceFactory::GetForProfile(profile); service->Load();
  base::DictValue result; base::ListValue engines;
  const auto* current = service->GetDefaultSearchProvider();
  for (const auto& engine : service->GetTemplateURLs()) {
    if (!engine->SupportsReplacement(service->search_terms_data())) continue;
    engines.Append(base::DictValue().Set("id", base::NumberToString(engine->id()))
        .Set("name", base::UTF16ToUTF8(engine->short_name()))
        .Set("keyword", base::UTF16ToUTF8(engine->keyword())).Set("isDefault", engine == current));
  }
  result.Set("engines", std::move(engines));
  if (current) result.Set("defaultEngineId", base::NumberToString(current->id()));
  return result;
}
}  // namespace

ExtensionFunction::ResponseAction AuxOmniboxFunction::RunAux() {
  const std::string_view method = std::string_view(name()).substr(11);
  if (method == "getSearchEngines") {
    if (!args().empty()) return RespondNow(Error("No arguments expected"));
    return RespondNow(WithArguments(SearchEngines(profile())));
  }
  auto* owner = GetSenderWebContents();
  if (!owner || owner->GetBrowserContext() != profile() || !owner->GetPrimaryMainFrame())
    return RespondNow(Error("An active extension page is required"));
  OmniboxOwnerState::CreateForWebContents(owner);
  auto* state = OmniboxOwnerState::FromWebContents(owner);
  if (method == "createSession") {
    if (args().size() > 1 || (!args().empty() && !args()[0].is_dict()))
      return RespondNow(Error("Invalid session options"));
    if (state->sessions.size() >= 16) return RespondNow(Error("Too many active search sessions"));
    auto session = std::make_unique<OmniboxSession>(owner, extension_id());
    if (!session->backend_) return RespondNow(Error("Native search handler is unavailable"));
    if (!args().empty()) {
      const auto* initial = args()[0].GetDict().FindString("initialText");
      if (initial) {
        if (initial->size() > 8192) return RespondNow(Error("Input is too long"));
        session->initial_text_ = *initial;
      }
    }
    std::string id = session->id_;
    state->sessions.emplace(id, std::move(session));
    return RespondNow(WithArguments(base::DictValue().Set("sessionId", id)));
  }
  if (args().empty() || !args()[0].is_string()) return RespondNow(Error("Session identity is required"));
  auto found = state->sessions.find(args()[0].GetString());
  if (found == state->sessions.end() || !found->second->Owns(owner, extension_id()))
    return RespondNow(Error(kExpired));
  auto& session = *found->second;
  auto* commands = session.backend_->commands();
  const auto* request = args().size() > 1 ? args()[1].GetIfDict() : nullptr;
  if (method == "destroySession") { state->sessions.erase(found); return RespondNow(NoArguments()); }
  auto reply = base::BindOnce(
      [self = base::WrapRefCounted(this), weak = owner->GetWeakPtr(),
       id = session.id_, extension = extension_id()]
      (std::optional<base::DictValue> value, std::optional<std::string> error) {
        if (!Owns(weak, id, extension)) self->Respond(self->Error(kExpired));
        else if (error) self->Respond(self->Error(*error));
        else if (value) self->Respond(self->WithArguments(std::move(*value)));
        else self->Respond(self->NoArguments());
      });
  auto guarded = [](decltype(reply) callback) {
    return mojo::WrapCallbackWithDefaultInvokeIfNotRun(
        base::BindPostTaskToCurrentDefault(std::move(callback)), std::nullopt,
        std::optional<std::string>("Native operation was cancelled"));
  };
  if (method == "getInputState") {
    commands->GetInputState(base::BindPostTaskToCurrentDefault(base::BindOnce(
        [](decltype(reply) reply, const std::optional<omnibox::InputState>& value) {
          base::DictValue result; result.Set("available", value.has_value());
          if (value) result.Set("state", native::ProvidedInputState(*value));
          std::move(reply).Run(std::move(result), std::nullopt);
        }, guarded(std::move(reply)))));
    return RespondLater();
  }
  if (method == "onFocusChanged") {
    if (args().size() != 2 || !args()[1].is_bool()) return RespondNow(Error("Focus state required"));
    commands->OnFocusChanged(args()[1].GetBool()); return RespondNow(NoArguments());
  }
  if (method == "queryAutocomplete") {
    if (args().size() < 2 || args().size() > 3 || !args()[1].is_string() ||
        args()[1].GetString().size() > 8192 || (args().size() == 3 && !args()[2].is_dict()))
      return RespondNow(Error("Invalid autocomplete query"));
    const auto input = base::UTF8ToUTF16(args()[1].GetString());
    const base::DictValue empty;
    const auto& options = args().size() == 3 ? args()[2].GetDict() : empty;
    const auto* keyword = options.FindString("keyword");
    const int cursor = options.FindInt("cursorPosition").value_or(input.size());
    const bool ok = cursor >= 0 && session.backend_->Query(input,
        options.FindBool("preventInlineAutocomplete").value_or(false), cursor,
        keyword ? *keyword : std::string(), options.FindBool("zeroPrefix").value_or(false));
    return RespondNow(ok ? NoArguments() : Error("Invalid native autocomplete input"));
  }
  if (method == "stopAutocomplete") {
    if (args().size() != 2 || !args()[1].is_bool()) return RespondNow(Error("Clear-result flag required"));
    session.backend_->StopAutocomplete(args()[1].GetBool()); return RespondNow(NoArguments());
  }
  if (method == "openAutocompleteMatch" || method == "setPopupSelection" ||
      method == "openPopupSelection" || method == "executeAction" ||
      method == "deleteAutocompleteMatch" || method == "onNavigationLikely" ||
      method == "activateKeyword") {
    auto selection = request ? session.Selection(*request) : nullptr;
    if (!selection) return RespondNow(Error("Invalid arguments"));
    uint32_t sequence = session.page_.sequence_id();
    if (const auto* supplied = request->Find("resultSequenceId")) {
      if (supplied->is_int() && supplied->GetInt() >= 0)
        sequence = supplied->GetInt();
      else if (!supplied->is_string() ||
               !base::StringToUint(supplied->GetString(), &sequence))
        return RespondNow(Error("Invalid arguments"));
    }
    if (sequence != session.page_.sequence_id() && method != "openAutocompleteMatch" &&
        method != "executeAction") return RespondNow(Error("Selection is stale or unavailable"));
    const GURL url = session.Url(selection->line);
    const auto modifiers = Modifiers(*request);
    const int mouse = request->FindInt("mouseButton").value_or(0);
    if (mouse < 0 || mouse > 2) return RespondNow(Error("Invalid mouse button"));
    if (method == "setPopupSelection") commands->SetPopupSelection(std::move(selection));
    else if (method == "openPopupSelection") {
      const auto disposition = Disposition(*request);
      if (disposition == WindowOpenDisposition::UNKNOWN) return RespondNow(Error("Unknown navigation disposition"));
      commands->SetPopupSelection(selection.Clone());
      commands->OpenPopupSelection(sequence, std::move(selection), disposition);
    } else if (method == "openAutocompleteMatch") {
      if (!session.backend_->OpenMatch(sequence, selection->line, url,
          request->FindBool("areMatchesShowing").value_or(true), mouse,
          modifiers.Clone(), request->FindBool("viaKeyboard").value_or(false)))
        return RespondNow(Error("Selection is stale or unavailable"));
    } else if (method == "executeAction") {
      if (!session.backend_->ExecuteAction(sequence, selection->line,
          selection->action_index, url, mouse, *modifiers))
        return RespondNow(Error("Native action is stale or unavailable"));
    } else if (method == "deleteAutocompleteMatch") commands->DeleteAutocompleteMatch(selection->line, url);
    else if (method == "onNavigationLikely") commands->OnNavigationLikely(selection->line, url,
        omnibox::mojom::NavigationPredictor::kMouseDown);
    else {
      commands->ActivateKeyword(selection->line, url, base::TimeTicks::Now(),
          request->FindBool("isMouseEvent").value_or(true));
    }
    return RespondNow(NoArguments());
  }
  if (method == "getRecentTabs") {
    commands->GetRecentTabs(base::BindPostTaskToCurrentDefault(base::BindOnce(
        [](decltype(reply) reply, base::WeakPtr<content::WebContents> owner, std::vector<native::TabInfoPtr> tabs) {
          base::ListValue values;
          for (const auto& tab : tabs) if (owner) values.Append(native::ProvidedTab(
              Profile::FromBrowserContext(owner->GetBrowserContext()), *tab));
          std::move(reply).Run(base::DictValue().Set("tabs", std::move(values)), std::nullopt);
        }, guarded(std::move(reply)), owner->GetWeakPtr())));
    return RespondLater();
  }
  if (method == "getTabPreview") {
    if (args().size() != 2 || !args()[1].is_int()) return RespondNow(Error("Native tab identity required"));
    const auto tab = NativeTabHandle(profile(), args()[1].GetInt());
    if (!tab) return RespondNow(Error("Invalid tabId"));
    if (!session.backend_->CanUseTabContext(*tab))
      return RespondNow(Error("Native tab context capture is unavailable for this tab"));
    commands->GetTabPreview(*tab, base::BindPostTaskToCurrentDefault(base::BindOnce(
        [](decltype(reply) reply, const std::optional<std::string>& preview) {
          base::DictValue result; result.Set("hasPreview", preview.has_value());
          if (preview) result.Set("previewDataUrl", *preview);
          std::move(reply).Run(std::move(result), std::nullopt);
        }, guarded(std::move(reply)))));
    return RespondLater();
  }
  if (method == "addFileContext" || method == "addTabContext") {
    auto callback = base::BindPostTaskToCurrentDefault(base::BindOnce([](decltype(reply) reply,
        OwnedContextualSession::ContextResult result) {
      if (result) std::move(reply).Run(base::DictValue().Set("ok", true)
          .Set("contextToken", result->ToString()), std::nullopt);
      else std::move(reply).Run(base::DictValue().Set("ok", false)
          .Set("errorType", native::ProvidedUploadError(result.error())), std::nullopt);
    }, std::move(reply)));
    if (method == "addTabContext") {
      if (args().size() < 2 || !args()[1].is_int() ||
          (args().size() == 3 && !args()[2].is_bool())) return RespondNow(Error("Native tab identity required"));
      const auto tab = NativeTabHandle(profile(), args()[1].GetInt());
      if (!tab) return RespondNow(Error("Invalid tabId"));
      session.backend_->AddTabContext(*tab, args().size() == 3 && args()[2].GetBool(), std::move(callback));
    } else {
      if (!request) return RespondNow(Error("File context required"));
      const auto* name = request->FindString("fileName");
      const auto* mime = request->FindString("mimeType");
      const auto* encoded = request->FindString("bytesBase64");
      std::string bytes;
      if (!name || !mime || !encoded || encoded->size() > 45 * 1024 * 1024 ||
          !base::Base64Decode(*encoded, &bytes) || bytes.size() > 32 * 1024 * 1024)
        return RespondNow(Error("Invalid or oversized file context"));
      auto info = native::SelectedFileInfo::New();
      info->file_name = *name; info->mime_type = *mime;
      info->is_deletable = request->FindBool("isDeletable").value_or(true);
      if (const auto* preview = request->FindString("imageDataUrl"); preview && preview->size() <= 45 * 1024 * 1024)
        info->image_data_url = *preview;
      const auto selected = request->FindDouble("selectionTimeMs");
      info->selection_time = selected ? base::Time::FromMillisecondsSinceUnixEpoch(*selected) : base::Time::Now();
      session.backend_->AddFileContext(std::move(info),
          mojo_base::BigBuffer(base::as_byte_span(bytes)), std::move(callback));
    }
    return RespondLater();
  }
  if (method == "deleteContext") {
    if (args().size() < 2 || !args()[1].is_string() ||
        (args().size() == 3 && !args()[2].is_bool())) return RespondNow(Error("Context token required"));
    auto token = base::UnguessableToken::DeserializeFromString(args()[1].GetString());
    if (!token) return RespondNow(Error("Invalid native context token"));
    session.backend_->DeleteContext(*token, args().size() == 3 && args()[2].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "clearFiles") {
    if (args().size() != 2 || !args()[1].is_bool()) return RespondNow(Error("Automatic-context flag required"));
    session.backend_->ClearFiles(args()[1].GetBool()); return RespondNow(NoArguments());
  }
  if (method == "onThumbnailRemoved") {
    // Exact original Run0x4285900: owned-session notification acknowledgement,
    // with no native model/context actuation or synthesized thumbnail event.
    return RespondNow(NoArguments());
  }
  if (method == "notifySessionStarted") { session.backend_->NotifySessionStarted(); return RespondNow(NoArguments()); }
  if (method == "notifySessionAbandoned") { session.backend_->NotifySessionAbandoned(); return RespondNow(NoArguments()); }
  if (method == "openLensSearch") {
    auto error = session.backend_->OpenLensSearch();
    return RespondNow(error ? Error(*error) : NoArguments());
  }
  if (method == "activateMetricsFunnel") {
    if (args().size() != 2 || !args()[1].is_string() || args()[1].GetString().size() > 128)
      return RespondNow(Error("Metrics funnel required"));
    commands->ActivateMetricsFunnel(args()[1].GetString()); return RespondNow(NoArguments());
  }
  if (method == "setActiveToolMode" || method == "setActiveModelMode") {
    if (args().size() != 2 || !args()[1].is_string() || args()[1].GetString().size() > 128)
      return RespondNow(Error("Native mode required"));
    std::string name;
    for (char c : args()[1].GetString()) {
      if (base::IsAsciiUpper(c)) name += '_';
      name += base::ToUpperASCII(c);
    }
    if (method == "setActiveToolMode") {
      omnibox::ToolMode mode;
      if (!omnibox::ToolMode_Parse("TOOL_MODE_" + name, &mode) || static_cast<int>(mode) > 10) return RespondNow(Error("Unknown native tool mode"));
      commands->SetActiveToolMode(mode, false);
    } else {
      omnibox::ModelMode mode;
      if (!omnibox::ModelMode_Parse("MODEL_MODE_" + name, &mode) || static_cast<int>(mode) > 4) return RespondNow(Error("Unknown native model mode"));
      commands->SetActiveModelMode(mode, false);
    }
    return RespondNow(NoArguments());
  }
  if (method == "submitQuery") {
    const auto* text = request ? request->FindString("text") : nullptr;
    if (!text || text->empty() || text->size() > 8192) return RespondNow(Error("Query text required"));
    auto modifiers = Modifiers(*request);
    const int mouse = request->FindInt("mouseButton").value_or(0);
    if (mouse < 0 || mouse > 2) return RespondNow(Error("Invalid mouse button"));
    commands->SubmitQuery(*text, mouse, modifiers->alt_key, modifiers->ctrl_key,
        modifiers->meta_key, modifiers->shift_key, request->FindBool("isVoiceSearch").value_or(false));
    return RespondNow(NoArguments());
  }
  if (method == "getPlaceholderConfig") {
    commands->GetCyclingPlaceholderConfig(base::BindPostTaskToCurrentDefault(base::BindOnce(
        [](decltype(reply) reply, native::PlaceholderConfigPtr config) {
          base::ListValue texts; for (const auto& text : config->texts) texts.Append(base::UTF16ToUTF8(text));
          std::move(reply).Run(base::DictValue().Set("texts", std::move(texts))
              .Set("changeTextAnimationIntervalMs", config->change_text_animation_interval.InMillisecondsF())
              .Set("fadeTextAnimationDurationMs", config->fade_text_animation_duration.InMillisecondsF()), std::nullopt);
        }, guarded(std::move(reply)))));
    return RespondLater();
  }
  return RespondNow(Error("Unsupported Aux omnibox method"));
}
}  // namespace extensions
