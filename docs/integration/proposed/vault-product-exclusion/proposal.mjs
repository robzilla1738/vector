/** Static proposal only: no production import, file write, injection, or signing. */
import { createHash } from 'node:crypto';
export const baseCodeSha256 = '93084eb7eebf911b473d791e796f5d8ad740bc8befa5527a8adb0205d42a9dd0';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const edits = Object.freeze([
  {
    name: 'Reject excluded builtin definition in all Skills discovery consumers',
    from: 'function parseSkillDefinition(Cn,ei,ti){let ni=parseSkillFrontmatterBlock(Cn,ti);',
    to: 'function parseSkillDefinition(Cn,ei,ti){if(ei.replaceAll(`\\\\`,`/`).endsWith(`/builtin/password-manager/SKILL.md`))return null;let ni=parseSkillFrontmatterBlock(Cn,ti);',
    count: 1,
  },
  {
    name: 'Exclude obsolete builtin from runtime catalog',
    from: '.filter(Cn=>Cn.enabled&&isAuxSkill(Cn.metadata??{}))',
    to: '.filter(Cn=>Cn.path!==`builtin/password-manager`&&Cn.enabled&&isAuxSkill(Cn.metadata??{}))',
    count: 1,
  },
  {
    name: 'Exclude obsolete builtin from settings catalog',
    from: 'markOverriddenSkills(collectSkillsForSettings(ei,getBuiltinSkillPaths(ei)))',
    to: 'markOverriddenSkills(collectSkillsForSettings(ei,getBuiltinSkillPaths(ei)).filter(Cn=>Cn.path!==`builtin/password-manager`))',
    count: 1,
  },
  {
    name: 'Remove product router from both TRPC and derived HTTP registrations',
    from: 'fullDiskAccess:fullDiskAccessRouter,passwordManager:passwordManagerRouter,externalPasswordManagers:externalPasswordManagersRouter',
    to: 'fullDiskAccess:fullDiskAccessRouter,externalPasswordManagers:externalPasswordManagersRouter',
    count: 1,
  },
  {
    name: 'Correct retained system-skill catalog display name',
    from: 'getSkillDisplayName=({name:Cn,path:ei})=>{let ti=',
    to: 'getSkillDisplayName=({name:Cn,path:ei})=>{if(Cn===`aside`&&ei===`builtin/aside`)return`Aux`;let ti=',
    count: 1,
  },
]);
export const disabledSeed = '---\nname: password-manager\ndescription: Built-in password management is excluded from Aux.\ndisabled: true\n---\n# Excluded builtin\n\nUse an existing external password manager through its browser extension.\n';
export function propose(code) {
  if (sha256(code) !== baseCodeSha256) throw new Error('Exact adapted daemon source required');
  for (const edit of edits) {
    const count = code.split(edit.from).length - 1;
    if (count !== edit.count) throw new Error(`${edit.name}: expected ${edit.count}, found ${count}`);
    code = code.replace(edit.from, edit.to);
  }
  return { code, sha256: sha256(code) };
}
