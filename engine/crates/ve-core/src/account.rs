//! Process accounting: RSS and host energy samples (VEC-023).
//!
//! These numbers are read from the OS. They are not estimates. Missing
//! sources return `None` rather than a fabricated zero.

/// Current process resident set size in bytes, when the OS exposes it.
#[must_use]
pub fn process_rss_bytes() -> Option<u64> {
    #[cfg(target_os = "linux")]
    {
        let status = std::fs::read_to_string("/proc/self/status").ok()?;
        for line in status.lines() {
            let Some(rest) = line.strip_prefix("VmRSS:") else {
                continue;
            };
            let kb: u64 = rest
                .split_whitespace()
                .next()
                .and_then(|t| t.parse().ok())?;
            return Some(kb.saturating_mul(1024));
        }
        None
    }
    #[cfg(target_os = "macos")]
    {
        let out = std::process::Command::new("ps")
            .args(["-o", "rss=", "-p", &std::process::id().to_string()])
            .output()
            .ok()?;
        if !out.status.success() {
            return None;
        }
        let kb: u64 = String::from_utf8_lossy(&out.stdout).trim().parse().ok()?;
        Some(kb.saturating_mul(1024))
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos")))]
    {
        None
    }
}

/// Package-level RAPL energy in microjoules (Linux intel-rapl), if present.
///
/// This is the host package counter, not a per-process attribution. Callers
/// must label it as such.
#[must_use]
pub fn host_package_energy_uj() -> Option<u64> {
    #[cfg(target_os = "linux")]
    {
        std::fs::read_to_string("/sys/class/powercap/intel-rapl:0/energy_uj")
            .ok()?
            .trim()
            .parse()
            .ok()
    }
    #[cfg(not(target_os = "linux"))]
    {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rss_is_reported_on_unix_hosts() {
        let rss = process_rss_bytes();
        #[cfg(any(target_os = "linux", target_os = "macos"))]
        {
            let bytes = rss.expect("RSS is readable on this OS");
            assert!(
                bytes > 1024,
                "RSS should be more than 1 KiB for a live test process, got {bytes}"
            );
        }
        #[cfg(not(any(target_os = "linux", target_os = "macos")))]
        {
            let _ = rss;
        }
    }
}
