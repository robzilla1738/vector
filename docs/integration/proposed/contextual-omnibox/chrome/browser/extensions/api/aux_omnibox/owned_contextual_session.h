// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_OWNED_CONTEXTUAL_SESSION_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_OWNED_CONTEXTUAL_SESSION_H_

#include <memory>
#include <optional>
#include <string>

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "components/omnibox/browser/searchbox.mojom.h"
#include "content/public/browser/global_routing_id.h"
#include "content/public/browser/web_contents_observer.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "mojo/public/cpp/bindings/pending_remote.h"

class Profile;
namespace contextual_search {
class ContextualSearchSessionHandle;
}
namespace extensions {
class OwnedContextualHandler;

// One extension document's native search session. Uses the same handler and
// contextual service as Chromium's Realbox, never the visible URL bar model.
// The caller owns the Page receiver and translates its typed native events to
// the supplied extension events. Closing either pipe invalidates the session.
class OwnedContextualSession final : public content::WebContentsObserver {
 public:
  static std::unique_ptr<OwnedContextualSession> Create(
      content::WebContents* owner,
      mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
      mojo::PendingRemote<searchbox::mojom::Page> events,
      base::OnceClosure invalidated);
  ~OwnedContextualSession() override;
  OwnedContextualSession(const OwnedContextualSession&) = delete;
  OwnedContextualSession& operator=(const OwnedContextualSession&) = delete;

  bool IsCurrentDocument() const;
  // Returns an error if no eligible real native action can be dispatched.
  // Success acknowledges dispatch, not server response or overlay visibility.
  std::optional<std::string> OpenLensSearch();
  void Close();

 private:
  OwnedContextualSession(content::WebContents* owner,
                         base::OnceClosure invalidated);
  void Initialize(
      mojo::PendingReceiver<searchbox::mojom::PageHandler> commands,
      mojo::PendingRemote<searchbox::mojom::Page> events);
  contextual_search::ContextualSearchSessionHandle* GetSessionHandle();
  void DidFinishNavigation(content::NavigationHandle* navigation) override;
  void WebContentsDestroyed() override;

  const raw_ptr<Profile> profile_;
  const content::GlobalRenderFrameHostId frame_id_;
  base::OnceClosure invalidated_;
  // Handler observes the handle. It must be destroyed first on every exit.
  std::unique_ptr<contextual_search::ContextualSearchSessionHandle> context_;
  std::unique_ptr<OwnedContextualHandler> handler_;
  bool closed_ = false;
  base::WeakPtrFactory<OwnedContextualSession> weak_factory_{this};
};
}  // namespace extensions
#endif
