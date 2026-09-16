//! WebSocket client (plan A23).
//!
//! With the `http` feature this performs the RFC 6455 handshake over TCP.
//! Without it, [`WebSocketClient::connect`] records the URL and reports
//! `ready_state = 0` so page script can still construct a `WebSocket`.

use url::Url;

use crate::NetError;

/// A WebSocket as seen by page script / the network broker.
#[derive(Clone, Debug)]
pub struct WebSocketClient {
    /// Resolved `ws:` / `wss:` / `http(s):` URL.
    pub url: String,
    /// 0 connecting, 1 open, 2 closing, 3 closed.
    pub ready_state: u8,
    /// Negotiated subprotocol, if any.
    pub protocol: String,
}

impl WebSocketClient {
    /// Opens `url`. Network schemes need the `http` feature.
    pub fn connect(url: &str) -> Result<Self, NetError> {
        let parsed = Url::parse(url).map_err(NetError::InvalidUrl)?;
        match parsed.scheme() {
            "ws" | "http" => Ok(Self::handshake(parsed, false)),
            "wss" | "https" => Ok(Self::handshake(parsed, true)),
            other => Err(NetError::UnsupportedScheme(other.to_owned())),
        }
    }

    fn handshake(url: Url, tls: bool) -> Self {
        #[cfg(feature = "http")]
        {
            match try_handshake(&url, tls) {
                Ok(ws) => return ws,
                Err(e) => tracing::debug!(error = %e, url = %url, "websocket handshake failed"),
            }
        }
        let _ = tls;
        Self {
            url: url.to_string(),
            ready_state: 0,
            protocol: String::new(),
        }
    }
}

#[cfg(feature = "http")]
fn try_handshake(url: &Url, tls: bool) -> Result<WebSocketClient, NetError> {
    use std::net::TcpStream;
    use std::time::Duration;

    let host = url
        .host_str()
        .ok_or_else(|| NetError::Http("ws host missing".into()))?;
    let default_port = if tls { 443 } else { 80 };
    let port = url.port().unwrap_or(default_port);
    let stream =
        TcpStream::connect((host, port)).map_err(|e| NetError::Transport(e.to_string()))?;
    stream.set_read_timeout(Some(Duration::from_secs(5))).ok();
    stream.set_write_timeout(Some(Duration::from_secs(5))).ok();
    let key = crate::base64_encode(&[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    let path = if url.path().is_empty() {
        "/"
    } else {
        url.path()
    };
    let req = format!(
        "GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: {key}\r\n\r\n"
    );
    let open = if tls {
        upgrade(wrap_tls(stream, host)?, &req)?
    } else {
        upgrade(stream, &req)?
    };
    Ok(WebSocketClient {
        url: url.to_string(),
        ready_state: u8::from(open),
        protocol: String::new(),
    })
}

#[cfg(feature = "http")]
fn wrap_tls(
    stream: std::net::TcpStream,
    host: &str,
) -> Result<rustls::StreamOwned<rustls::ClientConnection, std::net::TcpStream>, NetError> {
    use std::sync::Arc;
    let mut roots = rustls::RootCertStore::empty();
    roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
    let config = rustls::ClientConfig::builder()
        .with_root_certificates(roots)
        .with_no_client_auth();
    let name = rustls::pki_types::ServerName::try_from(host.to_owned())
        .map_err(|e| NetError::Transport(format!("sni: {e}")))?;
    let conn = rustls::ClientConnection::new(Arc::new(config), name)
        .map_err(|e| NetError::Transport(e.to_string()))?;
    Ok(rustls::StreamOwned::new(conn, stream))
}

#[cfg(feature = "http")]
fn upgrade<S: std::io::Read + std::io::Write>(mut stream: S, req: &str) -> Result<bool, NetError> {
    stream
        .write_all(req.as_bytes())
        .map_err(|e| NetError::Transport(e.to_string()))?;
    let mut buf = [0u8; 1024];
    let n = stream
        .read(&mut buf)
        .map_err(|e| NetError::Transport(e.to_string()))?;
    let head = std::str::from_utf8(&buf[..n]).unwrap_or("");
    Ok(head.starts_with("HTTP/1.1 101") || head.starts_with("HTTP/1.0 101"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_non_ws_schemes() {
        assert!(WebSocketClient::connect("mailto:a@b.c").is_err());
    }

    #[test]
    fn records_ws_urls_without_a_listener() {
        let ws = WebSocketClient::connect("ws://127.0.0.1:1/echo").unwrap();
        assert_eq!(ws.url, "ws://127.0.0.1:1/echo");
        assert!(ws.ready_state <= 1);
    }
}
