import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './style.css';

export const metadata:Metadata={title:'Aux account',description:'Manage your Aux account, subscription and cloud services.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}) {
  return <ClerkProvider><html lang="en"><body>{children}</body></html></ClerkProvider>;
}
