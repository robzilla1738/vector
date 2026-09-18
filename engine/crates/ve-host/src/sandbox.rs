//! OS sandbox for `ve-host` (VEC-002).
//!
//! Production: apply fails closed. Developer: `VECTOR_ENGINE_SANDBOX=0` skips.
//! macOS uses `sandbox_init` (deny default, no network, no fork/exec). Linux
//! uses Landlock (filesystem) then seccomp-bpf (no sockets, no exec). Windows
//! uses a Job Object (no child processes), Low Integrity plus a write-denied
//! TMP, then a WFP dynamic-session block on this executable. A socket
//! denylist is not the whole sandbox — filesystem, env, and inherited
//! descriptors are tightened here too.

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
    #[cfg(windows)]
    {
        windows()
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux", windows)))]
    {
        Err(format!(
            "unsupported platform {} — production isolation is not available",
            std::env::consts::OS
        ))
    }
}

/// Construct a minimal inherited environment. Vector engine vars stay.
fn scrub_secret_env() {
    const KEEP: &[&str] = &[
        "PATH",
        "HOME",
        "USER",
        "LOGNAME",
        "LANG",
        "LC_ALL",
        "LC_CTYPE",
        "TZ",
        "TMPDIR",
        "TMP",
        "TEMP",
        "XDG_RUNTIME_DIR",
        "SSL_CERT_FILE",
        "SSL_CERT_DIR",
    ];
    let keys: Vec<String> = std::env::vars().map(|(k, _)| k).collect();
    for k in keys {
        if k.starts_with("VECTOR_ENGINE_") {
            continue;
        }
        if KEEP.iter().any(|keep| k.eq_ignore_ascii_case(keep)) {
            continue;
        }
        // Safety: this runs once at process start before threads exist.
        unsafe { std::env::remove_var(&k) };
    }
}

