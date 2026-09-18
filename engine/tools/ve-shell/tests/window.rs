//! Gate B: a live OS window and an MCP client share one `NativeBrowser`.
//!
//! Requires `--features window,v8`. Needs a working `DISPLAY` (Xvfb is enough)
//! and `libxkbcommon-x11` on Linux.

#![cfg(all(feature = "window", feature = "v8"))]

use std::io::{BufRead, BufReader};
use std::net::SocketAddr;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

use serde_json::{Value, json};
use ve_api::BrowserClient;

#[test]
fn live_os_window_and_mcp_share_one_page() {
    let display = std::env::var("DISPLAY").unwrap_or_else(|_| ":1".into());
    let mut child = Command::new(env!("CARGO_BIN_EXE_ve-shell"))
        .args([
            "--gui",
            "--service",
            "127.0.0.1:0",
            "--html",
            "<input id=t>",
            "https://window.test/",
        ])
        .env("DISPLAY", &display)
        .env_remove("WAYLAND_DISPLAY")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn ve-shell --gui");
    let stdout = BufReader::new(child.stdout.take().unwrap());
    let started = Instant::now();
    let mut addr = None;
    for line in stdout.lines() {
        let Ok(line) = line else {
            break;
        };
        if let Ok(v) = serde_json::from_str::<Value>(&line)
            && let Some(a) = v.get("VECTOR_BROWSER_SERVICE").and_then(Value::as_str)
        {
            assert_eq!(v["chromium"], false);
            assert_eq!(v["gui"], true);
            addr = Some(a.to_owned());
            break;
        }
        if started.elapsed() > Duration::from_secs(8) {
            break;
        }
    }
    let Some(addr) = addr else {
        fail_child(&mut child, &display, "did not bind VECTOR_BROWSER_SERVICE");
    };
    let sock: SocketAddr = addr.parse().expect("service addr");
    let mut mcp = retry_connect(sock).unwrap_or_else(|e| {
        fail_child(&mut child, &display, &format!("mcp connect: {e}"));
    });

    call_retry(
        &mut mcp,
        "input.event",
        json!({"type":"ime","text":"typed-in-window"}),
    )
    .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("ime: {e}")));
    let obs = call_retry(&mut mcp, "pages.observe", json!({}))
        .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("observe: {e}")));
    assert_eq!(obs["chromium"], false);
    assert_eq!(field_value(&obs), "typed-in-window", "{obs}");

    call_retry(
        &mut mcp,
        "pages.execute",
        json!({"program":[{"id":"a","op":"type","target":"css:input","value":"-agent"}]}),
    )
    .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("agent: {e}")));
    assert_eq!(
        field_value(
            &call_retry(&mut mcp, "pages.observe", json!({})).unwrap_or_else(|e| fail_child(
                &mut child,
                &display,
                &format!("obs2: {e}")
            ))
        ),
        "typed-in-window-agent"
    );

    let taken = call_retry(&mut mcp, "pages.takeover", json!({}))
        .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("takeover: {e}")));
    assert_eq!(taken["controller"], "human");
    let blocked = mcp.call(
        "pages.execute",
        json!({"program":[{"id":"x","op":"type","target":"css:input","value":"blocked"}]}),
    );
    assert!(blocked.is_err(), "takeover must stop agent dispatch");

    let resumed = call_retry(&mut mcp, "pages.resume", json!({}))
        .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("resume: {e}")));
    assert_eq!(resumed["controller"], "none");
    call_retry(
        &mut mcp,
        "pages.execute",
        json!({"program":[{"id":"y","op":"type","target":"css:input","value":"-ok"}]}),
    )
    .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("resume execute: {e}")));
    assert_eq!(
        field_value(
            &call_retry(&mut mcp, "pages.observe", json!({})).unwrap_or_else(|e| fail_child(
                &mut child,
                &display,
                &format!("obs3: {e}")
            ))
        ),
        "typed-in-window-agent-ok"
    );

    for ev in [
        json!({"type":"resize","width":800.0,"height":600.0}),
        json!({"type":"wheel","dx":0.0,"dy":40.0}),
        json!({"type":"accessKitAction","name":"urlbar"}),
        json!({"type":"imePreedit","text":"ni"}),
    ] {
        call_retry(&mut mcp, "input.event", ev.clone()).unwrap_or_else(|e| {
            fail_child(&mut child, &display, &format!("input {ev}: {e}"));
        });
    }

    let scene = call_retry(&mut mcp, "scene.update", json!({}))
        .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("scene: {e}")));
    assert_eq!(scene["png"], false);
    assert_eq!(scene["kind"], "displayList");
    let id = call_retry(&mut mcp, "identity", json!({}))
        .unwrap_or_else(|e| fail_child(&mut child, &display, &format!("identity: {e}")));
    assert_eq!(id["service"], "browser-service");
    assert_eq!(id["chromium"], false);
    let _ = child.kill();
    let _ = child.wait();
}

fn retry_connect(sock: SocketAddr) -> Result<BrowserClient, String> {
    let deadline = Instant::now() + Duration::from_secs(5);
    loop {
        match BrowserClient::connect(sock) {
            Ok(c) => return Ok(c),
            Err(e) if Instant::now() < deadline => {
                let _ = e;
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) => return Err(e.to_string()),
        }
    }
}

fn call_retry(client: &mut BrowserClient, method: &str, params: Value) -> Result<Value, String> {
    let deadline = Instant::now() + Duration::from_secs(8);
    loop {
        match client.call(method, params.clone()) {
            Ok(v) => return Ok(v),
            Err(e)
                if Instant::now() < deadline && e.to_string().contains("owner thread stopped") =>
            {
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) if Instant::now() < deadline && e.to_string().contains("timed") => {
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) => return Err(e.to_string()),
        }
    }
}

fn field_value(obs: &Value) -> String {
    obs.pointer("/observation/content/formFields")
        .or_else(|| obs.pointer("/content/formFields"))
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .find_map(|f| f.get("value").and_then(Value::as_str))
        .unwrap_or("")
        .to_owned()
}

fn fail_child(child: &mut Child, display: &str, why: &str) -> ! {
    let _ = child.kill();
    let status = child.wait();
    let mut stderr = String::new();
    if let Some(mut err) = child.stderr.take() {
        let _ = std::io::Read::read_to_string(&mut err, &mut stderr);
    }
    panic!("ve-shell --gui {why} on DISPLAY={display}: status={status:?} stderr={stderr}");
}
