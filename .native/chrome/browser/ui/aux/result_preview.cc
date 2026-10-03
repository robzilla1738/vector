// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/result_preview.h"
#include "chrome/browser/profiles/profile.h"

#include <array>
#include <cstdint>
#include <memory>
#include <string_view>
#include <utility>

#include "base/functional/bind.h"
#include "base/rand_util.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/time/time.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/global_routing_id.h"
#include "content/public/browser/navigation_throttle.h"
#include "content/public/browser/navigation_throttle_registry.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "mojo/public/cpp/bindings/self_owned_receiver.h"
#include "mojo/public/cpp/system/data_pipe.h"
#include "mojo/public/cpp/system/data_pipe_producer.h"
#include "mojo/public/cpp/system/string_data_source.h"
#include "net/base/net_errors.h"
#include "net/http/http_request_headers.h"
#include "net/http/http_response_headers.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/url_loader_completion_status.h"
#include "services/network/public/mojom/fetch_api.mojom.h"
#include "services/network/public/mojom/url_loader.mojom.h"
#include "services/network/public/mojom/url_response_head.mojom.h"

namespace aux {
namespace {

constexpr size_t kMaxHtmlBytes = 256 * 1024;
constexpr size_t kMaxPreviews = 32;
constexpr base::TimeDelta kLifetime = base::Minutes(10);

std::optional<std::string> TokenFromURL(const GURL& url) {
  if (!url.is_valid() || !url.SchemeIs(kResultPreviewScheme) ||
      url.host() != "preview" || url.has_username() || url.has_password() ||
      url.has_port() || url.has_query() || url.has_ref() ||
      url.path().size() != 49 || url.path()[0] != '/') {
    return std::nullopt;
  }
  const std::string token(url.path().substr(1));
  for (char character : token) {
    if ((character < '0' || character > '9') &&
        (character < 'a' || character > 'f')) {
      return std::nullopt;
    }
  }
  return token;
}

bool IsAuxShell(content::WebContents* contents) {
  if (!contents || !contents->GetPrimaryMainFrame()) {
    return false;
  }
  const GURL& url = contents->GetPrimaryMainFrame()->GetLastCommittedURL();
  return url.is_valid() && url.SchemeIs("chrome") && url.host() == "aux" &&
         url.path() == "/" && !url.has_query() && !url.has_ref();
}

network::mojom::URLResponseHeadPtr ResponseHead(size_t content_length) {
  auto head = network::mojom::URLResponseHead::New();
  head->mime_type = "text/html";
  head->charset = "utf-8";
  head->content_length = content_length;
  head->headers = net::HttpResponseHeaders::Builder({1, 1}, "200 OK")
                      .AddHeader("Content-Type", "text/html; charset=utf-8")
                      .AddHeader("Content-Security-Policy", kResultPreviewCsp)
                      .AddHeader("Cache-Control", "no-store")
                      .AddHeader("X-Content-Type-Options", "nosniff")
                      .AddHeader("Referrer-Policy", "no-referrer")
                      .AddHeader("Permissions-Policy",
                                 "camera=(), microphone=(), geolocation=(), "
                                 "display-capture=(), clipboard-read=(), "
                                 "clipboard-write=()")
                      .Build();
  return head;
}

struct WriteData {
  mojo::Remote<network::mojom::URLLoaderClient> client;
  std::string html;
  std::unique_ptr<mojo::DataPipeProducer> producer;
};

void OnWrite(std::unique_ptr<WriteData> write_data, MojoResult result) {
  write_data->producer.reset();
  write_data->client->OnComplete(network::URLLoaderCompletionStatus(
      result == MOJO_RESULT_OK ? net::OK : net::ERR_FAILED));
}

class ResultPreviewURLLoaderFactory final
    : public network::mojom::URLLoaderFactory {
 public:
  explicit ResultPreviewURLLoaderFactory(content::FrameTreeNodeId node_id)
      : node_id_(node_id) {}

  void CreateLoaderAndStart(
      mojo::PendingReceiver<network::mojom::URLLoader> loader,
      int32_t request_id,
      uint32_t options,
      const network::ResourceRequest& request,
      mojo::PendingRemote<network::mojom::URLLoaderClient> client_remote,
      const net::MutableNetworkTrafficAnnotationTag& traffic_annotation)
      override {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    mojo::Remote<network::mojom::URLLoaderClient> client(
        std::move(client_remote));
    content::WebContents* owner =
        content::WebContents::FromFrameTreeNodeId(node_id_);
    if (!owner || !IsAuxShell(owner) ||
        owner->GetPrimaryMainFrame()->GetFrameTreeNodeId() == node_id_ ||
        request.destination != network::mojom::RequestDestination::kIframe ||
        request.method != net::HttpRequestHeaders::kGetMethod ||
        !request.request_initiator || request.request_initiator->opaque() ||
        !request.request_initiator->GetURL().SchemeIs("chrome") ||
        request.request_initiator->host() != "aux") {
      client->OnComplete(
          network::URLLoaderCompletionStatus(net::ERR_ACCESS_DENIED));
      return;
    }
    std::optional<std::string> html =
        ResultPreviewStore::Read(owner, request.url);
    if (!html) {
      client->OnComplete(
          network::URLLoaderCompletionStatus(net::ERR_FILE_NOT_FOUND));
      return;
    }

    mojo::ScopedDataPipeProducerHandle producer;
    mojo::ScopedDataPipeConsumerHandle consumer;
    if (mojo::CreateDataPipe(nullptr, producer, consumer) != MOJO_RESULT_OK) {
      client->OnComplete(
          network::URLLoaderCompletionStatus(net::ERR_INSUFFICIENT_RESOURCES));
      return;
    }
    client->OnReceiveResponse(ResponseHead(html->size()), std::move(consumer),
                              std::nullopt);
    auto write_data = std::make_unique<WriteData>();
    write_data->client = std::move(client);
    write_data->html = std::move(*html);
    write_data->producer =
        std::make_unique<mojo::DataPipeProducer>(std::move(producer));
    mojo::DataPipeProducer* producer_ptr = write_data->producer.get();
    std::string_view html_view(write_data->html);
    producer_ptr->Write(
        std::make_unique<mojo::StringDataSource>(
            html_view, mojo::StringDataSource::AsyncWritingMode::
                           STRING_STAYS_VALID_UNTIL_COMPLETION),
        base::BindOnce(&OnWrite, std::move(write_data)));
  }

  void Clone(mojo::PendingReceiver<network::mojom::URLLoaderFactory> receiver)
      override {
    mojo::MakeSelfOwnedReceiver(
        std::make_unique<ResultPreviewURLLoaderFactory>(node_id_),
        std::move(receiver));
  }

 private:
  const content::FrameTreeNodeId node_id_;
};

class ResultPreviewNavigationThrottle final
    : public content::NavigationThrottle {
 public:
  explicit ResultPreviewNavigationThrottle(
      content::NavigationThrottleRegistry& registry)
      : content::NavigationThrottle(registry) {}

  ThrottleCheckResult WillStartRequest() override { return BLOCK_REQUEST; }
  ThrottleCheckResult WillRedirectRequest() override { return BLOCK_REQUEST; }
  const char* GetNameForLogging() override {
    return "ResultPreviewNavigationThrottle";
  }
};

}  // namespace

WEB_CONTENTS_USER_DATA_KEY_IMPL(ResultPreviewStore);

ResultPreviewStore::ResultPreviewStore(content::WebContents* owner)
    : content::WebContentsUserData<ResultPreviewStore>(*owner) {}

ResultPreviewStore::~ResultPreviewStore() = default;

void ResultPreviewStore::PurgeExpired() {
  const base::TimeTicks now = base::TimeTicks::Now();
  for (auto it = previews_.begin(); it != previews_.end();) {
    if (it->second.expires_at <= now) {
      it = previews_.erase(it);
    } else {
      ++it;
    }
  }
}

// static
std::optional<std::string> ResultPreviewStore::Create(
    content::WebContents* owner,
    std::string html) {
  if (!IsAuxShell(owner) || owner->GetBrowserContext()->IsOffTheRecord() ||
      html.empty() || html.size() > kMaxHtmlBytes ||
      html.find('\0') != std::string::npos) {
    return std::nullopt;
  }
  if (!FromWebContents(owner)) {
    CreateForWebContents(owner);
  }
  auto* store = FromWebContents(owner);
  store->PurgeExpired();
  if (store->previews_.size() >= kMaxPreviews) {
    return std::nullopt;
  }
  for (int attempt = 0; attempt < 3; ++attempt) {
    std::array<uint8_t, 24> random_bytes;
    base::RandBytes(random_bytes);
    const std::string token = base::ToLowerASCII(base::HexEncode(random_bytes));
    if (store->previews_.contains(token)) {
      continue;
    }
    store->previews_.emplace(
        token, Preview{std::move(html), base::TimeTicks::Now() + kLifetime,
                       owner->GetPrimaryMainFrame()->GetWeakDocumentPtr()});
    return std::string(kResultPreviewScheme) + "://preview/" + token;
  }
  return std::nullopt;
}

// static
bool ResultPreviewStore::Release(content::WebContents* owner, const GURL& url) {
  auto token = TokenFromURL(url);
  auto* store = owner ? FromWebContents(owner) : nullptr;
  return token && store && store->previews_.erase(*token) == 1;
}

// static
std::optional<std::string> ResultPreviewStore::Read(content::WebContents* owner,
                                                    const GURL& url) {
  auto token = TokenFromURL(url);
  auto* store = owner ? FromWebContents(owner) : nullptr;
  if (!token || !store || !IsAuxShell(owner)) {
    return std::nullopt;
  }
  store->PurgeExpired();
  auto it = store->previews_.find(*token);
  if (it == store->previews_.end() ||
      owner->GetBrowserContext()->IsOffTheRecord() ||
      it->second.owner_document.AsRenderFrameHostIfValid() !=
          owner->GetPrimaryMainFrame()) {
    return std::nullopt;
  }
  return it->second.html;
}

// static
bool ResultPreviewStore::IsValidURL(const GURL& url) {
  return TokenFromURL(url).has_value();
}

std::optional<url::Origin> GetAdmittedResultPreviewOrigin(
    content::NavigationHandle& navigation) {
  auto* owner = navigation.GetWebContents();
  auto* parent = navigation.GetParentFrame();
  const auto& initiator = navigation.GetInitiatorOrigin();
  const auto& initiator_token = navigation.GetInitiatorFrameToken();
  auto* initiator_frame = initiator_token
      ? content::RenderFrameHost::FromFrameToken(
            content::GlobalRenderFrameHostToken(
                navigation.GetInitiatorProcessId(), *initiator_token))
      : nullptr;
  if (!IsAuxShell(owner) || !parent || !parent->IsActive() ||
      !parent->IsRenderFrameLive() ||
      !Profile::FromBrowserContext(owner->GetBrowserContext())->IsRegularProfile() ||
      parent != owner->GetPrimaryMainFrame() || initiator_frame != parent ||
      !initiator || initiator->opaque() ||
      !initiator->IsSameOriginWith(parent->GetLastCommittedOrigin()) ||
      !ResultPreviewStore::Read(owner, navigation.GetURL())) {
    return std::nullopt;
  }
  // The precursor is the destination, never the privileged shell initiator.
  // Only a fresh opaque derivative can leave this private admission boundary.
  return url::Origin::CreateFromNormalizedTuple(kResultPreviewScheme, "preview", 0)
      .DeriveNewOpaqueOrigin();
}

mojo::PendingRemote<network::mojom::URLLoaderFactory>
CreateResultPreviewURLLoaderFactory(
    content::FrameTreeNodeId frame_tree_node_id) {
  mojo::PendingRemote<network::mojom::URLLoaderFactory> remote;
  mojo::MakeSelfOwnedReceiver(
      std::make_unique<ResultPreviewURLLoaderFactory>(frame_tree_node_id),
      remote.InitWithNewPipeAndPassReceiver());
  return remote;
}

void MaybeAddResultPreviewNavigationThrottle(
    content::NavigationThrottleRegistry& registry) {
  content::RenderFrameHost* previous = content::RenderFrameHost::FromID(
      registry.GetNavigationHandle().GetPreviousRenderFrameHostId());
  if (previous &&
      previous->GetLastCommittedURL().SchemeIs(kResultPreviewScheme)) {
    registry.AddThrottle(
        std::make_unique<ResultPreviewNavigationThrottle>(registry));
  }
}

}  // namespace aux
