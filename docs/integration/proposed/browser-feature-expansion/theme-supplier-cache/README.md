# Preserve immutable theme keys across same-profile windows

This follow-on overlay applies after `frame-theme-completion` and changes only `aux_theme_editor.cc`.

The suspected two-decoration churn within one ordinary top-level web-app lookup is **not** the actual defect: `views::Widget::GetColorProviderKey()` already invokes virtual `GetCustomTheme()`, and ThemeService preserves that non-null app supplier before BrowserWidget selects it again. Both decorations therefore see the same underlying supplier.

There is a concrete cross-window defect. `BrowserWidget::GetCustomTheme()` returns `AppBrowserController::GetThemeSupplier()` for a web-app window; the latter returns its own `theme_pack_`. An ordinary browser window instead receives the profile ThemeService supplier (or null for device theme). The editor and its former one-slot cache belong to the profile. Alternating those windows' key lookups thus repeatedly allocates new wrappers and changes ColorProvider cache identity despite unchanged tokens and native suppliers.

The successor retains up to eight immutable wrappers per profile in least-recently-used order, keyed by the actual strongly retained underlying supplier and exact validated token dictionary. A cache hit returns the same wrapper identity. Misses create a new immutable wrapper and evict only the least recently used editor reference. ColorProviders holding an older wrapper remain valid through their existing references; no existing wrapper or token dictionary is mutated. The bound limits retained preview histories/theme suppliers. More than eight simultaneously interleaved distinct keys can still evict, an explicit bounded-memory tradeoff rather than an unbounded global cache.

No default theme, profile availability, policy/contrast handling, preview ownership, Apply/Cancel behavior or expiration logic changes. No registration, schema, preference or GN additions are required. All four source replacements are one-count pinned in `files.json`; `native.patch` is the integration input. Source generation checked those counts. No additional suite, build, app execution, native/root/stage mutation or runtime acceptance occurred.
