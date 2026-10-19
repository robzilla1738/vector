// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_PROVIDED_SEARCHBOX_PAGE_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_PROVIDED_SEARCHBOX_PAGE_H_
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/values.h"
#include "components/omnibox/browser/searchbox.mojom.h"
#include "mojo/public/cpp/bindings/receiver.h"
class Profile;
namespace searchbox::mojom {
// Current native Page events translated to the supplied extension event shapes.
// Newer native-only state has no invented original extension event.
class ProvidedSearchboxPage final : public Page {
 public:
  using Emit = base::RepeatingCallback<void(std::string, base::DictValue, bool)>;
  ProvidedSearchboxPage(Profile* profile, Emit emit);
  ~ProvidedSearchboxPage() override;
  mojo::PendingRemote<Page> Bind();
  void Close();
  uint32_t sequence_id() const { return sequence_id_; }
  const base::DictValue& result() const { return result_; }
  const base::DictValue& input_state() const { return input_state_; }
  void SetFreState(FreStatePtr state) override;
  void AutocompleteResultChanged(AutocompleteResultPtr result) override;
  void UpdateSelection(OmniboxPopupSelectionPtr old_selection, OmniboxPopupSelectionPtr selection) override;
  void StepSelection(SelectionDirection direction, SelectionStep step) override;
  void OpenCurrentSelection(::WindowOpenDisposition disposition) override;
  void SetAimButtonVisible(bool visible) override;
  void SetAimButtonConfig(const std::string& text, const std::string& tooltip, const std::string& a11y_label, const ::GURL& icon_url) override;
  void SetInputText(const std::string& input) override;
  void SetKeywordSpaceTriggeringEnabled(bool enabled) override;
  void SetAvailableKeywordModels(std::vector<InputKeywordModelPtr> models) override;
  void SetThumbnail(const std::string& thumbnail_url, bool is_deletable) override;
  void OnContextualInputStatusChanged(const ::base::UnguessableToken& token, ::contextual_search::ContextUploadStatus status, std::optional<::contextual_search::ContextUploadErrorType> error_type) override;
  void OnTabStripChanged() override;
  void OnInputStateChanged(const ::omnibox::InputState& input_state) override;
  void AddFileContext(const ::base::UnguessableToken& token, SelectedFileInfoPtr file_info) override;
  void UpdateAutoSuggestedTabContext(TabInfoPtr tab, const std::optional<std::string>& invocation_source) override;
  void UpdateLensSearchEligibility(bool eligible) override;
  void UpdateContentSharingPolicy(bool enabled) override;
  void UpdateAimPopupEligibility(bool eligible) override;
  void UpdateSmartTabSharingActive(bool active) override;
  void OnPermissionPromptChanged(bool is_showing, const ::gfx::Size& prompt_size) override;
  void SetRestoredTabIds(const std::vector<int32_t>& ids) override;
  void SetAimThreadRestoredTabs(std::vector<TabInfoPtr> tabs) override;
  void OnScreenshotMenuClosed() override;
  void UpdateProfileInfo(const ::GURL& avatar_url, const std::string& name, const std::string& email) override;
 private:
  void Send(std::string event, base::DictValue payload = {}, bool has_payload = true);
  raw_ptr<Profile> profile_;
  Emit emit_;
  mojo::Receiver<Page> receiver_{this};
  uint32_t sequence_id_ = 0;
  base::DictValue input_state_;
  base::DictValue result_;
  base::DictValue newer_native_state_;
};
base::DictValue ProvidedTab(Profile* profile, const TabInfo& tab);
base::DictValue ProvidedInputState(const omnibox::InputState& state);
std::string ProvidedUploadError(contextual_search::ContextUploadErrorType error);
}  // namespace searchbox::mojom
#endif
