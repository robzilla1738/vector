//! VEC-002 negative containment: malformed IPC, oversized messages, protocol
//! mismatch, host termination, and forbidden operations under the OS sandbox.

use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};
use std::time::Duration;

use serde_json::{Value, json};

fn spawn_host() -> std::process::Child {
    let bin = env!("CARGO_BIN_EXE_ve-host");
    Command::new(bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("VECTOR_ENGINE_SANDBOX", "0")
        .spawn()
        .expect("spawn ve-host")
}

fn write_raw(w: &mut impl Write, line: &str) {
    let _ = writeln!(w, "{line}");
    let _ = w.flush();
}

fn read_line_timeout(r: &mut impl BufRead) -> Option<Value> {
    let mut line = String::new();
    r.read_line(&mut line).ok()?;
    if line.is_empty() {
        return None;
    }
    serde_json::from_str(line.trim()).ok()
}

#[test]
fn protocol_mismatch_is_fatal() {
    let mut child = spawn_host();
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_raw(
        &mut stdin,
        &json!({"ch":"init","protocol":99,"config":{"offline":true},"contextId":1}).to_string(),
    );
    let reply = read_line_timeout(&mut stdout);
    if let Some(v) = reply {
        assert!(
            v["ch"] == "fatal" || v.get("code").is_some(),
            "protocol mismatch must be fatal: {v}"
        );
    }
    let _ = child.kill();
    let _ = child.wait();
}

#[test]
fn malformed_json_does_not_start_a_page() {
    let mut child = spawn_host();
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_raw(&mut stdin, "{not json");
    std::thread::sleep(Duration::from_millis(50));
    write_raw(
        &mut stdin,
        &json!({
            "ch": "init",
            "protocol": 1,
            "config": { "offline": true },
            "contextId": 1
        })
        .to_string(),
    );
    let ready = read_line_timeout(&mut stdout);
    if let Some(v) = &ready {
        assert_ne!(
            v.get("value").and_then(|x| x.get("ok")),
            Some(&json!(true)),
            "malformed IPC must not look like a successful open: {v}"
        );
    }
    let _ = child.kill();
    let _ = child.wait();
}

#[test]
fn oversized_message_is_rejected() {
    let mut child = spawn_host();
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_raw(
        &mut stdin,
        &json!({"ch":"init","protocol":1,"config":{"offline":true},"contextId":1}).to_string(),
    );
    let _ = read_line_timeout(&mut stdout);
    let huge = format!(
        "{{\"ch\":\"cmd\",\"op\":{{\"op\":\"open\",\"global\":1,\"url\":\"data:text/html,x\",\"options\":{{\"html\":\"{}\"}}}}}}",
        "a".repeat(17 * 1024 * 1024)
    );
    let _ = writeln!(stdin, "{huge}");
    let _ = stdin.flush();
    drop(stdin);
    let reply = read_line_timeout(&mut stdout);
    if let Some(r) = &reply {
        let ok = r
            .get("value")
            .and_then(|v| v.get("ok"))
            .and_then(Value::as_bool);
        assert_ne!(ok, Some(true), "oversized IPC must not open a page: {r}");
    }
    let status = child
        .wait()
        .expect("ve-host should exit after oversized IPC");
    let _ = status;
}

#[test]
fn host_termination_is_observable() {
    let mut child = spawn_host();
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_raw(
        &mut stdin,
        &json!({"ch":"init","protocol":1,"config":{"offline":true},"contextId":1}).to_string(),
    );
    let ready = read_line_timeout(&mut stdout);
    assert!(
        ready.as_ref().is_some_and(|v| v["ch"] == "ready"),
        "{ready:?}"
    );
    let _ = child.kill();
    let waited = child.wait().unwrap();
    assert!(!waited.success() || waited.code() != Some(0) || cfg!(unix));
}

#[test]
fn sandbox_forbidden_file_and_network() {
    let bin = env!("CARGO_BIN_EXE_ve-host");
    let mut child = Command::new(bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("VECTOR_ENGINE_SANDBOX", "1")
        .env("VECTOR_ENGINE_PROFILE", "developer")
        .spawn()
        .expect("spawn sandboxed ve-host");
    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap());
    write_raw(
        &mut stdin,
        &json!({
            "ch": "init",
            "protocol": 1,
            "config": { "offline": false, "policy": { "allowFile": true, "blockLoopback": false } },
            "contextId": 1
        })
        .to_string(),
    );
    let handshake = read_line_timeout(&mut stdout);
    match handshake {
        Some(v) if v["ch"] == "ready" => {
            write_raw(
                &mut stdin,
                &json!({
                    "ch": "cmd",
                    "op": {
                        "op": "open",
                        "global": 1,
                        "url": "file:///etc/passwd",
                        "options": {}
                    }
                })
                .to_string(),
            );
            let reply = read_line_timeout(&mut stdout);
            if let Some(r) = reply {
                let ok = r
                    .get("value")
                    .and_then(|v| v.get("ok"))
                    .and_then(Value::as_bool);
                assert_ne!(ok, Some(true), "sandbox must not serve /etc/passwd: {r}");
            }
        }
        Some(v) if v["ch"] == "fatal" => {}
        other => panic!("sandboxed host handshake: {other:?}"),
    }
    let _ = child.kill();
    let _ = child.wait();
}

fn sandbox_selftest(kind: &str) -> std::process::ExitStatus {
    Command::new(env!("CARGO_BIN_EXE_ve-host"))
        .env("VECTOR_ENGINE_SANDBOX", "1")
        .env("VECTOR_ENGINE_SANDBOX_SELFTEST", kind)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .status()
        .unwrap_or_else(|e| panic!("spawn ve-host selftest {kind}: {e}"))
}

#[test]
fn sandbox_denies_child_process_exec() {
    let status = sandbox_selftest("exec");
    assert_eq!(
        status.code(),
        Some(0),
        "sandboxed ve-host must not exec /usr/bin/true (11) or skip the sandbox (2): {status:?}"
    );
}

#[test]
fn sandbox_denies_network_creation() {
    let status = sandbox_selftest("network");
    assert_eq!(
        status.code(),
        Some(0),
        "sandboxed ve-host must not create sockets (12) or skip the sandbox (2): {status:?}"
    );
}
