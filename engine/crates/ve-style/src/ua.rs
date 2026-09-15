//! The user-agent stylesheet.
//!
//! A pragmatic subset of the HTML Standard's rendering section, restricted to
//! properties the engine implements. Values match the major engines so that
//! unstyled pages lay out familiarly.

/// The built-in user-agent stylesheet source.
pub const UA_STYLESHEET: &str = r#"
/* --- hidden elements ------------------------------------------------- */
[hidden], area, base, basefont, datalist, head, link, meta, noembed,
noframes, param, rp, script, style, template, title { display: none; }

/* --- the page -------------------------------------------------------- */
html, body { display: block; }
body { margin: 8px; }

/* --- flow content ---------------------------------------------------- */
address, blockquote, center, dialog, div, figure, figcaption, footer, form,
header, hr, legend, listing, main, p, plaintext, pre, search, xmp,
article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section,
dir, dd, dl, dt, menu, ol, ul, li, details, summary, fieldset, optgroup,
table, caption, colgroup, col, thead, tbody, tfoot, tr, td, th { display: block; }

blockquote, figure, listing, p, plaintext, pre, xmp { margin-top: 1em; margin-bottom: 1em; }
blockquote, figure { margin-left: 40px; margin-right: 40px; }
address { font-style: italic; }
listing, plaintext, pre, xmp { font-family: monospace; white-space: pre; }
dialog:not([open]) { display: none; }
hr { color: gray; border: 1px inset; margin: 0.5em auto; }

h1 { font-size: 2.00em; margin-top: 0.67em; margin-bottom: 0.67em; font-weight: bold; }
h2 { font-size: 1.50em; margin-top: 0.83em; margin-bottom: 0.83em; font-weight: bold; }
h3 { font-size: 1.17em; margin-top: 1.00em; margin-bottom: 1.00em; font-weight: bold; }
h4 { font-size: 1.00em; margin-top: 1.33em; margin-bottom: 1.33em; font-weight: bold; }
h5 { font-size: 0.83em; margin-top: 1.67em; margin-bottom: 1.67em; font-weight: bold; }
h6 { font-size: 0.67em; margin-top: 2.33em; margin-bottom: 2.33em; font-weight: bold; }

/* --- lists ----------------------------------------------------------- */
dir, dd, dl, dt, menu, ol, ul { }
dir, dl, menu, ol, ul { margin-top: 1em; margin-bottom: 1em; }
dir, menu, ol, ul { padding-left: 40px; }
dd { margin-left: 40px; }
li { display: list-item; }

/* --- tables (block fallback until a table formatter exists) ---------- */
table { box-sizing: border-box; }
td, th { padding: 1px; }
th { font-weight: bold; text-align: center; }
caption { text-align: center; }

/* --- phrasing content ------------------------------------------------ */
b, strong { font-weight: bolder; }
i, cite, em, var, dfn { font-style: italic; }
code, kbd, samp, tt { font-family: monospace; }
u, ins { text-decoration: underline; }
s, strike, del { text-decoration: line-through; }
big { font-size: larger; }
small { font-size: smaller; }
sub, sup { font-size: smaller; line-height: normal; }
mark { background-color: yellow; color: black; }
abbr[title], acronym[title] { text-decoration: underline; }
a:any-link { color: rgb(0, 0, 238); text-decoration: underline; }
br { display: inline; }

/* --- embedded content ------------------------------------------------ */
img, video, audio, canvas, iframe, embed, object, svg { display: inline-block; }
iframe { border: 2px inset; }
video { object-fit: contain; }

/* --- forms ----------------------------------------------------------- */
input, select, button, textarea, meter, progress {
  display: inline-block;
  font-family: sans-serif;
  font-size: 13.333px;
  line-height: normal;
  color: fieldtext;
  background-color: field;
  border: 2px inset;
  padding: 1px 2px;
  box-sizing: border-box;
  white-space: nowrap;
}
input[type=hidden] { display: none; }
input[type=checkbox], input[type=radio] { width: 13px; height: 13px; padding: 0; border: 0; background-color: transparent; }
input[type=button], input[type=submit], input[type=reset], button {
  background-color: buttonface;
  color: buttontext;
  border: 2px outset;
  padding: 1px 6px;
  text-align: center;
}
button { display: inline-block; }
textarea { white-space: pre-wrap; display: inline-block; }
select { padding: 0; }
option { display: block; padding: 0 2px; }
fieldset { margin-left: 2px; margin-right: 2px; border: 2px groove; padding: 0.35em 0.75em 0.625em; }
legend { padding-left: 2px; padding-right: 2px; }
label { display: inline; }
:disabled { color: graytext; }
::placeholder { color: graytext; }

/* --- interactive ----------------------------------------------------- */
details > summary { display: block; }
details:not([open]) > :not(summary) { display: none; }
"#;
