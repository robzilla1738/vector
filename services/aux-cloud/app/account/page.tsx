import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { AccountPanel } from './panel';
export default async function Account() {
  const session=await auth();
  if(!session.userId) return session.redirectToSignIn();
  return <main><header><a href="/"><img src="/arch-mark.svg" width="36" height="36" alt="Aux"/></a><UserButton/></header><h1>Your Aux account</h1><p><a href="/device">Approve a device connection</a></p><AccountPanel/></main>;
}
