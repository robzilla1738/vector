// Copyright 2026 Aux Authors. All rights reserved.
// Platform adaptation of Chromium155's Realbox/shared contextual search flow.
#include "chrome/browser/extensions/api/aux_omnibox/owned_contextual_session.h"

#include <algorithm>
#include <limits>
#include <tuple>
#include <utility>
#include <vector>

#include "base/feature_list.h"
#include "base/numerics/safe_conversions.h"
#include "base/functional/bind.h"
#include "base/scoped_observation.h"
#include "components/omnibox/browser/contextual_search_provider.h"
#include "base/task/bind_post_task.h"
#include "components/omnibox/browser/autocomplete_match.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "chrome/browser/autocomplete/chrome_autocomplete_provider_client.h"
#include "chrome/browser/contextual_search/contextual_search_service_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/omnibox/omnibox_controller.h"
#include "chrome/browser/ui/contextual_search/tab_contextualization_controller.h"
#include "components/tabs/public/tab_interface.h"
#include "chrome/browser/ui/omnibox/omnibox_edit_model.h"
#include "chrome/browser/ui/omnibox/omnibox_view.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/ui/webui/cr_components/searchbox/contextual_searchbox_handler.h"
#include "chrome/browser/ui/webui/new_tab_page/composebox/variations/composebox_fieldtrial.h"
#include "components/contextual_search/contextual_search_service.h"
#include "components/contextual_search/contextual_search_session_handle.h"
#include "components/lens/lens_overlay_invocation_source.h"
#include "components/omnibox/browser/autocomplete_controller.h"
#include "components/omnibox/common/omnibox_features.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"

