import Darwin
import Foundation

/// TCC responsibility (spec 8.1). The helper re-execs itself in place with responsibility
/// disclaimed so Accessibility, Input Monitoring and Screen Recording attach to
/// dev.aux.browser.computer-use instead of the daemon or the browser.
enum Responsibility {
    static let marker = "AUX_TCC_DISCLAIMED"

    private typealias SetDisclaim = @convention(c) (UnsafeMutablePointer<posix_spawnattr_t?>, Int32) -> Int32
    private typealias ResponsibleFor = @convention(c) (pid_t) -> pid_t
    private static let defaultHandle = UnsafeMutableRawPointer(bitPattern: -2)  // RTLD_DEFAULT

    static func reexecDisclaimedIfNeeded() {
        guard ProcessInfo.processInfo.environment[marker] != "1",
              let symbol = dlsym(defaultHandle, "responsibility_spawnattrs_setdisclaim"),
              let path = executablePath() else { return }
        let setDisclaim = unsafeBitCast(symbol, to: SetDisclaim.self)
        var attr: posix_spawnattr_t?
        guard posix_spawnattr_init(&attr) == 0 else { return }
        defer { posix_spawnattr_destroy(&attr) }
        guard posix_spawnattr_setflags(&attr, Int16(POSIX_SPAWN_SETEXEC)) == 0, setDisclaim(&attr, 1) == 0 else { return }

        var environment = ProcessInfo.processInfo.environment
        environment[marker] = "1"
        let argv = CommandLine.arguments.map { strdup($0) } + [nil]
        let envp = environment.map { strdup("\($0.key)=\($0.value)") } + [nil]
        defer { (argv + envp).forEach { free($0) } }
        var pid: pid_t = 0
        // Returns only on failure; the helper then continues undisclaimed and reports responsibleSelf=false.
        _ = posix_spawn(&pid, path, nil, &attr, argv, envp)
    }

    /// `responsibility_get_pid_responsible_for_pid(getpid()) == getpid()`.
    static var isSelf: Bool {
        guard let symbol = dlsym(defaultHandle, "responsibility_get_pid_responsible_for_pid") else { return false }
        return unsafeBitCast(symbol, to: ResponsibleFor.self)(getpid()) == getpid()
    }

    static func executablePath() -> String? {
        var size: UInt32 = 0
        _ = _NSGetExecutablePath(nil, &size)
        var buffer = [CChar](repeating: 0, count: Int(size) + 1)
        guard _NSGetExecutablePath(&buffer, &size) == 0 else { return nil }
        return String(cString: buffer)
    }
}
