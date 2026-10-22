import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export const metadata:Metadata={title:'Connect Aux · Aux',robots:{index:false,follow:false}};
export default async function ConnectDesktop(){
  const session=await auth();
  if(!session.userId)return session.redirectToSignIn({returnBackUrl:'/desktop/connect'});
  // The supplied browser's working email-code path is handled in its own UI.
  // Do not invent a URL-only localhost callback or autoapprove a CLI device.
  return <main>
    <header><a href="/account" aria-label="Aux account"><img src="/arch-mark.svg" width="36" height="36" alt="Aux"/></a><UserButton/></header>
    <h1>Connect Aux</h1>
    <section><h2>Aux browser</h2><p>Return to Aux’s sign-in window and use the email verification code sent from there. Signing in to this website does not automatically sign in your local browser profile.</p></section>
    <section><h2>Aux CLI</h2><p>Run <code>aux login</code> on your device, then review its request and enter the displayed code.</p><a href="/device">Review device requests</a></section>
    <p><a href="/account">Back to your account</a></p>
  </main>;
}
