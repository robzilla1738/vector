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
pub mod diff;
pub mod observation;
pub mod os;
pub mod roles;
pub mod snapshot;
pub mod tree;

pub use accname::{LabelIndex, compute_description, compute_name, compute_name_with};
pub use diff::{FieldChange, ObservationDelta, ObservationSubscription, TextOp, changes_between};
pub use observation::{
    ConsoleEntry, DialogEntry, ElementRef, FormField, Format, FrameInfo, LinkEntry,
    ObservationContent, ObservationRequest, ObserveInput, RectJson, RoleSelector, Scope,
    ScrollInfo, SelectorStrategy, Stats, TableBlock, ViewportInfo, Visibility5, classify, observe,
    parse_ref, parse_ref_parts, ref_for,
};
pub use os::{
    TABLIST_ID, URLBAR_ID, WEB_ID, WINDOW_ID, page_node_id, page_tree_update, shell_tree_update,
};
pub use roles::Role;
pub use snapshot::{
    SemanticSnapshot, SnapshotDiff, SnapshotFormat, SnapshotNode, changed_refs_since,
};
pub use tree::{AccessibilityNode, AccessibilityTree, BuildOptions, Live, States};
pub use ve_core::NodeId;
pub use ve_dom::Document;
