import {
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { Message } from './types';
import './turn-rail.css';
export type TurnGroup = {
  id: string;
  firstMessageId: string;
  label: string;
  preview: string;
};
export function groupTurns(messages: Message[]): TurnGroup[] {
  const groups = new Map<string, TurnGroup>();
  for (const message of messages) {
    const id = message.turnId || message.id;
    let group = groups.get(id);
    if (!group) {
      group = { id, firstMessageId: message.id, label: '', preview: '' };
      groups.set(id, group);
    }
    const text = message.content.replace(/\s+/g, ' ').trim();
    if (message.role === 'user' && !group.label)
      group.label = text.slice(0, 200);
    if (message.role === 'assistant' && text)
      group.preview = `${group.preview} ${text}`.trim().slice(0, 1200);
  }
  return Array.from(groups.values()).map((group, index) => ({
    ...group,
    label: group.label || `Turn ${index + 1}`,
  }));
}
function anchor(root: HTMLElement, id: string) {
  return Array.from(
    root.querySelectorAll<HTMLElement>('[data-message-id]'),
  ).find((node) => node.dataset.messageId === id);
}
export function TurnRail({
  messages,
  transcript,
  visible = true,
  onNavigate,
}: {
  messages: Message[];
  transcript: RefObject<HTMLElement | null>;
  visible?: boolean;
  onNavigate: () => void;
}) {
  const groups = useMemo(() => groupTurns(messages), [messages]);
  const enabled = visible && groups.length >= 4;
  const [active, setActive] = useState(0),
    [hovered, setHovered] = useState<number>(),
    [focused, setFocused] = useState<number>();
  const [position, setPosition] = useState<{ left: number; top: number }>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]),
    rail = useRef<HTMLElement>(null),
    preview = useRef<HTMLDivElement>(null),
    drag = useRef<number | undefined>(undefined),
    pointer = useRef<number | undefined>(undefined);
  const previewId = useId();
  const target = hovered ?? focused;
  const group = target === undefined ? undefined : groups[target];
  useEffect(() => {
    if (!enabled) return;
    const root = transcript.current;
    if (!root) return;
    let frame = 0;
    const elements = new Map(
      Array.from(root.querySelectorAll<HTMLElement>('[data-message-id]')).map(
        (node) => [node.dataset.messageId, node],
      ),
    );
    const nodes = groups.flatMap((group, index) => {
      const node = elements.get(group.firstMessageId);
      return node ? [{ node, index }] : [];
    });
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const threshold =
          root.getBoundingClientRect().top +
          Math.min(100, root.clientHeight * 0.25);
        let low = 0,
          high = nodes.length - 1,
          current = 0;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2),
            entry = nodes[middle];
          if (!entry) break;
          if (entry.node.getBoundingClientRect().top <= threshold) {
            current = entry.index;
            low = middle + 1;
          } else high = middle - 1;
        }
        setActive(current);
      });
    };
    update();
    root.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener('scroll', update);
    };
  }, [enabled, groups, transcript]);
  useLayoutEffect(() => {
    if (!enabled || target === undefined) {
      setPosition(undefined);
      return;
    }
    const button = buttons.current[target],
      popover = preview.current;
    if (!button || !popover) return;
    const place = () => {
      const rect = button.getBoundingClientRect(),
        bounds = popover.getBoundingClientRect();
      setPosition({
        left: Math.max(
          8,
          Math.min(rect.right + 8, innerWidth - bounds.width - 8),
        ),
        top: Math.max(
          8,
          Math.min(
            rect.top + rect.height / 2 - bounds.height / 2,
            innerHeight - bounds.height - 8,
          ),
        ),
      });
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(popover);
    if (rail.current) resize.observe(rail.current);
    addEventListener('resize', place);
    rail.current?.addEventListener('scroll', place, { passive: true });
    return () => {
      resize.disconnect();
      removeEventListener('resize', place);
      rail.current?.removeEventListener('scroll', place);
    };
  }, [enabled, target]);
  if (!enabled) return null;
  function navigate(index: number) {
    const group = groups[index],
      root = transcript.current;
    if (!group || !root) return;
    const node = anchor(root, group.firstMessageId);
    if (!node) return;
    onNavigate();
    setActive(index);
    root.scrollTo({
      top: Math.max(
        0,
        root.scrollTop +
          node.getBoundingClientRect().top -
          root.getBoundingClientRect().top -
          12,
      ),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
  function scrub(clientY: number) {
    const index = buttons.current.slice(0, groups.length).reduce(
      (best, node, index) => {
        if (!node) return best;
        const rect = node.getBoundingClientRect(),
          distance = Math.abs(clientY - (rect.top + rect.height / 2));
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Infinity },
    ).index;
    setHovered(index);
    return index;
  }
  return (
    <>
      <nav
        ref={rail}
        className="turn-rail"
        aria-label="Conversation turns"
        onPointerLeave={() => {
          if (drag.current === undefined) setHovered(undefined);
        }}
        onPointerMove={(event) => {
          const index = scrub(event.clientY);
          if (drag.current !== undefined && drag.current !== index) {
            drag.current = index;
            navigate(index);
          }
        }}
        onPointerUp={(event) => {
          drag.current = undefined;
          pointer.current = undefined;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            setHovered(undefined);
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = undefined;
          setHovered(undefined);
        }}
        onLostPointerCapture={() => {
          drag.current = undefined;
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocused(undefined);
        }}
      >
        {groups.map((group, index) => {
          const distance =
              target === undefined ? Infinity : Math.abs(index - target),
            scale =
              index === active || distance === 0
                ? 1
                : distance === 1
                  ? 0.66
                  : distance === 2
                    ? 0.4
                    : 0.2308;
          return (
            <button
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              className="turn-target"
              key={group.id}
              tabIndex={
                index === Math.min(focused ?? active, groups.length - 1)
                  ? 0
                  : -1
              }
              aria-label={`Go to turn ${index + 1}: ${group.label}`}
              aria-current={index === active ? 'step' : undefined}
              aria-describedby={target === index ? previewId : undefined}
              onFocus={() => setFocused(index)}
              onPointerEnter={() => setHovered(index)}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                drag.current = index;
                pointer.current = event.pointerId;
                event.currentTarget.parentElement?.setPointerCapture(
                  event.pointerId,
                );
                navigate(index);
              }}
              onClick={(event) => {
                if (event.detail === 0) navigate(index);
              }}
              onKeyDown={(event) => {
                let next: number | undefined;
                if (event.key === 'ArrowDown')
                  next = Math.min(groups.length - 1, index + 1);
                if (event.key === 'ArrowUp') next = Math.max(0, index - 1);
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = groups.length - 1;
                if (event.key === 'Escape') {
                  event.preventDefault();
                  drag.current = undefined;
                  if (
                    pointer.current !== undefined &&
                    rail.current?.hasPointerCapture(pointer.current)
                  )
                    rail.current.releasePointerCapture(pointer.current);
                  pointer.current = undefined;
                  setHovered(undefined);
                  setFocused(undefined);
                  return;
                }
                if (next !== undefined) {
                  event.preventDefault();
                  setHovered(undefined);
                  setFocused(next);
                  buttons.current[next]?.focus({ preventScroll: true });
                }
              }}
            >
              <span
                className="turn-marker"
                style={{ transform: `scaleX(${scale})` }}
              />
            </button>
          );
        })}
      </nav>
      {group &&
        createPortal(
          <div
            ref={preview}
            id={previewId}
            role="tooltip"
            className="turn-preview"
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            <strong>{group.label}</strong>
            <p>{group.preview || 'No assistant response yet.'}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
