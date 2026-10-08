import type { MentionRef } from "@aux/contracts";

export interface MentionToken {
  start: number;
  end: number;
  text: string;
  ref: MentionRef;
}
export interface MentionDraft {
  text: string;
  tokens: readonly MentionToken[];
}
export interface MentionQuery {
  start: number;
  end: number;
  query: string;
}

export function mentionQuery(text: string, caret: number): MentionQuery | null {
  const prefix = text.slice(0, caret);
  const match = /(?:^|\s)@([^@\s]*)$/.exec(prefix);
  if (!match) return null;
  return { start: caret - match[1]!.length - 1, end: caret, query: match[1]! };
}

/** Offset tracking preserves tokens only if the edited interval never touches them. */
export function editMentionDraft(draft: MentionDraft, text: string): MentionDraft {
  let start = 0;
  while (start < Math.min(draft.text.length, text.length) && draft.text[start] === text[start]) start++;
  let oldEnd = draft.text.length,
    end = text.length;
  while (oldEnd > start && end > start && draft.text[oldEnd - 1] === text[end - 1]) {
    oldEnd--;
    end--;
  }
  return spliceMentionDraft(draft, start, oldEnd, text.slice(start, end));
}

export function spliceMentionDraft(
  draft: MentionDraft,
  start: number,
  oldEnd: number,
  replacement: string,
): MentionDraft {
  const text = draft.text.slice(0, start) + replacement + draft.text.slice(oldEnd);
  const delta = replacement.length - (oldEnd - start);
  const tokens = draft.tokens.flatMap((token) => {
    if (token.end <= start) return [token];
    if (token.start >= oldEnd && !(oldEnd === start && token.start < start && token.end > start))
      return [{ ...token, start: token.start + delta, end: token.end + delta }];
    return [];
  });
  return { text, tokens };
}

export function insertMention(
  draft: MentionDraft,
  query: MentionQuery,
  label: string,
  ref: MentionRef,
): MentionDraft {
  const text = `@${label}`;
  const next = spliceMentionDraft(draft, query.start, query.end, text + " ");
  return {
    ...next,
    tokens: [...next.tokens, { start: query.start, end: query.start + text.length, text, ref }].sort(
      (a, b) => a.start - b.start,
    ),
  };
}

export function backspaceMention(
  draft: MentionDraft,
  caret: number,
): { draft: MentionDraft; caret: number } | null {
  const token = draft.tokens.find(
    (token) => token.end === caret || (token.end + 1 === caret && draft.text[token.end] === " "),
  );
  if (!token) return null;
  return { draft: spliceMentionDraft(draft, token.start, caret, ""), caret: token.start };
}

export function mentionRefs(draft: MentionDraft): MentionRef[] {
  return draft.tokens
    .filter((token) => draft.text.slice(token.start, token.end) === token.text)
    .map((token) => token.ref);
}
