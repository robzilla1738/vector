// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_page_capture.h"
#include <algorithm>
#include <map>
#include <memory>
#include <utility>
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/supports_user_data.h"
#include "base/task/bind_post_task.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/weak_document_ptr.h"
#include "extensions/browser/extension_api_frame_id_map.h"
#include "extensions/browser/extensions_browser_client.h"
#include "ui/gfx/codec/png_codec.h"
#include "ui/gfx/geometry/size_conversions.h"
namespace {
constexpr char kCaptureOwnerKey = 0;
constexpr int64_t kMaxPixels = 32 * 1024 * 1024;
constexpr size_t kMaxPngBytes = 16 * 1024 * 1024;
base::DictValue Error(const char* reason) { return base::DictValue().Set("success", false).Set("error", reason); }
struct Lease {
  base::WeakPtr<Profile> profile;
  base::WeakPtr<content::WebContents> target;
  content::WeakDocumentPtr document;
  base::RepeatingCallback<bool()> owner_current;
  base::TimeTicks expires;
  bool active = true, copying = false;
  bool Current() const {
    return active && profile && target && owner_current && owner_current.Run() &&
        base::TimeTicks::Now() < expires && target->GetBrowserContext() == profile.get() &&
        document.AsRenderFrameHostIfValid() == target->GetPrimaryMainFrame() &&
        !target->GetController().GetPendingEntry() && CanAuxCapturePage(target.get());
  }
};
std::map<std::string, std::weak_ptr<Lease>>& Index() {
  static base::NoDestructor<std::map<std::string, std::weak_ptr<Lease>>> index;
  return *index;
}
struct Owner : base::SupportsUserData::Data {
  std::map<std::string, std::shared_ptr<Lease>> captures;
  ~Owner() override { for (auto& [id, lease] : captures) { lease->active = false; Index().erase(id); } }
};
Owner* Get(Profile* profile, bool create = false) {
  if (!profile) return nullptr;
  auto* owner = static_cast<Owner*>(profile->GetUserData(&kCaptureOwnerKey));
  if (!owner && create) { auto value = std::make_unique<Owner>(); owner = value.get(); profile->SetUserData(&kCaptureOwnerKey, std::move(value)); }
  return owner;
}
std::shared_ptr<Lease> Find(Profile* profile, std::string_view id) {
  auto* owner = Get(profile); if (!owner) return nullptr;
  auto it = owner->captures.find(std::string(id));
  return it == owner->captures.end() ? nullptr : it->second;
}
std::optional<std::string> Encode(SkBitmap bitmap) {
  if (bitmap.drawsNothing() || !bitmap.getPixels() ||
      int64_t(bitmap.width()) * bitmap.height() > kMaxPixels) return std::nullopt;
  auto png = gfx::PNGCodec::EncodeBGRASkBitmap(bitmap, false);
  if (!png || png->size() > kMaxPngBytes) return std::nullopt;
  return "data:image/png;base64," + base::Base64Encode(*png);
}
}  // namespace
bool CanAuxCapturePage(content::WebContents* target) {
  if (!target || !target->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ||
      target->GetController().GetPendingEntry() || !target->GetPrimaryMainFrame() ||
      target->GetVisibility() != content::Visibility::VISIBLE) return false;
  auto* view = target->GetRenderWidgetHostView();
  return view && view->IsSurfaceAvailableForCopy() &&
      extensions::ExtensionsBrowserClient::Get()->IsScreenshotRestricted(target).has_value();
}
base::DictValue BeginAuxPageSurfaceCapture(Profile* profile, content::WebContents* target,
    std::string_view document_id, base::RepeatingCallback<bool()> owner_current) {
  if (!profile || !target || target->GetBrowserContext() != profile ||
      !owner_current || !owner_current.Run() || !CanAuxCapturePage(target) || document_id.empty() ||
      extensions::ExtensionApiFrameIdMap::GetDocumentId(target->GetPrimaryMainFrame()).ToString() != document_id)
    return Error("The selected page changed or cannot be captured.");
  auto* owner = Get(profile, true);
  std::erase_if(owner->captures, [](auto& entry) {
    if (entry.second->Current()) return false;
    entry.second->active = false; Index().erase(entry.first); return true;
  });
  if (owner->captures.size() >= 8) return Error("Finish or close the previous page captures first.");
  auto lease = std::make_shared<Lease>(); lease->profile = profile->GetWeakPtr();
  lease->target = target->GetWeakPtr(); lease->document = target->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  lease->owner_current = std::move(owner_current); lease->expires = base::TimeTicks::Now() + base::Minutes(1);
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  owner->captures.emplace(id, lease); Index().emplace(id, lease);
  return base::DictValue().Set("success", true).Set("capability", id)
      .Set("targetId", content::DevToolsAgentHost::GetOrCreateFor(target)->GetId());
}
base::DictValue ValidateAuxPageSurfaceCapture(Profile* profile, std::string_view id) {
  auto lease = Find(profile, id);
  return lease && lease->Current() ? base::DictValue().Set("success", true)
      : Error("The page capture expired; capture the current page again.");
}
void CancelAuxPageSurfaceCapture(Profile* profile, std::string_view id) {
  auto* owner = Get(profile); if (!owner) return;
  auto it = owner->captures.find(std::string(id)); if (it == owner->captures.end()) return;
  it->second->active = false; Index().erase(it->first); owner->captures.erase(it);
}
void CaptureAuxPageSurface(Profile* profile, std::string_view id,
                            base::OnceCallback<void(base::DictValue)> reply) {
  auto lease = Find(profile, id);
  if (!lease || !lease->Current() || lease->copying) {
    std::move(reply).Run(Error("The page capture expired or is already running.")); return;
  }
  auto* view = lease->target->GetRenderWidgetHostView();
  const auto size = gfx::ScaleToCeiledSize(view->GetViewBounds().size(), view->GetDeviceScaleFactor());
  if (size.IsEmpty() || int64_t(size.width()) * size.height() > kMaxPixels) {
    std::move(reply).Run(Error("This page surface is too large to capture.")); return;
  }
  lease->copying = true;
  view->CopyFromSurface(gfx::Rect(), size, base::Seconds(5),
      base::BindPostTaskToCurrentDefault(base::BindOnce([](std::shared_ptr<Lease> lease,
          base::OnceCallback<void(base::DictValue)> reply, const content::CopyFromSurfaceResult& result) {
        if (!lease->Current() || !result.has_value()) {
          lease->copying = false;
          std::move(reply).Run(Error("The page changed before capture completed.")); return;
        }
        base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
            base::BindOnce(&Encode, result->bitmap),
            base::BindOnce([](std::shared_ptr<Lease> lease,
                base::OnceCallback<void(base::DictValue)> reply, std::optional<std::string> data) {
              lease->copying = false;
              if (!lease->Current() || !data) {
                std::move(reply).Run(Error("The page changed or its image exceeds the capture limit.")); return;
              }
              std::move(reply).Run(base::DictValue().Set("success", true).Set("dataUrl", std::move(*data)));
            }, lease, std::move(reply)));
      }, lease, std::move(reply))));
}
base::RepeatingCallback<bool()> GetAuxPageCaptureDocumentGuard(
    content::DevToolsAgentHost* actual_target, std::string_view id) {
  auto it = Index().find(std::string(id)); if (it == Index().end() || !actual_target) return {};
  auto lease = it->second.lock();
  if (!lease || actual_target->GetWebContents() != lease->target.get() || !lease->Current()) return {};
  return base::BindRepeating([](std::shared_ptr<Lease> lease) { return lease->Current(); }, std::move(lease));
}

base::DictValue GetAuxPageCaptureTarget(Profile* profile, content::WebContents* pane) {
  if (!profile || !pane || pane->GetBrowserContext() != profile || !CanAuxCapturePage(pane))
    return Error("The active page cannot be captured.");
  return base::DictValue().Set("success", true)
      .Set("tabId", extensions::ExtensionTabUtil::GetTabId(pane))
      .Set("documentId", extensions::ExtensionApiFrameIdMap::GetDocumentId(pane->GetPrimaryMainFrame()).ToString());
}
