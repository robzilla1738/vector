#include "chrome/browser/ui/aux_tab_reference_context.h"

#include <map>
#include <string>
#include <utility>
#include <vector>

#include "base/memory/weak_ptr.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_user_data.h"

namespace {
constexpr size_t kMaxReferences = 64;
constexpr size_t kMaxRetainedReferences = 256;

base::DictValue Failure(const char* message) {
  return base::DictValue().Set("success", false).Set("error", message);
}

bool IsNativeTab(Profile* profile, content::WebContents* contents) {
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    if (browser->GetProfile() != profile) continue;
    auto* tabs = browser->GetTabStripModel();
    if (tabs && tabs->GetIndexOfWebContents(contents) != TabStripModel::kNoTab)
      return true;
  }
  return false;
}

content::WebContents* ResolveTab(Profile* profile, const std::string& target_id,
                                 const std::string& url) {
  auto target = content::DevToolsAgentHost::GetForId(target_id);
  auto* contents = target ? target->GetWebContents() : nullptr;
  if (!contents || contents->GetBrowserContext() != profile ||
      !IsNativeTab(profile, contents) ||
      !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ||
      contents->GetLastCommittedURL().spec() != url ||
      contents->GetController().GetPendingEntry()) return nullptr;
  auto* frame = contents->GetPrimaryMainFrame();
  return frame && !frame->IsErrorDocument() ? contents : nullptr;
}

struct Reference {
  std::string target_id;
  std::string url;
  base::WeakPtr<content::WebContents> target;
  content::WeakDocumentPtr document;
  bool IsCurrent() const {
    auto* frame = document.AsRenderFrameHostIfValid();
    return target && frame && target->GetPrimaryMainFrame() == frame &&
        target->GetLastCommittedURL().spec() == url;
  }
};

class ReferenceOwner : public content::WebContentsUserData<ReferenceOwner> {
 public:
  explicit ReferenceOwner(content::WebContents* contents)
      : content::WebContentsUserData<ReferenceOwner>(*contents) {}
  void RefreshDocument(content::WebContents* sender) {
    auto* frame = sender->GetPrimaryMainFrame();
    if (sender_document_.AsRenderFrameHostIfValid() != frame) {
      references_.clear();
      sender_document_ = frame ? frame->GetWeakDocumentPtr() : content::WeakDocumentPtr();
    }
    for (auto it = references_.begin(); it != references_.end();) {
      if (!it->second.IsCurrent()) it = references_.erase(it);
      else ++it;
    }
  }
  std::map<std::string, Reference> references_;
 private:
  friend class content::WebContentsUserData<ReferenceOwner>;
  content::WeakDocumentPtr sender_document_;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(ReferenceOwner);

ReferenceOwner* Owner(content::WebContents* sender) {
  if (!sender || !sender->GetPrimaryMainFrame()) return nullptr;
  auto* profile = Profile::FromBrowserContext(sender->GetBrowserContext());
  if (!profile || profile->IsOffTheRecord()) return nullptr;
  ReferenceOwner::CreateForWebContents(sender);
  auto* owner = ReferenceOwner::FromWebContents(sender);
  owner->RefreshDocument(sender);
  return owner;
}
}  // namespace

base::DictValue CaptureAuxTabReferences(content::WebContents* sender,
                                        const base::ListValue& references) {
  auto* owner = Owner(sender);
  if (!owner || references.empty() || references.size() > kMaxReferences)
    return Failure("Tab context is unavailable.");
  auto* profile = Profile::FromBrowserContext(sender->GetBrowserContext());
  std::vector<std::pair<std::string, Reference>> pending;
  base::ListValue result;
  for (const auto& value : references) {
    const auto* input = value.GetIfDict();
    const auto* id = input ? input->FindString("targetId") : nullptr;
    const auto* url = input ? input->FindString("url") : nullptr;
    if (!id || id->empty() || id->size() > 256 || !url || url->size() > 16384)
      return Failure("Invalid tab reference.");
    auto* target = ResolveTab(profile, *id, *url);
    if (!target) return Failure("A selected tab changed or belongs to another profile. Select it again.");
    std::string capability;
    for (const auto& [token, retained] : owner->references_) {
      if (retained.target_id == *id && retained.url == *url &&
          retained.target.get() == target && retained.IsCurrent()) {
        capability = token;
        break;
      }
    }
    if (capability.empty()) {
      if (owner->references_.size() + pending.size() >= kMaxRetainedReferences)
        return Failure("Too many retained tab references; reopen this composer.");
      capability = base::Uuid::GenerateRandomV4().AsLowercaseString();
      pending.emplace_back(capability, Reference{*id, *url, target->GetWeakPtr(),
          target->GetPrimaryMainFrame()->GetWeakDocumentPtr()});
    }
    result.Append(base::DictValue().Set("targetId", *id).Set("url", *url)
        .Set("documentCapability", capability));
  }
  for (auto& [capability, reference] : pending)
    owner->references_.emplace(std::move(capability), std::move(reference));
  return base::DictValue().Set("success", true).Set("references", std::move(result));
}

base::DictValue ValidateAuxTabReferences(content::WebContents* sender,
                                         const base::ListValue& references) {
  auto* owner = Owner(sender);
  if (!owner || references.empty() || references.size() > kMaxReferences)
    return Failure("Tab context is unavailable.");
  auto* profile = Profile::FromBrowserContext(sender->GetBrowserContext());
  base::ListValue result;
  for (const auto& value : references) {
    const auto* input = value.GetIfDict();
    const auto* id = input ? input->FindString("targetId") : nullptr;
    const auto* url = input ? input->FindString("url") : nullptr;
    const auto* capability = input ? input->FindString("documentCapability") : nullptr;
    if (!id || !url || !capability) return Failure("Select the referenced tab again before sending.");
    const auto found = owner->references_.find(*capability);
    if (found == owner->references_.end() || found->second.target_id != *id ||
        found->second.url != *url || !found->second.IsCurrent() ||
        ResolveTab(profile, *id, *url) != found->second.target.get())
      return Failure("A referenced tab changed. Remove or select it again; your draft is preserved.");
    result.Append(base::DictValue().Set("targetId", *id).Set("url", *url)
        .Set("documentCapability", *capability));
  }
  return base::DictValue().Set("success", true).Set("references", std::move(result));
}
