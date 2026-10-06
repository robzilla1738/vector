import type { PageDerivativeCache } from "./ai-result-cache.js";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import type { SettingsService } from "./settings.js";

/**
 * Explicit page/selection translation through the configured model provider.
 * Only text the user asked to translate is sent — the renderer/main process
 * collects visible text nodes; this service batches them through the model and
 * keeps alignment strict (a translation array that loses alignment is rejected
 * and bisected rather than misapplied to the wrong node).
 */

const TranslationSchema = z.object({
  lang: z.string().min(2).max(40),
  translations: z.array(z.string()),
});

const BATCH_SEGMENTS = 60;
const BATCH_CHARS = 12000;
const MAX_SEGMENTS = 400;

export class TranslateService {
  constructor(private readonly settings: SettingsService) {}

  private client() {
    const model = this.settings.model();
    const modelId = this.settings.plannerModel();
    if (!model || !modelId)
      throw new AuxError("backend_unavailable", "Translation needs a configured model provider in Settings.");
    return { model, modelId };
  }

  private async batch(
    texts: string[],
    target: string,
    context: string | undefined,
    depth = 0,
    cache?: PageDerivativeCache,
  ): Promise<{ lang: string; translations: string[] }> {
    const { model, modelId } = this.client();
    const requestModel = {
      modelId,
      system:
        "You are a translation engine inside a web browser. Translate every segment faithfully and neutrally. Do not add commentary, do not censor, do not translate URLs, code or proper nouns that should stay literal. Return one translation per input segment in the same order.",
      prompt: `Translate these ${texts.length} web page segments into ${target}.${context ? ` The page is titled: ${context}.` : ""} Detect the source language.\n\nSegments (JSON array):\n${JSON.stringify(texts)}`,
      schema: TranslationSchema,
      maxOutputTokens: Math.min(8192, texts.length * 400 + 256),
    };
    let servedRequestedModel = true;
    const compute = async () => {
      const result = await model.generateStructured(requestModel);
      servedRequestedModel = !result.resolvedModelId || result.resolvedModelId === modelId;
      return result.object;
    };
    const parsed = cache ? await cache.object({
      signature: JSON.stringify({ kind: "translation-batch-v1", ...requestModel, schema: "Translation-v1" }),
      text: texts.join("\n") + (context ?? ""), capturedTexts: texts,
      parse: (value) => TranslationSchema.parse(value), cacheable: (value) => servedRequestedModel && value.translations.length === texts.length, compute,
    }) : await compute();
    if (parsed.translations.length === texts.length) return parsed;
    // Misaligned batch → bisect until segments line up (bounded recursion).
    if (texts.length === 1 || depth >= 4) {
      return {
        lang: parsed.lang,
        translations: texts.map((text, index) => parsed.translations[index] ?? text),
      };
    }
    const half = Math.ceil(texts.length / 2);
    const [a, b] = await Promise.all([
      this.batch(texts.slice(0, half), target, context, depth + 1, cache),
      this.batch(texts.slice(half), target, context, depth + 1, cache),
    ]);
    return { lang: a.lang || b.lang, translations: [...a.translations, ...b.translations] };
  }

  async page(texts: string[], target?: string, context?: string, cache?: PageDerivativeCache) {
    const goal = target?.trim() || "English";
    const truncated = texts.length > MAX_SEGMENTS;
    const slice = texts.slice(0, MAX_SEGMENTS);
    const chunks: string[][] = [];
    let current: string[] = [],
      chars = 0;
    for (const text of slice) {
      if (current.length && (current.length >= BATCH_SEGMENTS || chars + text.length > BATCH_CHARS)) {
        chunks.push(current);
        current = [];
        chars = 0;
      }
      current.push(text);
      chars += text.length;
    }
    if (current.length) chunks.push(current);
    let lang = "";
    const translations: string[] = [];
    for (const chunk of chunks) {
      const part = await this.batch(chunk, goal, context, 0, cache);
      lang ||= part.lang;
      translations.push(...part.translations);
    }
    return { lang, translations, truncated };
  }

  async text(text: string, target?: string, context?: string, cache?: PageDerivativeCache) {
    const goal = target?.trim() || "English";
    const { model, modelId } = this.client();
    const requestModel = {
      modelId,
      system:
        "You are a translation engine inside a web browser. Translate the selected text faithfully and neutrally. Return the detected source language and the translation.",
      prompt: `Translate this text into ${goal}.${context ? ` Selection context: ${context}.` : ""}\n\nText:\n${text}`,
      schema: z.object({ lang: z.string().min(2).max(40), translation: z.string() }),
      maxOutputTokens: 4096,
    };
    let servedRequestedModel = true;
    const compute = async () => {
      const result = await model.generateStructured(requestModel);
      servedRequestedModel = !result.resolvedModelId || result.resolvedModelId === modelId;
      return result.object;
    };
    return cache ? cache.object({
      signature: JSON.stringify({ kind: "translation-text-v1", ...requestModel, schema: "TranslationText-v1" }),
      text: text + (context ?? ""), capturedTexts: [text],
      parse: (value) => requestModel.schema.parse(value), cacheable: () => servedRequestedModel, compute,
    }) : compute();
  }
}
