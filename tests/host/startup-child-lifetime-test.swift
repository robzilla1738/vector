// Fixed process-control source fixtures, never a browser/startup/paint trial.
// Dedicated builder compiles writer+lifetime+this into a single main.swift.
import Darwin
import Foundation
let cases = ["natural-exit", "cancel-ignoring-term", "cancel-before-spawn"]
guard CommandLine.arguments.count == 2, cases.contains(CommandLine.arguments[1]) else {
  fatalError("Only fixed source-unit cases accepted")
}
let scenario = CommandLine.arguments[1]
let lifetime = StartupChildLifetime()
if scenario == "cancel-before-spawn" {
  lifetime.requestCancellation() // expected exit125, no child is ever created
  fatalError("Cancellation unexpectedly returned")
}
// These fixed utilities do not create browser/Profile/UI/native qualification.
// No arbitrary command, path, PID or script selector is accepted.
let binary = scenario == "natural-exit" ? "/usr/bin/true" : "/bin/sleep"
let arguments = scenario == "natural-exit" ? [binary] : [binary, "60"]
let owned = arguments.map { strdup($0) }
var argv = owned + [nil]
var pid: pid_t = 0
guard lifetime.beginSpawn() else { fatalError("Fixture could not begin actual spawn") }
let result = posix_spawn(&pid, binary, nil, nil, &argv, environ)
lifetime.spawned(result == 0 && pid > 0 ? pid : nil)
owned.forEach { free($0) }
guard result == 0, pid > 0 else { fatalError("Fixed unit child failed") }
// Lifetime's SIGTERM-ignore disposition is deliberately inherited by sleep,
// so this case must genuinely reach bounded SIGKILL rather than fake success.
if scenario == "cancel-ignoring-term" { lifetime.requestCancellation() }
let status = try lifetime.waitForExit()
if scenario == "natural-exit" {
  guard status == 0, !lifetime.isCanceled() else { fatalError("Natural exit/reap failed") }
} else {
  guard status & 0x7f == SIGKILL, lifetime.isCanceled() else {
    fatalError("Cancellation did not reach actual SIGKILL and reap")
  }
}
print("Actual fixed unit child reaped; source-control case " + scenario + "; no native qualification")
