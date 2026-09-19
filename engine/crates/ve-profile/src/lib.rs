//! `SQLite` profile store for ordinary browsing (H2-A4).
//!
//! History, bookmarks, session restore, downloads, find, zoom, cert
//! interstitial decisions, and permission grants. The on-disk file is a
//! real `SQLite` database (`Profile::open`). Tests use `:memory:`.

#![forbid(unsafe_code)]

use std::path::{Path, PathBuf};

use rusqlite::{Connection, OptionalExtension, params};
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

/// Permission decision (never from page text).
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

/// Certificate interstitial decision.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CertDecision {
    /// Host.
    pub host: String,
    /// Fingerprint.
    pub fingerprint: String,
    /// `proceed` or `block`.
    pub decision: String,
}

/// On-disk `SQLite` profile.
#[derive(Debug)]
pub struct Profile {
    path: PathBuf,
    conn: Connection,
}

fn migrate(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            visited_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bookmarks (
            url TEXT PRIMARY KEY,
            title TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS session (
            position INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            title TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            path TEXT NOT NULL,
            bytes INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS permissions (
            effect TEXT NOT NULL,
            origin TEXT NOT NULL,
            scope TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            PRIMARY KEY (effect, origin, scope)
        );
        CREATE TABLE IF NOT EXISTS certs (
            host TEXT PRIMARY KEY,
            fingerprint TEXT NOT NULL,
            decision TEXT NOT NULL
        );
        ",
    )
}

impl Profile {
    /// Opens or creates the `SQLite` file at `path`.
    pub fn open(path: impl AsRef<Path>) -> rusqlite::Result<Self> {
        let path = path.as_ref().to_path_buf();
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let conn = Connection::open(&path)?;
        migrate(&conn)?;
        Ok(Self { path, conn })
    }

    /// In-memory `SQLite` profile (tests).
    pub fn memory() -> rusqlite::Result<Self> {
        let conn = Connection::open_in_memory()?;
        migrate(&conn)?;
        Ok(Self {
            path: PathBuf::from(":memory:"),
            conn,
        })
    }

    /// On-disk path (`:memory:` for tests).
    #[must_use]
    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Find query.
    pub fn find(&self) -> rusqlite::Result<String> {
        self.meta("find")
    }

    /// Zoom (1.0 = 100%).
    pub fn zoom(&self) -> rusqlite::Result<f32> {
        Ok(self.meta("zoom")?.parse().unwrap_or(1.0))
    }

    /// Set find query.
    pub fn set_find(&self, query: &str) -> rusqlite::Result<()> {
        self.set_meta("find", query)
    }

    /// Set zoom.
    pub fn set_zoom(&self, zoom: f32) -> rusqlite::Result<()> {
        self.set_meta("zoom", &zoom.to_string())
    }

    fn meta(&self, key: &str) -> rusqlite::Result<String> {
        self.conn
            .query_row("SELECT value FROM meta WHERE key = ?1", [key], |r| r.get(0))
            .optional()
            .map(|v| v.unwrap_or_default())
    }

    fn set_meta(&self, key: &str, value: &str) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO meta(key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }

    /// Record a visit.
    pub fn visit(
        &self,
        url: impl AsRef<str>,
        title: impl AsRef<str>,
        at: u64,
    ) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO history(url, title, visited_at) VALUES (?1, ?2, ?3)",
            params![url.as_ref(), title.as_ref(), at as i64],
        )?;
        Ok(())
    }

    /// History, newest last.
    pub fn history(&self) -> rusqlite::Result<Vec<HistoryEntry>> {
        let mut stmt = self
            .conn
            .prepare("SELECT url, title, visited_at FROM history ORDER BY id")?;
        let rows = stmt.query_map([], |r| {
            Ok(HistoryEntry {
                url: r.get(0)?,
                title: r.get(1)?,
                visited_at: r.get::<_, i64>(2)? as u64,
            })
        })?;
        rows.collect()
    }

    /// Add or replace a bookmark.
    pub fn bookmark(&self, url: impl AsRef<str>, title: impl AsRef<str>) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO bookmarks(url, title) VALUES (?1, ?2)
             ON CONFLICT(url) DO UPDATE SET title = excluded.title",
            params![url.as_ref(), title.as_ref()],
        )?;
        Ok(())
    }

    /// Bookmarks.
    pub fn bookmarks(&self) -> rusqlite::Result<Vec<Bookmark>> {
        let mut stmt = self.conn.prepare("SELECT url, title FROM bookmarks")?;
        let rows = stmt.query_map([], |r| {
            Ok(Bookmark {
                url: r.get(0)?,
                title: r.get(1)?,
            })
        })?;
        rows.collect()
    }

    /// Replace the restored session.
    pub fn save_session(&self, tabs: &[SessionTab]) -> rusqlite::Result<()> {
        self.conn.execute("DELETE FROM session", [])?;
        for (i, tab) in tabs.iter().enumerate() {
            self.conn.execute(
                "INSERT INTO session(position, url, title) VALUES (?1, ?2, ?3)",
                params![i as i64, tab.url, tab.title],
            )?;
        }
        Ok(())
    }

    /// Last session.
    pub fn session(&self) -> rusqlite::Result<Vec<SessionTab>> {
        let mut stmt = self
            .conn
            .prepare("SELECT url, title FROM session ORDER BY position")?;
        let rows = stmt.query_map([], |r| {
            Ok(SessionTab {
                url: r.get(0)?,
                title: r.get(1)?,
            })
        })?;
        rows.collect()
    }

    /// Record a download.
    pub fn record_download(&self, url: &str, path: &str, bytes: u64) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO downloads(url, path, bytes) VALUES (?1, ?2, ?3)",
            params![url, path, bytes as i64],
        )?;
        Ok(())
    }

    /// Downloads.
    pub fn downloads(&self) -> rusqlite::Result<Vec<Download>> {
        let mut stmt = self
            .conn
            .prepare("SELECT url, path, bytes FROM downloads ORDER BY id")?;
        let rows = stmt.query_map([], |r| {
            Ok(Download {
                url: r.get(0)?,
                path: r.get(1)?,
                bytes: r.get::<_, i64>(2)? as u64,
            })
        })?;
        rows.collect()
    }

    /// Grant a permission (chrome / user, never page text).
    pub fn grant(&self, grant: &PermissionGrant) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO permissions(effect, origin, scope, expires_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(effect, origin, scope) DO UPDATE SET expires_at = excluded.expires_at",
            params![
                grant.effect,
                grant.origin,
                grant.scope,
                grant.expires_at as i64
            ],
        )?;
        Ok(())
    }

    /// Stored grants.
    pub fn permissions(&self) -> rusqlite::Result<Vec<PermissionGrant>> {
        let mut stmt = self
            .conn
            .prepare("SELECT effect, origin, scope, expires_at FROM permissions")?;
        let rows = stmt.query_map([], |r| {
            Ok(PermissionGrant {
                effect: r.get(0)?,
                origin: r.get(1)?,
                scope: r.get(2)?,
                expires_at: r.get::<_, i64>(3)? as u64,
            })
        })?;
        rows.collect()
    }

    /// Record a cert interstitial decision.
    pub fn decide_cert(
        &self,
        host: &str,
        fingerprint: &str,
        decision: &str,
    ) -> rusqlite::Result<()> {
        self.conn.execute(
            "INSERT INTO certs(host, fingerprint, decision) VALUES (?1, ?2, ?3)
             ON CONFLICT(host) DO UPDATE SET fingerprint = excluded.fingerprint, decision = excluded.decision",
            params![host, fingerprint, decision],
        )?;
        Ok(())
    }

    /// Cert decisions.
    pub fn certs(&self) -> rusqlite::Result<Vec<CertDecision>> {
        let mut stmt = self
            .conn
            .prepare("SELECT host, fingerprint, decision FROM certs")?;
        let rows = stmt.query_map([], |r| {
            Ok(CertDecision {
                host: r.get(0)?,
                fingerprint: r.get(1)?,
                decision: r.get(2)?,
            })
        })?;
        rows.collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sqlite_round_trip() {
        let p = Profile::memory().unwrap();
        p.visit("https://example.test/", "Example", 1).unwrap();
        p.bookmark("https://example.test/", "Example").unwrap();
        p.save_session(&[SessionTab {
            url: "https://example.test/".into(),
            title: "Example".into(),
        }])
        .unwrap();
        p.set_find("hello").unwrap();
        p.set_zoom(1.25).unwrap();
        p.record_download("https://example.test/a.bin", "/tmp/a.bin", 12)
            .unwrap();
        p.grant(&PermissionGrant {
            effect: "geolocation".into(),
            origin: "https://example.test".into(),
            scope: "page".into(),
            expires_at: 0,
        })
        .unwrap();
        p.decide_cert("example.test", "aa", "block").unwrap();
        assert_eq!(p.history().unwrap().len(), 1);
        assert_eq!(p.bookmarks().unwrap().len(), 1);
        assert_eq!(p.session().unwrap().len(), 1);
        assert_eq!(p.find().unwrap(), "hello");
        assert!((p.zoom().unwrap() - 1.25).abs() < f32::EPSILON);
        assert_eq!(p.downloads().unwrap().len(), 1);
        assert_eq!(p.permissions().unwrap().len(), 1);
        assert_eq!(p.certs().unwrap()[0].decision, "block");
    }
}
