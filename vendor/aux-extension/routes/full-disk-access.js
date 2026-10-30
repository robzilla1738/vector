/* Aux-owned source, Messages access (assets/full-disk-access-BmnWkbG2.js, the module body): the
 * macOS permission Aux needs to read and send messages, its setup hook, the Grant access button,
 * and the card a chat shows to ask for it, which tells the agent to continue once granted.
 * Names the rest of the chunk uses keep their chunk names (all exported): N MessagesIcon, O the
 * composer insert event, u useFullDiskAccess, P GrantAccessButton, z MessagesAccessCard; D React and
 * s JSX runtime stay as named.
 * Chunk names used: C/h/g React and JSX runtime, x cn, j Spinner, y useEventBus, w useMutation,
 * v useQuery, _ useQueryClient, A useTRPC, k the check icon, S Button, c toast, d/b schema builders,
 * M isMac, q useSession. The icon keeps the Messages app's own colors. */
var D = C(h()),
  s = g(),
  /** The Messages app icon. */
  N = props =>
    (0, s.jsxs)('svg', {
      width: 36,
      height: 36,
      viewBox: '0 0 36 36',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...props,
      children: [
        (0, s.jsxs)('g', {
          clipPath: 'url(#clip0_2791_8236)',
          children: [
            (0, s.jsx)('path', {
              d: 'M0 16C0 10.3995 0 7.59921 1.08993 5.46009C2.04867 3.57847 3.57847 2.04867 5.46009 1.08993C7.59921 0 10.3995 0 16 0H20C25.6005 0 28.4008 0 30.5399 1.08993C32.4215 2.04867 33.9513 3.57847 34.9101 5.46009C36 7.59921 36 10.3995 36 16V20C36 25.6005 36 28.4008 34.9101 30.5399C33.9513 32.4215 32.4215 33.9513 30.5399 34.9101C28.4008 36 25.6005 36 20 36H16C10.3995 36 7.59921 36 5.46009 34.9101C3.57847 33.9513 2.04867 32.4215 1.08993 30.5399C0 28.4008 0 25.6005 0 20V16Z',
              fill: '#171717',
            }),
            (0, s.jsxs)('g', {
              clipPath: 'url(#clip1_2791_8236)',
              children: [
                (0, s.jsx)('path', {
                  d: 'M28.0714 0H7.92857C3.54974 0 0 3.54975 0 7.92858V28.0714C0 32.4503 3.54974 36 7.92857 36H28.0714C32.4503 36 36 32.4503 36 28.0714V7.92858C36 3.54975 32.4503 0 28.0714 0Z',
                  fill: 'url(#paint0_linear_2791_8236)',
                }),
                (0, s.jsx)('path', {
                  d: 'M17.9995 6.42285C14.5516 6.42287 11.2449 7.56374 8.80681 9.59448C6.36875 11.6252 4.99905 14.3795 4.99902 17.2514C5.00217 19.1194 5.58543 20.955 6.69213 22.5798C7.79883 24.2045 9.39132 25.5632 11.3149 26.5237C10.8025 27.6706 10.0342 28.7461 9.04161 29.7057C10.9665 29.3678 12.7734 28.6579 14.3217 27.6314C15.5155 27.9269 16.7541 28.0779 17.9995 28.08C21.4475 28.0799 24.7542 26.9391 27.1923 24.9083C29.6303 22.8776 31 20.1233 31.0001 17.2514C31 14.3795 29.6303 11.6252 27.1923 9.59448C24.7542 7.56374 21.4475 6.42287 17.9995 6.42285Z',
                  fill: 'white',
                }),
              ],
            }),
          ],
        }),
        (0, s.jsxs)('defs', {
          children: [
            (0, s.jsxs)('linearGradient', {
              id: 'paint0_linear_2791_8236',
              x1: 18.2857,
              y1: 33.6103,
              x2: 18.2857,
              y2: 4.46777,
              gradientUnits: 'userSpaceOnUse',
              children: [
                (0, s.jsx)('stop', {stopColor: '#0CBD2A'}),
                (0, s.jsx)('stop', {offset: 1, stopColor: '#5BF675'}),
              ],
            }),
            (0, s.jsx)('clipPath', {
              id: 'clip0_2791_8236',
              children: (0, s.jsx)('path', {
                d: 'M0 16C0 10.3995 0 7.59921 1.08993 5.46009C2.04867 3.57847 3.57847 2.04867 5.46009 1.08993C7.59921 0 10.3995 0 16 0H20C25.6005 0 28.4008 0 30.5399 1.08993C32.4215 2.04867 33.9513 3.57847 34.9101 5.46009C36 7.59921 36 10.3995 36 16V20C36 25.6005 36 28.4008 34.9101 30.5399C33.9513 32.4215 32.4215 33.9513 30.5399 34.9101C28.4008 36 25.6005 36 20 36H16C10.3995 36 7.59921 36 5.46009 34.9101C3.57847 33.9513 2.04867 32.4215 1.08993 30.5399C0 28.4008 0 25.6005 0 20V16Z',
                fill: 'white',
              }),
            }),
            (0, s.jsx)('clipPath', {
              id: 'clip1_2791_8236',
              children: (0, s.jsx)('rect', {width: 36, height: 36, fill: 'white'}),
            }),
          ],
        }),
      ],
    }),
  /** The event that puts text into a session's composer. */
  O = {
    event: '@browser-aux/composer/insert',
    schema: b({sessionId: d(), text: d()}),
  },
  /** useFullDiskAccess: whether Aux may read Messages (macOS only), and setting it up. */
  u = () => {
    const trpc = A(),
      queryClient = _(),
      [isSettingUp, setSettingUp] = (0, D.useState)(false),
      isMac = M(),
      {data: access} = v(trpc.fullDiskAccess.check.queryOptions(void 0, {enabled: isMac, refetchOnWindowFocus: true})),
      request = w(trpc.fullDiskAccess.request.mutationOptions()),
      recheck = async () => (
        await queryClient.invalidateQueries({queryKey: trpc.fullDiskAccess.check.queryKey()}),
        queryClient.getQueryData(trpc.fullDiskAccess.check.queryKey())?.status === 'granted'
      ),
      setUp = async () => {
        setSettingUp(true);
        try {
          const {completed} = await request.mutateAsync();
          if (!completed) return (c.info('Permission setup cancelled.'), false);
          const granted = await recheck();
          return (
            granted
              ? c.success('Messages access is set up.')
              : c.error('Aux Computer Use still does not have access. Add it in System Settings and try again.'),
            granted
          );
        } catch (error) {
          return (c.error(error instanceof Error ? error.message : 'Permission setup failed.'), false);
        } finally {
          setSettingUp(false);
        }
      };
    return {isGranted: access?.status === 'granted', isMac, isSettingUp, setUp};
  },
  /** Grant access, or Enabled once it is granted. */
  P = ({label = 'Grant access', onGranted, size = 'xs'}) => {
    const {isGranted, isSettingUp, setUp} = u();
    return (0, s.jsx)(S, {
      className: 'shrink-0',
      disabled: isSettingUp || isGranted,
      onClick: async () => {
        (await setUp()) && onGranted?.();
      },
      size,
      variant: 'outline',
      children: isGranted
        ? (0, s.jsxs)(s.Fragment, {children: [(0, s.jsx)(k, {className: 'size-3.5'}), 'Enabled']})
        : (0, s.jsxs)(s.Fragment, {children: [isSettingUp && (0, s.jsx)(j, {}), label]}),
    });
  },
  /** The card that asks for Messages access, on a Mac. */
  z = ({className}) => {
    const {broadcast} = y(),
      {isMac} = u(),
      sessionId = q()?.currentSession.id;
    return isMac
      ? (0, s.jsxs)('div', {
          className: x(
            'bg-background flex flex-wrap items-center justify-end gap-2 rounded-xl border px-2.5 py-2',
            className,
          ),
          children: [
            (0, s.jsxs)('div', {
              className: 'flex min-w-0 flex-1 basis-64 items-center gap-3',
              children: [
                (0, s.jsx)(N, {className: 'size-9 shrink-0'}),
                (0, s.jsxs)('div', {
                  className: 'flex min-w-0 flex-1 flex-col justify-center text-sm wrap-break-word',
                  children: [
                    (0, s.jsx)('p', {
                      className: 'text-foreground truncate font-medium',
                      children: 'Enable Aux with Messages',
                    }),
                    (0, s.jsx)('p', {
                      className: 'text-muted-foreground',
                      children: 'Aux needs macOS permissions to read and send messages you approve.',
                    }),
                  ],
                }),
              ],
            }),
            (0, s.jsx)(P, {
              onGranted: () =>
                sessionId &&
                broadcast(O.event, {sessionId, text: "I've enabled the macOS permission. Please continue."}),
              size: 'default',
            }),
          ],
        })
      : null;
  };
