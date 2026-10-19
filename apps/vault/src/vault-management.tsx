import { Button, ErrorNotice } from '@aux/ui';
import { useState } from 'react';
import type { VaultRecord } from './client';

export function VaultManagement({
  vaults,
  items,
  pending,
  mutate,
}: {
  vaults: VaultRecord[];
  items: { vaultId: string }[];
  pending: boolean;
  mutate: (
    procedure: string,
    input: Record<string, unknown>,
  ) => Promise<unknown>;
}) {
  return (
    <section className="stack">
      <h3>Manage Vaults</h3>
      {vaults.map((vault) => (
        <VaultRow
          key={`${vault.id}.${vault.revision}`}
          vault={vault}
          count={items.filter((item) => item.vaultId === vault.id).length}
          pending={pending}
          mutate={mutate}
        />
      ))}
    </section>
  );
}

function VaultRow({
  vault,
  count,
  pending,
  mutate,
}: {
  vault: VaultRecord;
  count: number;
  pending: boolean;
  mutate: (
    procedure: string,
    input: Record<string, unknown>,
  ) => Promise<unknown>;
}) {
  const [name, setName] = useState(vault.name);
  const [error, setError] = useState('');
  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        void mutate('vault.updateVault', {
          vaultId: vault.id,
          name: name.trim(),
          baseRevision: vault.revision,
        }).catch((error) => setError(error.message));
      }}
    >
      <label>
        {vault.name}
        <input
          className="field"
          aria-label={`Name for ${vault.name}`}
          value={name}
          maxLength={1024}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <small>
        {count} saved {count === 1 ? 'item' : 'items'}
      </small>
      <div className="row">
        <Button
          type="submit"
          disabled={pending || !name.trim() || name.trim() === vault.name}
        >
          Rename
        </Button>
        <Button
          disabled={pending || count > 0}
          title={
            count
              ? 'Move or delete the saved items before removing this Vault.'
              : undefined
          }
          onClick={() => {
            if (!confirm(`Remove the empty Vault “${vault.name}”?`)) return;
            setError('');
            void mutate('vault.deleteVault', { vaultId: vault.id }).catch(
              (error) => setError(error.message),
            );
          }}
        >
          Remove empty Vault
        </Button>
      </div>
      {error && <ErrorNotice error={error} />}
    </form>
  );
}
