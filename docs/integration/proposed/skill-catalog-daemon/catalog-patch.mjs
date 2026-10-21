/** Pending backend proposal only. Never imported by production staging. */
import { createHash } from 'node:crypto';
export const activeDaemonCodeSha256 = '93084eb7eebf911b473d791e796f5d8ad740bc8befa5527a8adb0205d42a9dd0';
export const edits = Object.freeze([
  { name: 'omit obsolete built-in Vault from runtime catalog', from: '.filter(Cn=>Cn.enabled&&isAuxSkill(Cn.metadata??{}))', to: '.filter(Cn=>Cn.path!==`builtin/password-manager`&&Cn.enabled&&isAuxSkill(Cn.metadata??{}))', count: 1 },
  { name: 'omit obsolete built-in Vault from settings catalog', from: 'markOverriddenSkills(collectSkillsForSettings(ei,getBuiltinSkillPaths(ei)))', to: 'markOverriddenSkills(collectSkillsForSettings(ei,getBuiltinSkillPaths(ei)).filter(Cn=>Cn.path!==`builtin/password-manager`))', count: 1 },
  { name: 'built-in system skill display title', from: 'getSkillDisplayName=({name:Cn,path:ei})=>{let ti=', to: 'getSkillDisplayName=({name:Cn,path:ei})=>{if(Cn===`aside`&&ei===`builtin/aside`)return`Aux`;let ti=', count: 1 },
]);
export function proposeSkillCatalogCode(code) {
  const sha = (value) => createHash('sha256').update(value).digest('hex');
  if (sha(code) !== activeDaemonCodeSha256) throw new Error('Pending skill catalog proposal base hash mismatch');
  const applied = [];
  for (const edit of edits) {
    const count = code.split(edit.from).length - 1;
    if (count !== edit.count) throw new Error(`${edit.name}: expected ${edit.count}, got ${count}`);
    code = code.split(edit.from).join(edit.to);
    applied.push({ name: edit.name, count });
  }
  return { code, applied, sha256: sha(code) };
}
