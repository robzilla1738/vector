import CoreGraphics
import Foundation
import ScreenCaptureKit
import Vision

/// On-device OCR of one window whose Accessibility tree has no readable text ("ax-blind").
/// Only the recognized text leaves the helper, as a `screen.ocr` event; the image is never kept.
/// Its state is touched only on the main queue, so the capture task may hold it.
final class ScreenTextRecorder: @unchecked Sendable {
    static let maxCaptureEdge: CGFloat = 1600
    static let cooldown: TimeInterval = 30
    static let minChars = 16, maxChars = 8000
    private var lastCapture: [String: Date] = [:]
    private var running = false

    /// Calls back on the main queue with `(text, captureMs)`, or not at all.
    func captureIfBlind(pid: pid_t, bundleId: String, title: String?, completion: @escaping (String, Double) -> Void) {
        guard !running, CGPreflightScreenCaptureAccess(),
              Date().timeIntervalSince(lastCapture[bundleId] ?? .distantPast) > Self.cooldown else { return }
        running = true
        lastCapture[bundleId] = Date()
        let started = Date()
        Task {
            defer { DispatchQueue.main.async { self.running = false } }
            guard let text = try? await Self.recognize(pid: pid, title: title),
                  text.count >= Self.minChars else { return }
            let ms = (Date().timeIntervalSince(started) * 1000).rounded()
            DispatchQueue.main.async { completion(String(text.prefix(Self.maxChars)), ms) }
        }
    }

    private static func recognize(pid: pid_t, title: String?) async throws -> String? {
        let content = try await SCShareableContent.excludingDesktopWindows(true, onScreenWindowsOnly: true)
        let windows = content.windows.filter { $0.owningApplication?.processID == pid && $0.windowLayer == 0 && $0.frame.width > 40 }
        guard let window = windows.first(where: { title != nil && $0.title == title }) ?? windows.first else { return nil }
        let configuration = SCStreamConfiguration()
        // Pixels per point, at most Retina and never past maxCaptureEdge on the long side.
        let scale = min(2, maxCaptureEdge / max(window.frame.width, window.frame.height))
        configuration.width = Int(window.frame.width * scale)
        configuration.height = Int(window.frame.height * scale)
        configuration.showsCursor = false
        let image = try await SCScreenshotManager.captureImage(contentFilter: SCContentFilter(desktopIndependentWindow: window),
                                                               configuration: configuration)
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        try VNImageRequestHandler(cgImage: image).perform([request])
        let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
        return lines.isEmpty ? nil : lines.joined(separator: "\n")
    }
}
