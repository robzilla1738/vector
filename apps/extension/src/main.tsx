import { Button, ErrorNotice, Mark } from '@aux/ui';
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
import { Collection, Settings, Tasks } from './pages';
import { TabSearch } from './tab-search';

type Account = Awaited<ReturnType<typeof resolveAccount>>;
function Shell() {
  const [account, setAccount] = useState<Account>();
  const [error, setError] = useState('');
  const path = useLocation().pathname;
  function connect() {
    setError('');
    void resolveAccount()
      .then(setAccount)
      .catch((e) => setError(e.message));
  }
  useEffect(connect, []);
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
      {!['/tab-search', '/mini-popup'].includes(path) && (
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
      <Outlet />
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
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: () => (
    <AccountRoute>
      {(account) => <Onboarding accountId={account.accountId} />}
    </AccountRoute>
  ),
});
function Onboarding({ accountId }: { accountId: number }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  return (
    <main className="onboarding secondary stack">
      <Mark />
      <h1>Make room for what matters.</h1>
      <p>
        This account stays on this Mac. Connect a model, choose access rules,
        and make Aux your own.
      </p>
      <a href="#/settings/model">Choose how Aux connects to AI</a>
      <a href="#/settings/agents">Choose what Aux can access</a>
      <a href="#/settings/appearance">Look and layout</a>
      {error && <ErrorNotice error={error} />}
      <Button
        disabled={pending}
        onClick={() => {
          setPending(true);
          void rpc('accounts.completeOnboarding', { accountId }, true)
            .then(() => {
              location.hash = '/';
            })
            .catch((e) => setError(e.message))
            .finally(() => setPending(false));
        }}
      >
        Finish with model setup deferred
      </Button>
    </main>
  );
}
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
  ]),
});
const element = document.getElementById('root');
if (!element) throw new Error('Aux root is missing.');
createRoot(element).render(<RouterProvider router={router} />);
