-- PostgreSQL 16+ catalog-only review. No application tuples, sequence values,
-- large-object contents, policy/function bodies, role passwords, or settings.
-- Connection/Neon project+branch identity must be verified outside this SQL.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path = pg_catalog;
SET LOCAL statement_timeout = '30s';
SET LOCAL lock_timeout = '3s';

-- 1. Current database only. No connection string or server address emitted.
SELECT 'database' AS section, d.datname, pg_get_userbyid(d.datdba) AS owner,
       current_user AS reviewing_role, session_user AS session_role,
       current_setting('server_version_num') AS server_version_num,
       current_setting('transaction_read_only') AS transaction_read_only,
       d.datallowconn, d.datconnlimit
FROM pg_database d WHERE d.datname = current_database();

-- 2. Effective stored/default database, exact public schema and relation ACLs.
-- PUBLIC's OID=0 must remain visible: role REVOKE cannot subtract its rights.
WITH objects AS (
 SELECT 'database'::text AS kind, d.datname::text AS object_name,
        d.datdba AS owner, coalesce(d.datacl, acldefault('d', d.datdba)) AS acl
 FROM pg_database d WHERE d.datname=current_database()
 UNION ALL
 SELECT 'schema', n.nspname::text, n.nspowner,
        coalesce(n.nspacl, acldefault('n',n.nspowner))
 FROM pg_namespace n WHERE n.nspname='public'
 UNION ALL
 SELECT CASE WHEN c.relkind='S' THEN 'sequence' ELSE 'relation' END,
        format('%I.%I',n.nspname,c.relname),c.relowner,
        coalesce(c.relacl,acldefault(CASE WHEN c.relkind='S' THEN 'S'::"char" ELSE 'r'::"char" END,c.relowner))
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f','S')
)
SELECT 'object_acl' AS section,o.kind,o.object_name,pg_get_userbyid(o.owner) AS owner,
       CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable
FROM objects o CROSS JOIN LATERAL aclexplode(o.acl) a
ORDER BY o.kind,o.object_name,grantee,a.privilege_type;

-- 3. Column-specific grants can exist independently of relation grants.
SELECT 'column_acl' AS section,c.relname,a.attname,
       CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END AS grantee,
       pg_get_userbyid(x.grantor) AS grantor,x.privilege_type,x.is_grantable
FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN LATERAL aclexplode(a.attacl) x
WHERE n.nspname='public' AND a.attnum>0 AND NOT a.attisdropped
ORDER BY c.relname,a.attnum,grantee;

-- 4. No counts of application rows or last_value reads. Include foreign and
-- materialized relations, partition links and sequence ownership dependencies.
SELECT 'relations' AS section,c.oid,c.relname,c.relkind,c.relpersistence,
       pg_get_userbyid(c.relowner) AS owner,c.relrowsecurity,c.relforcerowsecurity,
       c.relispartition,has_table_privilege(current_user,c.oid,'SELECT') AS reviewer_has_select
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f') ORDER BY c.relname;
SELECT 'sequences' AS section,s.oid,s.relname,pg_get_userbyid(s.relowner) AS owner,
       has_sequence_privilege(current_user,s.oid,'SELECT') AS reviewer_has_select,
       tn.nspname AS dependent_table_schema,t.relname AS dependent_table,a.attname AS dependent_column,d.deptype
FROM pg_class s JOIN pg_namespace n ON n.oid=s.relnamespace
LEFT JOIN pg_depend d ON d.classid='pg_class'::regclass AND d.objid=s.oid
 AND d.refclassid='pg_class'::regclass AND d.deptype IN ('a','i')
LEFT JOIN pg_class t ON t.oid=d.refobjid
LEFT JOIN pg_namespace tn ON tn.oid=t.relnamespace
LEFT JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=d.refobjsubid
WHERE n.nspname='public' AND s.relkind='S' ORDER BY s.relname;

-- 5. Policy bodies may contain literal data; expose metadata only. RLS means
-- full capture requires a separate decision, not an assumed filtered dump.
SELECT 'rls_policies' AS section,c.relname,p.polname,p.polcmd,p.polpermissive,
       ARRAY(SELECT CASE WHEN r=0 THEN 'PUBLIC' ELSE pg_get_userbyid(r) END
             FROM unnest(p.polroles) r) AS policy_roles,
       p.polqual IS NOT NULL AS has_using_expression,
       p.polwithcheck IS NOT NULL AS has_check_expression
FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
ORDER BY c.relname,p.polname;

-- 6. PUBLIC callable routines and default privileges may grant more than
-- direct SELECT. No definition, literal argument defaults or role settings.
SELECT 'routine_acl' AS section,p.oid,p.proname,p.prokind,p.prosecdef,
       pg_get_userbyid(p.proowner) AS owner,
       CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END AS grantee,
       pg_get_userbyid(x.grantor) AS grantor,x.privilege_type,x.is_grantable
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) x
WHERE n.nspname='public' ORDER BY p.oid,grantee;
SELECT 'default_acl' AS section,pg_get_userbyid(d.defaclrole) AS creating_role,
       CASE WHEN d.defaclnamespace=0 THEN '<database-global>' ELSE n.nspname END AS schema_scope,
       d.defaclobjtype,
       CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END AS grantee,
       pg_get_userbyid(x.grantor) AS grantor,x.privilege_type,x.is_grantable
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace
CROSS JOIN LATERAL aclexplode(d.defaclacl) x
WHERE d.defaclnamespace=0 OR n.nspname='public'
ORDER BY creating_role,schema_scope,d.defaclobjtype,grantee;

