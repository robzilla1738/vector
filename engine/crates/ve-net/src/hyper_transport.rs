//! Real HTTP(S) transport on hyper 1 + rustls (feature `http`).
//!
//! One connection per request (no pooling yet), HTTP/1.1 or HTTP/2 chosen by
//! ALPN over TLS, HTTP/1.1 in the clear. A dedicated single-threaded tokio
//! runtime is owned by the transport so the rest of the engine stays
//! synchronous.

use std::sync::Arc;
use std::time::Duration;

use bytes::Bytes;
use http::header::{HOST, HeaderValue};
use http::{Request as HttpRequest, Version};
use http_body_util::{BodyExt, Full};
use hyper_util::rt::{TokioExecutor, TokioIo};
use tokio::net::TcpStream;
use tokio_rustls::TlsConnector;
use tokio_rustls::rustls::pki_types::ServerName;
use tokio_rustls::rustls::{ClientConfig, RootCertStore};

use crate::transport::Transport;
use crate::{NetError, Request, Response};

/// hyper + rustls transport.
pub struct HyperTransport {
    runtime: tokio::runtime::Runtime,
    tls: TlsConnector,
    /// Connect + response timeout.
    pub timeout: Duration,
}

impl std::fmt::Debug for HyperTransport {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("HyperTransport")
            .field("timeout", &self.timeout)
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
        let mut config = ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();
        config.alpn_protocols = vec![b"h2".to_vec(), b"http/1.1".to_vec()];
        Ok(Self {
            runtime,
            tls: TlsConnector::from(Arc::new(config)),
            timeout: Duration::from_secs(30),
        })
    }

    async fn exchange(&self, request: &Request) -> Result<Response, NetError> {
        let url = &request.url;
        let host = url
            .host_str()
            .ok_or_else(|| NetError::Http("url without host".into()))?
            .to_owned();
        let https = url.scheme() == "https";
        let port = url
            .port_or_known_default()
            .unwrap_or(if https { 443 } else { 80 });
        let tcp = TcpStream::connect((host.as_str(), port))
            .await
            .map_err(|e| NetError::Transport(format!("connect {host}:{port}: {e}")))?;

        let mut builder = HttpRequest::builder()
            .method(request.method.clone())
            .uri(url.as_str());
        for (name, value) in &request.headers {
            builder = builder.header(name, value);
        }
        let host_header = if url.port().is_some() {
            format!("{host}:{port}")
        } else {
            host.clone()
        };
        let body = Full::new(request.body.clone().unwrap_or_default());

        let (parts, body_bytes, final_version) = if https {
            let server_name = ServerName::try_from(host.clone())
                .map_err(|e| NetError::Transport(format!("server name: {e}")))?;
            let tls = self
                .tls
                .connect(server_name, tcp)
                .await
                .map_err(|e| NetError::Transport(format!("tls: {e}")))?;
            let h2 = tls.get_ref().1.alpn_protocol().is_some_and(|p| p == b"h2");
            let io = TokioIo::new(tls);
            if h2 {
                let (mut sender, conn) =
                    hyper::client::conn::http2::handshake(TokioExecutor::new(), io)
                        .await
                        .map_err(|e| NetError::Transport(format!("h2 handshake: {e}")))?;
                tokio::spawn(conn);
                let req = builder
                    .version(Version::HTTP_2)
                    .body(body)
                    .map_err(|e| NetError::Http(e.to_string()))?;
                let res = sender
                    .send_request(req)
                    .await
                    .map_err(|e| NetError::Transport(format!("h2 request: {e}")))?;
                let (parts, body) = res.into_parts();
                let bytes = body
                    .collect()
                    .await
                    .map_err(|e| NetError::Transport(format!("h2 body: {e}")))?
                    .to_bytes();
                (parts, bytes, Version::HTTP_2)
            } else {
                Self::http1(
                    io,
                    builder.header(
                        HOST,
                        HeaderValue::from_str(&host_header)
                            .map_err(|e| NetError::Http(e.to_string()))?,
                    ),
                    body,
                )
                .await?
            }
        } else {
            let io = TokioIo::new(tcp);
            Self::http1(
                io,
                builder.header(
                    HOST,
                    HeaderValue::from_str(&host_header)
                        .map_err(|e| NetError::Http(e.to_string()))?,
                ),
                body,
            )
            .await?
        };
        let _ = final_version;
        Ok(Response::new(
            url.clone(),
            parts.status,
            parts.headers,
            body_bytes,
        ))
    }

    async fn http1<I>(
        io: I,
        builder: http::request::Builder,
        body: Full<Bytes>,
    ) -> Result<(http::response::Parts, Bytes, Version), NetError>
    where
        I: hyper::rt::Read + hyper::rt::Write + Unpin + Send + 'static,
    {
        let (mut sender, conn) = hyper::client::conn::http1::handshake(io)
            .await
            .map_err(|e| NetError::Transport(format!("h1 handshake: {e}")))?;
        tokio::spawn(conn);
        let req = builder
            .body(body)
            .map_err(|e| NetError::Http(e.to_string()))?;
        let res = sender
            .send_request(req)
            .await
            .map_err(|e| NetError::Transport(format!("h1 request: {e}")))?;
        let (parts, body) = res.into_parts();
        let bytes = body
            .collect()
            .await
            .map_err(|e| NetError::Transport(format!("h1 body: {e}")))?
            .to_bytes();
        Ok((parts, bytes, Version::HTTP_11))
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
