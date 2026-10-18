import { expect, it } from "vitest";
import { GoogleArguments, googleOperationAvailable, GoogleToolInputSchema } from "@aux/contracts/google";
import { prepareGoogleRequest } from "../../apps/runtime/src/services/google-rest.js";
const action = "81decc23-b685-4b8f-8666-ef348537ae95";
it("seals paginated YouTube search filters without treating relevance language as a result restriction", () => {
  const request = prepareGoogleRequest(
    "youtube.search",
    {
      query: "Aux browser | AI",
      limit: 12,
      pageToken: "next+page=",
      channelId: "UCabcdefghijklmnopqrstuv",
      publishedAfter: "2026-01-01T00:00:00Z",
      publishedBefore: "2026-10-17T00:00:00Z",
      relevanceLanguage: "zh-Hans",
      regionCode: "US",
      order: "date",
      safeSearch: "strict",
    },
    action,
  );
  const url = new URL(request.url);
  expect(request).toMatchObject({
    effect: "read",
    method: "GET",
    objectId: "search:Aux browser | AI",
    limitBytes: 1_000_000,
  });
  expect(url.origin + url.pathname).toBe("https://www.googleapis.com/youtube/v3/search");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    part: "snippet",
    type: "video",
    q: "Aux browser | AI",
    channelId: "UCabcdefghijklmnopqrstuv",
    publishedAfter: "2026-01-01T00:00:00Z",
    publishedBefore: "2026-10-17T00:00:00Z",
    relevanceLanguage: "zh-Hans",
    regionCode: "US",
    order: "date",
    safeSearch: "strict",
    maxResults: "12",
    pageToken: "next+page=",
  });
  expect(request.body).toBeUndefined();
});
it("bounds batch metadata and reads comment threads and replies as separate cursor pages", () => {
  const video = prepareGoogleRequest(
    "youtube.videos",
    { videoIds: ["abcdefghijk", "ABCDEFGHIJK"], language: "fr" },
    action,
  );
  expect(new URL(video.url).searchParams.get("id")).toBe("abcdefghijk,ABCDEFGHIJK");
  expect(new URL(video.url).searchParams.get("hl")).toBe("fr");
  const threads = prepareGoogleRequest(
    "youtube.comments",
    { videoId: "abcdefghijk", limit: 50, pageToken: "thread-page" },
    action,
  );
  expect(new URL(threads.url).pathname).toBe("/youtube/v3/commentThreads");
  expect(new URL(threads.url).searchParams.get("textFormat")).toBe("plainText");
  expect(new URL(threads.url).searchParams.get("part")).toBe("snippet");
  const replies = prepareGoogleRequest(
    "youtube.replies",
    { parentId: "Ugx.parent-1", limit: 100, pageToken: "reply-page" },
    action,
  );
  expect(new URL(replies.url).pathname).toBe("/youtube/v3/comments");
  expect(new URL(replies.url).searchParams.get("parentId")).toBe("Ugx.parent-1");
  expect(new URL(replies.url).searchParams.get("pageToken")).toBe("reply-page");
});
it("requires a separate YouTube scope and never infers it from Calendar, Gmail or Docs", () => {
  const scope = "https://www.googleapis.com/auth/";
  for (const operation of [
    "youtube.search",
    "youtube.videos",
    "youtube.comments",
    "youtube.replies",
  ] as const) {
    expect(
      googleOperationAvailable(
        [scope + "calendar.readonly", scope + "gmail.readonly", scope + "documents"],
        operation,
      ),
    ).toBe(false);
    expect(googleOperationAvailable([scope + "youtube.readonly"], operation)).toBe(true);
  }
  expect(
    GoogleToolInputSchema.safeParse({ grantId: action, operation: "youtube.search", args: { query: "Aux" } })
      .success,
  ).toBe(true);
});
it("refuses unknown parameters, malformed identities, oversized batches and inverted date filters", () => {
  for (const input of [
    { query: "x", url: "https://other.test" },
    { query: "x", limit: 51 },
    { query: "x", publishedAfter: "2026-10-17T00:00:00Z", publishedBefore: "2026-01-01T00:00:00Z" },
  ])
    expect(GoogleArguments["youtube.search"].safeParse(input).success).toBe(false);
  expect(
    GoogleArguments["youtube.videos"].safeParse({ videoIds: Array(51).fill("abcdefghijk") }).success,
  ).toBe(false);
  expect(GoogleArguments["youtube.replies"].safeParse({ parentId: "../other" }).success).toBe(false);
  expect(
    GoogleToolInputSchema.safeParse({
      grantId: action,
      operation: "youtube.captions.download",
      args: { videoId: "abcdefghijk" },
    }).success,
  ).toBe(false);
});
