---
name: image-search
description: Use when you need to search images
icon: "/builtin-skills/v1/image-search.jpg"
autoInject:
  keywords: ["image search", "images", "photo search", "google images", "thumbnail"]
---

# Image search

The `imageSearch` global in the REPL loads Google Images using the cookies in the browser profile, pulls the result details out of the HTML, and returns compact JSON. You don't need to read the page yourself.

```js
const results = await imageSearch.search('max verstappen', { limit: 10 });
console.log(JSON.stringify(results, null, 2));
// -> [{ title, sourceName, pageUrl, imageUrl, thumbnailUrl, width, height, dominantColor, licensable }]
```

## `imageSearch.search(query: string, opts?: ImageSearchOptions): Promise<ImageSearchResult[]>`

- `imageUrl` is the original image, when Google reveals it. `thumbnailUrl` is Google's cached thumbnail.
- Google's license hints aren't legal advice. Check the source before reusing an image.
- If the helper fails, browse the Google Images page directly.

```ts
interface ImageSearchOptions {
  limit?: number; // most results to return; 20 by default
  safeSearch?: 'active' | 'off';
  size?: 'large' | 'medium' | 'icon';
  color?: 'black' | 'blue' | 'brown' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'transparent' | 'white' | 'yellow';
  type?: 'animated' | 'clipart' | 'lineart';
  license?: 'creativeCommons' | 'commercial';
  time?: 'day' | 'week' | 'month' | 'year';
}

interface ImageSearchResult {
  /** Title of the image or result, from Google or the source page. */
  title: string;
  /** Site or publisher, when known. */
  sourceName?: string;
  /** The page the image appears on. Open it for context or credit. */
  pageUrl: string;
  /** Best guess at the original image file. Use this when you need the image itself. */
  imageUrl?: string;
  /** Google's thumbnail. Good for a quick look when imageUrl is missing or very large. */
  thumbnailUrl?: string;
  /** Original width in px, when known. */
  width?: number;
  /** Original height in px, when known. */
  height?: number;
  /** Google's main-color guess, e.g. `rgb(192,198,224)`. Handy as a placeholder color. */
  dominantColor?: string;
  /** True when Google marks it licensable or it came from a license-filtered search. */
  licensable?: boolean;
}
```
