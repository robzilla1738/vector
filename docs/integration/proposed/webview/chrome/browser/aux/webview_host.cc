// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/webview_host.h"
#include <map>
#include <memory>
#include <optional>
#include "base/environment.h"
#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/string_number_conversions.h"
#include "base/unguessable_token.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "chrome/browser/profiles/profile.h"
#include "components/guest_contents/browser/guest_contents_handle.h"
#include "content/public/browser/document_service.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "content/public/common/content_features.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/extension.h"
#include "extensions/common/permissions/permissions_data.h"
#include "mojo/public/cpp/bindings/remote.h"
namespace aux {
namespace {
bool Authorized(content::RenderFrameHost* frame) {
  if (!BUILDFLAG(ENABLE_AUX_BROWSER) || !frame || !frame->IsActive() ||
      frame->GetParent() || !frame->GetLastCommittedURL().SchemeIs("chrome-extension") ||
      frame->GetLastCommittedURL().host() != kAgentExtensionId) return false;
  const auto* registry = extensions::ExtensionRegistry::Get(frame->GetBrowserContext());
  if (!registry) return false;
  const auto* extension = registry->enabled_extensions().GetByID(kAgentExtensionId);
  return extension && extension->location() == extensions::mojom::ManifestLocation::kComponent &&
      extension->permissions_data()->HasAPIPermission(
          extensions::mojom::APIPermissionID::kAuxExposeWebView);
}
// Do not overwrite a handle/validator owned by a different embedding feature.
class LeaseMarker : public content::WebContentsUserData<LeaseMarker> {
 public:
  std::string active;
 private:
  friend content::WebContentsUserData<LeaseMarker>;
  explicit LeaseMarker(content::WebContents* contents)
      : content::WebContentsUserData<LeaseMarker>(*contents) {}
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(LeaseMarker);
class Host;
class Lease : public content::WebContentsObserver {
 public:
  Lease(content::WebContents* target, base::OnceClosure detached)
      : content::WebContentsObserver(target), detached_(std::move(detached)) {}
  void WebContentsDestroyed() override {
    Observe(nullptr);
    if (detached_) std::move(detached_).Run();
  }
 private:
  base::OnceClosure detached_;
};
class Host final : public content::DocumentService<mojom::WebViewHost>,
                   public content::WebContentsObserver {
 public:
  Host(content::RenderFrameHost& frame,
       mojo::PendingReceiver<mojom::WebViewHost> receiver)
      : content::DocumentService<mojom::WebViewHost>(frame, std::move(receiver)),
        content::WebContentsObserver(content::WebContents::FromRenderFrameHost(&frame)) {}
  ~Host() override {
    weak_.InvalidateWeakPtrs();
    while (!leases_.empty()) Retire(leases_.begin()->first, false);
  }
  void BindClient(mojo::PendingRemote<mojom::WebViewClient> client) override {
    if (client_.is_bound() || !Authorized(&render_frame_host())) {
      ResetWithReasonAndDeleteThis(1, "Unauthorized webview client"); return;
    }
    client_.Bind(std::move(client));
    client_.set_disconnect_handler(base::BindOnce(
        [](base::WeakPtr<Host> self) { if (self) self->ResetAndDeleteThis(); }, weak_.GetWeakPtr()));
  }
  void AttachTab(int tab_id, const blink::LocalFrameToken& token,
                 AttachTabCallback done) override {
    if (!Authorized(&render_frame_host()) || !client_.is_bound() ||
        leases_.size() + pending_ >= 8 || tab_id < 0 ||
        !base::FeatureList::IsEnabled(features::kAttachUnownedInnerWebContents)) {
      std::move(done).Run(false, "", "Native tab embedding is unavailable"); return;
    }
    auto* child = content::RenderFrameHost::FromFrameToken(
        content::GlobalRenderFrameHostToken(render_frame_host().GetProcess()->GetID(), token));
    content::WebContents* target = nullptr;
    if (!Placeholder(child) || !extensions::ExtensionTabUtil::GetTabById(
            tab_id, render_frame_host().GetBrowserContext(), false, &target) ||
        !Target(target)) {
      std::move(done).Run(false, "", "Tab or placeholder is unavailable in this profile"); return;
    }
    if (leases_.empty() && pending_ == 0) account_id_.reset();
    ++pending_;
    const auto frame_id = child->GetGlobalId();
    Verify(base::BindOnce(&Host::DidVerify, weak_.GetWeakPtr(),
        tab_id, target->GetWeakPtr(), frame_id, std::move(done)));
  }
  void Detach(const std::string& id, DetachCallback done) override {
    const bool found = leases_.contains(id);
    if (found) Retire(id, true);
    std::move(done).Run(found);
  }
  void FrameDeleted(content::FrameTreeNodeId frame) override {
    // Removing a placeholder must return its guest even if renderer IPC is lost.
    for (auto it = leases_.begin(); it != leases_.end();) {
      const auto id = it++->first;
      const auto found = leases_.find(id);
      if (found != leases_.end() && found->second.frame == frame)
        Retire(id, true);
    }
  }
 private:
  struct Active {
    base::WeakPtr<content::WebContents> target;
    content::FrameTreeNodeId frame;
    std::unique_ptr<Lease> observer;
  };
  bool Placeholder(content::RenderFrameHost* child) const {
    return child && child->IsActive() && child->GetParent() == &render_frame_host() &&
        child->GetBrowserContext() == render_frame_host().GetBrowserContext() &&
        child->GetLastCommittedURL().IsAboutBlank() &&
        child->GetLastCommittedOrigin().IsSameOriginWith(render_frame_host().GetLastCommittedOrigin());
  }
  bool Target(content::WebContents* target) const {
    return target && !target->IsBeingDestroyed() &&
        target != content::WebContents::FromRenderFrameHost(&render_frame_host()) &&
        target->GetBrowserContext() == render_frame_host().GetBrowserContext() &&
        !target->GetOuterWebContents();
  }
  void Verify(base::OnceCallback<void(bool)> done) {
    uint16_t port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
      unsigned parsed = 0;
      if (!base::StringToUint(*text, &parsed) || !parsed || parsed > 65535) {
        std::move(done).Run(false); return;
      }
      port = parsed;
    }
    if (!g_browser_process || !g_browser_process->system_network_context_manager()) {
      std::move(done).Run(false); return;
    }
    const auto authorization = BrowserPlatform::Get().authorization();
    auto* profile = Profile::FromBrowserContext(render_frame_host().GetBrowserContext());
    FetchProfileSecurity(StateHome(), profile->GetOriginalProfile()->GetPath(),
        g_browser_process->system_network_context_manager()->GetSharedURLLoaderFactory(),
        port, authorization, base::BindOnce(
            [](base::WeakPtr<Host> self, std::string token,
               base::OnceCallback<void(bool)> callback, ProfileSecurityState state) {
              if (!self) return;
              bool allowed = Authorized(&self->render_frame_host()) &&
                  token == BrowserPlatform::Get().authorization() && state.allows_browsing();
              if (allowed && self->account_id_ && self->account_id_ != state.account_id)
                allowed = false;
              if (allowed && !self->account_id_) self->account_id_ = state.account_id;
              std::move(callback).Run(allowed);
            }, weak_.GetWeakPtr(), authorization, std::move(done)));
  }
  void DidVerify(int tab_id, base::WeakPtr<content::WebContents> target,
                 content::GlobalRenderFrameHostId frame_id,
                 AttachTabCallback done, bool verified) {
    auto* child = content::RenderFrameHost::FromID(frame_id);
    content::WebContents* current = nullptr;
    if (!verified || !Target(target.get()) || !Placeholder(child) ||
        !extensions::ExtensionTabUtil::GetTabById(tab_id,
            render_frame_host().GetBrowserContext(), false, &current) || current != target.get()) {
      --pending_; std::move(done).Run(false, "", "Embedding authority changed"); return;
    }
    const auto node = child->GetFrameTreeNodeId();
    child->PrepareForInnerWebContentsAttach(base::BindOnce(
        &Host::DidPrepare, weak_.GetWeakPtr(), target, node, std::move(done)));
  }
  void DidPrepare(base::WeakPtr<content::WebContents> target,
                  content::FrameTreeNodeId node, AttachTabCallback done,
                  content::RenderFrameHost* prepared) {
    if (!Target(target.get()) || !Placeholder(prepared) || prepared->GetFrameTreeNodeId() != node) {
      --pending_; std::move(done).Run(false, "", "Placeholder preparation failed"); return;
    }
    Verify(base::BindOnce(&Host::AttachPrepared, weak_.GetWeakPtr(),
        target, prepared->GetGlobalId(), node, std::move(done)));
  }
  void AttachPrepared(base::WeakPtr<content::WebContents> target,
                      content::GlobalRenderFrameHostId frame_id,
                      content::FrameTreeNodeId node, AttachTabCallback done, bool verified) {
    --pending_;
    auto* prepared = content::RenderFrameHost::FromID(frame_id);
    if (!verified || !Target(target.get()) || !Placeholder(prepared) ||
        prepared->GetFrameTreeNodeId() != node) {
      std::move(done).Run(false, "", "Embedding authority changed"); return;
    }
    auto* handle = guest_contents::GuestContentsHandle::FromWebContents(target.get());
    auto* marker = LeaseMarker::FromWebContents(target.get());
    if ((handle && !marker) || (marker && !marker->active.empty())) {
      std::move(done).Run(false, "", "Tab is already managed by another embedding"); return;
    }
    if (!handle) {
      handle = guest_contents::GuestContentsHandle::CreateForWebContents(target.get());
      LeaseMarker::CreateForWebContents(target.get());
      marker = LeaseMarker::FromWebContents(target.get());
    }
    const auto id = base::UnguessableToken::Create().ToString();
    marker->active = id;
    handle->SetAttachmentValidator(base::BindRepeating(
        [](base::WeakPtr<Host> self, content::GlobalRenderFrameHostId expected,
           content::RenderFrameHost* frame) {
          return self && frame && frame->GetGlobalId() == expected &&
              self->Placeholder(frame) && Authorized(&self->render_frame_host());
        }, weak_.GetWeakPtr(), frame_id));
    auto observer = std::make_unique<Lease>(target.get(),
        base::BindOnce(&Host::Retire, weak_.GetWeakPtr(), id, true));
    leases_.emplace(id, Active{target, node, std::move(observer)});
    handle->AttachToOuterWebContents(prepared);
    if (target->GetOuterWebContents() != web_contents()) {
      Retire(id, false);
      std::move(done).Run(false, "", "Native attachment was rejected"); return;
    }
    if (!timer_.IsRunning()) timer_.Start(FROM_HERE, base::Seconds(1),
        base::BindRepeating(&Host::VerifyActive, weak_.GetWeakPtr()));
    std::move(done).Run(true, id, "");
  }
  void VerifyActive() {
    if (verifying_ || leases_.empty()) return;
    verifying_ = true;
    Verify(base::BindOnce([](base::WeakPtr<Host> self, bool allowed) {
      if (!self) return;
      self->verifying_ = false;
      if (!allowed) while (!self->leases_.empty())
        self->Retire(self->leases_.begin()->first, true);
    }, weak_.GetWeakPtr()));
  }
  void Retire(std::string id, bool notify) {
    auto found = leases_.find(id);
    if (found == leases_.end()) return;
    auto target = found->second.target;
    // Remove observer before detaching to prevent reentrant lease retirement.
    auto active = std::move(found->second);
    leases_.erase(found);
    active.observer.reset();
    if (target) {
      auto* marker = LeaseMarker::FromWebContents(target.get());
      if (marker && marker->active == id) marker->active.clear();
      auto* handle = guest_contents::GuestContentsHandle::FromWebContents(target.get());
      if (handle && target->GetOuterWebContents() == web_contents())
        handle->DetachFromOuterWebContents();
    }
    if (leases_.empty()) {
      timer_.Stop();
      if (pending_ == 0) account_id_.reset();
    }
    if (notify && client_.is_connected()) client_->Detached(id);
  }
  std::map<std::string, Active> leases_;
  size_t pending_ = 0;
  std::optional<int> account_id_;
  bool verifying_ = false;
  base::RepeatingTimer timer_;
  mojo::Remote<mojom::WebViewClient> client_;
  base::WeakPtrFactory<Host> weak_{this};
};
}  // namespace
void BindWebViewHost(content::RenderFrameHost* frame,
                    mojo::PendingReceiver<mojom::WebViewHost> receiver) {
  if (Authorized(frame)) new Host(*frame, std::move(receiver));
}
}  // namespace aux
