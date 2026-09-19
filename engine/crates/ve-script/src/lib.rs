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
//! * [`EventLoop`] — the HTML event loop model: per-source task queues
//!   selected by HTML-ish priority, a microtask queue drained after every task,
//!   virtual-time timers and an in-flight async counter. Its
//!   [`EventLoop::is_quiescent`] answer is one half of the agent-facing
//!   readiness signal (the other half is clean style/layout, owned by
//!   `ve-agent`).
//! * [`webidl`] — WebIDL parser and Rust binding-stub generator. `build.rs`
//!   reads `idl/*.webidl` and emits [`generated`] traits; `ve-agent` implements
//!   them over `ve-dom` through the host-function table.
//!
//! `document.write` is unsupported.

// `unsafe` is confined to the V8 FFI module (architecture §10).
#![deny(unsafe_code)]

pub mod event_loop;
#[cfg(feature = "quickjs")]
pub mod quickjs;
#[cfg(feature = "v8")]
pub mod v8_vm;
pub mod vm;
pub mod webidl;

pub use event_loop::{DueJsTimer, EventLoop, RunReport, TaskId, TaskSource};
#[cfg(feature = "quickjs")]
pub use quickjs::QuickJsVm;
#[cfg(feature = "v8")]
pub use v8_vm::V8Vm;
pub use vm::{
    HostApi, JsValue, JsVm, NoHost, NullVm, ScriptError, decode_data_module, default_vm,
    module_import_specifiers, normalize_module_url, resolve_module_specifier,
};
pub use webidl::{Argument, Interface, Member, generate_rust_stub, parse_webidl};

/// Traits generated from `idl/*.webidl` (plan A14).
#[allow(missing_docs, dead_code, unused_imports, clippy::all)]
pub mod generated {
    include!(concat!(env!("OUT_DIR"), "/dom_bindings.rs"));
}
