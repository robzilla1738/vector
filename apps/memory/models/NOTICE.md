# Local semantic model

Aux uses `Xenova/all-MiniLM-L6-v2`, an ONNX conversion of the independently published `sentence-transformers/all-MiniLM-L6-v2` sentence embedding model. The model is licensed under Apache-2.0. Its upstream model card is https://huggingface.co/Xenova/all-MiniLM-L6-v2 and the original model is https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2.

`manifest.json` pins the upstream repository revision, every downloaded file's SHA-256 digest, source URL, size, model dimensions, and runtime version. The installer downloads only those revision-bound public upstream URLs and rejects mismatched bytes. Model and tokenizer inference run locally; memory text and embedding vectors are not sent to an embedding service.

Runtime dependencies `onnxruntime-node` (MIT) and `@huggingface/tokenizers` (Apache-2.0) retain their upstream licenses in their installed packages. Production packaging must include those notices and the six verified files under `models/minilm/`, plus this manifest and notice. The package never silently downloads model weights during search.
