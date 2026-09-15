//! Real HTTP(S) transport on hyper 1 + rustls (feature `http`).
//!
//! A pooled `hyper_util` legacy client: HTTP/1.1 keep-alive connections are
//! reused per host and HTTP/2 connections (ALPN) are multiplexed, so a page
//! and its subresources share a handful of sockets instead of one TCP+TLS
//! handshake per request. Bodies are requested compressed
//! (`Accept-Encoding: gzip, deflate, br`) and decoded here, so the rest of
//! the engine only ever sees identity bodies. A dedicated tokio runtime is
//! owned by the transport so the rest of the engine stays synchronous.

use std::sync::Arc;
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
use hyper_util::rt::TokioExecutor;
use tokio_rustls::rustls::{ClientConfig, RootCertStore};

use crate::transport::Transport;
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

type PooledClient = Client<Counting<HttpsConnector<HttpConnector>>, Full<Bytes>>;

/// hyper + rustls transport with a per-host connection pool.
pub struct HyperTransport {
    runtime: tokio::runtime::Runtime,
    client: PooledClient,
    opened: Arc<AtomicUsize>,
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
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .map_err(|e| NetError::Transport(format!("tokio runtime: {e}")))?;
        let mut roots = RootCertStore::empty();
        roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
        // ALPN (h2, http/1.1) is set by the connector builder below
        let config = ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();
        let mut http = HttpConnector::new();
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
            timeout: Duration::from_secs(30),
        })
    }

    /// Number of TCP connections the pool has opened so far.
    #[must_use]
    pub fn connections_opened(&self) -> usize {
        self.opened.load(Ordering::Relaxed)
    }

    async fn exchange(&self, request: &Request) -> Result<Response, NetError> {
        let url = &request.url;
        let uri: Uri = url
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
        let req = builder
            .body(body)
            .map_err(|e| NetError::Http(e.to_string()))?;
        let res = self.client.request(req).await.map_err(|e| {
            NetError::Transport(format!("request {}: {e}", url.host_str().unwrap_or("?")))
        })?;
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

impl Transport for HyperTransport {
    fn send(&self, request: &Request) -> Result<Response, NetError> {
        self.runtime.block_on(async {
            tokio::time::timeout(self.timeout, self.exchange(request))
                .await
                .map_err(|_| NetError::Transport(format!("timed out after {:?}", self.timeout)))?
        })
    }

    fn name(&self) -> &'static str {
        "hyper"
    }
}
