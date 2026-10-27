import Link from 'next/link';
import InformationPage from "../information-page";

export const metadata={title:'Feedback and support | Aux'};

export default function Page() {
  return <InformationPage title="Feedback and support">
    <p>Email <a href="mailto:hello@getaux.co">hello@getaux.co</a> with questions, problems, privacy requests or a shared conversation to report. Aux is a development preview run by a small team, so replies are best effort.</p>
    <section><h2>Sending feedback from Aux</h2>
    <p>If you are signed in to Aux cloud, use Send Feedback in the chat menu. It saves your comment and that conversation as a private report for the Aux team, kept for 90 days. Remove anything you do not want to share, such as keys, codes or private page content, before you send it.</p>
    </section>
    <section><h2>A useful report</h2>
    <p>Say what you expected, what happened instead and which Aux version you use (Aux &rsaquo; About Aux).</p>
    </section>
    <p>New to Aux? Start with <Link href="/docs">Getting started</Link>.</p>
  </InformationPage>;
}
