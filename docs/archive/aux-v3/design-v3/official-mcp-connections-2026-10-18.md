# Official Notion and Slack MCP connections

This source slice uses Aux's existing outbound MCP client, native Profile credential storage, governed tool dispatch and durable effect receipts. It adds no second account, transport or agent stack. Provider account identity is reported only if the exact discovered token endpoint supplies the documented fields. Unsupported or missing identity/scopes remain unknown.

## Evidence and setup

Verified against official documentation and public metadata on 2026-10-18:

- [Notion client setup](https://developers.notion.com/guides/mcp/build-mcp-client): `https://mcp.notion.com/mcp`, native S256 PKCE and dynamic client registration. Aux requests ordinary `default` access; it does not request enterprise issuer-management privileges. The SDK strips extension fields, so Aux captures only documented user/workspace identity from the bound token response before passing the unchanged response to the SDK.
- [Notion authorization metadata](https://mcp.notion.com/.well-known/oauth-authorization-server): advertises registration, `none`/`client_secret_basic`/`client_secret_post` and S256. This is discovery evidence, not a configured owner account.
- [Notion supported tools](https://developers.notion.com/guides/mcp/mcp-supported-tools): actual tool discovery determines availability. Workspace permissions, plan restrictions and returned notices remain in the bounded original tool response. Exact documented read/write names form a conservative presentation classification; unknown or conflicting effects remain unknown. Dispatch still uses Aux's governed external-action path.
- [Slack MCP setup](https://docs.slack.dev/ai/slack-mcp-server/): `https://mcp.slack.com/mcp`, eligible internal or Marketplace app required; unlisted apps and dynamic registration unsupported. This account connection is separate from Aux's Slack bot/channel transport.
- [Slack authorization metadata](https://mcp.slack.com/.well-known/oauth-authorization-server) and [resource metadata](https://mcp.slack.com/.well-known/oauth-protected-resource): observed `client_secret_post` only, S256 and no registration endpoint. These actual MCP requirements override assumptions from Slack's [general public-client PKCE guide](https://docs.slack.dev/authentication/using-pkce/). Aux refuses sign-in until an actual registered client, secret, exact loopback callback and explicitly selected supported user scopes are saved in the Profile credential bridge. App eligibility and scope approval remain Slack's decision.
- [Slack user token response](https://docs.slack.dev/reference/methods/oauth.v2.user.access/): account identity comes from `authed_user.id` and `team.id`; granted scopes may be nested under `authed_user.scope`. Aux does not decode an unverified ID token or assume a bot identity.

Supported, requested and granted scopes are separate. Supported scopes are discovery metadata; requested scopes are owner setup; granted scopes are token response evidence. Missing granted scope data does not imply full access. Refresh retains original reported identity/scopes when the provider omits them, and refuses a changed known user/workspace.

## Authority and failure behavior

- Secrets, refresh tokens and registered client information stay in native credential storage. Renderer metadata contains only bounded scope/identity projections.
- Each live transport is bound to its original OAuth generation. Reconnect, replacement or disconnect retires it. A retired callback cannot close a newer authorization attempt or restore retired credentials.
- Credential configure/start/clear also increments the server's durable tool authority revision. Capture-time connector binding must compare this revision plus the original source digest; reauthorization is not permission for an older captured account mention.
- Catalog revisions bind the complete bounded name/schema/description/annotations/effect projection, ignoring the enabled presentation flag. A same-name changed schema or effect invalidates old reviews. Source digests continue to bind the exact endpoint.
- No automatic replay follows uncertain tool writes, token scope errors or cancellation. Server tool hints alone never establish read authority. Slack names without verified operation evidence remain unknown.

## Fixture evidence and limits

Focused tests exercise the actual installed MCP SDK against synthetic OAuth/discovery/registration/token responses, both official routes, scope/secret refusal, account identity, refresh omission, disconnect generations and retired callbacks. Other fixtures verify same-name catalog changes, persisted authority retirement, bounded structured notices and the original uncertain-send/cancellation protections. Renderer tests cover registration explanation and secret/scope gating.

No owner credentials, live registration, workspace contents or third-party messages were used. These fixtures prove adapter and ownership behavior; live availability still requires the owner's actual registered apps, permissions and provider access. Native build, daily-use acceptance and live integration verification are separate program evidence.
