//! Real HTTP(S) transport on hyper 1 + rustls (feature `http`).
//!
//! A pooled `hyper_util` legacy client: HTTP/1.1 keep-alive connections are
//! reused per host and HTTP/2 connections (ALPN) are multiplexed, so a page
//! and its subresources share a handful of sockets instead of one TCP+TLS
//! handshake per request. Bodies are requested compressed
//! (`Accept-Encoding: gzip, deflate, br`) and decoded here, so the rest of
//! the engine only ever sees identity bodies. A 2-worker tokio runtime is
//! owned by the transport so [`crate::Transport::start_many`] can spawn
//! without blocking the caller.

use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::task::{Context, Poll};
use std::time::Duration;

use bytes::Bytes;
use http::header::{ACCEPT_ENCODING, CONTENT_ENCODING, CONTENT_LENGTH, HeaderValue};
use http::{Request as HttpRequest, Uri};
use http_body_util::{BodyExt, Full};
use hyper_rustls::HttpsConnector;
use hyper_util::client::legacy::Client;
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::connect::dns::{GaiResolver, Name};
use hyper_util::rt::TokioExecutor;
use tokio_rustls::rustls::{ClientConfig, RootCertStore};

use crate::transport::{PendingFetches, Transport};
use crate::{NetError, Request, Response, decode_body};

/// Connector wrapper that counts how many connections were actually
/// opened — the observable effect of pooling.
#[derive(Clone)]
struct Counting<C> {
    inner: C,
    opened: Arc<AtomicUsize>,
}

impl<C> tower_service::Service<Uri> for Counting<C>
where
    C: tower_service::Service<Uri>,
{
    type Response = C::Response;
    type Error = C::Error;
    type Future = C::Future;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, dst: Uri) -> Self::Future {
        self.opened.fetch_add(1, Ordering::Relaxed);
        self.inner.call(dst)
    }
}

/// DNS answers from the broker's policy-time lookup. The connector must use
/// these instead of calling getaddrinfo again (Finding 2).
#[derive(Clone)]
struct PinnedResolver {
    pinned: Arc<Mutex<HashMap<String, Vec<SocketAddr>>>>,
    inner: GaiResolver,
}

struct PinnedAddrs {
    iter: std::vec::IntoIter<SocketAddr>,
}

impl Iterator for PinnedAddrs {
    type Item = SocketAddr;
    fn next(&mut self) -> Option<SocketAddr> {
        self.iter.next()
    }
}

impl tower_service::Service<Name> for PinnedResolver {
    type Response = PinnedAddrs;
    type Error = std::io::Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<PinnedAddrs, std::io::Error>> + Send>,
    >;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, name: Name) -> Self::Future {
        let host = name.as_str().to_string();
        if let Ok(guard) = self.pinned.lock() {
            if let Some(addrs) = guard.get(&host) {
                let addrs = addrs.clone();
                return Box::pin(async move {
                    Ok(PinnedAddrs {
                        iter: addrs.into_iter(),
                    })
                });
            }
        }
        let fut = self.inner.call(name);
        Box::pin(async move {
            let addrs = fut.await?;
            Ok(PinnedAddrs {
                iter: addrs.collect::<Vec<_>>().into_iter(),
            })
        })
    }
}

type PooledClient = Client<Counting<HttpsConnector<HttpConnector<PinnedResolver>>>, Full<Bytes>>;

/// hyper + rustls transport with a per-host connection pool.
pub struct HyperTransport {
    runtime: tokio::runtime::Runtime,
    client: PooledClient,
    opened: Arc<AtomicUsize>,
    pinned: Arc<Mutex<HashMap<String, Vec<SocketAddr>>>>,
    /// Connect + response timeout.
    pub timeout: Duration,
}

impl std::fmt::Debug for HyperTransport {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("HyperTransport")
            .field("timeout", &self.timeout)
            .field("connections_opened", &self.connections_opened())
            .finish_non_exhaustive()
    }
}

impl HyperTransport {
    /// Creates a transport trusting the Mozilla root store (`webpki-roots`).
    pub fn new() -> Result<Self, NetError> {
        Self::with_extra_roots(std::iter::empty::<Vec<u8>>())
    }

    /// Same as [`Self::new`], plus extra DER certificates for fixture/WPT CAs.
    pub fn with_extra_roots(extra: impl IntoIterator<Item = Vec<u8>>) -> Result<Self, NetError> {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(2)
            .thread_name("ve-net")
            .enable_all()
            .build()
            .map_err(|e| NetError::Transport(format!("tokio runtime: {e}")))?;
        let mut roots = RootCertStore::empty();
        roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
        for der in extra {
            let _ = roots.add(tokio_rustls::rustls::pki_types::CertificateDer::from(der));
        }
        // ALPN (h2, http/1.1) is set by the connector builder below
        let config = ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();
        let pinned = Arc::new(Mutex::new(HashMap::new()));
        let mut http = HttpConnector::new_with_resolver(PinnedResolver {
            pinned: Arc::clone(&pinned),
            inner: GaiResolver::new(),
        });
        http.enforce_http(false);
        http.set_connect_timeout(Some(Duration::from_secs(10)));
        http.set_nodelay(true);
        let https = hyper_rustls::HttpsConnectorBuilder::new()
            .with_tls_config(config)
            .https_or_http()
            .enable_http1()
            .enable_http2()
            .wrap_connector(http);
        let opened = Arc::new(AtomicUsize::new(0));
        let client = Client::builder(TokioExecutor::new())
            .pool_idle_timeout(Duration::from_secs(90))
            .pool_max_idle_per_host(8)
            .build(Counting {
                inner: https,
                opened: Arc::clone(&opened),
            });
        Ok(Self {
            runtime,
            client,
            opened,
            pinned,
            timeout: Duration::from_secs(30),
        })
    }

