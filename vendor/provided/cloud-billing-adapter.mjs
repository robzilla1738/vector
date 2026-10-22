/** One hosted-pricing copy correction; inactive until the integrator composes it. */
export const cloudBillingCopyPath = 'assets/add-on-credits-dialog-Dn5FxOyZ.js';
export function transformCloudBillingCopy({ component, path, text }) {
  if (typeof text !== 'string') throw new Error('Cloud billing copy expects source text');
  if (component !== 'agent' || path !== cloudBillingCopyPath) return { text, anchors: [] };
  // Aux annual prices give two months free; the supplied fixed20% label would
  // misstate that offer. Preserve the component, typography and interactions.
  const find = 'children:"(-20% off)"';
  const replace = 'children:"Save yearly"';
  if (text.split(find).length - 1 !== 1) throw new Error('Cloud billing yearly-savings anchor changed');
  return { text: text.replace(find, replace), anchors: [{ kind: 'integration', name: 'accurate Aux yearly pricing copy', find, replace, count: 1 }] };
}
