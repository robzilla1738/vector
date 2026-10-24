// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_preferences/aux_feature_expansion_api.h"
#include <set>
#include <utility>
#include <vector>
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/memory/raw_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/organization/organization_codec.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/themes/aux_theme_editor.h"
#include "chrome/browser/ui/aux_tab_reference_context.h"
#include "chrome/browser/ui/aux_tab_mention_spaces.h"
#include "chrome/browser/ui/aux_recent_files_service.h"
#include "chrome/browser/ui/aux_media_commands.h"
#include "chrome/browser/ui/aux_keyboard_shortcuts.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/aux/routing/routing_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"
#include "components/prefs/pref_service.h"
#include "components/sessions/core/session_id.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
namespace {
namespace org = aux::organization;
base::DictValue Failure(std::string error) {
  return base::DictValue().Set("success", false).Set("error", std::move(error));
}
BrowserWindowInterface* CallerWindow(content::WebContents* sender) {
  if (!sender) return GlobalBrowserCollection::GetInstance()->GetActiveBrowser();
  if (auto* browser = GetAuxProfileSearchBrowser(sender)) return browser;
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    auto* strip = browser->GetTabStripModel();
    if (strip && strip->GetIndexOfWebContents(sender) != TabStripModel::kNoTab)
      return browser;
  }
  return nullptr;
}
bool SettingsDocument(content::WebContents* sender, Profile* profile, content::RenderFrameHost* caller) {
  if (!sender || sender->GetBrowserContext() != profile || !sender->GetPrimaryMainFrame() ||
      caller != sender->GetPrimaryMainFrame()) return false;
  const auto& url = sender->GetLastCommittedURL();
  return url.SchemeIs("chrome-extension") && url.host() == aux::kAgentExtensionId;
}
bool Admitted(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      aux::IsProfileCookieRestorePending(profile)) return false;
  const auto state = aux::peer::InspectNativeBrowserShutdown();
  auto roots = aux::peer::CaptureActualChromiumBrowserRoots();
  return !state.wrong_process && !state.admission_closed &&
         !state.sequence_uncertain && state.admitted_generation != 0 &&
         roots && roots->Revalidate();
}
// Preview ownership follows the actual Appearance document, not an ID supplied
// by JavaScript. Profile transaction, navigation, destruction and close cancel it.
class ThemePreviewOwner final : public content::WebContentsObserver,
    public content::WebContentsUserData<ThemePreviewOwner>, public ProfileObserver {
 public:
  static std::set<ThemePreviewOwner*>& Owners() {
    static base::NoDestructor<std::set<ThemePreviewOwner*>> owners;
    return *owners;
  }
  ~ThemePreviewOwner() override { Owners().erase(this); Cancel(); }
  base::WeakPtr<ThemePreviewOwner> GetWeakPtr() { return weak_.GetWeakPtr(); }
  std::optional<std::string> Bind(Profile* profile) {
    auto* frame = web_contents()->GetPrimaryMainFrame();
    auto* window = CallerWindow(web_contents());
    if (!frame || !window || window->GetProfile() != profile) return std::nullopt;
    const auto epoch = aux::GetProfileCookieBindingEpoch(profile);
    if (profile_.get() != profile || epoch != epoch_ ||
        document_.AsRenderFrameHostIfValid() != frame) {
      const auto self = weak_.GetWeakPtr();
      const auto live_profile = profile->GetWeakPtr();
      const auto live_window = window->GetWeakPtr();
      const auto document = frame->GetWeakDocumentPtr();
      Cancel();
      if (!self || !live_profile || !live_window || !document.AsRenderFrameHostIfValid() ||
          !self->owner_.empty() || live_window->GetProfile() != live_profile.get() ||
          aux::GetProfileCookieBindingEpoch(live_profile.get()) != epoch)
        return std::nullopt;
      profile_ = live_profile;
      browser_ = live_window;
      observation_.Observe(live_profile.get());
      epoch_ = epoch;
      document_ = document;
      owner_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
    }
    return owner_;
  }
  void Cancel() {
    const auto profile = profile_;
    auto owner = std::move(owner_);
    observation_.Reset(); profile_ = nullptr; owner_.clear(); epoch_.clear();
    document_ = {}; browser_ = nullptr;
    // Notify theme observers only after revocation; callbacks may destroy us.
    if (profile && !owner.empty()) aux_theme::Cancel(profile.get(), owner);
  }
  Profile* profile() const { return profile_.get(); }
  BrowserWindowInterface* browser() const { return browser_.get(); }
  void PrimaryPageChanged(content::Page&) override { Cancel(); }
  void WebContentsDestroyed() override { Cancel(); }
  void OnProfileWillBeDestroyed(Profile*) override { Cancel(); }
 private:
  friend class content::WebContentsUserData<ThemePreviewOwner>;
  explicit ThemePreviewOwner(content::WebContents* contents)
      : content::WebContentsObserver(contents),
        content::WebContentsUserData<ThemePreviewOwner>(*contents) {
    Owners().insert(this);
  }
  base::WeakPtr<Profile> profile_;
  std::string epoch_, owner_;
  base::WeakPtr<BrowserWindowInterface> browser_;
  content::WeakDocumentPtr document_;
  base::ScopedObservation<Profile, ProfileObserver> observation_{this};
  base::WeakPtrFactory<ThemePreviewOwner> weak_{this};
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(ThemePreviewOwner);
org::OrganizationService* Model(Profile* profile) {
  auto* owner = org::OrganizationProfileServiceFactory::GetForProfile(profile);
  auto* service = owner ? owner->model() : nullptr;
  return service && !service->blocked() && !service->pending() ? service : nullptr;
}
bool Protected(Profile* profile, const std::string& id) {
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    if (browser->GetProfile() != profile ||
        browser->GetType() != BrowserWindowInterface::TYPE_NORMAL) continue;
    auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
    if (!controller || !controller->ready() || controller->HasPendingSharedUpdate(id))
      return true;
    if (controller->IsLogicalEntryProtected(id)) return true;
  }
  return false;
}
base::DictValue Snapshot(Profile* profile, BrowserWindowInterface* browser) {
  auto* service = Model(profile);
  auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
  if (!Admitted(profile) || !service || !browser || browser->GetProfile() != profile ||
      !controller || !controller->ready()) return Failure("Tabs are still being restored or saved.");
  const auto& snapshot = service->snapshot();
  const auto space = controller->ActiveSpaceId();
  const int account = profile->GetPrefs()->GetInteger("aux.account_id");
  if (account < 0 || space.empty()) return Failure("Connect this profile to an AI provider first.");
  base::ListValue tabs, folders;
  for (const auto& [id, entry] : snapshot.entries) {
    if (entry.archived || (entry.space_id != space && !org::IsGlobalPin(entry))) continue;
    base::DictValue row;
    row.Set("id", id); row.Set("title", entry.title);
    row.Set("parentId", entry.parent_id); row.Set("spaceId", entry.space_id);
    if (entry.kind == org::EntryKind::kFolder) { folders.Append(std::move(row)); continue; }
    row.Set("url", entry.current_url); row.Set("pinned", org::IsGlobalPin(entry));
    row.Set("protected", Protected(profile, id));
    tabs.Append(std::move(row));
  }
  return base::DictValue().Set("success", true).Set("accountId", account)
      .Set("ownerGeneration", aux::GetProfileCookieBindingEpoch(profile))
      .Set("revision", base::NumberToString(snapshot.revision))
      .Set("windowId", browser->GetSessionID().id()).Set("spaceId", space)
      .Set("tabs", std::move(tabs)).Set("folders", std::move(folders));
}
// Reconstruct all commands and review labels from native records. A renderer
// supplies a proposal, never a storage path or an unchecked replacement batch.
std::optional<std::vector<org::Command>> ValidateProposal(Profile* profile,
    BrowserWindowInterface* browser, const base::DictValue& proposal,
    base::ListValue* rows) {
  auto current = Snapshot(profile, browser);
  auto* service = Model(profile);
  if (!current.FindBool("success").value_or(false) || !service) return std::nullopt;
  for (const char* key : {"ownerGeneration", "expectedRevision", "spaceId"}) {
    const char* actual = std::string_view(key) == "expectedRevision" ? "revision" : key;
    const auto* expected = proposal.FindString(key);
    const auto* value = current.FindString(actual);
    if (!expected || !value || *expected != *value) return std::nullopt;
  }
  if (proposal.FindInt("windowId") != current.FindInt("windowId") ||
      proposal.FindInt("accountId") != current.FindInt("accountId")) return std::nullopt;
  const auto* proposal_id = proposal.FindString("proposalId");
  const auto* operation = proposal.FindString("operationId");
  if (!proposal_id || !operation || !org::IsCanonicalId(*proposal_id) ||
      !org::IsCanonicalId(*operation)) return std::nullopt;
  std::string json;
  if (!base::JSONWriter::Write(proposal, &json) || json.size() > 128 * 1024) return std::nullopt;
  const auto* folders = proposal.FindList("createFolders");
  const auto* moves = proposal.FindList("moves");
  if (!folders || !moves || moves->empty() || folders->size() + moves->size() > 512)
    return std::nullopt;
  std::vector<org::Command> commands;
  auto scratch = service->snapshot();
  std::set<std::string> moved;
  const auto& space = *current.FindString("spaceId");
  for (const auto& value : *folders) {
    if (!value.is_dict()) return std::nullopt;
    const auto& folder = value.GetDict();
    const auto* id = folder.FindString("id");
    const auto* title = folder.FindString("title");
    const auto* parent = folder.FindString("parentId");
    if (!id || !title || title->empty() || title->size() > 512 || !parent ||
        folder.FindString("spaceId") == nullptr || *folder.FindString("spaceId") != space)
      return std::nullopt;
    org::Command command; command.action = org::Action::kCreateFolder;
    command.id = *id; command.title = *title; command.space_id = space; command.parent_id = *parent;
    commands.push_back(std::move(command));
  }
  for (const auto& value : *moves) {
    if (!value.is_dict()) return std::nullopt;
    const auto& move = value.GetDict();
    const auto* id = move.FindString("tabId");
    const auto* folder = move.FindString("folderId");
    const auto index = move.FindInt("index");
    const auto* move_space = move.FindString("spaceId");
    if (!id || !folder || !index || *index < 0 || !move_space || *move_space != space ||
        !moved.insert(*id).second) return std::nullopt;
    auto entry = scratch.entries.find(*id);
    if (entry == scratch.entries.end() || entry->second.archived ||
        entry->second.kind != org::EntryKind::kTab || entry->second.space_id != space ||
        org::IsGlobalPin(entry->second) || Protected(profile, *id)) return std::nullopt;
    org::Command command; command.action = org::Action::kMoveEntry;
    command.id = *id; command.space_id = space; command.parent_id = *folder; command.index = *index;
    commands.push_back(std::move(command));
    if (rows) {
      std::string folder_title;
      if (auto existing = scratch.entries.find(*folder); existing != scratch.entries.end())
        folder_title = existing->second.title;
      for (const auto& created : commands)
        if (created.action == org::Action::kCreateFolder && created.id == *folder)
          folder_title = created.title;
      rows->Append(base::DictValue().Set("id", *id).Set("title", entry->second.title)
          .Set("folderTitle", folder_title));
    }
  }
  org::Context context{scratch.profile_id, *proposal.FindString("ownerGeneration"),
      scratch.revision, *operation};
  auto result = org::ApplyBatch(scratch, context, commands);
  if (result.error != org::Error::kNone && result.error != org::Error::kReplay) return std::nullopt;
  return commands;
}
}  // namespace
void CancelAuxThemePreviewsForProfile(Profile* profile) {
  // Cancel does not mutate this registry, unlike a WebContents destruction.
  std::vector<base::WeakPtr<ThemePreviewOwner>> owners;
  for (auto* owner : ThemePreviewOwner::Owners()) owners.push_back(owner->GetWeakPtr());
  for (const auto& owner : owners)
    if (owner && owner->profile() == profile) owner->Cancel();
}
void CancelAuxThemePreviewsForWindow(BrowserWindowInterface* browser) {
  std::vector<base::WeakPtr<ThemePreviewOwner>> owners;
  for (auto* owner : ThemePreviewOwner::Owners()) owners.push_back(owner->GetWeakPtr());
  for (const auto& owner : owners)
    if (owner && owner->browser() == browser) owner->Cancel();
}
namespace extensions {
AuxFeatureExpansionFunction::AuxFeatureExpansionFunction() = default;
AuxFeatureExpansionFunction::~AuxFeatureExpansionFunction() = default;
ExtensionFunction::ResponseAction AuxFeatureExpansionFunction::RunAux() {
  if (extension_id() != aux::kAgentExtensionId || shutting_down_ || !Admitted(profile()))
    return RespondNow(Error("Aux profile authority unavailable"));
  const std::string_view method = std::string_view(name()).substr(22);
  auto* sender = GetSenderWebContents();
  auto* browser = CallerWindow(sender);
  const base::DictValue* request = args().size() == 1 && args()[0].is_dict() ? &args()[0].GetDict() : nullptr;
  if (method == "getShortcutProfile" || method == "exportShortcutProfile" ||
      method == "importShortcutProfile" || method == "resetShortcutProfile") {
    if (!SettingsDocument(sender, profile(), render_frame_host()))
      return RespondNow(Error("Live shortcut settings document required"));
    if (method == "getShortcutProfile" || method == "exportShortcutProfile") {
      if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
      return RespondNow(WithArguments(method == "getShortcutProfile"
          ? aux::GetShortcutProfile(profile()) : aux::ExportShortcutProfile(profile())));
    }
    if (!request || request->size() > (method == "importShortcutProfile" ? 3u : 2u))
      return RespondNow(Error("Current shortcut revision required"));
    for (const auto [key, value] : *request)
      if (key != "ownerGeneration" && key != "revision" &&
          !(method == "importShortcutProfile" && key == "mappings"))
        return RespondNow(Error("Unknown shortcut request field"));
    const auto* owner = request->FindString("ownerGeneration");
    const auto* revision = request->FindString("revision");
    if (!owner || !revision || owner->size() > 128 || revision->size() > 128)
      return RespondNow(Error("Current shortcut revision required"));
    if (method == "resetShortcutProfile")
      return RespondNow(WithArguments(aux::ResetShortcutProfile(profile(), *owner, *revision)));
    const auto* mappings = request->FindDict("mappings");
    if (!mappings || mappings->size() > 128) return RespondNow(Error("Invalid shortcut mappings"));
    return RespondNow(WithArguments(aux::ImportShortcutProfile(profile(), *owner, *revision, *mappings)));
  }
  if (method == "getRoutingState") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(aux::routing::GetState(profile())));
  }
  if (method == "setRoutingRules") {
    if (!SettingsDocument(sender, profile(), render_frame_host())) return RespondNow(Error("Live routing settings document required"));
    const auto* revision = request ? request->FindString("revision") : nullptr;
    const auto* configuration = request ? request->FindDict("configuration") : nullptr;
    if (!revision || !configuration) return RespondNow(Error("Routing revision and configuration required"));
    return RespondNow(WithArguments(aux::routing::ReplaceRules(profile(), *revision, *configuration)));
  }
  if (method == "testRoutingUrl" || method == "routeBrowserLink") {
    if (!request) return RespondNow(Error("Routing request required"));
    aux::routing::Intent intent;
    if (const auto* url = request->FindString("url")) intent.url = GURL(*url);
    if (method == "testRoutingUrl") {
      intent.authority = aux::routing::Authority::kExternal;
      return RespondNow(WithArguments(aux::routing::Resolve(profile(), intent)));
    }
    const auto* bound = request->FindString("boundProfileId");
    const auto* operation = request->FindString("operation");
    if (!bound || *bound != aux::GetProfileId(profile()) || !operation)
      return RespondNow(Error("Current authenticated profile binding required"));
    if (*operation == "list") {
      std::string display_name = *bound;
      if (auto* manager = g_browser_process->profile_manager())
        if (auto* entry = manager->GetProfileAttributesStorage().GetProfileAttributesWithPath(profile()->GetPath()))
          display_name = base::UTF16ToUTF8(entry->GetName());
      base::ListValue spaces;
      auto* model = Model(profile());
      if (model) for (const auto& [id, space] : model->snapshot().spaces)
        spaces.Append(base::DictValue().Set("id", id).Set("name", space.name));
      return RespondNow(WithArguments(base::DictValue().Set("ok", true).Set("profile",
        base::DictValue().Set("id", *bound).Set("name", display_name)
          .Set("spacesReady", !!model).Set("spaces", std::move(spaces)))));
    }
    if (const auto* target = request->FindString("profile")) intent.profile = *target;
    if (const auto* space = request->FindString("space")) intent.space = *space;
    intent.authority = aux::routing::Authority::kCurrentProfile;
    if (*operation == "resolve") return RespondNow(WithArguments(aux::routing::Resolve(profile(), intent)));
    if (*operation != "open") return RespondNow(Error("Unknown routing operation"));
    pending_generation_ = aux::GetProfileCookieBindingEpoch(profile());
    aux::routing::Open(profile(), std::move(intent),
      base::BindOnce(&AuxFeatureExpansionFunction::DidRoute, this));
    return did_respond() ? AlreadyResponded() : RespondLater();
  }
  if (method == "getOrganizationSettings" || method == "setOrganizationCleanupPolicy") {
    auto* service = Model(profile());
    if (!service) return RespondNow(WithArguments(Failure("Organization is still restoring or saving.")));
    const auto generation = aux::GetProfileCookieBindingEpoch(profile());
    if (method == "getOrganizationSettings") {
      if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
      const auto& snapshot = service->snapshot();
      base::ListValue spaces;
      for (const auto& [id, space] : snapshot.spaces)
        spaces.Append(base::DictValue().Set("id", id).Set("name", space.name)
          .Set("icon", space.icon).Set("order", static_cast<int>(space.order)));
      base::Value scope;
      if (snapshot.cleanup_space_ids) {
        base::ListValue ids;
        for (const auto& id : *snapshot.cleanup_space_ids) ids.Append(id);
        scope = base::Value(std::move(ids));
      }
      return RespondNow(WithArguments(base::DictValue().Set("success", true)
        .Set("ownerGeneration", generation).Set("revision", base::NumberToString(snapshot.revision))
        .Set("spaces", std::move(spaces))
        .Set("cleanup", base::DictValue().Set("enabled", snapshot.cleanup_enabled)
          .Set("inactivityDays", static_cast<int>(snapshot.cleanup_inactivity_days))
          .Set("spaceIds", std::move(scope)))));
    }
    const auto enabled = request ? request->FindBool("enabled") : std::nullopt;
    const auto days = request ? request->FindInt("inactivityDays") : std::nullopt;
    const auto* owner = request ? request->FindString("ownerGeneration") : nullptr;
    const auto* expected = request ? request->FindString("expectedRevision") : nullptr;
    const auto revision = expected ? org::ParseCanonicalUint64(*expected) : std::nullopt;
    if (!SettingsDocument(sender, profile(), render_frame_host()) || !browser || browser->GetProfile() != profile() || !enabled || !days ||
        *days < 1 || *days > 3650 || !owner || *owner != generation || !revision)
      return RespondNow(Error("Current cleanup settings required"));
    pending_document_ = sender->GetPrimaryMainFrame()->GetWeakDocumentPtr();
    pending_browser_ = browser->GetWeakPtr(); pending_generation_ = generation;
    org::Command command; command.action = org::Action::kSetCleanupPolicy;
    command.value = *enabled; command.index = *days;
    // Older settings callers change enabled/days without broadening a saved scope.
    command.space_ids = service->snapshot().cleanup_space_ids;
    if (const auto* scope = request->Find("spaceIds")) {
      if (scope->is_none()) {
        command.space_ids.reset();
      } else {
        if (!scope->is_list() || scope->GetList().size() > org::kMaxSpaces)
          return RespondNow(Error("Valid cleanup Spaces required"));
        command.space_ids.emplace();
        for (const auto& id : scope->GetList()) {
          if (!id.is_string()) return RespondNow(Error("Valid cleanup Space ID required"));
          command.space_ids->push_back(id.GetString());
        }
      }
    }
    org::Context context{service->snapshot().profile_id, generation, *revision,
      base::Uuid::GenerateRandomV4().AsLowercaseString()};
    service->Execute(std::move(context), std::move(command),
      base::BindOnce(&AuxFeatureExpansionFunction::DidCommit, this));
    return did_respond() ? AlreadyResponded() : RespondLater();
  }
  if (method == "listRecentFiles" || method == "prepareDownloadRename" ||
      method == "applyDownloadRename" || method == "undoDownloadRename" ||
      method == "dragRecentFile" || method == "revealRecentFile" || method == "togglePictureInPicture") {
    const auto* generation = request ? request->FindString("generation") : nullptr;
    const auto context = GetAuxCommandContext(sender);
    const auto* current = context.FindString("generation");
    if (!sender || !browser || browser->GetProfile() != profile() || !generation || !current ||
        *generation != *current || !context.FindBool("success").value_or(false))
      return RespondNow(WithArguments(Failure("The current command context has expired.")));
    if (method == "listRecentFiles") {
      InitializeAuxLocalFeatureOwners(profile());
      return RespondNow(WithArguments(aux::files::ListRecentFiles(profile())));
    }
    if (method == "togglePictureInPicture") {
      if (!user_gesture()) return RespondNow(Error("A user gesture is required"));
      return RespondNow(WithArguments(ToggleAuxVideoPictureInPicture(browser->GetTabStripModel()->GetActiveWebContents())));
    }
    const auto* download = request->FindString("downloadId");
    if (method == "dragRecentFile" || method == "revealRecentFile") {
      if (!download || !user_gesture()) return RespondNow(Error("File selection and user gesture required"));
      return RespondNow(WithArguments(method == "dragRecentFile"
        ? aux::files::DragRecentDownload(profile(), *download, sender->GetNativeView())
        : aux::files::RevealRecentFile(profile(), *download)));
    }
    pending_document_ = sender->GetPrimaryMainFrame()->GetWeakDocumentPtr();
    pending_browser_ = browser->GetWeakPtr();
    pending_generation_ = aux::GetProfileCookieBindingEpoch(profile());
    if (method == "prepareDownloadRename" && download) {
      aux::files::PrepareDownloadRename(profile(), *download,
        base::BindOnce(&AuxFeatureExpansionFunction::DidFeatureResult, this));
    } else if (method == "applyDownloadRename" && request->FindString("capability") && request->FindString("stem")) {
      aux::files::ApplyDownloadRename(profile(), *request->FindString("capability"), *request->FindString("stem"),
        base::BindOnce(&AuxFeatureExpansionFunction::DidFeatureResult, this));
    } else if (method == "undoDownloadRename" && request->FindString("receiptId")) {
      aux::files::UndoDownloadRename(profile(), *request->FindString("receiptId"),
        base::BindOnce(&AuxFeatureExpansionFunction::DidFeatureResult, this));
    } else return RespondNow(Error("Valid file operation required"));
    return did_respond() ? AlreadyResponded() : RespondLater();
  }
  if (method == "getTabMentionSpaces" || method == "captureTabMentionSpace") {
    if (!SettingsDocument(sender, profile(), render_frame_host()))
      return RespondNow(Error("Live Aux composer document required"));
    if (method == "getTabMentionSpaces") {
      if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
      return RespondNow(WithArguments(GetAuxTabMentionSpaces(sender)));
    }
    if (args().size() != 1 || !request)
      return RespondNow(Error("Explicit Space selection required"));
    return RespondNow(WithArguments(CaptureAuxTabMentionSpace(sender, *request)));
  }
  if (method == "getOrganizationSnapshot") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(Snapshot(profile(), browser)));
  }
  if (method == "showOrganizationProposal") {
    const auto* proposal = request ? request->FindDict("proposal") : nullptr;
    base::ListValue rows;
    if (!proposal || !browser || browser->GetProfile() != profile() ||
        !ValidateProposal(profile(), browser, *proposal, &rows))
      return RespondNow(WithArguments(Failure("Tabs or profile changed. Try Tidy Tabs again.")));
    auto retained = proposal->Clone(); retained.Set("summaryRows", std::move(rows));
    const bool shown = ShowAuxOrganizationProposal(browser, std::move(retained));
    return RespondNow(WithArguments(base::DictValue().Set("success", shown)));
  }
  if (method == "applyOrganizationProposal" || method == "undoOrganization") {
    if (!sender || !browser || browser->GetProfile() != profile() || !request)
      return RespondNow(WithArguments(Failure("The organization review has closed.")));
    auto* service = Model(profile());
    if (!service) return RespondNow(WithArguments(Failure("Tabs are still being saved.")));
    pending_document_ = sender->GetPrimaryMainFrame()->GetWeakDocumentPtr();
    pending_browser_ = browser->GetWeakPtr();
    pending_generation_ = aux::GetProfileCookieBindingEpoch(profile());
    if (method == "applyOrganizationProposal") {
      const auto* id = request->FindString("proposalId");
      auto proposal = id ? GetAuxOrganizationProposal(sender, *id) : std::nullopt;
      auto commands = proposal ? ValidateProposal(profile(), browser, *proposal, nullptr) : std::nullopt;
      if (!commands) return RespondNow(WithArguments(Failure("The reviewed tabs changed. Try again.")));
      pending_proposal_ = *id;
      org::Context context{service->snapshot().profile_id, pending_generation_,
          service->snapshot().revision, *proposal->FindString("operationId")};
      service->ExecuteBatch(std::move(context), std::move(*commands),
          base::BindOnce(&AuxFeatureExpansionFunction::DidCommit, this));
    } else {
      const auto* generation = request->FindString("ownerGeneration");
      const auto* token = request->FindString("undoToken");
      const auto* revision = request->FindString("expectedRevision");
      const auto* operation = request->FindString("operationId");
      const auto parsed = revision ? org::ParseCanonicalUint64(*revision) : std::nullopt;
      if (!generation || *generation != pending_generation_ || !token || !revision ||
          !parsed || !operation || !org::IsCanonicalId(*operation))
        return RespondNow(WithArguments(Failure("Undo context expired.")));
      org::Context context{service->snapshot().profile_id, pending_generation_, *parsed, *operation};
      service->Undo(std::move(context), *token,
          base::BindOnce(&AuxFeatureExpansionFunction::DidCommit, this));
    }
    return did_respond() ? AlreadyResponded() : RespondLater();
  }
  if (method == "captureTabReferences" || method == "validateTabReferences") {
    const auto* references = request ? request->FindList("references") : nullptr;
    if (!references || args().size() != 1 || (method == "captureTabReferences" && !sender))
      return RespondNow(Error("Live composer and tab references required"));
    if (!sender) return RespondNow(WithArguments(ValidateAuxTabReferencesForProfile(profile(), *references)));
    return RespondNow(WithArguments(method == "captureTabReferences"
      ? CaptureAuxTabReferences(sender, *references) : ValidateAuxTabReferences(sender, *references)));
  }
  if (method == "getFramePresentation" || method == "setFramePresentation") {
    auto* prefs = profile()->GetPrefs();
    if (method == "setFramePresentation") {
      if (!SettingsDocument(sender, profile(), render_frame_host())) return RespondNow(Error("Live appearance settings required"));
      if (!request) return RespondNow(Error("Frame settings required"));
      for (const auto [key, pref] : {std::pair{"sidebarNavigation", "aux.sidebar_navigation_enabled"},
                                    std::pair{"minimal", "aux.minimal_ui_enabled"}, std::pair{"peekLinks", "aux.peek_links_enabled"}}) {
        if (auto value = request->FindBool(key)) {
          if (prefs->IsManagedPreference(pref)) return RespondNow(Error("This setting is managed"));
        } else if (request->Find(key)) return RespondNow(Error("Boolean required"));
      }
      for (const auto [key, pref] : {std::pair{"sidebarNavigation", "aux.sidebar_navigation_enabled"},
                                    std::pair{"minimal", "aux.minimal_ui_enabled"}, std::pair{"peekLinks", "aux.peek_links_enabled"}})
        if (auto value = request->FindBool(key)) prefs->SetBoolean(pref, *value);
    } else if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(base::DictValue().Set("success", true)
      .Set("sidebarNavigation", prefs->GetBoolean("aux.sidebar_navigation_enabled"))
      .Set("minimal", prefs->GetBoolean("aux.minimal_ui_enabled"))
      .Set("peekLinks", prefs->GetBoolean("aux.peek_links_enabled"))));
  }
  if (method == "getThemeState") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(aux_theme::GetState(profile())));
  }
  if (!SettingsDocument(sender, profile(), render_frame_host()) || !browser || browser->GetProfile() != profile())
    return RespondNow(Error("Live Appearance document required"));
  ThemePreviewOwner::CreateForWebContents(sender);
  const auto binding = ThemePreviewOwner::FromWebContents(sender)->Bind(profile());
  if (!binding) return RespondNow(Error("Theme preview context changed"));
  const auto owner = *binding;
  const auto* revision = request ? request->FindString("revision") : nullptr;
  const auto* tokens = request ? request->FindDict("tokens") : nullptr;
  if (method == "cancelTheme" && args().empty())
    return RespondNow(WithArguments(aux_theme::Cancel(profile(), owner)));
  if (!request) return RespondNow(Error("Theme request required"));
  if (method == "exportThemePreset" && tokens)
    return RespondNow(WithArguments(aux_theme::ExportPreset(profile(), *tokens)));
  if (!revision) return RespondNow(Error("Current theme revision required"));
  if (method == "previewTheme" && tokens)
    return RespondNow(WithArguments(aux_theme::Preview(profile(), owner, *revision, *tokens)));
  if (method == "applyTheme" && tokens)
    return RespondNow(WithArguments(aux_theme::Apply(profile(), owner, *revision, *tokens)));
  if (method == "resetTheme")
    return RespondNow(WithArguments(aux_theme::Reset(profile(), owner, *revision)));
  if (const auto* preset_name = request->FindString("name"); method == "saveThemePreset" && tokens && preset_name)
    return RespondNow(WithArguments(aux_theme::SavePreset(profile(), owner, *revision, *preset_name, *tokens)));
  if (const auto* id = request->FindString("id"); method == "deleteThemePreset" && id)
    return RespondNow(WithArguments(aux_theme::DeletePreset(profile(), owner, *revision, *id)));
  return RespondNow(Error("Invalid feature request"));
}
void AuxFeatureExpansionFunction::DidCommit(org::CommitResult result) {
  auto* sender = GetSenderWebContents();
  auto* frame = pending_document_.AsRenderFrameHostIfValid();
  if (shutting_down_ || !sender || !frame || sender->GetPrimaryMainFrame() != frame ||
      !pending_browser_ || pending_browser_->GetProfile() != profile() ||
      aux::GetProfileCookieBindingEpoch(profile()) != pending_generation_) {
    Respond(WithArguments(Failure("Profile or review changed after storage settlement.")));
    return;
  }
  const bool success = result.error == org::Error::kNone || result.error == org::Error::kReplay;
  if (success && !pending_proposal_.empty()) ConsumeAuxOrganizationProposal(sender, pending_proposal_);
  base::DictValue response;
  response.Set("success", success); response.Set("revision", base::NumberToString(result.revision));
  if (!result.undo_token.empty()) response.Set("undoToken", result.undo_token);
  if (!success) response.Set("error", "The changes could not be saved. Previous organization is retained.");
  Respond(WithArguments(std::move(response)));
}
void AuxFeatureExpansionFunction::DidFeatureResult(base::DictValue result) {
  auto* sender = GetSenderWebContents();
  auto* frame = pending_document_.AsRenderFrameHostIfValid();
  if (shutting_down_ || !sender || !frame || sender->GetPrimaryMainFrame() != frame ||
      !pending_browser_ || pending_browser_->GetProfile() != profile() ||
      aux::GetProfileCookieBindingEpoch(profile()) != pending_generation_) {
    Respond(WithArguments(Failure("The profile or command changed. The operation may have completed; reopen Recent files to check.")));
    return;
  }
  const int account = profile()->GetPrefs()->GetInteger("aux.account_id");
  if (account >= 0) result.Set("accountId", account);
  Respond(WithArguments(std::move(result)));
}
void AuxFeatureExpansionFunction::DidRoute(base::DictValue result) {
  if (shutting_down_ || !browser_context() ||
      aux::GetProfileCookieBindingEpoch(profile()) != pending_generation_) {
    Respond(WithArguments(Failure("The source profile binding changed during routing.")));
    return;
  }
  Respond(WithArguments(std::move(result)));
}
void AuxFeatureExpansionFunction::OnBrowserContextShutdown() {
  shutting_down_ = true;
  if (browser_context()) CancelAuxThemePreviewsForProfile(profile());
  AuxFunction::OnBrowserContextShutdown();
}
}  // namespace extensions
