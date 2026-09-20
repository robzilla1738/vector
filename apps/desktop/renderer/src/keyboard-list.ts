import type { KeyboardEvent } from 'react';

/** Manual activation: arrows move focus; Enter/Space keep the control's action. */
export function moveListFocus(event: KeyboardEvent<HTMLElement>, selector: string, vertical = true) {
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const backward = vertical ? 'ArrowUp' : 'ArrowLeft';
  const forward = vertical ? 'ArrowDown' : 'ArrowRight';
  if (![backward, forward, 'Home', 'End'].includes(event.key)) return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(selector)]
    .filter(row => !row.closest('[inert], [aria-hidden="true"]') && row.getClientRects().length > 0);
  const index = rows.indexOf(event.target as HTMLElement);
  if (index < 0 || !rows.length) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1
    : (index + (event.key === backward ? -1 : 1) + rows.length) % rows.length;
  rows[next]?.focus();
  rows[next]?.scrollIntoView({block:'nearest',inline:'nearest'});
}
