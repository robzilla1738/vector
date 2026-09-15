//! The page readiness signal.

use serde::{Deserialize, Serialize};
use ve_core::Revision;

/// Whether a page has settled enough for an agent to observe or act on it.
///
/// Readiness combines the two halves of "nothing is about to change":
/// the script event loop is quiescent (no runnable tasks, microtasks or
/// in-flight async work) and the rendering pipeline is clean (computed
/// styles and layout correspond to the current DOM revision). A pending
/// navigation always makes the page not ready.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Readiness {
    /// DOM revision the signal describes.
    pub revision: Revision,
    /// No runnable tasks/microtasks and no in-flight async operations.
    pub event_loop_quiescent: bool,
    /// Runnable tasks (including due timers).
    pub pending_tasks: usize,
    /// Outstanding asynchronous operations (fetches, decodes).
    pub pending_async: usize,
    /// Computed styles are up to date with the DOM.
    pub style_clean: bool,
    /// Layout geometry is up to date with the DOM.
    pub layout_clean: bool,
    /// A navigation has been requested but not completed.
    pub navigation_pending: bool,
}

impl Readiness {
    /// `true` when the page can be observed or acted on.
    #[must_use]
    pub fn is_ready(&self) -> bool {
        self.event_loop_quiescent
            && self.style_clean
            && self.layout_clean
            && !self.navigation_pending
    }

    /// Human readable reasons the page is not ready (empty when ready).
    #[must_use]
    pub fn blockers(&self) -> Vec<&'static str> {
        let mut out = Vec::new();
        if !self.event_loop_quiescent {
            out.push("event loop busy");
        }
        if !self.style_clean {
            out.push("style dirty");
        }
        if !self.layout_clean {
            out.push("layout dirty");
        }
        if self.navigation_pending {
            out.push("navigation pending");
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn readiness_requires_every_component() {
        let ready = Readiness {
            event_loop_quiescent: true,
            style_clean: true,
            layout_clean: true,
            ..Readiness::default()
        };
        assert!(ready.is_ready());
        assert!(ready.blockers().is_empty());
        let busy = Readiness {
            pending_tasks: 2,
            layout_clean: true,
            style_clean: true,
            ..Readiness::default()
        };
        assert!(!busy.is_ready());
        assert_eq!(busy.blockers(), vec!["event loop busy"]);
        let json = serde_json::to_value(ready).unwrap();
        assert_eq!(json["eventLoopQuiescent"], true);
    }
}