-- 7. Complete pg_dump is CURRENT DATABASE, not only public. Report only
-- aggregate outside-scope boundaries, never names/content of other schemas.
SELECT 'outside_public' AS section,c.relkind,count(*) AS relation_count,
       count(*) FILTER (WHERE c.relrowsecurity) AS rls_count
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname<>'public' AND n.nspname<>'information_schema'
 AND n.nspname !~ '^pg_' AND c.relkind IN ('r','p','v','m','f','S') GROUP BY c.relkind ORDER BY c.relkind;
SELECT 'cross_schema_partitions' AS section,count(*) AS links
FROM pg_inherits i JOIN pg_class p ON p.oid=i.inhparent
JOIN pg_class c ON c.oid=i.inhrelid
JOIN pg_namespace pn ON pn.oid=p.relnamespace JOIN pg_namespace cn ON cn.oid=c.relnamespace
WHERE (pn.nspname='public')<>(cn.nspname='public');

-- 8. Extension identity/version/schema and configuration-dump relation
-- metadata only; no extcondition predicates or foreign-server options.
SELECT 'extensions' AS section,e.extname,e.extversion,e.extrelocatable,
       n.nspname AS extension_schema,pg_get_userbyid(e.extowner) AS owner,
       cardinality(e.extconfig) AS configuration_relation_count,
       EXISTS(SELECT 1 FROM unnest(e.extcondition) v WHERE v IS NOT NULL AND v<>'') AS has_configuration_filter
FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace ORDER BY e.extname;
SELECT 'extension_config_relations' AS section,e.extname,c.oid,
       CASE WHEN n.nspname='public' THEN format('%I.%I',n.nspname,c.relname)
            ELSE '<outside-public>' END AS relation,
       pg_get_userbyid(c.relowner) AS owner,c.relkind,c.relrowsecurity,c.relforcerowsecurity,
       has_table_privilege(current_user,c.oid,'SELECT') AS reviewer_has_select
FROM pg_extension e CROSS JOIN LATERAL unnest(e.extconfig) r(oid)
JOIN pg_class c ON c.oid=r.oid JOIN pg_namespace n ON n.oid=c.relnamespace ORDER BY e.extname,c.oid;

-- 9. Large objects are database-wide and dumped by the current unfiltered
-- invocation. Metadata only, no pg_largeobject page/lo_get/lo_open reads.
SELECT 'large_objects' AS section,count(*) AS objects,
       count(*) FILTER (WHERE NOT has_largeobject_privilege(current_user,m.oid,'SELECT')) AS reviewer_unreadable,
       count(*) FILTER (WHERE EXISTS(SELECT 1 FROM aclexplode(coalesce(m.lomacl,acldefault('L',m.lomowner))) x
          WHERE x.grantee=0 AND x.privilege_type='SELECT')) AS public_readable
FROM pg_largeobject_metadata m;

-- 10. Roles only in this database/public object/default/policy/large-object
-- authority graph, plus their reachable memberships. No pg_authid/password.
WITH RECURSIVE acl_roles AS (
 SELECT a.grantee AS oid FROM pg_database d CROSS JOIN LATERAL aclexplode(d.datacl) a WHERE d.datname=current_database()
 UNION SELECT a.grantor FROM pg_database d CROSS JOIN LATERAL aclexplode(d.datacl) a WHERE d.datname=current_database()
 UNION SELECT a.grantee FROM pg_namespace n CROSS JOIN LATERAL aclexplode(n.nspacl) a WHERE n.nspname='public'
 UNION SELECT a.grantee FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(c.relacl) a WHERE n.nspname='public'
 UNION SELECT a.grantee FROM pg_attribute t JOIN pg_class c ON c.oid=t.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(t.attacl) a WHERE n.nspname='public'
 UNION SELECT a.grantee FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace CROSS JOIN LATERAL aclexplode(p.proacl) a WHERE n.nspname='public'
 UNION SELECT a.grantee FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclnamespace=0 OR n.nspname='public'
), seeds AS (
 SELECT oid FROM pg_roles WHERE rolname IN (current_user,session_user)
 UNION SELECT datdba FROM pg_database WHERE datname=current_database()
 UNION SELECT nspowner FROM pg_namespace WHERE nspname='public'
 UNION SELECT c.relowner FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
 UNION SELECT p.proowner FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 UNION SELECT d.defaclrole FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE d.defaclnamespace=0 OR n.nspname='public'
 UNION SELECT unnest(p.polroles) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
 UNION SELECT lomowner FROM pg_largeobject_metadata
 UNION SELECT oid FROM acl_roles WHERE oid<>0
), reachable(oid) AS (
 SELECT oid FROM seeds WHERE oid<>0
 UNION SELECT m.roleid FROM pg_auth_members m JOIN reachable r ON r.oid=m.member
)
SELECT 'relevant_roles_and_membership' AS section,r.oid,r.rolname,r.rolsuper,r.rolinherit,
       r.rolcreaterole,r.rolcreatedb,r.rolcanlogin,r.rolreplication,r.rolbypassrls,r.rolconnlimit,
       pg_get_userbyid(m.roleid) AS member_of,m.admin_option,m.inherit_option,m.set_option,
       CASE WHEN m.roleid IS NOT NULL THEN pg_has_role(r.oid,m.roleid,'USAGE') END AS privileges_immediately_available,
       CASE WHEN m.roleid IS NOT NULL THEN pg_has_role(r.oid,m.roleid,'SET') END AS can_set_role
FROM reachable q JOIN pg_roles r ON r.oid=q.oid
LEFT JOIN pg_auth_members m ON m.member=r.oid ORDER BY r.rolname,member_of;

ROLLBACK;
