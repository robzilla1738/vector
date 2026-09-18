//! The pooled transport against a real local server: connections are reused
//! across requests to one host and compressed bodies arrive decoded.
#![cfg(feature = "http")]

use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use ve_net::{HyperTransport, Request, Transport};

/// Minimal HTTP/1.1 keep-alive server; every response is gzip-encoded.
fn serve(listener: TcpListener, connections: Arc<AtomicUsize>) {
    std::thread::spawn(move || {
        for stream in listener.incoming() {
            let Ok(mut stream) = stream else { break };
            connections.fetch_add(1, Ordering::SeqCst);
            std::thread::spawn(move || {
                let mut buf = vec![0u8; 8192];
                loop {
                    let mut req = Vec::new();
                    loop {
                        let n = match stream.read(&mut buf) {
                            Ok(0) | Err(_) => return,
                            Ok(n) => n,
                        };
                        req.extend_from_slice(&buf[..n]);
                        if req.windows(4).any(|w| w == b"\r\n\r\n") {
                            break;
                        }
                    }
                    let head = String::from_utf8_lossy(&req);
                    let path = head.split_whitespace().nth(1).unwrap_or("/").to_owned();
                    let accepts_gzip = head.to_ascii_lowercase().contains("accept-encoding: gzip");
                    let body_text = format!("<p>{path}</p>");
                    let (body, enc) = if accepts_gzip {
                        let mut gz =
                            flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::fast());
                        gz.write_all(body_text.as_bytes()).unwrap();
                        (gz.finish().unwrap(), "Content-Encoding: gzip\r\n")
                    } else {
                        (body_text.clone().into_bytes(), "")
                    };
                    let _ = write!(
                        stream,
                        "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n{enc}Content-Length: {}\r\nConnection: keep-alive\r\n\r\n",
                        body.len()
                    );
                    let _ = stream.write_all(&body);
                    let _ = stream.flush();
                }
            });
        }
    });
}

#[test]
fn keep_alive_pooling_and_gzip_decoding() {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let port = listener.local_addr().unwrap().port();
    let connections = Arc::new(AtomicUsize::new(0));
    serve(listener, Arc::clone(&connections));

    let transport = HyperTransport::new().unwrap();
    for i in 0..5 {
        let res = transport
            .send(&Request::get(&format!("http://127.0.0.1:{port}/page{i}")).unwrap())
            .unwrap();
        assert_eq!(res.status, 200);
        assert_eq!(
            res.text(),
            format!("<p>/page{i}</p>"),
            "body arrives decoded"
        );
        assert!(res.headers.get("content-encoding").is_none());
        assert_eq!(res.headers.get("x-ve-content-encoding").unwrap(), "gzip");
    }
    assert_eq!(
        connections.load(Ordering::SeqCst),
        1,
        "five requests to one host reuse one keep-alive connection"
    );
    assert_eq!(transport.connections_opened(), 1);
}

#[test]
fn loopback_https_with_fixture_ca() {
    use rustls::pki_types::{CertificateDer, PrivatePkcs8KeyDer};

    let certified = rcgen::generate_simple_self_signed(["127.0.0.1".into(), "localhost".into()]).unwrap();
    let cert_der = certified.cert.der().to_vec();
    let key_der = certified.key_pair.serialize_der();
    let mut server_crypto = rustls::ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(
            vec![CertificateDer::from(cert_der.clone())],
            PrivatePkcs8KeyDer::from(key_der).into(),
        )
        .unwrap();
    server_crypto.alpn_protocols = vec![b"http/1.1".to_vec()];
    let server_crypto = std::sync::Arc::new(server_crypto);

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let port = listener.local_addr().unwrap().port();
    std::thread::spawn(move || {
        let Ok((stream, _)) = listener.accept() else {
            return;
        };
        let conn = rustls::ServerConnection::new(server_crypto).unwrap();
        let mut tls = rustls::StreamOwned::new(conn, stream);
        let mut buf = [0u8; 4096];
        let _ = tls.read(&mut buf);
        let body = b"<p>tls</p>";
        let _ = write!(
            tls,
            "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            body.len()
        );
        let _ = tls.write_all(body);
    });

    let transport = HyperTransport::with_extra_roots([cert_der]).unwrap();
    let res = transport
        .send(&Request::get(&format!("https://127.0.0.1:{port}/")).unwrap())
        .unwrap();
    assert_eq!(res.status, 200);
    assert_eq!(res.text(), "<p>tls</p>");
}
