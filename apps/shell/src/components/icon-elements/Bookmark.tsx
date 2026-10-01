import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const Bookmark = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M19.25 20.2515V4.75C19.25 3.64543 18.3546 2.75 17.25 2.75H6.75C5.64543 2.75 4.75 3.64543 4.75 4.75V20.2515C4.75 21.0522 5.64414 21.5281 6.30839 21.081L10.8832 18.0017C11.5584 17.5473 12.4416 17.5473 13.1168 18.0017L17.6916 21.081C18.3559 21.5282 19.25 21.0522 19.25 20.2515Z" {...roundJoinedStrokeProps}/></svg>);

export const shellIconBookmark = /* @__PURE__ */ icon(Bookmark);
export const shellIconBookmarkFill = /* @__PURE__ */ icon(Bookmark, "md", "currentColor");
export const shellIconBookmarkSm = /* @__PURE__ */ icon(Bookmark, "sm");
