  std::optional<std::vector<content::WebContents*>> ContextTargets(bool selected) {
    auto* owner = browser();
    auto* profile = owner ? owner->GetProfile() : nullptr;
    auto* strip = owner ? owner->GetTabStripModel() : nullptr;
    if (!current() || !profile || profile->IsOffTheRecord() || !strip ||
        !IsAuxLocalProfileAdmitted(profile) ||
        ask_profile_epoch_ != GetProfileCookieBindingEpoch(profile) ||
        profile->GetPrefs()->GetInteger("aux.account_id") < 0) return std::nullopt;
    std::vector<content::WebContents*> result;
    if (!selected) {
      if (!context_active_.Current(profile)) return std::nullopt;
      result.push_back(context_active_.contents.get());
      return result;
    }
    if (context_selected_.empty() || context_selected_.size() > 64) return std::nullopt;
    size_t position = 0;
    for (int i = 0; i < strip->count(); ++i) {
      if (!strip->IsTabSelected(i)) continue;
      if (position >= context_selected_.size() ||
          strip->GetWebContentsAt(i) != context_selected_[position].contents.get() ||
          !context_selected_[position].Current(profile)) return std::nullopt;
      result.push_back(context_selected_[position++].contents.get());
    }
    if (position != context_selected_.size()) return std::nullopt;
    return result;
  }
  base::DictValue PrepareContextAction(const std::string& action,
                                       const std::string& query) {
    auto* owner = browser();
    auto targets = ContextTargets(action == "ask-selected-tabs");
    if (!owner || !targets || context_action_ ||
        (action != "ask-page" && action != "ask-selected-tabs" && action != "summarize-page"))
      return base::DictValue().Set("success", false).Set("error", "The selected pages changed or are not loaded. Reopen the command bar.");
    auto* profile = owner->GetProfile();
    auto* origin = target();
    // Reference ownership belongs to the original page, not the temporary
    // search WebContents. Closing this palette cannot revoke a submitted page.
    if (!origin || !origin->GetPrimaryMainFrame() || origin->GetController().GetPendingEntry())
      return base::DictValue().Set("success", false).Set("error", "The originating page is unavailable.");
    base::ListValue requests;
    for (auto* page : *targets) {
      const auto host = content::DevToolsAgentHost::GetOrCreateFor(page);
      requests.Append(base::DictValue().Set("targetId", host->GetId())
          .Set("url", page->GetLastCommittedURL().spec()));
    }
    auto captured = CaptureAuxTabReferences(origin, requests);
    if (!captured.FindBool("success").value_or(false)) return captured;
    auto* references = captured.FindList("references");
    if (!references || references->size() != targets->size())
      return base::DictValue().Set("success", false).Set("error", "Could not capture every selected page.");
    for (size_t i = 0; i < references->size(); ++i)
      (*references)[i].GetDict().Set("name", base::UTF16ToUTF8((*targets)[i]->GetTitle()));
    const auto origin_host = content::DevToolsAgentHost::GetOrCreateFor(origin);
    context_action_ = base::DictValue().Set("success", true)
        .Set("token", base::Uuid::GenerateRandomV4().AsLowercaseString())
        .Set("action", action).Set("query", query)
        .Set("accountId", profile->GetPrefs()->GetInteger("aux.account_id"))
        .Set("profileId", GetProfileId(profile))
        .Set("ownerGeneration", ask_profile_epoch_)
        .Set("windowId", owner->GetSessionID().id())
        .Set("originTargetId", origin_host->GetId())
        .Set("references", references->Clone());
    context_authorized_ = false;
    return context_action_->Clone();
  }
  bool ContextActionCurrent(std::string_view token) {
    if (!context_action_ || *context_action_->FindString("token") != token) return false;
    auto* owner = browser();
    if (!owner || owner->GetProfile()->GetPrefs()->GetInteger("aux.account_id") !=
        context_action_->FindInt("accountId") ||
        GetProfileId(owner->GetProfile()) != *context_action_->FindString("profileId") ||
        !ContextTargets(*context_action_->FindString("action") == "ask-selected-tabs")) return false;
    const auto checked = ValidateAuxTabReferencesForProfile(owner->GetProfile(),
        *context_action_->FindList("references"));
    return checked.FindBool("success").value_or(false);
  }
  base::DictValue AuthorizeContextAction(std::string_view token) {
    if (context_authorized_ || !ContextActionCurrent(token))
      return base::DictValue().Set("success", false).Set("error", "Page context expired or was already submitted. Reopen the command bar.");
    context_authorized_ = true;
    return context_action_->Clone();
  }
  const base::DictValue* SubmittedContextAction(std::string_view token) {
    return context_authorized_ && ContextActionCurrent(token) ? &*context_action_ : nullptr;
  }
