import AppKit
import Foundation
let application = NSApplication.shared
application.setActivationPolicy(.accessory)
DispatchQueue.global(qos: .userInitiated).async {
    HelperProtocol().run()
    DispatchQueue.main.async { NSApplication.shared.terminate(nil) }
}
application.run()
