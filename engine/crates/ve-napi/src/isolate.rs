//! Per-context isolate processes (plan A21).
//!
//! The parent owns sockets ([`ve_net::NetworkBroker`]). A `ve-host` child
//! speaks newline JSON: commands in, replies out, fetch jobs in between.
//! [`Host::spawn`] uses a child when `VECTOR_ENGINE_HOST` points at the
//! binary; otherwise it keeps the in-process thread.

use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use ve_api::{EngineConfig, VectorEngine};
use ve_net::{
    FnTransport, NetworkBroker, NullTransport, Request, Response, WireRequest, WireResponse,
};

use crate::errors::ApiError;
use crate::host::{ExecuteOptions, HostState};

/// Isolate control-pipe protocol. Bump when `Channel` changes incompatibly.
pub const HOST_PROTOCOL: u32 = 1;

/// Largest JSON line accepted on the control pipe (VEC-002 oversized IPC).
const MAX_MESSAGE_BYTES: usize = 16 * 1024 * 1024;

/// Gate A: a stalled child must fail visibly instead of hanging the parent.
const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(5);

/// JSON line on the control pipe.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "ch", rename_all = "camelCase")]
enum Channel {
    /// Parent → child: engine config for this context.
    Init {
        /// Protocol version. Missing/0 is a mismatch.
        #[serde(default)]
        protocol: u32,
        /// Engine config for the child.
        config: EngineConfig,
        /// Context id (camelCase `contextId` on the wire).
        #[serde(rename = "contextId")]
        context_id: u32,
    },
    /// Child → parent: sandbox applied, ready for commands.
    Ready {
        /// Protocol the child will speak.
        #[serde(default)]
        protocol: u32,
        /// Whether the OS sandbox was applied.
        #[serde(default)]
        sandbox: bool,
        /// Whether this host will attach a JS VM to opened pages.
        #[serde(default)]
        scripting: bool,
    },
    /// Handshake or policy failure. The peer must exit.
    Fatal {
        /// `backend_unavailable` / `invalid_params`.
        code: String,
        /// Human message.
        message: String,
    },
    /// Parent → child: one host method.
    Cmd { op: Op },
    /// Child → parent: method result.
    Reply { value: Value },
    /// Child → parent: run this fetch on the broker.
    Fetch { id: u64, request: WireRequest },
    /// Parent → child: fetch result.
    FetchResult {
        id: u64,
        #[serde(default)]
        error: Option<String>,
        #[serde(default)]
        response: Option<WireResponse>,
    },
}

/// Named host operations (closures cannot cross a process boundary).
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase")]
pub enum Op {
    /// [`HostState::open`].
    Open {
        /// Global page id.
        global: u64,
        /// URL or `data:` document.
        url: String,
        /// Open options JSON.
        options: Value,
    },
    /// [`HostState::observe`].
    Observe {
        /// Global page id.
        global: u64,
        /// Observation request JSON.
        options: Value,
    },
    /// [`HostState::execute`].
    Execute {
        /// Global page id.
        global: u64,
        /// Steps or a Program object.
        steps: Value,
        /// Execute options.
        options: ExecuteOptions,
    },
    /// [`HostState::screenshot`].
    Screenshot {
        /// Global page id.
        global: u64,
        /// Screenshot options JSON.
        options: Value,
    },
    /// [`HostState::close`].
    Close {
        /// Global page id.
        global: u64,
    },
    /// [`HostState::get_cookies`].
    GetCookies {
        /// Optional URL filter.
        url: Option<String>,
    },
    /// [`HostState::set_cookies`].
    SetCookies {
        /// `BrowserCookie[]` JSON.
        cookies: String,
    },
}

/// Handle that forwards [`Op`]s to a `ve-host` child.
pub struct ProcessClient {
    tx: Sender<ProcessJob>,
}

struct ProcessJob {
    op: Op,
    reply: Sender<Value>,
}

impl ProcessClient {
    /// Spawns `bin` as a context process. `None` when the binary is missing.
    pub fn try_spawn(config: EngineConfig, context_id: u32) -> Option<Self> {
        let bin = host_binary()?;
        Self::spawn(&bin, config, context_id).ok()
    }

