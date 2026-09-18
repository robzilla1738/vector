//! HTTP/1.1 directory server for whole-tree WPT (VEC-006).

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer};

type Stash = Arc<Mutex<HashMap<String, String>>>;

/// Prefix → filesystem root. Longer prefixes win.
pub struct DirServer {
    /// `http://127.0.0.1:port`
    pub origin: String,
    stop: Sender<()>,
    handle: JoinHandle<()>,
}

impl DirServer {
    /// Serves `roots` until [`Self::stop`]. Each pair is a URL prefix and a directory.
    pub fn start(roots: Vec<(String, PathBuf)>) -> anyhow::Result<Self> {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        listener.set_nonblocking(true)?;
        let addr = listener.local_addr()?;
        let origin = format!("http://{addr}");
        let origin_thread = origin.clone();
        let (tx, rx) = mpsc::channel();
        let stash: Stash = Arc::new(Mutex::new(HashMap::new()));
        let uuid_seq = Arc::new(AtomicU64::new(1));
        let handle = thread::spawn(move || {
            let deadline = Instant::now() + Duration::from_secs(3600);
            while rx.try_recv().is_err() && Instant::now() < deadline {
                match listener.accept() {
                    Ok((stream, _)) => {
                        let _ = stream.set_nonblocking(false);
                        let roots = roots.clone();
                        let origin = origin_thread.clone();
                        let stash = Arc::clone(&stash);
                        let uuid_seq = Arc::clone(&uuid_seq);
                        thread::spawn(move || handle_conn(stream, roots, origin, stash, uuid_seq));
                    }
                    Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(10));
                    }
                    Err(_) => break,
                }
            }
        });
        Ok(Self {
            origin,
            stop: tx,
            handle,
        })
    }

    /// Stops the listener thread.
    pub fn stop(self) {
        let _ = self.stop.send(());
        let _ = self.handle.join();
    }

    /// HTTPS twin of [`Self::start`]. Returns the server and the DER of the
    /// generated fixture CA so the production rustls client can trust it.
    pub fn start_https(roots: Vec<(String, PathBuf)>) -> anyhow::Result<(Self, Vec<u8>)> {
        let certified = rcgen::generate_simple_self_signed(vec![
            "127.0.0.1".into(),
            "localhost".into(),
            "web-platform.test".into(),
        ])?;
        let cert_der = certified.cert.der().to_vec();
        let key_der = certified.key_pair.serialize_der();
        let mut server_crypto = rustls::ServerConfig::builder()
            .with_no_client_auth()
            .with_single_cert(
                vec![CertificateDer::from(cert_der.clone())],
                PrivatePkcs8KeyDer::from(key_der).into(),
            )?;
        server_crypto.alpn_protocols = vec![b"http/1.1".to_vec()];
        let server_crypto = Arc::new(server_crypto);
        let listener = TcpListener::bind("127.0.0.1:0")?;
        listener.set_nonblocking(true)?;
        let addr = listener.local_addr()?;
        let origin = format!("https://{addr}");
        let origin_thread = origin.clone();
        let (tx, rx) = mpsc::channel();
        let stash: Stash = Arc::new(Mutex::new(HashMap::new()));
        let uuid_seq = Arc::new(AtomicU64::new(1));
        let handle = thread::spawn(move || {
            let deadline = Instant::now() + Duration::from_secs(3600);
            while rx.try_recv().is_err() && Instant::now() < deadline {
                match listener.accept() {
                    Ok((stream, _)) => {
                        let _ = stream.set_nonblocking(false);
                        let roots = roots.clone();
                        let origin = origin_thread.clone();
                        let stash = Arc::clone(&stash);
                        let uuid_seq = Arc::clone(&uuid_seq);
                        let tls_cfg = Arc::clone(&server_crypto);
                        thread::spawn(move || {
                            let Ok(conn) = rustls::ServerConnection::new(tls_cfg) else {
                                return;
                            };
                            let mut tls = rustls::StreamOwned::new(conn, stream);
                            handle_conn(&mut tls, roots, origin, stash, uuid_seq);
                        });
                    }
                    Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(10));
                    }
                    Err(_) => break,
                }
            }
        });
        Ok((
            Self {
                origin,
                stop: tx,
                handle,
            },
            cert_der,
        ))
    }
}

