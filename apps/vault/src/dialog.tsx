import { Dialog } from '@aux/ui';
import type { ReactNode } from 'react';

/** Keep shared modal focus/cancel behavior; geometry belongs to each Vault surface. */
export function VaultDialog({
  kind,
  title,
  children,
  onClose,
}: {
  kind:
    | 'item'
    | 'history'
    | 'generator'
    | 'management'
    | 'preferences'
    | 'import'
    | 'recovery';
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <div className={`vault-dialog-content vault-dialog-${kind}`}>
        {children}
      </div>
    </Dialog>
  );
}
