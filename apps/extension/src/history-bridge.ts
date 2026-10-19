import { resolveAccount, rpc } from './daemon';

// The daemon supplies a bound route, but identity is always resolved again from
// the actual native extension Profile. No web URL or numeric tab ID owns it.
export async function readHistoryVisits(params: Record<string, unknown>) {
  if (chrome.extension.inIncognitoContext)
    throw new Error('Private browsing history cannot enter durable recall.');
  const from = params.from,
    to = params.to;
  if (
    typeof from !== 'number' ||
    typeof to !== 'number' ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from < 0 ||
    to < from ||
    to > Date.now() + 1000
  )
    throw new Error('Invalid history collection interval.');
  async function authorize() {
    const account = await resolveAccount();
    if (
      params.browserMode !== 'default' ||
      params.accountId !== account.accountId ||
      params.profileId !== account.profile.profileId
    )
      throw new Error(
        'History route does not match the actual native Profile.',
      );
    const settings = await rpc<{ browsingHistoryEnabled?: boolean }>(
      'settings.get',
      { accountId: account.accountId },
    );
    if (settings.browsingHistoryEnabled !== true)
      throw new Error('Visited-page recall requires explicit opt-in.');
    return account;
  }
  const account = await authorize();
  if (!chrome.history?.search || !chrome.history?.getVisits)
    throw new Error('Native browser history permission is unavailable.');
  const items = await chrome.history.search({
    text: '',
    startTime: from,
    endTime: to,
    maxResults: 501,
  });
  if (items.length > 500)
    throw new Error(
      'History interval exceeds the bounded collection size; choose a smaller interval.',
    );
  const visits = [];
  for (const item of items) {
    if (!item.url || !/^https?:\/\//i.test(item.url)) continue;
    const url = new URL(item.url);
    if (url.username || url.password) continue;
    for (const visit of await chrome.history.getVisits({ url: item.url })) {
      if (
        !visit.visitId ||
        visit.visitTime === undefined ||
        visit.visitTime < from ||
        visit.visitTime > to
      )
        continue;
      if (visits.length >= 2000)
        throw new Error(
          'History interval contains too many visits; choose a smaller interval.',
        );
      visits.push({
        id: visit.visitId,
        url: item.url,
        title: item.title ?? '',
        visitedAt: visit.visitTime,
        transition: visit.transition,
        content: '',
      });
    }
  }
  await authorize();
  return {
    accountId: account.accountId,
    profileId: account.profile.profileId,
    browserMode: 'default',
    from,
    through: to,
    complete: true,
    // lastVisitTime is never substituted for individual visit records.
    visits: visits.sort(
      (left, right) =>
        left.visitedAt - right.visitedAt || left.id.localeCompare(right.id),
    ),
  };
}
