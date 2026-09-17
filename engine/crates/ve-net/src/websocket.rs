//! WebSocket client (VEC-009).
//!
//! With the `http` feature this performs the RFC 6455 handshake and keeps
//! the socket so [`WebSocketClient::send`] / [`WebSocketClient::close`] work.
//! Without it, a policy-allowed URL records as `ready_state = 3` (no handshake).
//! [`WebSocketClient::connect`] uses [`NetworkPolicy::default`], so loopback is
//! blocked unless the caller passes an allowlist via [`WebSocketClient::connect_with_policy`].

#[cfg(feature = "http")]
use std::io::{Read, Write};

use url::Url;

use crate::{Initiator, NetError, NetworkPolicy, Request};

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
    #[cfg(feature = "http")]
    fragment: Option<(u8, Vec<u8>)>,
}

#[cfg(feature = "http")]
enum WsIo {
    Plain(std::net::TcpStream),
    Tls(Box<rustls::StreamOwned<rustls::ClientConnection, std::net::TcpStream>>),
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
    /// Opens `url` with the default (loopback-blocking) policy.
    pub fn connect(url: &str) -> Result<Self, NetError> {
        Self::connect_with_policy(url, &NetworkPolicy::default())
    }

    /// Opens `url` after [`NetworkPolicy::check_request`] and, once connected,
    /// [`NetworkPolicy::check_resolved`].
    pub fn connect_with_policy(url: &str, policy: &NetworkPolicy) -> Result<Self, NetError> {
        let parsed = Url::parse(url).map_err(NetError::InvalidUrl)?;
        let tls = match parsed.scheme() {
            "ws" | "http" => false,
            "wss" | "https" => true,
            other => return Err(NetError::UnsupportedScheme(other.to_owned())),
        };
        policy.check_request(&websocket_policy_request(&parsed)?)?;
        #[cfg(feature = "http")]
        {
            match try_handshake(&parsed, tls, policy) {
                Ok(ws) => Ok(ws),
                Err(e @ NetError::Blocked(_)) => Err(e),
                Err(e) => {
                    tracing::debug!(error = %e, url = %parsed, "websocket handshake failed");
                    Ok(closed_client(&parsed))
                }
            }
        }
        #[cfg(not(feature = "http"))]
        {
            let _ = tls;
            Ok(closed_client(&parsed))
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

    /// Sends a ping frame. The peer's pong is ignored (control).
    pub fn ping(&mut self, data: &[u8]) -> Result<(), NetError> {
        if self.ready_state != 1 {
            return Err(NetError::Blocked("WebSocket is not open".into()));
        }
        #[cfg(feature = "http")]
        {
            if let Some(io) = self.io.as_mut() {
                return write_frame(io, 0x9, data);
            }
        }
        let _ = data;
        Err(NetError::Transport(
            "WebSocket ping is not implemented".into(),
        ))
    }

    /// Reads available frames into [`Self::take_incoming`].
    ///
    /// Assembles fragmented data frames, answers ping with pong, and polls
    /// TLS sockets the same way as plaintext.
    pub fn poll(&mut self) {
        #[cfg(feature = "http")]
        {
            if self.ready_state != 1 {
                return;
            }
            if let Some(io) = self.io.as_mut() {
                loop {
                    match try_read_frame(io, &mut self.fragment) {
                        Ok(ReadOut::Data(payload)) => self.incoming.push(payload),
                        Ok(ReadOut::Continue) => {}
                        Ok(ReadOut::WouldBlock) => break,
                        Ok(ReadOut::Closed) | Err(_) => {
                            self.ready_state = 3;
                            self.io = None;
                            break;
                        }
                    }
                }
            }
        }
    }
}

fn closed_client(url: &Url) -> WebSocketClient {
    WebSocketClient {
        url: url.to_string(),
        ready_state: 3,
        protocol: String::new(),
        #[cfg(feature = "http")]
        io: None,
        incoming: Vec::new(),
        #[cfg(feature = "http")]
        fragment: None,
    }
}

fn websocket_policy_request(url: &Url) -> Result<Request, NetError> {
    let mut http_url = url.clone();
    match url.scheme() {
        "ws" => {
            let _ = http_url.set_scheme("http");
        }
        "wss" => {
            let _ = http_url.set_scheme("https");
        }
        _ => {}
    }
    Ok(Request::get(http_url.as_str())?.with_initiator(Initiator::Script))
}

#[cfg(feature = "http")]
fn try_handshake(
    url: &Url,
    tls: bool,
    policy: &NetworkPolicy,
) -> Result<WebSocketClient, NetError> {
    use std::net::TcpStream;
    use std::time::Duration;

    let host = url
        .host_str()
        .ok_or_else(|| NetError::Http("ws host missing".into()))?;
    let default_port = if tls { 443 } else { 80 };
    let port = url.port().unwrap_or(default_port);
    let stream =
        TcpStream::connect((host, port)).map_err(|e| NetError::Transport(e.to_string()))?;
    if let Ok(peer) = stream.peer_addr() {
        policy.check_resolved(url, peer.ip())?;
    }
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
        (open, WsIo::Tls(Box::new(tls_stream)))
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
        fragment: None,
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
                .and_then(|()| s.write_all(&masked))
                .map_err(|e| NetError::Transport(e.to_string()))?;
        }
        WsIo::Tls(s) => {
            s.write_all(&header)
                .and_then(|()| s.write_all(&masked))
                .map_err(|e| NetError::Transport(e.to_string()))?;
        }
    }
    Ok(())
}

