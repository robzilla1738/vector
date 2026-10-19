import { ErrorNotice } from '@aux/ui';
import { AuthGate } from '@aux/ui/security';
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@aux/ui/tokens.css';
import './styles.css';
import { Chat } from './chat';
import { reconnect, resolveAccount, rpc } from './daemon';
import { Newtab } from './newtab';
import { Onboarding } from './onboarding';
import { Collection, Settings, Tasks } from './pages';
import { TabSearch } from './tab-search';

type Account = Awaited<ReturnType<typeof resolveAccount>>;
function Shell() {
  const [account, setAccount] = useState<Account>();
  const [error, setError] = useState('');
  const [gate, setGate] = useState<{ initialized: boolean }>();
  const path = useLocation().pathname;
  function connect() {
    setError('');
    void resolveAccount()
      .then(async (value) => {
        setAccount(value);
        const identity = await rpc<{ onboardingCompletedAt?: number }>(
          'accounts.get',
          { accountId: value.accountId },
        );
        if (
          !identity.onboardingCompletedAt &&
          !['/onboarding', '/settings'].some((route) =>
            location.hash.slice(1).startsWith(route),
          )
        )
          location.hash = '/onboarding';
      })
      .catch((e) => setError(e.message));
  }
  useEffect(connect, []);
  useEffect(() => {
    if (!account) return;
    let active = true;
    const check = () =>
      void rpc<{ locked: boolean; initialized: boolean }>(
        'passwordManager.auth.status',
        { accountId: account.accountId },
      )
        .then((status) => {
          if (active && status.locked)
            setGate(
              (current) => current ?? { initialized: status.initialized },
            );
        })
        .catch((error) => {
          if (active) setError(error.message);
        });
    check();
    const timer = setInterval(check, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [account]);
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if ((localStorage.getItem('aux.theme') ?? 'system') === 'system')
        document.documentElement.dataset.theme = query.matches
          ? 'dark'
          : 'light';
    };
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return (
    <>
      {!gate &&
        !['/', '/tab-search', '/mini-popup', '/onboarding'].includes(path) && (
          <nav className="navigation" aria-label="Aux navigation">
            <a className="wordmark" href="#/">
              Aux
            </a>
            {[
              ['/tasks', 'Tasks'],
              ['/inbox', 'Updates'],
              ['/projects', 'Projects'],
              ['/routines', 'Routines'],
              ['/memory', 'Memory'],
              ['/settings/general', 'Preferences'],
            ].map(([href, label]) => (
              <a
                href={`#${href}`}
                key={href}
                aria-current={path.startsWith(href ?? '') ? 'page' : undefined}
              >
                {label}
              </a>
            ))}
            <small>{account?.name ?? 'Local account'}</small>
          </nav>
        )}
      {error && path !== '/' && (
        <div className="connection">
          <ErrorNotice
            error={error}
            retry={() => {
              reconnect();
              connect();
            }}
          />
        </div>
      )}
      {gate && account ? (
        <AuthGate
          key={account.accountId}
          rpc={rpc}
          accountId={account.accountId}
          initialized={gate.initialized}
          error={error}
          onUnlocked={async () => {
            const status = await rpc<{ locked: boolean }>(
              'passwordManager.auth.status',
              { accountId: account.accountId },
            );
            if (status.locked) throw new Error('This account is still locked.');
            setGate(undefined);
            if (location.hash === '#/unlock') location.hash = '/';
          }}
        />
      ) : (
        <Outlet />
      )}
      {account && (
        <span hidden id="account-id">
          {account.accountId}
        </span>
      )}
    </>
  );
}
function AccountRoute({
  children,
}: {
  children: (account: Account) => React.ReactNode;
}) {
  const [account, setAccount] = useState<Account>();
  const [error, setError] = useState('');
  useEffect(() => {
    void resolveAccount()
      .then(setAccount)
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <main className="secondary">
        <ErrorNotice
          error={error}
          retry={() => {
            reconnect();
            void resolveAccount()
              .then((value) => {
                setError('');
                setAccount(value);
              })
              .catch((e) => setError(e.message));
          }}
        />
      </main>
    );
  if (!account)
    return (
      <main className="secondary" role="status">
        Connecting to Aux…
      </main>
    );
  return children(account);
}
const rootRoute = createRootRoute({ component: Shell });
const newtabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Newtab
      onTask={(draft) => {
        localStorage.setItem('aux.new-draft', draft);
        location.hash = '/chat';
      }}
    />
  ),
});
function ChatRoute() {
  const path = useLocation().pathname;
  const id = path.split('/')[2];
  return (
    <AccountRoute>
      {(account) => {
        const draft = localStorage.getItem('aux.new-draft');
        if (draft && !id) {
          localStorage.setItem(
            `aux.draft.${account.accountId}.new`,
            draft
              .replaceAll('&', '&amp;')
              .replaceAll('<', '&lt;')
              .replaceAll('>', '&gt;'),
          );
          localStorage.removeItem('aux.new-draft');
        }
        return (
          <Chat
            key={`${account.accountId}.${id ?? 'new'}`}
            accountId={account.accountId}
            sessionId={id}
            onSession={(sessionId) => {
              location.hash = `/chat/${sessionId}`;
            }}
          />
        );
      }}
    </AccountRoute>
  );
}
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatRoute,
});
const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$sessionId',
  component: ChatRoute,
});
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: () => (
    <AccountRoute>
      {(account) => <Tasks accountId={account.accountId} />}
    </AccountRoute>
  ),
});
const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archived-chats',
  component: () => (
    <AccountRoute>
      {(account) => <Tasks accountId={account.accountId} archived />}
    </AccountRoute>
  ),
});
const collectionRoutes = (
  ['projects', 'routines', 'memory', 'inbox'] as const
).map((kind) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: `/${kind}`,
    component: () => (
      <AccountRoute>
        {(account) => <Collection accountId={account.accountId} kind={kind} />}
      </AccountRoute>
    ),
  }),
);
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/$',
  component: () => {
    const section = useLocation().pathname.replace('/settings/', '');
    return (
      <AccountRoute>
        {(account) => (
          <Settings accountId={account.accountId} section={section} />
        )}
      </AccountRoute>
    );
  },
});
const unlockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unlock',
  component: () => (
    <main className="secondary" role="status">
      Checking local account security…
    </main>
  ),
});
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: () => (
    <AccountRoute>
      {(account) => <Onboarding accountId={account.accountId} />}
    </AccountRoute>
  ),
});
const tabSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tab-search',
  component: () => (
    <AccountRoute>
      {(account) => <TabSearch accountId={account.accountId} />}
    </AccountRoute>
  ),
});
const miniPopupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mini-popup',
  component: ChatRoute,
});
const router = createRouter({
  history: createHashHistory(),
  routeTree: rootRoute.addChildren([
    tabSearchRoute,
    miniPopupRoute,
    newtabRoute,
    chatRoute,
    sessionRoute,
    tasksRoute,
    archiveRoute,
    ...collectionRoutes,
    settingsRoute,
    onboardingRoute,
    unlockRoute,
  ]),
});
const element = document.getElementById('root');
if (!element) throw new Error('Aux root is missing.');
createRoot(element).render(<RouterProvider router={router} />);
