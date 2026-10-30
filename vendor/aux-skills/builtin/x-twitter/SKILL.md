---
name: x-twitter
description: Read this skill when you need to use X (Twitter). Don't have to open a browser tab.
icon: "https://app.getaux.co/builtin-skills/v1/x-twitter.svg"
autoInject:
  keywords: ["twitter", "tweet", "x.com"]
  url: ["x.com", "twitter.com"]
---

# X (Twitter)

The `twitter` global in the REPL drives X through an API-style interface. No tab needed.

## At a glance

```js
// Signed in as whom?
const me = await twitter.getMe();
console.log(me); // -> { id, screenName, name, description, followersCount, ... }

// Following timeline, newest first
const timeline = await twitter.getTimeline({ count: 20 });
console.log(timeline.tweets.map(t => `@${t.author.screenName}: ${t.text.slice(0, 80)}`));

// Search
const results = await twitter.search('AI agents', { count: 20, product: 'Latest' });
console.log(results.tweets);

// One post, or the author's visible thread from it
const tweet = await twitter.getTweet('1234567890');
const thread = await twitter.getTweetThread('1234567890');
console.log(thread.tweets);

// A profile
const user = await twitter.getUser('steipete');

// Post and reply
const posted = await twitter.tweet('Hello from Aux!');
const reply = await twitter.reply('1234567890', 'Great thread!');

// Like, repost, bookmark
await twitter.like('1234567890');
await twitter.retweet('1234567890');
await twitter.bookmark('1234567890');

// Follow and unfollow take a user id, not a handle
await twitter.follow('123456');
await twitter.unfollow('123456');

// DMs
const inbox = await twitter.getDmInbox();
const history = await twitter.getDmConversation('123-456');
await twitter.sendDm('123456', 'Hello!');

// Block, mute
await twitter.block('123456');
await twitter.mute('123456');

// Notifications
const notifs = await twitter.getNotifications({ count: 10 });
console.log(notifs.notifications);
```

## Reading

| Method | Returns |
| --- | --- |
| `getMe(): Promise<XUser>` | The signed-in user's profile. |
| `getUser(screenName: string): Promise<XUser>` | A profile by handle, without the @. |
| `getTweet(tweetId: string): Promise<XTweet>` | One post by id. |
| `getTweetThread(tweetId: string): Promise<XTimelineResponse>` | The post plus the same author's visible replies below it. Use it when the user asks what the X post or thread they're on is about. |
| `getTimeline(opts?): Promise<XTimelineResponse>` | The Following timeline, newest first. `opts.count` (20 by default), `opts.cursor` (the last response's `nextCursor`). |
| `search(query: string, opts?): Promise<XTimelineResponse>` | Posts matching `query`, which understands X operators such as `from:user`, `to:user`, `since:2026-01-01`. `opts.count` (20), `opts.product` (`'Latest'` by default, or `'Top'`, `'People'`, `'Photos'`, `'Videos'`), `opts.cursor`. |
| `getUserTweets(screenName: string, opts?): Promise<XTimelineResponse>` | A user's posts. `opts.count` (20), `opts.cursor`. |
| `getBookmarks(opts?): Promise<XTimelineResponse>` | The user's bookmarks. |
| `getNotifications(opts?): Promise<{ notifications: XNotification[]; nextCursor?: string }>` | Recent notifications. `opts.count` (20), `opts.cursor`. |
| `getDmInbox(): Promise<XDmInbox>` | DM conversations with a preview of the last message. |
| `getDmConversation(conversationId: string, opts?): Promise<XDmHistory>` | The messages in one DM conversation. Ids look like `"{lowerUserId}-{higherUserId}"`. `opts.maxId` pages to older messages (from `nextCursor`). |

## Acting

| Method | Does |
| --- | --- |
| `tweet(text: string, opts?): Promise<XTweet>` | Posts and returns the new post. `opts.mediaIds` attaches uploaded media. |
| `reply(tweetId: string, text: string, opts?): Promise<XTweet>` | Replies and returns the reply. |
| `deleteTweet(tweetId: string): Promise<void>` | Deletes a post. |
| `like` / `unlike(tweetId: string): Promise<void>` | Likes or unlikes. |
| `retweet` / `unretweet(tweetId: string): Promise<void>` | Reposts or undoes it. |
| `bookmark` / `unbookmark(tweetId: string): Promise<void>` | Bookmarks or removes the bookmark. |
| `follow` / `unfollow(userId: string): Promise<void>` | By user id; get it from `twitter.getUser(screenName).id`. |
| `sendDm(userId: string, text: string, opts?): Promise<any>` | DMs a user by id; the conversation id is worked out for you. `opts.mediaId` attaches uploaded media, `opts.replyToId` replies to a particular message. |
| `block` / `unblock(userId: string): Promise<void>` | Blocks or unblocks. |
| `mute` / `unmute(userId: string): Promise<void>` | Mutes or unmutes. |

## Types

```ts
interface XUser {
  id: string;
  screenName: string;
  name: string;
  description: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  profileImageUrl: string;
  isBlueVerified: boolean;
}

interface XTweet {
  id: string;
  text: string;
  author: XUser;
  createdAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  bookmarks: number;
  views: number;
  media: XMedia[];
  inReplyToId?: string;
  quotedTweet?: XTweet;
}

interface XMedia {
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  width: number;
  height: number;
}

interface XTimelineResponse {
  tweets: XTweet[];
  nextCursor?: string; // pass back as opts.cursor for the next page
}

interface XDmMessage {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
  mediaUrl?: string;
}

interface XDmConversation {
  conversationId: string;
  participants: string[]; // user ids
  lastMessage?: XDmMessage;
}

interface XDmInbox { conversations: XDmConversation[] }
interface XDmHistory { messages: XDmMessage[]; nextCursor?: string }

interface XNotification {
  id: string;
  type: string;
  timestamp: Date;
  message: string;
  raw: any;
}
```
