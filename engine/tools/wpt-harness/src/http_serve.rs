//! HTTP/1.1 directory server for whole-tree WPT (VEC-006).

use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{self, Sender};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

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
        let handle = thread::spawn(move || {
            let deadline = Instant::now() + Duration::from_secs(3600);
            while rx.try_recv().is_err() && Instant::now() < deadline {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut buf = [0u8; 4096];
                        let n = stream.read(&mut buf).unwrap_or(0);
                        let req = String::from_utf8_lossy(&buf[..n]);
                        let path = req
                            .lines()
                            .next()
                            .and_then(|l| l.split_whitespace().nth(1))
                            .unwrap_or("/");
                        let rel = path
                            .split('?')
                            .next()
                            .unwrap_or("/")
                            .trim_start_matches('/');
                        if rel.is_empty() {
                            let body = b"<html></html>";
                            let header = format!(
                                "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                                body.len()
                            );
                            let _ = stream.write_all(header.as_bytes());
                            let _ = stream.write_all(body);
                            continue;
                        }
                        match resolve(&roots, rel) {
                            Some((file, mime)) => {
                                if let Ok(bytes) = std::fs::read(&file) {
                                    let bytes = substitute_wpt(&file, &bytes, &origin_thread, rel);
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

/// `Last-Modified` from a WPT `.headers` sidecar next to `file`.
pub fn last_modified_for(file: &Path) -> Option<String> {
    sidecar_header(file, "last-modified")
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
}

fn substitute_wpt(file: &Path, bytes: &[u8], origin: &str, rel: &str) -> Vec<u8> {
    let name = file.file_name().and_then(|n| n.to_str()).unwrap_or("");
    if !name.contains(".sub.") && !bytes.windows(2).any(|w| w == b"{{") {
        return bytes.to_vec();
    }
    let Ok(text) = std::str::from_utf8(bytes) else {
        return bytes.to_vec();
    };
    substitute_wpt_text(text, origin, rel).into_bytes()
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
