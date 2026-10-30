import CoreML
import Foundation

/// Row-wise int8 word embeddings gathered on the host, the 64- or 512-token Core ML graph for the
/// masked mean, then host L2 normalization (spec 3).
///
/// Queries and incremental syncs run both graphs on the CPU. A bulk build (first sync or rebuild)
/// uses an accelerated embedder: the 512-token graph with `.all` compute units, falling back to the
/// CPU if that can't load. This matches the reference bit for bit, including where the two differ.
final class Embedder {
    static let dimensions = 384
    static let maxTokens = 512

    let tokenizer: Tokenizer
    private let words: MappedFile, scales: MappedFile
    private let directory: URL
    private let accelerated: Bool
    private var graphs: [Int: MLModel] = [:]
    private let lock = NSLock()

    init(directory: URL, accelerated: Bool = false) throws {
        self.directory = directory
        self.accelerated = accelerated
        tokenizer = try Tokenizer(directory: directory)
        words = try MappedFile(directory.appendingPathComponent("word-embeddings.i8"))
        scales = try MappedFile(directory.appendingPathComponent("word-scales.f32"))
        guard words.count % Self.dimensions == 0, scales.count * Self.dimensions / 4 == words.count else {
            throw HelperError("Invalid local model file size: word-embeddings.i8")
        }
    }

    var rows: Int { scales.count / 4 }

    private func graph(_ length: Int) throws -> MLModel {
        if let model = graphs[length] { return model }
        let url = directory.appendingPathComponent("model-\(length).mlmodelc")
        func load(_ units: MLComputeUnits) throws -> MLModel {
            let configuration = MLModelConfiguration()
            configuration.computeUnits = units
            return try MLModel(contentsOf: url, configuration: configuration)
        }
        var model: MLModel
        if accelerated && length == 512 {
            do { model = try load(.all) } catch {
                log("Rebuild accelerator unavailable; using CPU: \(error.localizedDescription)")
                model = try load(.cpuOnly)
            }
        } else {
            model = try load(.cpuOnly)
        }
        graphs[length] = model
        return model
    }

    func embed(_ text: String) throws -> [Float] {
        try embed(ids: tokenizer.encode(text, limit: Self.maxTokens))
    }

    func embed(ids: [Int32]) throws -> [Float] {
        lock.lock(); defer { lock.unlock() }
        let length = ids.count <= 64 ? 64 : 512
        let d = Self.dimensions
        let mask = try MLMultiArray(shape: [1, NSNumber(value: length)], dataType: .float32)
        let input = try MLMultiArray(shape: [1, NSNumber(value: length), NSNumber(value: d)], dataType: .float32)
        let m = mask.dataPointer.bindMemory(to: Float.self, capacity: length)
        let x = input.dataPointer.bindMemory(to: Float.self, capacity: length * d)
        for i in 0..<length { m[i] = i < ids.count ? 1 : 0 }
        x.initialize(repeating: 0, count: length * d)
        let w = words.pointer.assumingMemoryBound(to: Int8.self)
        for (position, id) in ids.enumerated() {
            guard id >= 0, Int(id) < rows else { throw HelperError("Tokenizer returned an invalid embedding row") }
            let scale = scales.pointer.loadUnaligned(fromByteOffset: Int(id) * 4, as: Float.self)
            let row = w + Int(id) * d, out = x + position * d
            for k in 0..<d { out[k] = Float(row[k]) * scale }
        }
        let features = try MLDictionaryFeatureProvider(dictionary: ["attention_mask": mask, "word_embeddings": input])
        let output: MLFeatureProvider
        do { output = try graph(length).prediction(from: features) } catch { throw HelperError("Local model execution failed") }
        guard let result = output.featureValue(for: "sentence_embedding")?.multiArrayValue, result.count == d else {
            throw HelperError("Missing sentence_embedding")
        }
        var vector = [Float](repeating: 0, count: d)
        for k in 0..<d { vector[k] = result[k].floatValue }
        return try normalize(vector)
    }

    func normalize(_ vector: [Float]) throws -> [Float] {
        let norm = Mossvec.norm(vector[...])
        guard norm.isFinite, norm > 0, vector.allSatisfy(\.isFinite) else {
            throw HelperError("Non-finite or invalid model output (norm: \(norm))")
        }
        return vector.map { $0 / norm }
    }
}