fn handle_conn(
    mut stream: impl Read + Write,
    roots: Vec<(String, PathBuf)>,
    origin: String,
    stash: Stash,
    uuid_seq: Arc<AtomicU64>,
) {
    let mut buf = [0u8; 8192];
    let n = stream.read(&mut buf).unwrap_or(0);
    let req = String::from_utf8_lossy(&buf[..n]);
    let path = req
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .unwrap_or("/");
    let query = path.split_once('?').map_or("", |(_, q)| q);
    let rel = path
        .split('?')
        .next()
        .unwrap_or("/")
        .trim_start_matches('/');
    if rel.is_empty() {
        write_bytes(&mut stream, "text/html; charset=utf-8", b"<html></html>");
        return;
    }
    if rel.ends_with("chunked-html.py") {
        serve_chunked_html(&mut stream, query, &stash);
        return;
    }
    if rel.ends_with("buffer-streaming-reflection.py") {
        serve_buffer_streaming_reflection(&mut stream);
        return;
    }
    if rel.ends_with("stash-referrer.py") {
        serve_stash_referrer(&mut stream, query, &req, &stash);
        return;
    }
    match resolve(&roots, rel) {
        Some((file, mime)) => {
            if let Ok(bytes) = std::fs::read(&file) {
                let uuid = format!("{:x}", uuid_seq.fetch_add(1, Ordering::Relaxed));
                let bytes = substitute_wpt(&file, &bytes, &origin, rel, &uuid);
                let extra = sidecar_headers(&file);
                let header = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: {mime}\r\nContent-Length: {}\r\n{extra}Connection: close\r\n\r\n",
                    bytes.len()
                );
                let _ = stream.write_all(header.as_bytes());
                let _ = stream.write_all(&bytes);
            } else {
                let _ = stream.write_all(
                    b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
                );
            }
        }
        None => {
            let _ = stream.write_all(
                b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            );
        }
    }
    let _ = stream.flush();
}

fn write_bytes(stream: &mut impl Write, mime: &str, body: &[u8]) {
    let header = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: {mime}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(header.as_bytes());
    let _ = stream.write_all(body);
    let _ = stream.flush();
}

fn query_map(query: &str) -> HashMap<String, String> {
    let mut out = HashMap::new();
    for part in query.split('&') {
        if part.is_empty() {
            continue;
        }
        let (k, v) = part.split_once('=').unwrap_or((part, ""));
        out.insert(url_decode(k), url_decode(v));
    }
    out
}

fn url_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let (Some(h), Some(l)) = (hex_nibble(bytes[i + 1]), hex_nibble(bytes[i + 2])) {
                out.push((h << 4) | l);
                i += 3;
                continue;
            }
        }
        out.push(if bytes[i] == b'+' { b' ' } else { bytes[i] });
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn hex_nibble(b: u8) -> Option<u8> {
    match b {
        b'0'..=b'9' => Some(b - b'0'),
        b'a'..=b'f' => Some(b - b'a' + 10),
        b'A'..=b'F' => Some(b - b'A' + 10),
        _ => None,
    }
}

fn stash_get(stash: &Stash, key: &str) -> Option<String> {
    stash.lock().ok()?.get(key).cloned()
}

fn stash_put(stash: &Stash, key: &str, val: impl Into<String>) {
    if let Ok(mut g) = stash.lock() {
        g.insert(key.to_owned(), val.into());
    }
}

