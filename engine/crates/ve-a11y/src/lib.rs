//! Accessibility for the Vector Engine.
//!
//! The accessibility tree is the engine's primary output for agents: a
//! semantic view of the page (roles, names, states, values) with stable
//! [`NodeId`] references that can be fed straight back into `ve-agent`
//! actions.
//!
//! * [`Role`] — ARIA roles, either explicit (`role=""`) or implicit from HTML
//!   semantics ([`Role::implicit`]).
//! * [`compute_name`] — the accessible name computation (aria-labelledby,
//!   aria-label, native labelling, name from content, title).
//! * [`AccessibilityTree`] — the full tree with per-node [`States`], built from
//!   a [`Document`] and, optionally, its computed styles (for `display: none`
//!   / `visibility: hidden`) and layout (for bounds).
//! * [`SemanticSnapshot`] — a serialisable flattening of the tree in
//!   [`SnapshotFormat::Compact`] (agent-friendly: generic wrappers pruned,
//!   no geometry) or [`SnapshotFormat::Full`] (everything). Snapshots can be
//!   diffed against each other, and [`changed_refs_since`] uses the DOM's
//!   mutation journal to say which references changed since a revision.

#![forbid(unsafe_code)]

pub mod accname;
pub mod roles;
pub mod snapshot;
pub mod tree;

pub use accname::{compute_description, compute_name};
pub use roles::Role;
pub use snapshot::{
    SemanticSnapshot, SnapshotDiff, SnapshotFormat, SnapshotNode, changed_refs_since,
};
pub use tree::{AccessibilityNode, AccessibilityTree, BuildOptions, States};
pub use ve_core::NodeId;
pub use ve_dom::Document;
