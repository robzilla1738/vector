import { Check, ChevronDown } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { VaultRecord } from './client';

export function VaultChooser({
  vaults,
  value,
  onChange,
}: {
  vaults: VaultRecord[];
  value: string;
  onChange: (vaultId: string) => void;
}) {
  const id = useId();
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="vault-chooser-trigger row"
        popoverTarget={id}
        aria-haspopup="menu"
        aria-label="Choose Vault"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition({
            left: Math.max(8, Math.min(rect.left, innerWidth - 232)),
            top: rect.bottom + 4,
          });
        }}
      >
        <span>
          {vaults.find((vault) => vault.id === value)?.name ?? 'All Vaults'}
        </span>
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      <div
        ref={menu}
        id={id}
        popover="auto"
        role="menu"
        aria-label="Vaults"
        className="vault-chooser"
        style={position}
        onToggle={(event) => {
          if (event.newState === 'open' && menu.current) {
            const height = menu.current.getBoundingClientRect().height;
            menu.current.style.top = `${Math.max(8, Math.min(position.top, innerHeight - height - 8))}px`;
            menu.current
              .querySelector<HTMLButtonElement>('[aria-checked="true"]')
              ?.focus();
          }
        }}
        onKeyDown={(event) => {
          const options = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              'button',
            ),
          ];
          const current =
            document.activeElement instanceof HTMLButtonElement
              ? options.indexOf(document.activeElement)
              : -1;
          let next: number;
          if (event.key === 'ArrowDown') next = (current + 1) % options.length;
          else if (event.key === 'ArrowUp')
            next = (current - 1 + options.length) % options.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = options.length - 1;
          else return;
          event.preventDefault();
          options[next]?.focus();
        }}
      >
        {[{ id: '', name: 'All Vaults' }, ...vaults].map((vault) => (
          <button
            type="button"
            role="menuitemradio"
            aria-checked={value === vault.id}
            key={vault.id}
            onClick={() => {
              onChange(vault.id);
              menu.current?.hidePopover();
              trigger.current?.focus();
            }}
          >
            <span>{vault.name}</span>
            {value === vault.id && <Check size={14} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </>
  );
}
