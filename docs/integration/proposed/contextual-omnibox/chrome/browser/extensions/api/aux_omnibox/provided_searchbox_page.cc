// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/extensions/api/aux_omnibox/provided_searchbox_page.h"

#include <iterator>
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/profiles/profile.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/web_contents.h"
#include "ui/gfx/geometry/size.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "components/omnibox/common/input_state.h"

namespace searchbox::mojom {
namespace {
// Native enum names are versioned by Chromium's proto definitions. The supplied
// extension uses the corresponding lower-camel names, not numeric ordinals.
std::string ModeName(std::string name, std::string_view prefix) {
  if (base::StartsWith(name, prefix)) name.erase(0, prefix.size());
  std::string result;
  bool upper = false;
  for (char c : name) {
    if (c == '_') { upper = true; continue; }
    result += upper ? base::ToUpperASCII(c) : base::ToLowerASCII(c);
    upper = false;
  }
  return result;
}
std::string Tool(omnibox::ToolMode value) {
  return static_cast<int>(value) <= 10 ?
      ModeName(omnibox::ToolMode_Name(value), "TOOL_MODE_") : "unknown";
}
std::string Model(omnibox::ModelMode value) {
  return static_cast<int>(value) <= 4 ?
      ModeName(omnibox::ModelMode_Name(value), "MODEL_MODE_") : "unknown";
}
std::string Input(omnibox::InputType value) {
  return static_cast<int>(value) <= 3 ?
      ModeName(omnibox::InputType_Name(value), "INPUT_TYPE_") : "unknown";
}
template <typename Values, typename Convert>
base::ListValue Names(const Values& values, Convert convert) {
  base::ListValue result;
  for (auto value : values) result.Append(convert(value));
  return result;
}
base::DictValue Selection(const OmniboxPopupSelection& selection) {
  std::string state;
  switch (selection.state) {
    case SelectionLineState::kNormal: state = "normal"; break;
    case SelectionLineState::kKeywordMode: state = "keywordMode"; break;
    case SelectionLineState::kFocusedButtonAction: state = "focusedButtonAction"; break;
    case SelectionLineState::kFocusedButtonRemoveSuggestion: state = "focusedButtonRemoveSuggestion"; break;
    case SelectionLineState::kFocusedButtonAim: state = "focusedButtonAim"; break;
    case SelectionLineState::kFocusedButtonContextEntrypoint: state = "focusedButtonContextEntrypoint"; break;
    case SelectionLineState::kCtrlEnter: state = "ctrlEnter"; break;
    case SelectionLineState::kFocusedButtonVoiceSearch: state = "focusedButtonVoiceSearch"; break;
    case SelectionLineState::kFocusedButtonLensSearch: state = "focusedButtonLensSearch"; break;
  }
  return base::DictValue().Set("line", selection.line).Set("state", state)
      .Set("actionIndex", selection.action_index);
}
base::ListValue Classifications(const std::vector<ACMatchClassificationPtr>& values) {
  base::ListValue result;
  for (const auto& value : values)
    result.Append(base::DictValue().Set("offset", static_cast<int>(value->offset))
                  .Set("style", value->style));
  return result;
}
}  // namespace

base::DictValue ProvidedTab(Profile* profile, const TabInfo& info) {
  base::DictValue result;
  result.Set("internalTabId", info.tab_id);
  if (auto* tab = tabs::TabHandle(info.tab_id).Get(); tab &&
      tab->GetProfile() == profile && tab->GetContents() &&
      tab->GetContents()->GetBrowserContext() == profile) {
    result.Set("tabId", extensions::ExtensionTabUtil::GetTabId(tab->GetContents()));
  }
  result.Set("title", info.title);
  result.Set("url", info.url.spec());
  result.Set("showInCurrentTabChip", info.show_in_current_tab_chip);
  result.Set("showInPreviousTabChip", info.show_in_previous_tab_chip);
  result.Set("lastActiveMs", info.last_active.since_origin().InMillisecondsF());
  return result;
}

std::string ProvidedUploadError(contextual_search::ContextUploadErrorType error) {
  // Exact supplied converter strings recovered from native function0x428e780.
  static constexpr const char* names[] = {
      "unknown", "browserProcessingError", "networkError", "serverError",
      "serverSizeLimitExceeded", "aborted", "imageProcessingError",
      "browserProcessingFileTooLargeError", "browserProcessingFileEmptyError",
      "browserProcessingMaxFilesExceededError", "browserProcessingUnsupportedFileTypeError",
      "browserProcessingFileUploadNotAllowedError", "browserProcessingMaxImagesExceededError",
      "browserProcessingMaxPdfsExceededError"};
  const auto index = static_cast<size_t>(error);
  return index < std::size(names) ? names[index] : "unknown";
}
base::DictValue ProvidedInputState(const omnibox::InputState& state) {
  base::DictValue result;
  result.Set("allowedTools", Names(state.allowed_tools, Tool));
  result.Set("allowedModels", Names(state.allowed_models, Model));
  result.Set("allowedInputTypes", Names(state.allowed_input_types, Input));
  result.Set("disabledTools", Names(state.disabled_tools, Tool));
  result.Set("disabledModels", Names(state.disabled_models, Model));
  result.Set("disabledInputTypes", Names(state.disabled_input_types, Input));
  result.Set("activeTool", Tool(state.active_tool));
  result.Set("activeModel", Model(state.active_model));
  result.Set("maxTotalInputs", state.max_total_inputs);
  result.Set("hintText", state.hint_text);
  base::DictValue limits;
  for (auto [type, count] : state.max_inputs_by_type) limits.Set(Input(type), count);
  result.Set("maxInstances", std::move(limits));
  result.Set("imageGenUploadActive", state.image_gen_upload_active);
  auto parameters = [](const auto& params) {
    base::ListValue result;
    for (const auto& param : params)
      result.Append(base::DictValue().Set("key", param.param_key())
          .Set("value", param.param_value()));
    return result;
  };
  base::ListValue tools, models, inputs;
  for (const auto& config : state.tool_configs)
    tools.Append(base::DictValue().Set("toolMode", Tool(config.tool()))
        .Set("menuLabel", config.menu_label()).Set("chipLabel", config.chip_label())
        .Set("hintText", config.hint_text()).Set("menuTooltip", config.menu_tooltip())
        .Set("disableActiveModelSelection", config.disable_active_model_selection())
        .Set("aimUrlParams", parameters(config.aim_url_params())));
  for (const auto& config : state.model_configs)
    models.Append(base::DictValue().Set("modelMode", Model(config.model()))
        .Set("menuLabel", config.menu_label()).Set("hintText", config.hint_text())
        .Set("menuTooltip", config.menu_tooltip())
        .Set("aimUrlParams", parameters(config.aim_url_params())));
  for (const auto& config : state.input_type_configs)
    inputs.Append(base::DictValue().Set("inputType", Input(config.input_type()))
        .Set("menuLabel", config.menu_label()));
  result.Set("toolConfigs", std::move(tools));
  result.Set("modelConfigs", std::move(models));
  result.Set("inputTypeConfigs", std::move(inputs));
  if (state.tools_section_config)
    result.Set("toolsSectionConfig", base::DictValue().Set("header", state.tools_section_config->header()));
  if (state.model_section_config)
    result.Set("modelSectionConfig", base::DictValue().Set("header", state.model_section_config->header()));
  return result;
}

ProvidedSearchboxPage::ProvidedSearchboxPage(Profile* profile, Emit emit)
    : profile_(profile), emit_(std::move(emit)) {}
ProvidedSearchboxPage::~ProvidedSearchboxPage() = default;
mojo::PendingRemote<Page> ProvidedSearchboxPage::Bind() {
  return receiver_.BindNewPipeAndPassRemote();
}
void ProvidedSearchboxPage::Close() { receiver_.reset(); emit_.Reset(); }
void ProvidedSearchboxPage::Send(std::string event, base::DictValue payload,
                                bool has_payload) {
  if (emit_) emit_.Run(std::move(event), std::move(payload), has_payload);
}
void ProvidedSearchboxPage::AutocompleteResultChanged(AutocompleteResultPtr result) {
  sequence_id_ = result->sequence_id;
  base::DictValue payload;
  payload.Set("queryId", result->query_id);
  payload.Set("input", base::UTF16ToUTF8(result->input));
  base::DictValue groups;
  for (const auto& [id, group] : result->suggestion_groups_map)
    groups.Set(base::NumberToString(id), base::DictValue()
        .Set("header", base::UTF16ToUTF8(group->header))
        .Set("renderType", static_cast<int>(group->render_type))
        .Set("sideType", static_cast<int>(group->side_type)));
  payload.Set("suggestionGroups", std::move(groups));
  base::ListValue matches;
  for (const auto& match : result->matches) {
    base::DictValue row;
    row.Set("a11yLabel", base::UTF16ToUTF8(match->a11y_label));
    row.Set("contents", base::UTF16ToUTF8(match->contents));
    row.Set("contentsClass", Classifications(match->contents_class));
    row.Set("description", base::UTF16ToUTF8(match->description));
    row.Set("descriptionClass", Classifications(match->description_class));
    row.Set("destinationUrl", match->destination_url.spec());
    row.Set("inlineAutocompletion", base::UTF16ToUTF8(match->inline_autocompletion));
    row.Set("fillIntoEdit", base::UTF16ToUTF8(match->fill_into_edit));
    row.Set("iconPath", match->icon_path);
    row.Set("iconUrl", match->icon_url.spec());
    row.Set("imageDominantColor", match->image_dominant_color);
    row.Set("imageUrl", match->image_url);
    row.Set("isNoncannedAimSuggestion", match->is_noncanned_aim_suggestion);
    row.Set("isRichSuggestion", match->is_two_row_suggestion);
    row.Set("isSearchType", match->is_search_type);
    row.Set("isEnterpriseSearchAggregatorPeopleType", match->is_enterprise_search_aggregator_people_type);
    row.Set("type", match->type);
    row.Set("removeButtonA11yLabel", base::UTF16ToUTF8(match->remove_button_a11y_label));
    row.Set("swapContentsAndDescription", match->swap_contents_and_description);
    row.Set("suggestionGroupId", match->suggestion_group_id);
    row.Set("supportsDeletion", match->supports_deletion);
    row.Set("isHidden", match->is_hidden);
    row.Set("allowedToBeDefaultMatch", match->allowed_to_be_default_match);
    if (match->tail_suggest_common_prefix)
      row.Set("tailSuggestCommonPrefix", base::UTF16ToUTF8(*match->tail_suggest_common_prefix));
    if (match->keyword_model) {
      row.Set("hasInstantKeyword", match->keyword_model->type == KeywordType::kInstant);
      row.Set("keywordChipHint", match->keyword_model->chip_hint);
      row.Set("keywordChipA11y", match->keyword_model->chip_a11y);
    }
    base::ListValue actions;
    for (const auto& action : match->actions)
      actions.Append(base::DictValue().Set("hint", action->hint)
          .Set("suggestionContents", action->suggestion_contents)
          .Set("iconPath", action->icon_path).Set("a11yLabel", action->a11y_label));
    row.Set("actions", std::move(actions));
    matches.Append(std::move(row));
  }
  payload.Set("matches", std::move(matches));
  if (result->smart_compose_inline_hint)
    payload.Set("smartComposeInlineHint", base::UTF16ToUTF8(*result->smart_compose_inline_hint));
  result_ = payload.Clone();
  Send("onAutocompleteResultChanged", std::move(payload));
}
void ProvidedSearchboxPage::UpdateSelection(OmniboxPopupSelectionPtr old_selection,
                                           OmniboxPopupSelectionPtr selection) {
  Send("onSelectionUpdated", base::DictValue().Set("oldSelection", Selection(*old_selection))
      .Set("selection", Selection(*selection)));
}
void ProvidedSearchboxPage::StepSelection(SelectionDirection direction, SelectionStep step) {
  Send("onStepSelection", base::DictValue()
      .Set("direction", direction == SelectionDirection::kForward ? "forward" : "backward")
      .Set("step", step == SelectionStep::kWholeLine ? "wholeLine" :
                   step == SelectionStep::kAllLines ? "allLines" : "stateOrLine"));
}
void ProvidedSearchboxPage::OpenCurrentSelection(WindowOpenDisposition disposition) {
  std::string value = "unknown";
  switch (disposition) {
    case WindowOpenDisposition::CURRENT_TAB: value = "currentTab"; break;
    case WindowOpenDisposition::NEW_FOREGROUND_TAB: value = "newForegroundTab"; break;
    case WindowOpenDisposition::NEW_BACKGROUND_TAB: value = "newBackgroundTab"; break;
    case WindowOpenDisposition::NEW_WINDOW: value = "newWindow"; break;
    case WindowOpenDisposition::SWITCH_TO_TAB: value = "switchToTab"; break;
    case WindowOpenDisposition::SAVE_TO_DISK: value = "saveToDisk"; break;
    default: break;
  }
  Send("onOpenCurrentSelection", base::DictValue().Set("disposition", value));
}
void ProvidedSearchboxPage::SetAimButtonVisible(bool visible) {
  Send("onAimButtonVisibilityChanged", base::DictValue().Set("visible", visible));
}
void ProvidedSearchboxPage::SetInputText(const std::string& input) {
  Send("onInputTextChanged", base::DictValue().Set("inputText", input));
}
void ProvidedSearchboxPage::SetThumbnail(const std::string& url, bool deletable) {
  Send("onThumbnailChanged", base::DictValue().Set("thumbnailUrl", url).Set("isDeletable", deletable));
}
void ProvidedSearchboxPage::OnContextualInputStatusChanged(
    const base::UnguessableToken& token, contextual_search::ContextUploadStatus status,
    std::optional<contextual_search::ContextUploadErrorType> error) {
  static constexpr const char* names[] = {"notUploaded", "processing", "validationFailed",
      "uploadStarted", "uploadSuccessful", "uploadFailed", "uploadExpired",
      "processingSuggestSignalsReady", "uploadReplaced"};
  const size_t index = static_cast<size_t>(status);
  base::DictValue payload;
  payload.Set("contextToken", token.ToString());
  payload.Set("status", index < std::size(names) ? names[index] : "unknown");
  if (error) payload.Set("errorType", ProvidedUploadError(*error));
  Send("onContextualInputStatusChanged", std::move(payload));
}
void ProvidedSearchboxPage::OnTabStripChanged() { Send("onTabStripChanged", {}, false); }
void ProvidedSearchboxPage::OnInputStateChanged(const omnibox::InputState& state) {
  input_state_ = ProvidedInputState(state);
  Send("onInputStateChanged", base::DictValue().Set("state", input_state_.Clone()));
}
void ProvidedSearchboxPage::AddFileContext(const base::UnguessableToken& token,
                                          SelectedFileInfoPtr info) {
  base::DictValue payload;
  payload.Set("contextToken", token.ToString());
  payload.Set("fileName", info->file_name); payload.Set("mimeType", info->mime_type);
  if (info->image_data_url) payload.Set("imageDataUrl", *info->image_data_url);
  payload.Set("isDeletable", info->is_deletable);
  payload.Set("selectionTimeMs", info->selection_time.InMillisecondsFSinceUnixEpoch());
  Send("onFileContextAdded", std::move(payload));
}
void ProvidedSearchboxPage::UpdateAutoSuggestedTabContext(
    TabInfoPtr tab, const std::optional<std::string>& source) {
  base::DictValue payload; payload.Set("hasTab", !!tab);
  if (tab) payload.Set("tab", ProvidedTab(profile_, *tab));
  if (source) payload.Set("invocationSource", *source);
  Send("onAutoSuggestedTabContextChanged", std::move(payload));
}
void ProvidedSearchboxPage::UpdateLensSearchEligibility(bool eligible) {
  Send("onLensSearchEligibilityChanged", base::DictValue().Set("eligible", eligible));
}
void ProvidedSearchboxPage::UpdateContentSharingPolicy(bool enabled) {
  Send("onContentSharingPolicyChanged", base::DictValue().Set("enabled", enabled));
}
void ProvidedSearchboxPage::UpdateAimPopupEligibility(bool eligible) {
  Send("onAimEligibilityChanged", base::DictValue().Set("eligible", eligible));
}
void ProvidedSearchboxPage::UpdateSmartTabSharingActive(bool active) {
  Send("onSmartTabSharingActiveChanged", base::DictValue().Set("active", active));
}
// Chromium155 features absent from the supplied1.26 event IDL are retained as
// native state. They do not fabricate extension events or feature acceptance.
void ProvidedSearchboxPage::SetFreState(FreStatePtr state) {
  newer_native_state_.Set("freStage", static_cast<int>(state->stage));
}
void ProvidedSearchboxPage::SetAimButtonConfig(const std::string& text,
    const std::string& tooltip, const std::string& a11y, const GURL& icon) {
  newer_native_state_.Set("aimButton", base::DictValue().Set("text", text)
      .Set("tooltip", tooltip).Set("a11yLabel", a11y).Set("iconUrl", icon.spec()));
}
void ProvidedSearchboxPage::SetKeywordSpaceTriggeringEnabled(bool enabled) {
  newer_native_state_.Set("keywordSpaceTriggeringEnabled", enabled);
}
void ProvidedSearchboxPage::SetAvailableKeywordModels(std::vector<InputKeywordModelPtr> models) {
  base::ListValue result;
  for (const auto& model : models)
    result.Append(base::DictValue().Set("keyword", model->keyword)
        .Set("displayText", model->display_text).Set("placeholder", model->placeholder)
        .Set("type", static_cast<int>(model->type)).Set("iconPath", model->icon_path));
  newer_native_state_.Set("availableKeywordModels", std::move(result));
}
void ProvidedSearchboxPage::OnPermissionPromptChanged(bool showing, const gfx::Size& size) {
  newer_native_state_.Set("permissionPrompt", base::DictValue().Set("showing", showing)
      .Set("width", size.width()).Set("height", size.height()));
}
void ProvidedSearchboxPage::SetRestoredTabIds(const std::vector<int32_t>& ids) {
  base::ListValue values; for (int id : ids) values.Append(id);
  newer_native_state_.Set("restoredTabIds", std::move(values));
}
void ProvidedSearchboxPage::SetAimThreadRestoredTabs(std::vector<TabInfoPtr> tabs) {
  base::ListValue values; for (const auto& tab : tabs) values.Append(ProvidedTab(profile_, *tab));
  newer_native_state_.Set("aimThreadRestoredTabs", std::move(values));
}
void ProvidedSearchboxPage::OnScreenshotMenuClosed() {
  newer_native_state_.Set("screenshotMenuOpen", false);
}
void ProvidedSearchboxPage::UpdateProfileInfo(const GURL& avatar,
    const std::string& name, const std::string& email) {
  newer_native_state_.Set("profile", base::DictValue().Set("avatarUrl", avatar.spec())
      .Set("name", name).Set("email", email));
}
}  // namespace searchbox::mojom
