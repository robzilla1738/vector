import AppKit

// Entry dispatch (spec 3.4): disclaim TCC responsibility first, then observer mode when there is
// no command (argv[1] missing or a flag), otherwise one one-shot command.
Responsibility.reexecDisclaimedIfNeeded()
// A closed stdout means the daemon is gone; Output exits on EPIPE instead of dying on the signal.
signal(SIGPIPE, SIG_IGN)

let arguments = CommandLine.arguments
if arguments.count < 2 || arguments[1].hasPrefix("-") {
    let app = NSApplication.shared
    let delegate = ObserverAppDelegate()
    app.delegate = delegate
    app.setActivationPolicy(.accessory)
    app.run()
} else {
    exit(OneShot.run(Array(arguments.dropFirst())))
}
