---
name: linkedin
description: Read this when you need to use LinkedIn.
icon: "https://app.getaux.co/builtin-skills/v1/linkedin.svg"
autoInject:
  keywords: ["linkedin"]
---

# LinkedIn

The `linkedin` global in the REPL drives LinkedIn through an API-style interface (LinkedIn's internal Voyager API). No tab needed.

## At a glance

```js
// The signed-in viewer. The shape is Voyager's own:
//   { data: { plainId, '*miniProfile' }, included: [MiniProfile, ...] }
const me = await linkedin.getMe();
const miniProfile = me.included?.find((item) => item.$type === 'com.linkedin.voyager.identity.shared.MiniProfile');
console.log(miniProfile?.publicIdentifier, me.data?.plainId);

// A public profile, by public identifier or profile URL
const profile = await linkedin.getProfile('johndoe');
console.log(profile.fullName, profile.headline);

// People and company search
const people = await linkedin.searchPeople('software engineer at openai');
console.log(people.results.map((item) => item.title));
const companies = await linkedin.searchCompanies('openai');
console.log(companies.results.map((item) => item.title));

// Company, job, posts
const company = await linkedin.getCompany('microsoft');
const job = await linkedin.getJob('4242424242');
const posts = await linkedin.getUserPosts('johndoe');

// Messaging (pages by timestamp, not offset)
const inbox = await linkedin.getInbox();
const convo = await linkedin.getConversation(inbox.conversations[0].threadId);
// Reply in an existing thread
await linkedin.sendMessage({ threadId: inbox.conversations[0].threadId, text: 'Hey!' });
// Start a new thread (public identifiers or profile URNs)
await linkedin.sendMessage({ recipients: ['johndoe'], text: 'Hi, nice to meet you.' });

// Connection requests
await linkedin.sendInvitation({ identifier: 'johndoe', customMessage: 'Would love to connect.' });
const received = await linkedin.getReceivedInvitations();
if (received.invitations[0]) {
  await linkedin.acceptInvitation(received.invitations[0]);
  // or linkedin.ignoreInvitation(received.invitations[0])
}
// Withdraw one you sent, using the URN from sendInvitation's response:
// await linkedin.withdrawInvitation(invitationUrn);

// If LinkedIn rotates the session cookies:
linkedin.invalidateCache();
```

## Profiles and search

**`linkedin.getMe(): Promise<object>`**
The signed-in viewer, from `/voyager/api/me`, as Voyager returns it: `{ data: { plainId, '*miniProfile', ... }, included: [MiniProfile, ...] }`. The viewer's `publicIdentifier`, `firstName`, `lastName` and the rest are on the `MiniProfile` item in `included`.

**`linkedin.getProfile(identifier: string): Promise<LinkedInProfile>`**
A public profile by public identifier or profile URL.

```ts
interface LinkedInProfile {
  entityUrn?: string;
  publicIdentifier?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  headline?: string;
  summary?: string;
  location?: string;
  industryName?: string;
  occupation?: string;
  profilePicture?: string;
  backgroundPicture?: string;
  experience: Array<{
    title?: string;
    companyName?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }>;
  education: Array<{
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  raw: object;
}
```

**`linkedin.searchPeople(query: string, opts?: { offset?: number, limit?: number }): Promise<LinkedInSearchResponse>`** and **`linkedin.searchCompanies(query: string, opts?: { offset?: number, limit?: number }): Promise<LinkedInSearchResponse>`**
People or company results from Voyager search.

```ts
interface LinkedInSearchResponse {
  paging: { offset: number; count: number; total: number };
  results: Array<{
    entityUrn: string;
    title: string;
    headline?: string;
    subline?: string;
    summary?: string;
    navigationUrl?: string;
    image?: string;
    type?: string;
    distance?: string;
  }>;
}
```

**`linkedin.getCompany(slug: string): Promise<object | undefined>`** A company by its public slug, such as `microsoft`.

**`linkedin.getJob(jobId: string): Promise<object>`** A job posting by numeric id or `urn:li:jobPosting:*`.

**`linkedin.getUserPosts(identifier: string, opts?: { start?: number, count?: number }): Promise<LinkedInPost[]>`** Posts a user wrote.

```ts
interface LinkedInPost {
  urn?: string;
  postUrl?: string;
  text?: string;
  authorName?: string;
  authorHeadline?: string;
  publishedAt?: string;
  commentCount?: number;
  likeCount?: number;
  shareCount?: number;
}
```

## Messaging

**`linkedin.getInbox(opts?: { createdBefore?: number }): Promise<LinkedInInboxResponse>`**
The viewer's conversations. LinkedIn pages by **timestamp**, not offset: pass the last page's `nextCreatedBefore` as `createdBefore` to get older ones. The result is trimmed to useful thread details plus a parsed preview of the latest message, not the raw Voyager payload.

```ts
interface LinkedInParticipant {
  profileUrn?: string;
  profileUrl?: string;
  fullName?: string;
  headline?: string;
  distance?: string;
  verified?: boolean;
  isSelf?: true;
}

type LinkedInMessageAttachmentKind =
  | 'audio'
  | 'conversation_ad'
  | 'external_media'
  | 'file'
  | 'forwarded_message'
  | 'image'
  | 'inmail'
  | 'message_ad'
  | 'replied_message'
  | 'unavailable'
  | 'video'
  | 'video_meeting';

interface LinkedInConversationMessagePreview {
  messageId?: string;
  sender?: LinkedInParticipant;
  subject?: string;
  text?: string;
  sentAt?: string;      // ISO time
  format?: string;
  attachmentKinds: LinkedInMessageAttachmentKind[];
}

interface LinkedInConversation {
  threadId?: string;        // stable tail such as "2-ABC=="
  url?: string;
  title?: string;
  conversationType?: string;
  categories: string[];
  isGroupChat?: boolean;
  isArchived?: boolean;
  createdAt?: string;       // ISO time
  lastReadAt?: string;      // ISO time
  lastActivityAt?: string;  // ISO time
  participants: LinkedInParticipant[]; // everyone except the viewer
  unreadCount?: number;
  read?: boolean;
  canReply: boolean;
  lastMessage?: LinkedInConversationMessagePreview;
}

interface LinkedInInboxResponse {
  nextCreatedBefore?: number; // pass as opts.createdBefore next time
  conversations: LinkedInConversation[];
}
```

**`linkedin.getConversation(threadIdOrConversationUrn: string, opts?: { createdBefore?: number }): Promise<LinkedInConversationResponse>`**
One thread's messages, newest first. Takes the inbox `threadId` or the full conversation URN, and pages by timestamp the same way.

```ts
interface LinkedInTextLink {
  url: string;
  text?: string;
}

interface LinkedInMessageAttachmentAction {
  label?: string;
  type: 'external_website' | 'human_handoff' | 'lead_gen' | 'not_interested';
  url?: string;
  leadGenFormUrn?: string;
}

interface LinkedInMessageAttachment {
  kind: LinkedInMessageAttachmentKind;
  title?: string;
  text?: string;
  url?: string;
  previewImageUrl?: string;
  mediaType?: string;
  sizeBytes?: number;
  assetUrn?: string;
  hostProfileUrn?: string;
  inmailType?: string;
  advertiserLabel?: string;
  campaignUrn?: string;
  status?: string;
  actions?: LinkedInMessageAttachmentAction[];
}

interface LinkedInMessage {
  messageId?: string;
  threadId?: string;
  sender?: LinkedInParticipant;
  subject?: string;
  text?: string;
  sentAt?: string;     // ISO time
  format?: string;
  links: LinkedInTextLink[];
  attachments: LinkedInMessageAttachment[];
}

interface LinkedInConversationResponse {
  messages: LinkedInMessage[];
  nextCreatedBefore?: number;
}
```

**`linkedin.sendMessage(opts: { threadId?: string; recipients?: string[]; text: string }): Promise<LinkedInSendMessageResult>`**
Sends a message. Give **either** `threadId` (reply in that thread) **or** `recipients` (public identifiers or profile URNs; this opens a new thread). You get back the id of the sent message and its thread.

**`linkedin.subscribeMessages(onMessage, opts?: { pollIntervalMs?: number }): Promise<void>`**
Watches every conversation for new messages and calls `onMessage(msg, conversation)` once per message, until the REPL run is aborted. It polls every 20 s by default; the minimum is 5 s, and shorter gaps get throttled quickly. Polling is the right approach here: LinkedIn's `realtime/connect` SSE endpoint needs session-bound headers that can't be rebuilt from cookies.

## Invitations

**`linkedin.sendInvitation(opts: { identifier: string; customMessage?: string }): Promise<object>`**
Sends a connection request. `identifier` is a public identifier (`johndoe`), a profile URL, or a `urn:li:fsd_profile:*` URN. `customMessage` is limited to **300 characters** and, since 2024, works only on **Premium**; on free accounts the note is silently dropped.

**`linkedin.getReceivedInvitations(opts?: { start?: number; count?: number }): Promise<LinkedInInvitationListResponse>`**
Pending invitations the viewer has received.

```ts
interface LinkedInInvitation {
  entityUrn?: string;
  invitationId?: string;
  sharedSecret?: string;    // needed to accept or ignore; pass it back unchanged
  type?: 'sent' | 'received';
  message?: string;
  sentAt?: number;
  counterpart: { profileUrn?: string; publicIdentifier?: string; firstName?: string; lastName?: string; headline?: string };
  raw: object;
}
```

**`linkedin.acceptInvitation(invitation: LinkedInInvitation | string, sharedSecret?: string): Promise<void>`**
Accepts one. Pass the object from `getReceivedInvitations` as is, since it carries the `sharedSecret`. If you pass a URN or id string instead, you **must** pass `sharedSecret` as the second argument.

**`linkedin.ignoreInvitation(invitation: LinkedInInvitation | string, sharedSecret?: string): Promise<void>`**
Declines one. Same arguments as `acceptInvitation`.

**`linkedin.withdrawInvitation(invitation: LinkedInInvitation | string): Promise<void>`**
Withdraws an invitation you sent, given its URN or id (take it from `sendInvitation`'s response). Voyager **can't list sent invitations**; if you need them, read `https://www.linkedin.com/mynetwork/invitation-manager/sent/` with the browser tools.

**`linkedin.invalidateCache(): void`** Clears the cached LinkedIn session cookies for this browser profile.

## Pages, if you need a tab

- Feed: `https://www.linkedin.com/feed`
- Messaging: `https://www.linkedin.com/messaging/`
- Search: `https://www.linkedin.com/search/results/${all|people|posts|companies|products|schools}/?keywords=${query}`
- Invitations: `https://www.linkedin.com/mynetwork/invitation-manager/`
- Notifications: `https://www.linkedin.com/notifications/?filter=all`
- Sales Navigator: home `https://www.linkedin.com/sales/home`, accounts `https://www.linkedin.com/sales/accounts/dashboard`, leads `https://www.linkedin.com/sales/lists/people`, inbox `https://www.linkedin.com/sales/inbox/`

## Automation limits: read this before any write

LinkedIn cracks down hard on automation. The `linkedin` global already spaces each account's requests at least ~1–1.75 s apart with jitter. That's enough for reading at a human pace, but it won't disguise bulk writing. The danger is more than a rate limit: keep pushing and the user's real account can get CAPTCHAs, temporary restrictions or a permanent ban.

### How risky each call is

**High: get the user's explicit go-ahead, then throttle hard.**
- `sendInvitation`. LinkedIn caps invitations at about **100 a week**, and an acceptance rate under ~20% brings restrictions faster. Default to **15 a day at most**, **2–5 minutes apart** with jitter.
- `sendMessage` to people the user has never messaged (cold outreach). Default to **20 a day at most**, **3–10 minutes apart**, and never the same text twice.
- `withdrawInvitation` in bulk. It looks like spam cleanup, and the same cap applies.

**Medium: fine at a human pace; throttle bulk jobs.**
- `sendMessage` replies in existing conversations: **50 a day at most**.
- `getProfile` and `searchPeople` at volume: **100 a day** on free accounts, **300** on Premium.
- `subscribeMessages` with `pollIntervalMs` under `10_000`.

**Low: normal use is fine.**
- `getMe`, `getInbox`, `getConversation`, `getReceivedInvitations`, `getCompany`, `getJob`, `getUserPosts`, `searchCompanies`.

### Defaults

| Call | Gap between calls | Per day (established account) | Per week |
|---|---|---|---|
| `sendInvitation` | 2–5 min | 15–25 | **80, hard stop** (LinkedIn's limit is 100) |
| `sendMessage`, cold | 3–10 min | 20–30 | — |
| `sendMessage`, reply | 1–3 min | 40–50 | — |
| `getProfile`, search | 5–15 s | 100–150 | — |
| `subscribeMessages` polling | **20 s or more** | — | — |

Halve those caps for accounts under 30 days old or idle for two weeks or more. A quiet account that suddenly bursts into activity is the strongest automation signal LinkedIn looks for. For brand-new accounts, use **zero**: let the user do a week of manual activity first.

### Warning signs

- **HTTP `429`**: back off exponentially (1, 2, 4, 8, 16 s; five retries at most), or wait as long as `Retry-After` says. After three 429s in a row, stop for 1–2 hours.
- **HTTP `999`**: LinkedIn's firewall has blocked the IP. Stop at once and wait at least 45 s.
- **HTTP `401` / `403`**: the session is gone. `linkedin.invalidateCache()` runs automatically, but the user has to sign in again before you retry.
- **An empty `200` with none of the expected data, or a redirect to `/checkpoint/...`**: LinkedIn is challenging the account. Pause every write for a day or two (24–48 hours).

### Never

- Send the same `sendMessage` text across a batch. LinkedIn checks messages for similarity; vary at least the greeting.
- Go past 100 invitations in a week, counting every session and tool.
- Run `sendInvitation` or bulk `sendMessage` when the user has just logged in on a new device or network. LinkedIn watches new sessions closely for hours.
- Open 100 or more profiles in under 30 minutes. That's the classic scraper pattern.
- Catch and ignore a `LinkedInVoyagerError` during writes. On 429, 999 or 403, stop the whole batch; don't move on to the next item.

### If unsure

For any loop with more than three writes (`sendInvitation`, cold `sendMessage`), show the user the full list and get their OK first, stay within the daily caps above, and report progress with `replPrint` so they can stop it.

## How to work

- After a fresh navigation, wait for the app shell before taking a snapshot.
- In the feed, scroll and `sleep` briefly to load more posts.
- Go straight to search, messaging, invitation and Sales Navigator URLs instead of starting from the feed.
- Get profile, search, company, job and post data from the `linkedin` global before resorting to scraping the page.
- Before any write (`sendMessage`, `sendInvitation`), follow the automation limits above.
