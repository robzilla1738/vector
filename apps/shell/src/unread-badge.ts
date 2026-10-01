export interface UnreadBadge { text: string; label: string }

/** Provider titles are display metadata; unread counts never change tab identity. */
export function unreadBadge(title: string): UnreadBadge | null {
  const match = /^\((\d+)(\+?)\)\s/.exec(title) ?? /\((\d+)\)\s*[-–|]/.exec(title);
  if (match) {
    const count = Number(match[1]);
    if (!count) return null;
    const capped = count >= 99 && (count > 99 || !!match[2]);
    return { text: capped ? "99+" : String(count), label: capped ? "99 or more unread" : `${count} unread` };
  }
  return /^\*\s/.test(title) ? { text: "•", label: "Unread messages" } : null;
}
