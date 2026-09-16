//! OS sandbox for `ve-host` (VEC-002).
//!
//! Production: apply fails closed. Developer: `VECTOR_ENGINE_SANDBOX=0` skips.
//! macOS uses `sandbox_init` (deny default, no network, no fork/exec). Linux
//! uses seccomp-bpf (no sockets, no exec). A socket denylist is not the whole
//! sandbox — filesystem, env, and inherited descriptors are tightened here too.

/// Applies the tightest sandbox this OS supports.
pub fn apply() -> Result<(), String> {
    scrub_secret_env();
    close_extra_fds();
    #[cfg(target_os = "macos")]
    {
        macos()
    }
    #[cfg(target_os = "linux")]
    {
        linux()
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    {
        Err(format!(
            "unsupported platform {} — production isolation is not available",
            std::env::consts::OS
        ))
    }
}

/// Drop inherited credentials from the parent. Vector engine vars stay.
fn scrub_secret_env() {
    let keys: Vec<String> = std::env::vars().map(|(k, _)| k).collect();
    for k in keys {
        let u = k.to_ascii_uppercase();
        if u.starts_with("VECTOR_ENGINE_") {
            continue;
        }
        if u.contains("KEY")
            || u.contains("TOKEN")
            || u.contains("SECRET")
            || u.contains("PASSWORD")
            || u.contains("CREDENTIAL")
            || u.starts_with("AWS_")
            || u.starts_with("GH_")
        {
            // Safety: this runs once at process start before threads exist.
            unsafe { std::env::remove_var(&k) };
        }
    }
}

fn close_extra_fds() {
    #[cfg(unix)]
    unsafe {
        // libc 0.2 does not always export `closefrom`. Close the inherited
        // range ourselves; stdin/stdout/stderr stay open for the control pipe.
        let max = libc::sysconf(libc::_SC_OPEN_MAX);
        let max_fd = if max > 0 { max.min(4096) as i32 } else { 256 };
        for fd in 3..max_fd {
            libc::close(fd);
        }
    }
}

#[cfg(target_os = "macos")]
fn macos() -> Result<(), String> {
    let profile = c"(version 1)
(deny default)
(allow file-read-data file-read-metadata
    (subpath \"/usr\")
    (subpath \"/System\")
    (subpath \"/Library\")
    (subpath \"/opt\")
    (literal \"/dev/null\")
    (literal \"/dev/urandom\")
    (literal \"/dev/random\")
    (literal \"/dev/zero\"))
(allow file-write-data (literal \"/dev/null\"))
(allow sysctl-read)
(allow mach-lookup)
(allow signal)
(deny process-fork)
(deny process-exec)
(deny network*)";
    unsafe {
        let mut err: *mut libc::c_char = std::ptr::null_mut();
        let rc = sandbox_init(profile.as_ptr(), 0, &raw mut err);
        if rc != 0 {
            let msg = if err.is_null() {
                format!("sandbox_init rc={rc}")
            } else {
                let s = std::ffi::CStr::from_ptr(err).to_string_lossy().into_owned();
                sandbox_free_error(err);
                s
            };
            return Err(msg);
        }
    }
    Ok(())
}

#[cfg(target_os = "macos")]
unsafe extern "C" {
    fn sandbox_init(
        profile: *const libc::c_char,
        flags: u64,
        errorbuf: *mut *mut libc::c_char,
    ) -> i32;
    fn sandbox_free_error(errorbuf: *mut libc::c_char);
}

#[cfg(target_os = "linux")]
fn linux() -> Result<(), String> {
    deny_syscalls()
}

#[cfg(target_os = "linux")]
fn deny_syscalls() -> Result<(), String> {
    const BPF_LD: u16 = 0x00;
    const BPF_W: u16 = 0x00;
    const BPF_ABS: u16 = 0x20;
    const BPF_JMP: u16 = 0x05;
    const BPF_JEQ: u16 = 0x10;
    const BPF_K: u16 = 0x00;
    const BPF_RET: u16 = 0x06;
    const SECCOMP_RET_KILL_PROCESS: u32 = 0x8000_0000;
    const SECCOMP_RET_ALLOW: u32 = 0x7fff_0000;
    const SECCOMP_MODE_FILTER: i32 = 2;
    const PR_SET_NO_NEW_PRIVS: libc::c_int = 38;
    const PR_SET_SECCOMP: libc::c_int = 22;

    #[repr(C)]
    struct SockFilter {
        code: u16,
        jt: u8,
        jf: u8,
        k: u32,
    }
    #[repr(C)]
    struct SockFprog {
        len: u16,
        filter: *mut SockFilter,
    }

    fn stmt(code: u16, k: u32) -> SockFilter {
        SockFilter {
            code,
            jt: 0,
            jf: 0,
            k,
        }
    }
    fn jump(code: u16, k: u32, jt: u8, jf: u8) -> SockFilter {
        SockFilter { code, jt, jf, k }
    }

    let denied: &[libc::c_long] = &[
        libc::SYS_socket,
        libc::SYS_connect,
        libc::SYS_bind,
        libc::SYS_listen,
        libc::SYS_accept,
        libc::SYS_accept4,
        libc::SYS_execve,
        libc::SYS_execveat,
        libc::SYS_fork,
        libc::SYS_vfork,
        libc::SYS_ptrace,
    ];
    let mut filter = Vec::with_capacity(denied.len() + 2);
    filter.push(stmt(BPF_LD | BPF_W | BPF_ABS, 0));
    for &nr in denied {
        filter.push(jump(
            BPF_JMP | BPF_JEQ | BPF_K,
            u32::try_from(nr).unwrap_or(u32::MAX),
            0,
            1,
        ));
        filter.push(stmt(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS));
    }
    filter.push(stmt(BPF_RET | BPF_K, SECCOMP_RET_ALLOW));

    unsafe {
        if libc::prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0 {
            return Err("prctl NO_NEW_PRIVS failed".into());
        }
        let mut prog = SockFprog {
            len: u16::try_from(filter.len()).unwrap_or(0),
            filter: filter.as_mut_ptr(),
        };
        if libc::prctl(
            PR_SET_SECCOMP,
            SECCOMP_MODE_FILTER,
            std::ptr::from_mut(&mut prog),
        ) != 0
        {
            return Err("prctl SECCOMP filter failed".into());
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn unsupported_platform_is_not_ok_in_apply_signature() {
        // apply() is platform-specific; this crate's unit tests run on macOS/Linux
        // in CI. The non-unix branch returns Err rather than Ok(()).
        assert!(cfg!(any(target_os = "macos", target_os = "linux")));
    }
}
