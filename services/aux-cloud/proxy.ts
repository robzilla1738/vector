import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();
// Native API bearer tokens are Aux tokens, not Clerk browser tokens. The API
// validates both explicitly; Clerk middleware is scoped to rendered pages.
export const config={matcher:['/','/account/:path*','/device/:path*','/desktop/:path*','/sign-in/:path*','/sign-up/:path*','/s/:path*']};
