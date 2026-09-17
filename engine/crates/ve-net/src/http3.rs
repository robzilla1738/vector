//! HTTP/3 advertisement and speaking (VEC-003 / M1).
//!
//! The hyper transport speaks HTTP/1.1 and HTTP/2. When a response carries
//! `Alt-Svc: h3=…` we record the advertised endpoint. With the `http` feature
//! the engine can then issue a real HTTP/3 GET over QUIC (`quinn` + `h3`).

use http::header::{HeaderMap, HeaderValue};

/// Advertised HTTP/3 alternative service.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct H3Endpoint {
    /// Host override (`None` means the origin host).
    pub host: Option<String>,
    /// UDP port.
    pub port: u16,
}

/// Returns `true` when `headers` advertise HTTP/3 via `Alt-Svc`.
#[must_use]
pub fn advertises_http3(headers: &HeaderMap) -> bool {
    parse_h3_alt_svc(headers).is_some()
}

/// Parses the first `h3=` alternative from `Alt-Svc`.
#[must_use]
pub fn parse_h3_alt_svc(headers: &HeaderMap) -> Option<H3Endpoint> {
    headers.get_all("alt-svc").iter().find_map(parse_h3_value)
}

fn parse_h3_value(v: &HeaderValue) -> Option<H3Endpoint> {
    let s = v.to_str().ok()?.to_ascii_lowercase();
    s.split(',').find_map(|part| {
        let part = part.trim();
        let rest = part.strip_prefix("h3=")?;
        let quoted = rest.trim_start_matches('"');
        let end = quoted.find('"').unwrap_or(quoted.len());
        parse_h3_authority(&quoted[..end])
    })
}

fn parse_h3_authority(authority: &str) -> Option<H3Endpoint> {
    let authority = authority.trim();
    if let Some(port) = authority.strip_prefix(':') {
        return Some(H3Endpoint {
            host: None,
            port: port.parse().ok()?,
        });
    }
    if let Some((host, port)) = authority.rsplit_once(':') {
        let host = host.trim_matches(['[', ']']);
        if host.is_empty() {
            return None;
        }
        return Some(H3Endpoint {
            host: Some(host.to_owned()),
            port: port.parse().ok()?,
        });
    }
    None
}

/// Protocols a context has observed on the wire.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct ProtocolSupport {
    /// HTTP/1.1 was used.
    pub http1: bool,
    /// HTTP/2 (ALPN `h2`) was used.
    pub http2: bool,
    /// An origin advertised HTTP/3.
    pub http3: bool,
    /// An HTTP/3 response was received over QUIC.
    pub http3_spoken: bool,
    /// A WebSocket handshake was attempted.
    pub websocket: bool,
}

/// Performs an HTTP/3 GET over QUIC.
#[cfg(feature = "http")]
pub fn get(
    url: &str,
    server_name: &str,
    addr: std::net::SocketAddr,
) -> Result<crate::Response, crate::NetError> {
    get_with_roots(url, server_name, addr, None)
}

/// HTTP/3 GET with an optional extra trust anchor (tests).
#[cfg(feature = "http")]
pub fn get_with_roots(
    url: &str,
    server_name: &str,
    addr: std::net::SocketAddr,
    extra_root: Option<rustls::pki_types::CertificateDer<'static>>,
) -> Result<crate::Response, crate::NetError> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|e| crate::NetError::Transport(format!("tokio runtime: {e}")))?;
    runtime.block_on(get_async(url, server_name, addr, extra_root))
}

