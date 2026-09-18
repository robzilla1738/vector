//! Context-process binary (plan A21 / VEC-002).

#![deny(unsafe_op_in_unsafe_fn)]

mod sandbox;

use std::net::TcpStream;
use std::process::{Command, Stdio};
use std::time::Duration;

fn main() {
    let production = matches!(
        std::env::var("VECTOR_ENGINE_PROFILE").as_deref(),
        Ok("production" | "prod")
    ) || matches!(
        std::env::var("VECTOR_ENGINE_STRICT").as_deref(),
        Ok("1" | "true")
    );
    let opt_out = std::env::var_os("VECTOR_ENGINE_SANDBOX").is_some_and(|v| v == "0");
    // V8 platform + watchdog threads must exist before seccomp denies clone.
    ve_napi::preload_scripting();
    let sandbox_applied = if production || !opt_out {
        match sandbox::apply() {
            Ok(()) => true,
            Err(e) => {
                eprintln!("ve-host sandbox: {e}");
                if production || !opt_out {
                    std::process::exit(2);
                }
                false
            }
        }
    } else {
        false
    };
    if production && !sandbox_applied {
        eprintln!("ve-host: production profile requires a sandbox");
        std::process::exit(2);
    }
    // Safety: process start, no other threads yet.
    unsafe {
        std::env::set_var(
            "VECTOR_ENGINE_SANDBOX_APPLIED",
            if sandbox_applied { "1" } else { "0" },
        );
    }
    if let Ok(kind) = std::env::var("VECTOR_ENGINE_SANDBOX_SELFTEST") {
        sandbox_selftest(&kind, sandbox_applied);
    }
    ve_napi::isolate::serve_stdio();
}

/// VEC-002 negative checks that must run *inside* the sandboxed host.
///
/// Exit 0: the forbidden operation was denied. Exit 11/12: it succeeded.
fn sandbox_selftest(kind: &str, sandbox_applied: bool) {
    if !sandbox_applied {
        eprintln!("ve-host selftest requires an applied sandbox");
        std::process::exit(2);
    }
    match kind {
        "exec" => {
            let allowed = ["/usr/bin/true", "/bin/true"].iter().any(|bin| {
                Command::new(bin)
                    .stdin(Stdio::null())
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .status()
                    .map(|s| s.success())
                    .unwrap_or(false)
            });
            std::process::exit(if allowed { 11 } else { 0 });
        }
        "network" => {
            let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 1));
            match TcpStream::connect_timeout(&addr, Duration::from_millis(200)) {
                Ok(_) => std::process::exit(12),
                Err(e) if e.kind() == std::io::ErrorKind::ConnectionRefused => {
                    // socket() worked; the filter did not deny network creation.
                    std::process::exit(12);
                }
                Err(_) => std::process::exit(0),
            }
        }
        "thread" => {
            let ok = std::thread::Builder::new()
                .name("ve-host-selftest".into())
                .spawn(|| 1 + 1)
                .ok()
                .and_then(|t| t.join().ok())
                .is_some();
            std::process::exit(if ok { 0 } else { 14 });
        }
        "js" => {
            // V8 platform threads were preloaded before seccomp. Creating an
            // isolate and evaluating under the sandbox must not SIGSYS.
            ve_napi::preload_scripting();
            let ok = ve_napi::scripting_selftest();
            std::process::exit(if ok { 0 } else { 15 });
        }
        "clone" => {
            #[cfg(target_os = "linux")]
            unsafe {
                if libc::unshare(0) == 0 {
                    std::process::exit(13);
                }
                std::process::exit(0);
            }
            #[cfg(not(target_os = "linux"))]
            unsafe {
                let pid = libc::fork();
                if pid == 0 {
                    libc::_exit(0);
                }
                if pid > 0 {
                    libc::waitpid(pid, std::ptr::null_mut(), 0);
                    std::process::exit(13);
                }
                std::process::exit(0);
            }
        }
        other => {
            eprintln!("ve-host unknown selftest {other}");
            std::process::exit(2);
        }
    }
}
