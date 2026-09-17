//! The mutation journal and per-node dirty flags.
//!
//! The journal is an append-only log of what changed and at which
//! [`Revision`]. Consumers remember the last revision they processed and call
//! [`MutationJournal::entries_since`] to catch up incrementally. The journal is
//! bounded: once it exceeds its capacity the oldest entries are dropped and
//! consumers that fall too far behind are told so
//! ([`MutationJournal::entries_since`] returns `None`) and must do a full pass.

use std::collections::VecDeque;
use std::fmt;
use std::ops::{BitAnd, BitOr, BitOrAssign, Not};

use serde::{Deserialize, Serialize};
use ve_core::{NodeId, Revision};

/// Bit set describing which downstream stages must revisit a node.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(transparent)]
pub struct DirtyFlags(u8);

impl DirtyFlags {
    /// Nothing to do.
    pub const NONE: Self = Self(0);
    /// Computed style must be recomputed.
    pub const STYLE: Self = Self(1 << 0);
    /// Geometry must be recomputed.
    pub const LAYOUT: Self = Self(1 << 1);
    /// Text content changed (inline layout, accessible name).
    pub const TEXT: Self = Self(1 << 2);
    /// Accessibility node must be rebuilt.
    pub const A11Y: Self = Self(1 << 3);
    /// Paint output must be regenerated.
    pub const PAINT: Self = Self(1 << 4);
    /// Some descendant carries dirty flags (set on ancestors so traversals
    /// can skip clean subtrees).
    pub const DESCENDANTS: Self = Self(1 << 5);
    /// Every descendant's computed style must be recomputed (an inherited
    /// property changed, or a sibling-/`:has()`-dependent rule was hit).
    /// Cleared by style recalc.
    pub const STYLE_DESCENDANTS: Self = Self(1 << 6);
    /// Ancestor path marker set by layout invalidation from a `LAYOUT` node
    /// up to the nearest layout boundary. Cleared by layout.
    pub const LAYOUT_CHILDREN: Self = Self(1 << 7);
    /// Alias of [`Self::STYLE`]: this node's own computed style is stale.
    pub const STYLE_SELF: Self = Self::STYLE;
    /// Alias of [`Self::LAYOUT`]: this node's own geometry is stale.
    pub const LAYOUT_SELF: Self = Self::LAYOUT;
    /// Every flag that applies to the node itself.
    pub const ALL: Self =
        Self(Self::STYLE.0 | Self::LAYOUT.0 | Self::TEXT.0 | Self::A11Y.0 | Self::PAINT.0);

    /// Returns `true` if any bit in `other` is set in `self`.
    #[must_use]
    pub const fn intersects(self, other: Self) -> bool {
        self.0 & other.0 != 0
    }

    /// Returns `true` if every bit in `other` is set in `self`.
    #[must_use]
    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }

    /// Returns `true` if no bit is set.
    #[must_use]
    pub const fn is_empty(self) -> bool {
        self.0 == 0
    }

    /// Raw bits.
    #[must_use]
    pub const fn bits(self) -> u8 {
        self.0
    }
}

impl BitOr for DirtyFlags {
    type Output = Self;
    fn bitor(self, rhs: Self) -> Self {
        Self(self.0 | rhs.0)
    }
}

impl BitOrAssign for DirtyFlags {
    fn bitor_assign(&mut self, rhs: Self) {
        self.0 |= rhs.0;
    }
}

impl BitAnd for DirtyFlags {
    type Output = Self;
    fn bitand(self, rhs: Self) -> Self {
        Self(self.0 & rhs.0)
    }
}

impl Not for DirtyFlags {
    type Output = Self;
    fn not(self) -> Self {
        Self(!self.0)
    }
}