#[cfg(feature = "http")]
enum ReadOut {
    WouldBlock,
    Data(Vec<u8>),
    Continue,
    Closed,
}

#[cfg(feature = "http")]
struct RawFrame {
    fin: bool,
    opcode: u8,
    payload: Vec<u8>,
}

#[cfg(feature = "http")]
fn set_nonblocking(io: &mut WsIo, nb: bool) {
    match io {
        WsIo::Plain(s) => {
            s.set_nonblocking(nb).ok();
        }
        WsIo::Tls(s) => {
            s.sock.set_nonblocking(nb).ok();
        }
    }
}

#[cfg(feature = "http")]
fn try_read_frame(
    io: &mut WsIo,
    fragment: &mut Option<(u8, Vec<u8>)>,
) -> Result<ReadOut, NetError> {
    set_nonblocking(io, true);
    let raw = match io {
        WsIo::Plain(s) => read_raw_frame(s),
        WsIo::Tls(s) => read_raw_frame(s),
    };
    set_nonblocking(io, false);
    match raw {
        Ok(None) => Ok(ReadOut::WouldBlock),
        Ok(Some(frame)) => apply_frame(io, fragment, frame),
        Err(e) => Err(e),
    }
}

#[cfg(feature = "http")]
fn apply_frame(
    io: &mut WsIo,
    fragment: &mut Option<(u8, Vec<u8>)>,
    frame: RawFrame,
) -> Result<ReadOut, NetError> {
    match frame.opcode {
        0x8 => Ok(ReadOut::Closed),
        0x9 => {
            write_frame(io, 0xA, &frame.payload)?;
            Ok(ReadOut::Continue)
        }
        0xA => Ok(ReadOut::Continue),
        0x0 => {
            if let Some((_, buf)) = fragment.as_mut() {
                buf.extend_from_slice(&frame.payload);
                if frame.fin {
                    return Ok(ReadOut::Data(fragment.take().expect("fragment").1));
                }
            }
            Ok(ReadOut::Continue)
        }
        0x1 | 0x2 => {
            if frame.fin {
                *fragment = None;
                Ok(ReadOut::Data(frame.payload))
            } else {
                *fragment = Some((frame.opcode, frame.payload));
                Ok(ReadOut::Continue)
            }
        }
        _ => Ok(ReadOut::Continue),
    }
}

