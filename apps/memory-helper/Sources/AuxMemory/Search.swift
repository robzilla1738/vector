import Foundation

/// Hybrid search: the top 2 × topK of the dense cosine ranking and of the sparse BM25 ranking,
/// fused by reciprocal rank (k = 30), weighted by `alpha` (default 0.8, clamped to 0…1) and
/// scaled so a document ranked first by both scores 1. Ties keep document order.
enum Search {
    static let defaultAlpha: Float = 0.8
    static let rankConstant: Float = 30

    static func run(snapshot: Snapshot, query: String, topK: Int, alpha: Double?, embedder: Embedder, sparse: SparseIndex) throws -> [JSON] {
        guard topK > 0, !snapshot.docs.isEmpty else { return [] }
        let a = min(max(alpha.map(Float.init) ?? defaultAlpha, 0), 1)
        let pool = candidates(topK)
        var fused: [Int: Float] = [:]
        if a > 0 {
            let q = try embedder.embed(query)
            var similarity: [(doc: Int, score: Float)] = []
            similarity.reserveCapacity(snapshot.docs.count)
            for i in snapshot.docs.indices {
                var dot: Float = 0
                let v = snapshot.vector(i)
                var k = v.startIndex
                for x in q { dot = dot + x * v[k]; k += 1 }
                similarity.append((i, dot))
            }
            similarity.sort { $0.score != $1.score ? $0.score > $1.score : $0.doc < $1.doc }
            for (rank, hit) in similarity.prefix(pool).enumerated() {
                fused[hit.doc, default: 0] += a / (rankConstant + Float(rank + 1))
            }
        }
        if a < 1 {
            for (rank, hit) in sparse.search(query).prefix(pool).enumerated() {
                fused[hit.doc, default: 0] += (1 - a) / (rankConstant + Float(rank + 1))
            }
        }
        let best = 1 / (rankConstant + 1)
        return fused.map { (doc: $0.key, score: $0.value / best) }
            .sorted { $0.score != $1.score ? $0.score > $1.score : $0.doc < $1.doc }
            .prefix(topK)
            .map { hit in
                let doc = snapshot.docs[hit.doc]
                return .object(["id": .string(doc.id), "score": .double(Double(hit.score)), "source": doc.source, "text": .string(doc.text)] as [String: JSON])
            }
    }

    /// Each ranking contributes its best 2 × topK hits to the fusion.
    static func candidates(_ topK: Int) -> Int { 2 * topK }
}
