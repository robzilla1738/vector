import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { DevicePanel } from './device-panel';

export const metadata:Metadata={title:'Approve a device · Aux',robots:{index:false,follow:false}};
export default async function DeviceApproval(){
  const session=await auth();
  if(!session.userId)return session.redirectToSignIn({returnBackUrl:'/device'});
  return <main>
    <header><a href="/account" aria-label="Aux account"><img src="/arch-mark.svg" width="36" height="36" alt="Aux"/></a><UserButton/></header>
    <h1>Connect a device</h1>
    <p>Start sign-in from your Aux CLI, then enter the code shown on that device. Approve only a request you started yourself.</p>
    <DevicePanel/>
    <p><a href="/account">Back to your account</a></p>
  </main>;
}
