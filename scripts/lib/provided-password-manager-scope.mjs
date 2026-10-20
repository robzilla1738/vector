/** Owner exception: browser extensions own passwords; Aux does not ship Vault. */
export function transformProvidedPasswordManagerScope({ component, path, text }) {
  const anchors = [];
  if (component !== 'agent') return { text, anchors };
  const replace = (find, replacement, count = 1) => {
    if (text.split(find).length - 1 !== count)
      throw new Error(`Password-manager scope anchor changed: ${path}`);
    anchors.push({ kind: 'integration', find, replace: replacement, count });
    text = text.split(find).join(replacement);
  };
  const removeMatch = expression => {
    const matches = [...text.matchAll(expression)];
    if (matches.length !== 1) throw new Error(`Password-manager scope structure changed: ${path}`);
    replace(matches[0][0], '');
  };
  if (path === 'assets/route-TQyeTEXE.js') {
    // Remove the complete search-index entry, not just its title. Keep the supplied
    // Extensions link as the entrypoint for users' existing password managers.
    removeMatch(/\{path:"\/u\/\$userId\/settings\/password",title:"Passwords",sections:\[[\s\S]*?title:"Use default password manager",description:"Use built-in, AI-native password manager"\}\]\},/g);
    replace('{label:"Passwords",icon:N1,activeIcon:R1,href:"/u/$userId/settings/password"},', '');
    replace('{label:"Payment Use",icon:R2,activeIcon:D2,href:"/u/$userId/settings/payment-use",internalOnly:!0,badge:"New"},', '');
  }
  if (path === 'assets/extension-main-Dz1-AsCT.js') {
    // Legacy URLs must not mount the removed product or start Vault queries.
    replace('en=n("/_web/(settings)/u/$userId/settings/password/")({component:a(Xo,"component"),',
      'en=n("/_web/(settings)/u/$userId/settings/password/")({beforeLoad:({params:{userId:e}})=>{throw c({to:"/u/$userId/settings/general",params:{userId:e},replace:!0})},component:a(Xo,"component"),');
    const payment = 'rn=n("/_web/(settings)/u/$userId/settings/payment-use/")({component:a(tn,"component"),pendingComponent:ie,beforeLoad:async({context:{trpc:e,queryClient:t},params:{userId:r}})=>{const o=Number.parseInt(r,10),[u]=await Promise.all([t.query({...e.analytics.isExperimentalEligible.queryOptions({accountId:o}),staleTime:"static"}),t.query({...e.settings.getAll.queryOptions({accountId:o}),staleTime:"static"})]);if(!u)throw c({to:"/u/$userId/settings/general",params:{userId:r},replace:!0})}})';
    replace(payment, 'rn=n("/_web/(settings)/u/$userId/settings/payment-use/")({component:a(tn,"component"),beforeLoad:({params:{userId:r}})=>{throw c({to:"/u/$userId/settings/general",params:{userId:r},replace:!0})}})');
    replace('wr=n("/_public/onboarding/import-password/")({component:a(Pr,"component")})',
      'wr=n("/_public/onboarding/import-password/")({beforeLoad:()=>{throw c({to:"/onboarding/ai",replace:!0})},component:a(Pr,"component")})');
  }
  if (path === 'assets/glance-BfAlmExy.js')
    replace('to:"/onboarding/import-password"', 'to:"/onboarding/ai"');
  if (path === 'assets/ai-CzEX5E7S.js')
    replace('to:"/onboarding/import-password"', 'to:"/onboarding/glance"');
  if (path === 'assets/route-CSKkWqf5.js')
    replace('f=["/onboarding/import-browser","/onboarding/glance","/onboarding/import-password","/onboarding/ai"]',
      'f=["/onboarding/import-browser","/onboarding/glance","/onboarding/ai"]');
  if (path === 'assets/account-Dr_CA8LL.js') {
    replace('Sign in to sync your browser data. Aside Vault data on this device stays separate.', 'Sign in to sync your browser data.');
    replace('Aside will switch to local mode. Aside Vault data on this device will be kept.', 'Aside will switch to local mode.');
    replace('Aside can recover this data. Aside Vault recovery stays separate.', 'Aside can recover this browser data.');
  }
  if (path === 'assets/-utils-B_lbplVm.js')
    replace('This stops account and browser sync on this device. Password Manager data on this device is kept.', 'This stops account and browser sync on this device.');
  return { text, anchors };
}
