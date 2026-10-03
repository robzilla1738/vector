// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_AUX_RESULT_PREVIEW_H_
#define CHROME_BROWSER_UI_AUX_RESULT_PREVIEW_H_

#include <map>
#include <optional>
#include <string>

#include "base/time/time.h"
#include "content/public/browser/frame_tree_node_id.h"
#include "content/public/browser/web_contents_user_data.h"
#include "content/public/browser/weak_document_ptr.h"
#include "url/origin.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "services/network/public/mojom/url_loader_factory.mojom.h"
#include "url/gurl.h"

namespace content {
class NavigationHandle;
class NavigationThrottleRegistry;
class WebContents;
}  // namespace content

namespace aux {

inline constexpr char kResultPreviewScheme[] = "aux-result";
inline constexpr char kResultPreviewCsp[] =
    "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; "
    "style-src 'unsafe-inline'; img-src data:; font-src data:; "
    "connect-src 'none'; media-src 'none'; frame-src 'none'; "
    "object-src 'none'; form-action 'none'; base-uri 'none'";

// The store is owned by one trusted shell WebContents. Tokens are memory-only
// and cannot be loaded from another window or Profile.
class ResultPreviewStore final
    : public content::WebContentsUserData<ResultPreviewStore> {
 public:
  ResultPreviewStore(const ResultPreviewStore&) = delete;
  ResultPreviewStore& operator=(const ResultPreviewStore&) = delete;
  ~ResultPreviewStore() override;

  static std::optional<std::string> Create(content::WebContents* owner,
                                           std::string html);
  static bool Release(content::WebContents* owner, const GURL& url);
  static std::optional<std::string> Read(content::WebContents* owner,
                                         const GURL& url);
  static bool IsValidURL(const GURL& url);

 private:
  friend class content::WebContentsUserData<ResultPreviewStore>;
  explicit ResultPreviewStore(content::WebContents* owner);

  struct Preview {
    std::string html;
    base::TimeTicks expires_at;
    content::WeakDocumentPtr owner_document;
  };
  void PurgeExpired();

  std::map<std::string, Preview> previews_;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};

// Exact direct-shell-subframe admission. Only the opaque result is exposed;
// no_access registration and CSP sandbox remain mandatory.
std::optional<url::Origin> GetAdmittedResultPreviewOrigin(
    content::NavigationHandle& navigation);

// Navigation-only. Subresource and worker factories are intentionally absent.
mojo::PendingRemote<network::mojom::URLLoaderFactory>
CreateResultPreviewURLLoaderFactory(
    content::FrameTreeNodeId frame_tree_node_id);
void MaybeAddResultPreviewNavigationThrottle(
    content::NavigationThrottleRegistry& registry);

}  // namespace aux

#endif  // CHROME_BROWSER_UI_AUX_RESULT_PREVIEW_H_
