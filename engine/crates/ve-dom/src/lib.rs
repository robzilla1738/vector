//! Arena DOM for the Vector Engine.
//!
//! # Contract
//!
//! * [`Document`] owns every node in a generational arena. Nodes are addressed
//!   by [`NodeId`] (`u32` slot index + `u32` generation). Ids are **stable for
//!   the lifetime of the node** and **detect staleness** after the node is
//!   destroyed, which is what lets the same id serve as the element reference
//!   agents receive in snapshots.
//! * Tree structure is stored as parent / first & last child / prev & next
//!   sibling links, so insertion and removal are `O(1)` and traversal never
//!   allocates.
//! * Every structural or attribute mutation is recorded in the
//!   [`MutationJournal`] together with the [`Revision`] at which it happened,
//!   and marks the touched node (and its ancestors) with [`DirtyFlags`].
//!   Downstream stages (style, layout, a11y) consume the journal to do
//!   incremental work and clear the flags they own.
//! * Shadow DOM: an element may host exactly one shadow root
//!   ([`ShadowRootMode`]); shadow trees live in the same arena and are reached
//!   through [`Document::shadow_root`], never through `children`.
//! * Form state: user-visible state of form controls (current value, checked,
//!   selected) lives in [`FormState`] separately from the content attributes,
//!   mirroring the HTML "dirty value flag" semantics.
//!
//! This crate knows nothing about HTML semantics beyond namespaces; parsing is
//! `ve-html`'s job and element semantics belong to `ve-style`/`ve-a11y`.

#![forbid(unsafe_code)]

mod document;
mod journal;
mod node;

pub use document::{Ancestors, Children, Descendants, Document, QuirksMode};
pub use journal::{DirtyFlags, JournalEntry, Mutation, MutationJournal};
pub use node::{
    Attribute, ElementData, FormState, HTML_NAMESPACE, MATHML_NAMESPACE, Namespace, Node, NodeKind,
    SVG_NAMESPACE, ShadowRootMode,
};
pub use ve_core::{NodeId, Revision};