#[cfg(feature = "http")]
async fn get_async(
    url: &str,
    server_name: &str,
    addr: std::net::SocketAddr,
    extra_root: Option<rustls::pki_types::CertificateDer<'static>>,
) -> Result<crate::Response, crate::NetError> {
    use std::sync::Arc;

    use bytes::Buf;
    use rustls::RootCertStore;
    use rustls::pki_types::ServerName;

    let parsed = url::Url::parse(url).map_err(|e| crate::NetError::Transport(e.to_string()))?;
    let mut roots = RootCertStore::empty();
    roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
    if let Some(cert) = extra_root {
        roots
            .add(cert)
            .map_err(|e| crate::NetError::Transport(format!("trust anchor: {e}")))?;
    }
    let mut tls = rustls::ClientConfig::builder()
        .with_root_certificates(roots)
        .with_no_client_auth();
    tls.alpn_protocols = vec![b"h3".to_vec()];
    let quic_tls = quinn::crypto::rustls::QuicClientConfig::try_from(tls)
        .map_err(|e| crate::NetError::Transport(format!("quic tls: {e}")))?;
    let mut client_config = quinn::ClientConfig::new(Arc::new(quic_tls));
    client_config.transport_config(Arc::new(quinn::TransportConfig::default()));

    let bind = if addr.is_ipv6() {
        "[::]:0".parse().unwrap()
    } else {
        "0.0.0.0:0".parse().unwrap()
    };
    let mut endpoint = quinn::Endpoint::client(bind)
        .map_err(|e| crate::NetError::Transport(format!("quic bind: {e}")))?;
    endpoint.set_default_client_config(client_config);
    let _ = ServerName::try_from(server_name.to_owned())
        .map_err(|_| crate::NetError::Transport("invalid server name".into()))?;
    let conn = endpoint
        .connect(addr, server_name)
        .map_err(|e| crate::NetError::Transport(format!("quic connect: {e}")))?
        .await
        .map_err(|e| crate::NetError::Transport(format!("quic handshake: {e}")))?;
    let h3_conn = h3_quinn::Connection::new(conn);
    let (mut driver, mut send_request) = h3::client::new(h3_conn)
        .await
        .map_err(|e| crate::NetError::Transport(format!("h3 client: {e}")))?;
    let drive = tokio::spawn(async move {
        let _ = driver.wait_idle().await;
    });
    let req = http::Request::builder()
        .uri(parsed.as_str())
        .header("user-agent", "Vector/0.0.1")
        .body(())
        .map_err(|e| crate::NetError::Transport(e.to_string()))?;
    let mut stream = send_request
        .send_request(req)
        .await
        .map_err(|e| crate::NetError::Transport(format!("h3 send: {e}")))?;
    stream
        .finish()
        .await
        .map_err(|e| crate::NetError::Transport(format!("h3 finish: {e}")))?;
    let resp = stream
        .recv_response()
        .await
        .map_err(|e| crate::NetError::Transport(format!("h3 response: {e}")))?;
    let mut body = Vec::new();
    while let Some(chunk) = stream
        .recv_data()
        .await
        .map_err(|e| crate::NetError::Transport(format!("h3 body: {e}")))?
    {
        body.extend_from_slice(chunk.chunk());
    }
    drop(drive);
    let mut headers = HeaderMap::new();
    for (name, value) in resp.headers() {
        headers.append(name.clone(), value.clone());
    }
    Ok(crate::Response::new(
        parsed,
        resp.status(),
        headers,
        bytes::Bytes::from(body),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use http::header::HeaderName;

    #[test]
    fn alt_svc_h3_is_detected() {
        let mut headers = HeaderMap::new();
        headers.append(
            HeaderName::from_static("alt-svc"),
            HeaderValue::from_static(r#"h3=":443"; ma=86400, h3-29=":443""#),
        );
        assert!(advertises_http3(&headers));
        assert_eq!(
            parse_h3_alt_svc(&headers),
            Some(H3Endpoint {
                host: None,
                port: 443
            })
        );
        headers.clear();
        headers.insert("alt-svc", HeaderValue::from_static("h2=\":443\""));
        assert!(!advertises_http3(&headers));
        headers.insert(
            "alt-svc",
            HeaderValue::from_static(r#"h3="example.test:8443""#),
        );
        assert_eq!(
            parse_h3_alt_svc(&headers).unwrap(),
            H3Endpoint {
                host: Some("example.test".into()),
                port: 8443
            }
        );
    }

    #[cfg(feature = "http")]
    #[test]
    fn loopback_get_speaks_http3() {
        use std::net::SocketAddr;
        use std::sync::Arc;

        use rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer};

        let certified = rcgen::generate_simple_self_signed(["localhost".into()]).unwrap();
        let cert_der = CertificateDer::from(certified.cert.der().to_vec());
        let key_der = PrivatePkcs8KeyDer::from(certified.key_pair.serialize_der());
        let mut server_crypto = rustls::ServerConfig::builder()
            .with_no_client_auth()
            .with_single_cert(vec![cert_der.clone()], key_der.into())
            .unwrap();
        server_crypto.alpn_protocols = vec![b"h3".to_vec()];
        let server_config = quinn::ServerConfig::with_crypto(Arc::new(
            quinn::crypto::rustls::QuicServerConfig::try_from(server_crypto).unwrap(),
        ));
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        let response = runtime.block_on(async move {
            let endpoint =
                quinn::Endpoint::server(server_config, "127.0.0.1:0".parse().unwrap()).unwrap();
            let addr: SocketAddr = endpoint.local_addr().unwrap();
            let (hold_tx, hold_rx) = tokio::sync::oneshot::channel::<()>();
            tokio::spawn(async move {
                let incoming = endpoint.accept().await.expect("accept");
                let conn = incoming.await.expect("handshake");
                let h3_conn = h3_quinn::Connection::new(conn);
                let mut acceptor = h3::server::builder()
                    .build(h3_conn)
                    .await
                    .expect("h3 server");
                let request = acceptor.accept().await.expect("accept req").expect("req");
                let (req, mut stream) = request.resolve_request().await.expect("resolve");
                assert_eq!(req.uri().path(), "/hello");
                let resp = http::Response::builder().status(200).body(()).unwrap();
                stream.send_response(resp).await.expect("send resp");
                stream
                    .send_data(bytes::Bytes::from_static(b"from-h3"))
                    .await
                    .expect("send body");
                stream.finish().await.expect("finish");
                tokio::select! {
                    _ = hold_rx => {}
                    _ = acceptor.accept() => {}
                }
            });
            let response = get_async(
                &format!("https://localhost:{}/hello", addr.port()),
                "localhost",
                addr,
                Some(cert_der),
            )
            .await;
            drop(hold_tx);
            response
        });
        let response = response.expect("h3 get");
        assert_eq!(response.status, http::StatusCode::OK);
        assert_eq!(response.body.as_ref(), b"from-h3");
    }
}
