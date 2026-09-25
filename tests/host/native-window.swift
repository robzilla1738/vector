// Native-window input and lookup for a disposable Aux.app journey.
// The caller passes the PID it launched; no other application is targeted.
import AppKit
import CoreGraphics
import Foundation

func fail(_ message: String) -> Never {
  fputs("native-window: \(message)\n", stderr)
  exit(1)
}

guard CommandLine.arguments.count >= 3,
  let pid = Int32(CommandLine.arguments[2]), pid > 0 else {
  fail("Use window|activate|toggle-sidebar|move PID [x y].")
}

let action = CommandLine.arguments[1]
guard let app = NSRunningApplication(processIdentifier: pid) else {
  fail("The launched Aux process has exited.")
}

struct WindowRecord: Encodable {
  let id: Int
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

if action == "window" {
  let windows = CGWindowListCopyWindowInfo(
    [.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  let candidates = windows.compactMap { window -> WindowRecord? in
    guard (window[kCGWindowOwnerPID as String] as? Int32) == pid,
      (window[kCGWindowLayer as String] as? Int) == 0,
      let number = window[kCGWindowNumber as String] as? Int,
      let bounds = window[kCGWindowBounds as String] as? [String: Any],
      let width = bounds["Width"] as? Double, width >= 600,
      let height = bounds["Height"] as? Double, height >= 400 else { return nil }
    return WindowRecord(id: number, x: bounds["X"] as? Double ?? 0,
                        y: bounds["Y"] as? Double ?? 0, width: width, height: height)
  }
  guard let window = candidates.max(by: { $0.width * $0.height < $1.width * $1.height }) else {
    fail("No visible Aux browser window belongs to the launched process.")
  }
  guard let data = try? JSONEncoder().encode(window),
    let text = String(data: data, encoding: .utf8) else {
    fail("Cannot encode Aux window bounds.")
  }
  print(text)
} else if action == "activate" || action == "toggle-sidebar" || action == "move" {
  guard app.activate(options: []) else {
    fail("Cannot activate the launched Aux browser window.")
  }
  usleep(80_000)
  guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
    fail("Aux is not the frontmost app; refusing to send input elsewhere.")
  }
  if action == "toggle-sidebar" {
    // The renderer's declared Toggle Sidebar binding is Command-S.
    let down = CGEvent(keyboardEventSource: nil, virtualKey: 1, keyDown: true)
    let up = CGEvent(keyboardEventSource: nil, virtualKey: 1, keyDown: false)
    down?.flags = .maskCommand
    up?.flags = .maskCommand
    guard let down, let up else { fail("Cannot create the sidebar shortcut event.") }
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
  } else if action == "move" {
    guard CommandLine.arguments.count == 5,
      let x = Double(CommandLine.arguments[3]),
      let y = Double(CommandLine.arguments[4]),
      let event = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved,
                          mouseCursorPosition: CGPoint(x: x, y: y), mouseButton: .left) else {
      fail("Use move PID x y.")
    }
    event.post(tap: .cghidEventTap)
  }
} else {
  fail("Unknown action: \(action)")
}
