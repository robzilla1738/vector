//! Round-trip a `ve-host` child over the JSON control pipe (plan A21).

use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};

use serde_json::{Value, json};

fn write_line(w: &mut impl Write, v: &Value) {
    writeln!(w, "{v}").unwrap();
    w.flush().unwrap();
}

fn read_line(r: &mut impl BufRead) -> Value {
    let mut line = String::new();
    r.read_line(&mut line).unwrap();
    serde_json::from_str(line.trim()).unwrap()
}

#[test]
#[allow(clippy::zombie_processes)]
fn context_process_opens_inline_html() {
    let bin = env!("CARGO_BIN_EXE_ve-host");
    let mut child = Command::new(bin)
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

    let bin = env!("CARGO_BIN_EXE_ve-host");
    let mut child = Command::new(bin)
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