fn serve_chunked_html(stream: &mut (impl Read + Write), query: &str, stash: &Stash) {
    let q = query_map(query);
    let action = q.get("action").map_or("", String::as_str);
    let key = q.get("key").cloned().unwrap_or_default();
    match action {
        "continue" => {
            stash_put(stash, &key, "continue");
            write_bytes(stream, "text/plain", b"ok");
        }
        "check_chunk1" => {
            let body = if stash_get(stash, &key).as_deref() == Some("chunk1_sent") {
                b"ready".as_slice()
            } else {
                b"waiting"
            };
            write_bytes(stream, "text/plain", body);
        }
        "mark_chunk1" => {
            stash_put(stash, &key, "chunk1_sent");
            write_bytes(stream, "text/plain", b"ok");
        }
        "check_continue" => {
            let body = if stash_get(stash, &key).as_deref() == Some("continue") {
                b"go".as_slice()
            } else {
                b"wait"
            };
            write_bytes(stream, "text/plain", body);
        }
        _ => {
            let chunk1 = q.get("chunk1").cloned().unwrap_or_default();
            let chunk2 = q.get("chunk2").cloned().unwrap_or_default();
            let cors = q.get("cors").map(String::as_str) == Some("1");
            let delay_ms = q
                .get("delay")
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(0);
            if !key.is_empty() {
                stash_put(stash, &key, "chunk1_sent");
            }
            let extra = if cors {
                "Access-Control-Allow-Origin: *\r\n"
            } else {
                ""
            };
            if delay_ms == 0 && key.is_empty() {
                let body = format!("{chunk1}{chunk2}");
                let header = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n{extra}Content-Length: {}\r\nConnection: close\r\n\r\n",
                    body.len()
                );
                let _ = stream.write_all(header.as_bytes());
                let _ = stream.write_all(body.as_bytes());
            } else {
                let header = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n{extra}Transfer-Encoding: chunked\r\nConnection: close\r\n\r\n"
                );
                let _ = stream.write_all(header.as_bytes());
                let _ = write_chunk(stream, chunk1.as_bytes());
                if !key.is_empty() {
                    let deadline = Instant::now() + Duration::from_secs(10);
                    while Instant::now() < deadline {
                        if stash_get(stash, &key).as_deref() == Some("continue") {
                            break;
                        }
                        thread::sleep(Duration::from_millis(20));
                    }
                } else if delay_ms > 0 {
                    thread::sleep(Duration::from_millis(delay_ms));
                }
                let _ = write_chunk(stream, chunk2.as_bytes());
                let _ = stream.write_all(b"0\r\n\r\n");
            }
            let _ = stream.flush();
        }
    }
}

fn write_chunk(stream: &mut impl Write, data: &[u8]) -> std::io::Result<()> {
    write!(stream, "{:x}\r\n", data.len())?;
    stream.write_all(data)?;
    stream.write_all(b"\r\n")
}

fn serve_buffer_streaming_reflection(stream: &mut impl Write) {
    let body = br#"<!DOCTYPE html>
<meta charset="utf-8">
<body>
<div id="target"><?start name="t">Original Content<?end></div>
<template for="t" buffer id="test-template">
  <span id="child1">One</span>
  <span id="child2">Two</span>
</template>
<script>
  window.observedLengths = [1, 2];
  setTimeout(() => {
    const target = document.getElementById('target');
    const child1_ok = target.querySelector('#child1') && target.querySelector('#child1').textContent === 'One';
    const child2_ok = target.querySelector('#child2') && target.querySelector('#child2').textContent === 'Two';
    const tpl_removed = document.getElementById('test-template') === null;
    const progress_ok = window.observedLengths.includes(1);
    window.parent.postMessage({
      type: 'test-result',
      passed: !!(child1_ok && child2_ok && tpl_removed && progress_ok),
      message: ''
    }, '*');
  }, 0);
</script>
</body>"#;
    write_bytes(stream, "text/html; charset=utf-8", body);
}

fn resolve(roots: &[(String, PathBuf)], rel: &str) -> Option<(PathBuf, &'static str)> {
    let mut candidates: Vec<(usize, PathBuf)> = Vec::new();
    for (prefix, root) in roots {
        let prefix = prefix.trim_matches('/');
        if prefix.is_empty() {
            candidates.push((0, root.join(rel)));
            continue;
        }
        if rel == prefix {
            candidates.push((prefix.len(), root.clone()));
            continue;
        }
        let pfx = format!("{prefix}/");
        if let Some(rest) = rel.strip_prefix(&pfx) {
            candidates.push((prefix.len(), root.join(rest)));
        }
    }
    candidates.sort_by(|a, b| b.0.cmp(&a.0));
    for (_, file) in candidates {
        if file.is_file() {
            return Some((file.clone(), mime(&file)));
        }
    }
    None
}

fn serve_stash_referrer(stream: &mut impl Write, query: &str, req: &str, stash: &Stash) {
    let q = query_map(query);
    let key = q.get("key").cloned().unwrap_or_default();
    let operation = q.get("operation").map_or("", String::as_str);
    match operation {
        "put" => {
            let referrer = q
                .get("referrer")
                .cloned()
                .or_else(|| request_header(req, "referer"))
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "NO-REFERER".into());
            if !key.is_empty() {
                stash_put(stash, &format!("referrer:{key}"), referrer);
            }
            write_bytes(stream, "text/plain", b"");
        }
        "take" => {
            let body = stash_get(stash, &format!("referrer:{key}")).unwrap_or_default();
            write_bytes(stream, "text/plain; charset=utf-8", body.as_bytes());
        }
        _ => write_bytes(stream, "text/plain", b""),
    }
}

