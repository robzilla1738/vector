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
if CommandLine.arguments.count == 4, CommandLine.arguments[1] == "receipt" {
  let bundle = URL(fileURLWithPath: CommandLine.arguments[2]).resolvingSymlinksInPath()
  guard let pid = Int32(CommandLine.arguments[3]), let app = NSRunningApplication(processIdentifier: pid),
        app.bundleIdentifier == "dev.aux.browser", app.bundleURL?.resolvingSymlinksInPath() == bundle, !app.isTerminated,
        NSRunningApplication.runningApplications(withBundleIdentifier: "dev.aux.browser").count == 1,
        let generation = app.launchDate?.timeIntervalSince1970 else { fail("Owned receipt identity unavailable") }
  let receipt = try! JSONSerialization.data(withJSONObject:["generation":generation]); FileHandle.standardOutput.write(receipt); exit(0)
}
if CommandLine.arguments.count == 5, CommandLine.arguments[1] == "script" {
  let bundle = URL(fileURLWithPath: CommandLine.arguments[2]).resolvingSymlinksInPath()
  guard let pid = Int32(CommandLine.arguments[3]), let generation = Double(CommandLine.arguments[4]),
        exactApplication(bundle,pid,generation) != nil,
        NSRunningApplication.runningApplications(withBundleIdentifier: "dev.aux.browser").count == 1 else { fail("AppleScript target is not the owned Aux generation") }
  let bytes = FileHandle.standardInput.readDataToEndOfFile()
  guard bytes.count <= 16384, let body = String(data:bytes,encoding:.utf8), !body.contains("do shell script"), !body.contains("tell application") else { fail("Invalid owned script body") }
  guard let script = NSAppleScript(source:"tell application id \"dev.aux.browser\"\n" + body + "\nend tell") else { fail("AppleScript source invalid") }
  var error: NSDictionary?
  let result = script.executeAndReturnError(&error)
  guard exactApplication(bundle,pid,generation) != nil,
        NSRunningApplication.runningApplications(withBundleIdentifier: "dev.aux.browser").count == 1 else { fail("AppleScript target generation changed") }
  if let error = error { fail(String(describing:error)) }
  print(result.stringValue ?? ""); exit(0)
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
guard CommandLine.arguments.count == 8 else { fail("Expected bundle, fixture URL, launch arguments and existing PID") }
func loopback(_ url: URL) -> Bool {
  return ["http","https"].contains(url.scheme ?? "") && ["127.0.0.1","::1"].contains(url.host ?? "") && url.user == nil && url.password == nil
}
func validAux(_ url: URL) -> Bool {
  guard url.scheme == "aux", url.host == "open", url.user == nil, url.password == nil, url.port == nil, url.fragment == nil,
        url.path.isEmpty || url.path == "/", let components = URLComponents(url:url,resolvingAgainstBaseURL:false) else { return false }
  let items = components.queryItems ?? []
  let allowed:Set<String> = ["url","profile","space","window","source","background"]
  var seen:Set<String> = []
  var values:[String:String] = [:]
  for item in items {
    guard allowed.contains(item.name), seen.insert(item.name).inserted, let value = item.value,
          value.utf8.count <= (item.name == "url" ? 8192 : 200) else { return false }
    values[item.name] = value
  }
  if let profile = values["profile"], profile.range(of:"^(default|Default|Profile [1-9][0-9]*)$",options:.regularExpression) == nil { return false }
  if let space = values["space"], space.range(of:"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$",options:.regularExpression) == nil { return false }
  guard values["source"] == "cli", let inner = values["url"], let fixture = URL(string:inner), loopback(fixture),
        values["window"] == nil || ["tab","little","new-window"].contains(values["window"]!),
        values["background"] == nil || values["background"] == "1" else { return false }
  return true
}
let bundle = URL(fileURLWithPath: CommandLine.arguments[1]).resolvingSymlinksInPath()
guard bundle.lastPathComponent == "Aux.app", let url = URL(string: CommandLine.arguments[2]),
      (CommandLine.arguments[6] == "aux" ? validAux(url) : CommandLine.arguments[6] == "http" && loopback(url)),
      ["background","foreground"].contains(CommandLine.arguments[7]),
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
configuration.activates = CommandLine.arguments[7] != "background"
NSWorkspace.shared.open([url], withApplicationAt: bundle, configuration: configuration) { app, error in
  guard let app = app, error == nil, expectedPid == 0 || app.processIdentifier == expectedPid else { fail("LaunchServices rejected disposable target") }
  guard let generation = app.launchDate?.timeIntervalSince1970, expectedPid == 0 || generation == beforeGeneration else { fail("LaunchServices Aux generation changed") }
  print("{\"pid\":\(app.processIdentifier),\"generation\":\(generation)}")
  exit(0)
}
DispatchQueue.main.asyncAfter(deadline: .now() + 12) { fail("LaunchServices timeout") }
dispatchMain()
