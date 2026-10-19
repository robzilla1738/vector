import Foundation
import AppKit
import UniformTypeIdentifiers
import SQLite3

private struct ImportJob {
    let id: String
    let format: String
    let items: [[String: Any]]
    let errors: [[String: Any]]
    let createdAt: Date
}
private var jobs: [String: ImportJob] = [:]
private func review(_ job: ImportJob, cursor: Int = 0, limit: Int = 100) -> [String: Any] {
    ["jobId": job.id, "format": job.format, "count": job.items.count, "errors": job.errors, "nextCursor": cursor + limit < job.items.count ? cursor + limit : NSNull(), "items": job.items.dropFirst(cursor).prefix(limit).map { ["id": $0["id"] ?? "", "title": $0["title"] ?? "", "category": $0["category"] ?? "login", "username": $0["username"] ?? "", "urls": $0["urls"] ?? [], "passwordPresent": !(($0["password"] as? String) ?? "").isEmpty] }]
}
private func sourceItem(_ file: URL, _ format: String, _ index: Int, title: String, username: String = "", password: String = "", urls: [String] = [], notes: String = "", totp: String = "", category: String = "login", externalId: String = "") -> [String: Any] {
    ["id": UUID().uuidString, "title": title.isEmpty ? "Imported item \(index + 1)" : title, "category": category, "username": username, "password": password, "urls": urls.filter { !$0.isEmpty }, "notes": notes, "totp": totp, "source": ["format": format, "fileName": file.lastPathComponent, "rowIndex": index, "externalId": externalId]]
}
private func csvRows(_ text: String) throws -> [[String]] {
    let characters = Array(text)
    var rows: [[String]] = [], row: [String] = [], field = "", quoted = false, endedQuote = false, index = 0
    while index < characters.count {
        let character = characters[index]
        if quoted {
            if character == "\"" {
                if index + 1 < characters.count && characters[index + 1] == "\"" { field.append("\""); index += 1 }
                else { quoted = false; endedQuote = true }
            } else { field.append(character) }
        } else if character == "," { row.append(field); field = ""; endedQuote = false }
        else if character == "\n" || character == "\r" || character == "\r\n" {
            row.append(field); if row.contains(where: { !$0.isEmpty }) { rows.append(row) }; row = []; field = ""; endedQuote = false
            if character == "\r" && index + 1 < characters.count && characters[index + 1] == "\n" { index += 1 }
        } else if character == "\"" {
            guard field.isEmpty && !endedQuote else { throw HelperError("BAD_REQUEST", "CSV quotation is malformed") }; quoted = true
        } else {
            guard !endedQuote || character.isWhitespace else { throw HelperError("BAD_REQUEST", "Unexpected text after a quoted CSV field") }
            if !endedQuote { field.append(character) }
        }
        index += 1
    }
    guard !quoted else { throw HelperError("BAD_REQUEST", "CSV has an unterminated quoted field") }
    if !field.isEmpty || !row.isEmpty { row.append(field); rows.append(row) }
    return rows
}
private func csvItems(_ data: Data, file: URL) throws -> ([[String: Any]], [[String: Any]]) {
    guard let text = String(data: data, encoding: .utf8) else { throw HelperError("BAD_REQUEST", "CSV must use UTF-8") }
    let rows = try csvRows(text)
    guard let headers = rows.first else { throw HelperError("BAD_REQUEST", "CSV is empty") }
    let names = headers.map { $0.lowercased().filter { $0.isLetter || $0.isNumber } }
    guard let passwordIndex = names.firstIndex(where: { ["password", "loginpassword"].contains($0) }) else { throw HelperError("BAD_REQUEST", "CSV needs a supported password column") }
    func value(_ row: [String], _ keys: [String]) -> String { guard let index = names.firstIndex(where: { keys.contains($0) }), index < row.count else { return "" }; return row[index] }
    var items: [[String: Any]] = [], errors: [[String: Any]] = []
    for (index, row) in rows.dropFirst().enumerated() {
        guard index < 10000 else { throw HelperError("RESOURCE_EXHAUSTED", "Export exceeds 10,000 items") }
        guard row.count == headers.count else { errors.append(["row": index + 2, "code": "COLUMN_COUNT", "message": "CSV row does not match its header"]); continue }
        items.append(sourceItem(file, "csv", index, title: value(row, ["title", "name", "sitename"]), username: value(row, ["username", "loginusername", "email"]), password: row[passwordIndex], urls: [value(row, ["url", "website", "loginuri", "address"])], notes: value(row, ["notes", "note", "comments"]), totp: value(row, ["otpauth", "logintotp", "totp"])))
    }
    return (items, errors)
}
private func bitwardenItems(_ json: [String: Any], file: URL) throws -> ([[String: Any]], [[String: Any]]) {
    guard json["encrypted"] as? Bool != true else { throw HelperError("PRECONDITION_FAILED", "Encrypted Bitwarden exports require the source manager's decryption flow; choose an authorized unencrypted export") }
    guard let rows = json["items"] as? [[String: Any]], rows.count <= 10000 else { throw HelperError("BAD_REQUEST", "Bitwarden export items are missing or too large") }
    var items: [[String: Any]] = [], errors: [[String: Any]] = []
    for (index, row) in rows.enumerated() {
        let type = row["type"] as? Int ?? 1
        guard type == 1 || type == 2 else { errors.append(["row": index + 1, "code": "UNSUPPORTED_CATEGORY", "message": "This importer supports login and secure-note records; other categories were not imported"]); continue }
        let login = row["login"] as? [String: Any] ?? [:]
        let urls = (login["uris"] as? [[String: Any]] ?? []).compactMap { $0["uri"] as? String }
        items.append(sourceItem(file, "bitwarden-json", index, title: row["name"] as? String ?? "", username: login["username"] as? String ?? "", password: login["password"] as? String ?? "", urls: urls, notes: row["notes"] as? String ?? "", totp: login["totp"] as? String ?? "", category: type == 2 ? "note" : "login", externalId: row["id"] as? String ?? ""))
    }
    return (items, errors)
}
private func onePasswordItems(_ json: [String: Any], file: URL) throws -> ([[String: Any]], [[String: Any]]) {
    guard let accounts = json["accounts"] as? [[String: Any]] else { throw HelperError("BAD_REQUEST", "1PUX accounts are missing") }
    var items: [[String: Any]] = [], errors: [[String: Any]] = [], index = 0
    for account in accounts { for vault in account["vaults"] as? [[String: Any]] ?? [] { for row in vault["items"] as? [[String: Any]] ?? [] {
        guard index < 10000 else { throw HelperError("RESOURCE_EXHAUSTED", "Export exceeds 10,000 items") }
        defer { index += 1 }
        let overview = row["overview"] as? [String: Any] ?? [:], details = row["details"] as? [String: Any] ?? [:]
        let fields = details["loginFields"] as? [[String: Any]] ?? []
        let username = fields.first(where: { $0["designation"] as? String == "username" })?["value"] as? String ?? ""
        let password = fields.first(where: { $0["designation"] as? String == "password" })?["value"] as? String ?? details["password"] as? String ?? ""
        let notes = details["notesPlain"] as? String ?? ""
        guard !fields.isEmpty || !password.isEmpty || !notes.isEmpty else { errors.append(["row": index + 1, "code": "UNSUPPORTED_CATEGORY", "message": "This record does not contain supported login or note data; documents and attachments were not imported"]); continue }
        var urls = (overview["urls"] as? [[String: Any]] ?? []).compactMap { $0["url"] as? String }
        if let primary = overview["url"] as? String, !urls.contains(primary) { urls.insert(primary, at: 0) }
        let vaultId = (vault["attrs"] as? [String: Any])?["uuid"] as? String ?? ""
        let externalId = "\(vaultId):\(row["uuid"] as? String ?? "")"
        items.append(sourceItem(file, "1password-1pux", index, title: overview["title"] as? String ?? "", username: username, password: password, urls: urls, notes: notes, category: fields.isEmpty && password.isEmpty ? "note" : "login", externalId: externalId))
    } } }
    return (items, errors)
}
private func onePasswordData(_ file: URL) throws -> Data {
    let process = Process(), output = Pipe()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/unzip"); process.arguments = ["-p", file.path, "export.data"]
    process.standardOutput = output; process.standardError = FileHandle.nullDevice; process.standardInput = FileHandle.nullDevice
    try process.run()
    var data = Data()
    while true { let block = try output.fileHandleForReading.read(upToCount: 65536) ?? Data(); if block.isEmpty { break }; data.append(block); if data.count > 16 * 1024 * 1024 { process.terminate(); throw HelperError("RESOURCE_EXHAUSTED", "1PUX data exceeds the importer limit") } }
    process.waitUntilExit()
    guard process.terminationStatus == 0 else { throw HelperError("BAD_REQUEST", "1PUX must contain the public export.data member") }
    return data
}
private func chromiumFixture(_ file: URL) throws -> ([[String: Any]], [[String: Any]]) {
    let canonical = file.resolvingSymlinksInPath(), temporary = URL(fileURLWithPath: NSTemporaryDirectory()).resolvingSymlinksInPath().path
    guard canonical.path.hasPrefix(temporary + "/") || canonical.path.hasPrefix("/private/tmp/") else { throw HelperError("FORBIDDEN", "Only disposable fixture databases are accepted; real browser profiles need a separate owner-authorized source-key flow") }
    let marker = canonical.deletingLastPathComponent().appendingPathComponent(".aux-fixture.json")
    guard let metadata = try JSONSerialization.jsonObject(with: Data(contentsOf: marker)) as? [String: Any], metadata["format"] as? String == "chromium-login-fixture", metadata["version"] as? Int == 1 else { throw HelperError("FORBIDDEN", "Browser fixture marker is missing or invalid") }
    var database: OpaquePointer?
    guard sqlite3_open_v2(canonical.path, &database, SQLITE_OPEN_READONLY | SQLITE_OPEN_FULLMUTEX, nil) == SQLITE_OK else { throw HelperError("BAD_REQUEST", "Fixture database could not be opened read-only") }
    defer { sqlite3_close(database) }
    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(database, "SELECT rowid,origin_url,username_value,password_value,date_created FROM logins", -1, &statement, nil) == SQLITE_OK else { throw HelperError("BAD_REQUEST", "Fixture lacks the public Chromium login columns") }
    defer { sqlite3_finalize(statement) }
    func text(_ column: Int32) -> String { guard let pointer = sqlite3_column_text(statement, column) else { return "" }; return String(cString: pointer) }
    var items: [[String: Any]] = [], errors: [[String: Any]] = [], index = 0
    while sqlite3_step(statement) == SQLITE_ROW {
        guard index < 10000 else { throw HelperError("RESOURCE_EXHAUSTED", "Fixture exceeds 10,000 rows") }
        defer { index += 1 }
        let size = Int(sqlite3_column_bytes(statement, 3))
        let password = size > 0 ? Data(bytes: sqlite3_column_blob(statement, 3)!, count: size) : Data()
        if ["v10", "v11", "v20"].contains(String(data: password.prefix(3), encoding: .utf8) ?? "") { errors.append(["row": index + 1, "code": "SOURCE_KEY_REQUIRED", "message": "Encrypted source credentials were not imported; real Safe Storage authorization is required"]); continue }
        guard let decoded = String(data: password, encoding: .utf8) else { errors.append(["row": index + 1, "code": "INVALID_ENCODING", "message": "Plaintext fixture password is not UTF-8"]); continue }
        var item = sourceItem(file, "chromium-fixture", index, title: text(1), username: text(2), password: decoded, urls: [text(1)], externalId: String(sqlite3_column_int64(statement, 0)))
        item["createdAt"] = Double(sqlite3_column_int64(statement, 4)) / 1000 - 11644473600000
        items.append(item)
    }
    return (items, errors)
}
func execute(_ method: String, _ params: [String: Any]) throws -> [String: Any] {
    jobs = jobs.filter { Date().timeIntervalSince($0.value.createdAt) < 600 }
    switch method {
    case "ping": return ["service": "aux-password-importer", "version": "0.1.0", "pid": ProcessInfo.processInfo.processIdentifier]
    case "capabilities": return ["formats": ["csv", "bitwarden-json", "1password-1pux", "1password-json", "chromium-fixture"], "reviewBeforeCommit": true, "realBrowserDecryption": false, "attachments": false, "passkeys": false]
    case "import.pickFile":
        var selected: URL?
        DispatchQueue.main.sync {
            let panel = NSOpenPanel(); panel.title = "Choose an exported password file"; panel.message = "Aux imports only the export you select. The review step hides password values."; panel.canChooseDirectories = false; panel.allowsMultipleSelection = false; panel.allowedContentTypes = [.commaSeparatedText, .json, .zip, .data]
            NSApp.activate(ignoringOtherApps: true)
            if panel.runModal() == .OK { selected = panel.url }
        }
        return ["cancelled": selected == nil, "path": selected?.path ?? NSNull()]
    case "import.prepare":
        guard params["authorized"] as? Bool == true else { throw HelperError("FORBIDDEN", "Select or explicitly authorize the exported file before import") }
        let file = URL(fileURLWithPath: try requiredString(params, "path", limit: 4096)).resolvingSymlinksInPath()
        let size = try file.resourceValues(forKeys: [.fileSizeKey, .isRegularFileKey]); guard size.isRegularFile == true, (size.fileSize ?? 0) <= 32 * 1024 * 1024 else { throw HelperError("BAD_REQUEST", "Choose a regular export file at most 32 MiB") }
        let format = try requiredString(params, "format", limit: 100)
        let parsed: ([[String: Any]], [[String: Any]])
        if format == "chromium-fixture" { parsed = try chromiumFixture(file) }
        else if format == "csv" { parsed = try csvItems(Data(contentsOf: file), file: file) }
        else {
            let data = format == "1password-1pux" ? try onePasswordData(file) : try Data(contentsOf: file)
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw HelperError("BAD_REQUEST", "Export must contain a JSON object") }
            switch format { case "bitwarden-json": parsed = try bitwardenItems(json, file: file); case "1password-1pux", "1password-json": parsed = try onePasswordItems(json, file: file); default: throw HelperError("BAD_REQUEST", "Unsupported export format") }
        }
        let job = ImportJob(id: UUID().uuidString, format: format, items: parsed.0, errors: parsed.1, createdAt: Date())
        guard jobs.count < 8 else { throw HelperError("RESOURCE_EXHAUSTED", "Finish or cancel an existing import review first") }
        jobs[job.id] = job; return review(job)
    case "import.review":
        guard let job = jobs[try requiredString(params, "jobId", limit: 128)] else { throw HelperError("NOT_FOUND", "Import review expired or was closed") }; return review(job, cursor: max(0, params["cursor"] as? Int ?? 0), limit: min(max(params["limit"] as? Int ?? 100, 1), 200))
    case "import.commit":
        guard params["accepted"] as? Bool == true else { throw HelperError("FORBIDDEN", "Import review must be accepted before accessing item secrets") }
        let id = try requiredString(params, "jobId", limit: 128)
        guard let job = jobs[id] else { throw HelperError("NOT_FOUND", "Import review expired or was already consumed") }
        let cursor = max(0, params["cursor"] as? Int ?? 0), limit = min(max(params["limit"] as? Int ?? 100, 1), 200)
        guard cursor <= job.items.count else { throw HelperError("BAD_REQUEST", "Import cursor exceeds the review") }
        let items = Array(job.items.dropFirst(cursor).prefix(limit)), next = cursor + items.count
        if next >= job.items.count { jobs.removeValue(forKey: id) }
        return ["jobId": job.id, "items": items, "errors": job.errors, "count": items.count, "total": job.items.count, "nextCursor": next < job.items.count ? next : NSNull()]
    case "import.cancel": jobs.removeValue(forKey: try requiredString(params, "jobId", limit: 128)); return ["cancelled": true]
    default: throw HelperError("NOT_IMPLEMENTED", "Unknown Aux importer method")
    }
}
