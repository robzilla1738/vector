# Dedicated capture-role grant proposal

**Default proposal: explicit new permissions cover SELECT-only persistent application data, while existing inherited PUBLIC TEMPORARY and PUBLIC routine EXECUTE remain effective authority.** It preserves current shared privileges, adds no broad revoke, and does not claim to be a role incapable of creating temporary objects or calling functions. This fact belongs prominently in the final combined ops activation review for the owner's later exact approval; it does not create a separate preliminary question or prevent preparing that combined packet.

Preparation only. No database/browser/resource operation, credential read, role creation, grant, revoke, authentication change or backup was performed by this worker. Root observed the catalog in its authorized read-only review and finished with successful ROLLBACK. Neither SQL variant has been executed or database-parsed; source inspection only.

## Pinned observed target

Root's initially uncommitted integrator/backup-catalog-observed-a1.json was refreshed before use. observed-catalog-source.json retains that exact metadata, SHA256 **7de928db7f0b82f1c0c25490f62877c5cb829bdc836d7ef43e9e5b32495c3d91**. observed-facts.json attributes the observation to root, not to this worktree. Target: project ancient-river-76453764, Production branch br-red-hall-b857cl2i, direct endpoint ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech, database **neondb**, PostgreSQL **18.6 /180006**. SQL's current_database() cannot independently prove the provider branch/endpoint.

Observed metadata covers30 ordinary persistent public tables, all owned by neondb_owner;0 sequences, RLS/forced-RLS tables/policies, large objects, non-public application relations, cross-schema partition links, extension configuration relations and column ACLs. All251 object ACL rows and80 routine ACL rows were captured. Extensions: pgcrypto1.4/public and plpgsql1.0/pg_catalog. This supports an exact current-table proposal for the existing **whole-current-database** pg_dump. It does not authorize filtering the dump to public, using row-security-filtered output or ignoring future coverage changes.

neondb_owner is unsuitable for runner custody: it has BYPASSRLS and membership in neon_superuser, whose graph includes broad read/write/admin authority. No such role, membership, database-wide read role or restore credential is proposed for the runner.

## Default concrete SQL

**proposed-capture-grants.sql** stages new aux_backup_capture as NOLOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION and NOBYPASSRLS, with no upstream role membership or owned objects. It grants CONNECT on neondb, public USAGE, and SELECT on the exact30 named tables. No grant option, schema/database CREATE, persistent table mutation, sequence USAGE/UPDATE or new routine EXECUTE is granted. There are0 current sequences; a future sequence needs an exact SELECT grant through its migration review.

Its precondition asserts the exact observed PUBLIC database privileges CONNECT+TEMPORARY without grant option and refuses drift, including CREATE. It does **not** remove TEMP or pretend NOINHERIT removes PUBLIC. Postconditions check effective CREATE remains absent, inherited TEMP remains present, persistent application mutation privileges remain absent, and the new role has no unexpected membership/ownership. It also checks current table/owner/RLS/full-database scope and dangerous PUBLIC security-definer execution before granting. No shared ACL is changed.

Two connections fit the current held exported-snapshot connection plus a single nonparallel pg_dump. default_transaction_read_only=on is an operational precaution, not an ACL restriction: a client can override it. NOLOGIN staging and no password clause mean no credential is generated, set, cleared or exposed, and no usable runner authentication is configured. A protected login/custody/cutoff step belongs in the later combined activation packet. “Password-free proposal” does not mean passwordless authentication has been implemented.

The artifact ends with ROLLBACK by default. Exact persistence and authentication remain part of the combined approval/execution review; there is no automatic activation switch. A fresh role name collision or changed catalog requires an updated packet, not reinterpretation of an existing role.

## Shared PUBLIC privileges: preserve and disclose

The database grants PUBLIC CONNECT and TEMPORARY. The public schema grants PUBLIC USAGE and no CREATE. PostgreSQL's authority is additive across direct grants, memberships and PUBLIC; a per-role REVOKE cannot subtract PUBLIC TEMP, and NOINHERIT does not change that. See the official [GRANT reference](https://www.postgresql.org/docs/18/sql-grant.html).

The access-review instruction says not to **grant** temporary privileges by assumption. It did not mandate removing already inherited PUBLIC TEMP, and the user did not request a no-temp policy. The initial strict no-temp reading was a prior preparation preference. **proposed-capture-grants-strict-optional.sql** is retained only as a historical optional stricter variant; it is not the default, not a newly required owner gate and not an activation prerequisite.

If a future owner direction specifically chooses to remove PUBLIC TEMP, the shared database impact must be reviewed then. REVOKE TEMPORARY ON DATABASE neondb FROM PUBLIC would affect every current/future login that depends on that inherited right; existing explicit TEMP grants to neondb_owner/neon_superuser remain visible, but catalog metadata does not prove all application/operator reliance. No such revoke or replacement grant is included in either proposal. The default combined review simply states inherited TEMP clearly and preserves the current shared policy.

## PUBLIC routine execution and future schema

All40 distinct public routines allow PUBLIC EXECUTE; all observed prosecdef flags are false (security invoker). This includes pgcrypto routines and aux_apply_sync_recovery_v2, aux_refresh_wallet and aux_refund_credits. Bodies were not read; metadata does not prove behavior. Security invoker normally uses the caller's table privileges, so EXECUTE alone does not confer the owner's table-write rights. Nevertheless, function invocation is real effective authority. The combined review must not describe the role's complete authority as literally only CONNECT/USAGE/SELECT. A new PUBLIC-executable security-definer routine triggers a fresh precise review; no blanket function revoke is proposed because it could break the app.

Observed default ACL entries belong to cloud_admin and grant neon_superuser rights, not the proposed capture role. Current ownership does not establish every future migration creator. No ALTER DEFAULT PRIVILEGES is included. Each migration must extend the exact capture SELECT coverage and recheck RLS/sequence/extension/full-database scope; if automatic future grants are preferred later, specify the actual creating role and schema explicitly. See [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html).

After the final combined packet is approved and exact connection/authentication established, one real same-endpoint exported-snapshot capture and empty isolated restore must prove the proposed login's behavior under the current full pg_dump options. No BYPASSRLS/admin membership, --enable-row-security or silently narrowed dump is a substitute. Catalog/grant preparation alone proves neither capture/restore acceptance nor Blob/R2 custody or scheduled operations. Official role options: [CREATE ROLE18](https://www.postgresql.org/docs/18/sql-createrole.html); dump scope: [pg_dump18](https://www.postgresql.org/docs/18/app-pgdump.html).
