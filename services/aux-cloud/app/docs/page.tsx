import Link from 'next/link';
import InformationPage from "../information-page";

export const metadata={title:'Getting started | Aux'};

export default function Page() {
  return <InformationPage title="Getting started with Aux">
    <p>Aux is a browser with separate profiles and an AI agent that works with your pages, tabs and files. It runs on Apple silicon Macs with macOS 27 and is a development preview.</p>
    <section><h2>Profiles</h2>
    <p>Keep work and personal browsing in separate profiles. Each profile has its own sites, sign-ins, chats and settings. Check which profile is active before you sign in to a site or start a chat. Aux does not import profiles or passwords from another browser.</p>
    </section>
    <section><h2>Connect an AI provider</h2>
    <p>Open Settings, add an API key from the AI provider you use, and pick a model. Requests go straight to that provider and are billed to your account there; Aux sells no AI and takes no payments. Send a short test message to confirm the connection works.</p>
    </section>
    <section><h2>Context and permissions</h2>
    <p>Choose the page, tab or file you want the agent to use, and review any action before it runs. Features that use macOS capabilities ask for permission first.</p>
    </section>
    <section><h2>Passwords</h2>
    <p>Aux has no built-in password manager. Install your own, such as 1Password, from its official browser extension.</p>
    </section>
    <section><h2>Aux cloud</h2>
    <p>Aux works fully on your Mac without an account. Signing in to Aux cloud is optional and adds encrypted sync, shared conversations and private feedback reports. Read the <Link href="/policy/privacy">Privacy policy</Link> for what the cloud stores, and keep your own copies of important work.</p>
    </section>
    <p>Questions or problems: see <Link href="/community">Feedback and support</Link>.</p>
  </InformationPage>;
}
