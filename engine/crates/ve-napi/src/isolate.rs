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

use serde::{Deserialize, Serialize};
use serde_json::Value;
use ve_api::{EngineConfig, VectorEngine};
use ve_net::{
    FnTransport, NetworkBroker, NullTransport, Request, Response, Transport, WireRequest,
    WireResponse,
};

use crate::errors::ApiError;
use crate::host::{ExecuteOptions, HostState};

/// JSON line on the control pipe.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "ch", rename_all = "camelCase")]
enum Channel {
    /// Parent → child: engine config for this context.
    Init {
        /// Engine config for the child.
        config: EngineConfig,
        /// Context id (camelCase `contextId` on the wire).
        #[serde(rename = "contextId")]
        context_id: u32,
    },
    /// Child → parent: sandbox applied, ready for commands.
    Ready,
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

    fn spawn(bin: &Path, config: EngineConfig, context_id: u32) -> Result<Self, String> {
        let child = Command::new(bin)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .env("VECTOR_ENGINE_SANDBOX", "1")
            .spawn()
            .map_err(|e| format!("spawn ve-host: {e}"))?;
        let (tx, rx) = mpsc::channel::<ProcessJob>();
        thread::Builder::new()
            .name(format!("ve-host-io-{context_id}"))
            .spawn(move || parent_loop(child, config, context_id, rx))
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
    config: EngineConfig,
    context_id: u32,
    jobs: Receiver<ProcessJob>,
) {
    let Some(mut stdin) = child.stdin.take() else {
        return;
    };
    let Some(stdout) = child.stdout.take() else {
        return;
    };
    let mut stdout = BufReader::new(stdout);
    let broker = parent_broker(&config);
    if write_msg(&mut stdin, &Channel::Init { config, context_id }).is_err() {
        return;
    }
    match read_msg(&mut stdout) {
        Ok(Channel::Ready) => {}
        other => {
            let _ = other;
            let _ = child.kill();
            let _ = child.wait();
            return;
        }
    }
    while let Ok(job) = jobs.recv() {
        if write_msg(&mut stdin, &Channel::Cmd { op: job.op }).is_err() {
            let _ = job.reply.send(ApiError::thread_stopped().to_reply());
            break;
        }
        let value = loop {
            match read_msg(&mut stdout) {
                Ok(Channel::Fetch { id, request }) => {
                    let result = match Request::try_from(request) {
                        Ok(req) => match broker.send(&req) {
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

fn parent_broker(config: &EngineConfig) -> NetworkBroker {
    if config.offline {
        return NetworkBroker::new(Box::new(NullTransport));
    }
    #[cfg(feature = "http")]
    {
        if let Ok(t) = ve_net::HyperTransport::new() {
            return NetworkBroker::new(Box::new(t));
        }
    }
    NetworkBroker::new(Box::new(NullTransport))
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
    let Channel::Init { config, context_id } = (match child_read() {
        Ok(msg) => msg,
        Err(e) => {
            eprintln!("ve-host init: {e}");
            return;
        }
    }) else {
        eprintln!("ve-host expected init");
        return;
    };
    let engine = VectorEngine::with_transport(config, Box::new(FnTransport::new(child_fetch)));
    let mut state = HostState::with_engine(engine, context_id);
    let _ = child_write(&Channel::Ready);
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
