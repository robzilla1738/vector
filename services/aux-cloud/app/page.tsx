import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
export default function Home() {
  return <main><header><img src="/arch-mark.svg" width="36" height="36" alt="Aux"/><UserButton/></header><h1>Your browser. Your space.</h1><p>Manage your account and connect your Aux browser.</p><Link className="button" href="/account">Open your account</Link><p className="muted">Aux cloud is being prepared for private testing.</p></main>;
}
