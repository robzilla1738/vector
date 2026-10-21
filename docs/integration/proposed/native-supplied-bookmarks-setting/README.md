# Connect supplied Bookmarks setting to the genuine sidebar owner

One counted one-file correction against actual native560. No UI/CSS/resources, schema, registration or GN changes.

The supplied1852 Appearance component calls getVerticalTabsBookmarksSectionEnabled/setVerticalTabsBookmarksSectionEnabled when native capabilities and vertical tab style admit it. Current AuxBrowserPreferences routes that pair to retired `aux.browser.sidebar_bookmarks`. Only the dormant independent AuxSidebarView observes that key. Consequently the setter returns success while the genuine mounted Bookmarks section and native tab representation remain unchanged.

Original supplied034e3f1c.c registers `aside.vertical_tabs.bookmarks_section_enabled`, boolean true, flags0. The source-derived real AuxBookmarksSection reads it at construction and observes it for actual visibility/cleanup/layout; AuxOrdinaryTabProjection also uses it for actual represented-bookmark tab eligibility. Point the existing genuine API pair at that exact already-registered source preference. Existing bool argument checks, actual profile scope and PrefService notifications remain unchanged.

Leave the legacy key's registration intact for recoverable independent code; do not register the original key a second time, rewrite stored owner choices, introduce a migration, or manipulate views from the extension API. Real owner observation performs the source behavior. Full original registration/default plus current owner/projection are pinned in evidence; field names remain original implementation identifiers, not branding text.

`python3 verify.py` checks the exact native560 baseline/output and single counted transformation, then replays the patch in temporary storage. No native writes/build, app/AI/credential/profile/Keychain/signing operations occurred. Integrator should verify Settings→actual sidebar changes and restores the pref after a disposable check. This fixes implementation wiring, not a claim of full task/model acceptance.
