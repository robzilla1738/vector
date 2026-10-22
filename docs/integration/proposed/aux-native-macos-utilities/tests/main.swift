import Foundation

final class CapturedOS: AuxMacOSUtilityBoundary {
    var existing: Set<String> = ["/fixture/file", "/fixture/Default.app"]
    var copied = false, copyResult = true, opened = false, openFailure: String?
    var prepared: [String] = [], resolved: [String] = []
    var thumbnail = false, icon = true
    func fileExists(_ path: String) -> Bool { existing.contains(path) }
    func prepareIconDirectory(_ path: String) { prepared.append(path) }
    func applications(for file: URL) -> [URL] { [URL(fileURLWithPath: "/fixture/z.app"), URL(fileURLWithPath: "/fixture/./a.app"), URL(fileURLWithPath: "/fixture/a.app")] }
    func defaultApplication(for file: URL) -> URL? { URL(fileURLWithPath: "/fixture/Default.app") }
    func applicationName(_ application: URL) -> String { application.deletingPathExtension().lastPathComponent }
    func iconPath(for application: URL, directory: URL) -> String? { directory.appendingPathComponent(application.lastPathComponent + ".png").path }
    func application(bundleIdentifier: String) -> URL? { resolved.append(bundleIdentifier); return bundleIdentifier == "known" ? URL(fileURLWithPath: "/fixture/Default.app") : nil }
    func copyFileURL(_ file: URL) -> Bool { copied = true; return copyResult }
    func openFile(_ file: URL, with application: URL) -> String? { opened = true; return openFailure }
    func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) { (self.thumbnail, self.icon) }
}
var checks = 0
func check(_ assertion: @autoclosure () -> Bool) { precondition(assertion()); checks += 1 }
let os = CapturedOS(), core = AuxMacOSUtilityCommandCore(boundary: os)
func run(_ command: String, _ input: String) -> [String: Any] {
    let text = core.run(command: command, input: input)!
    return try! JSONSerialization.jsonObject(with: Data(text.utf8)) as! [String: Any]
}
for malformed in ["", "null", "[]", "{", "{\"filePath\":null}"] {
    check(run("copy-file", malformed)["error"] as? String == "copy-file requires filePath")
}
for (command, expected) in [
    ("generate-thumbnail", "generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath"),
    ("list-open-apps", "list-open-apps requires filePath"),
    ("app-icons", "app-icons requires bundleIds and iconDirectory"),
    ("open-with", "open-with requires filePath and appPath")
] { check(run(command, "null")["error"] as? String == expected) }
check(core.run(command: "pdf-metadata", input: "{}") == nil)
check(run("copy-file", "{\"filePath\":\"/missing\"}")["error"] as? String == "File not found")
check(!os.copied)
check(run("copy-file", "{\"filePath\":\"/fixture/file\"}")["success"] as? Bool == true)
os.copyResult = false
check(run("copy-file", "{\"filePath\":\"/fixture/file\"}")["error"] as? String == "Failed to copy file to clipboard")
check(run("open-with", "{\"filePath\":\"/fixture/file\",\"appPath\":\"/missing\"}")["error"] as? String == "Application not found")
check(!os.opened)
os.openFailure = "Timed out opening file with application"
check(run("open-with", "{\"filePath\":\"/fixture/file\",\"appPath\":\"/fixture/Default.app\"}")["error"] as? String == os.openFailure)
os.openFailure = nil
check(run("open-with", "{\"filePath\":\"/fixture/file\",\"appPath\":\"/fixture/Default.app\"}")["success"] as? Bool == true)
let apps = run("list-open-apps", "{\"filePath\":\"/fixture/file\",\"iconDirectory\":\"/cache\"}")["apps"] as! [[String: Any]]
check(apps.count == 3)
check(apps.map { $0["appName"] as! String } == ["Default", "a", "z"])
check(apps[0]["default"] as? Bool == true && apps[1]["default"] == nil)
check(apps.allSatisfy { $0["iconPath"] is String })
let icons = run("app-icons", "{\"bundleIds\":[\"known\",\"missing\"],\"iconDirectory\":\"/cache\"}")["icons"] as! [String: String]
check(icons.count == 1 && icons["known"] != nil)
check(os.resolved == ["known", "missing"])
check(run("app-icons", "{\"bundleIds\":[1],\"iconDirectory\":\"/cache\"}")["error"] as? String == "app-icons requires bundleIds and iconDirectory")
let previewInput = "{\"filePath\":\"/fixture/file\",\"iconOutputPath\":\"/icon\",\"thumbnailOutputPath\":\"/thumb\"}"
let preview = run("generate-thumbnail", previewInput)
check(preview["success"] as? Bool == true && preview["thumbnailGenerated"] as? Bool == false)
os.icon = false; os.thumbnail = true
let inverse = run("generate-thumbnail", previewInput)
check(inverse["success"] as? Bool == false && inverse["thumbnailGenerated"] as? Bool == true)
var cancelled = false
let immediate = AuxUtilityCompletion.wait(initial: false, timeout: 0, cancel: { cancelled = true }) { complete in complete(true) }
check(immediate.completed && immediate.value && !cancelled)
var late: ((Bool) -> Void)?
let timeout = AuxUtilityCompletion.wait(initial: false, timeout: 0, cancel: { cancelled = true }) { complete in late = complete }
check(!timeout.completed && !timeout.value && cancelled)
late?(true); late = nil // actual callback-owned state remains valid after timeout
let failure = AuxUtilityCompletion.wait(initial: Optional<String>.none, timeout: 0) { complete in complete("captured OS error") }
check(failure.completed && failure.value == "captured OS error")
let nilSuccess = AuxUtilityCompletion.wait(initial: Optional<String>.none, timeout: 0) { complete in complete(nil) }
check(nilSuccess.completed && nilSuccess.value == nil)
print("\(checks) captured checks passed; no AppKit/QuickLook operation invoked")
