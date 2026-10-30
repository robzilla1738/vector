import Foundation

// C entry points for addon.c. One owner per Node Environment.

private final class Owner {
    let commands = Commands(system: MacSystem())
}

@_cdecl("aux_mu_create")
func auxCreate() -> UnsafeMutableRawPointer {
    Unmanaged.passRetained(Owner()).toOpaque()
}

/// Returns malloc'd JSON text; the caller frees it.
@_cdecl("aux_mu_run")
func auxRun(_ owner: UnsafeMutableRawPointer, _ command: UnsafePointer<CChar>, _ input: UnsafePointer<CChar>) -> UnsafeMutablePointer<CChar>? {
    let owner = Unmanaged<Owner>.fromOpaque(owner).takeUnretainedValue()
    return strdup(owner.commands.run(String(cString: command), String(cString: input)))
}

/// Closes admission for good; true when no command or OS request is still in flight.
@_cdecl("aux_mu_close")
func auxClose(_ owner: UnsafeMutableRawPointer) -> Bool {
    Unmanaged<Owner>.fromOpaque(owner).takeUnretainedValue().commands.system.custody.closeAndDrain()
}

/// Drops the owner. Only called once it has drained.
@_cdecl("aux_mu_release")
func auxRelease(_ owner: UnsafeMutableRawPointer) {
    Unmanaged<Owner>.fromOpaque(owner).release()
}