impl fmt::Debug for DirtyFlags {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let names = [
            (Self::STYLE, "STYLE"),
            (Self::LAYOUT, "LAYOUT"),
            (Self::TEXT, "TEXT"),
            (Self::A11Y, "A11Y"),
            (Self::PAINT, "PAINT"),
            (Self::DESCENDANTS, "DESCENDANTS"),
            (Self::STYLE_DESCENDANTS, "STYLE_DESCENDANTS"),
            (Self::LAYOUT_CHILDREN, "LAYOUT_CHILDREN"),
        ];
        let mut first = true;
        write!(f, "DirtyFlags(")?;
        for (flag, name) in names {
            if self.contains(flag) {
                if !first {
                    write!(f, "|")?;
                }
                first = false;
                write!(f, "{name}")?;
            }
        }
        if first {
            write!(f, "NONE")?;
        }
        write!(f, ")")
    }
}

/// A single recorded mutation.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Mutation {
    /// A node was allocated (not yet in the tree).
    NodeCreated {
        /// The new node.
        node: NodeId,
    },
    /// A node was inserted under `parent`.
    NodeInserted {
        /// Inserted node.
        node: NodeId,
        /// New parent.
        parent: NodeId,
        /// Sibling immediately before `node` after the insert.
        #[serde(default)]
        previous_sibling: Option<NodeId>,
        /// Sibling immediately after `node` after the insert.
        #[serde(default)]
        next_sibling: Option<NodeId>,
    },
    /// A node was detached from `parent` (it may still exist).
    NodeRemoved {
        /// Detached node.
        node: NodeId,
        /// Former parent.
        parent: NodeId,
        /// Sibling immediately before `node` before the remove.
        #[serde(default)]
        previous_sibling: Option<NodeId>,
        /// Sibling immediately after `node` before the remove.
        #[serde(default)]
        next_sibling: Option<NodeId>,
    },
    /// A node and its subtree were freed; the id is now stale.
    NodeDestroyed {
        /// Freed node.
        node: NodeId,
    },
    /// An attribute was added, changed or removed.
    AttributeChanged {
        /// Owning element.
        node: NodeId,
        /// Attribute name.
        name: String,
        /// Previous value (`None` if it was absent).
        old_value: Option<String>,
    },
    /// Character data changed.
    TextChanged {
        /// The text node.
        node: NodeId,
        /// Previous data (`None` if it was absent).
        #[serde(default)]
        old_value: Option<String>,
    },
    /// A form control's user-visible state changed.
    FormStateChanged {
        /// The form control element.
        node: NodeId,
    },
    /// A shadow root was attached to `host`.
    ShadowAttached {
        /// Host element.
        host: NodeId,
        /// The new shadow root.
        root: NodeId,
    },
    /// The document's quirks mode was set.
    QuirksModeChanged,
    /// Layout moved or resized the node's border box (emitted by `ve-layout`
    /// when a fragment's document-space rectangle changes between passes).
    GeometryChanged {
        /// The node whose geometry changed.
        node: NodeId,
    },
    /// A scroll container (or the viewport when `None`) was scrolled.
    Scrolled {
        /// The scroll container; `None` for the viewport.
        node: Option<NodeId>,
    },
}

impl Mutation {
    /// The node most directly affected by this mutation, if any.
    #[must_use]
    pub fn target(&self) -> Option<NodeId> {
        match self {
            Mutation::NodeCreated { node }
            | Mutation::NodeInserted { node, .. }
            | Mutation::NodeRemoved { node, .. }
            | Mutation::NodeDestroyed { node }
            | Mutation::AttributeChanged { node, .. }
            | Mutation::TextChanged { node, .. }
            | Mutation::GeometryChanged { node }
            | Mutation::FormStateChanged { node } => Some(*node),
            Mutation::ShadowAttached { host, .. } => Some(*host),
            Mutation::Scrolled { node } => *node,
            Mutation::QuirksModeChanged => None,
        }
    }
}

/// A mutation together with the revision it produced.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct JournalEntry {
    /// Revision of the document *after* this mutation.
    pub revision: Revision,
    /// What happened.
    pub mutation: Mutation,
}

/// Append-only, bounded log of document mutations.
#[derive(Clone, Debug)]
pub struct MutationJournal {
    revision: Revision,
    entries: VecDeque<JournalEntry>,
    capacity: usize,
    /// Revision of the oldest entry still retained, if any.
    oldest_retained: Revision,
}

impl Default for MutationJournal {
    fn default() -> Self {
        Self::with_capacity(Self::DEFAULT_CAPACITY)
    }
}

