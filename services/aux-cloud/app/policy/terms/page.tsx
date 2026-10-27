import InformationPage from "../../information-page";
import { TERMS_EFFECTIVE } from "../../../src/legal";

export const metadata={title:'Terms | Aux'};

export default function Page() {
  return <InformationPage title="Terms">
    <p className="muted">Effective {TERMS_EFFECTIVE}</p>
    <p>These terms cover the Aux browser and the Aux cloud service, operated by Courson Digital LLC (&ldquo;we&rdquo;). Questions: <a href="mailto:hello@getaux.co">hello@getaux.co</a>.</p>
    <section><h2>Development preview</h2>
    <p>Aux is a development preview for Apple silicon Macs running macOS 27. Features can change or be unavailable, and Aux is not a backup service. Keep your own copies of important work.</p>
    </section>
    <section><h2>Who can use Aux</h2>
    <p>You must be at least 13, or 16 in the European Union. If you are under 18, you need a parent&rsquo;s or guardian&rsquo;s permission.</p>
    </section>
    <section><h2>Your content</h2>
    <p>You keep all rights to your content. You give us a limited licence to store, process and transmit it only to provide the features you choose, such as sync, shared conversations and feedback. The licence ends when you delete the content.</p>
    </section>
    <section><h2>AI providers and other services</h2>
    <p>Aux sends AI requests only to the provider you connect, using your own account. That provider&rsquo;s terms and charges apply, and those charges are between you and the provider. We sell nothing and take no payments. Websites, extensions and password managers you use in Aux are provided under their own terms. AI output can be wrong: review it before you rely on it or let it act for you.</p>
    </section>
    <section><h2>Acceptable use</h2>
    <p>Do not use Aux to break the law; to access accounts or data without permission; to spread malware or spam; to get around security measures or rate limits; to automate a website against its terms; or to share someone else&rsquo;s private material without permission. Report a shared conversation that breaks these rules to <a href="mailto:hello@getaux.co">hello@getaux.co</a>, and we will remove it if it does.</p>
    </section>
    <section><h2>Suspension and deletion</h2>
    <p>We may suspend an account for serious or repeated violations, with notice where practical. You can delete your account at any time from your account page. If we close your account, you can ask for an export of your synced data for 30 days afterwards, unless the law prevents it.</p>
    </section>
    <section><h2>Warranty and liability</h2>
    <p>Aux is provided &ldquo;as is&rdquo; during the development preview, without warranties. To the extent the law allows, our total liability is limited to the greater of what you paid us in the previous 12 months (currently nothing) or US $100. Nothing in these terms limits rights you have under consumer law that cannot be waived.</p>
    </section>
    <section><h2>Law and disputes</h2>
    <p>These terms are governed by the laws of the state in which Courson Digital LLC is organized, and disputes go to its courts. You can also use small-claims court where it applies.</p>
    </section>
    <section><h2>Changes</h2>
    <p>We will tell you about material changes in the app and by email at least 14 days before they take effect. If you keep using Aux after that, the new terms apply.</p>
    </section>
  </InformationPage>;
}
