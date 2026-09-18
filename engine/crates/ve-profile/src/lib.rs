//! Profile store for ordinary browsing (H2-A4).
//!
//! JSON file on disk (SQLite can replace the backend without changing the
//! API). History, bookmarks, session restore, downloads, find, zoom, and
//! permission decisions.

#![forbid(unsafe_code)]

use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// One history row.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    /// URL.
    pub url: String,
    /// Title.
    pub title: String,
    /// Unix ms.
    pub visited_at: u64,
}

/// A bookmark.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bookmark {
    /// URL.
    pub url: String,
    /// Title.
    pub title: String,
}

/// Session tab.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTab {
    /// URL.
    pub url: String,
    /// Title.
    pub title: String,
}

/// Download record.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Download {
    /// Source URL.
    pub url: String,
    /// Local path.
    pub path: String,
    /// Bytes written.
    pub bytes: u64,
}

/// Permission decision.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermissionGrant {
    /// Effect class or feature.
    pub effect: String,
    /// Origin.
    pub origin: String,
    /// Scope.
    pub scope: String,
    /// Expiry unix ms; 0 = session.
    pub expires_at: u64,
}

/// Whole profile document.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileData {
    /// History, newest last.
    pub history: Vec<HistoryEntry>,
    /// Bookmarks.
    pub bookmarks: Vec<Bookmark>,
    /// Last session.
    pub session: Vec<SessionTab>,
    /// Downloads.
    pub downloads: Vec<Download>,
    /// Find query.
    pub find: String,
    /// Zoom.
    pub zoom: f32,
    /// Permission grants (never from page text).
    pub permissions: Vec<PermissionGrant>,
}

impl Default for ProfileData {
    fn default() -> Self {
        Self {
            history: Vec::new(),
            bookmarks: Vec::new(),
            session: Vec::new(),
            downloads: Vec::new(),
            find: String::new(),
            zoom: 1.0,
            permissions: Vec::new(),
        }
    }
}

/// On-disk profile.
#[derive(Clone, Debug)]
pub struct Profile {
    path: PathBuf,
    data: ProfileData,
}

impl Profile {
    /// Opens or creates `path`.
    pub fn open(path: impl AsRef<Path>) -> std::io::Result<Self> {
        let path = path.as_ref().to_path_buf();
        let data = if path.exists() {
            let raw = fs::read_to_string(&path)?;
            serde_json::from_str(&raw).unwrap_or_default()
        } else {
            ProfileData::default()
        };
        Ok(Self { path, data })
    }

    /// In-memory profile (tests).
    #[must_use]
    pub fn memory() -> Self {
        Self {
            path: PathBuf::from(":memory:"),
            data: ProfileData::default(),
        }
    }

    /// Borrowed data.
    #[must_use]
    pub fn data(&self) -> &ProfileData {
        &self.data
    }

    /// Record a visit.
    pub fn visit(&mut self, url: impl Into<String>, title: impl Into<String>, at: u64) {
        self.data.history.push(HistoryEntry {
            url: url.into(),
            title: title.into(),
            visited_at: at,
        });
    }

    /// Persist. No-op for `:memory:`.
    pub fn save(&self) -> std::io::Result<()> {
        if self.path == PathBuf::from(":memory:") {
            return Ok(());
        }
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&self.path, serde_json::to_vec_pretty(&self.data).unwrap_or_default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn memory_round_trip() {
        let mut p = Profile::memory();
        p.visit("https://example.test/", "Example", 1);
        assert_eq!(p.data().history.len(), 1);
        p.save().unwrap();
    }
}