namespace extensions {
namespace {
// A native model view whose presentation remains the supplied renderer. Native
// edit-model operations have real text/selection state and emit the original
// input-text event; there is no second textfield or visible browser omnibox.
class ExtensionOmniboxView final : public OmniboxView {
 public:
  using TextChangedCallback = base::RepeatingCallback<void(const std::u16string&)>;
  ExtensionOmniboxView(OmniboxController* controller,
                       content::WebContents* owner, TextChangedCallback changed)
      : OmniboxView(controller), owner_(owner->GetWeakPtr()), changed_(std::move(changed)) {
    before_ = GetState();
  }
  void SyncRendererInput(const std::u16string& text, size_t cursor) {
    text_ = text;
    inline_.clear();
    selection_ = gfx::Range(std::min(cursor, text_.size()));
    before_ = GetState();
  }
  void Update() override {
    auto* model = controller()->edit_model();
    const auto text = model->user_input_in_progress()
        ? model->user_text() : controller()->client()->GetURLForDisplay();
    SetWindowTextAndCaretPos(text, text.size(), false, false);
  }
  std::u16string GetText() const override { return text_; }
  void SetWindowTextAndCaretPos(const std::u16string& text, size_t caret,
                                bool update_popup, bool notify) override {
    const bool changed = text_ != text;
    text_ = text;
    inline_.clear();
    additional_.clear();
    SetCaretPos(caret);
    if (changed) changed_.Run(text_);
    if (notify) TextChanged();
    if (update_popup) UpdatePopup();
  }
  void SetCaretPos(size_t caret) override {
    selection_ = gfx::Range(std::min(caret, text_.size()));
  }
  void SetAdditionalText(const std::u16string& text) override { additional_ = text; }
  void EnterKeywordModeForDefaultSearchProvider() override {
    controller()->edit_model()->EnterKeywordModeForDefaultSearchProvider(
        metrics::OmniboxEventProto::KEYBOARD_SHORTCUT);
  }
  bool IsSelectAll() const override {
    return !text_.empty() && selection_.GetMin() == 0 &&
        selection_.GetMax() == text_.size();
  }
  gfx::Range GetSelectionBounds() const override { return selection_; }
  void SetSelectionBounds(gfx::Range selection) override {
    if (!selection.IsValid()) return;
    selection_ = gfx::Range(std::min<size_t>(selection.start(), text_.size()),
        std::min<size_t>(selection.end(), text_.size()));
  }
  bool HasSelection() const override { return !selection_.is_empty(); }
  void SelectAll(bool reversed) override {
    selection_ = reversed ? gfx::Range(text_.size(), 0) : gfx::Range(0, text_.size());
  }
  void UpdatePopup() override {
    // Same edit-model entry as OmniboxViewViews, with renderer-provided caret.
    controller()->edit_model()->UpdateInput(selection_.GetMax() != text_.size());
  }
  void SetFocus(bool is_user_initiated) override {
    if (owner_) owner_->Focus();
    if (!controller()->edit_model()->has_focus())
      controller()->edit_model()->OnSetFocus(false);
  }
  bool AimButtonVisible() const override { return aim_visible_; }
  void SetAimButtonVisible(bool visible) { aim_visible_ = visible; }
  void ApplyFocusRingToAimButton(bool focused) override { aim_focused_ = focused; }
  void ApplyCaretVisibility() override {
    // The supplied HTML input paints its own caret (as full WebUI omnibox does).
    caret_visible_ = controller()->edit_model()->is_caret_visible();
  }
  void OnTemporaryTextMaybeChanged(const std::u16string& text,
      const AutocompleteMatch& match, bool save_selection, bool notify) override {
    if (save_selection) original_selection_ = selection_;
    SetWindowTextAndCaretPos(text, text.size(), false, notify);
  }
  void OnInlineAutocompleteTextMaybeChanged(const std::u16string& user,
      const std::u16string& suffix) override {
    const auto text = user + suffix;
    const bool changed = text_ != text;
    text_ = text;
    inline_ = suffix;
    selection_ = gfx::Range(user.size(), text_.size());
    if (changed) changed_.Run(text_);
  }
  void OnInlineAutocompleteTextCleared() override {
    if (inline_.empty()) return;
    if (text_.size() >= inline_.size() &&
        text_.compare(text_.size() - inline_.size(), inline_.size(), inline_) == 0) {
      text_.resize(text_.size() - inline_.size());
      SetCaretPos(text_.size());
      changed_.Run(text_);
    }
    inline_.clear();
  }
  void OnRevertTemporaryText(const std::u16string& text,
                            const AutocompleteMatch& match) override {
    SetWindowTextAndCaretPos(text, text.size(), false, false);
    SetSelectionBounds(original_selection_);
  }
  void OnBeforePossibleChange() override { before_ = GetState(); }
  bool OnAfterPossibleChange(bool allow_keyword_ui_change) override {
    const State after = GetState();
    const StateChanges changes = GetStateChanges(before_, after);
    const bool changed = controller()->edit_model()->OnAfterPossibleChange(
        changes, allow_keyword_ui_change);
    if (changed && (changes.text_differs || changes.keyword_differs)) TextChanged();
    else if (changes.selection_differs) EmphasizeURLComponents();
    return changed;
  }
 protected:
  int GetOmniboxTextLength() const override {
    return base::checked_cast<int>(text_.size());
  }
  void EmphasizeURLComponents() override {
    emphasis_.clear();
    UpdateTextStyle(text_, controller()->edit_model()->CurrentTextIsURL(),
                    controller()->client()->GetSchemeClassifier());
  }
  void SetEmphasis(bool emphasize, const gfx::Range& range) override {
    emphasis_.emplace_back(range, emphasize);
  }
  void UpdateSchemeStyle(const gfx::Range& range) override { scheme_range_ = range; }
 private:
  base::WeakPtr<content::WebContents> owner_;
  TextChangedCallback changed_;
  std::u16string text_, inline_, additional_;
  gfx::Range selection_{0}, original_selection_{0}, scheme_range_;
  State before_{};
  // Native style state is retained; supplied HTML/CSS owns actual painting.
  std::vector<std::pair<gfx::Range, bool>> emphasis_;
  bool aim_visible_ = false, aim_focused_ = false, caret_visible_ = true;
};

class OwnedContextualClient final : public ContextualOmniboxClient {
 public:
  OwnedContextualClient(Profile* profile, content::WebContents* owner)
      : ContextualOmniboxClient(profile, owner), owner_(owner->GetWeakPtr()) {}

  metrics::OmniboxEventProto::PageClassification GetPageClassification(
      bool is_prefetch) const override {
    return metrics::OmniboxEventProto::NTP_REALBOX;
  }