#[cfg(feature = "http")]
fn read_raw_frame<S: Read>(stream: &mut S) -> Result<Option<RawFrame>, NetError> {
    let mut hdr = [0u8; 2];
    match stream.read_exact(&mut hdr) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => return Ok(None),
        Err(e) => return Err(NetError::Transport(e.to_string())),
    }
    let fin = hdr[0] & 0x80 != 0;
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
    Ok(Some(RawFrame {
        fin,
        opcode,
        payload,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_non_ws_schemes() {
        assert!(WebSocketClient::connect("mailto:a@b.c").is_err());
    }

    #[test]
    fn default_policy_blocks_loopback_websocket() {
        assert!(matches!(
            WebSocketClient::connect("ws://127.0.0.1:1/echo"),
            Err(NetError::Blocked(_))
        ));
        assert!(matches!(
            WebSocketClient::connect("ws://localhost/echo"),
            Err(NetError::Blocked(_))
        ));
    }

    #[test]
    fn failed_handshake_is_closed() {
        let policy = NetworkPolicy {
            allowlist: vec!["127.0.0.1".into()],
            ..NetworkPolicy::default()
        };
        let mut ws =
            WebSocketClient::connect_with_policy("ws://127.0.0.1:1/echo", &policy).unwrap();
        assert_eq!(ws.url, "ws://127.0.0.1:1/echo");
        assert_eq!(ws.ready_state, 3);
        assert!(ws.send(b"hi").is_err());
        let _ = ws.close();
        assert_eq!(ws.ready_state, 3);
    }

    #[cfg(feature = "http")]
    #[test]
    fn handshake_send_and_close_against_a_local_listener() {
        use std::io::{Read, Write};
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
        let policy = NetworkPolicy {
            allowlist: vec!["127.0.0.1".into()],
            ..NetworkPolicy::default()
        };
        let mut ws = WebSocketClient::connect_with_policy(
            &format!("ws://127.0.0.1:{}/echo", addr.port()),
            &policy,
        )
        .unwrap();
        assert_eq!(ws.ready_state, 1, "handshake must open");
        ws.send(b"ping").unwrap();
        ws.close().unwrap();
        let frames = server.join().unwrap();
        assert!(!frames.is_empty(), "client must write a masked frame");
    }

    #[cfg(feature = "http")]
    #[test]
    fn assembles_fragments_and_answers_ping() {
        use std::io::{Read, Write};
        use std::net::TcpListener;
        use std::thread;
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let server = thread::spawn(move || {
            let (mut s, _) = listener.accept().unwrap();
            let mut buf = [0u8; 1024];
            let _ = s.read(&mut buf);
            s.write_all(b"HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n")
                .unwrap();
            thread::sleep(std::time::Duration::from_millis(40));
            // FIN=0 text "he", FIN=1 continue "llo", then ping "hi"
            s.write_all(&[
                0x01, 0x02, b'h', b'e', 0x80, 0x03, b'l', b'l', b'o', 0x89, 0x02, b'h', b'i',
            ])
            .unwrap();
            let mut rest = Vec::new();
            let _ = s.read_to_end(&mut rest);
            rest
        });
        let policy = NetworkPolicy {
            allowlist: vec!["127.0.0.1".into()],
            ..NetworkPolicy::default()
        };
        let mut ws = WebSocketClient::connect_with_policy(
            &format!("ws://127.0.0.1:{}/echo", addr.port()),
            &policy,
        )
        .unwrap();
        assert_eq!(ws.ready_state, 1);
        let mut msgs = Vec::new();
        for _ in 0..20 {
            ws.poll();
            msgs.extend(ws.take_incoming());
            if !msgs.is_empty() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(10));
        }
        assert_eq!(
            msgs.iter()
                .map(|m| String::from_utf8_lossy(m).into_owned())
                .collect::<Vec<_>>(),
            vec!["hello".to_string()]
        );
        ws.close().unwrap();
        let frames = server.join().unwrap();
        assert!(
            frames.iter().any(|b| *b == 0x8A || *b == (0x80 | 0xA)),
            "client must answer ping with a pong: {frames:?}"
        );
    }
}
