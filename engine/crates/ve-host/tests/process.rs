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
            "config": { "offline": true },
            "contextId": 1
        }),
    );
    let ready = read_line(&mut stdout);
    assert_eq!(ready["ch"], "ready", "{ready}");
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
