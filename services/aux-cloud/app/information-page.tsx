import Link from 'next/link';

export default function InformationPage({title,children}:{title:string;children:React.ReactNode}) {
  return <main><header><Link href="/" aria-label="Aux home"><img src="/arch-mark.svg" width="36" height="36" alt="Aux"/></Link><Link href="/account">Your account</Link></header><h1>{title}</h1>{children}<footer><p><Link href="/docs">Documentation</Link> · <Link href="/community">Community</Link> · <Link href="/policy/privacy">Privacy</Link> · <Link href="/policy/terms">Terms</Link></p></footer></main>;
}
