import { createDaemonClient } from '../../extension/src/daemon';
export const { rpc, reconnect, resolveAccount } = createDaemonClient(
  'password-manager-extension',
);
export type VaultStatus = {
  initialized: boolean;
  locked: boolean;
  biometricAvailable: boolean;
  formatVersion: number;
};
export type VaultItem = {
  id: string;
  vaultId: string;
  revision: number;
  category: string;
  title: string;
  subtitle: string;
  urls: string[];
  tags: string[];
  favorite: boolean;
  state: 'active' | 'archived' | 'trashed';
  reprompt: boolean;
  agentAccessPolicy: 'always' | 'while-unlocked' | 'never';
  notes: string;
  loginFields?: { username: string; password: string; totp?: string };
  sections: {
    title: string;
    fields: { name: string; value: string; secret: boolean }[];
  }[];
  createdAt: number;
  updatedAt: number;
};
export type VaultRecord = {
  id: string;
  name: string;
  type: 'personal';
  revision: number;
};
export type Snapshot = {
  revision: number;
  vaults: VaultRecord[];
  items: VaultItem[];
};
export type FillContext = {
  contextToken: string;
  documentUrl: string;
  fieldType: string;
};
export async function backgroundRequest<T>(request: Record<string, unknown>) {
  if (!globalThis.chrome?.runtime?.sendMessage)
    throw new Error(
      'Open Aux Vault in the rebuilt Aux browser to fill a page.',
    );
  const response = (await chrome.runtime.sendMessage(request)) as {
    result?: T;
    error?: string;
  };
  if (response.error) throw new Error(response.error);
  if (response.result === undefined)
    throw new Error('The Vault action did not return a result.');
  return response.result;
}
