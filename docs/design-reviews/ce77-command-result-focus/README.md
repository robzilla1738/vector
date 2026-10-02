# Command result click focus preservation

A primary mouse press on a command result now preserves the editing combobox focus through its click. CommandBar closes editing after blur when focus leaves its wrapper; the result previously allowed the browser default focus change before selection. This matches the existing site-trigger mouse-down behavior and keeps keyboard focus under the command controller. Secondary presses are untouched.

The CE command journey passed its first five steps, then its AX click on the open Red tab result did not activate Red. This source change addresses the supported blur-before-click race; it does not establish the native failure cause or closure. Original native activation and unchanged page-count assertions must be rerun without weakening them.

Four focused SearchResultRow DOM tests pass, including primary focus preservation, no early selection, one selection on click, unchanged causal witness attributes, secondary press behavior, and existing caption/highlighting checks. No native app/helper/build execution occurred.
