/** Original utility contracts: ui/utilities Selection/lasso and Translation status. */
export const utilityPort = 'aux.page-utilities.v1';
export const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Japanese',
  'Korean',
  'Chinese',
  'Arabic',
  'Hindi',
] as const;
export interface Segment {
  id: string;
  text: string;
}
export interface UtilityRequest {
  type: 'start';
  requestId: string;
  documentToken: string;
  documentUrl: string;
  kind: 'selection' | 'translation';
  source: string;
  instruction: string;
  segments?: Segment[];
  sourceLanguage?: string;
  targetLanguage?: string;
}
export interface UtilityUpdate {
  type: 'started' | 'chunk' | 'complete' | 'error' | 'aborted';
  requestId: string;
  documentToken: string;
  sessionId?: string;
  text?: string;
  error?: string;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid utility message.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > max ||
    value.includes('\0')
  )
    throw new Error('Invalid utility text.');
  return value;
}
export function requestFrom(value: unknown): UtilityRequest {
  const v = record(value);
  const requestId = text(v.requestId, 36),
    documentToken = text(v.documentToken, 36);
  if (
    v.type !== 'start' ||
    !uuid.test(requestId) ||
    !uuid.test(documentToken) ||
    !['selection', 'translation'].includes(String(v.kind))
  )
    throw new Error('Invalid utility request identity.');
  const url = new URL(text(v.documentUrl, 8192));
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('This document cannot use page utilities.');
  const source = text(v.source, v.kind === 'selection' ? 32000 : 96000),
    instruction = text(v.instruction, 2000);
  if (v.kind === 'selection')
    return {
      type: 'start',
      requestId,
      documentToken,
      documentUrl: url.href,
      kind: 'selection',
      source,
      instruction,
    };
  if (
    !Array.isArray(v.segments) ||
    !v.segments.length ||
    v.segments.length > 400
  )
    throw new Error('Translation requires one to400 text segments.');
  const seen = new Set<string>();
  let size = 0;
  const segments = v.segments.map((value) => {
    const item = record(value);
    const id = text(item.id, 40);
    if (!/^t\d+$/.test(id) || seen.has(id))
      throw new Error('Invalid translation segment identity.');
    seen.add(id);
    const content = text(item.text, 8000);
    size += content.length;
    return { id, text: content };
  });
  if (size > 64000 || source !== JSON.stringify(segments))
    throw new Error('Translation source does not match its captured segments.');
  const targetLanguage = text(v.targetLanguage, 40),
    sourceLanguage = text(v.sourceLanguage, 40);
  if (
    !languages.includes(targetLanguage as (typeof languages)[number]) ||
    !(
      sourceLanguage === 'auto' ||
      languages.includes(sourceLanguage as (typeof languages)[number])
    )
  )
    throw new Error('Choose a supported translation language.');
  return {
    type: 'start',
    requestId,
    documentToken,
    documentUrl: url.href,
    kind: 'translation',
    source,
    instruction,
    segments,
    sourceLanguage,
    targetLanguage,
  };
}
export function translationResult(textValue: string, segments: Segment[]) {
  const body = textValue
    .trim()
    .replace(/^```(?:json)?\s*/, '')
    .replace(/\s*```$/, '');
  const result = record(JSON.parse(body));
  if (
    !Array.isArray(result.segments) ||
    result.segments.length !== segments.length
  )
    throw new Error('The translation did not include every captured segment.');
  const originals = new Map(segments.map((s) => [s.id, s.text]));
  const translated = new Map<string, string>();
  let size = 0;
  for (const raw of result.segments) {
    const row = record(raw);
    const id = String(row.id);
    if (
      !originals.has(id) ||
      translated.has(id) ||
      typeof row.text !== 'string' ||
      row.text.length > 16000 ||
      row.text.includes('\0')
    )
      throw new Error(
        'The translation contains an invalid or duplicate segment.',
      );
    size += row.text.length;
    if (size > 128000) throw new Error('Translation exceeds its text limit.');
    translated.set(id, row.text);
  }
  const detectedSource =
    typeof result.detectedSource === 'string'
      ? result.detectedSource.slice(0, 80)
      : undefined;
  return { translated, detectedSource };
}
export type Phase =
  | 'idle'
  | 'pending'
  | 'streaming'
  | 'complete'
  | 'error'
  | 'aborted';
export class UtilityRun {
  phase: Phase = 'idle';
  requestId = '';
  sessionId = '';
  text = '';
  error = '';
  constructor(readonly documentToken: string) {}
  begin(requestId: string) {
    this.requestId = requestId;
    this.sessionId = '';
    this.text = '';
    this.error = '';
    this.phase = 'pending';
  }
  accept(update: UtilityUpdate) {
    if (
      update.documentToken !== this.documentToken ||
      update.requestId !== this.requestId ||
      ['aborted', 'error', 'complete'].includes(this.phase)
    )
      return false;
    if (this.sessionId && update.sessionId !== this.sessionId) return false;
    if (update.type === 'started') {
      if (!update.sessionId) return false;
      this.sessionId = update.sessionId;
    } else if (!this.sessionId && ['error', 'aborted'].includes(update.type)) {
      this.phase = update.type === 'error' ? 'error' : 'aborted';
      this.error = update.error ?? '';
      return true;
    } else if (!this.sessionId || update.sessionId !== this.sessionId)
      return false;
    if (update.type === 'chunk') {
      this.text += update.text ?? '';
      if (this.text.length > 128000) {
        this.text = '';
        this.error = 'The utility output exceeded its limit.';
        this.phase = 'error';
        return true;
      }
      this.phase = 'streaming';
    }
    if (update.type === 'complete') {
      this.text = update.text ?? '';
      this.phase = 'complete';
    }
    if (update.type === 'error') {
      this.error = update.error ?? 'The utility request failed.';
      this.phase = 'error';
    }
    if (update.type === 'aborted') this.phase = 'aborted';
    return true;
  }
  abort() {
    this.phase = 'aborted';
  }
}
