//! Agent action API for the Vector Engine.
//!
//! Agents do not drive the engine through synthetic mouse events and polling;
//! they hand it a typed [`Program`] of [`Step`]s and get back a structured
//! [`ExecutionReport`]. The engine knows when the page is ready
//! ([`Readiness`]: event-loop quiescence plus clean style and layout), so
//! every step implicitly waits for the page to settle before and after acting.
//!
//! * [`Step`] — `click`, `fill`, `select`, `press`, `scroll`, `navigate`,
//!   `waitFor`, `extract`, `collectScroll`. Steps address elements through a
//!   [`Target`]: a CSS selector, a snapshot reference (`n12.0`), visible
//!   text, an accessibility role + name, or a form label.
//! * [`Page`] — the executor's view of a live page. [`DomPage`] is the
//!   in-engine implementation over `ve-dom`/`ve-style`/`ve-layout`/`ve-a11y`
//!   with the `ve-script` event loop; embedders can implement the trait for
//!   remote or recorded pages.
//! * [`Executor`] — interprets a program step by step, records timings,
//!   readiness after each step and every extracted value.
//!
//! Time inside programs is *virtual*: `waitFor` advances the page's event
//! loop clock rather than sleeping, which keeps runs deterministic and fast.
//! Deliberate M0 stubs: no script event listeners fire on interaction (the
//! VM has no DOM bindings yet), form submission does not navigate, and
//! `press` handles a small set of keys.

#![forbid(unsafe_code)]

pub mod executor;
pub mod page;
pub mod readiness;
pub mod steps;

pub use executor::{ExecutionReport, Executor, StepResult, StepStatus};
pub use page::{DomPage, LoadedDocument, Loader, Page, ScrollState};
pub use readiness::Readiness;
pub use steps::{ExtractKind, Presence, Program, ProgramOptions, Step, Target, WaitCondition};
pub use ve_a11y::SnapshotFormat;
pub use ve_core::NodeId;