    /// Number of TCP connections the pool has opened so far.
    #[must_use]
    pub fn connections_opened(&self) -> usize {
        self.opened.load(Ordering::Relaxed)
    }

    async fn exchange(&self, request: &Request) -> Result<Response, NetError> {
        exchange(self.client.clone(), request.clone()).await
    }
}

/// One exchange on a cloned client handle (so several can run as spawned
/// tasks on the transport's runtime).
fn build_http_request(request: &Request) -> Result<HttpRequest<Full<Bytes>>, NetError> {
    let uri: Uri = request
        .url
        .as_str()
        .parse()
        .map_err(|e| NetError::Http(format!("uri: {e}")))?;
    let mut builder = HttpRequest::builder()
        .method(request.method.clone())
        .uri(uri);
    let mut wants_encoding = true;
    for (name, value) in &request.headers {
        if name == ACCEPT_ENCODING {
            wants_encoding = false;
        }
        builder = builder.header(name, value);
    }
    if wants_encoding {
        builder = builder.header(
            ACCEPT_ENCODING,
            HeaderValue::from_static("gzip, deflate, br"),
        );
    }
    let body = Full::new(request.body.clone().unwrap_or_default());
    builder
        .body(body)
        .map_err(|e| NetError::Http(e.to_string()))
}

fn idempotent(method: &str) -> bool {
    method.eq_ignore_ascii_case("GET") || method.eq_ignore_ascii_case("HEAD")
}

async fn exchange(client: PooledClient, request: Request) -> Result<Response, NetError> {
    {
        let url = &request.url;
        let req = build_http_request(&request)?;
        let res = match client.request(req).await {
            Ok(res) => res,
            Err(first) if idempotent(request.method.as_str()) => {
                let retry = build_http_request(&request)?;
                client.request(retry).await.map_err(|e| {
                    NetError::Transport(format!(
                        "request {}: {e} (after {first})",
                        url.host_str().unwrap_or("?")
                    ))
                })?
            }
            Err(e) => {
                return Err(NetError::Transport(format!(
                    "request {}: {e}",
                    url.host_str().unwrap_or("?")
                )));
            }
        };
        let (mut parts, body) = res.into_parts();
        let raw = body
            .collect()
            .await
            .map_err(|e| NetError::Transport(format!("body: {e}")))?
            .to_bytes();
        let bytes = match parts
            .headers
            .get(CONTENT_ENCODING)
            .and_then(|v| v.to_str().ok())
        {
            Some(enc) if !enc.eq_ignore_ascii_case("identity") => {
                let decoded = decode_body(enc, &raw)?;
                // the body is identity from here on; keep the original coding
                // for diagnostics
                parts.headers.remove(CONTENT_LENGTH);
                if let Some(v) = parts.headers.remove(CONTENT_ENCODING) {
                    parts.headers.insert("x-ve-content-encoding", v);
                }
                decoded
            }
            _ => raw,
        };
        Ok(Response::new(
            url.clone(),
            parts.status,
            parts.headers,
            bytes,
        ))
    }
}

impl HyperTransport {
    fn pin_requests(&self, requests: &[Request]) {
        let Ok(mut map) = self.pinned.lock() else {
            return;
        };
        map.clear();
        for request in requests {
            if let (Some(host), Some(addrs)) = (request.url.host_str(), request.resolved.as_ref()) {
                map.insert(host.to_string(), addrs.clone());
            }
        }
    }
}

impl Transport for HyperTransport {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        self.pin_requests(std::slice::from_ref(request));
        self.runtime.block_on(async {
            tokio::time::timeout(self.timeout, self.exchange(request))
                .await
                .map_err(|_| NetError::Transport(format!("timed out after {:?}", self.timeout)))?
        })
    }

    fn send_many(&self, requests: &[Request]) -> Vec<Result<Response, NetError>> {
        self.start_many(requests).join()
    }

    fn start_many(&self, requests: &[Request]) -> PendingFetches {
        if requests.is_empty() {
            return PendingFetches::from_ready(Vec::new());
        }
        self.pin_requests(requests);
        let timeout = self.timeout;
        let mut handles = Vec::with_capacity(requests.len());
        for request in requests {
            let client = self.client.clone();
            let request = request.clone();
            handles.push(self.runtime.spawn(async move {
                tokio::time::timeout(timeout, exchange(client, request))
                    .await
                    .map_err(|_| NetError::Transport(format!("timed out after {timeout:?}")))?
            }));
        }
        let handle = self.runtime.handle().clone();
        PendingFetches::from_join(move || {
            handle.block_on(async {
                let mut out = Vec::with_capacity(handles.len());
                for task in handles {
                    out.push(task.await.unwrap_or_else(|e| {
                        Err(NetError::Transport(format!("send_many join: {e}")))
                    }));
                }
                out
            })
        })
    }

    fn warmup_dns(&self, host: &str, port: u16) {
        let host = host.to_owned();
        std::mem::drop(self.runtime.spawn(async move {
            let _ = tokio::task::spawn_blocking(move || {
                use std::net::ToSocketAddrs;
                let _ = (host.as_str(), port).to_socket_addrs();
            })
            .await;
        }));
    }

    fn name(&self) -> &'static str {
        "hyper"
    }
}
