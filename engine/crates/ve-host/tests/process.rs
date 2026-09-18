//! Round-trip a `ve-host` child over the JSON control pipe (plan A21).

use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};

use serde_json::{Value, json};

fn write_line(w: &mut impl Write, v: &Value) {
    writeln!(w, "{v}").unwrap();
    w.flush().unwrap();
}

fn host_bin() -> String {
    std::env::var("VECTOR_PACKAGED_HOST").unwrap_or_else(|_| env!("CARGO_BIN_EXE_ve-host").into())
}

fn read_line(r: &mut impl BufRead) -> Value {
    let mut line = String::new();
    r.read_line(&mut line).unwrap();
    serde_json::from_str(line.trim()).unwrap()
}

#[cfg(feature = "v8")]
fn b64(bytes: &[u8]) -> String {
    const T: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    let mut i = 0;
    while i < bytes.len() {
        let b0 = bytes[i];
        let b1 = if i + 1 < bytes.len() { bytes[i + 1] } else { 0 };
        let b2 = if i + 2 < bytes.len() { bytes[i + 2] } else { 0 };
        out.push(T[(b0 >> 2) as usize] as char);
        out.push(T[(((b0 & 3) << 4) | (b1 >> 4)) as usize] as char);
        if i + 1 < bytes.len() {
            out.push(T[(((b1 & 15) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            out.push('=');
        }
        if i + 2 < bytes.len() {
            out.push(T[(b2 & 63) as usize] as char);
        } else {
            out.push('=');
        }
        i += 3;
    }
    out
}

#[cfg(feature = "v8")]
fn spawn_fixture() -> (u16, std::thread::JoinHandle<()>) {
    use std::io::Read;
    use std::net::TcpListener;
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind fixture");
    let port = listener.local_addr().unwrap().port();
    let handle = std::thread::spawn(move || {
        for stream in listener.incoming() {
            let Ok(mut stream) = stream else { continue };
            let mut buf = [0u8; 2048];
            let n = stream.read(&mut buf).unwrap_or(0);
            let req = String::from_utf8_lossy(&buf[..n]);
            let path = req
                .lines()
                .next()
                .and_then(|l| l.split_whitespace().nth(1))
                .unwrap_or("/");
            let (ctype, body): (&str, &[u8]) = if path.ends_with(".js") {
                (
                    "application/javascript",
                    br#"document.title = document.title + '-ext'; document.body.setAttribute('data-ext','1');"#,
                )
            } else {
                (
                    "text/html; charset=utf-8",
                    br#"<title>before</title><script>document.title='inline'</script><script src="/app.js"></script><label for=n>Name</label><input id=n name=n value=old><button id=b>Go</button>"#,
                )
            };
            let header = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: {ctype}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                body.len()
            );
            let _ = stream.write_all(header.as_bytes());
            let _ = stream.write_all(body);
        }
    });
    (port, handle)
}

#[cfg(feature = "v8")]
fn http_get(url: &str) -> Result<(u16, String, Vec<u8>), String> {
    use std::io::Read;
    use std::net::TcpStream;
    let url = url
        .strip_prefix("http://")
        .ok_or_else(|| format!("not http: {url}"))?;
    let (hostport, path) = url.split_once('/').unwrap_or((url, ""));
    let path = format!("/{path}");
    let mut stream =
        TcpStream::connect(hostport).map_err(|e| format!("connect {hostport}: {e}"))?;
    stream
        .write_all(format!("GET {path} HTTP/1.1\r\nHost: {hostport}\r\nConnection: close\r\n\r\n").as_bytes())
        .map_err(|e| e.to_string())?;
    let mut raw = Vec::new();
    stream.read_to_end(&mut raw).map_err(|e| e.to_string())?;
    let split = raw
        .windows(4)
        .position(|w| w == b"\r\n\r\n")
        .ok_or_else(|| "no header".to_owned())?;
    let headers = String::from_utf8_lossy(&raw[..split]);
    let status = headers
        .split_whitespace()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(200);
    let ctype = headers
        .lines()
        .find_map(|l| {
            let (k, v) = l.split_once(':')?;
            k.eq_ignore_ascii_case("content-type")
                .then(|| v.trim().to_owned())
        })
        .unwrap_or_else(|| "text/html".into());
    Ok((status, ctype, raw[split + 4..].to_vec()))
}

#[cfg(feature = "v8")]
fn allowlisted(allow: &str, url: &str) -> bool {
    url.starts_with(&format!("http://{allow}/")) || url == format!("http://{allow}")
}

#[cfg(feature = "v8")]
fn read_until_reply(w: &mut impl Write, r: &mut impl BufRead, allow: &str) -> Value {
    loop {
        let v = read_line(r);
        match v["ch"].as_str() {
            Some("fetch") => {
                let id = v["id"].clone();
                let url = v["request"]["url"].as_str().unwrap_or("");
                if !allowlisted(allow, url) {
                    write_line(
                        w,
                        &json!({"ch":"fetchResult","id":id,"error":"not allowlisted"}),
                    );
                    continue;
                }
                match http_get(url) {
                    Ok((status, ctype, body)) => {
                        write_line(
                            w,
                            &json!({
                                "ch": "fetchResult",
                                "id": id,
                                "response": {
                                    "url": url,
                                    "status": status,
                                    "headers": [["content-type", ctype]],
                                    "bodyB64": b64(&body),
                                    "fromCache": false
                                }
                            }),
                        );
                    }
                    Err(e) => {
                        write_line(w, &json!({"ch":"fetchResult","id":id,"error":e}));
                    }
                }
            }
            Some("reply") => return v,
            other => panic!("unexpected channel {other:?}: {v}"),
        }
    }
}

#[test]
#[allow(clippy::zombie_processes)]
fn context_process_opens_inline_html() {
    let bin = host_bin();
    let mut child = Command::new(&bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .env("VECTOR_ENGINE_SANDBOX", "0")
        .spawn()
        .expect("spawn ve-host");
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_line(
        &mut stdin,
        &json!({
            "ch": "init",
            "protocol": 1,
            "config": { "offline": true },
            "contextId": 1
        }),
    );
    let ready = read_line(&mut stdout);
    assert_eq!(ready["ch"], "ready", "{ready}");
    assert_eq!(ready["protocol"], 1, "{ready}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "open",
                "global": 1,
                "url": "data:text/html,<title>Host</title><p>hi</p>",
                "options": {}
            }
        }),
    );
    let reply = read_line(&mut stdout);
    assert_eq!(reply["ch"], "reply", "{reply}");
    assert_eq!(reply["value"]["ok"], true, "{reply}");
    assert_eq!(reply["value"]["title"], "Host", "{reply}");
    let _ = child.kill();
    let _ = child.wait();
}

#[cfg(feature = "v8")]
#[test]
#[allow(clippy::zombie_processes)]
fn production_sandbox_runs_inline_script_observe_and_input() {
    use std::time::{Duration, Instant};

    let bin = host_bin();
    let mut child = Command::new(&bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .env("VECTOR_ENGINE_SANDBOX", "1")
        .env("VECTOR_ENGINE_PROFILE", "production")
        .spawn()
        .expect("spawn production ve-host");
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_line(
        &mut stdin,
        &json!({
            "ch": "init",
            "protocol": 1,
            "config": {
                "offline": true,
                "scripting": true,
                "securityProfile": "production"
            },
            "contextId": 1
        }),
    );
    let ready = read_line(&mut stdout);
    assert_eq!(ready["ch"], "ready", "{ready}");
    assert_eq!(ready["sandbox"], true, "{ready}");
    assert_eq!(
        ready["scripting"],
        true,
        "production init must keep scripting=true: {ready}"
    );
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "open",
                "global": 1,
                "url": "data:text/html,<title>before</title><script>document.title='after'</script><label for=n>Name</label><input id=n name=n value=old><button id=b>Go</button>",
                "options": {}
            }
        }),
    );
    let opened = read_line(&mut stdout);
    assert_eq!(opened["ch"], "reply", "{opened}");
    assert_eq!(opened["value"]["ok"], true, "{opened}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "observe",
                "global": 1,
                "options": { "scope": null }
            }
        }),
    );
    let obs = read_line(&mut stdout);
    assert_eq!(obs["ch"], "reply", "{obs}");
    assert_eq!(obs["value"]["ok"], true, "{obs}");
    let title = obs["value"]
        .get("content")
        .and_then(|c| c.get("title"))
        .or_else(|| obs["value"].get("title"))
        .cloned()
        .unwrap_or(Value::Null);
    assert_eq!(title, "after", "{obs}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "execute",
                "global": 1,
                "steps": [
                    { "id": "f", "op": "fill", "target": "css:#n", "value": "Ada" },
                    { "id": "e", "op": "evaluate", "expression": "document.title + ':' + document.getElementById('n').value" }
                ],
                "options": { "returnObservation": true }
            }
        }),
    );
    let exec = read_line(&mut stdout);
    assert_eq!(exec["ch"], "reply", "{exec}");
    assert_eq!(exec["value"]["ok"], true, "{exec}");
    assert_eq!(exec["value"]["title"], "after", "{exec}");
    let extracted = exec["value"]["steps"]
        .as_array()
        .and_then(|steps| {
            steps.iter().find_map(|s| {
                s.get("extracted")
                    .cloned()
                    .or_else(|| s.get("value").cloned())
                    .or_else(|| s.get("result").cloned())
            })
        })
        .or_else(|| exec["value"].get("extracted").cloned())
        .unwrap_or(Value::Null);
    let _ = extracted;
    let deadline = Instant::now() + Duration::from_secs(2);
    let _ = child.kill();
    while Instant::now() < deadline {
        if child.try_wait().ok().flatten().is_some() {
            break;
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    let _ = child.wait();
}

#[cfg(feature = "v8")]
#[test]
#[allow(clippy::zombie_processes)]
fn production_sandbox_runs_external_js_from_allowlisted_fixture() {
    use std::time::{Duration, Instant};

    let (port, _server) = spawn_fixture();
    let allow = format!("127.0.0.1:{port}");
    let origin = format!("http://{allow}");
    let bin = host_bin();
    let mut child = Command::new(&bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .env("VECTOR_ENGINE_SANDBOX", "1")
        .env("VECTOR_ENGINE_PROFILE", "production")
        .spawn()
        .expect("spawn production ve-host");
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_line(
        &mut stdin,
        &json!({
            "ch": "init",
            "protocol": 1,
            "config": {
                "offline": false,
                "scripting": true,
                "securityProfile": "production",
                "policy": {
                    "blockLoopback": true,
                    "allowlist": [allow]
                }
            },
            "contextId": 1
        }),
    );
    let ready = read_line(&mut stdout);
    assert_eq!(ready["ch"], "ready", "{ready}");
    assert_eq!(ready["sandbox"], true, "{ready}");
    assert_eq!(ready["scripting"], true, "{ready}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "open",
                "global": 1,
                "url": origin,
                "options": {}
            }
        }),
    );
    let opened = read_until_reply(&mut stdin, &mut stdout, &allow);
    assert_eq!(opened["ch"], "reply", "{opened}");
    assert_eq!(opened["value"]["ok"], true, "{opened}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "observe",
                "global": 1,
                "options": { "scope": null }
            }
        }),
    );
    let obs = read_until_reply(&mut stdin, &mut stdout, &allow);
    assert_eq!(obs["ch"], "reply", "{obs}");
    assert_eq!(obs["value"]["ok"], true, "{obs}");
    let title = obs["value"]
        .get("content")
        .and_then(|c| c.get("title"))
        .or_else(|| obs["value"].get("title"))
        .cloned()
        .unwrap_or(Value::Null);
    assert_eq!(title, "inline-ext", "inline + external JS must run: {obs}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "execute",
                "global": 1,
                "steps": [
                    { "id": "f", "op": "fill", "target": "css:#n", "value": "Ada" },
                    { "id": "e", "op": "evaluate", "expression": "document.title + ':' + document.getElementById('n').value + ':' + document.body.getAttribute('data-ext')" }
                ],
                "options": { "returnObservation": true }
            }
        }),
    );
    let exec = read_until_reply(&mut stdin, &mut stdout, &allow);
    assert_eq!(exec["ch"], "reply", "{exec}");
    assert_eq!(exec["value"]["ok"], true, "{exec}");
    write_line(
        &mut stdin,
        &json!({
            "ch": "cmd",
            "op": {
                "op": "open",
                "global": 2,
                "url": "http://127.0.0.1:1/unauthorized",
                "options": {}
            }
        }),
    );
    let blocked = read_until_reply(&mut stdin, &mut stdout, &allow);
    let blocked_ok = blocked
        .get("value")
        .and_then(|v| v.get("ok"))
        .and_then(Value::as_bool);
    assert_ne!(
        blocked_ok,
        Some(true),
        "non-allowlisted fixture must fail closed: {blocked}"
    );
    let deadline = Instant::now() + Duration::from_secs(2);
    let _ = child.kill();
    while Instant::now() < deadline {
        if child.try_wait().ok().flatten().is_some() {
            break;
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    let _ = child.wait();
}
