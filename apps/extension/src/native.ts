type NativeEvent = {
  addListener: (
    listener: (sessionId: string, value: AutocompleteResult) => void,
  ) => void;
  removeListener: (
    listener: (sessionId: string, value: AutocompleteResult) => void,
  ) => void;
};
export type ProfileContext = {
  profileId: string;
  accountId?: number;
  browserMode?: 'default' | 'incognito';
  isCurrent?: boolean;
  isLocked?: boolean;
  profilePath?: string;
  profileIndex?: number;
};
export type Match = {
  id: string;
  index: number;
  title: string;
  description: string;
  destinationUrl: string;
  fillIntoEdit: string;
  type: string;
  isSearch: boolean;
  deletable: boolean;
  tabId?: number;
};
export type AutocompleteResult = {
  revision: number;
  input: string;
  done: boolean;
  matches: Match[];
};
export type ImportSource = {
  id: string;
  name: string;
  installed: boolean;
  profiles: { id: string; name: string }[];
  categories?: string[];
};
export type ImportProgress = {
  jobId: string;
  sourceId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  completed: number;
  total: number;
  category?: string;
  error?: string;
};
type NativeChrome = typeof chrome & {
  auxAccount?: {
    getProfileContext: () => Promise<ProfileContext>;
    signDaemonAuthChallenge: (
      challenge: string,
    ) => Promise<{ signedChallenge: string }>;
  };
  auxOmnibox?: {
    createSession: (options: {
      surface: string;
    }) => Promise<{ sessionId: string }>;
    destroySession: (id: string) => Promise<void>;
    queryAutocomplete: (
      id: string,
      text: string,
      options: Record<string, never>,
    ) => Promise<void>;
    stopAutocomplete: (id: string, clear: boolean) => Promise<void>;
    openAutocompleteMatch: (
      id: string,
      request: { revision: number; index: number; disposition: string },
    ) => Promise<void>;
    onAutocompleteResultChanged: NativeEvent;
  };
  auxBrowserPreferences?: Record<
    string,
    (...args: unknown[]) => Promise<unknown>
  >;
  auxMiniPopup?: Record<string, (...args: unknown[]) => Promise<unknown>>;
  auxBrowserImport?: {
    getImportSources: () => Promise<ImportSource[]>;
    startImport: (options: {
      sourceId: string;
      sourceProfileId?: string;
      categories: string[];
    }) => Promise<ImportProgress>;
    getImportProgress: (jobId: string) => Promise<ImportProgress>;
    cancelImport: (jobId: string) => Promise<void>;
  };
};
export const native = globalThis.chrome as NativeChrome | undefined;
export function requireAccount() {
  if (!native?.auxAccount)
    throw new Error(
      'This Aux build is missing the native account API. Launch the rebuilt Aux browser to connect securely.',
    );
  return native.auxAccount;
}
export async function preference(method: string, ...args: unknown[]) {
  const call = native?.auxBrowserPreferences?.[method];
  if (!call)
    throw new Error(
      `This browser is missing ${method}. Install the rebuilt Aux native components.`,
    );
  return call(...args);
}
