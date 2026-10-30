import Foundation

/// The five commands: JSON text in, JSON text out. Contract: docs/spec/native/macos-utilities.md §3.
struct Commands {
    static let names: Set<String> = ["generate-thumbnail", "list-open-apps", "app-icons", "copy-file", "open-with"]
    static let closed = #"{"error":"Native OS utility admission is closed"}"#
    static let unknown = #"{"error":"Unknown native macOS utility command"}"#

    let system: MacSystem

    func run(_ command: String, _ input: String) -> String {
        guard Self.names.contains(command) else { return Self.unknown }
        guard system.custody.begin() else { return Self.closed }
        defer { system.custody.end() }
        let output = dispatch(command, Self.arguments(input))
        return system.custody.isOpen ? output : Self.closed
    }

    /// Anything that is not a JSON object reads as an empty object.
    private static func arguments(_ input: String) -> [String: Any] {
        input.data(using: .utf8).flatMap { try? JSONSerialization.jsonObject(with: $0) } as? [String: Any] ?? [:]
    }

    private func dispatch(_ command: String, _ args: [String: Any]) -> String {
        switch command {
        case "generate-thumbnail":
            guard let file = args["filePath"] as? String, let icon = args["iconOutputPath"] as? String,
                  let thumbnail = args["thumbnailOutputPath"] as? String else {
                return error("generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath")
            }
            let made = system.preview(file: file, icon: icon, thumbnail: thumbnail)
            return encode(["success": made.icon, "thumbnailGenerated": made.thumbnail, "iconGenerated": made.icon])
        case "list-open-apps":
            guard let path = args["filePath"] as? String else { return error("list-open-apps requires filePath") }
            guard system.fileExists(path) else { return error("File not found") }
            return encode(["apps": openApps(for: URL(fileURLWithPath: path), iconDirectory: args["iconDirectory"] as? String)])
        case "app-icons":
            guard let ids = args["bundleIds"] as? [String], let directory = args["iconDirectory"] as? String else {
                return error("app-icons requires bundleIds and iconDirectory")
            }
            system.makeDirectory(directory)
            let folder = URL(fileURLWithPath: directory)
            var icons: [String: String] = [:]
            for id in ids {
                if let app = system.application(bundleIdentifier: id), let icon = system.iconPath(for: app, in: folder) { icons[id] = icon }
            }
            return encode(["icons": icons])
        case "copy-file":
            guard let path = args["filePath"] as? String else { return error("copy-file requires filePath") }
            guard system.fileExists(path) else { return error("File not found") }
            return system.copyToPasteboard(URL(fileURLWithPath: path)) ? encode(["success": true]) : error("Failed to copy file to clipboard")
        case "open-with":
            guard let file = args["filePath"] as? String, let app = args["appPath"] as? String else {
                return error("open-with requires filePath and appPath")
            }
            guard system.fileExists(file) else { return error("File not found") }
            guard system.fileExists(app) else { return error("Application not found") }
            if let failure = system.open(URL(fileURLWithPath: file), with: URL(fileURLWithPath: app)) { return error(failure) }
            return encode(["success": true])
        default:
            preconditionFailure("unrouted command \(command)")
        }
    }

    /// Candidate apps, de-duplicated by standardized path, the default first, then by name.
    private func openApps(for file: URL, iconDirectory: String?) -> [[String: Any]] {
        if let iconDirectory { system.makeDirectory(iconDirectory) }
        let folder = iconDirectory.map { URL(fileURLWithPath: $0) }
        let preferredApp = system.defaultApplication(for: file)?.standardizedFileURL
        let preferred = preferredApp?.path
        var seen = Set<String>(), apps: [[String: Any]] = []
        func add(_ app: URL) {
            let path = app.standardizedFileURL.path
            guard seen.insert(path).inserted else { return }
            var row: [String: Any] = ["appName": system.applicationName(app), "appPath": path]
            if path == preferred { row["default"] = true }
            if let folder, let icon = system.iconPath(for: app, in: folder) { row["iconPath"] = icon }
            apps.append(row)
        }
        system.applications(toOpen: file).forEach(add)
        if let preferredApp, !seen.contains(preferredApp.path) { add(preferredApp) }
        apps.sort {
            let a = $0["default"] != nil, b = $1["default"] != nil
            if a != b { return a }
            return ($0["appName"] as! String).localizedCaseInsensitiveCompare($1["appName"] as! String) == .orderedAscending
        }
        return apps
    }

    private func encode(_ value: [String: Any]) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: value), let text = String(data: data, encoding: .utf8) else {
            return #"{"error":"JSON serialization failed"}"#
        }
        return text
    }

    private func error(_ message: String) -> String { encode(["error": message]) }
}
