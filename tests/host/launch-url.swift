import AppKit
import Foundation
func fail(_ message: String) -> Never { FileHandle.standardError.write(Data((message + "\n").utf8)); exit(1) }
func exactApplication(_ bundle: URL, _ pid: Int32, _ generation: Double) -> NSRunningApplication? {
  guard let app = NSRunningApplication(processIdentifier: pid), app.bundleIdentifier == "dev.aux.browser",
        app.bundleURL?.resolvingSymlinksInPath() == bundle, !app.isTerminated else { return nil }
  guard let launch = app.launchDate else { fail("Disposable Aux launch generation is unavailable") }
  guard launch.timeIntervalSince1970 == generation else { return nil }
  return app
}
if CommandLine.arguments.count == 5, ["check", "terminate", "force-terminate"].contains(CommandLine.arguments[1]) {
  let command = CommandLine.arguments[1]
  let bundle = URL(fileURLWithPath: CommandLine.arguments[2]).resolvingSymlinksInPath()
  guard let pid = Int32(CommandLine.arguments[3]), let generation = Double(CommandLine.arguments[4]),
        generation > 0 else { fail("Invalid disposable generation check") }
  let app = exactApplication(bundle, pid, generation)
  if command == "check" { print(app == nil ? "{\"running\":false}" : "{\"running\":true}"); exit(0) }
  guard let app = app else { print("{\"running\":false}"); exit(0) }
  if command == "terminate" && !app.terminate() { fail("Disposable Aux refused termination") }
  if command == "force-terminate" && !app.forceTerminate() { fail("Disposable Aux refused forced termination") }
  exit(0)
}
guard CommandLine.arguments.count == 6 else { fail("Expected bundle, fixture URL, launch arguments and existing PID") }
let bundle = URL(fileURLWithPath: CommandLine.arguments[1]).resolvingSymlinksInPath()
guard bundle.lastPathComponent == "Aux.app", let url = URL(string: CommandLine.arguments[2]),
      ["http", "https"].contains(url.scheme ?? ""), ["127.0.0.1", "::1"].contains(url.host ?? ""), url.user == nil, url.password == nil,
      let data = CommandLine.arguments[3].data(using: .utf8), let arguments = try? JSONDecoder().decode([String].self, from: data),
      let expectedPid = Int32(CommandLine.arguments[4]), let expectedGeneration = Double(CommandLine.arguments[5]) else { fail("Invalid disposable launch") }
let existing = NSRunningApplication.runningApplications(withBundleIdentifier: "dev.aux.browser")
if expectedPid > 0 {
  guard existing.count == 1, existing[0].processIdentifier == expectedPid, existing[0].bundleURL?.resolvingSymlinksInPath() == bundle,
        arguments.isEmpty, expectedGeneration == 0 || exactApplication(bundle, expectedPid, expectedGeneration) != nil else { fail("Warm launch would target another Aux instance") }
} else {
  guard existing.isEmpty, arguments.contains(where: { $0.hasPrefix("--user-data-dir=/tmp/aux-native-journey-") }),
        arguments.contains("--use-mock-keychain"), arguments.contains("--password-store=basic") else { fail("Cold launch must use an isolated disposable profile") }
}
guard let environment = try? JSONDecoder().decode([String: String].self, from: FileHandle.standardInput.readDataToEndOfFile()) else { fail("Invalid fixture environment") }
let beforeGeneration = existing.first?.launchDate?.timeIntervalSince1970
let configuration = NSWorkspace.OpenConfiguration()
configuration.environment = environment
configuration.arguments = arguments
configuration.createsNewApplicationInstance = expectedPid == 0
configuration.activates = true
NSWorkspace.shared.open([url], withApplicationAt: bundle, configuration: configuration) { app, error in
  guard let app = app, error == nil, expectedPid == 0 || app.processIdentifier == expectedPid else { fail("LaunchServices rejected disposable target") }
  guard let generation = app.launchDate?.timeIntervalSince1970, expectedPid == 0 || generation == beforeGeneration else { fail("LaunchServices Aux generation changed") }
  print("{\"pid\":\(app.processIdentifier),\"generation\":\(generation)}")
  exit(0)
}
DispatchQueue.main.asyncAfter(deadline: .now() + 12) { fail("LaunchServices timeout") }
dispatchMain()
