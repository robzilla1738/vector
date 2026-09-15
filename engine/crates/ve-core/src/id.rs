//! Stable identifiers: [`NodeId`] and [`Revision`].

use std::fmt;
use std::str::FromStr;

use serde::{Deserialize, Serialize};

/// A stable handle to a node in an arena DOM.
///
/// A `NodeId` is an *index* into the arena plus a *generation* counter. When a
/// node is destroyed its slot may be reused; the generation is bumped so that
/// stale ids held by callers (agents, layout caches, snapshots) fail to resolve
/// instead of silently pointing at an unrelated node.
///
/// `NodeId` doubles as the element reference handed to agents. Its textual
/// form is `n<index>.<generation>` (for example `n42.0`) and it round-trips
/// through [`fmt::Display`] / [`FromStr`] and through a packed `u64`.
#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(into = "u64", from = "u64")]
pub struct NodeId {
    index: u32,
    generation: u32,
}

impl NodeId {
    /// Creates an id from an arena slot index and a generation.
    #[must_use]
    pub const fn new(index: u32, generation: u32) -> Self {
        Self { index, generation }
    }

    /// The arena slot index.
    #[must_use]
    pub const fn index(self) -> u32 {
        self.index
    }

    /// The generation the slot had when this id was minted.
    #[must_use]
    pub const fn generation(self) -> u32 {
        self.generation
    }

    /// Packs the id into a single `u64` (`generation << 32 | index`).
    #[must_use]
    pub const fn to_u64(self) -> u64 {
        ((self.generation as u64) << 32) | self.index as u64
    }

    /// Unpacks an id produced by [`NodeId::to_u64`].
    #[must_use]
    pub const fn from_u64(packed: u64) -> Self {
        Self {
            index: packed as u32,
            generation: (packed >> 32) as u32,
        }
    }
}

impl From<NodeId> for u64 {
    fn from(id: NodeId) -> Self {
        id.to_u64()
    }
}

impl From<u64> for NodeId {
    fn from(packed: u64) -> Self {
        Self::from_u64(packed)
    }
}

impl fmt::Debug for NodeId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "NodeId({self})")
    }
}

impl fmt::Display for NodeId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "n{}.{}", self.index, self.generation)
    }
}

/// Error returned when a textual node reference cannot be parsed.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("invalid node reference `{0}` (expected `n<index>.<generation>`)")]
pub struct ParseNodeIdError(pub String);

impl FromStr for NodeId {
    type Err = ParseNodeIdError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let err = || ParseNodeIdError(s.to_owned());
        let rest = s.strip_prefix('n').ok_or_else(err)?;
        let (index, generation) = rest.split_once('.').ok_or_else(err)?;
        Ok(Self::new(
            index.parse().map_err(|_| err())?,
            generation.parse().map_err(|_| err())?,
        ))
    }
}

/// A monotonically increasing document revision.
///
/// Every mutation recorded in the DOM's mutation journal advances the
/// revision. Consumers (style, layout, accessibility snapshots, agents)
/// remember the revision they last observed and ask the journal for what
/// changed since; equal revisions guarantee an unchanged tree.
#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Default, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Revision(pub u64);

impl Revision {
    /// The revision of a freshly created, never mutated document.
    pub const ZERO: Self = Self(0);

    /// Returns the revision following this one.
    #[must_use]
    pub const fn next(self) -> Self {
        Self(self.0 + 1)
    }

    /// Returns `true` if `self` was recorded strictly after `other`.
    #[must_use]
    pub const fn is_after(self, other: Self) -> bool {
        self.0 > other.0
    }
}

impl fmt::Debug for Revision {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "r{}", self.0)
    }
}

impl fmt::Display for Revision {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn node_id_round_trips_through_text_and_u64() {
        let id = NodeId::new(42, 7);
        assert_eq!(id.to_string(), "n42.7");
        assert_eq!("n42.7".parse::<NodeId>().unwrap(), id);
        assert_eq!(NodeId::from_u64(id.to_u64()), id);
        assert_eq!(serde_json::to_string(&id).unwrap(), id.to_u64().to_string());
        assert!("42.7".parse::<NodeId>().is_err());
        assert!("n42".parse::<NodeId>().is_err());
    }

    #[test]
    fn revision_ordering() {
        let r = Revision::ZERO;
        assert!(r.next().is_after(r));
        assert!(!r.is_after(r));
        assert_eq!(format!("{:?}", r.next()), "r1");
    }
}
