//! Shared foundation types for the Vector Engine.
//!
//! `ve-core` is the one crate every other engine crate depends on. It is
//! deliberately tiny and dependency-light: it holds the vocabulary that
//! subsystems use to talk to each other without depending on each other.
//!
//! * [`NodeId`] / [`Revision`] — stable identifiers for DOM nodes and a
//!   monotonically increasing document revision. A `NodeId` is what agents
//!   receive as an element reference, so it must survive arbitrary tree
//!   mutations and detect staleness (see the generation counter).
//! * [`geometry`] — `f32` device-independent pixel geometry shared by layout,
//!   graphics, hit testing and the accessibility tree.
//! * [`Error`] — the engine-wide error type. Subsystems may define richer local
//!   errors but convert into this at crate boundaries.
//! * [`Stage`] / [`StageTimer`] — named pipeline stages used for tracing spans
//!   and for the `perf` tool's per-stage measurements.
//! * [`process_rss_bytes`] — live process RSS when the OS exposes it.
//!
//! Nothing in this crate allocates on hot paths or depends on a runtime.

#![forbid(unsafe_code)]

pub mod account;
pub mod clock;
pub mod error;
pub mod geometry;
pub mod id;
pub mod trace;

pub use account::{
    host_package_energy_uj, process_memory_snapshot, process_rss_bytes, process_tree_rss_bytes,
};
pub use clock::Clock;
pub use error::{Error, ErrorCode, ErrorPayload, Result};
pub use geometry::{Edges, Point, Rect, Size};
pub use id::{NodeId, Revision};
pub use trace::{Stage, StageSample, StageTimer};

/// Engine version string, taken from the workspace package version.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
