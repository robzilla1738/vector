//! OS sandbox for `ve-host` (plan A21).
//!
//! macOS: `sandbox_init` denying `network*`. Linux: seccomp-bpf denying
//! `socket`/`connect`/`bind`/`listen`/`accept`. Inherited stdio stays open
//! so the parent broker can still speak JSON. Failure is non-fatal: the
//! child still has no `HyperTransport` (IPC only).

/// Applies the tightest sandbox this OS supports.
pub fn apply() -> Result<(), String> {
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
        Ok(())
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
(allow process-fork)
(allow process-exec)
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
    deny_sockets()
}

#[cfg(target_os = "linux")]
fn deny_sockets() -> Result<(), String> {
    // seccomp_data.nr is the first u32.
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
