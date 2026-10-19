/** Local-only semantic embeddings: docs/spec/daemon/services.md Memory files and recall. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from '@aux/agent';
import { Tokenizer } from '@huggingface/tokenizers';
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { z } from 'zod';

const manifestSchema = z.object({
  id: z.literal('Xenova/all-MiniLM-L6-v2'),
  revision: z.string(),
  license: z.literal('Apache-2.0'),
  dimensions: z.literal(384),
  files: z.array(
    z.object({
      path: z.string().regex(/^(?:onnx\/)?[a-zA-Z0-9_.-]+$/),
      sha256: z.string().length(64),
    }),
  ),
});
export class LocalEmbeddings {
  readonly modelRoot: string;
  private runtime:
    | Promise<{ session: InferenceSession; tokenizer: Tokenizer }>
    | undefined;
  constructor(
    modelRoot = process.env.AUX_EMBEDDING_MODEL_DIR ??
      fileURLToPath(new URL('../models/minilm/', import.meta.url)),
  ) {
    this.modelRoot = modelRoot;
  }
  private load() {
    if (this.runtime) return this.runtime;
    this.runtime = (async () => {
      try {
        const manifest = manifestSchema.parse(
          JSON.parse(
            readFileSync(
              join(dirname(this.modelRoot), 'manifest.json'),
              'utf8',
            ),
          ),
        );
        for (const file of manifest.files) {
          const data = readFileSync(join(this.modelRoot, file.path));
          if (createHash('sha256').update(data).digest('hex') !== file.sha256)
            throw new Error(`Model hash verification failed for ${file.path}`);
        }
        const tokenizer = new Tokenizer(
          z
            .record(z.string(), z.unknown())
            .parse(
              JSON.parse(
                readFileSync(join(this.modelRoot, 'tokenizer.json'), 'utf8'),
              ),
            ),
          z
            .record(z.string(), z.unknown())
            .parse(
              JSON.parse(
                readFileSync(
                  join(this.modelRoot, 'tokenizer_config.json'),
                  'utf8',
                ),
              ),
            ),
        );
        const session = await InferenceSession.create(
          join(this.modelRoot, 'onnx/model_quantized.onnx'),
          {
            executionProviders: ['cpu'],
            intraOpNumThreads: 2,
            interOpNumThreads: 1,
          },
        );
        return { session, tokenizer };
      } catch (error) {
        this.runtime = undefined;
        return fail(
          'PRECONDITION_FAILED',
          `Local semantic model is unavailable: ${error instanceof Error ? error.message : String(error)}. Install the hash-verified bundled model before semantic search.`,
        );
      }
    })();
    return this.runtime;
  }
  async embed(text: string) {
    let runtime: { session: InferenceSession; tokenizer: Tokenizer };
    try {
      runtime = await this.load();
    } catch (error) {
      this.runtime = undefined;
      throw error;
    }
    const { session, tokenizer } = runtime;
    const encoded = tokenizer.encode(text, { return_token_type_ids: true });
    const ids = encoded.ids.slice(0, 256);
    if (ids.length === 256) ids[255] = 102;
    const length = ids.length;
    const feeds: Record<string, Tensor> = {
      input_ids: new Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [
        1,
        length,
      ]),
      attention_mask: new Tensor(
        'int64',
        BigInt64Array.from(ids.map(() => 1n)),
        [1, length],
      ),
      token_type_ids: new Tensor(
        'int64',
        BigInt64Array.from(ids.map(() => 0n)),
        [1, length],
      ),
    };
    const output = await session.run(feeds);
    const hidden = output.last_hidden_state;
    if (
      !hidden ||
      !(hidden.data instanceof Float32Array) ||
      hidden.dims[2] !== 384
    )
      fail(
        'PRECONDITION_FAILED',
        'Embedding model returned an incompatible tensor',
      );
    const vector = new Array<number>(384).fill(0);
    for (let position = 0; position < length; position++)
      for (let dimension = 0; dimension < 384; dimension++)
        vector[dimension] =
          (vector[dimension] ?? 0) +
          (hidden.data[position * 384 + dimension] ?? 0) / length;
    const norm = Math.hypot(...vector);
    if (!norm)
      fail('PRECONDITION_FAILED', 'Embedding model returned an empty vector');
    return vector.map((value) => value / norm);
  }
  async close() {
    const runtime = this.runtime;
    this.runtime = undefined;
    if (runtime) {
      const { session } = await runtime;
      await session.release();
    }
  }
}
export function cosine(left: number[], right: number[]) {
  return left.reduce(
    (sum, value, index) => sum + value * (right[index] ?? 0),
    0,
  );
}
