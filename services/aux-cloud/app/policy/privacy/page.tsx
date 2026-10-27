import InformationPage from "../../information-page";
import { TERMS_EFFECTIVE } from "../../../src/legal";

export const metadata={title:'Privacy | Aux'};

export default function Page() {
  return <InformationPage title="Privacy">
    <p className="muted">Effective {TERMS_EFFECTIVE}</p>
    <p>Courson Digital LLC operates Aux. This page explains what Aux keeps on your Mac, what reaches our cloud service and what we do with it. Requests and questions: <a href="mailto:hello@getaux.co">hello@getaux.co</a>.</p>
    <section><h2>On your Mac</h2>
    <p>Your profiles, browsing data, chats, memories and AI provider credentials stay on your Mac. Credentials are kept in the macOS Keychain. The desktop app sends no product analytics, and crash reports stay on your Mac. Aux has no built-in password manager; a password-manager extension you install follows its own privacy policy.</p>
    </section>
    <section><h2>AI requests</h2>
    <p>When you ask Aux to use AI, your request and the context you select go directly to the provider you connected. We do not receive or relay them, and Aux offers no AI of its own. Your provider&rsquo;s privacy policy applies.</p>
    </section>
    <section><h2>Aux cloud</h2>
    <p>Signing in to Aux cloud is optional. If you sign in, we store your email address, name and profile picture, your device sessions, and the content you choose to sync, upload, share or send as feedback.</p>
    <p>Synced content is encrypted before storage. Its key is held by our service, wrapped with a service key, so that a new device can resume sync after sign-in. This means Courson Digital LLC could technically decrypt synced content. We access it only to operate the service or when the law requires it. History sync is off unless you turn it on.</p>
    <p>A shared conversation is public to anyone with its link until you unshare it. Feedback reports, including any session data you attach, are private files our team can read to investigate the report.</p>
    </section>
    <section><h2>Service providers</h2>
    <p>We use Clerk for sign-in, Vercel for the application and private file storage, Neon for the database and Resend for sign-in email. They process data in the United States on our behalf under their data-processing terms, with standard contractual clauses or equivalent safeguards for international transfers. We do not sell your data or use it for advertising.</p>
    </section>
    <section><h2>Why we use your data</h2>
    <p>We use account and sync data to provide the service you asked for, and sign-in email to deliver codes. We use limited technical records for security, abuse prevention and fixing problems, which is in our legitimate interest.</p>
    </section>
    <section><h2>How long we keep it</h2>
    <p>Service logs: 30 days. Feedback reports: 90 days. Shared conversations: until you unshare them or delete your account. When you delete your account, we remove its content within 30 days and keep only an anonymized record that the account existed.</p>
    </section>
    <section><h2>Your choices</h2>
    <p>You can delete your account from your account page at any time. To ask for a copy of your synced data, a correction or deletion, email <a href="mailto:hello@getaux.co">hello@getaux.co</a> from your account&rsquo;s address, or we will confirm the request with a code sent there. We answer within 30 days.</p>
    </section>
    <section><h2>Children</h2>
    <p>Aux is not for children under 13, or under 16 in the European Union. We delete accounts we learn belong to younger children.</p>
    </section>
    <section><h2>Changes</h2>
    <p>We will tell you about material changes in the app and by email at least 14 days before they take effect.</p>
    </section>
  </InformationPage>;
}