    /// Require a host binary and a successful protocol/sandbox handshake.
    pub fn spawn_required(config: EngineConfig, context_id: u32) -> Result<Self, String> {
        let bin = host_binary().ok_or_else(|| "ve-host binary missing".to_owned())?;
        Self::spawn(&bin, config, context_id)
    }

    fn spawn(bin: &Path, config: EngineConfig, context_id: u32) -> Result<Self, String> {
        let production = config.security_profile == ve_api::SecurityProfile::Production;
        let mut child = Command::new(bin)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .env("VECTOR_ENGINE_SANDBOX", if production { "1" } else { "0" })
            .env(
                "VECTOR_ENGINE_PROFILE",
                if production {
                    "production"
                } else {
                    "developer"
                },
            )
            .spawn()
            .map_err(|e| format!("spawn ve-host: {e}"))?;
        let mut stdin = child
            .stdin
            .take()
            .ok_or_else(|| "ve-host stdin missing".to_owned())?;
        let stdout_raw = child
            .stdout
            .take()
            .ok_or_else(|| "ve-host stdout missing".to_owned())?;
        write_msg(&mut stdin, &Channel::Init {
            protocol: HOST_PROTOCOL,
            config: config.clone(),
            context_id,
        })
        .map_err(|e| format!("ve-host init write: {e}"))?;
        let (hs_tx, hs_rx) = mpsc::channel();
        thread::Builder::new()
            .name("ve-host-handshake".into())
            .spawn(move || {
                let mut r = BufReader::new(stdout_raw);
                let msg = read_msg(&mut r);
                let _ = hs_tx.send((msg, r));
            })
            .map_err(|e| format!("spawn handshake: {e}"))?;
        let (ready, stdout) = match hs_rx.recv_timeout(HANDSHAKE_TIMEOUT) {
            Ok((Ok(msg), r)) => (msg, r),
            Ok((Err(e), _)) => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!("ve-host handshake failed: {e}"));
            }
            Err(_) => {
                let _ = child.kill();
                let _ = child.wait();
                return Err("ve-host handshake stalled".into());
            }
        };
        match ready {
            Channel::Ready {
                protocol,
                sandbox,
                scripting: _,
            } if protocol == HOST_PROTOCOL => {
                if production && !sandbox {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err("ve-host did not apply a production sandbox".into());
                }
            }
            Channel::Ready { protocol, .. } => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!(
                    "ve-host protocol mismatch: child={protocol} parent={HOST_PROTOCOL}"
                ));
            }
            Channel::Fatal { message, .. } => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(message);
            }
            other => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!("ve-host handshake failed: {other:?}"));
            }
        }
        let (tx, rx) = mpsc::channel::<ProcessJob>();
        thread::Builder::new()
            .name(format!("ve-host-io-{context_id}"))
            .spawn(move || parent_loop(child, stdin, stdout, config, context_id, rx))
            .map_err(|e| format!("spawn ve-host io: {e}"))?;
        Ok(Self { tx })
    }

    /// Queues `op`; the receiver yields the child's JSON reply.
    #[must_use]
    pub fn request(&self, op: Op) -> Receiver<Value> {
        let (reply, rx) = mpsc::channel();
        if self.tx.send(ProcessJob { op, reply }).is_err() {
            let (reply, rx) = mpsc::channel();
            let _ = reply.send(ApiError::thread_stopped().to_reply());
            return rx;
        }
        rx
    }
}