impl MutationJournal {
    /// Default number of retained entries.
    pub const DEFAULT_CAPACITY: usize = 65_536;

    /// Creates a journal retaining at most `capacity` entries.
    #[must_use]
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            revision: Revision::ZERO,
            entries: VecDeque::new(),
            capacity: capacity.max(1),
            oldest_retained: Revision::ZERO,
        }
    }

    /// The current document revision.
    #[must_use]
    pub fn revision(&self) -> Revision {
        self.revision
    }

    /// Records a mutation, advancing the revision. Returns the new revision.
    pub fn record(&mut self, mutation: Mutation) -> Revision {
        self.revision = self.revision.next();
        if self.entries.len() == self.capacity {
            self.entries.pop_front();
            if let Some(front) = self.entries.front() {
                self.oldest_retained = front.revision;
            }
        }
        if self.entries.is_empty() {
            self.oldest_retained = self.revision;
        }
        self.entries.push_back(JournalEntry {
            revision: self.revision,
            mutation,
        });
        self.revision
    }

    /// Entries recorded strictly after `since`.
    ///
    /// Returns `None` if entries after `since` have already been evicted, in
    /// which case the caller must fall back to a full traversal.
    #[must_use]
    pub fn entries_since(&self, since: Revision) -> Option<impl Iterator<Item = &JournalEntry>> {
        if since >= self.revision {
            return Some(self.entries.range(0..0));
        }
        if self.entries.is_empty() || since.next() < self.oldest_retained {
            return None;
        }
        // Entries are sorted by revision; binary search for the first one after `since`.
        let start = self.entries.partition_point(|e| e.revision <= since);
        Some(self.entries.range(start..))
    }

    /// Distinct nodes touched strictly after `since`, in first-touched order.
    /// Returns `None` under the same conditions as [`Self::entries_since`].
    #[must_use]
    pub fn touched_since(&self, since: Revision) -> Option<Vec<NodeId>> {
        let mut out: Vec<NodeId> = Vec::new();
        for entry in self.entries_since(since)? {
            if let Some(id) = entry.mutation.target()
                && !out.contains(&id)
            {
                out.push(id);
            }
        }
        Some(out)
    }

    /// Number of retained entries.
    #[must_use]
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Returns `true` if no entries are retained.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Drops all retained entries without changing the revision.
    pub fn clear(&mut self) {
        self.entries.clear();
        self.oldest_retained = self.revision.next();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn created(i: u32) -> Mutation {
        Mutation::NodeCreated {
            node: NodeId::new(i, 0),
        }
    }

    #[test]
    fn entries_since_tracks_revisions_and_eviction() {
        let mut j = MutationJournal::with_capacity(3);
        let r1 = j.record(created(1));
        let r2 = j.record(created(2));
        assert_eq!(r2, Revision(2));
        assert_eq!(j.entries_since(r1).unwrap().count(), 1);
        assert_eq!(j.entries_since(Revision::ZERO).unwrap().count(), 2);
        assert_eq!(j.entries_since(r2).unwrap().count(), 0);

        j.record(created(3));
        j.record(created(1)); // evicts r1
        assert_eq!(j.len(), 3);
        assert!(j.entries_since(Revision::ZERO).is_none(), "fell behind");
        assert_eq!(j.entries_since(r1).unwrap().count(), 3);
        assert_eq!(
            j.touched_since(r1).unwrap(),
            vec![NodeId::new(2, 0), NodeId::new(3, 0), NodeId::new(1, 0)]
        );
    }

    #[test]
    fn dirty_flags_algebra() {
        let f = DirtyFlags::STYLE | DirtyFlags::LAYOUT;
        assert!(f.contains(DirtyFlags::STYLE));
        assert!(!f.contains(DirtyFlags::A11Y));
        assert!(f.intersects(DirtyFlags::LAYOUT | DirtyFlags::PAINT));
        assert_eq!((f & !DirtyFlags::STYLE), DirtyFlags::LAYOUT);
        assert_eq!(format!("{f:?}"), "DirtyFlags(STYLE|LAYOUT)");
    }
}
