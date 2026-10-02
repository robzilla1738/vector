// Filesystem-only source test driver. Run only after builder compiles the exact
// writer and this driver into one executable; no browser/helper/UI is launched.
import Darwin
import Foundation

func require(_ condition: @autoclosure () -> Bool, _ label: String) {
  guard condition() else { fatalError(label) }
}
func refuses(_ label: String, _ action: () throws -> Void) {
  do { try action(); fatalError("Accepted hostile fixture: " + label) } catch {}
}
func fixture() -> (String, String) {
  let name = "aux-native-journey-writer-test-" + UUID().uuidString.lowercased()
  let path = "/private/tmp/" + name
  require(mkdir(path, 0o700) == 0, "root creation")
  require(mkdir(path + "/profile", 0o700) == 0, "profile creation")
  return (name, path)
}
let (name, path) = fixture()
defer { try? FileManager.default.removeItem(atPath: path) }
let body = Data("{\"producer\":\"source-unit-fixture-only\"}".utf8)
let writer = try OwnedStartupReceiptDirectory(rootName: name)
try writer.publish(body)
let actual = try Data(contentsOf: URL(fileURLWithPath: path + "/startup-launch-receipt.json"))
require(actual == body, "actual file bytes")
refuses("existing receipt cannot be replaced") { try writer.publish(body) }
refuses("arbitrary root selector") { _ = try OwnedStartupReceiptDirectory(rootName: "../outside") }
refuses("trailing newline is not an admitted basename") { _ = try OwnedStartupReceiptDirectory(rootName: name + "\n") }

let (wrongName, wrongPath) = fixture()
defer { try? FileManager.default.removeItem(atPath: wrongPath) }
require(chmod(wrongPath, 0o755) == 0, "change root mode")
refuses("foreign mode") { _ = try OwnedStartupReceiptDirectory(rootName: wrongName) }

let (swapName, swapPath) = fixture()
defer { try? FileManager.default.removeItem(atPath: swapPath); try? FileManager.default.removeItem(atPath: swapPath + "-old") }
let swapped = try OwnedStartupReceiptDirectory(rootName: swapName)
require(rename(swapPath, swapPath + "-old") == 0, "rename admitted root")
require(mkdir(swapPath, 0o700) == 0, "replacement root")
require(mkdir(swapPath + "/profile", 0o700) == 0, "replacement profile")
refuses("root inode replacement") { try swapped.publish(body) }
require(access(swapPath + "/startup-launch-receipt.json", F_OK) != 0, "replacement untouched")

let (linkName, linkPath) = fixture()
defer { try? FileManager.default.removeItem(atPath: linkPath) }
let linked = try OwnedStartupReceiptDirectory(rootName: linkName)
require(rmdir(linkPath + "/profile") == 0, "remove profile")
require(symlink(path + "/profile", linkPath + "/profile") == 0, "profile symlink")
refuses("profile symlink") { try linked.publish(body) }
refuses("symlink profile admission") { _ = try OwnedStartupReceiptDirectory(rootName: linkName) }

let (finalName, finalPath) = fixture()
defer { try? FileManager.default.removeItem(atPath: finalPath) }
let finalWriter = try OwnedStartupReceiptDirectory(rootName: finalName)
require(symlink(path + "/startup-launch-receipt.json", finalPath + "/startup-launch-receipt.json") == 0,
        "final symlink")
refuses("final symlink never replaced or followed") { try finalWriter.publish(body) }
let outside = try Data(contentsOf: URL(fileURLWithPath: path + "/startup-launch-receipt.json"))
require(outside == body, "outside symlink target unchanged")

let (buildName, buildPath) = fixture()
defer { try? FileManager.default.removeItem(atPath: buildPath) }
let buildWriter = try OwnedStartupReceiptDirectory(rootName: buildName)
let buildBody = Data("{\"producer\":\"synthetic-build-reader-unit-only\"}".utf8)
let buildFile = buildPath + "/startup-build.json"
require(FileManager.default.createFile(atPath: buildFile, contents: buildBody,
  attributes: [.posixPermissions: 0o600]), "create private synthetic build")
let buildLease = try buildWriter.openBuildIdentity()
require(buildLease.bytes == buildBody, "exact original build bytes")
try buildLease.validate()
require(rename(buildFile, buildFile + ".old") == 0, "replace build inode")
require(FileManager.default.createFile(atPath: buildFile, contents: buildBody,
  attributes: [.posixPermissions: 0o600]), "replacement build")
refuses("build inode replacement with same bytes") { try buildLease.validate() }
require(chmod(buildFile, 0o644) == 0, "unsafe build mode")
refuses("unsafe build mode admission") { _ = try buildWriter.openBuildIdentity() }
require(unlink(buildFile) == 0, "remove replacement")
require(symlink(buildFile + ".old", buildFile) == 0, "build symlink")
refuses("build symlink admission") { _ = try buildWriter.openBuildIdentity() }
print("Startup receipt writer filesystem fixtures passed; no native qualification")