fn parent_loop(
    mut child: Child,
    mut stdin: impl Write,
    mut stdout: BufReader<std::process::ChildStdout>,
    config: EngineConfig,
    context_id: u32,
    jobs: Receiver<ProcessJob>,
) {
    let broker = parent_broker(&config, context_id);
    while let Ok(job) = jobs.recv() {
        if write_msg(&mut stdin, &Channel::Cmd { op: job.op }).is_err() {
            let _ = job.reply.send(ApiError::thread_stopped().to_reply());
            break;
        }
        let value = loop {
            match read_msg(&mut stdout) {
                Ok(Channel::Fetch { id, request }) => {
                    let result = match Request::try_from(request) {
                        Ok(req) => match broker.fetch(ve_net::FetchJob {
                            context: context_id,
                            request: req,
                        }) {
                            Ok(resp) => Channel::FetchResult {
                                id,
                                error: None,
                                response: Some(WireResponse::from(&resp)),
                            },
                            Err(e) => Channel::FetchResult {
                                id,
                                error: Some(e.to_string()),
                                response: None,
                            },
                        },
                        Err(e) => Channel::FetchResult {
                            id,
                            error: Some(e.to_string()),
                            response: None,
                        },
                    };
                    if write_msg(&mut stdin, &result).is_err() {
                        break None;
                    }
                }
                Ok(Channel::Reply { value }) => break Some(value),
                Ok(_) | Err(_) => break None,
            }
        };
        let _ = job
            .reply
            .send(value.unwrap_or_else(|| ApiError::thread_stopped().to_reply()));
    }
    let _ = child.kill();
    let _ = child.wait();
}

fn parent_broker(config: &EngineConfig, context_id: u32) -> NetworkBroker {
    let policy = config.policy.clone();
    if config.offline {
        return NetworkBroker::with_policy(Box::new(NullTransport), policy, context_id);
    }
    #[cfg(feature = "http")]
    {
        if let Ok(t) = ve_net::HyperTransport::new() {
            return NetworkBroker::with_policy(Box::new(t), policy, context_id);
        }
    }
    NetworkBroker::with_policy(Box::new(NullTransport), policy, context_id)
}

fn write_msg(w: &mut impl Write, msg: &Channel) -> std::io::Result<()> {
    let line = serde_json::to_string(msg).map_err(std::io::Error::other)?;
    writeln!(w, "{line}")?;
    w.flush()
}

fn read_msg(r: &mut impl BufRead) -> std::io::Result<Channel> {
    let mut line = String::new();
    let n = r.read_line(&mut line)?;
    if n == 0 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::UnexpectedEof,
            "ve-host closed",
        ));
    }
    if line.len() > MAX_MESSAGE_BYTES {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "ve-host message exceeds 16MiB",
        ));
    }
    serde_json::from_str(line.trim()).map_err(std::io::Error::other)
}

/// Path set by the addon loader (`VECTOR_ENGINE_HOST`).
#[must_use]
pub fn host_binary() -> Option<PathBuf> {
    let raw = std::env::var_os("VECTOR_ENGINE_HOST")?;
    if raw.is_empty() || raw == "0" {
        return None;
    }
    let path = PathBuf::from(raw);
    path.is_file().then_some(path)
}

thread_local! {
    static CHILD_IO: std::cell::RefCell<Option<ChildIo>> = const { std::cell::RefCell::new(None) };
    static FETCH_ID: std::cell::Cell<u64> = const { std::cell::Cell::new(0) };
}

struct ChildIo {
    stdin: BufReader<std::io::Stdin>,
    stdout: std::io::Stdout,
}

fn child_write(msg: &Channel) -> Result<(), String> {
    CHILD_IO.with(|io| {
        let mut io = io.borrow_mut();
        let io = io
            .as_mut()
            .ok_or_else(|| "ve-host stdio missing".to_owned())?;
        write_msg(&mut io.stdout, msg).map_err(|e| e.to_string())
    })
}

fn child_read() -> Result<Channel, String> {
    CHILD_IO.with(|io| {
        let mut io = io.borrow_mut();
        let io = io
            .as_mut()
            .ok_or_else(|| "ve-host stdio missing".to_owned())?;
        read_msg(&mut io.stdin).map_err(|e| e.to_string())
    })
}

fn child_fetch(request: &Request) -> Result<Response, ve_net::NetError> {
    let id = FETCH_ID.with(|c| {
        let n = c.get() + 1;
        c.set(n);
        n
    });
    child_write(&Channel::Fetch {
        id,
        request: WireRequest::from(request),
    })
    .map_err(ve_net::NetError::Transport)?;
    loop {
        match child_read() {
            Ok(Channel::FetchResult {
                id: rid,
                error,
                response,
            }) if rid == id => {
                if let Some(msg) = error {
                    return Err(ve_net::NetError::Transport(msg));
                }
                let wire =
                    response.ok_or_else(|| ve_net::NetError::Transport("empty fetch".into()))?;
                return Response::try_from(wire);
            }
            Ok(_) => {}
            Err(e) => return Err(ve_net::NetError::Transport(e)),
        }
    }
}