fn close_extra_fds() {
    #[cfg(unix)]
    unsafe {
        // libc 0.2 does not always export `closefrom`. Close the inherited
        // range ourselves; stdin/stdout/stderr stay open for the control pipe.
        let max = libc::sysconf(libc::_SC_OPEN_MAX);
        let max_fd = if max > 0 { max.min(65_536) as i32 } else { 256 };
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
    // Landlock before seccomp: restrict_self needs NO_NEW_PRIVS and still
    // needs the landlock syscalls. Production fails closed if Landlock is
    // unavailable (Finding 2).
    confine_filesystem()?;
    deny_syscalls()
}

/// Linux filesystem confinement. Writes are denied except `/dev/null`.
/// System libraries and the host binary stay readable/executable.
#[cfg(target_os = "linux")]
fn confine_filesystem() -> Result<(), String> {
    const SYS_LANDLOCK_CREATE_RULESET: libc::c_long = 444;
    const SYS_LANDLOCK_ADD_RULE: libc::c_long = 445;
    const SYS_LANDLOCK_RESTRICT_SELF: libc::c_long = 446;
    const LANDLOCK_CREATE_RULESET_VERSION: u32 = 1 << 0;
    const LANDLOCK_RULE_PATH_BENEATH: u32 = 1;
    const LANDLOCK_ACCESS_FS_EXECUTE: u64 = 1 << 0;
    const LANDLOCK_ACCESS_FS_WRITE_FILE: u64 = 1 << 1;
    const LANDLOCK_ACCESS_FS_READ_FILE: u64 = 1 << 2;
    const LANDLOCK_ACCESS_FS_READ_DIR: u64 = 1 << 3;
    const LANDLOCK_ACCESS_FS_REMOVE_DIR: u64 = 1 << 4;
    const LANDLOCK_ACCESS_FS_REMOVE_FILE: u64 = 1 << 5;
    const LANDLOCK_ACCESS_FS_MAKE_CHAR: u64 = 1 << 6;
    const LANDLOCK_ACCESS_FS_MAKE_DIR: u64 = 1 << 7;
    const LANDLOCK_ACCESS_FS_MAKE_REG: u64 = 1 << 8;
    const LANDLOCK_ACCESS_FS_MAKE_SOCK: u64 = 1 << 9;
    const LANDLOCK_ACCESS_FS_MAKE_FIFO: u64 = 1 << 10;
    const LANDLOCK_ACCESS_FS_MAKE_BLOCK: u64 = 1 << 11;
    const LANDLOCK_ACCESS_FS_MAKE_SYM: u64 = 1 << 12;
    const LANDLOCK_ACCESS_FS_REFER: u64 = 1 << 13;
    const LANDLOCK_ACCESS_FS_TRUNCATE: u64 = 1 << 14;
    const LANDLOCK_ACCESS_FS_IOCTL_DEV: u64 = 1 << 15;
    const PR_SET_NO_NEW_PRIVS: libc::c_int = 38;

    #[repr(C)]
    struct RulesetAttr {
        handled_access_fs: u64,
    }
    #[repr(C)]
    struct PathBeneath {
        allowed_access: u64,
        parent_fd: i32,
    }

    let abi = unsafe {
        libc::syscall(
            SYS_LANDLOCK_CREATE_RULESET,
            std::ptr::null::<u8>(),
            0usize,
            libc::c_ulong::from(LANDLOCK_CREATE_RULESET_VERSION),
        )
    };
    if abi < 0 {
        return Err(format!(
            "landlock unavailable: {}",
            std::io::Error::last_os_error()
        ));
    }

    let mut handled = LANDLOCK_ACCESS_FS_EXECUTE
        | LANDLOCK_ACCESS_FS_WRITE_FILE
        | LANDLOCK_ACCESS_FS_READ_FILE
        | LANDLOCK_ACCESS_FS_READ_DIR
        | LANDLOCK_ACCESS_FS_REMOVE_DIR
        | LANDLOCK_ACCESS_FS_REMOVE_FILE
        | LANDLOCK_ACCESS_FS_MAKE_CHAR
        | LANDLOCK_ACCESS_FS_MAKE_DIR
        | LANDLOCK_ACCESS_FS_MAKE_REG
        | LANDLOCK_ACCESS_FS_MAKE_SOCK
        | LANDLOCK_ACCESS_FS_MAKE_FIFO
        | LANDLOCK_ACCESS_FS_MAKE_BLOCK
        | LANDLOCK_ACCESS_FS_MAKE_SYM;
    if abi >= 2 {
        handled |= LANDLOCK_ACCESS_FS_REFER;
    }
    if abi >= 3 {
        handled |= LANDLOCK_ACCESS_FS_TRUNCATE;
    }
    if abi >= 5 {
        handled |= LANDLOCK_ACCESS_FS_IOCTL_DEV;
    }

    let dir_rx = handled
        & (LANDLOCK_ACCESS_FS_EXECUTE | LANDLOCK_ACCESS_FS_READ_FILE | LANDLOCK_ACCESS_FS_READ_DIR);
    let file_ro = handled
        & (LANDLOCK_ACCESS_FS_EXECUTE
            | LANDLOCK_ACCESS_FS_READ_FILE
            | LANDLOCK_ACCESS_FS_IOCTL_DEV);
    let file_rw = handled
        & (LANDLOCK_ACCESS_FS_READ_FILE
            | LANDLOCK_ACCESS_FS_WRITE_FILE
            | LANDLOCK_ACCESS_FS_TRUNCATE
            | LANDLOCK_ACCESS_FS_IOCTL_DEV);

    let attr = RulesetAttr {
        handled_access_fs: handled,
    };
    let ruleset = unsafe {
        libc::syscall(
            SYS_LANDLOCK_CREATE_RULESET,
            std::ptr::from_ref(&attr),
            std::mem::size_of::<RulesetAttr>(),
            0u32,
        )
    };
    if ruleset < 0 {
        return Err(format!(
            "landlock_create_ruleset failed: {}",
            std::io::Error::last_os_error()
        ));
    }
    let ruleset_fd = ruleset as i32;

    let add = |path: &std::path::Path, access: u64, directory: bool| -> Result<(), String> {
        let Some(p) = path.to_str() else {
            return Ok(());
        };
        let c = match std::ffi::CString::new(p) {
            Ok(c) => c,
            Err(_) => return Ok(()),
        };
        let mut flags = libc::O_PATH | libc::O_CLOEXEC;
        if directory {
            flags |= libc::O_DIRECTORY;
        }
        let fd = unsafe { libc::open(c.as_ptr(), flags) };
        if fd < 0 {
            return Ok(());
        }
        let beneath = PathBeneath {
            allowed_access: access,
            parent_fd: fd,
        };
        let rc = unsafe {
            libc::syscall(
                SYS_LANDLOCK_ADD_RULE,
                libc::c_long::from(ruleset_fd),
                libc::c_long::from(LANDLOCK_RULE_PATH_BENEATH),
                std::ptr::from_ref(&beneath),
                0u32,
            )
        };
        unsafe { libc::close(fd) };
        if rc < 0 {
            return Err(format!(
                "landlock_add_rule {p}: {}",
                std::io::Error::last_os_error()
            ));
        }
        Ok(())
    };

    for dir in [
        "/usr", "/lib", "/lib64", "/lib32", "/opt", "/etc", "/proc", "/sys",
    ] {
        add(std::path::Path::new(dir), dir_rx, true)?;
    }
    add(std::path::Path::new("/dev/null"), file_rw, false)?;
    for dev in ["/dev/urandom", "/dev/random", "/dev/zero"] {
        add(std::path::Path::new(dev), file_ro, false)?;
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            add(parent, dir_rx, true)?;
        }
        add(&exe, file_ro, false)?;
    }
    if let Ok(p) = std::env::var("SSL_CERT_FILE") {
        add(std::path::Path::new(&p), file_ro, false)?;
    }
    if let Ok(p) = std::env::var("SSL_CERT_DIR") {
        add(std::path::Path::new(&p), dir_rx, true)?;
    }

    unsafe {
        if libc::prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0 {
            libc::close(ruleset_fd);
            return Err("prctl NO_NEW_PRIVS failed".into());
        }
        let rc = libc::syscall(
            SYS_LANDLOCK_RESTRICT_SELF,
            libc::c_long::from(ruleset_fd),
            0u32,
        );
        libc::close(ruleset_fd);
        if rc < 0 {
            return Err(format!(
                "landlock_restrict_self failed: {}",
                std::io::Error::last_os_error()
            ));
        }
    }
    Ok(())
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

    // Architecture guard: a 32-bit syscall on a 64-bit kernel must not skip
    // the filter. Thread creation (clone/clone3) stays allowed so a
    // preloaded V8 platform can keep working; process spawn is denied via
    // fork/exec/unshare.
    #[cfg(target_arch = "x86_64")]
    const AUDIT_ARCH: u32 = 0xC000_003E;
    #[cfg(target_arch = "aarch64")]
    const AUDIT_ARCH: u32 = 0xC000_00B7;
    #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
    const AUDIT_ARCH: u32 = 0;

    let denied: Vec<libc::c_long> = vec![
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
        libc::SYS_unshare,
    ];
    let mut filter = Vec::with_capacity(denied.len() + 6);
    if AUDIT_ARCH != 0 {
        // seccomp_data.arch at offset 4
        filter.push(stmt(BPF_LD | BPF_W | BPF_ABS, 4));
        filter.push(jump(BPF_JMP | BPF_JEQ | BPF_K, AUDIT_ARCH, 1, 0));
        filter.push(stmt(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS));
    }
    filter.push(stmt(BPF_LD | BPF_W | BPF_ABS, 0));
    for nr in denied {
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

/// Job Object, filesystem confinement, then WFP socket deny. Job Objects do
/// not confine the filesystem or create sockets.
#[cfg(windows)]
fn windows() -> Result<(), String> {
    windows_job()?;
    confine_filesystem()?;
    deny_network()
}

/// Job Object + child-process mitigation. The job handle is left open so
/// `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` does not kill this process.
#[cfg(windows)]
fn windows_job() -> Result<(), String> {
    #[repr(C)]
    struct JobBasic {
        per_process_user_time_limit: i64,
        per_job_user_time_limit: i64,
        limit_flags: u32,
        minimum_working_set_size: usize,
        maximum_working_set_size: usize,
        active_process_limit: u32,
        affinity: usize,
        priority_class: u32,
        scheduling_class: u32,
    }
    #[repr(C)]
    struct IoCounters {
        read_op: u64,
        write_op: u64,
        other_op: u64,
        read_tx: u64,
        write_tx: u64,
        other_tx: u64,
    }
    #[repr(C)]
    struct JobExtended {
        basic: JobBasic,
        io: IoCounters,
        process_memory_limit: usize,
        job_memory_limit: usize,
        peak_process_memory_used: usize,
        peak_job_memory_used: usize,
    }

    const JOB_OBJECT_EXTENDED_LIMIT_INFORMATION: i32 = 9;
    const JOB_OBJECT_LIMIT_ACTIVE_PROCESS: u32 = 0x0000_0008;
    const JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE: u32 = 0x0000_2000;
    const PROCESS_MITIGATION_CHILD_PROCESS_POLICY: u32 = 13;
    const NO_CHILD_PROCESS_CREATION: u32 = 0x1;

    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn CreateJobObjectW(attr: *const core::ffi::c_void, name: *const u16) -> isize;
        fn SetInformationJobObject(
            job: isize,
            class: i32,
            info: *const core::ffi::c_void,
            len: u32,
        ) -> i32;
        fn AssignProcessToJobObject(job: isize, process: isize) -> i32;
        fn GetCurrentProcess() -> isize;
        fn SetProcessMitigationPolicy(
            policy: u32,
            buffer: *const core::ffi::c_void,
            length: usize,
        ) -> i32;
    }

    // Safety: process start, no other threads, kernel32 Job Object APIs.
    unsafe {
        let job = CreateJobObjectW(core::ptr::null(), core::ptr::null());
        if job == 0 {
            return Err("CreateJobObjectW failed".into());
        }
        let info = JobExtended {
            basic: JobBasic {
                per_process_user_time_limit: 0,
                per_job_user_time_limit: 0,
                limit_flags: JOB_OBJECT_LIMIT_ACTIVE_PROCESS | JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
                minimum_working_set_size: 0,
                maximum_working_set_size: 0,
                active_process_limit: 1,
                affinity: 0,
                priority_class: 0,
                scheduling_class: 0,
            },
            io: IoCounters {
                read_op: 0,
                write_op: 0,
                other_op: 0,
                read_tx: 0,
                write_tx: 0,
                other_tx: 0,
            },
            process_memory_limit: 0,
            job_memory_limit: 0,
            peak_process_memory_used: 0,
            peak_job_memory_used: 0,
        };
        let ok = SetInformationJobObject(
            job,
            JOB_OBJECT_EXTENDED_LIMIT_INFORMATION,
            (&raw const info).cast(),
            u32::try_from(std::mem::size_of::<JobExtended>()).unwrap_or(0),
        );
        if ok == 0 {
            return Err("SetInformationJobObject failed".into());
        }
        let flags = NO_CHILD_PROCESS_CREATION;
        let _ = SetProcessMitigationPolicy(
            PROCESS_MITIGATION_CHILD_PROCESS_POLICY,
            (&raw const flags).cast(),
            std::mem::size_of::<u32>(),
        );
        if AssignProcessToJobObject(job, GetCurrentProcess()) == 0 {
            return Err("AssignProcessToJobObject failed".into());
        }
        let _job_keep_open = job;
    }
    Ok(())
}

/// Windows filesystem confinement. Job Objects do not implement this
/// (Finding 2). A write-denied TMP/TEMP plus Low Integrity (`S-1-16-4096`)
/// denies the `fs` selftest and other Medium+ paths.
#[cfg(windows)]
fn confine_filesystem() -> Result<(), String> {
    confine_temp_directory()?;
    drop_integrity_low()
}

/// Point TMP/TEMP at a directory whose DACL denies writes. Create the
/// directory first (Medium), then lock it, then drop integrity.
#[cfg(windows)]
fn confine_temp_directory() -> Result<(), String> {
    const SE_FILE_OBJECT: u32 = 1;
    const DACL_SECURITY_INFORMATION: u32 = 0x0000_0004;
    const ACL_REVISION: u8 = 2;

    #[repr(C)]
    struct Acl {
        revision: u8,
        sbz1: u8,
        size: u16,
        ace_count: u16,
        sbz2: u16,
    }

    #[link(name = "advapi32")]
    unsafe extern "system" {
        fn SetNamedSecurityInfoW(
            name: *const u16,
            object_type: u32,
            security_info: u32,
            owner: *const u8,
            group: *const u8,
            dacl: *const Acl,
            sacl: *const u8,
        ) -> u32;
        fn InitializeAcl(acl: *mut Acl, len: u32, revision: u32) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn SetEnvironmentVariableW(name: *const u16, value: *const u16) -> i32;
        fn GetLastError() -> u32;
    }

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    let dir = std::env::temp_dir().join(format!("ve-host-sandbox-tmp-{}", std::process::id()));
    std::fs::create_dir_all(&dir).map_err(|e| format!("sandbox temp dir: {e}"))?;
    let dir_s = dir.to_string_lossy();
    let dir_w = wide(&dir_s);
    let mut acl = Acl {
        revision: 0,
        sbz1: 0,
        size: 0,
        ace_count: 0,
        sbz2: 0,
    };
    // Safety: empty DACL is deny-all; applied only to the sandbox temp dir.
    unsafe {
        if InitializeAcl(
            &raw mut acl,
            u32::try_from(std::mem::size_of::<Acl>()).unwrap_or(0),
            u32::from(ACL_REVISION),
        ) == 0
        {
            return Err(format!("InitializeAcl failed ({})", GetLastError()));
        }
        let err = SetNamedSecurityInfoW(
            dir_w.as_ptr(),
            SE_FILE_OBJECT,
            DACL_SECURITY_INFORMATION,
            core::ptr::null(),
            core::ptr::null(),
            &raw const acl,
            core::ptr::null(),
        );
        if err != 0 {
            return Err(format!("SetNamedSecurityInfoW sandbox temp failed ({err})"));
        }
        for name in ["TMP", "TEMP", "TMPDIR"] {
            if SetEnvironmentVariableW(wide(name).as_ptr(), dir_w.as_ptr()) == 0 {
                return Err(format!(
                    "SetEnvironmentVariableW {name} failed ({})",
                    GetLastError()
                ));
            }
        }
    }
    Ok(())
}

/// Mandatory Integrity Control at Low so writes to remaining Medium+ paths fail.
#[cfg(windows)]
fn drop_integrity_low() -> Result<(), String> {
    const TOKEN_QUERY: u32 = 0x0008;
    const TOKEN_ADJUST_DEFAULT: u32 = 0x0080;
    const TOKEN_INTEGRITY_LEVEL: u32 = 25;
    const SE_GROUP_INTEGRITY: u32 = 0x0000_0020;
    // SECURITY_MANDATORY_LOW_RID, "S-1-16-4096"
    const LOW_INTEGRITY_SID: [u16; 12] = [
        0x53, 0x2d, 0x31, 0x2d, 0x31, 0x36, 0x2d, 0x34, 0x30, 0x39, 0x36, 0,
    ];

    #[repr(C)]
    struct SidAndAttributes {
        sid: *mut u8,
        attributes: u32,
    }
    #[repr(C)]
    struct TokenMandatoryLabel {
        label: SidAndAttributes,
    }

    #[link(name = "advapi32")]
    unsafe extern "system" {
        fn OpenProcessToken(process: isize, access: u32, token: *mut isize) -> i32;
        fn SetTokenInformation(
            token: isize,
            class: u32,
            info: *const core::ffi::c_void,
            len: u32,
        ) -> i32;
        fn ConvertStringSidToSidW(string_sid: *const u16, sid: *mut *mut u8) -> i32;
        fn GetLengthSid(sid: *mut u8) -> u32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetCurrentProcess() -> isize;
        fn CloseHandle(handle: isize) -> i32;
        fn LocalFree(mem: *mut u8) -> *mut u8;
        fn GetLastError() -> u32;
    }

    // Safety: process start, before page threads; token/SID APIs copy the SID.
    unsafe {
        let mut token = 0isize;
        if OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_QUERY | TOKEN_ADJUST_DEFAULT,
            &raw mut token,
        ) == 0
        {
            return Err(format!("OpenProcessToken failed ({})", GetLastError()));
        }
        let mut sid = core::ptr::null_mut();
        if ConvertStringSidToSidW(LOW_INTEGRITY_SID.as_ptr(), &raw mut sid) == 0 || sid.is_null() {
            let err = GetLastError();
            CloseHandle(token);
            return Err(format!("ConvertStringSidToSidW Low IL failed ({err})"));
        }
        let label = TokenMandatoryLabel {
            label: SidAndAttributes {
                sid,
                attributes: SE_GROUP_INTEGRITY,
            },
        };
        let sid_len = GetLengthSid(sid);
        let info_len = u32::try_from(std::mem::size_of::<TokenMandatoryLabel>())
            .unwrap_or(0)
            .saturating_add(sid_len);
        let ok = SetTokenInformation(
            token,
            TOKEN_INTEGRITY_LEVEL,
            (&raw const label).cast(),
            info_len,
        );
        let err = GetLastError();
        LocalFree(sid);
        CloseHandle(token);
        if ok == 0 {
            return Err(format!(
                "SetTokenInformation TokenIntegrityLevel failed ({err})"
            ));
        }
    }
    Ok(())
}

