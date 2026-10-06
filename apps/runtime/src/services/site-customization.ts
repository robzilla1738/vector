import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  AuxError,
  SiteCssSchema,
  SiteOriginSchema,
  ZapRuleSchema,
  ZapSelectorSchema,
  type SiteCss,
  type ZapRule,
} from "@aux/contracts";

type RuleRow = { rule_id: string; origin: string; selector: string; match_count: number; created_at: number };
type CssRow = { origin: string; css: string; updated_at: number };

export class SiteCustomization {
  constructor(
    private readonly db: DatabaseSync,
    private readonly profileId: string,
    private readonly now = Date.now,
  ) {
    if (!profileId)
      throw new AuxError("invalid_params", "Page customization requires a browser Profile identity.");
  }

  list(origin: string): ZapRule[] {
    const site = SiteOriginSchema.parse(origin);
    const rows = this.db
      .prepare(
        `SELECT rule_id,origin,selector,match_count,created_at FROM site_zap_rules
      WHERE profile_id=? AND origin=? ORDER BY created_at DESC,rule_id DESC`,
      )
      .all(this.profileId, site) as RuleRow[];
    return rows.map((row) =>
      ZapRuleSchema.parse({
        ruleId: row.rule_id,
        origin: row.origin,
        selector: row.selector,
        matchCount: row.match_count,
        createdAt: row.created_at,
      }),
    );
  }

  add(origin: string, selector: string, matchCount: number): ZapRule {
    const site = SiteOriginSchema.parse(origin);
    const safeSelector = ZapSelectorSchema.parse(selector);
    if (!Number.isInteger(matchCount) || matchCount < 1 || matchCount > 100)
      throw new AuxError("invalid_params", "Zap must match between 1 and 100 elements.");
    const existing = this.db
      .prepare(
        `SELECT rule_id,origin,selector,match_count,created_at FROM site_zap_rules
      WHERE profile_id=? AND origin=? AND selector=?`,
      )
      .get(this.profileId, site, safeSelector) as RuleRow | undefined;
    if (existing)
      return ZapRuleSchema.parse({
        ruleId: existing.rule_id,
        origin: existing.origin,
        selector: existing.selector,
        matchCount: existing.match_count,
        createdAt: existing.created_at,
      });
    if (this.list(site).length >= 200)
      throw new AuxError("invalid_params", "This site has reached the 200-rule Zap limit.");
    const rule = ZapRuleSchema.parse({
      ruleId: randomUUID(),
      origin: site,
      selector: safeSelector,
      matchCount,
      createdAt: this.now(),
    });
    this.db
      .prepare(
        `INSERT INTO site_zap_rules(rule_id,profile_id,origin,selector,match_count,created_at)
      VALUES(?,?,?,?,?,?)`,
      )
      .run(rule.ruleId, this.profileId, site, safeSelector, matchCount, rule.createdAt);
    return rule;
  }

  remove(ruleId: string): boolean {
    return (
      this.db
        .prepare("DELETE FROM site_zap_rules WHERE rule_id=? AND profile_id=?")
        .run(ruleId, this.profileId).changes > 0
    );
  }

  getCss(origin: string): SiteCss {
    const site = SiteOriginSchema.parse(origin);
    const row = this.db
      .prepare("SELECT origin,css,updated_at FROM site_user_css WHERE profile_id=? AND origin=?")
      .get(this.profileId, site) as CssRow | undefined;
    return SiteCssSchema.parse({ origin: site, css: row?.css ?? "", updatedAt: row?.updated_at ?? null });
  }

  setCss(origin: string, css: string): SiteCss {
    const value = SiteCssSchema.parse({ origin, css, updatedAt: this.now() });
    if (!value.css.trim()) {
      this.db
        .prepare("DELETE FROM site_user_css WHERE profile_id=? AND origin=?")
        .run(this.profileId, value.origin);
      return { origin: value.origin, css: "", updatedAt: null };
    }
    this.db
      .prepare(
        `INSERT INTO site_user_css(profile_id,origin,css,updated_at) VALUES(?,?,?,?)
      ON CONFLICT(profile_id,origin) DO UPDATE SET css=excluded.css,updated_at=excluded.updated_at`,
      )
      .run(this.profileId, value.origin, value.css, value.updatedAt);
    return value;
  }

  effectiveCss(origin: string): string {
    const site = SiteOriginSchema.parse(origin);
    const rules = this.list(site);
    const hidden = rules.map((rule) => `${rule.selector} { display: none !important; }`).join("\n");
    return [hidden, this.getCss(site).css].filter(Boolean).join("\n");
  }
}
