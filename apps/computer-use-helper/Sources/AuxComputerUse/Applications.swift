import Foundation

/// Installed applications for the exclusion picker: `{name, bundleId}[]`, sorted by name.
enum Applications {
    static let roots = ["/Applications", "/System/Applications", "/System/Cryptexes/App/System/Applications"]
    static let extras = ["/System/Library/CoreServices/Finder.app"]

    static func list() -> [JSON] {
        var seen: [String: String] = [:]
        for path in bundles() {
            guard let info = NSDictionary(contentsOfFile: path + "/Contents/Info.plist") as? JSON,
                  let bundleId = info["CFBundleIdentifier"] as? String, seen[bundleId] == nil else { continue }
            let fallback = ((path as NSString).lastPathComponent as NSString).deletingPathExtension
            let name = (info["CFBundleDisplayName"] as? String) ?? (info["CFBundleName"] as? String) ?? fallback
            seen[bundleId] = name.isEmpty ? fallback : name
        }
        return seen.map { ["name": $0.value, "bundleId": $0.key] }
            .sorted { ($0["name"] as! String).localizedCaseInsensitiveCompare($1["name"] as! String) == .orderedAscending }
    }

    /// Apps at the top of each root and one folder down (for example /Applications/Utilities).
    private static func bundles() -> [String] {
        let files = FileManager.default
        var found = extras.filter { files.fileExists(atPath: $0) }
        for root in roots {
            for entry in (try? files.contentsOfDirectory(atPath: root)) ?? [] {
                let path = root + "/" + entry
                if entry.hasSuffix(".app") {
                    found.append(path)
                } else if (try? files.attributesOfItem(atPath: path)[.type] as? FileAttributeType) == .typeDirectory {
                    found += ((try? files.contentsOfDirectory(atPath: path)) ?? []).filter { $0.hasSuffix(".app") }.map { path + "/" + $0 }
                }
            }
        }
        return found
    }
}