/// Child entry: apply sandbox in `ve-host`, then this.
pub fn serve_stdio() {
    CHILD_IO.with(|io| {
        *io.borrow_mut() = Some(ChildIo {
            stdin: BufReader::new(std::io::stdin()),
            stdout: std::io::stdout(),
        });
    });
    let Channel::Init {
        protocol,
        config,
        context_id,
    } = (match child_read() {
        Ok(msg) => msg,
        Err(e) => {
            eprintln!("ve-host init: {e}");
            return;
        }
    })
    else {
        eprintln!("ve-host expected init");
        return;
    };
    if protocol != HOST_PROTOCOL {
        let _ = child_write(&Channel::Fatal {
            code: "backend_unavailable".into(),
            message: format!("protocol mismatch: got {protocol}, want {HOST_PROTOCOL}"),
        });
        return;
    }
    let sandbox = std::env::var_os("VECTOR_ENGINE_SANDBOX_APPLIED").is_some_and(|v| v == "1");
    if config.security_profile == ve_api::SecurityProfile::Production && !sandbox {
        let _ = child_write(&Channel::Fatal {
            code: "backend_unavailable".into(),
            message: "production profile requires sandbox".into(),
        });
        return;
    }
    let scripting = config.scripting;
    let engine = VectorEngine::with_transport(config, Box::new(FnTransport::new(child_fetch)));
    let mut state = HostState::with_engine(engine, context_id);
    let _ = child_write(&Channel::Ready {
        protocol: HOST_PROTOCOL,
        sandbox,
        scripting,
    });
    loop {
        match child_read() {
            Ok(Channel::Cmd { op }) => {
                let value = dispatch(&mut state, op);
                if child_write(&Channel::Reply { value }).is_err() {
                    break;
                }
            }
            Ok(_) => {}
            Err(_) => break,
        }
    }
}

fn dispatch(state: &mut HostState, op: Op) -> Value {
    match op {
        Op::Open {
            global,
            url,
            options,
        } => state.open(global, &url, &options),
        Op::Observe { global, options } => state.observe(global, &options),
        Op::Execute {
            global,
            steps,
            options,
        } => state.execute(global, &steps, &options),
        Op::Screenshot { global, options } => state.screenshot(global, &options),
        Op::Close { global } => state.close(global),
        Op::GetCookies { url } => state.get_cookies(url.as_deref()),
        Op::SetCookies { cookies } => state.set_cookies(&cookies),
    }
}

#[cfg(all(test, unix))]
mod tests {
    use super::*;
    use std::os::unix::fs::PermissionsExt;
    use std::time::Instant;
    use ve_api::SecurityProfile;

    #[test]
    fn stalled_host_handshake_fails_without_downgrade() {
        let script = std::env::temp_dir().join(format!("ve-stall-host-{}.sh", std::process::id()));
        std::fs::write(&script, "#!/bin/sh\nexec sleep 30\n").expect("write stall script");
        std::fs::set_permissions(&script, std::fs::Permissions::from_mode(0o755)).expect("chmod");
        let started = Instant::now();
        let err = match ProcessClient::spawn(
            &script,
            EngineConfig {
                offline: true,
                security_profile: SecurityProfile::Production,
                isolation: ve_api::IsolationMode::RequireProcess,
                ..EngineConfig::default()
            },
            1,
        ) {
            Ok(_) => panic!("stalled child must fail closed"),
            Err(e) => e,
        };
        let _ = std::fs::remove_file(&script);
        assert!(
            err.contains("stalled") || err.contains("handshake"),
            "{err}"
        );
        assert!(
            started.elapsed() < Duration::from_secs(8),
            "handshake timeout must not hang: {:?}",
            started.elapsed()
        );
    }
}
