import Foundation

/// Native-host capability. Construction/attachment belongs to the trusted host, never JS.
/// Methods may perform OS effects; captured fixtures implement this interface without them.
public protocol AuxMacOSUtilityBoundary {
    var jobCustody: AuxOSJobCustody? { get }
    func fileExists(_ path: String) -> Bool
    func prepareIconDirectory(_ path: String)
    func applications(for file: URL) -> [URL]
    func defaultApplication(for file: URL) -> URL?
    func applicationName(_ application: URL) -> String
    func iconPath(for application: URL, directory: URL) -> String?
    func application(bundleIdentifier: String) -> URL?
    func copyFileURL(_ file: URL) -> Bool
    /// nil means the actual completion succeeded; errors/timeouts remain errors.
    func openFile(_ file: URL, with application: URL) -> String?
    func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool)
}

public extension AuxMacOSUtilityBoundary { var jobCustody: AuxOSJobCustody? { nil } }

public struct AuxMacOSUtilityCommandCore {
    public static let commands: Set<String> = ["generate-thumbnail", "list-open-apps", "app-icons", "copy-file", "open-with"]
    private let boundary: any AuxMacOSUtilityBoundary
    private let custody: AuxOSJobCustody?
    public init(boundary: any AuxMacOSUtilityBoundary) { self.boundary = boundary; custody = boundary.jobCustody }
    public func closeAdmissionAndDrain(timeout: TimeInterval) -> AuxOSDrainResult { custody?.closeAdmissionAndDrain(timeout: timeout) ?? .untracked }
    public func closeAdmission() { custody?.closeAdmission() }

    /// nil means this is another command's route. Recognized commands always return JSON text.
    public func run(command: String, input: String) -> String? {
        guard Self.commands.contains(command) else { return nil }
        var commandJob: AuxOSJobToken?
        if let custody {
            guard let job = custody.begin(.command) else { return "{\"error\":\"Native OS utility admission is closed\"}" }
            commandJob = job
        }
        defer { commandJob?.complete() }
        return runAdmitted(command: command, input: input)
    }
    private func runAdmitted(command: String, input: String) -> String {
        let object = input.data(using: .utf8).flatMap { try? JSONSerialization.jsonObject(with: $0) } as? [String: Any] ?? [:]
        func encode(_ value: [String: Any]) -> String {
            guard let bytes = try? JSONSerialization.data(withJSONObject: value),
                  let text = String(data: bytes, encoding: .utf8) else { return "{\"error\":\"JSON serialization failed\"}" }
            return text
        }
        func error(_ text: String) -> String { encode(["error": text]) }
        switch command {
        case "generate-thumbnail":
            guard let file = object["filePath"] as? String,
                  let icon = object["iconOutputPath"] as? String,
                  let thumbnail = object["thumbnailOutputPath"] as? String else {
                return error("generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath")
            }
            let result = boundary.generatePreview(file: file, icon: icon, thumbnail: thumbnail)
            // Original packed return: low byte thumbnail, high byte icon; success is icon.
            return encode(["success": result.icon, "thumbnailGenerated": result.thumbnail, "iconGenerated": result.icon])
        case "list-open-apps":
            guard let path = object["filePath"] as? String else { return error("list-open-apps requires filePath") }
            guard boundary.fileExists(path) else { return error("File not found") }
            let file = URL(fileURLWithPath: path)
            let directory = object["iconDirectory"] as? String
            if let directory { boundary.prepareIconDirectory(directory) }
            let preferred = boundary.defaultApplication(for: file)?.standardizedFileURL
            var seen = Set<String>()
            var apps: [[String: Any]] = []
            func append(_ app: URL) {
                let normalized = app.standardizedFileURL
                guard seen.insert(normalized.path).inserted else { return }
                var row: [String: Any] = ["appName": boundary.applicationName(app), "appPath": normalized.path]
                if normalized.path == preferred?.path { row["default"] = true }
                if let directory, let icon = boundary.iconPath(for: app, directory: URL(fileURLWithPath: directory)) { row["iconPath"] = icon }
                apps.append(row)
            }
            for app in boundary.applications(for: file) { append(app) }
            if let preferred, !seen.contains(preferred.path) { append(preferred) }
            apps.sort {
                let a = $0["default"] as? Bool ?? false, b = $1["default"] as? Bool ?? false
                if a != b { return a }
                return ($0["appName"] as? String ?? "").localizedCaseInsensitiveCompare($1["appName"] as? String ?? "") == .orderedAscending
            }
            return encode(["apps": apps])
        case "app-icons":
            guard let ids = object["bundleIds"] as? [String], let directory = object["iconDirectory"] as? String else {
                return error("app-icons requires bundleIds and iconDirectory")
            }
            boundary.prepareIconDirectory(directory)
            var icons: [String: String] = [:]
            for id in ids {
                if let application = boundary.application(bundleIdentifier: id),
                   let icon = boundary.iconPath(for: application, directory: URL(fileURLWithPath: directory)) { icons[id] = icon }
            }
            return encode(["icons": icons])
        case "copy-file":
            guard let path = object["filePath"] as? String else { return error("copy-file requires filePath") }
            guard boundary.fileExists(path) else { return error("File not found") }
            return boundary.copyFileURL(URL(fileURLWithPath: path)) ? encode(["success": true]) : error("Failed to copy file to clipboard")
        case "open-with":
            guard let file = object["filePath"] as? String, let app = object["appPath"] as? String else { return error("open-with requires filePath and appPath") }
            guard boundary.fileExists(file) else { return error("File not found") }
            guard boundary.fileExists(app) else { return error("Application not found") }
            if let failure = boundary.openFile(URL(fileURLWithPath: file), with: URL(fileURLWithPath: app)) { return error(failure) }
            return encode(["success": true])
        default: preconditionFailure("Command set and dispatch differ")
        }
    }
}
