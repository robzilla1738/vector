//! WebSocket client (VEC-009).
//!
//! With the `http` feature this performs the RFC 6455 handshake and keeps
//! the socket so [`WebSocketClient::send`] / [`WebSocketClient::close`] work.
//! Without it, [`WebSocketClient::connect`] records the URL and reports
//! `ready_state = 0`.

#[cfg(feature = "http")]
use std::io::{Read, Write};

use url::Url;

use crate::NetError;

/// A WebSocket as seen by page script / the network broker.
#[derive(Debug)]
pub struct WebSocketClient {
    /// Resolved `ws:` / `wss:` / `http(s):` URL.
    pub url: String,
    /// 0 connecting, 1 open, 2 closing, 3 closed.
    pub ready_state: u8,
    /// Negotiated subprotocol, if any.
    pub protocol: String,
    #[cfg(feature = "http")]
    io: Option<WsIo>,
    incoming: Vec<Vec<u8>>,
}

#[cfg(feature = "http")]
enum WsIo {
    Plain(std::net::TcpStream),
    Tls(rustls::StreamOwned<rustls::ClientConnection, std::net::TcpStream>),
}

#[cfg(feature = "http")]
impl std::fmt::Debug for WsIo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Plain(_) => write!(f, "tcp"),
            Self::Tls(_) => write!(f, "tls"),
        }
    }
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
            #[cfg(feature = "http")]
            io: None,
            incoming: Vec::new(),
        }
    }

    /// Sends a text frame. Closed sockets are [`NetError::Blocked`]; a socket
    /// that never opened is unsupported.
    pub fn send(&mut self, data: &[u8]) -> Result<(), NetError> {
        match self.ready_state {
            1 => {}
            2 | 3 => {
                return Err(NetError::Blocked("WebSocket is not open".into()));
            }
            _ => {
                return Err(NetError::Transport(
                    "WebSocket send is not implemented (not connected)".into(),
                ));
            }
        }
        #[cfg(feature = "http")]
        {
            if let Some(io) = self.io.as_mut() {
                return write_frame(io, 0x1, data);
            }
        }
        let _ = data;
        Err(NetError::Transport(
            "WebSocket send is not implemented".into(),
        ))
    }

    /// Sends a close frame and marks the socket closed.
    pub fn close(&mut self) -> Result<(), NetError> {
        if self.ready_state == 3 {
            return Ok(());
        }
        self.ready_state = 2;
        #[cfg(feature = "http")]
        {
            if let Some(io) = self.io.as_mut() {
                let _ = write_frame(io, 0x8, &[]);
            }
            self.io = None;
        }
        self.ready_state = 3;
        Ok(())
    }

    /// Bytes received since the last poll (empty without a live socket).
    pub fn take_incoming(&mut self) -> Vec<Vec<u8>> {
        std::mem::take(&mut self.incoming)
    }

    /// Reads available frames into [`Self::take_incoming`].
    pub fn poll(&mut self) {
        #[cfg(feature = "http")]
        {
            if self.ready_state != 1 {
                return;
            }
            if let Some(io) = self.io.as_mut()
                && let Ok(Some(payload)) = try_read_frame(io)
            {
                self.incoming.push(payload);
            }
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
    stream.set_nodelay(true).ok();
    let key = crate::base64_encode(&[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    let path = if url.path().is_empty() {
        "/"
    } else {
        url.path()
    };
    let req = format!(
        "GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: {key}\r\n\r\n"
    );
    let (open, io) = if tls {
        let mut tls_stream = wrap_tls(stream, host)?;
        let open = upgrade(&mut tls_stream, &req)?;
        (open, WsIo::Tls(tls_stream))
    } else {
        let mut plain = stream;
        let open = upgrade(&mut plain, &req)?;
        (open, WsIo::Plain(plain))
    };
    Ok(WebSocketClient {
        url: url.to_string(),
        ready_state: u8::from(open),
        protocol: String::new(),
        io: open.then_some(io),
        incoming: Vec::new(),
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
fn upgrade<S: Read + Write>(stream: &mut S, req: &str) -> Result<bool, NetError> {
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

#[cfg(feature = "http")]
fn write_frame(io: &mut WsIo, opcode: u8, payload: &[u8]) -> Result<(), NetError> {
    let mut header = vec![0x80 | opcode];
    let mask_bit = 0x80_u8;
    let len = payload.len();
    if len < 126 {
        header.push(mask_bit | len as u8);
    } else if len < 65536 {
        header.push(mask_bit | 126);
        header.extend_from_slice(&(len as u16).to_be_bytes());
    } else {
        header.push(mask_bit | 127);
        header.extend_from_slice(&(len as u64).to_be_bytes());
    }
    let mask = [1u8, 2, 3, 4];
    header.extend_from_slice(&mask);
    let masked: Vec<u8> = payload
        .iter()
        .enumerate()
        .map(|(i, b)| b ^ mask[i % 4])
        .collect();
    match io {
        WsIo::Plain(s) => {
            s.write_all(&header)
                .and_then(|_| s.write_all(&masked))
                .map_err(|e| NetError::Transport(e.to_string()))?;
        }
        WsIo::Tls(s) => {
            s.write_all(&header)
                .and_then(|_| s.write_all(&masked))
                .map_err(|e| NetError::Transport(e.to_string()))?;
        }
    }
    Ok(())
}

#[cfg(feature = "http")]
fn try_read_frame(io: &mut WsIo) -> Result<Option<Vec<u8>>, NetError> {
    match io {
        WsIo::Plain(s) => {
            s.set_nonblocking(true).ok();
            let r = read_ws_frame(s);
            s.set_nonblocking(false).ok();
            r
        }
        WsIo::Tls(_) => Ok(None),
    }
}

#[cfg(feature = "http")]
fn read_ws_frame<S: Read>(stream: &mut S) -> Result<Option<Vec<u8>>, NetError> {
    let mut hdr = [0u8; 2];
    match stream.read_exact(&mut hdr) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => return Ok(None),
        Err(e) => return Err(NetError::Transport(e.to_string())),
    }
    let opcode = hdr[0] & 0x0f;
    let mut len = usize::from(hdr[1] & 0x7f);
    let masked = hdr[1] & 0x80 != 0;
    if len == 126 {
        let mut ext = [0u8; 2];
        stream
            .read_exact(&mut ext)
            .map_err(|e| NetError::Transport(e.to_string()))?;
        len = usize::from(u16::from_be_bytes(ext));
    } else if len == 127 {
        let mut ext = [0u8; 8];
        stream
            .read_exact(&mut ext)
            .map_err(|e| NetError::Transport(e.to_string()))?;
        len = usize::try_from(u64::from_be_bytes(ext)).unwrap_or(0);
    }
    let mut mask = [0u8; 4];
    if masked {
        stream
            .read_exact(&mut mask)
            .map_err(|e| NetError::Transport(e.to_string()))?;
    }
    let mut payload = vec![0u8; len];
    if len > 0 {
        stream
            .read_exact(&mut payload)
            .map_err(|e| NetError::Transport(e.to_string()))?;
    }
    if masked {
        for (i, b) in payload.iter_mut().enumerate() {
            *b ^= mask[i % 4];
        }
    }
    if opcode == 0x8 || opcode == 0x9 || opcode == 0xa {
        return Ok(None);
    }
    Ok(Some(payload))
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
        let mut ws = WebSocketClient::connect("ws://127.0.0.1:1/echo").unwrap();
        assert_eq!(ws.url, "ws://127.0.0.1:1/echo");
        assert!(ws.ready_state <= 1);
        if ws.ready_state != 1 {
            assert!(ws.send(b"hi").is_err());
        }
        let _ = ws.close();
        assert_eq!(ws.ready_state, 3);
        assert!(ws.send(b"hi").is_err());
    }

    #[cfg(feature = "http")]
    #[test]
    fn handshake_send_and_close_against_a_local_listener() {
        use std::net::TcpListener;
        use std::thread;
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let server = thread::spawn(move || {
            let (mut s, _) = listener.accept().unwrap();
            let mut buf = [0u8; 1024];
            let n = s.read(&mut buf).unwrap();
            let req = std::str::from_utf8(&buf[..n]).unwrap_or("");
            assert!(req.contains("Upgrade: websocket"));
            s.write_all(b"HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n")
                .unwrap();
            let mut rest = Vec::new();
            let _ = s.read_to_end(&mut rest);
            rest
        });
        let mut ws =
            WebSocketClient::connect(&format!("ws://127.0.0.1:{}/echo", addr.port())).unwrap();
        assert_eq!(ws.ready_state, 1, "handshake must open");
        ws.send(b"ping").unwrap();
        ws.close().unwrap();
        let frames = server.join().unwrap();
        assert!(!frames.is_empty(), "client must write a masked frame");
    }
}
