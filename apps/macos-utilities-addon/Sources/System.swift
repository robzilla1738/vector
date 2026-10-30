import AppKit
import ImageIO
import QuickLookThumbnailing

/// Admission and in-flight accounting for one Node Environment. Each command and each
/// asynchronous OS request is a job; a request's job ends only when macOS answers it.
final class Custody: @unchecked Sendable {
    private let lock = NSLock()
    private var open = true, jobs = 0
    var isOpen: Bool { lock.withLock { open } }
    /// Admits one job, or refuses once closed.
    func begin() -> Bool { lock.withLock { guard open else { return false }; jobs += 1; return true } }
    func end() { lock.withLock { jobs -= 1 } }
    /// Closes for good; true when no admitted job is still running.
    func closeAndDrain() -> Bool { lock.withLock { open = false; return jobs == 0 } }
}

/// The macOS calls behind the commands. Contract: docs/spec/native/macos-utilities.md §4.
final class MacSystem {
    let custody = Custody()
    private let workspace = NSWorkspace.shared

    func fileExists(_ path: String) -> Bool { FileManager.default.fileExists(atPath: path) }

    func makeDirectory(_ path: String) {
        try? FileManager.default.createDirectory(at: URL(fileURLWithPath: path), withIntermediateDirectories: true)
    }

    func applications(toOpen file: URL) -> [URL] { workspace.urlsForApplications(toOpen: file) }
    func defaultApplication(for file: URL) -> URL? { workspace.urlForApplication(toOpen: file) }
    func application(bundleIdentifier: String) -> URL? { workspace.urlForApplication(withBundleIdentifier: bundleIdentifier) }

    func applicationName(_ app: URL) -> String {
        let info = Bundle(url: app)
        for key in ["CFBundleDisplayName", "CFBundleName"] {
            if let name = info?.object(forInfoDictionaryKey: key) as? String { return name }
        }
        return app.deletingPathExtension().lastPathComponent
    }

    /// `<folder>/<bundle id or file name, "/" as "_">.png`, a 32 pt icon at 2x, reused when present.
    func iconPath(for app: URL, in folder: URL) -> String? {
        let name = Bundle(url: app)?.bundleIdentifier ?? app.deletingPathExtension().lastPathComponent
        let output = folder.appendingPathComponent(name.replacingOccurrences(of: "/", with: "_") + ".png")
        if !fileExists(output.path) { try? Self.writePNG(workspace.icon(forFile: app.path), to: output, points: 32) }
        return fileExists(output.path) ? output.path : nil
    }

    func copyToPasteboard(_ file: URL) -> Bool {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        return pasteboard.writeObjects([file as NSURL])
    }

    /// nil on success, otherwise the failure text.
    func open(_ file: URL, with app: URL) -> String? {
        guard let result = wait(custody, timeout: 5, initial: String?.none, start: { done in
            self.workspace.open([file], withApplicationAt: app, configuration: NSWorkspace.OpenConfiguration()) { _, error in
                done(error?.localizedDescription)
            }
        }) else { return "Native OS utility admission is closed" }
        return result.finished ? result.value : "Timed out opening file with application"
    }

    /// A 256 pt thumbnail, then a 128 pt icon from QuickLook, falling back to the Finder icon.
    func preview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) {
        let input = URL(fileURLWithPath: file), iconURL = URL(fileURLWithPath: icon)
        let thumbnailMade = quickLook(input, to: URL(fileURLWithPath: thumbnail), points: 256, iconMode: false, types: .thumbnail)
        let iconMade = quickLook(input, to: iconURL, points: 128, iconMode: true, types: .thumbnail)
            || quickLook(input, to: iconURL, points: 128, iconMode: true, types: .icon)
            || (try? Self.writePNG(workspace.icon(forFile: input.path), to: iconURL, points: 128)) != nil
        return (thumbnailMade, iconMade)
    }

    private func quickLook(_ file: URL, to output: URL, points: CGFloat, iconMode: Bool,
                           types: QLThumbnailGenerator.Request.RepresentationTypes) -> Bool {
        let request = QLThumbnailGenerator.Request(fileAt: file, size: CGSize(width: points, height: points), scale: 2, representationTypes: types)
        request.iconMode = iconMode
        let custody = self.custody
        return wait(custody, timeout: 3, initial: false, onTimeout: { QLThumbnailGenerator.shared.cancel(request) }, start: { done in
            QLThumbnailGenerator.shared.generateBestRepresentation(for: request) { representation, _ in
                // A late answer after the Environment closed writes nothing.
                guard let representation, custody.isOpen else { return done(false) }
                done(Self.writePNG(representation.cgImage, to: output))
            }
        })?.value ?? false
    }

    private static func writePNG(_ image: CGImage, to output: URL) -> Bool {
        guard (try? FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)) != nil,
              let destination = CGImageDestinationCreateWithURL(output as CFURL, "public.png" as CFString, 1, nil) else { return false }
        CGImageDestinationAddImage(destination, image, nil)
        return CGImageDestinationFinalize(destination)
    }

    /// Draws `image` into a points×points canvas at 2x and writes it as PNG.
    private static func writePNG(_ image: NSImage, to output: URL, points: CGFloat) throws {
        try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
        let size = CGSize(width: points, height: points)
        guard let canvas = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(points * 2), pixelsHigh: Int(points * 2),
                                            bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                                            colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else {
            throw CocoaError(.fileWriteUnknown)
        }
        canvas.size = size
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: canvas)
        NSGraphicsContext.current?.imageInterpolation = .high
        image.draw(in: CGRect(origin: .zero, size: size))
        NSGraphicsContext.restoreGraphicsState()
        guard let png = canvas.representation(using: .png, properties: [:]) else { throw CocoaError(.fileWriteUnknown) }
        try png.write(to: output)
    }
}

/// Starts an asynchronous OS request as a custody job and blocks until macOS answers or `timeout`
/// passes. nil when custody is closed and nothing was started. A late answer still ends the job.
private func wait<Value>(_ custody: Custody, timeout: TimeInterval, initial: Value, onTimeout: () -> Void = {},
                         start: (@escaping (Value) -> Void) -> Void) -> (finished: Bool, value: Value)? {
    guard custody.begin() else { return nil }
    let box = Box(initial), signal = DispatchSemaphore(value: 0)
    start { box.value = $0; custody.end(); signal.signal() }
    let finished = signal.wait(timeout: .now() + timeout) == .success
    if !finished { onTimeout() }
    return (finished, box.value)
}

private final class Box<Value>: @unchecked Sendable {
    private let lock = NSLock()
    private var stored: Value
    init(_ value: Value) { stored = value }
    var value: Value {
        get { lock.withLock { stored } }
        set { lock.withLock { stored = newValue } }
    }
}