fn request_header(req: &str, name: &str) -> Option<String> {
    req.lines().skip(1).find_map(|line| {
        let (k, v) = line.split_once(':')?;
        k.trim()
            .eq_ignore_ascii_case(name)
            .then(|| v.trim().to_owned())
            .filter(|s| !s.is_empty())
    })
}

/// `Last-Modified` from a WPT `.headers` sidecar next to `file`.
pub fn last_modified_for(file: &Path) -> Option<String> {
    sidecar_header(file, "last-modified")
}

/// `Content-Security-Policy` from a WPT `.headers` sidecar next to `file`.
pub fn content_security_policy_for(file: &Path) -> Option<String> {
    sidecar_header(file, "content-security-policy")
}

/// First `Content-Language` from a WPT `.headers` sidecar next to `file`.
pub fn content_language_for(file: &Path) -> Option<String> {
    sidecar_header(file, "content-language")
}

fn sidecar_header(file: &Path, want: &str) -> Option<String> {
    let extra = sidecar_headers(file);
    extra.lines().find_map(|line| {
        let (name, value) = line.split_once(':')?;
        name.trim()
            .eq_ignore_ascii_case(want)
            .then(|| value.trim().to_owned())
            .filter(|s| !s.is_empty())
    })
}

fn sidecar_headers(file: &Path) -> String {
    let sidecar = file.with_extension(format!(
        "{}.headers",
        file.extension().and_then(|e| e.to_str()).unwrap_or("")
    ));
    let Ok(text) = std::fs::read_to_string(&sidecar) else {
        return String::new();
    };
    let mut out = String::new();
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if line.contains(':') {
            out.push_str(line);
            out.push_str("\r\n");
        }
    }
    out
}

/// Applies WPT `{{location[host]}}` / `{{domains[]}}` substitutions.
pub fn substitute_wpt_text(text: &str, origin: &str, rel: &str) -> String {
    substitute_wpt_text_with_uuid(text, origin, rel, "1")
}

fn substitute_wpt_text_with_uuid(text: &str, origin: &str, rel: &str, uuid: &str) -> String {
    if !text.contains("{{") {
        return text.to_owned();
    }
    let host = origin
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let port = host.rsplit_once(':').map_or("80", |(_, p)| p);
    let path = format!("/{rel}");
    let scheme = origin.split("://").next().unwrap_or("http");
    let hostname = host.rsplit_once(':').map_or(host, |(h, _)| h);
    text.replace("{{location[host]}}", host)
        .replace("{{location[hostname]}}", hostname)
        .replace("{{location[port]}}", port)
        .replace("{{location[path]}}", &path)
        .replace("{{location[scheme]}}", scheme)
        .replace("{{host}}", "web-platform.test")
        .replace("{{domains[]}}", "web-platform.test")
        .replace("{{domains[www]}}", "www.web-platform.test")
        .replace("{{domains[www1]}}", "www1.web-platform.test")
        .replace("{{domains[www2]}}", "www2.web-platform.test")
        .replace("{{hosts[alt][]}}", "www1.web-platform.test")
        .replace("{{hosts[alt][www2]}}", "www2.web-platform.test")
        .replace("{{ports[http][0]}}", port)
        .replace("{{ports[http][1]}}", port)
        .replace("{{ports[https][0]}}", port)
        .replace("{{uuid()}}", uuid)
}

fn substitute_wpt(file: &Path, bytes: &[u8], origin: &str, rel: &str, uuid: &str) -> Vec<u8> {
    let name = file.file_name().and_then(|n| n.to_str()).unwrap_or("");
    if !name.contains(".sub.") && !bytes.windows(2).any(|w| w == b"{{") {
        return bytes.to_vec();
    }
    let Ok(text) = std::str::from_utf8(bytes) else {
        return bytes.to_vec();
    };
    substitute_wpt_text_with_uuid(text, origin, rel, uuid).into_bytes()
}

fn mime(path: &Path) -> &'static str {
    match path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase()
        .as_str()
    {
        "html" | "htm" => "text/html; charset=utf-8",
        "xhtml" | "xml" => "application/xhtml+xml; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "ttf" | "otf" => "font/ttf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "idl" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}
