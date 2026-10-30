---
name: youtube
description: Use this skill when you need to search YouTube, read video transcripts, or inspect comments without opening YouTube manually.
icon: "https://app.getaux.co/builtin-skills/v1/youtube.jpg"
autoInject:
  keywords: ["youtube", "video transcript", "youtube comments", "youtube search"]
---

# YouTube

The `youtube` global in the REPL calls YouTube's HTTP endpoints directly and returns compact JSON. No need to read YouTube's page.

```js
const search = await youtube.search('OpenAI DevDay 2025', { limit: 5 });
const videoId = search[0].videoId;

const [metadata, transcript, comments] = await Promise.all([
  youtube.getMetadata(videoId),
  youtube.getTranscript(videoId),
  youtube.getComments(videoId, { limit: 20 }),
]);
```

Anywhere a method takes `videoIdOrUrl`, you can pass a bare video id or any YouTube link: a normal watch URL, Shorts, live, embed or `youtu.be`.

## Methods

**`youtube.search(query: string, opts?: YouTubeSearchOptions): Promise<YouTubeVideoSummary[]>`**
Finds videos. `opts.limit` (10 by default), `opts.lang` for the YouTube UI language (`'en'`), `opts.region` (`'US'`).

**`youtube.getMetadata(videoIdOrUrl: string, opts?: YouTubeMetadataOptions): Promise<YouTubeVideoMetadata>`**
Title, channel, thumbnail, length, views, description, publish date and whether it's live content.

**`youtube.listTranscriptLanguages(videoIdOrUrl: string): Promise<YouTubeTranscriptLanguage[]>`**
The caption tracks a video has.

**`youtube.getTranscript(videoIdOrUrl: string, opts?: { lang?: string; includeTimestamp?: boolean }): Promise<string>`**
The transcript. Without `lang` you get the video's default caption track; pass a code such as `'en'` or `'ko'` for a specific one. It comes back as plain, sentence-like text, or with `includeTimestamp: true` as one line per segment, like `[00:00 - 00:04] text`.

**`youtube.getComments(videoIdOrUrl: string, opts?: YouTubeCommentsOptions): Promise<YouTubeCommentsResponse>`**
Top-level comments. `opts.limit` (20 by default), `opts.continuation` (the last response's `continuation`, for the next page), `opts.lang` (`'en'`), `opts.region` (`'US'`).

## Types

```ts
interface YouTubeVideoSummary {
  /** Video id, like "hS1YqcewH0c". */
  videoId: string;
  /** Watch URL, like "https://www.youtube.com/watch?v=hS1YqcewH0c". */
  url: string;
  title: string;
  /** Channel name, when YouTube includes it. */
  channelName?: string;
  /** The largest thumbnail, for previews. */
  thumbnailUrl?: string;
}

interface YouTubeVideoMetadata extends YouTubeVideoSummary {
  /** Length in seconds, when known. */
  durationSeconds?: number;
  /** View count as a number, when known. */
  viewCount?: number;
  /** The full description, when known. */
  description?: string;
  /** Publish date as YYYY-MM-DD, like "2025-10-06". */
  publishDate?: string;
  /** True for live videos and finished livestreams flagged as live content. */
  isLiveContent?: boolean;
}

interface YouTubeCommentsResponse {
  /** The video the comments belong to. */
  videoId: string;
  comments: Array<{
    /** Link straight to the comment, when YouTube gives its id. */
    url?: string;
    /** Commenter's display name. */
    authorName: string;
    /** Commenter's channel, like "https://www.youtube.com/@OpenAI". */
    authorUrl?: string;
    /** The comment as plain text. */
    text: string;
    /** YouTube's relative time, like "2 months ago". */
    publishedAtText?: string;
    /** Like count as YouTube shows it, like "1.2K". */
    likeCountText?: string;
    /** Reply count as YouTube shows it, like "12 replies". */
    replyCountText?: string;
  }>;
  /** True when there's another page. */
  hasMore: boolean;
  /** Pass as opts.continuation to get the next page. */
  continuation?: string;
}
```