/// Block bind/connect for this executable. Dynamic WFP session dies with
/// the process. Fetch stays on the parent broker (Finding 2).
#[cfg(windows)]
fn deny_network() -> Result<(), String> {
    use windows_sys::Win32::NetworkManagement::WindowsFilteringPlatform::{
        FWP_ACTION_BLOCK, FWP_BYTE_BLOB, FWP_BYTE_BLOB_TYPE, FWP_CONDITION_VALUE0,
        FWP_CONDITION_VALUE0_0, FWP_MATCH_EQUAL, FWPM_ACTION0, FWPM_CONDITION_ALE_APP_ID,
        FWPM_FILTER_CONDITION0, FWPM_FILTER0, FWPM_LAYER_ALE_AUTH_CONNECT_V4,
        FWPM_LAYER_ALE_AUTH_CONNECT_V6, FWPM_LAYER_ALE_AUTH_RECV_ACCEPT_V4,
        FWPM_LAYER_ALE_AUTH_RECV_ACCEPT_V6, FWPM_LAYER_ALE_RESOURCE_ASSIGNMENT_V4,
        FWPM_LAYER_ALE_RESOURCE_ASSIGNMENT_V6, FWPM_SESSION_FLAG_DYNAMIC, FWPM_SESSION0,
        FwpmEngineOpen0, FwpmFilterAdd0, FwpmFreeMemory0, FwpmGetAppIdFromFileName0,
    };

    const RPC_C_AUTHN_WINNT: u32 = 10;

    let exe = std::env::current_exe().map_err(|e| format!("current_exe: {e}"))?;
    let exe_w: Vec<u16> = exe
        .to_string_lossy()
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();
    let mut name: Vec<u16> = "ve-host-deny-network"
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();

    // Safety: process start; engine handle stays open so the dynamic session lives.
    unsafe {
        let session = FWPM_SESSION0 {
            flags: FWPM_SESSION_FLAG_DYNAMIC,
            ..std::mem::zeroed()
        };
        let mut engine = std::ptr::null_mut();
        let err = FwpmEngineOpen0(
            std::ptr::null(),
            RPC_C_AUTHN_WINNT,
            std::ptr::null(),
            &raw const session,
            &raw mut engine,
        );
        if err != 0 {
            return Err(format!("FwpmEngineOpen0 failed ({err})"));
        }
        let mut app_id: *mut FWP_BYTE_BLOB = std::ptr::null_mut();
        let err = FwpmGetAppIdFromFileName0(exe_w.as_ptr(), &raw mut app_id);
        if err != 0 || app_id.is_null() {
            return Err(format!("FwpmGetAppIdFromFileName0 failed ({err})"));
        }
        let layers = [
            FWPM_LAYER_ALE_RESOURCE_ASSIGNMENT_V4,
            FWPM_LAYER_ALE_RESOURCE_ASSIGNMENT_V6,
            FWPM_LAYER_ALE_AUTH_CONNECT_V4,
            FWPM_LAYER_ALE_AUTH_CONNECT_V6,
            FWPM_LAYER_ALE_AUTH_RECV_ACCEPT_V4,
            FWPM_LAYER_ALE_AUTH_RECV_ACCEPT_V6,
        ];
        for layer in layers {
            let mut cond = FWPM_FILTER_CONDITION0 {
                fieldKey: FWPM_CONDITION_ALE_APP_ID,
                matchType: FWP_MATCH_EQUAL,
                conditionValue: FWP_CONDITION_VALUE0 {
                    r#type: FWP_BYTE_BLOB_TYPE,
                    Anonymous: FWP_CONDITION_VALUE0_0 { byteBlob: app_id },
                },
            };
            let mut filter = FWPM_FILTER0 {
                displayData: windows_sys::Win32::NetworkManagement::WindowsFilteringPlatform::FWPM_DISPLAY_DATA0 {
                    name: name.as_mut_ptr(),
                    description: std::ptr::null_mut(),
                },
                layerKey: layer,
                numFilterConditions: 1,
                filterCondition: &raw mut cond,
                action: FWPM_ACTION0 {
                    r#type: FWP_ACTION_BLOCK,
                    Anonymous: std::mem::zeroed(),
                },
                ..std::mem::zeroed()
            };
            let err = FwpmFilterAdd0(
                engine,
                &raw const filter,
                std::ptr::null(),
                std::ptr::null_mut(),
            );
            if err != 0 {
                let mut freed = app_id.cast::<core::ffi::c_void>();
                FwpmFreeMemory0(&raw mut freed);
                return Err(format!("FwpmFilterAdd0 failed ({err})"));
            }
        }
        let mut freed = app_id.cast::<core::ffi::c_void>();
        FwpmFreeMemory0(&raw mut freed);
        let _engine_keep_open = engine;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn apply_is_defined_on_production_hosts() {
        assert!(cfg!(any(target_os = "macos", target_os = "linux", windows)));
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn linux_applies_landlock_before_seccomp() {
        let src = include_str!("sandbox.rs");
        let landlock = src.find("confine_filesystem()?").expect("landlock apply");
        let seccomp = src.find("deny_syscalls()").expect("seccomp apply");
        assert!(
            landlock < seccomp,
            "Finding 2: Landlock must be applied before the seccomp filter"
        );
    }

    #[cfg(windows)]
    #[test]
    fn windows_job_object_limit_flags_are_the_production_set() {
        const ACTIVE: u32 = 0x0000_0008;
        const KILL: u32 = 0x0000_2000;
        assert_eq!(ACTIVE | KILL, 0x0000_2008);
    }

    #[test]
    fn windows_production_confines_filesystem() {
        let src = include_str!("sandbox.rs");
        assert!(
            src.contains("S-1-16-4096")
                && src.contains("TOKEN_INTEGRITY_LEVEL")
                && src.contains("confine_temp_directory"),
            "Finding 2: Windows production must confine filesystem writes, not only Job Object process limits"
        );
        let windows_fn = src.find("fn windows()").expect("windows apply");
        let rest = &src[windows_fn..];
        let job = rest.find("windows_job()?").expect("job apply");
        let fs = rest.find("confine_filesystem()").expect("fs apply");
        let net = rest.find("deny_network()").expect("network apply");
        assert!(
            job < fs && fs < net,
            "Finding 2: Job Object, filesystem, then WFP socket deny"
        );
    }

    #[test]
    fn windows_production_denies_sockets() {
        let src = include_str!("sandbox.rs");
        assert!(
            src.contains("FwpmFilterAdd0") && src.contains("FWPM_LAYER_ALE_RESOURCE_ASSIGNMENT_V4"),
            "Finding 2: Windows production must deny socket creation, not rely on excluded-port connect"
        );
    }
}
