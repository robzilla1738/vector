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
    /// When true, a speculative session may read this entry. Live revalidation
    /// is still required before a winning plan executes.
    #[serde(default)]
    pub safe_for_speculation: bool,
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

    /// Fetch from the archive only. Speculative sessions deny every method
    /// unless the archived entry is marked [`ArchivedResponse::safe_for_speculation`].
    pub fn fetch(&self, method: &str, url: &str) -> Result<&'a ArchivedResponse, ReplayError> {
        let entry = self.archive.lookup(method, url)?;
        if self.speculative && !entry.safe_for_speculation {
            return Err(ReplayError::SpeculativeEffect(format!("{method} {url}")));
        }
        Ok(entry)
    }

    /// Winning plans must revalidate live preconditions before execution.
    #[must_use]
    pub fn requires_live_revalidation(&self) -> bool {
        true
    }

    /// Recorded virtual-time tick at `index`, if the archive stored a schedule.
    #[must_use]
    pub fn scheduled_tick(&self, index: usize) -> Option<u64> {
        self.archive.schedule.get(index).copied()
    }

    /// Compare an archived entry to a live status. Missing live I/O is
    /// unsupported nondeterminism; a status mismatch means the plan must not
    /// execute from the archive alone.
    pub fn revalidate_live(
        &self,
        method: &str,
        url: &str,
        live_status: Option<u16>,
    ) -> Result<bool, ReplayError> {
        let archived = self.archive.lookup(method, url)?;
        let Some(status) = live_status else {
            return Err(ReplayError::UnsupportedNondeterminism(format!(
                "live revalidation missing for {method} {url}"
            )));
        };
        Ok(status == archived.status)
    }
}

impl ReplayError {
    /// Maps this error to a `ve_net::NetError::Blocked` message without depending on ve-net.
    #[must_use]
    pub fn to_net_error(&self) -> String {
        match self {
            Self::UnsupportedNondeterminism(what) => {
                format!("replay nondeterminism: {what}")
            }
            Self::SpeculativeEffect(what) => format!("speculative effect: {what}"),
        }
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
            safe_for_speculation: false,
        });
        archive.record(ArchivedResponse {
            url: "https://example.test/".into(),
            method: "GET".into(),
            status: 200,
            body: vec![],
            safe_for_speculation: false,
        });
        archive.record(ArchivedResponse {
            url: "https://example.test/safe".into(),
            method: "GET".into(),
            status: 200,
            body: vec![],
            safe_for_speculation: true,
        });
        let mut session = ReplaySession::new(&archive);
        session.speculative = true;
        assert!(matches!(
            session.fetch("POST", "https://example.test/save"),
            Err(ReplayError::SpeculativeEffect(_))
        ));
        assert!(matches!(
            session.fetch("GET", "https://example.test/"),
            Err(ReplayError::SpeculativeEffect(_))
        ));
        assert!(
            session.fetch("GET", "https://example.test/safe").is_ok(),
            "opt-in archive reads are allowed"
        );
        assert!(
            session.requires_live_revalidation(),
            "GET is not assumed harmless"
        );
        session.speculative = false;
        assert!(session.fetch("POST", "https://example.test/save").is_ok());
        assert!(session.fetch("GET", "https://example.test/").is_ok());
        assert!(
            session
                .revalidate_live("GET", "https://example.test/", Some(200))
                .unwrap()
        );
        assert!(
            !session
                .revalidate_live("GET", "https://example.test/", Some(503))
                .unwrap()
        );
        assert!(matches!(
            session.revalidate_live("GET", "https://example.test/", None),
            Err(ReplayError::UnsupportedNondeterminism(_))
        ));
    }

    #[test]
    fn recorded_schedule_is_used_for_replay_ticks() {
        let archive = ReplayArchive {
            schedule: vec![0, 16, 32],
            ..ReplayArchive::default()
        };
        let session = ReplaySession::new(&archive);
        assert_eq!(session.scheduled_tick(1), Some(16));
        assert_eq!(session.scheduled_tick(9), None);
    }

    #[test]
    fn missing_archive_maps_to_a_net_error_label() {
        let archive = ReplayArchive::default();
        let session = ReplaySession::new(&archive);
        let err = session.fetch("GET", "https://example.test/").unwrap_err();
        assert!(matches!(err, ReplayError::UnsupportedNondeterminism(_)));
        assert!(err.to_net_error().contains("replay nondeterminism"));
    }
}
