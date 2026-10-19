// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_OWNED_CONTEXTUAL_SESSION_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_OMNIBOX_OWNED_CONTEXTUAL_SESSION_H_

#include <memory>
#include <optional>
#include <string>

#include "base/functional/callback.h"
#include "base/types/expected.h"
#include "components/contextual_search/contextual_search_types.h"
#include "mojo/public/cpp/base/big_buffer.h"
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
  // Private C++ adapter only; never expose this pipe to arbitrary renderer code.
  // The extension API revalidates its extension/frame/session before each call.
  searchbox::mojom::PageHandler* commands() const;
  // Returns an error if no eligible real native action can be dispatched.
  // Success acknowledges dispatch, not server response or overlay visibility.
  std::optional<std::string> OpenLensSearch();
  using ContextResult = base::expected<base::UnguessableToken,
      contextual_search::ContextUploadErrorType>;
  using ContextCallback = base::OnceCallback<void(ContextResult)>;
  // Accepted context tokens are not upload-success acknowledgements. Actual
  // processing/server success/failure is reported on the paired native Page.
  void AddFileContext(searchbox::mojom::SelectedFileInfoPtr info,
                      mojo_base::BigBuffer bytes, ContextCallback callback);
  void AddTabContext(int32_t native_tab_handle, bool delay_upload,
                     ContextCallback callback);
  bool DeleteContext(const base::UnguessableToken& token,
                     bool from_automatic_chip);
  bool ClearFiles(bool block_auto_suggested_tabs);
  bool NotifySessionStarted();
  bool NotifySessionAbandoned();
  bool Query(const std::u16string& input, bool prevent_inline_autocomplete,
             uint32_t cursor_position, const std::string& keyword,
             bool is_on_focus);
  bool StopAutocomplete(bool clear_result);
  bool OpenMatch(uint32_t sequence_id, uint8_t line, const GURL& url,
                 bool matches_showing, uint8_t mouse_button,
                 searchbox::mojom::ActionModifiersPtr modifiers,
                 bool via_keyboard);
  bool ExecuteAction(uint32_t sequence_id, uint8_t line, uint8_t action_index,
                     const GURL& url, uint8_t mouse_button,
                     const searchbox::mojom::ActionModifiers& modifiers);
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
  int32_t query_id_ = 0;
  bool closed_ = false;
  base::WeakPtrFactory<OwnedContextualSession> weak_factory_{this};
};
}  // namespace extensions
#endif
