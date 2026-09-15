//! Scripting for the Vector Engine.
//!
//! The engine does not hard-wire a JavaScript implementation. Everything that
//! executes script goes through the [`JsVm`] trait so that the VM can be
//! swapped (QuickJS-NG today; a JIT engine later) or omitted entirely for
//! script-free embeddings.
//!
//! * [`JsVm`] — VM-agnostic evaluation interface with a JSON-shaped
//!   [`JsValue`] exchange type. [`NullVm`] is the always-available backend
//!   that evaluates only JSON literals and reports everything else as
//!   unsupported. [`QuickJsVm`] (feature `quickjs`) wraps QuickJS-NG through
//!   `rquickjs`.
//! * [`EventLoop`] — the HTML event loop model: task queues with task sources,
//!   a microtask queue drained after every task, virtual-time timers and an
//!   in-flight async counter. Its [`EventLoop::is_quiescent`] answer is one
//!   half of the agent-facing readiness signal (the other half is clean
//!   style/layout, owned by `ve-agent`).
//! * [`webidl`] — a minimal WebIDL parser and Rust binding-stub generator. It
//!   is the seed of the bindings pipeline: DOM interfaces will be described in
//!   WebIDL and the generated traits implemented against `ve-dom`.
//!
//! Deliberate M0 stubs: no DOM bindings are registered in any VM yet; scripts
//! see a bare JavaScript global. `document.write` is unsupported.

// `unsafe` is confined to the V8 FFI module (architecture §10).
#![deny(unsafe_code)]

pub mod event_loop;
#[cfg(feature = "quickjs")]
pub mod quickjs;
#[cfg(feature = "v8")]
pub mod v8_vm;
pub mod vm;
pub mod webidl;

pub use event_loop::{EventLoop, RunReport, TaskId, TaskSource};
#[cfg(feature = "quickjs")]
pub use quickjs::QuickJsVm;
#[cfg(feature = "v8")]
pub use v8_vm::V8Vm;
pub use vm::{HostApi, JsValue, JsVm, NoHost, NullVm, ScriptError, default_vm};
pub use webidl::{Argument, Interface, Member, generate_rust_stub, parse_webidl};
