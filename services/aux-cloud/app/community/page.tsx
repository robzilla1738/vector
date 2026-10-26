import Link from 'next/link';
import InformationPage from "../information-page";

export const metadata={title:"Community and feedback" + ' | Aux'};

export default function Page() {
  return <InformationPage title="Community and feedback">
    <p>Aux does not currently have a verified public community forum or a published support service-level commitment. No public forum or response-time guarantee is claimed.</p>
    <p>The feedback dialog is intended to save a private report, including session data, through your connected Aux cloud account. This preview has not yet completed end-to-end private report storage and operator readback acceptance. A confirmed save means private storage for review; it does not promise inbox delivery, a response or human review.</p>
    <p>Describe what you expected, what happened and which app version you used. Include only material you intend to submit. Remove provider credentials, sign-in codes, private page content and personal files from the session or any report or screenshot before saving. Review the dialog before proceeding. If cloud feedback is unavailable, the operation must show an error rather than claim the report was saved.</p>
    <p>If you need help getting started, read <Link href="/docs">Getting started</Link>. Development-preview capabilities that remain under verification are listed there. Aux is operated by Courson Digital LLC. Public support and privacy requests: hello@getaux.co. Moderation policy and support commitments remain subject to approval.</p>
  </InformationPage>;
}
