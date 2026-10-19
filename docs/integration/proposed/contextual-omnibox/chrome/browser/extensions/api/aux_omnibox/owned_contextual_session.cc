// Copyright 2026 Aux Authors. All rights reserved.
// Platform adaptation of Chromium155's Realbox/shared contextual search flow.
#include "chrome/browser/extensions/api/aux_omnibox/owned_contextual_session.h"

#include <utility>

#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "chrome/browser/autocomplete/chrome_autocomplete_provider_client.h"
#include "chrome/browser/contextual_search/contextual_search_service_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/omnibox/omnibox_controller.h"
#include "chrome/browser/ui/omnibox/omnibox_edit_model.h"
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

class OwnedContextualHandler final : public ContextualSearchboxHandler {
 public:
  OwnedContextualHandler(
      mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
      mojo::PendingRemote<searchbox::mojom::Page> events,
      Profile* profile,
      content::WebContents* owner,
      GetSessionHandleCallback get_context,
      base::RepeatingCallback<std::optional<std::string>()> open_lens)
      : ContextualSearchboxHandler(
            std::move(commands), std::move(events), profile, owner,
            std::make_unique<OwnedContextualClient>(profile, owner),
            std::move(get_context)),
        open_lens_(std::move(open_lens)) {
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
    autocomplete_controller_observation_.Observe(autocomplete_controller());
  }

  void SetEventDisconnectHandler(base::OnceClosure callback) {
    page_.set_disconnect_handler(std::move(callback));
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

 private:
  base::RepeatingCallback<std::optional<std::string>()> open_lens_;
  std::optional<std::string> last_lens_error_;
};

// static
std::unique_ptr<OwnedContextualSession> OwnedContextualSession::Create(
    content::WebContents* owner,
    mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
    mojo::PendingRemote<searchbox::mojom::Page> events,
    base::OnceClosure invalidated) {
  if (!owner || !owner->GetPrimaryMainFrame() || !commands.is_valid() ||
      !events.is_valid()) {
    return nullptr;
  }
  auto session = std::unique_ptr<OwnedContextualSession>(
      new OwnedContextualSession(owner, std::move(invalidated)));
  session->Initialize(std::move(commands), std::move(events));
  return session;
}

OwnedContextualSession::OwnedContextualSession(
    content::WebContents* owner, base::OnceClosure invalidated)
    : content::WebContentsObserver(owner),
      profile_(Profile::FromBrowserContext(owner->GetBrowserContext())),
      frame_id_(owner->GetPrimaryMainFrame()->GetGlobalId()),
      invalidated_(std::move(invalidated)) {}

void OwnedContextualSession::Initialize(
    mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
    mojo::PendingRemote<searchbox::mojom::Page> events) {
  handler_ = std::make_unique<OwnedContextualHandler>(
      std::move(commands), std::move(events), profile_, web_contents(),
      base::BindRepeating(&OwnedContextualSession::GetSessionHandle,
                          base::Unretained(this)),
      base::BindRepeating(&OwnedContextualSession::OpenLensSearch,
                          base::Unretained(this)));
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
