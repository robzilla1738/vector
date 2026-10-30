/* Aux-owned source: the sign out dialog and account helpers (assets/-utils-B_lbplVm.js, the module body).
 * Names the rest of the chunk uses keep their chunk names: N the dialog, D clears the profile sync
 * marker, M updates a stored profile (exported).
 * Chunk names used: c JSX runtime, d Spinner, m useAnalytics, h/j/x/f/u/g the dialog parts, v useMutation,
 * p useQueryClient, y useTRPC, w clears the account state, A Button. */
var /** Where the profile sync keeps its place. */
  PROFILE_SYNC_KEY = 'aux.profileMetadataSync.v2';
/** Forgets it, so the next account starts clean. */
async function D() {
  typeof chrome < 'u' && chrome.storage?.local && (await chrome.storage.local.remove(PROFILE_SYNC_KEY));
}
var jsxRuntime = c(),
  /** The dialog. */
  N = ({accountId, open, onOpenChange}) => {
    const {capture} = m(),
      trpc = y(),
      queryClient = p(),
      signOut = v(trpc.accounts.auth.signOut.mutationOptions()),
      confirm = async () => {
        (await signOut.mutateAsync({accountId}).then(
          () => true,
          () => false,
        )) &&
          (await D(),
          capture('logout'),
          onOpenChange(false),
          w(),
          await Promise.all([
            queryClient.invalidateQueries(trpc.accounts.get.queryFilter({accountId})),
            queryClient.invalidateQueries(trpc.accounts.auth.devices.queryFilter({accountId})),
            queryClient.invalidateQueries(trpc.accounts.auth.me.queryFilter({accountId})),
          ]));
      };
    return (0, jsxRuntime.jsx)(h, {
      open,
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(j, {
        className: 'max-w-lg sm:max-w-lg',
        children: [
          (0, jsxRuntime.jsxs)(x, {
            children: [
              (0, jsxRuntime.jsx)(f, {children: 'Sign out this device?'}),
              (0, jsxRuntime.jsx)(u, {children: 'This stops account and browser sync on this device.'}),
            ],
          }),
          signOut.error &&
            (0, jsxRuntime.jsx)('p', {
              role: 'alert',
              className: 'text-destructive text-xs font-medium',
              children: signOut.error.message,
            }),
          (0, jsxRuntime.jsxs)('div', {
            className: '-mx-5 -mb-5 grid grid-cols-2 gap-2 rounded-b-xl p-4',
            children: [
              (0, jsxRuntime.jsx)(g, {className: 'w-full', disabled: signOut.isPending, children: 'Cancel'}),
              (0, jsxRuntime.jsxs)(A, {
                className: 'w-full',
                disabled: signOut.isPending,
                onClick: () => {
                  confirm();
                },
                children: [
                  signOut.isPending && (0, jsxRuntime.jsx)(d, {}),
                  (0, jsxRuntime.jsx)('span', {children: 'Sign out'}),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  /** A profile with the account's fields, or the same object when nothing changed. */
  M = (profile, account) => {
    const profileUrl = account.profileUrl ?? void 0;
    return profile.email === account.email &&
      profile.name === account.name &&
      profile.profileUrl === profileUrl &&
      profile.userId === account.userId
      ? profile
      : {...profile, email: account.email, name: account.name, profileUrl, userId: account.userId};
  };
