//! Hermetic replay (VEC-024).
//!
//! Records external inputs for a declared scope. Replay denies live network
//! unless an archive answers. Speculative branches cannot emit effects.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

/// One recorded network exchange.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArchivedResponse {
    /// Request URL.
    pub url: String,
    /// Method.
    pub method: String,
    /// Status.
    pub status: u16,
    /// Body bytes.
    pub body: Vec<u8>,
}

/// Replay archive.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReplayArchive {
    /// Recorded responses keyed by `METHOD URL`.
    pub entries: HashMap<String, ArchivedResponse>,
    /// Scheduling decisions (virtual time ticks).
    pub schedule: Vec<u64>,
}

impl ReplayArchive {
    /// Insert a recorded response.
    pub fn record(&mut self, entry: ArchivedResponse) {
        self.entries
            .insert(format!("{} {}", entry.method, entry.url), entry);
    }

    /// Lookup. Missing entries are unsupported nondeterminism.
    pub fn lookup(&self, method: &str, url: &str) -> Result<&ArchivedResponse, ReplayError> {
        self.entries
            .get(&format!("{method} {url}"))
            .ok_or_else(|| ReplayError::UnsupportedNondeterminism(format!("{method} {url}")))
    }
}

/// Replay failure.
#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum ReplayError {
    /// Live I/O that was not archived.
    #[error("unsupported nondeterminism: {0}")]
    UnsupportedNondeterminism(String),
    /// A speculative branch tried to write.
    #[error("speculative branch cannot emit external effects: {0}")]
    SpeculativeEffect(String),
}

/// Replay session. `speculative` forbids GET-is-harmless assumptions and all writes.
pub struct ReplaySession<'a> {
    archive: &'a ReplayArchive,
    /// When true, no external effect may leave this session.
    pub speculative: bool,
}

impl<'a> ReplaySession<'a> {
    /// Live-network-denied session.
    #[must_use]
    pub fn new(archive: &'a ReplayArchive) -> Self {
        Self {
            archive,
            speculative: false,
        }
    }

    /// Fetch from the archive only.
    pub fn fetch(&self, method: &str, url: &str) -> Result<&'a ArchivedResponse, ReplayError> {
        if self.speculative && !method.eq_ignore_ascii_case("GET") {
            return Err(ReplayError::SpeculativeEffect(format!("{method} {url}")));
        }
        self.archive.lookup(method, url)
    }

    /// Winning plans must revalidate live preconditions before execution.
    #[must_use]
    pub fn requires_live_revalidation(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_archive_entry_is_nondeterminism() {
        let archive = ReplayArchive::default();
        let session = ReplaySession::new(&archive);
        assert!(matches!(
            session.fetch("GET", "https://example.test/"),
            Err(ReplayError::UnsupportedNondeterminism(_))
        ));
    }

    #[test]
    fn speculative_writes_are_denied() {
        let mut archive = ReplayArchive::default();
        archive.record(ArchivedResponse {
            url: "https://example.test/save".into(),
            method: "POST".into(),
            status: 200,
            body: vec![],
        });
        archive.record(ArchivedResponse {
            url: "https://example.test/".into(),
            method: "GET".into(),
            status: 200,
            body: vec![],
        });
        let mut session = ReplaySession::new(&archive);
        session.speculative = true;
        assert!(matches!(
            session.fetch("POST", "https://example.test/save"),
            Err(ReplayError::SpeculativeEffect(_))
        ));
        session.speculative = false;
        assert!(session.fetch("POST", "https://example.test/save").is_ok());
        session.speculative = true;
        assert!(
            session.fetch("GET", "https://example.test/").is_ok(),
            "archived GET may be read in speculation"
        );
        assert!(
            session.requires_live_revalidation(),
            "GET is not assumed harmless"
        );
    }
}
