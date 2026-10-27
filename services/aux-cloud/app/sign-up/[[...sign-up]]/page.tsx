import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
export default function SignUpPage() {
  return <main className="center"><SignUp forceRedirectUrl="/account"/><p className="muted">By creating an account you confirm you are at least 13 (16 in the EU) and agree to the <Link href="/policy/terms">Terms</Link> and <Link href="/policy/privacy">Privacy policy</Link>.</p></main>;
}
