import Foundation
import AppKit
import QuickLookThumbnailing
import ImageIO

/// Actual implementation, compiled but not invoked by this proposal's checks.
/// A host must authorize OS-effect routing and supply its proper AppKit execution context.
public final class AuxAppKitUtilityBoundary: AuxMacOSUtilityBoundary {
    public init() {}
    public func fileExists(_ path: String) -> Bool { FileManager.default.fileExists(atPath: path) }
    public func prepareIconDirectory(_ path: String) { try? FileManager.default.createDirectory(at: URL(fileURLWithPath: path), withIntermediateDirectories: true) }
    public func applications(for file: URL) -> [URL] { NSWorkspace.shared.urlsForApplications(toOpen: file) }
    public func defaultApplication(for file: URL) -> URL? { NSWorkspace.shared.urlForApplication(toOpen: file) }
    public func application(bundleIdentifier: String) -> URL? { NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier) }
    public func applicationName(_ app: URL) -> String {
        let bundle = Bundle(url: app)
        for key in ["CFBundleDisplayName", "CFBundleName"] {
            if let name = bundle?.object(forInfoDictionaryKey: key) as? String { return name }
        }
        return app.deletingPathExtension().lastPathComponent
    }
    public func iconPath(for app: URL, directory: URL) -> String? {
        let name = Bundle(url: app)?.bundleIdentifier ?? app.deletingPathExtension().lastPathComponent
        let output = directory.appendingPathComponent(name.replacingOccurrences(of: "/", with: "_") + ".png")
        if fileExists(output.path) { return output.path }
        try? Self.writePNG(NSWorkspace.shared.icon(forFile: app.path), to: output, size: CGSize(width: 32, height: 32))
        return fileExists(output.path) ? output.path : nil
    }
    public func copyFileURL(_ file: URL) -> Bool {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        return pasteboard.writeObjects([file as NSURL])
    }
    public func openFile(_ file: URL, with application: URL) -> String? {
        let result = AuxUtilityCompletion.wait(initial: Optional<String>.none, timeout: 5) { complete in
            NSWorkspace.shared.open([file], withApplicationAt: application, configuration: NSWorkspace.OpenConfiguration()) { _, error in
                complete(error?.localizedDescription)
            }
        }
        return result.completed ? result.value : "Timed out opening file with application"
    }
    public func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) {
        let input = URL(fileURLWithPath: file), iconURL = URL(fileURLWithPath: icon)
        let thumb = Self.preview(input, output: URL(fileURLWithPath: thumbnail), size: 256, iconMode: false, types: .thumbnail)
        var generated = Self.preview(input, output: iconURL, size: 128, iconMode: true, types: .thumbnail)
        if !generated { generated = Self.preview(input, output: iconURL, size: 128, iconMode: true, types: .icon) }
        if !generated {
            do { try Self.writePNG(NSWorkspace.shared.icon(forFile: input.path), to: iconURL, size: CGSize(width: 128, height: 128)); generated = true }
            catch { generated = false }
        }
        return (thumb, generated)
    }
    private static func preview(_ file: URL, output: URL, size: CGFloat, iconMode: Bool, types: QLThumbnailGenerator.Request.RepresentationTypes) -> Bool {
        let request = QLThumbnailGenerator.Request(fileAt: file, size: CGSize(width: size, height: size), scale: 2, representationTypes: types)
        request.iconMode = iconMode
        let result = AuxUtilityCompletion.wait(initial: false, timeout: 3, cancel: { QLThumbnailGenerator.shared.cancel(request) }) { complete in
          QLThumbnailGenerator.shared.generateBestRepresentation(for: request) { representation, _ in
            guard let representation else { complete(false); return }
            do {
                try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
                guard let destination = CGImageDestinationCreateWithURL(output as CFURL, "public.png" as CFString, 1, nil) else { complete(false); return }
                CGImageDestinationAddImage(destination, representation.cgImage, nil)
                complete(CGImageDestinationFinalize(destination))
            } catch { complete(false) }
          }
        }
        return result.value
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
