//! Agent action API for the Vector Engine (architecture §6).
//!
//! Agents hand the engine a typed [`Program`] of [`Step`]s — the same JSON
//! the runtime validates with `contracts/program.ts` — and get back a
//! [`ProgramResult`] of [`StepOutcome`]s. Everything runs against a
//! [`Page`]: one document with its computed styles, layout, history, scroll
//! and focus state.
//!
//! * [`Page::open`] runs the real pipeline: fetch (through a [`Loader`],
//!   backed by `ve-net` in `ve-api`) → charset decode → streaming parse →
//!   cascade → layout → static-page classification ([`RoutingInfo`]).
//! * [`Page::observe`] settles the page and produces the
//!   `ObservationContent` shape (via `ve-a11y`) with `changesSince` diffs.
//! * [`Page::execute`] runs a program step by step: epoch check, target
//!   resolution (`r<index>`, `css:`, `text=`, `role=`), actionability
//!   (attached → shown → enabled → stable → unoccluded), the op, `settle()`,
//!   `expect`.
//! * Errors carry the exact `VectorErrorCode` strings (`ve_core::ErrorCode`).
//!
//! No JavaScript runs in this milestone: `evaluate`, `waitFor expression`,
//! `dialog` and downloads report `capability_unsupported` so the runtime can
//! fall back to Chromium.

#![forbid(unsafe_code)]

pub mod executor;
pub mod forms;
pub mod keys;
pub mod page;
pub mod regex_lite;
pub mod routing;
pub mod screenshot;
pub mod steps;
pub mod target;

pub use executor::{ExecuteRequest, ExecuteResult};
pub use keys::{Chord, Key, Modifiers};
pub use page::{
    DEFAULT_TIMEOUT_MS, DEFAULT_VIEWPORT, EngineObservation, FnLoader, InFlightSummary,
    LoadedDocument, Loader, NavMethod, NavigationRequest, Page, SETTLE_NAVIGATION_MS,
    SETTLE_STEP_MS, ScrollState, outer_html,
};
pub use routing::{CssCoverage, RoutingInfo, classify};
pub use screenshot::Screenshot;
pub use steps::{
    Condition, DialogAction, ExtractField, MouseButton, Program, ProgramResult, ProgramStatus,
    ScrollDirection, SelectValue, SelectorState, Settled, Step, StepBase, StepError, StepOutcome,
    StepStatus,
};
pub use target::TargetSpec;
pub use ve_a11y::{Format, ObservationContent, ObservationRequest, Scope};
pub use ve_core::{ErrorCode, NodeId};
