/** Human-readable recovery guidance; the native error remains available below it. */
export function navigationFailure(error: {code:number;message:string}) {
  if (error.code === -106) return {
    title: 'You’re offline',
    detail: 'Reconnect to the internet, then try again. Your tabs are still here.',
  };
  if (error.code === -105) return {
    title: 'This website couldn’t be found',
    detail: 'Check the address and your connection, then try again.',
  };
  if (error.code === -118) return {
    title: 'This website took too long to respond',
    detail: 'The site may be busy or your connection may be interrupted. Try again in a moment.',
  };
  if (/ERR_CERT_/.test(error.message)) return {
    title: 'This connection isn’t secure',
    detail: 'Aux couldn’t verify this website’s certificate. Check the address or return to the previous page.',
  };
  return {title:'This page couldn’t load',detail:'Check the address or your connection, then try again.'};
}