  std::unique_ptr<AutocompleteProviderClient> CreateAutocompleteProviderClient()
      override {
    // Realbox's default client lacks a WebContents getter. Lens entry points
    // need the actual owning tab, not the active tab in another browser window.
    return std::make_unique<ChromeAutocompleteProviderClient>(
        profile_, base::BindRepeating(
                      [](base::WeakPtr<content::WebContents> owner) {
                        return owner.get();
                      },
                      owner_));
  }

 private:
  base::WeakPtr<content::WebContents> owner_;
};
}  // namespace

class OwnedContextualHandler final : public ContextualSearchboxHandler,
                                     public OmniboxEditModel::Observer {
 public:
  OwnedContextualHandler(
      mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
      mojo::PendingRemote<searchbox::mojom::Page> events,
      Profile* profile,
      content::WebContents* owner,
      GetSessionHandleCallback get_context,
      base::RepeatingCallback<std::optional<std::string>()> open_lens,
      OwnedContextualSession::KeywordCallback keyword_changed)
      : ContextualSearchboxHandler(
            std::move(commands), std::move(events), profile, owner,
            std::make_unique<OwnedContextualClient>(profile, owner),
            std::move(get_context)),
        open_lens_(std::move(open_lens)),
        keyword_changed_(std::move(keyword_changed)) {
    // The supplied native implementation calls OmniboxEditModel. Preserve that
    // owned model even when the newer upstream model-less experiment is on.
    // No feature flag is changed globally and the visible omnibox is untouched.
    if (!owned_controller_) {
      autocomplete_controller_.reset();
      owned_controller_ =
          std::make_unique<OmniboxController>(std::move(client_));
      controller_ = owned_controller_.get();
    }
    static_cast<ContextualOmniboxClient*>(client())->SetSuggestInputsCallback(
        base::BindRepeating(&OwnedContextualHandler::GetSuggestInputs,
                            base::Unretained(this)));
    model_view_ = std::make_unique<ExtensionOmniboxView>(owned_controller_.get(),
        owner, base::BindRepeating(
            [](OwnedContextualHandler* handler, const std::u16string& text) {
              handler->page_->SetInputText(base::UTF16ToUTF8(text));
            }, base::Unretained(this)));
    owned_controller_->SetView(model_view_.get());
    autocomplete_controller_observation_.Observe(autocomplete_controller());
    edit_model_observation_.Observe(edit_model());
  }
  ~OwnedContextualHandler() override {
    edit_model_observation_.Reset();
    autocomplete_controller_observation_.Reset();
    autocomplete_controller()->RemoveObserver(owned_controller_.get());
    owned_controller_->SetView(nullptr);
    model_view_.reset();
  }
  void QueryAutocomplete(int32_t query_id, std::optional<int32_t> tab_id,
      const std::u16string& input, bool prevent_inline_autocomplete,
      uint32_t cursor_position, omnibox::SuggestInventory inventory,
      bool on_focus, const std::string& keyword,
      searchbox::mojom::InputMethod method) override {
    model_view_->SyncRendererInput(input, cursor_position);
    ContextualSearchboxHandler::QueryAutocomplete(query_id, tab_id, input,
        prevent_inline_autocomplete, cursor_position, inventory, on_focus,
        keyword, method);
    PublishKeywordState();
  }
  void SetAimButtonVisible(bool visible) override {
    model_view_->SetAimButtonVisible(visible);
    page_->SetAimButtonVisible(visible);
  }

  // Port of WebuiOmniboxHandler::ActivateKeyword, applied to this owned model.
  void ActivateKeyword(uint8_t line, const GURL& url,
                       base::TimeTicks timestamp, bool is_mouse_event) override {
    if (!GetMatchWithUrl(line, url)) return;
    edit_model()->SetPopupSelection(OmniboxPopupSelection(
        line, OmniboxPopupSelection::KEYWORD_MODE));
    if (edit_model()->is_keyword_hint()) {
      edit_model()->AcceptKeyword(is_mouse_event
          ? metrics::OmniboxEventProto::CLICK_HINT_VIEW
          : metrics::OmniboxEventProto::TAP_HINT_VIEW);
    }
    PublishKeywordState();
  }
  void OnSelectionChanged(OmniboxPopupSelection old_selection,
                          OmniboxPopupSelection selection) override {
    auto convert = [](OmniboxPopupSelection::LineState state)
        -> std::optional<searchbox::mojom::SelectionLineState> {
      using State = searchbox::mojom::SelectionLineState;
      switch (state) {
        case OmniboxPopupSelection::NORMAL: return State::kNormal;
        case OmniboxPopupSelection::KEYWORD_MODE: return State::kKeywordMode;
        case OmniboxPopupSelection::FOCUSED_BUTTON_ACTION: return State::kFocusedButtonAction;
        case OmniboxPopupSelection::FOCUSED_BUTTON_AIM: return State::kFocusedButtonAim;
        case OmniboxPopupSelection::FOCUSED_BUTTON_REMOVE_SUGGESTION: return State::kFocusedButtonRemoveSuggestion;
        case OmniboxPopupSelection::CTRL_ENTER: return State::kCtrlEnter;
        default: return std::nullopt;
      }
    };
    const auto old_state = convert(old_selection.state);
    const auto state = convert(selection.state);
    if (!old_state || !state) return;
    page_->UpdateSelection(searchbox::mojom::OmniboxPopupSelection::New(
        old_selection.line, *old_state, old_selection.action_index),
        searchbox::mojom::OmniboxPopupSelection::New(
        selection.line, *state, selection.action_index));
  }
  // The shared WebUI handler likewise has no view redraw/character timing work
  // for these observer callbacks without a MetricsReporter/native popup view.
  void OnMatchIconUpdated(size_t index) override {
    SearchboxHandler::OnResultChanged(autocomplete_controller(), false);
  }
  void OnContentsChanged() override { PublishKeywordState(); }
  void OnCharTyped(base::TimeTicks timestamp) override {
    if (metrics_tracker_.time_user_first_modified_omnibox().is_null())
      metrics_tracker_.set_time_user_first_modified_omnibox(timestamp);
  }
  void OnResultChanged(AutocompleteController* controller,
                       bool default_match_changed) override {
    // Owned controller/view observation has already synchronized the model.
    SearchboxHandler::OnResultChanged(controller, default_match_changed);
    PublishKeywordState();
  }
  void OnFocusChanged(bool focused) override {
    SearchboxHandler::OnFocusChanged(focused);
    PublishKeywordState();
  }
  void OnStart(AutocompleteController* controller,
               const AutocompleteInput& input) override {
    auto* provider = controller->autocomplete_provider_client();
    // Keep Chromium155's actual WebuiOmniboxHandler eligibility. A newtab
    // classification does not become a web-page Lens entrypoint by assertion.
    const bool fallback = provider &&
        (((omnibox::kAskGCoBrowse.Get() ||
           omnibox::kAskGCoBrowseWithVisualSelection.Get()) &&
          !provider->ShouldOpenCoBrowsePanel()) ||
         (omnibox::kAskGComposeBox.Get() &&
          !provider->ShouldOpenComposeboxForAskG()));
    page_->UpdateLensSearchEligibility(provider &&
        ContextualSearchProvider::LensEntrypointEligible(input, provider) &&
        !fallback && (input.IsZeroSuggest() || input.text().empty()));
  }

  bool HasMatch(uint32_t sequence, uint8_t line, const GURL& url) const {
    return GetMatchWithUrl(sequence, line, url) != nullptr;
  }
  bool HasAction(uint32_t sequence, uint8_t line, const GURL& url,
                 uint8_t action_index) const {
    const auto* match = GetMatchWithUrl(sequence, line, url);
    const auto* current = GetMatchWithUrl(line, url);
    return match && current && action_index < match->actions.size() &&
           action_index < current->actions.size() &&
           match->actions[action_index] == current->actions[action_index];
  }
  void SetEventDisconnectHandler(base::OnceClosure callback) {
    page_.set_disconnect_handler(std::move(callback));
  }

  void OnThumbnailRemoved() override {
    // Supplied Run0x4285900 only validates ownership and acknowledges. It does
    // not actuate its native handler/model or delete any context. Preserve that
    // notification-only behavior (also the upstream Realbox contract).
  }

  // Expose the real native action only through the owner/document checks.
  void OpenLensSearch() override { last_lens_error_ = open_lens_.Run(); }
  std::optional<std::string> DispatchLensSearch() {
    auto* provider = autocomplete_controller()->autocomplete_provider_client();
    if (!provider || !provider->IsLensEnabled()) {
      return "Lens search is unavailable for this profile and tab";
    }
    if (!omnibox::kAskGLensChipRoute.Get() &&
        !autocomplete_controller()->contextual_search_provider()) {
      return "The contextual Lens search provider is unavailable";
    }
    edit_model()->OpenLensSearch();
    return std::nullopt;
  }

 protected:
  bool UsesModelController() const override { return true; }
  bool SupportsKeywordMode() const override { return true; }

 private:
  void PublishKeywordState() {
    const auto state = std::make_tuple(edit_model()->is_keyword_selected(),
        edit_model()->keyword(), edit_model()->keyword_placeholder());
    if (keyword_state_ && *keyword_state_ == state) return;
    keyword_state_ = state;
    if (keyword_changed_)
      keyword_changed_.Run(std::get<0>(state), std::get<1>(state), std::get<2>(state));
  }
  std::unique_ptr<ExtensionOmniboxView> model_view_;
  base::RepeatingCallback<std::optional<std::string>()> open_lens_;
  OwnedContextualSession::KeywordCallback keyword_changed_;
  std::optional<std::tuple<bool, std::u16string, std::u16string>> keyword_state_;
  std::optional<std::string> last_lens_error_;
  base::ScopedObservation<OmniboxEditModel, OmniboxEditModel::Observer>
      edit_model_observation_{this};
};

// static
std::unique_ptr<OwnedContextualSession> OwnedContextualSession::Create(
    content::WebContents* owner,
    mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
    mojo::PendingRemote<searchbox::mojom::Page> events,
    base::OnceClosure invalidated, KeywordCallback keyword_changed) {
  if (!owner || !owner->GetPrimaryMainFrame() || !commands.is_valid() ||
      !events.is_valid()) {
    return nullptr;
  }
  auto session = std::unique_ptr<OwnedContextualSession>(
      new OwnedContextualSession(owner, std::move(invalidated),
                                 std::move(keyword_changed)));
  session->Initialize(std::move(commands), std::move(events));
  return session;
}

OwnedContextualSession::OwnedContextualSession(
    content::WebContents* owner, base::OnceClosure invalidated,
    KeywordCallback keyword_changed)
    : content::WebContentsObserver(owner),
      profile_(Profile::FromBrowserContext(owner->GetBrowserContext())),
      frame_id_(owner->GetPrimaryMainFrame()->GetGlobalId()),
      invalidated_(std::move(invalidated)),
      keyword_changed_(std::move(keyword_changed)) {}

void OwnedContextualSession::Initialize(
    mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
    mojo::PendingRemote<searchbox::mojom::Page> events) {
  handler_ = std::make_unique<OwnedContextualHandler>(
      std::move(commands), std::move(events), profile_, web_contents(),
      base::BindRepeating(&OwnedContextualSession::GetSessionHandle,
                          base::Unretained(this)),
      base::BindRepeating(&OwnedContextualSession::OpenLensSearch,
                          base::Unretained(this)), keyword_changed_);
  handler_->set_disconnect_handler(base::BindOnce(
      &OwnedContextualSession::Close, weak_factory_.GetWeakPtr()));
  handler_->SetEventDisconnectHandler(base::BindOnce(
      &OwnedContextualSession::Close, weak_factory_.GetWeakPtr()));
}

OwnedContextualSession::~OwnedContextualSession() { Close(); }

bool OwnedContextualSession::IsCurrentDocument() const {
  return !closed_ && web_contents() &&
         web_contents()->GetBrowserContext() == profile_ &&
         web_contents()->GetPrimaryMainFrame() &&
         web_contents()->GetPrimaryMainFrame()->GetGlobalId() == frame_id_;
}

searchbox::mojom::PageHandler* OwnedContextualSession::commands() const {
  return IsCurrentDocument() ? handler_.get() : nullptr;
}

contextual_search::ContextualSearchSessionHandle*
OwnedContextualSession::GetSessionHandle() {
  if (!IsCurrentDocument()) {
    return nullptr;
  }
  if (!context_) {
    auto* service = ContextualSearchServiceFactory::GetForProfile(profile_);
    if (!service) {
      return nullptr;
    }
    context_ = service->CreateSession(
        ntp_composebox::CreateQueryControllerConfigParams(),
        contextual_search::ContextualSearchSource::kNewTabPage,
        lens::LensOverlayInvocationSource::kNtpContextualQuery);
  }
  // Recheck policy on every acquisition, not just the first file upload.
  if (!context_ ||
      !context_->CheckSearchContentSharingSettings(profile_->GetPrefs())) {
    return nullptr;
  }
  return context_.get();
}

std::optional<std::string> OwnedContextualSession::OpenLensSearch() {
  if (!IsCurrentDocument() || !handler_) {
    return "The owning search document is no longer active";
  }
  return handler_->DispatchLensSearch();
}

namespace {
OwnedContextualSession::ContextResult AbortedContext() {
  return base::unexpected(contextual_search::ContextUploadErrorType::kAborted);
}
}  // namespace

void OwnedContextualSession::AddFileContext(
    searchbox::mojom::SelectedFileInfoPtr info, mojo_base::BigBuffer bytes,
    ContextCallback callback) {
  if (!IsCurrentDocument() || !handler_) {
    std::move(callback).Run(AbortedContext());
    return;
  }
  if (!info || info->file_name.empty() || info->file_name.size() > 255 ||
      info->file_name.find_first_of("/\\") != std::string::npos ||
      info->mime_type.empty() || info->mime_type.size() > 255 ||
      bytes.size() > 32 * 1024 * 1024) {
    std::move(callback).Run(base::unexpected(
        contextual_search::ContextUploadErrorType::kBrowserProcessingError));
    return;
  }
  // Native handler emits the token before uploading and subsequent real status
  // events through Page. A revoked policy returns an actual upload error.
  handler_->AddFileContext(
      std::move(info), std::move(bytes),
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(
          base::BindPostTaskToCurrentDefault(base::BindOnce(
              [](base::WeakPtr<OwnedContextualSession> session,
                 ContextCallback callback, ContextResult result) {
                std::move(callback).Run(
                    session && session->IsCurrentDocument()
                        ? std::move(result) : AbortedContext());
              }, weak_factory_.GetWeakPtr(), std::move(callback))),
          AbortedContext()));
}

void OwnedContextualSession::AddTabContext(
    int32_t native_tab_handle, bool delay_upload, ContextCallback callback) {
  if (!IsCurrentDocument() || !handler_) {
    std::move(callback).Run(AbortedContext());
    return;
  }
  if (!CanUseTabContext(native_tab_handle)) {
    std::move(callback).Run(base::unexpected(
        contextual_search::ContextUploadErrorType::kBrowserProcessingError));
    return;
  }
  // This is the native TabInterface handle from GetRecentTabs, NOT an inferred
  // extension tab ID. Upstream validates actual tab/profile/context eligibility.
  // Page ownership may disappear during asynchronous tab extraction.
  handler_->AddTabContext(
      native_tab_handle, delay_upload,
      searchbox::mojom::TabAttachmentSource::kContextMenu,
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(
          base::BindPostTaskToCurrentDefault(base::BindOnce(
              [](base::WeakPtr<OwnedContextualSession> session,
                 ContextCallback callback, ContextResult result) {
                std::move(callback).Run(
                    session && session->IsCurrentDocument()
                        ? std::move(result) : AbortedContext());
              }, weak_factory_.GetWeakPtr(), std::move(callback))),
          AbortedContext()));
}

bool OwnedContextualSession::CanUseTabContext(int32_t native_tab_handle) const {
  if (!IsCurrentDocument()) return false;
  auto* tab = tabs::TabHandle(native_tab_handle).Get();
  return tab && tab->GetProfile() == profile_ && tab->GetContents() &&
      tab->GetContents()->GetBrowserContext() == profile_ &&
      lens::TabContextualizationController::From(tab);
}

bool OwnedContextualSession::DeleteContext(
    const base::UnguessableToken& token, bool from_automatic_chip) {
  if (!IsCurrentDocument() || !handler_ || token.is_empty()) {
    return false;
  }
  // DeleteContext performs real cancellation/removal through the shared handle.
  handler_->DeleteContext(token, from_automatic_chip);
  return true;
}

bool OwnedContextualSession::ClearFiles(bool block_auto_suggested_tabs) {
  if (!IsCurrentDocument() || !handler_) {
    return false;
  }
  handler_->ClearFiles(block_auto_suggested_tabs);
  return true;
}

bool OwnedContextualSession::NotifySessionStarted() {
  if (!IsCurrentDocument() || !handler_) {
    return false;
  }
  handler_->NotifySessionStarted();
  return true;
}
bool OwnedContextualSession::NotifySessionAbandoned() {
  if (!IsCurrentDocument() || !handler_) {
    return false;
  }
  handler_->NotifySessionAbandoned();
  return true;
}

bool OwnedContextualSession::Query(
    const std::u16string& input, bool prevent_inline_autocomplete,
    uint32_t cursor_position, const std::string& keyword, bool is_on_focus) {
  if (!IsCurrentDocument() || !handler_ || input.size() > 8192 ||
      cursor_position > input.size() || keyword.size() > 1024 ||
      query_id_ == std::numeric_limits<int32_t>::max()) {
    return false;
  }
  handler_->QueryAutocomplete(++query_id_, std::nullopt, input,
      prevent_inline_autocomplete, cursor_position,
      omnibox::SuggestInventory::SUGGEST_INVENTORY_DEFAULT, is_on_focus,
      keyword, searchbox::mojom::InputMethod::kKeyboard);
  return true;
}
bool OwnedContextualSession::StopAutocomplete(bool clear_result) {
  if (!IsCurrentDocument() || !handler_) {
    return false;
  }
  handler_->StopAutocomplete(clear_result);
  return true;
}

bool OwnedContextualSession::OpenMatch(
    uint32_t sequence_id, uint8_t line, const GURL& url,
    bool matches_showing, uint8_t mouse_button,
    searchbox::mojom::ActionModifiersPtr modifiers, bool via_keyboard) {
  if (!IsCurrentDocument() || !handler_ || !modifiers || mouse_button > 2 ||
      !handler_->HasMatch(sequence_id, line, url)) {
    return false;
  }
  handler_->OpenAutocompleteMatch(sequence_id, line, url, matches_showing,
      mouse_button, std::move(modifiers), via_keyboard);
  return true;
}

bool OwnedContextualSession::ExecuteAction(
    uint32_t sequence_id, uint8_t line, uint8_t action_index, const GURL& url,
    uint8_t mouse_button, const searchbox::mojom::ActionModifiers& modifiers) {
  if (!IsCurrentDocument() || !handler_ || mouse_button > 2 ||
      !handler_->HasAction(sequence_id, line, url, action_index)) {
    return false;
  }
  // ExecuteAction resolves its own current snapshot; require exact identity in
  // the supplied snapshot AND current snapshot before native non-URL actions.
  // This prevents a late request from actuating a changed result at the line.
  handler_->ExecuteAction(line, action_index, url, base::TimeTicks::Now(),
      mouse_button, modifiers.alt_key, modifiers.ctrl_key, modifiers.meta_key,
      modifiers.shift_key);
  return true;
}

void OwnedContextualSession::Close() {
  if (closed_) {
    return;
  }
  closed_ = true;
  weak_factory_.InvalidateWeakPtrs();
  // Destroy observer/receiver/callback owners before releasing the RAII handle.
  // Releasing the last handle removes the native session and cancels uploads.
  handler_.reset();
  context_.reset();
  Observe(nullptr);
  if (invalidated_) {
    std::move(invalidated_).Run();
  }
}

void OwnedContextualSession::DidFinishNavigation(
    content::NavigationHandle* navigation) {
  if (navigation->HasCommitted() && navigation->IsInPrimaryMainFrame() &&
      !navigation->IsSameDocument()) {
    Close();
  }
}
void OwnedContextualSession::WebContentsDestroyed() { Close(); }
}  // namespace extensions
