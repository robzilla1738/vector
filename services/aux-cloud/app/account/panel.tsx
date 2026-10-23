import { BillingAccountPanel } from './billing-panel';

export function AccountPanel() {
  if (process.env.AUX_PAYMENTS_ENABLED === 'true') return <BillingAccountPanel/>;

  return <>
    <section><h2>AI access</h2><p>Connect your own AI provider in Aux settings. No Aux subscription is required.</p><p>Your provider manages model access, usage limits and any charges.</p></section>
    <section><h2>Privacy</h2><p>Your browser data stays local unless you enable sync or explicitly publish a conversation.</p></section>
  </>;
}
