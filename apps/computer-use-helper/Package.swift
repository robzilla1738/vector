// swift-tools-version:6.0
// Aux Computer Use helper. Build the app bundle with build.sh; `swift build` alone makes only the executable.
import PackageDescription

let package = Package(
    name: "AuxComputerUse",
    platforms: [.macOS(.v15)],
    products: [.executable(name: "aux-computer-use", targets: ["AuxComputerUse"])],
    targets: [
        .executableTarget(
            name: "AuxComputerUse",
            path: "Sources/AuxComputerUse",
            swiftSettings: [.swiftLanguageMode(.v5)],
            linkerSettings: [
                .linkedFramework("AppKit"), .linkedFramework("ApplicationServices"), .linkedFramework("Carbon"),
                .linkedFramework("Contacts"), .linkedFramework("ScreenCaptureKit"), .linkedFramework("Vision"),
            ]),
    ])
