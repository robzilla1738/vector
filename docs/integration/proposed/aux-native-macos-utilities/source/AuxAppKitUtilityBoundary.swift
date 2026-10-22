import Foundation
import AppKit
import QuickLookThumbnailing
import ImageIO

/// Actual implementation. A host must authorize OS-effect routing and supply
/// its proper AppKit execution context. This immutable instance owns its jobs.
public final class AuxAppKitUtilityBoundary: AuxMacOSUtilityBoundary {
    private let custody: AuxOSJobCustody
    public var jobCustody: AuxOSJobCustody? { custody }
    public init(custody: AuxOSJobCustody = AuxOSJobCustody()) { self.custody = custody }
    private func effect<Value>(_ kind: AuxOSJobKind, fallback: Value, _ body: () -> Value) -> Value {
        guard let job = custody.begin(kind) else { return fallback }
        defer { job.complete() }
        return job.performIfAdmitted(body) ?? fallback
    }
    private func write<Value>(fallback: Value, _ body: () throws -> Value) -> Value {
        guard let job = custody.begin(.imageWrite) else { return fallback }
        defer { job.complete() }
        return (try? job.withWrite(body)) ?? fallback
    }
    public func fileExists(_ path: String) -> Bool { effect(.systemRead, fallback: false) { FileManager.default.fileExists(atPath: path) } }
    public func prepareIconDirectory(_ path: String) {
        _ = write(fallback: false) { try FileManager.default.createDirectory(at: URL(fileURLWithPath: path), withIntermediateDirectories: true); return true }
    }
    public func applications(for file: URL) -> [URL] { effect(.systemRead, fallback: []) { NSWorkspace.shared.urlsForApplications(toOpen: file) } }
    public func defaultApplication(for file: URL) -> URL? { effect(.systemRead, fallback: nil) { NSWorkspace.shared.urlForApplication(toOpen: file) } }
    public func application(bundleIdentifier: String) -> URL? { effect(.systemRead, fallback: nil) { NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier) } }
    public func applicationName(_ app: URL) -> String {
        effect(.systemRead, fallback: app.deletingPathExtension().lastPathComponent) {
            let bundle = Bundle(url: app)
            for key in ["CFBundleDisplayName", "CFBundleName"] {
                if let name = bundle?.object(forInfoDictionaryKey: key) as? String { return name }
            }
            return app.deletingPathExtension().lastPathComponent
        }
    }
    public func iconPath(for app: URL, directory: URL) -> String? {
        effect(.systemRead, fallback: nil) {
            let name = Bundle(url: app)?.bundleIdentifier ?? app.deletingPathExtension().lastPathComponent
            let output = directory.appendingPathComponent(name.replacingOccurrences(of: "/", with: "_") + ".png")
            if fileExists(output.path) { return output.path }
            _ = write(fallback: false) {
                try Self.writePNG(NSWorkspace.shared.icon(forFile: app.path), to: output, size: CGSize(width: 32, height: 32)); return true
            }
            return fileExists(output.path) ? output.path : nil
        }
    }
    public func copyFileURL(_ file: URL) -> Bool {
        effect(.clipboard, fallback: false) {
            let pasteboard = NSPasteboard.general
            pasteboard.clearContents()
            return pasteboard.writeObjects([file as NSURL])
        }
    }
    public func openFile(_ file: URL, with application: URL) -> String? {
        let result = AuxUtilityCompletion.tracked(custody: custody, kind: .openWith, initial: Optional<String>.none, timeout: 5) { _, complete in
            NSWorkspace.shared.open([file], withApplicationAt: application, configuration: NSWorkspace.OpenConfiguration()) { _, error in
                complete(error?.localizedDescription)
            }
        }
        guard let result else { return "Native OS utility admission is closed" }
        return result.completed ? result.value : "Timed out opening file with application"
    }
    public func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) {
        let input = URL(fileURLWithPath: file), iconURL = URL(fileURLWithPath: icon)
        let thumb = preview(input, output: URL(fileURLWithPath: thumbnail), size: 256, iconMode: false, types: .thumbnail)
        var generated = preview(input, output: iconURL, size: 128, iconMode: true, types: .thumbnail)
        if !generated { generated = preview(input, output: iconURL, size: 128, iconMode: true, types: .icon) }
        if !generated {
            generated = write(fallback: false) {
                try Self.writePNG(NSWorkspace.shared.icon(forFile: input.path), to: iconURL, size: CGSize(width: 128, height: 128)); return true
            }
        }
        return (thumb, generated)
    }
    private func preview(_ file: URL, output: URL, size: CGFloat, iconMode: Bool, types: QLThumbnailGenerator.Request.RepresentationTypes) -> Bool {
        let requestSlot = AuxQuickLookRequestSlot()
        let result = AuxUtilityCompletion.tracked(custody: custody, kind: .quickLook, initial: false, timeout: 3, cancel: { job in
            job.requestCancellation()
            if let request = requestSlot.get() { QLThumbnailGenerator.shared.cancel(request) }
        }) { job, complete in
            let request = QLThumbnailGenerator.Request(fileAt: file, size: CGSize(width: size, height: size), scale: 2, representationTypes: types)
            request.iconMode = iconMode
            requestSlot.set(request)
            QLThumbnailGenerator.shared.generateBestRepresentation(for: request) { representation, _ in
                guard let representation else { complete(false); return }
                do {
                    let written = try job.withWrite {
                        try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
                        guard let destination = CGImageDestinationCreateWithURL(output as CFURL, "public.png" as CFString, 1, nil) else { return false }
                        CGImageDestinationAddImage(destination, representation.cgImage, nil)
                        return CGImageDestinationFinalize(destination)
                    }
                    complete(written ?? false)
                } catch { complete(false) }
            }
        }
        return result?.value ?? false
    }
    private static func writePNG(_ image: NSImage, to output: URL, size: CGSize) throws {
        try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
        guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size.width * 2), pixelsHigh: Int(size.height * 2), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else {
            throw NSError(domain: "aux-native-artifact-preview", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to create fallback icon bitmap"])
        }
        rep.size = size
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
        NSGraphicsContext.current?.imageInterpolation = .high
        image.draw(in: CGRect(origin: .zero, size: size))
        NSGraphicsContext.restoreGraphicsState()
        guard let png = rep.representation(using: .png, properties: [:]) else {
            throw NSError(domain: "aux-native-artifact-preview", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to encode fallback icon as PNG"])
        }
        try png.write(to: output)
    }
}

/// Request construction is inside tracked start admission; cancellation retains
/// the same request, without unsynchronized shared mutable captured variables.
private final class AuxQuickLookRequestSlot: @unchecked Sendable {
    private let lock = NSLock()
    private var request: QLThumbnailGenerator.Request?
    func set(_ request: QLThumbnailGenerator.Request) { lock.lock(); defer { lock.unlock() }; self.request = request }
    func get() -> QLThumbnailGenerator.Request? { lock.lock(); defer { lock.unlock() }; return request }
}
