// swift-tools-version:6.0
// Aux memory helper (docs/spec/memory-helper.md). Build with build.sh, which links the deunicode
// tables into the executable; `swift build` alone makes a helper without them that refuses to start.
import PackageDescription

let package = Package(
    name: "AuxMemory",
    platforms: [.macOS(.v15)],
    products: [.executable(name: "aux-memory", targets: ["AuxMemory"])],
    targets: [
        .executableTarget(
            name: "AuxMemory",
            path: "Sources/AuxMemory",
            swiftSettings: [.swiftLanguageMode(.v5)],
            linkerSettings: [.linkedFramework("CoreML")]),
    ])
